import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { profileId, cardCode } = body;

    if (!profileId || !cardCode || !cardCode.trim()) {
      return NextResponse.json({ error: 'profileId and cardCode are required' }, { status: 400 });
    }

    const rawCode = cardCode.trim();
    const cleanCode = rawCode.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    // 1. Verify profile
    const profile = await db.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check ownership if not admin
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN' && profile.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Find or create Card
    let card = await db.card.findFirst({
      where: {
        OR: [
          { cardNumber: rawCode },
          { cardNumber: cleanCode },
          { nfcUid: rawCode },
          { nfcUid: cleanCode },
          { publicToken: cleanCode },
        ],
      },
    });

    if (!card) {
      // Create new Card in database
      const generatedToken = cleanCode.length >= 6 ? cleanCode : `card_${cleanCode}_${crypto.randomBytes(3).toString('hex')}`;
      card = await db.card.create({
        data: {
          cardNumber: rawCode,
          nfcUid: cleanCode,
          publicToken: generatedToken,
          status: 'ASSIGNED',
        },
      });
    } else {
      await db.card.update({
        where: { id: card.id },
        data: {
          status: 'ASSIGNED',
          nfcUid: card.nfcUid || cleanCode,
        },
      });
    }

    // 3. Deactivate any existing active assignment for this card
    await db.cardAssignment.updateMany({
      where: {
        cardId: card.id,
        status: 'ACTIVE',
      },
      data: {
        status: 'INACTIVE',
        unassignedAt: new Date(),
      },
    });

    // 4. Create new Active Assignment linking Card to Profile
    const assignment = await db.cardAssignment.create({
      data: {
        cardId: card.id,
        userId: profile.userId,
        profileId: profile.id,
        status: 'ACTIVE',
        assignedBy: user.email || user.id,
      },
    });

    const directCardUrl = `https://www.brandxpere.com/c/${cleanCode}`;
    const directSlugUrl = `https://www.brandxpere.com/c/${profile.slug}`;

    return NextResponse.json({
      success: true,
      message: 'تم ربط وتفعيل الكارت بالبروفايل بنجاح!',
      card: {
        id: card.id,
        cardNumber: card.cardNumber,
        nfcUid: card.nfcUid,
        directCardUrl,
      },
      profile: {
        id: profile.id,
        name: profile.name,
        slug: profile.slug,
        directSlugUrl,
      },
    });
  } catch (error: any) {
    console.error('Bind code error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
