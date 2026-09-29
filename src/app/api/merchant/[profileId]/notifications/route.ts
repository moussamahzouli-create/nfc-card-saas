import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { canAccessMerchantLoyalty } from '@/lib/auth/merchant-loyalty-access';

interface Params { params: Promise<{ profileId: string }>; }

export async function GET(req: NextRequest, { params }: Params) {
  const { profileId } = await params;
  const auth = await canAccessMerchantLoyalty(profileId, req);
  if (!auth.allowed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = await db.merchantNotification.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  const unreadCount = await db.merchantNotification.count({
    where: { profileId, isRead: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { profileId } = await params;
  const auth = await canAccessMerchantLoyalty(profileId, req);
  if (!auth.allowed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.merchantNotification.updateMany({
    where: { profileId, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
