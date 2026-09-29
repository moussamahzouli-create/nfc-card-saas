import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { canAccessProfile } from '@/lib/auth/profile-access';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only';

export interface MerchantLoyaltySession {
  profileId: string;
  role: 'OWNER' | 'ADMIN' | 'MERCHANT_PIN';
  userId?: string;
}

/**
 * Generates a signed merchant session token using the cashier PIN verification.
 */
export function generateMerchantPinToken(profileId: string): string {
  return jwt.sign(
    {
      profileId,
      role: 'MERCHANT_PIN',
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * Verifies if the request is authorized to manage the given profile's loyalty dashboard.
 * Supports:
 * 1. Logged-in SaaS user (profile owner or super admin)
 * 2. Cashier PIN authenticated session (token in cookie or header)
 */
export async function canAccessMerchantLoyalty(profileId: string, req: NextRequest) {
  // 1. Check logged-in SaaS user session
  const user = await getSessionUser(req);
  if (user) {
    const access = await canAccessProfile(profileId, user);
    if (access.allowed && access.profile) {
      // Find the loyalty component for settings
      const loyaltyComp = await db.profileComponent.findFirst({
        where: {
          profileId,
          type: { in: ['Loyalty', 'loyalty', 'LOYALTY'] },
        },
      });

      let settings: any = {};
      if (loyaltyComp?.settingsJson) {
        try { settings = JSON.parse(loyaltyComp.settingsJson); } catch {}
      }

      return {
        allowed: true,
        profile: access.profile,
        loyaltyComp,
        settings,
        role: access.isAdmin ? 'ADMIN' : 'OWNER',
        user,
      };
    }
  }

  // 2. Check Merchant PIN session token (via cookie or header)
  const token = req.cookies.get(`merchant_loyalty_${profileId}`)?.value ||
                req.cookies.get('merchant_loyalty_session')?.value ||
                req.headers.get('x-merchant-token') ||
                (req.headers.get('authorization')?.startsWith('Bearer ') ? req.headers.get('authorization')?.substring(7).trim() : null);

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded && decoded.profileId === profileId) {
        const profile = await db.profile.findUnique({
          where: { id: profileId },
        });

        if (profile) {
          const loyaltyComp = await db.profileComponent.findFirst({
            where: {
              profileId,
              type: { in: ['Loyalty', 'loyalty', 'LOYALTY'] },
            },
          });

          let settings: any = {};
          if (loyaltyComp?.settingsJson) {
            try { settings = JSON.parse(loyaltyComp.settingsJson); } catch {}
          }

          return {
            allowed: true,
            profile,
            loyaltyComp,
            settings,
            role: 'MERCHANT_PIN',
            user: null,
          };
        }
      }
    } catch {
      // invalid token
    }
  }

  return { allowed: false, profile: null, loyaltyComp: null, settings: null, role: null, user: null };
}
