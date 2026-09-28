import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

const lookupSchema = z.object({
  phone: z.string().min(6, 'Phone number is too short').max(25),
  customerName: z.string().max(100).optional().nullable(),
});

export function cleanPhone(raw: string): string {
  if (!raw) return '';
  // Convert Arabic and Persian numerals to standard ASCII digits
  let cleaned = raw
    .replace(/[٠-٩]/g, d => (d.charCodeAt(0) - 1632).toString())
    .replace(/[۰-۹]/g, d => (d.charCodeAt(0) - 1776).toString())
    .replace(/[\s\-\.\(\)]/g, '')
    .trim();

  // Normalize Moroccan international formats to standard local format (06..., 07...)
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

// GET /api/profiles/[id]/loyalty?phone=0612345678
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const rawPhone = searchParams.get('phone');

    // 1. Verify profile exists
    const profile = await db.profile.findUnique({
      where: { id },
      include: {
        components: {
          where: {
            type: {
              in: ['Loyalty', 'loyalty', 'LOYALTY'],
            },
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
      return NextResponse.json({ enabled: false, message: 'Loyalty program is not active for this profile' });
    }

    let settings: any = {};
    if (loyaltyComponent.settingsJson) {
      try {
        settings = JSON.parse(loyaltyComponent.settingsJson);
      } catch {}
    }

    const targetStamps = Number(settings.targetStamps) || 10;
    const rewardText = settings.rewardText || 'Cadeau ou réduction exclusive';
    const stampIcon = settings.stampIcon || 'coffee';
    const title = loyaltyComponent.title || 'Carte de Fidélité';
    const cooldownMinutes = settings.cooldownMinutes !== undefined ? Number(settings.cooldownMinutes) : 15;

    let customerData = null;
    if (rawPhone) {
      const phone = cleanPhone(rawPhone);
      const customer = await db.loyaltyCustomer.findUnique({
        where: {
          profileId_phone: {
            profileId: id,
            phone,
          },
        },
      });

      if (customer) {
        customerData = {
          phone: customer.phone,
          customerName: customer.customerName,
          stampsCount: customer.stampsCount,
          rewardsEarned: customer.rewardsEarned,
          lastStampAt: customer.lastStampAt,
          isRewardReady: customer.stampsCount >= targetStamps,
        };
      }
    }

    // Never return merchantPin in public GET request!
    return NextResponse.json({
      enabled: true,
      componentId: loyaltyComponent.id,
      title,
      targetStamps,
      rewardText,
      stampIcon,
      cooldownMinutes,
      customer: customerData,
    });
  } catch (error: any) {
    console.error('Error in GET /api/profiles/[id]/loyalty:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/profiles/[id]/loyalty - Enroll or lookup customer by phone
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = lookupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid data' }, { status: 400 });
    }

    const phone = cleanPhone(parsed.data.phone);
    const customerName = parsed.data.customerName?.trim() || null;

    // Verify profile & component
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
    const targetStamps = Number(settings.targetStamps) || 10;

    // Find or create customer
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
          customerName,
          stampsCount: 0,
          rewardsEarned: 0,
        },
      });
    } else if (customerName && customer.customerName !== customerName) {
      customer = await db.loyaltyCustomer.update({
        where: { id: customer.id },
        data: { customerName },
      });
    }

    return NextResponse.json({
      success: true,
      customer: {
        phone: customer.phone,
        customerName: customer.customerName,
        stampsCount: customer.stampsCount,
        rewardsEarned: customer.rewardsEarned,
        lastStampAt: customer.lastStampAt,
        isRewardReady: customer.stampsCount >= targetStamps,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/profiles/[id]/loyalty:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
