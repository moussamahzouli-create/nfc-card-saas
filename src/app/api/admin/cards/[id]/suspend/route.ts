import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/admin/cards/[id]/suspend
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const card = await db.card.findUnique({ where: { id } });
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const updatedCard = await db.card.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });

    await db.auditLog.create({
      data: {
        adminId: user.id,
        action: 'suspend_card',
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
