import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';

const reorderSchema = z.object({
  componentIds: z.array(z.string()),
});

interface Params {
  params: Promise<{
    id: string;
  }>;
}

async function checkProfileAccess(profileId: string, userId: string) {
  const profile = await db.profile.findUnique({
    where: { id: profileId },
  });
  if (!profile) return null;
  if (profile.userId === userId) return profile;
  if (profile.organizationId) {
    const member = await db.organizationMember.findFirst({
      where: { organizationId: profile.organizationId, userId: userId },
    });
    if (member) return profile;
  }
  return null;
}

// POST /api/profiles/[id]/components/reorder
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await checkProfileAccess(id, user.id);
    if (!profile) {
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
