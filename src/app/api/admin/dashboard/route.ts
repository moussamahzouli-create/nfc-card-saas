import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';

// GET /api/admin/dashboard
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      total,
      unassigned,
      provisioned,
      active,
      suspended,
      lost,
      replaced,
      recentWrites,
      recentAssignments,
    ] = await Promise.all([
      db.card.count(),
      db.card.count({ where: { status: 'UNASSIGNED' } }),
      db.card.count({ where: { status: 'PROVISIONED' } }),
      db.card.count({ where: { status: 'ACTIVE' } }),
      db.card.count({ where: { status: 'SUSPENDED' } }),
      db.card.count({ where: { status: 'LOST' } }),
      db.card.count({ where: { status: 'REPLACED' } }),
      db.nfcWrite.findMany({
        take: 5,
        orderBy: { writtenAt: 'desc' },
        include: {
          card: true,
        },
      }),
      db.cardAssignment.findMany({
        take: 5,
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        include: {
          card: true,
          user: true,
          profile: true,
        },
      }),
    ]);

    return NextResponse.json({
      kpis: {
        total,
        unassigned,
        provisioned,
        active,
        suspended,
        lost,
        replaced,
      },
      recentWrites,
      recentAssignments,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
