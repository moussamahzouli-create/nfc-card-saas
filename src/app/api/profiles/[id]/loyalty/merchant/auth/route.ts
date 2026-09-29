import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateMerchantPinToken } from '@/lib/auth/merchant-loyalty-access';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/profiles/[id]/loyalty/merchant/auth - Verify cashier PIN and issue merchant session
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const pin = (body?.pin || '').toString().trim();

    if (!pin) {
      return NextResponse.json({ error: 'Code PIN requis' }, { status: 400 });
    }

    // 1. Fetch profile and loyalty component
    const profile = await db.profile.findUnique({
      where: { id },
      include: {
        components: {
          where: {
            type: { in: ['Loyalty', 'loyalty', 'LOYALTY'] },
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
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

    if (pin !== configuredPin) {
      return NextResponse.json({ error: 'Code PIN incorrect' }, { status: 401 });
    }

    // PIN is valid! Generate merchant token
    const token = generateMerchantPinToken(id);

    const res = NextResponse.json({
      success: true,
      token,
      profile: {
        id: profile.id,
        name: profile.name,
        company: profile.company,
        slug: profile.slug,
      },
    });

    // Set HTTP-only secure cookie for this merchant profile
    res.cookies.set(`merchant_loyalty_${id}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (error: any) {
    console.error('Error in POST /api/profiles/[id]/loyalty/merchant/auth:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// DELETE /api/profiles/[id]/loyalty/merchant/auth - Logout merchant session
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const res = NextResponse.json({ success: true, message: 'Déconnecté avec succès' });
    res.cookies.set(`merchant_loyalty_${id}`, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
