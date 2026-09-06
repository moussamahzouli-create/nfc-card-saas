import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/admin/cards/[id]/lost
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch Card with active assignment
    const card = await db.card.findUnique({
      where: { id },
      include: {
        assignments: { where: { status: 'ACTIVE' } },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Role-based Authorization: Admin can do it, or the assigned customer
    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
    const isOwner = card.assignments.some(assign => assign.userId === user.id);

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedCard = await db.card.update({
      where: { id },
      data: { status: 'LOST' },
    });

    await db.auditLog.create({
      data: {
        adminId: user.id,
        action: 'report_lost_card',
        entityType: 'Card',
        entityId: id,
        newData: JSON.stringify({ reportedBy: user.email, cardStatus: updatedCard.status }),
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
