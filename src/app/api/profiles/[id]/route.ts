import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { canAccessProfile } from '@/lib/auth/profile-access';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  whatsApp: z.string().nullable().optional(),
  jobTitle: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  phone2: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  whatsApp2: z.string().nullable().optional(),
  templateId: z.string().nullable().optional(),
  appearanceJson: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
  showOnSearchEngines: z.boolean().optional(),
  socialLinks: z.array(z.any()).optional(),
});

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/profiles/[id]
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { allowed, profile } = await canAccessProfile(id, user);
    if (!allowed || !profile) {
      return NextResponse.json({ error: 'Profile not found or access denied' }, { status: 404 });
    }

    // Load full profile with subcomponents
    const fullProfile = await db.profile.findUnique({
      where: { id },
      include: {
        components: { orderBy: { sortOrder: 'asc' } },
        socialLinks: { orderBy: { sortOrder: 'asc' } },
        locations: true,
        businessHours: { orderBy: { day: 'asc' } },
      },
    });

    if (!fullProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    let phone2 = '';
    let whatsApp2 = '';
    if (fullProfile.appearanceJson) {
      try {
        const parsed = JSON.parse(fullProfile.appearanceJson);
        phone2 = parsed.phone2 || '';
        whatsApp2 = parsed.whatsApp2 || '';
      } catch {}
    }

    return NextResponse.json({
      ...fullProfile,
      phone2,
      whatsApp2,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/profiles/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { allowed, profile } = await canAccessProfile(id, user);
    if (!allowed || !profile) {
      return NextResponse.json({ error: 'Profile not found or access denied' }, { status: 404 });
    }

    const body = await req.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      const messages = result.error.issues.map(i => i.message);
      return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
    }

    const { socialLinks, ...rawUpdateData } = result.data;

    // Process optional fields
    const updateData: any = { ...rawUpdateData };
    if (updateData.email === '') updateData.email = null;
    if (updateData.website === '') {
      updateData.website = null;
    } else if (updateData.website && typeof updateData.website === 'string') {
      const trimmed = updateData.website.trim();
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        updateData.website = `https://${trimmed}`;
      }
    }
    // Safely resolve templateId to prevent foreign key errors
    if (updateData.templateId !== undefined) {
      if (!updateData.templateId) {
        updateData.templateId = null;
      } else {
        try {
          const existing = await db.template.findUnique({ where: { id: updateData.templateId } });
          if (!existing) {
            const { INDUSTRY_TEMPLATES } = await import('@/lib/templates/industry-templates');
            const matched = INDUSTRY_TEMPLATES.find(t => t.id === updateData.templateId);
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
              updateData.templateId = upserted.id;
            } else {
              updateData.templateId = null;
            }
          }
        } catch (err) {
          console.warn('Template foreign key resolution skipped in PUT:', err);
          updateData.templateId = null;
        }
      }
    }

    // Merge phone2 and whatsApp2 into appearanceJson if provided, and strip from updateData for Prisma
    if (updateData.phone2 !== undefined || updateData.whatsApp2 !== undefined || body.phone2 !== undefined || body.whatsApp2 !== undefined) {
      let appData: any = {};
      try {
        appData = JSON.parse(updateData.appearanceJson || profile.appearanceJson || '{}');
      } catch {}
      const p2 = updateData.phone2 !== undefined ? updateData.phone2 : body.phone2;
      const w2 = updateData.whatsApp2 !== undefined ? updateData.whatsApp2 : body.whatsApp2;
      if (p2 !== undefined) appData.phone2 = (p2 || '').trim();
      if (w2 !== undefined) appData.whatsApp2 = (w2 || '').trim();
      updateData.appearanceJson = JSON.stringify(appData);
    }
    delete updateData.phone2;
    delete updateData.whatsApp2;

    // Update base profile fields
    const updated = await db.profile.update({
      where: { id },
      data: updateData,
    });

    // Synchronize social links if provided in payload
    if (socialLinks !== undefined && Array.isArray(socialLinks)) {
      await db.socialLink.deleteMany({ where: { profileId: id } });

      const validLinks = socialLinks
        .filter((l: any) => l && l.platform && typeof l.url === 'string' && l.url.trim() !== '')
        .map((l: any, idx: number) => {
          let rawUrl = l.url.trim();
          if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://') && !rawUrl.startsWith('mailto:') && !rawUrl.startsWith('tel:')) {
            rawUrl = `https://${rawUrl}`;
          }
          return {
            profileId: id,
            platform: String(l.platform).toLowerCase(),
            username: l.username ? String(l.username) : rawUrl,
            url: rawUrl,
            sortOrder: typeof l.sortOrder === 'number' ? l.sortOrder : idx,
            isVisible: l.isVisible !== false,
          };
        });

      if (validLinks.length > 0) {
        await db.socialLink.createMany({ data: validLinks });
      }
    }

    // Return the updated profile with refreshed relations
    const refreshed = await db.profile.findUnique({
      where: { id },
      include: {
        components: { orderBy: { sortOrder: 'asc' } },
        socialLinks: { orderBy: { sortOrder: 'asc' } },
        locations: true,
        businessHours: { orderBy: { day: 'asc' } },
      },
    });

    if (refreshed) {
      if (refreshed.slug) {
        try { revalidatePath(`/c/${refreshed.slug}`); } catch {}
      }
      try { revalidatePath(`/c/${refreshed.id}`); } catch {}
    }

    return NextResponse.json(refreshed);
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/profiles/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { allowed, profile } = await canAccessProfile(id, user);
    if (!allowed || !profile) {
      return NextResponse.json({ error: 'Profile not found or access denied' }, { status: 404 });
    }

    // Check if profile is connected to any active card assignments
    const activeAssignment = await db.cardAssignment.findFirst({
      where: {
        profileId: id,
        unassignedAt: null
      }
    });

    if (activeAssignment) {
      return NextResponse.json({
        error: 'This profile is connected to an NFC card. Please disconnect the card before deleting the profile.'
      }, { status: 400 });
    }

    await db.profile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
