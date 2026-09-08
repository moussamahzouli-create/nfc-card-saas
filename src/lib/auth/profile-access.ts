import { db } from '@/lib/db';
import { SessionUser } from '@/lib/auth/session';

/**
 * Validates whether the given user has permission to view/edit/manage a profile.
 * - SUPER_ADMIN and ADMIN have full access to ANY profile in the system.
 * - Profile owners (profile.userId === user.id) have full access to their own profiles.
 * - Organization members have access to profiles belonging to their organization.
 */
export async function canAccessProfile(profileId: string, user: SessionUser | null) {
  if (!user) {
    return { allowed: false, profile: null };
  }

  const profile = await db.profile.findUnique({
    where: { id: profileId },
    include: { organization: true },
  });

  if (!profile) {
    return { allowed: false, profile: null };
  }

  // 1. Super Admins & Admins have global administrative access
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return { allowed: true, profile, isAdmin: true };
  }

  // 2. Direct owner access
  if (profile.userId === user.id) {
    return { allowed: true, profile, isAdmin: false };
  }

  // 3. Organization member access
  if (profile.organizationId) {
    const member = await db.organizationMember.findFirst({
      where: {
        organizationId: profile.organizationId,
        userId: user.id,
      },
    });
    if (member) {
      return { allowed: true, profile, isAdmin: false };
    }
  }

  return { allowed: false, profile: null };
}
