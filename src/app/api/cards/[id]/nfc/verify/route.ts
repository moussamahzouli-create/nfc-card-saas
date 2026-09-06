import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const card = await db.card.findUnique({
      where: { id },
      include: { 
        assignments: true,
        nfcWrites: { 
          orderBy: { writtenAt: 'desc' },
          take: 1 
        } 
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const isOwner = card.assignments.some(a => a.userId === user.id);
    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const latestWrite = card.nfcWrites[0];
    if (latestWrite) {
      await db.nfcWrite.update({
        where: { id: latestWrite.id },
        data: {
          verifiedAt: new Date(),
        },
      });
    }

    // Transition the card to ACTIVE state if it was newly provisioned
    const updatedCard = await db.card.update({
      where: { id: card.id },
      data: {
        status: 'ACTIVE',
        activatedAt: card.activatedAt || new Date(),
      },
    });

    return NextResponse.json({ success: true, card: updatedCard });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
