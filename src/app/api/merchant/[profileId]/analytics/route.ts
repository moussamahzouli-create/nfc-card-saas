import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { canAccessMerchantLoyalty } from '@/lib/auth/merchant-loyalty-access';

interface Params { params: Promise<{ profileId: string }>; }

export async function GET(req: NextRequest, { params }: Params) {
  const { profileId } = await params;
  const auth = await canAccessMerchantLoyalty(profileId, req);
  if (!auth.allowed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const now = new Date();

  // Date anchors
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const targetStamps = Number(auth.settings?.targetStamps) || 10;

  // All customers for this profile
  const allCustomers = await db.loyaltyCustomer.findMany({
    where: { profileId },
    orderBy: { createdAt: 'asc' },
  });

  // All logs for this profile (last 90 days for performance)
  const allLogs = await db.loyaltyLog.findMany({
    where: { profileId, createdAt: { gte: ninetyDaysAgo } },
    orderBy: { createdAt: 'asc' },
  });

  // Customer segments
  const newCustomers = allCustomers.filter(c => new Date(c.createdAt) >= sevenDaysAgo);
  const activeCustomers = allCustomers.filter(c => c.lastStampAt && new Date(c.lastStampAt) >= thirtyDaysAgo);
  const inactiveCustomers = allCustomers.filter(c => !c.lastStampAt || new Date(c.lastStampAt) < thirtyDaysAgo);
  const loyalCustomers = allCustomers.filter(c => c.rewardsEarned >= 2);
  const returningCustomers = allCustomers.filter(c => c.rewardsEarned >= 1 || c.stampsCount > 3);
  const rewardReadyCustomers = allCustomers.filter(c => c.stampsCount >= targetStamps);

  // This month vs last month
  const thisMonthLogs = allLogs.filter(l => new Date(l.createdAt) >= startOfMonth);
  const lastMonthLogs = allLogs.filter(l => {
    const d = new Date(l.createdAt);
    return d >= startOfLastMonth && d <= endOfLastMonth;
  });

  const stampsThisMonth = thisMonthLogs.filter(l => l.action === 'STAMP_ADDED').length;
  const stampsLastMonth = lastMonthLogs.filter(l => l.action === 'STAMP_ADDED').length;
  const rewardsThisMonth = thisMonthLogs.filter(l => l.action === 'REWARD_REDEEMED').length;
  const rewardsLastMonth = lastMonthLogs.filter(l => l.action === 'REWARD_REDEEMED').length;

  // Customers created this vs last month
  const newThisMonth = allCustomers.filter(c => new Date(c.createdAt) >= startOfMonth).length;
  const newLastMonth = allCustomers.filter(c => {
    const d = new Date(c.createdAt);
    return d >= startOfLastMonth && d <= endOfLastMonth;
  }).length;

  // Daily breakdown for last 30 days
  const dailyData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const dayLogs = allLogs.filter(l => {
      const t = new Date(l.createdAt);
      return t >= dayStart && t < dayEnd;
    });
    return {
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      stamps: dayLogs.filter(l => l.action === 'STAMP_ADDED').length,
      rewards: dayLogs.filter(l => l.action === 'REWARD_REDEEMED').length,
      newCustomers: allCustomers.filter(c => {
        const t = new Date(c.createdAt);
        return t >= dayStart && t < dayEnd;
      }).length,
    };
  });

  // Weekly breakdown for last 12 weeks
  const weeklyData = Array.from({ length: 12 }, (_, i) => {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - (i * 7));
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekLogs = allLogs.filter(l => {
      const t = new Date(l.createdAt);
      return t >= weekStart && t < weekEnd;
    });
    return {
      label: `S${12 - i}`,
      stamps: weekLogs.filter(l => l.action === 'STAMP_ADDED').length,
      rewards: weekLogs.filter(l => l.action === 'REWARD_REDEEMED').length,
      newCustomers: allCustomers.filter(c => {
        const t = new Date(c.createdAt);
        return t >= weekStart && t < weekEnd;
      }).length,
    };
  }).reverse();

  // Retention rate: customers who stamped more than once in last 30 days
  const customerActivityCounts = new Map<string, number>();
  allLogs.filter(l => new Date(l.createdAt) >= thirtyDaysAgo && l.action === 'STAMP_ADDED').forEach(l => {
    customerActivityCounts.set(l.phone, (customerActivityCounts.get(l.phone) || 0) + 1);
  });
  const returningInPeriod = Array.from(customerActivityCounts.values()).filter(c => c > 1).length;
  const retentionRate = activeCustomers.length > 0
    ? Math.round((returningInPeriod / activeCustomers.length) * 100)
    : 0;

  // Loyalty completion rate
  const completionRate = allCustomers.length > 0
    ? Math.round((allCustomers.filter(c => c.rewardsEarned >= 1).length / allCustomers.length) * 100)
    : 0;

  // Average stamps per active customer
  const avgStamps = activeCustomers.length > 0
    ? Math.round(activeCustomers.reduce((s, c) => s + c.stampsCount, 0) / activeCustomers.length * 10) / 10
    : 0;

  // Top customers
  const topCustomers = [...allCustomers]
    .sort((a, b) => b.rewardsEarned - a.rewardsEarned || b.stampsCount - a.stampsCount)
    .slice(0, 5)
    .map(c => ({
      id: c.id,
      customerName: c.customerName,
      phone: c.phone,
      stampsCount: c.stampsCount,
      rewardsEarned: c.rewardsEarned,
      lastStampAt: c.lastStampAt?.toISOString() || null,
    }));

  // Campaigns history
  const campaigns = await db.campaign.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return NextResponse.json({
    overview: {
      totalCustomers: allCustomers.length,
      newCustomers: newCustomers.length,
      activeCustomers: activeCustomers.length,
      inactiveCustomers: inactiveCustomers.length,
      loyalCustomers: loyalCustomers.length,
      returningCustomers: returningCustomers.length,
      rewardReadyCustomers: rewardReadyCustomers.length,
      stampsThisMonth,
      stampsLastMonth,
      rewardsThisMonth,
      rewardsLastMonth,
      newThisMonth,
      newLastMonth,
      totalStamps: allCustomers.reduce((s, c) => s + c.stampsCount, 0),
      totalRewards: allCustomers.reduce((s, c) => s + c.rewardsEarned, 0),
      retentionRate,
      completionRate,
      avgStamps,
    },
    daily: dailyData,
    weekly: weeklyData,
    topCustomers,
    campaigns: campaigns.map(c => ({
      id: c.id,
      name: c.name,
      segment: c.segment,
      channel: c.channel,
      status: c.status,
      recipientCount: c.recipientCount,
      sentAt: c.sentAt?.toISOString() || null,
      createdAt: c.createdAt.toISOString(),
    })),
  });
}
