import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';

const createProfileSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(2).regex(/^[a-zA-Z0-9-_]+$/, { message: 'Slug can only contain alphanumeric characters, hyphens, and underscores' }),
  type: z.enum(['PERSONAL', 'BUSINESS', 'PROFESSIONAL', 'COMPANY']).default('PERSONAL'),
  organizationId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  phone2: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  whatsApp: z.string().optional(),
  whatsApp2: z.string().optional(),
  photoUrl: z.string().optional(),
  coverUrl: z.string().optional(),
  templateId: z.string().optional(),
  appearanceJson: z.string().optional(),
});

// GET /api/profiles
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const showAll = req.nextUrl.searchParams.get('all') === 'true' && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN');

    const profiles = await db.profile.findMany({
      where: showAll ? undefined : { userId: user.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        },
        cardAssignments: {
          where: { unassignedAt: null },
          include: { card: true }
        },
        _count: {
          select: { components: true, reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(profiles);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/profiles
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = createProfileSchema.safeParse(body);

    if (!result.success) {
      const messages = result.error.issues.map(i => i.message);
      return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
    }

    const {
      name, slug, type, organizationId,
      firstName, lastName, jobTitle, company, bio,
      phone, phone2, email, website, whatsApp, whatsApp2, photoUrl, coverUrl,
      templateId, appearanceJson,
    } = result.data;

    // Check slug uniqueness - auto-suffix if taken to prevent blocking the user
    let finalSlug = slug.toLowerCase().trim();
    const existingSlug = await db.profile.findUnique({
      where: { slug: finalSlug },
    });

    if (existingSlug) {
      finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Centralized SaaS limits validation check
    const { canCreateProfile } = await import('@/lib/billing/limits');
    const allowed = await canCreateProfile(user.id);
    if (!allowed) {
      return NextResponse.json({ error: 'Profile limit reached for your active subscription plan. Upgrade to create more profiles.' }, { status: 403 });
    }

    // Safely resolve templateId to prevent foreign key constraint violations
    let safeTemplateId: string | null = null;
    let finalAppearanceJson = appearanceJson || null;

    if (templateId) {
      try {
        const existingTemplate = await db.template.findUnique({ where: { id: templateId } });
        if (existingTemplate) {
          safeTemplateId = existingTemplate.id;
        } else {
          const { INDUSTRY_TEMPLATES } = await import('@/lib/templates/industry-templates');
          const matched = INDUSTRY_TEMPLATES.find(t => t.id === templateId);
          if (matched) {
            const upserted = await db.template.upsert({
              where: { slug: matched.id },
              update: {},
              create: {
                id: matched.id,
                slug: matched.id,
                name: matched.name,
                colorsJson: JSON.stringify({ primary: matched.primary, background: matched.background, accent: matched.accent }),
                fontsJson: JSON.stringify({ font: matched.font, headingFont: matched.headingFont }),
                stylesJson: JSON.stringify({ buttonStyle: matched.buttonStyle, cardStyle: matched.cardStyle, borderRadius: matched.borderRadius }),
              },
            });
            safeTemplateId = upserted.id;
          }
        }
      } catch (templateErr) {
        console.warn('Skipping db.template FK linking, relying on appearanceJson:', templateErr);
        safeTemplateId = null;
      }

      // Ensure appearanceJson always retains templateId for dynamic rendering
      try {
        if (!finalAppearanceJson) {
          finalAppearanceJson = JSON.stringify({ templateId });
        } else {
          const parsed = JSON.parse(finalAppearanceJson);
          if (!parsed.templateId) parsed.templateId = templateId;
          finalAppearanceJson = JSON.stringify(parsed);
        }
      } catch {}
    }

    if (phone2 || whatsApp2) {
      try {
        let appObj = finalAppearanceJson ? JSON.parse(finalAppearanceJson) : {};
        if (phone2) appObj.phone2 = phone2.trim();
        if (whatsApp2) appObj.whatsApp2 = whatsApp2.trim();
        finalAppearanceJson = JSON.stringify(appObj);
      } catch {}
    }

    // Create profile
    const profile = await db.profile.create({
      data: {
        userId: user.id,
        organizationId: organizationId || null,
        type,
        name,
        slug: finalSlug,
        firstName: firstName || null,
        lastName: lastName || null,
        jobTitle: jobTitle || null,
        company: company || null,
        bio: bio || null,
        phone: phone || null,
        email: email || null,
        website: website || null,
        whatsApp: whatsApp || null,
        photoUrl: photoUrl || null,
        coverUrl: coverUrl || null,
        templateId: safeTemplateId,
        appearanceJson: finalAppearanceJson,
        isPublic: true,
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    console.error('CRITICAL: POST /api/profiles error:', error);
    return NextResponse.json({
      error: error?.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
