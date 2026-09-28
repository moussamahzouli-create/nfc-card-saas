import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

const redeemSchema = z.object({
  phone: z.string().min(6, 'Phone is required'),
  pin: z.string().min(1, 'Merchant PIN is required'),
});

function cleanPhone(raw: string): string {
  return raw.replace(/[\s\-\.\(\)]/g, '').trim();
}

// POST /api/profiles/[id]/loyalty/redeem
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = redeemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid parameters' }, { status: 400 });
    }

    const { phone: rawPhone, pin } = parsed.data;
    const phone = cleanPhone(rawPhone);

    // 1. Fetch profile and loyalty component
    const profile = await db.profile.findUnique({
      where: { id },
      include: {
        components: {
          where: {
            type: { in: ['Loyalty', 'loyalty', 'LOYALTY'] },
            isVisible: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const loyaltyComponent = profile.components[0];
    if (!loyaltyComponent) {
      return NextResponse.json({ error: 'Loyalty program is not active' }, { status: 400 });
    }

    let settings: any = {};
    if (loyaltyComponent.settingsJson) {
      try { settings = JSON.parse(loyaltyComponent.settingsJson); } catch {}
    }

    const merchantPin = String(settings.merchantPin || '1234').trim();
    const targetStamps = Number(settings.targetStamps) || 10;
    const rewardText = settings.rewardText || 'Cadeau ou réduction exclusive';

    // 2. Validate Merchant PIN
    if (pin.trim() !== merchantPin) {
      return NextResponse.json({ 
        error: 'Code PIN incorrect (رمز PIN غير صحيح)',
        code: 'INVALID_PIN'
      }, { status: 401 });
    }

    // 3. Find customer
    const customer = await db.loyaltyCustomer.findUnique({
      where: {
        profileId_phone: {
          profileId: id,
          phone,
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Client introuvable (الزبون غير مسجل)' }, { status: 404 });
    }

    // 4. Verify if stamps threshold is reached
    if (customer.stampsCount < targetStamps) {
      return NextResponse.json({
        error: `Nombre de tampons insuffisant (${customer.stampsCount}/${targetStamps}). (عدد الأختام غير كافٍ للحصول على المكافأة)`,
        code: 'INSUFFICIENT_STAMPS',
        stampsCount: customer.stampsCount,
        targetStamps,
      }, { status: 400 });
    }

    // 5. Deduct target stamps and increment rewards earned
    const remainingStamps = Math.max(0, customer.stampsCount - targetStamps);
    const newRewardsCount = customer.rewardsEarned + 1;

    const updatedCustomer = await db.loyaltyCustomer.update({
      where: { id: customer.id },
      data: {
        stampsCount: remainingStamps,
        rewardsEarned: newRewardsCount,
      },
    });

    // 6. Log redemption
    try {
      await db.loyaltyLog.create({
        data: {
          profileId: id,
          phone,
          customerId: customer.id,
          action: 'REWARD_REDEEMED',
          stampsCount: remainingStamps,
        },
      });
    } catch (logErr) {
      console.warn('Could not write loyalty log:', logErr);
    }

    return NextResponse.json({
      success: true,
      message: `Récompense (${rewardText}) validée avec succès ! (تم تسليم المكافأة بنجاح)`,
      stampsCount: updatedCustomer.stampsCount,
      targetStamps,
      isRewardReady: false,
      rewardsEarned: updatedCustomer.rewardsEarned,
      rewardText,
    });
  } catch (error: any) {
    console.error('Error in POST /api/profiles/[id]/loyalty/redeem:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
