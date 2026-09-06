import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';

const createBatchSchema = z.object({
  batchNumber: z.string().min(2),
  name: z.string().min(2),
  quantity: z.number().int().positive(),
  productName: z.string().min(2),
  productId: z.string().nullable().optional(),
});

// GET /api/admin/batches
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const batches = await db.cardBatch.findMany({
      include: {
        cards: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const enrichedBatches = batches.map(batch => {
      const cards = batch.cards;
      return {
        id: batch.id,
        batchNumber: batch.batchNumber,
        name: batch.name,
        quantity: batch.quantity,
        productName: batch.productName,
        productId: batch.productId,
        status: batch.status,
        createdAt: batch.createdAt,
        stats: {
          total: cards.length,
          unassigned: cards.filter(c => c.status === 'UNASSIGNED').length,
          provisioned: cards.filter(c => c.status === 'PROVISIONED').length,
          active: cards.filter(c => c.status === 'ACTIVE').length,
          suspended: cards.filter(c => c.status === 'SUSPENDED').length,
          lost: cards.filter(c => c.status === 'LOST').length,
          replaced: cards.filter(c => c.status === 'REPLACED').length,
        }
      };
    });

    return NextResponse.json(enrichedBatches);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/admin/batches
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = createBatchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid batch input parameters' }, { status: 400 });
    }

    const { batchNumber, name, quantity, productName, productId } = result.data;

    // Check unique batchNumber
    const existing = await db.cardBatch.findUnique({ where: { batchNumber } });
    if (existing) {
      return NextResponse.json({ error: 'Batch number already exists' }, { status: 400 });
    }

    const batch = await db.cardBatch.create({
      data: {
        batchNumber,
        name,
        quantity,
        productName,
        productId: productId || null,
        createdBy: user.id,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
