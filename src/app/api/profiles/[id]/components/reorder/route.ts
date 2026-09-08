import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { canAccessProfile } from '@/lib/auth/profile-access';
import { z } from 'zod';

const reorderSchema = z.object({
  componentIds: z.array(z.string()),
});

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/profiles/[id]/components/reorder
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { allowed, profile } = await canAccessProfile(id, user);
    if (!allowed || !profile) {
      return NextResponse.json({ error: 'Profile not found or access denied' }, { status: 404 });
    }

    const body = await req.json();
    const result = reorderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Array of component IDs is required' }, { status: 400 });
    }

    const { componentIds } = result.data;

    // Update in batch transaction
    const updates = componentIds.map((componentId, idx) =>
      db.profileComponent.update({
        where: { id: componentId, profileId: id },
        data: { sortOrder: idx },
      })
    );

    await db.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
