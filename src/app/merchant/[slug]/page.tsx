import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';
import MerchantDashboardClient from './MerchantDashboardClient';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only'
);

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getMerchantSessionPayload(slug: string): Promise<{ profileId: string; storeName: string } | null> {
  const cookieStore = await cookies();
  
  // 1. Check universal merchant_session cookie
  const merchantCookie = cookieStore.get('merchant_session')?.value;
  if (merchantCookie) {
    try {
      const { payload } = await jwtVerify(merchantCookie, JWT_SECRET) as any;
      if (payload?.role === 'MERCHANT_PIN' && payload?.profileId) {
        // Verify slug matches
        const profile = await db.profile.findUnique({
          where: { id: payload.profileId },
          select: { id: true, slug: true, company: true, name: true }
        });
        if (profile && profile.slug === slug) {
          return { profileId: profile.id, storeName: profile.company || profile.name };
        }
      }
    } catch {}
  }

  // 2. Check profile-specific legacy cookies
  const allCookies = cookieStore.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('merchant_loyalty_')) {
      try {
        const { payload } = await jwtVerify(cookie.value, JWT_SECRET) as any;
        if (payload?.role === 'MERCHANT_PIN' && payload?.profileId) {
          const profile = await db.profile.findUnique({
            where: { id: payload.profileId },
            select: { id: true, slug: true, company: true, name: true }
          });
          if (profile && profile.slug === slug) {
            return { profileId: profile.id, storeName: profile.company || profile.name };
          }
        }
      } catch {}
    }
  }

  return null;
}

export default async function MerchantDashboardPage({ params }: PageProps) {
  const { slug } = await params;

  // Authenticate merchant
  const session = await getMerchantSessionPayload(slug);
  
  if (!session) {
    redirect(`/merchant/login?store=${encodeURIComponent(slug)}`);
  }

  // Load full store data
  const profile = await db.profile.findFirst({
    where: { slug },
    include: {
      components: {
        where: { type: { in: ['Loyalty', 'loyalty', 'LOYALTY'] } },
      },
    },
  });

  if (!profile) {
    redirect('/merchant/login');
  }

  const loyaltyComp = profile.components[0];
  let settings: any = {};
  if (loyaltyComp?.settingsJson) {
    try { settings = JSON.parse(loyaltyComp.settingsJson); } catch {}
  }

  const targetStamps = Number(settings.targetStamps) || 10;

  // Load all customers with aggregates
  const allCustomers = await db.loyaltyCustomer.findMany({
    where: { profileId: profile.id },
    orderBy: { lastStampAt: 'desc' },
  });

  // Date anchors for segments
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Segment counts
  const newCustomers = allCustomers.filter(c => new Date(c.createdAt) >= sevenDaysAgo);
  const activeCustomers = allCustomers.filter(c => c.lastStampAt && new Date(c.lastStampAt) >= thirtyDaysAgo);
  const inactiveCustomers = allCustomers.filter(c => !c.lastStampAt || new Date(c.lastStampAt) < thirtyDaysAgo);
  const loyalCustomers = allCustomers.filter(c => c.rewardsEarned >= 2);
  const rewardReadyCustomers = allCustomers.filter(c => c.stampsCount >= targetStamps);
  const almostRewardCustomers = allCustomers.filter(c => 
    c.stampsCount >= Math.ceil(targetStamps * 0.7) && c.stampsCount < targetStamps
  );

  // Recent activity
  const recentLogs = await db.loyaltyLog.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // This month stats
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const stampsThisMonth = recentLogs.filter(l => 
    l.action === 'STAMP_ADDED' && new Date(l.createdAt) >= startOfMonth
  ).length;
  const rewardsThisMonth = recentLogs.filter(l => 
    l.action === 'REWARD_REDEEMED' && new Date(l.createdAt) >= startOfMonth
  ).length;
  const newThisMonth = allCustomers.filter(c => new Date(c.createdAt) >= startOfMonth).length;

  // Weekly chart data (last 7 days)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const stamps = recentLogs.filter(l => {
      const t = new Date(l.createdAt);
      return l.action === 'STAMP_ADDED' && t >= dayStart && t < dayEnd;
    }).length;
    const rewards = recentLogs.filter(l => {
      const t = new Date(l.createdAt);
      return l.action === 'REWARD_REDEEMED' && t >= dayStart && t < dayEnd;
    }).length;
    return {
      label: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
      stamps,
      rewards,
    };
  });

  const initialData = {
    profile: {
      id: profile.id,
      slug: profile.slug,
      name: profile.name,
      company: profile.company,
      photoUrl: profile.photoUrl,
    },
    settings: {
      storeName: settings.storeName || profile.company || profile.name,
      cardTitle: settings.cardTitle || 'Carte Fidélité',
      rewardText: settings.rewardText || 'Récompense',
      targetStamps,
      stampIcon: settings.stampIcon || 'star',
      merchantPin: settings.merchantPin || '1234',
      cooldownMinutes: Number(settings.cooldownMinutes) || 5,
    },
    stats: {
      totalCustomers: allCustomers.length,
      activeCustomers: activeCustomers.length,
      newCustomers: newCustomers.length,
      inactiveCustomers: inactiveCustomers.length,
      loyalCustomers: loyalCustomers.length,
      rewardReadyCustomers: rewardReadyCustomers.length,
      almostRewardCustomers: almostRewardCustomers.length,
      stampsThisMonth,
      rewardsThisMonth,
      newThisMonth,
      totalStamps: allCustomers.reduce((s, c) => s + c.stampsCount, 0),
      totalRewards: allCustomers.reduce((s, c) => s + c.rewardsEarned, 0),
    },
    customers: allCustomers.map(c => ({
      id: c.id,
      phone: c.phone,
      customerName: c.customerName,
      stampsCount: c.stampsCount,
      rewardsEarned: c.rewardsEarned,
      lastStampAt: c.lastStampAt?.toISOString() || null,
      createdAt: c.createdAt.toISOString(),
      isNew: new Date(c.createdAt) >= sevenDaysAgo,
      isActive: !!(c.lastStampAt && new Date(c.lastStampAt) >= thirtyDaysAgo),
      isInactive: !c.lastStampAt || new Date(c.lastStampAt) < thirtyDaysAgo,
      isLoyal: c.rewardsEarned >= 2,
      isRewardReady: c.stampsCount >= targetStamps,
      isAlmostReward: c.stampsCount >= Math.ceil(targetStamps * 0.7) && c.stampsCount < targetStamps,
    })),
    activity: recentLogs.slice(0, 30).map(l => ({
      id: l.id,
      phone: l.phone,
      action: l.action,
      stampsCount: l.stampsCount,
      createdAt: l.createdAt.toISOString(),
    })),
    weeklyData,
  };

  return (
    <MerchantDashboardClient
      profileId={profile.id}
      slug={slug}
      initialData={initialData}
    />
  );
}
