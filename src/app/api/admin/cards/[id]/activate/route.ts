import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/admin/cards/[id]/activate
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const card = await db.card.findUnique({
      where: { id },
      include: {
        assignments: { where: { status: 'ACTIVE' } },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    if (card.assignments.length === 0) {
      return NextResponse.json({ error: 'Card must be assigned to a profile before activation' }, { status: 400 });
    }

    const updatedCard = await db.card.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        activatedAt: card.activatedAt || new Date(),
      },
    });

    await db.auditLog.create({
      data: {
        adminId: user.id,
        action: 'activate_card',
        entityType: 'Card',
        entityId: id,
        newData: JSON.stringify(updatedCard),
        oldData: JSON.stringify(card),
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
