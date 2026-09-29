import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { canAccessMerchantLoyalty } from '@/lib/auth/merchant-loyalty-access';

interface Params { params: Promise<{ profileId: string }>; }

export async function GET(req: NextRequest, { params }: Params) {
  const { profileId } = await params;
  const auth = await canAccessMerchantLoyalty(profileId, req);
  if (!auth.allowed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const campaigns = await db.campaign.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { profileId } = await params;
  const auth = await canAccessMerchantLoyalty(profileId, req);
  if (!auth.allowed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, segment, message, channel, scheduledAt } = body;

  if (!name || !segment || !message || !channel) {
    return NextResponse.json({ error: 'name, segment, message, channel required' }, { status: 400 });
  }

  // Count recipients based on segment filters
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const targetStamps = Number(auth.settings?.targetStamps) || 10;

  const allCustomers = await db.loyaltyCustomer.findMany({ where: { profileId } });
  let recipients = allCustomers;
  if (segment === 'new') recipients = allCustomers.filter(c => new Date(c.createdAt) >= sevenDaysAgo);
  else if (segment === 'active') recipients = allCustomers.filter(c => c.lastStampAt && new Date(c.lastStampAt) >= thirtyDaysAgo);
  else if (segment === 'inactive') recipients = allCustomers.filter(c => !c.lastStampAt || new Date(c.lastStampAt) < thirtyDaysAgo);
  else if (segment === 'reward_ready') recipients = allCustomers.filter(c => c.stampsCount >= targetStamps);
  else if (segment === 'almost_reward') recipients = allCustomers.filter(c => c.stampsCount >= Math.ceil(targetStamps * 0.7) && c.stampsCount < targetStamps);
  else if (segment === 'loyal') recipients = allCustomers.filter(c => c.rewardsEarned >= 1 || (c.lastStampAt && new Date(c.lastStampAt) >= thirtyDaysAgo));

  const campaign = await db.campaign.create({
    data: {
      profileId,
      name: name.trim(),
      segment,
      message: message.trim(),
      channel,
      recipientCount: recipients.length,
      status: 'DRAFT',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    },
  });

  return NextResponse.json({ campaign, recipientCount: recipients.length });
}
