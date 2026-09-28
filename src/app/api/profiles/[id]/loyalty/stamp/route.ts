import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

const stampSchema = z.object({
  phone: z.string().min(6, 'Phone is required'),
  pin: z.string().min(1, 'Merchant PIN is required'),
});

function cleanPhone(raw: string): string {
  if (!raw) return '';
  let cleaned = raw
    .replace(/[٠-٩]/g, d => (d.charCodeAt(0) - 1632).toString())
    .replace(/[۰-۹]/g, d => (d.charCodeAt(0) - 1776).toString())
    .replace(/[\s\-\.\(\)]/g, '')
    .trim();

  if (cleaned.startsWith('+212')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('00212')) {
    cleaned = '0' + cleaned.slice(5);
  } else if (cleaned.startsWith('212') && cleaned.length >= 11) {
    cleaned = '0' + cleaned.slice(3);
  } else if (/^[5-7]\d{8}$/.test(cleaned)) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
}

// POST /api/profiles/[id]/loyalty/stamp
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = stampSchema.safeParse(body);

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
    const cooldownMinutes = settings.cooldownMinutes !== undefined ? Number(settings.cooldownMinutes) : 5;

    // 2. Validate Merchant PIN
    if (pin.trim() !== merchantPin) {
      return NextResponse.json({ 
        error: 'Code PIN incorrect (رمز PIN غير صحيح)',
        code: 'INVALID_PIN'
      }, { status: 401 });
    }

    // 3. Find or create customer
    let customer = await db.loyaltyCustomer.findUnique({
      where: {
        profileId_phone: {
          profileId: id,
          phone,
        },
      },
    });

    if (!customer) {
      customer = await db.loyaltyCustomer.create({
        data: {
          profileId: id,
          phone,
          stampsCount: 0,
          rewardsEarned: 0,
        },
      });
    }

    // 4. Cooldown verification (Anti-fraud)
    if (cooldownMinutes > 0 && customer.lastStampAt) {
      const diffMs = Date.now() - new Date(customer.lastStampAt).getTime();
      const diffMinutes = diffMs / (1000 * 60);
      if (diffMinutes < cooldownMinutes) {
        const remainingMinutes = Math.ceil(cooldownMinutes - diffMinutes);
        return NextResponse.json({
          error: `Un tampon a déjà été ajouté récemment. Veuillez patienter ${remainingMinutes} min. (تمت إضافة ختم مؤخراً، يرجى الانتظار ${remainingMinutes} دقيقة)`,
          code: 'COOLDOWN_ACTIVE',
          remainingMinutes,
        }, { status: 429 });
      }
    }

    // 5. Check if already at maximum reward threshold
    if (customer.stampsCount >= targetStamps) {
      return NextResponse.json({
        error: 'La carte est déjà pleine ! Veuillez d\'abord réclamer votre récompense. (البطاقة ممتلئة بالفعل، يرجى استلام هديتك أولاً)',
        code: 'REWARD_PENDING',
        isRewardReady: true,
        stampsCount: customer.stampsCount,
        targetStamps,
      }, { status: 400 });
    }

    const nextStampsCount = customer.stampsCount + 1;
    const isRewardReady = nextStampsCount >= targetStamps;

    // 6. Update customer stamp count
    const updatedCustomer = await db.loyaltyCustomer.update({
      where: { id: customer.id },
      data: {
        stampsCount: nextStampsCount,
        lastStampAt: new Date(),
      },
    });

    // 7. Log operation
    try {
      await db.loyaltyLog.create({
        data: {
          profileId: id,
          phone,
          customerId: customer.id,
          action: 'STAMP_ADDED',
          stampsCount: nextStampsCount,
        },
      });
    } catch (logErr) {
      console.warn('Could not write loyalty log:', logErr);
    }

    return NextResponse.json({
      success: true,
      message: isRewardReady 
        ? 'Félicitations ! Vous avez complété votre carte et débloqué votre récompense !' 
        : 'Tampon ajouté avec succès !',
      stampsCount: updatedCustomer.stampsCount,
      targetStamps,
      isRewardReady,
      rewardsEarned: updatedCustomer.rewardsEarned,
      lastStampAt: updatedCustomer.lastStampAt,
    });
  } catch (error: any) {
    console.error('Error in POST /api/profiles/[id]/loyalty/stamp:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
