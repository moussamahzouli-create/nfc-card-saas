import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import { Suspense } from 'react';
import MerchantLoginClient from './MerchantLoginClient';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only'
);

export default async function MerchantLoginPage() {
  // Only redirect if session is VALID — do NOT redirect on corrupted/expired cookies
  const cookieStore = await cookies();
  const merchantSession = cookieStore.get('merchant_session')?.value;

  if (merchantSession) {
    try {
      const { payload } = await jwtVerify(merchantSession, JWT_SECRET) as any;
      // Only redirect if token is genuinely valid and has required fields
      if (payload?.role === 'MERCHANT_PIN' && payload?.slug) {
        redirect(`/merchant/${payload.slug}`);
      }
    } catch {
      // Invalid / expired token — show login form (do NOT redirect)
    }
  }

  // Render the client-side PIN login form
  return (
    <Suspense>
      <MerchantLoginClient />
    </Suspense>
  );
}
