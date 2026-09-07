import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const setting = await db.systemSetting.findUnique({
      where: { key: 'allow_public_registration' },
    });

    // Default to true if not explicitly set
    const allowPublicRegistration = setting ? setting.value === 'true' : true;

    return NextResponse.json({ allowPublicRegistration });
  } catch (error) {
    // Fail open or closed gracefully
    return NextResponse.json({ allowPublicRegistration: true });
  }
}
