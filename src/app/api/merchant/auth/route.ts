import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateMerchantSession } from '@/lib/auth/merchant-session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, pin } = body;

    if (!slug || !pin) {
      return NextResponse.json({ error: 'Slug et PIN requis' }, { status: 400 });
    }

    // Find profile by slug — supports both LOYALTY type and profiles with loyalty components
    let profile = await db.profile.findFirst({
      where: {
        slug: slug.trim(),
        components: {
          some: { type: { in: ['Loyalty', 'loyalty', 'LOYALTY'] } },
        },
      },
      include: {
        components: {
          where: { type: { in: ['Loyalty', 'loyalty', 'LOYALTY'] } },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Magasin introuvable' }, { status: 404 });
    }

    const loyaltyComp = profile.components[0];
    if (!loyaltyComp) {
      return NextResponse.json({ error: 'Programme de fidélité non configuré' }, { status: 400 });
    }

    let settings: any = {};
    if (loyaltyComp.settingsJson) {
      try { settings = JSON.parse(loyaltyComp.settingsJson); } catch {}
    }

    const configuredPin = (settings.merchantPin || '1234').toString().trim();
    if (pin.toString().trim() !== configuredPin) {
      return NextResponse.json({ error: 'Code PIN incorrect' }, { status: 401 });
    }

    const storeName = settings.storeName || profile.company || profile.name;
    const token = generateMerchantSession(profile.id, profile.slug, storeName);

    const res = NextResponse.json({
      success: true,
      profileId: profile.id,
      slug: profile.slug,
      storeName,
    });

    // Universal merchant session cookie — path: '/' so it's sent on all pages including /merchant/[slug]
    res.cookies.set('merchant_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    // Profile-specific cookie (backwards compat with existing /c/[token]/merchant cashier portal)
    res.cookies.set(`merchant_loyalty_${profile.id}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (error) {
    console.error('Merchant auth error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Déconnecté' });
  res.cookies.set('merchant_session', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}

