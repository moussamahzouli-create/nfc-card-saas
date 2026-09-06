import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/admin/cards/[id]/unassign
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // 1. Verify Card exists
    const card = await db.card.findUnique({ where: { id } });
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // 2. Perform Transaction
    const updatedCard = await db.$transaction(async (tx) => {
      // Archive current active assignments
      await tx.cardAssignment.updateMany({
        where: { cardId: id, status: 'ACTIVE' },
        data: {
          status: 'HISTORICAL',
          unassignedAt: new Date(),
        },
      });

      // Update Card state (If ACTIVE, revert to PROVISIONED)
      let targetStatus = card.status;
      if (card.status === 'ACTIVE') {
        targetStatus = 'PROVISIONED';
      }

      return tx.card.update({
        where: { id },
        data: { status: targetStatus },
      });
    });

    await db.auditLog.create({
      data: {
        adminId: user.id,
        action: 'unassign_card',
        entityType: 'Card',
        entityId: id,
        newData: JSON.stringify({ cardStatus: updatedCard.status }),
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
