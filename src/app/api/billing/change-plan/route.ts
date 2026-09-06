import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';

const changePlanSchema = z.object({
  planId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = changePlanSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid planId' }, { status: 400 });
    }

    const { planId } = result.data;
    const newPlan = await db.plan.findUnique({ where: { id: planId } });

    if (!newPlan) {
      return NextResponse.json({ error: 'New plan not found' }, { status: 404 });
    }

    const activeSub = await db.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      include: { plan: true },
    });

    if (!activeSub) {
      return NextResponse.json({ error: 'No active subscription found to modify.' }, { status: 400 });
    }

    const currentPrice = activeSub.plan.price;
    const newPrice = newPlan.price;

    if (newPrice >= currentPrice) {
      // Immediate Upgrade
      await db.subscription.update({
        where: { id: activeSub.id },
        data: {
          planId,
          // Extend validity period
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      return NextResponse.json({ success: true, mode: 'UPGRADE' });
    } else {
      // Downgrade: Schedule change at period end (never destroy user data immediately)
      await db.subscription.update({
        where: { id: activeSub.id },
        data: {
          cancelAtPeriodEnd: true,
          // Can record scheduled plan shift in database metadata
        },
      });
      return NextResponse.json({ success: true, mode: 'DOWNGRADE_SCHEDULED' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
