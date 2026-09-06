import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/admin/cards/[id]/history
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // 1. Fetch Audit Logs
    const auditLogs = await db.auditLog.findMany({
      where: { entityId: id },
      orderBy: { timestamp: 'desc' },
    });

    // 2. Fetch NFC Writes
    const nfcWrites = await db.nfcWrite.findMany({
      where: { cardId: id },
      orderBy: { writtenAt: 'desc' },
    });

    // 3. Fetch Assignments
    const assignments = await db.cardAssignment.findMany({
      where: { cardId: id },
      include: {
        user: true,
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Combine and sort events
    const history: any[] = [];

    assignments.forEach(assign => {
      history.push({
        type: 'assignment',
        title: assign.status === 'ACTIVE' ? 'Card Assigned' : 'Card Unassigned / Transferred',
        timestamp: assign.createdAt,
        operator: assign.assignedBy || 'Admin',
        details: assign.profile ? `${assign.profile.name} (${assign.user.email})` : assign.user.email,
        meta: assign,
      });
    });

    nfcWrites.forEach(write => {
      history.push({
        type: 'nfc_write',
        title: `NFC Write Attempt (${write.status})`,
        timestamp: write.writtenAt,
        operator: 'Admin',
        details: `Device: ${write.writerDevice} | Type: ${write.ndefType}`,
        meta: write,
      });
    });

    auditLogs.forEach(log => {
      history.push({
        type: 'audit',
        title: log.action.replace(/_/g, ' ').toUpperCase(),
        timestamp: log.timestamp,
        operator: 'System/Admin',
        details: log.newData || log.oldData || '',
        meta: log,
      });
    });

    // Sort descending by timestamp
    history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ history });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
