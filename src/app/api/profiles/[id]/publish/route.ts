import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';

import { canAccessProfile } from '@/lib/auth/profile-access';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/profiles/[id]/publish
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { allowed, profile } = await canAccessProfile(id, user);
    if (!allowed || !profile) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const updated = await db.profile.update({
      where: { id },
      data: { isPublic: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
