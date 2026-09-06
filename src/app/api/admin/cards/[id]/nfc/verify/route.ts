import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { generateCardUrl } from '@/lib/nfc/url';
import { z } from 'zod';

const nfcVerifySchema = z.object({
  scannedUrl: z.string().url(),
});

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/admin/cards/[id]/nfc/verify
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = nfcVerifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // 1. Verify card exists
    const card = await db.card.findUnique({
      where: { id },
      include: {
        assignments: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // 2. Expected URL
    const expectedUrl = generateCardUrl(card.publicToken);
    const actualUrl = result.data.scannedUrl.trim();

    const isMatch = expectedUrl.toLowerCase() === actualUrl.toLowerCase();

    // 3. Log results
    const writeLog = await db.nfcWrite.findFirst({
      where: { cardId: id, status: 'WRITTEN' },
      orderBy: { writtenAt: 'desc' },
    });

    if (writeLog) {
      await db.nfcWrite.update({
        where: { id: writeLog.id },
        data: {
          status: isMatch ? 'VERIFIED' : 'FAILED',
          errorMessage: isMatch ? null : `Verification failed. Expected ${expectedUrl}, Scanned ${actualUrl}`,
          verifiedAt: new Date(),
        },
      });
    }

    // 4. If verification succeeded, progress card state
    let targetStatus = card.status;
    if (isMatch) {
      const activeAssignment = card.assignments[0];
      targetStatus = activeAssignment ? 'ACTIVE' : 'PROVISIONED';
      
      await db.card.update({
        where: { id },
        data: {
          status: targetStatus,
          activatedAt: targetStatus === 'ACTIVE' ? new Date() : undefined,
        },
      });
    }

    await db.auditLog.create({
      data: {
        adminId: user.id,
        action: isMatch ? 'nfc_verify_success' : 'nfc_verify_failed',
        entityType: 'Card',
        entityId: id,
        newData: JSON.stringify({ isMatch, expectedUrl, actualUrl, targetStatus }),
      },
    });

    return NextResponse.json({
      success: isMatch,
      expectedUrl,
      scannedUrl: actualUrl,
      status: targetStatus,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
