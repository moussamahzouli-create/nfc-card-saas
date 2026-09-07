import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';

// GET /api/admin/settings
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const setting = await db.systemSetting.findUnique({
      where: { key: 'allow_public_registration' },
    });

    // Default to true if not explicitly set
    const allowPublicRegistration = setting ? setting.value === 'true' : true;

    return NextResponse.json({ allowPublicRegistration });
  } catch (error: any) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

const updateSettingsSchema = z.object({
  allowPublicRegistration: z.boolean(),
});

// POST /api/admin/settings
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Super Admin can change system settings' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(', ') }, { status: 400 });
    }

    const { allowPublicRegistration } = parsed.data;

    await db.systemSetting.upsert({
      where: { key: 'allow_public_registration' },
      update: { value: allowPublicRegistration ? 'true' : 'false' },
      create: { key: 'allow_public_registration', value: allowPublicRegistration ? 'true' : 'false' },
    });

    return NextResponse.json({ 
      success: true, 
      allowPublicRegistration,
      message: allowPublicRegistration ? 'Public registration enabled' : 'Public registration paused'
    });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
