import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPaymentProvider } from '@/lib/billing/payment';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-payment-signature') || '';
    const bodyText = await req.text();

    const provider = getPaymentProvider();
    const verified = await provider.verifyWebhookSignature(bodyText, signature);

    if (!verified) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(bodyText);
    const { event, orderId, transactionId, planId, userId } = payload;

    // Idempotency: Verify if event is already processed by checking transaction log
    const existingPayment = await db.payment.findUnique({
      where: { transactionId },
    });
    if (existingPayment) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (event === 'checkout.completed') {
      await db.$transaction(async (tx) => {
        // 1. Log Payment
        const amount = payload.amount || 0;
        await tx.payment.create({
          data: {
            userId: payload.userId,
            amount: amount / 100,
            currency: payload.currency || 'USD',
            provider: 'MockProvider',
            transactionId,
            status: 'PAID',
          },
        });

        // 2. Update Order
        if (orderId) {
          const order = await tx.order.findUnique({ where: { id: orderId } });
          if (order && order.status !== 'PAID') {
            await tx.order.update({
              where: { id: orderId },
              data: { status: 'PAID' },
            });

            // Create Invoice
            const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
            await tx.invoice.create({
              data: {
                invoiceNumber,
                orderId,
                customerId: payload.userId,
                currency: order.currency,
                subtotal: Math.round(order.subtotal * 100),
                tax: Math.round(order.tax * 100),
                discount: Math.round(order.discount * 100),
                total: Math.round(order.total * 100),
                status: 'PAID',
                issuedAt: new Date(),
              },
            });
          }
        }

        // 3. Handle Subscription Update
        if (planId && userId) {
          const plan = await tx.plan.findUnique({ where: { id: planId } });
          if (plan) {
            // Cancel existing active subscription
            await tx.subscription.updateMany({
              where: { userId, status: 'ACTIVE' },
              data: { status: 'CANCELED', cancelledAt: new Date() },
            });

            // Create new Subscription
            const durationDays = plan.name === 'FREE' ? 36500 : 30; // 30 days renewal
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + durationDays);

            await tx.subscription.create({
              data: {
                userId,
                planId,
                provider: 'MockProvider',
                providerSubscriptionId: `sub_mock_${Date.now()}`,
                status: 'ACTIVE',
                currentPeriodStart: startDate,
                currentPeriodEnd: endDate,
              },
            });
          }
        }
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
