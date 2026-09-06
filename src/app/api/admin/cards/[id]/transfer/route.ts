import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';

const transferSchema = z.object({
  profileId: z.string().uuid(),
});

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/admin/cards/[id]/transfer
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = transferSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 });
    }

    const { profileId } = result.data;

    // 1. Verify Card exists
    const card = await db.card.findUnique({
      where: { id },
      include: {
        assignments: { where: { status: 'ACTIVE' } },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // 2. Verify Profile exists
    const profile = await db.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const previousAssignment = card.assignments[0];

    // 3. Perform Transaction
    const updatedCard = await db.$transaction(async (tx) => {
      // Archive current active assignments
      await tx.cardAssignment.updateMany({
        where: { cardId: id, status: 'ACTIVE' },
        data: {
          status: 'HISTORICAL',
          unassignedAt: new Date(),
        },
      });

      // Create new assignment
      await tx.cardAssignment.create({
        data: {
          cardId: id,
          profileId,
          userId: profile.userId,
          assignedBy: user.id,
          status: 'ACTIVE',
        },
      });

      // Keep status ACTIVE
      return tx.card.update({
        where: { id },
        data: { status: 'ACTIVE' },
      });
    });

    // Log detailed historical audit trail of transfer
    await db.auditLog.create({
      data: {
        adminId: user.id,
        action: 'transfer_card',
        entityType: 'Card',
        entityId: id,
        newData: JSON.stringify({
          previousProfileId: previousAssignment?.profileId || null,
          newProfileId: profileId,
          cardStatus: updatedCard.status,
        }),
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
