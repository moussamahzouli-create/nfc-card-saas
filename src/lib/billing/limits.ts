import { db } from '../db';

export interface UserUsageReport {
  planName: string;
  maxProfiles: number;
  maxCards: number;
  profilesUsed: number;
  cardsUsed: number;
  analyticsRetentionDays: number;
  customBranding: boolean;
  advancedAnalytics: boolean;
  templatesAccess: boolean;
  customDomain: boolean;
  prioritySupport: boolean;
}

/**
 * Compiles a user's active usage counts and details plan limits.
 */
export async function getUserUsage(userId: string): Promise<UserUsageReport> {
  // Load user details for admin/direct-access bypasses
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, accessType: true }
  });

  const isBypassed = user && (
    user.role === 'SUPER_ADMIN' ||
    user.role === 'ADMIN' ||
    user.accessType === 'DIRECT_SERVICE' ||
    user.accessType === 'ADMIN_MANAGED'
  );

  // 1. Fetch user active subscription and plan
  const sub = await db.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { plan: true },
  });

  // Default to Free Plan parameters if no subscription exists
  let planLimits = {
    name: isBypassed ? 'UNLIMITED (ADMIN)' : 'FREE',
    maxProfiles: isBypassed ? -1 : 1,
    maxCards: isBypassed ? -1 : 1,
    analyticsRetentionDays: isBypassed ? 9999 : 30,
    customBranding: isBypassed ? true : false,
    advancedAnalytics: isBypassed ? true : false,
    customDomain: isBypassed ? true : false,
    prioritySupport: isBypassed ? true : false,
    apiAccess: isBypassed ? true : false,
  };

  if (!isBypassed && sub && sub.plan) {
    planLimits = {
      name: sub.plan.name.toUpperCase(),
      maxProfiles: sub.plan.maxProfiles,
      maxCards: sub.plan.maxCards,
      analyticsRetentionDays: sub.plan.analyticsRetentionDays,
      customBranding: sub.plan.customBranding,
      advancedAnalytics: sub.plan.advancedAnalytics,
      customDomain: sub.plan.customDomain,
      prioritySupport: sub.plan.prioritySupport,
      apiAccess: sub.plan.apiAccess,
    };
  }

  // 2. Query actual resources used by user
  const [profilesUsed, cardsUsed] = await Promise.all([
    db.profile.count({ where: { userId } }),
    db.cardAssignment.count({ where: { userId, status: 'ACTIVE' } }),
  ]);

  return {
    planName: planLimits.name,
    maxProfiles: planLimits.maxProfiles,
    maxCards: planLimits.maxCards,
    profilesUsed,
    cardsUsed,
    analyticsRetentionDays: planLimits.analyticsRetentionDays,
    customBranding: planLimits.customBranding,
    advancedAnalytics: planLimits.advancedAnalytics,
    templatesAccess: planLimits.name !== 'FREE', // Basic templates for free, all templates for others
    customDomain: planLimits.customDomain,
    prioritySupport: planLimits.prioritySupport,
  };
}

export async function canCreateProfile(userId: string): Promise<boolean> {
  const report = await getUserUsage(userId);
  // Unlimited profiles check (e.g. -1 or huge number)
  if (report.maxProfiles < 0) return true;
  return report.profilesUsed < report.maxProfiles;
}

export async function canCreateCard(userId: string): Promise<boolean> {
  const report = await getUserUsage(userId);
  if (report.maxCards < 0) return true;
  return report.cardsUsed < report.maxCards;
}

export async function canUseCustomBranding(userId: string): Promise<boolean> {
  const report = await getUserUsage(userId);
  return report.customBranding;
}

export async function canUseTemplates(userId: string): Promise<boolean> {
  const report = await getUserUsage(userId);
  return report.templatesAccess;
}
