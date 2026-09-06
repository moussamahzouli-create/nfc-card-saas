import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { getPaymentProvider } from '@/lib/billing/payment';
import { z } from 'zod';

const updateOrderSchema = z.object({
  status: z.enum([
    'PENDING',
    'PAYMENT_PENDING',
    'PAID',
    'PROCESSING',
    'READY_TO_SHIP',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ]),
});

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = updateOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    const { status } = result.data;
    const order = await db.order.findUnique({ where: { id } });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status
    const updatedOrder = await db.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status },
      });

      // Handle inventory release if cancelled
      if (status === 'CANCELLED') {
        const items = await tx.orderItem.findMany({ where: { orderId: id } });
        for (const item of items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      // Log action in audit logs
      await tx.auditLog.create({
        data: {
          adminId: user.id,
          action: 'update_order_status',
          entityType: 'Order',
          entityId: id,
          oldData: order.status,
          newData: status,
        },
      });

      return updated;
    });

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
