import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { getPaymentProvider } from '@/lib/billing/payment';
import { z } from 'zod';

const subscribeSchema = z.object({
  planId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = subscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid planId' }, { status: 400 });
    }

    const { planId } = result.data;
    const plan = await db.plan.findUnique({ where: { id: planId } });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Generate mock checkout redirect for subscription plan
    const provider = getPaymentProvider();
    const totalMinor = Math.round(plan.price * 100);

    // If plan is free, register subscription immediately without payment redirect
    if (totalMinor === 0) {
      await db.subscription.updateMany({
        where: { userId: user.id, status: 'ACTIVE' },
        data: { status: 'CANCELED', cancelledAt: new Date() },
      });

      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(startDate.getFullYear() + 100); // 100 years for free plan

      const newSub = await db.subscription.create({
        data: {
          userId: user.id,
          planId,
          provider: 'FreeTrial',
          providerSubscriptionId: `sub_free_${Date.now()}`,
          status: 'ACTIVE',
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
        },
      });

      return NextResponse.json({ success: true, subscription: newSub });
    }

    // Else build payment checkout
    const checkout = await provider.createCheckout({
      userId: user.id,
      orderId: '', // Subscription orders don't link physical orders
      amount: totalMinor,
      currency: plan.currency || 'USD',
      successUrl: `${req.nextUrl.origin}/dashboard/billing?success=true`,
      cancelUrl: `${req.nextUrl.origin}/pricing?cancel=true`,
      type: 'SUBSCRIPTION',
    });

    // Create webhook body for simulation
    const mockWebhookBody = {
      event: 'checkout.completed',
      userId: user.id,
      planId,
      transactionId: `tx_sub_${Date.now()}`,
      amount: totalMinor,
      currency: plan.currency || 'USD',
    };

    return NextResponse.json({
      checkoutUrl: checkout.checkoutUrl,
      // Return webhook simulated parameters for sandbox checkouts
      mockWebhookBody,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
