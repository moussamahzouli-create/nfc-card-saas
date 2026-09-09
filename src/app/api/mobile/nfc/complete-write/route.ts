import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';

const completeWriteSchema = z.object({
  profileId: z.string().optional(),
  profileSlug: z.string().optional(),
  cardId: z.string().optional(),
  nfcUid: z.string().min(4),
  chipType: z.enum(['NTAG213', 'NTAG215', 'NTAG216', 'GENERIC_NTAG', 'UNKNOWN']).default('NTAG213'),
  lockType: z.enum(['PASSWORD_PROTECTED', 'PERMANENT_READ_ONLY', 'UNLOCKED']).default('PASSWORD_PROTECTED'),
  lockPinUsed: z.string().optional(),
});

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = completeWriteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { profileId, profileSlug, cardId, nfcUid, chipType, lockType, lockPinUsed } = parsed.data;

    // 1. Find profile
    let targetProfile = null;
    if (profileId) {
      targetProfile = await db.profile.findUnique({ where: { id: profileId } });
    } else if (profileSlug) {
      targetProfile = await db.profile.findUnique({ where: { slug: profileSlug } });
    }

    // 2. Find or create Card record
    let targetCard = null;
    if (cardId) {
      targetCard = await db.card.findUnique({ where: { id: cardId } });
    } else if (targetProfile) {
      // Find card currently assigned to this profile
      const assignment = await db.cardAssignment.findFirst({
        where: { profileId: targetProfile.id, status: 'ACTIVE' },
        include: { card: true },
      });
      if (assignment?.card) {
        targetCard = assignment.card;
      }
    }

    // If no card exists, create one with auto-generated serial number
    if (!targetCard) {
      const randomCode = Math.floor(100000 + Math.random() * 900000);
      const cardNumber = `BX-${chipType}-${randomCode}`;
      const publicToken = `bx_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

      targetCard = await db.card.create({
        data: {
          cardNumber,
          publicToken,
          nfcUid,
          status: 'ACTIVE',
          activatedAt: new Date(),
        },
      });

      // Assign card to user & profile
      if (targetProfile) {
        await db.cardAssignment.create({
          data: {
            cardId: targetCard.id,
            userId: targetProfile.userId,
            profileId: targetProfile.id,
            status: 'ACTIVE',
            assignedBy: user.id,
          },
        });
      }
    } else {
      // Update existing card with NFC UID and activated status
      targetCard = await db.card.update({
        where: { id: targetCard.id },
        data: {
          nfcUid,
          status: 'ACTIVE',
          activatedAt: targetCard.activatedAt || new Date(),
        },
      });
    }

    // 3. Record NfcWrite event
    try {
      await db.nfcWrite.create({
        data: {
          cardId: targetCard.id,
          operatorId: user.id,
          writerDevice: `Brandxpere Mobile (${chipType} - ${lockType})`,
          url: targetProfile ? `https://www.brandxpere.com/c/${targetProfile.slug}` : targetCard.cardNumber,
          ndefType: 'URI',
          status: 'SUCCESS',
          verifiedAt: new Date(),
        },
      });
    } catch (e) {
      console.warn('Could not record nfcWrite log, continuing:', e);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'تم تأكيد برمجة وقفل الكارت بنجاح وربطه بالمنصة السحابية',
        card: {
          id: targetCard.id,
          cardNumber: targetCard.cardNumber,
          nfcUid: targetCard.nfcUid,
          status: targetCard.status,
          lockType,
          chipType,
        },
        profile: targetProfile ? {
          id: targetProfile.id,
          name: targetProfile.name,
          slug: targetProfile.slug,
          targetUrl: `https://www.brandxpere.com/c/${targetProfile.slug}`,
        } : null,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Complete write error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
