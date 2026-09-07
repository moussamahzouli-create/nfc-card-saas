import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
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
  website: z.string().nullable().optional(),
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

// Helper to check profile ownership or B2B organization access
async function checkProfileAccess(profileId: string, userId: string) {
  const profile = await db.profile.findUnique({
    where: { id: profileId },
  });

  if (!profile) return null;

  if (profile.userId === userId) {
    return profile;
  }

  if (profile.organizationId) {
    const member = await db.organizationMember.findFirst({
      where: {
        organizationId: profile.organizationId,
        userId: userId,
      },
    });
    if (member) return profile;
  }

  return null;
}

// GET /api/profiles/[id]
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await checkProfileAccess(id, user.id);
    if (!profile) {
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

    return NextResponse.json(fullProfile);
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

    const profile = await checkProfileAccess(id, user.id);
    if (!profile) {
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

    return NextResponse.json(refreshed);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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

    const profile = await checkProfileAccess(id, user.id);
    if (!profile) {
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
