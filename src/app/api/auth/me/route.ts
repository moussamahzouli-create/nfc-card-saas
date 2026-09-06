import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, generateToken, setSessionCookie } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const sessionUser = await getSessionUser(req);
  if (!sessionUser) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  let user = { ...sessionUser };

  // If the logged in user is the owner, ensure they are SUPER_ADMIN
  const isOwner =
    user.email.toLowerCase().includes('brandxper') ||
    user.email.toLowerCase().includes('moussa');

  if (isOwner && user.role !== 'SUPER_ADMIN') {
    try {
      await db.user.update({
        where: { id: user.id },
        data: { role: 'SUPER_ADMIN' },
      });
      user.role = 'SUPER_ADMIN';
    } catch (e) {
      console.error('Failed to auto-promote owner role:', e);
    }
  }

  const response = NextResponse.json({
    authenticated: true,
    user,
    ...user, // Support both data.user and direct data access
  });

  if (isOwner && sessionUser.role !== 'SUPER_ADMIN') {
    const freshToken = generateToken(user);
    setSessionCookie(response, freshToken);
  }

  return response;
}
