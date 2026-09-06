import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';

const assignSchema = z.object({
  profileId: z.string().uuid(),
});

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/admin/cards/[id]/assign
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = assignSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 });
    }

    const { profileId } = result.data;

    // 1. Verify Card exists
    const card = await db.card.findUnique({ where: { id } });
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // 2. Verify Profile exists
    const profile = await db.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 3. Prevent assigning a profile that is already actively linked to another card
    const existingActiveCard = await db.cardAssignment.findFirst({
      where: { profileId, status: 'ACTIVE', cardId: { not: id } },
    });
    if (existingActiveCard) {
      return NextResponse.json({ error: 'This profile is already actively assigned to another card.' }, { status: 400 });
    }

    // Verify client subscription card limits
    const { canCreateCard } = await import('@/lib/billing/limits');
    const allowed = await canCreateCard(profile.userId);
    if (!allowed) {
      return NextResponse.json({ error: 'Customer card assignment limit reached for their active subscription plan.' }, { status: 403 });
    }

    // 4. Perform Transaction
    const updatedCard = await db.$transaction(async (tx) => {
      // Archive existing active assignments for this card
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

      // Update Card state (if PROVISIONED, escalate to ACTIVE)
      let targetStatus = card.status;
      if (card.status === 'PROVISIONED') {
        targetStatus = 'ACTIVE';
      }

      return tx.card.update({
        where: { id },
        data: {
          status: targetStatus,
          activatedAt: targetStatus === 'ACTIVE' ? new Date() : undefined,
        },
      });
    });

    await db.auditLog.create({
      data: {
        adminId: user.id,
        action: 'assign_card',
        entityType: 'Card',
        entityId: id,
        newData: JSON.stringify({ profileId, cardStatus: updatedCard.status }),
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
