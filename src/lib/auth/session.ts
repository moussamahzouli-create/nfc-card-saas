import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
type Role = 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only';
const COOKIE_NAME = 'auth_session';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/**
 * Generate a JWT token for the user.
 */
export function generateToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Get current session user from the request cookies.
 */
export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  // 1. Check Authorization Bearer header (for mobile apps & API clients)
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as SessionUser;
      return decoded;
    } catch {
      return null;
    }
  }

  // 2. Fallback to cookie
  const cookie = req.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return null;

  try {
    const decoded = jwt.verify(cookie.value, JWT_SECRET) as SessionUser;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Set session cookie in response headers.
 */
export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clear session cookie in response headers.
 */
export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Middleware utility to enforce role-based access control.
 */
export async function authorizeRoles(req: NextRequest, allowedRoles: Role[]): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser(req);
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return user;
}
