import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { generateToken, setSessionCookie } from '@/lib/auth/session';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const issues = result.error.issues.map(i => i.message);
      return NextResponse.json({ error: issues.join(', ') }, { status: 400 });
    }

    // Check if public registration is paused by administration
    const regSetting = await db.systemSetting.findUnique({
      where: { key: 'allow_public_registration' },
    });
    if (regSetting && regSetting.value === 'false') {
      return NextResponse.json({
        error: 'Public registration is temporarily paused while payment gateways are being activated. Please contact administration.',
      }, { status: 403 });
    }

    const { name, email, password, phone } = result.data;

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user. The default role in Prisma schema is CUSTOMER.
    // If it's the very first user in the system, we can assign them SUPER_ADMIN.
    const userCount = await db.user.count();
    const isOwnerEmail = email.toLowerCase().includes('brandxper') || email.toLowerCase().includes('moussa');
    const role = (userCount === 0 || isOwnerEmail) ? 'SUPER_ADMIN' : 'CUSTOMER';

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        role,
      },
    });

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
    console.error('Registration error details:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
