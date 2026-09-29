import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only';
const MERCHANT_COOKIE = 'merchant_session';

export interface MerchantSessionPayload {
  profileId: string;
  slug: string;
  storeName: string;
  role: 'MERCHANT_PIN';
  iat?: number;
  exp?: number;
}

export function generateMerchantSession(profileId: string, slug: string, storeName: string): string {
  return jwt.sign(
    { profileId, slug, storeName, role: 'MERCHANT_PIN' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export async function getMerchantSession(req: NextRequest): Promise<MerchantSessionPayload | null> {
  // Check the universal merchant session cookie first
  const universalCookie = req.cookies.get(MERCHANT_COOKIE)?.value;
  if (universalCookie) {
    try {
      const decoded = jwt.verify(universalCookie, JWT_SECRET) as MerchantSessionPayload;
      if (decoded?.profileId && decoded?.role === 'MERCHANT_PIN') return decoded;
    } catch {}
  }

  // Fallback: check profile-specific cookies
  const allCookies = req.cookies.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('merchant_loyalty_')) {
      try {
        const decoded = jwt.verify(cookie.value, JWT_SECRET) as any;
        if (decoded?.profileId && decoded?.role === 'MERCHANT_PIN') {
          // Fetch profile info
          const profile = await db.profile.findUnique({
            where: { id: decoded.profileId },
            select: { id: true, slug: true, company: true, name: true }
          });
          if (profile) {
            return {
              profileId: decoded.profileId,
              slug: profile.slug,
              storeName: profile.company || profile.name,
              role: 'MERCHANT_PIN',
            };
          }
        }
      } catch {}
    }
  }

  return null;
}

export async function requireMerchantSession(req: NextRequest): Promise<MerchantSessionPayload | null> {
  const session = await getMerchantSession(req);
  return session;
}
