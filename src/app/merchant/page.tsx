import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only'
);

export default async function MerchantIndexPage() {
  const cookieStore = await cookies();
  const merchantSession = cookieStore.get('merchant_session')?.value;

  if (!merchantSession) {
    redirect('/merchant/login');
  }

  try {
    const { payload } = await jwtVerify(merchantSession, JWT_SECRET) as any;
    if (payload?.slug) {
      redirect(`/merchant/${payload.slug}`);
    }
  } catch {
    // Invalid session
  }

  redirect('/merchant/login');
}
