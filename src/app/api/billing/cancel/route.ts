import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeSub = await db.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
    });

    if (!activeSub) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    // Schedule cancellation at period end
    const updatedSub = await db.subscription.update({
      where: { id: activeSub.id },
      data: {
        cancelAtPeriodEnd: true,
      },
    });

    return NextResponse.json({ success: true, subscription: updatedSub });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
