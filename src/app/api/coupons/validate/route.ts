import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';

const couponValidateSchema = z.object({
  code: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = couponValidateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid coupon code format' }, { status: 400 });
    }

    const { code } = result.data;
    const coupon = await db.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.active) {
      return NextResponse.json({ error: 'Invalid or inactive coupon code' }, { status: 404 });
    }

    const now = new Date();
    const expired = coupon.expiresAt && new Date(coupon.expiresAt) < now;
    const redemptionLimitReached = coupon.maxRedemptions !== null && coupon.redemptions >= coupon.maxRedemptions;

    if (expired) {
      return NextResponse.json({ error: 'Coupon code has expired' }, { status: 400 });
    }

    if (redemptionLimitReached) {
      return NextResponse.json({ error: 'Coupon code usage limit reached' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      currency: coupon.currency,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
