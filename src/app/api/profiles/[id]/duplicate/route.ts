import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

async function checkProfileAccess(profileId: string, userId: string) {
  const profile = await db.profile.findUnique({
    where: { id: profileId },
  });
  if (!profile) return null;
  if (profile.userId === userId) return profile;
  if (profile.organizationId) {
    const member = await db.organizationMember.findFirst({
      where: { organizationId: profile.organizationId, userId: userId },
    });
    if (member) return profile;
  }
  return null;
}

// POST /api/profiles/[id]/duplicate
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sourceProfile = await db.profile.findUnique({
      where: { id },
      include: {
        components: true,
        socialLinks: true,
        locations: true,
        businessHours: true,
      },
    });

    if (!sourceProfile) {
      return NextResponse.json({ error: 'Source profile not found' }, { status: 404 });
    }

    // Verify ownership or admin access
    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
    if (sourceProfile.userId !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Enforce limits checks (admins bypass limits)
    if (!isAdmin) {
      const { canCreateProfile } = await import('@/lib/billing/limits');
      const allowed = await canCreateProfile(user.id);
      if (!allowed) {
        return NextResponse.json({ error: 'Profile limit reached for your active subscription plan. Upgrade to duplicate profiles.' }, { status: 403 });
      }
    }

    // Generate unique slug
    const baseSlug = `${sourceProfile.slug}-copy`;
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (true) {
      const match = await db.profile.findUnique({ where: { slug: uniqueSlug } });
      if (!match) break;
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create copy in database transaction
    const duplicate = await db.$transaction(async (tx) => {
      const p = await tx.profile.create({
        data: {
          userId: user.id,
          organizationId: sourceProfile.organizationId,
          type: sourceProfile.type,
          name: `${sourceProfile.name} (Copy)`,
          slug: uniqueSlug,
          firstName: sourceProfile.firstName,
          lastName: sourceProfile.lastName,
          whatsApp: sourceProfile.whatsApp,
          photoUrl: sourceProfile.photoUrl,
          coverUrl: sourceProfile.coverUrl,
          jobTitle: sourceProfile.jobTitle,
          company: sourceProfile.company,
          bio: sourceProfile.bio,
          email: sourceProfile.email,
          phone: sourceProfile.phone,
          website: sourceProfile.website,
          templateId: sourceProfile.templateId,
          appearanceJson: sourceProfile.appearanceJson,
          isPublic: sourceProfile.isPublic,
          showOnSearchEngines: sourceProfile.showOnSearchEngines,
          status: sourceProfile.status,
        },
      });

      // Copy components
      if (sourceProfile.components.length > 0) {
        await tx.profileComponent.createMany({
          data: sourceProfile.components.map((c) => ({
            profileId: p.id,
            type: c.type,
            title: c.title,
            value: c.value,
            url: c.url,
            icon: c.icon,
            sortOrder: c.sortOrder,
            isVisible: c.isVisible,
            settingsJson: c.settingsJson,
          })),
        });
      }

      // Copy social links
      if (sourceProfile.socialLinks.length > 0) {
        await tx.socialLink.createMany({
          data: sourceProfile.socialLinks.map((s) => ({
            profileId: p.id,
            platform: s.platform,
            username: s.username,
            url: s.url,
            sortOrder: s.sortOrder,
            isVisible: s.isVisible,
          })),
        });
      }

      // Copy locations
      if (sourceProfile.locations.length > 0) {
        await tx.location.createMany({
          data: sourceProfile.locations.map((l) => ({
            profileId: p.id,
            address: l.address,
            latitude: l.latitude,
            longitude: l.longitude,
          })),
        });
      }

      // Copy business hours
      if (sourceProfile.businessHours.length > 0) {
        await tx.businessHour.createMany({
          data: sourceProfile.businessHours.map((h) => ({
            profileId: p.id,
            day: h.day,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed,
          })),
        });
      }

      return p;
    });

    return NextResponse.json(duplicate, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
