import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';

const createProfileSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-zA-Z0-9-_]+$/, { message: 'Slug can only contain alphanumeric characters, hyphens, and underscores' }),
  type: z.enum(['PERSONAL', 'BUSINESS', 'PROFESSIONAL', 'COMPANY']),
  organizationId: z.string().optional(),
});

// GET /api/profiles
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profiles = await db.profile.findMany({
      where: {
        userId: user.id,
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

    const { name, slug, type, organizationId } = result.data;

    // Check slug uniqueness
    const existingSlug = await db.profile.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return NextResponse.json({ error: 'Profile URL slug already in use' }, { status: 400 });
    }

    // Centralized SaaS limits validation check
    const { canCreateProfile } = await import('@/lib/billing/limits');
    const allowed = await canCreateProfile(user.id);
    if (!allowed) {
      return NextResponse.json({ error: 'Profile limit reached for your active subscription plan. Upgrade to create more profiles.' }, { status: 403 });
    }

    // Create profile
    const profile = await db.profile.create({
      data: {
        userId: user.id,
        organizationId: organizationId || null,
        type,
        name,
        slug,
        isPublic: true,
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
