import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';

const nfcWriteSchema = z.object({
  writerDevice: z.string().min(1),
  url: z.string().url(),
});

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/admin/cards/[id]/nfc/write
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = nfcWriteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // 1. Verify card exists
    const card = await db.card.findUnique({ where: { id } });
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // 2. Concurrency check: Ensure card isn't currently being written by another operator in the last 15 seconds
    const recentAttempt = await db.nfcWrite.findFirst({
      where: {
        cardId: id,
        status: 'STARTED',
        writtenAt: { gte: new Date(Date.now() - 15000) },
      },
    });

    if (recentAttempt && recentAttempt.operatorId !== user.id) {
      return NextResponse.json({ error: 'Card is currently being provisioned by another administrator.' }, { status: 409 });
    }

    // 3. Log attempt
    const writeLog = await db.nfcWrite.create({
      data: {
        cardId: id,
        operatorId: user.id,
        writerDevice: result.data.writerDevice,
        url: result.data.url,
        status: 'WRITTEN',
        ndefType: 'URI',
      },
    });

    // 4. Update card status to PROVISIONED
    const updatedCard = await db.card.update({
      where: { id },
      data: { status: 'PROVISIONED' },
    });

    await db.auditLog.create({
      data: {
        adminId: user.id,
        action: 'nfc_write_success',
        entityType: 'Card',
        entityId: id,
        newData: JSON.stringify(writeLog),
      },
    });

    return NextResponse.json({ success: true, card: updatedCard, log: writeLog });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
