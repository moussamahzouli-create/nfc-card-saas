import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { generateToken, setSessionCookie } from '@/lib/auth/session';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { email, password } = result.data;

    // Find user — case-insensitive OR lookup for SQLite
    const user = await db.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { email: email.toUpperCase() },
        ]
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account is suspended or inactive' }, { status: 403 });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    // Create session token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    setSessionCookie(response, token);
    return response;
  } catch (error: any) {
    console.error('Login error details:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
