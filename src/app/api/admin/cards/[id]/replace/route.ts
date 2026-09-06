import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';

const replaceSchema = z.object({
  newCardId: z.string().uuid(),
});

interface Params {
  params: Promise<{
    id: string; // Old Card ID
  }>;
}

// POST /api/admin/cards/[id]/replace
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: oldCardId } = await params;
    const body = await req.json();
    const result = replaceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid newCardId' }, { status: 400 });
    }

    const { newCardId } = result.data;

    // 1. Fetch old card
    const oldCard = await db.card.findUnique({
      where: { id: oldCardId },
      include: {
        assignments: { where: { status: 'ACTIVE' } },
      },
    });

    if (!oldCard) {
      return NextResponse.json({ error: 'Old card not found' }, { status: 404 });
    }

    const activeAssignment = oldCard.assignments[0];
    if (!activeAssignment) {
      return NextResponse.json({ error: 'Old card has no active assignment to replace' }, { status: 400 });
    }

    // 2. Fetch new card
    const newCard = await db.card.findUnique({ where: { id: newCardId } });
    if (!newCard) {
      return NextResponse.json({ error: 'New card not found' }, { status: 404 });
    }

    if (newCard.status === 'ACTIVE') {
      return NextResponse.json({ error: 'New card is already actively assigned' }, { status: 400 });
    }

    // 3. Perform Transaction
    const results = await db.$transaction(async (tx) => {
      // Archive old assignment
      await tx.cardAssignment.update({
        where: { id: activeAssignment.id },
        data: {
          status: 'HISTORICAL',
          unassignedAt: new Date(),
        },
      });

      // Update old card status to REPLACED
      const updatedOldCard = await tx.card.update({
        where: { id: oldCardId },
        data: { status: 'REPLACED' },
      });

      // Create new assignment
      await tx.cardAssignment.create({
        data: {
          cardId: newCardId,
          profileId: activeAssignment.profileId,
          userId: activeAssignment.userId,
          assignedBy: user.id,
          status: 'ACTIVE',
        },
      });

      // Update new card status to ACTIVE (or keep provisioned depending on state)
      const updatedNewCard = await tx.card.update({
        where: { id: newCardId },
        data: {
          status: 'ACTIVE',
          activatedAt: new Date(),
        },
      });

      return { oldCard: updatedOldCard, newCard: updatedNewCard };
    });

    await db.auditLog.create({
      data: {
        adminId: user.id,
        action: 'replace_card',
        entityType: 'Card',
        entityId: oldCardId,
        newData: JSON.stringify({
          oldCardId,
          newCardId,
          profileId: activeAssignment.profileId,
        }),
      },
    });

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
