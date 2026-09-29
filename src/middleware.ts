import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only'
);

// SaaS platform routes — requires full SaaS session
const SAAS_PROTECTED_PREFIXES = [
  '/dashboard',
  '/admin',
  '/agency',
  '/api/admin',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─── ALWAYS ALLOW ────────────────────────────────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/') ||    // APIs handle their own auth
    pathname.startsWith('/c/') ||      // Customer loyalty cards - always public
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/merchant/') || // Merchant portal handles its own auth server-side
    pathname === '/' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // ─── SAAS PLATFORM PROTECTION ────────────────────────────────────────────
  if (SAAS_PROTECTED_PREFIXES.some(p => pathname.startsWith(p))) {
    const authSession = req.cookies.get('auth_session')?.value;

    if (!authSession) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/auth/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(authSession, JWT_SECRET);
      
      // Merchant-only tokens (role: MERCHANT_PIN) MUST NOT access SaaS routes
      if ((payload as any).role === 'MERCHANT_PIN') {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = '/auth/login';
        loginUrl.searchParams.set('error', 'merchant_cannot_access_platform');
        return NextResponse.redirect(loginUrl);
      }

      return NextResponse.next();
    } catch {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/auth/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
};
