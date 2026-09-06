import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { getPaymentProvider } from '@/lib/billing/payment';
import { z } from 'zod';

const checkoutSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  quantity: z.number().int().min(1),
  couponCode: z.string().optional().nullable(),
  shippingName: z.string().min(2),
  shippingCompany: z.string().optional().nullable(),
  shippingPhone: z.string().min(6),
  shippingCountry: z.string().min(2),
  shippingState: z.string().min(2),
  shippingCity: z.string().min(2),
  shippingZip: z.string().min(2),
  shippingLine1: z.string().min(3),
  shippingLine2: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues.map(i => i.message).join(', ') }, { status: 400 });
    }

    const {
      productId,
      variantId,
      quantity,
      couponCode,
      shippingName,
      shippingCompany,
      shippingPhone,
      shippingCountry,
      shippingState,
      shippingCity,
      shippingZip,
      shippingLine1,
      shippingLine2,
    } = result.data;

    // 1. Fetch Product and Variant (verify status and stock)
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });

    if (!product || product.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 });
    }

    let unitPrice = Math.round(product.price * 100); // Convert Float basePrice to minor units (cents)
    let variantName = '';

    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      if (!variant || variant.status !== 'ACTIVE') {
        return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
      }
      if (variant.stock < quantity) {
        return NextResponse.json({ error: 'Insufficient inventory stock for this variant' }, { status: 400 });
      }
      unitPrice = variant.price;
      variantName = variant.name;
    }

    // 2. Server-side totals calculation (integer minor units)
    const subtotal = unitPrice * quantity;
    let discount = 0;

    // Check Coupon
    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode },
      });
      if (coupon && coupon.active) {
        const now = new Date();
        const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > now;
        const underLimit = !coupon.maxRedemptions || coupon.redemptions < coupon.maxRedemptions;

        if (notExpired && underLimit) {
          if (coupon.type === 'PERCENTAGE') {
            discount = Math.round((subtotal * coupon.value) / 100);
          } else if (coupon.type === 'FIXED') {
            discount = coupon.value;
          }
        }
      }
    }

    // Ensure discount doesn't exceed subtotal
    const discountApplied = Math.min(discount, subtotal);
    const shipping = 500; // Flat shipping rate: $5.00 (500 cents)
    const taxRate = 0.08; // Flat 8% tax
    const taxableAmount = subtotal - discountApplied + shipping;
    const tax = Math.round(taxableAmount * taxRate);
    const total = subtotal - discountApplied + shipping + tax;

    // 3. Perform inventory reserve & order creation in a database transaction
    const order = await db.$transaction(async (tx) => {
      // Deduct stock if variant is selected
      if (variantId) {
        await tx.productVariant.update({
          where: { id: variantId },
          data: { stock: { decrement: quantity } },
        });
      }

      // Create Order
      const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      return tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          subtotal: subtotal / 100, // store Float for compatible schema fields
          shipping: shipping / 100,
          tax: tax / 100,
          discount: discountApplied / 100,
          total: total / 100,
          currency: product.currency || 'USD',
          status: 'PENDING',
          shippingName,
          shippingCompany,
          shippingPhone,
          shippingCountry,
          shippingState,
          shippingCity,
          shippingZip,
          shippingLine1,
          shippingLine2,
          items: {
            create: {
              productId,
              variantId: variantId || null,
              quantity,
              unitPrice: unitPrice / 100,
            },
          },
        },
      });
    });

    // 4. Generate payment session
    const provider = getPaymentProvider();
    const checkout = await provider.createCheckout({
      userId: user.id,
      orderId: order.id,
      amount: total,
      currency: order.currency,
      successUrl: `${req.nextUrl.origin}/dashboard/orders?success=true`,
      cancelUrl: `${req.nextUrl.origin}/checkout?cancel=true`,
      type: 'PRODUCT',
    });

    return NextResponse.json({
      orderId: order.id,
      checkoutUrl: checkout.checkoutUrl,
      sessionId: checkout.sessionId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
