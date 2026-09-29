import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { canAccessMerchantLoyalty } from '@/lib/auth/merchant-loyalty-access';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/profiles/[id]/loyalty/merchant - Full isolated merchant loyalty data
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const auth = await canAccessMerchantLoyalty(id, req);

    if (!auth.allowed || !auth.profile) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    const { profile, loyaltyComp, settings } = auth;

    const targetStamps = Number(settings?.targetStamps) || 10;
    const rewardText = settings?.rewardText || 'Cadeau ou réduction exclusive';
    const stampIcon = settings?.stampIcon || 'coffee';
    const merchantPin = settings?.merchantPin || '1234';
    const cooldownMinutes = settings?.cooldownMinutes !== undefined ? Number(settings.cooldownMinutes) : 5;
    const cardTitle = loyaltyComp?.title || 'Carte de Fidélité';
    const storeName = profile.company || profile.name || 'Commerce Partenaire';

    // 1. Fetch all customers for this profile
    const customers = await db.loyaltyCustomer.findMany({
      where: { profileId: id },
      include: {
        _count: {
          select: { logs: true },
        },
      },
      orderBy: { lastStampAt: { sort: 'desc', nulls: 'last' } },
    });

    // 2. Fetch all logs for this profile
    const allLogs = await db.loyaltyLog.findMany({
      where: { profileId: id },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 3. Compute statistics
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.lastStampAt && new Date(c.lastStampAt) >= thirtyDaysAgo).length;

    // Count total visits & stamps from logs or customers
    const stampLogs = allLogs.filter(l => l.action === 'STAMP_ADDED');
    const redeemLogs = allLogs.filter(l => l.action === 'REWARD_REDEEMED');

    const stampsGiven = stampLogs.length > 0 
      ? stampLogs.length 
      : customers.reduce((acc, c) => acc + c.stampsCount + (c.rewardsEarned * targetStamps), 0);

    const rewardsRedeemed = redeemLogs.length > 0
      ? redeemLogs.length
      : customers.reduce((acc, c) => acc + c.rewardsEarned, 0);

    const totalVisits = allLogs.length > 0
      ? allLogs.length
      : customers.reduce((acc, c) => acc + (c._count?.logs || c.stampsCount), 0);

    const todayVisits = allLogs.filter(l => new Date(l.createdAt) >= startOfToday).length;
    const todayStamps = stampLogs.filter(l => new Date(l.createdAt) >= startOfToday).length;

    // 4. Format customer records with computed fields
    const formattedCustomers = customers.map(c => {
      const visitsCount = c._count?.logs > 0 
        ? c._count.logs 
        : (c.stampsCount + (c.rewardsEarned * targetStamps)) || 1;

      const isRewardReady = c.stampsCount >= targetStamps;
      const isNew = new Date(c.createdAt) >= sevenDaysAgo;
      const isActive = c.lastStampAt ? new Date(c.lastStampAt) >= thirtyDaysAgo : false;
      const isAlmostReward = !isRewardReady && c.stampsCount >= Math.ceil(targetStamps * 0.7);

      let status = 'en_cours';
      if (isRewardReady) status = 'reward_ready';
      else if (isAlmostReward) status = 'almost_reward';
      else if (isActive) status = 'active';
      else if (isNew) status = 'new';
      else status = 'inactive';

      return {
        id: c.id,
        phone: c.phone,
        customerName: c.customerName,
        stampsCount: c.stampsCount,
        rewardsEarned: c.rewardsEarned,
        visitsCount,
        lastStampAt: c.lastStampAt,
        createdAt: c.createdAt,
        isRewardReady,
        status,
      };
    });

    // 5. Segments calculation
    const segments = {
      all: formattedCustomers.length,
      active: formattedCustomers.filter(c => c.status === 'active' || c.status === 'reward_ready' || c.status === 'almost_reward').length,
      new: formattedCustomers.filter(c => c.status === 'new').length,
      almost_reward: formattedCustomers.filter(c => c.status === 'almost_reward').length,
      reward_ready: formattedCustomers.filter(c => c.status === 'reward_ready').length,
      loyal: formattedCustomers.filter(c => c.rewardsEarned >= 1 || c.visitsCount >= 5).length,
      inactive: formattedCustomers.filter(c => c.status === 'inactive').length,
    };

    // 6. Analytics generation (last 14 days)
    const dailyMap: Record<string, { date: string; stamps: number; visits: number; rewards: number }> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = { date: key, stamps: 0, visits: 0, rewards: 0 };
    }

    allLogs.forEach(l => {
      const dateKey = new Date(l.createdAt).toISOString().split('T')[0];
      if (dailyMap[dateKey]) {
        dailyMap[dateKey].visits++;
        if (l.action === 'STAMP_ADDED') dailyMap[dateKey].stamps++;
        if (l.action === 'REWARD_REDEEMED') dailyMap[dateKey].rewards++;
      }
    });

    const dailyActivity = Object.values(dailyMap);

    // Peak hours analysis (0-23)
    const hourlyCounts = Array(24).fill(0);
    allLogs.forEach(l => {
      const hour = new Date(l.createdAt).getHours();
      hourlyCounts[hour]++;
    });

    // 7. Recent activity formatted
    const customerNameMap = new Map<string, string>();
    customers.forEach(c => {
      customerNameMap.set(c.phone, c.customerName || '');
    });

    const recentActivity = allLogs.slice(0, 50).map(l => ({
      id: l.id,
      phone: l.phone,
      customerName: customerNameMap.get(l.phone) || null,
      action: l.action,
      stampsCount: l.stampsCount,
      createdAt: l.createdAt,
    }));

    return NextResponse.json({
      business: {
        id: profile.id,
        name: profile.name,
        company: profile.company || profile.name,
        slug: profile.slug,
        photoUrl: profile.photoUrl,
        role: auth.role,
      },
      settings: {
        storeName,
        cardTitle,
        rewardText,
        targetStamps,
        stampIcon,
        merchantPin,
        cooldownMinutes,
      },
      stats: {
        totalCustomers,
        activeCustomers,
        totalVisits,
        stampsGiven,
        rewardsRedeemed,
        todayVisits,
        todayStamps,
      },
      customers: formattedCustomers,
      recentActivity,
      segments,
      analytics: {
        dailyActivity,
        hourlyDistribution: hourlyCounts,
        returningRatio: totalCustomers > 0 ? Math.round((formattedCustomers.filter(c => c.visitsCount > 1).length / totalCustomers) * 100) : 0,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/profiles/[id]/loyalty/merchant:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

// PUT /api/profiles/[id]/loyalty/merchant - Update loyalty settings / PIN
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const auth = await canAccessMerchantLoyalty(id, req);

    if (!auth.allowed || !auth.profile) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { profile, loyaltyComp, settings } = auth;

    const newSettings = {
      ...settings,
      targetStamps: body.targetStamps !== undefined ? Number(body.targetStamps) : settings.targetStamps,
      rewardText: body.rewardText !== undefined ? String(body.rewardText).trim() : settings.rewardText,
      stampIcon: body.stampIcon !== undefined ? String(body.stampIcon).trim() : settings.stampIcon,
      merchantPin: body.merchantPin !== undefined ? String(body.merchantPin).trim() : settings.merchantPin,
      cooldownMinutes: body.cooldownMinutes !== undefined ? Number(body.cooldownMinutes) : settings.cooldownMinutes,
    };

    if (loyaltyComp) {
      await db.profileComponent.update({
        where: { id: loyaltyComp.id },
        data: {
          settingsJson: JSON.stringify(newSettings),
          title: body.cardTitle || loyaltyComp.title,
        },
      });
    }

    // Optional store name update
    if (body.storeName && body.storeName.trim() && body.storeName.trim() !== profile.company) {
      await db.profile.update({
        where: { id },
        data: { company: body.storeName.trim() },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Paramètres mis à jour avec succès',
      settings: newSettings,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/profiles/[id]/loyalty/merchant:', error);
    return NextResponse.json({ error: 'Erreur de mise à jour' }, { status: 500 });
  }
}
