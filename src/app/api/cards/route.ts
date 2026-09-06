import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';

// GET /api/cards
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all cards actively assigned to the customer user
    const cards = await db.card.findMany({
      where: {
        assignments: {
          some: {
            userId: user.id,
            status: 'ACTIVE',
          },
        },
      },
      include: {
        product: true,
        assignments: {
          where: { status: 'ACTIVE' },
          include: {
            profile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(cards);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
