import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';

const updateCardSchema = z.object({
  cardNumber: z.string().min(2).optional(),
  nfcUid: z.string().nullable().optional(),
  productId: z.string().nullable().optional(),
  batchId: z.string().nullable().optional(),
  status: z.enum(['UNASSIGNED', 'PROVISIONED', 'ACTIVE', 'SUSPENDED', 'LOST', 'REPLACED', 'EXPIRED', 'DELETED']).optional(),
});

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/admin/cards/[id]
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const card = await db.card.findUnique({
      where: { id },
      include: {
        product: true,
        batch: true,
        assignments: {
          include: {
            user: true,
            profile: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        nfcWrites: {
          orderBy: { writtenAt: 'desc' },
        },
        cardEvents: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/admin/cards/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = updateCardSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid card input parameters' }, { status: 400 });
    }

    const card = await db.card.findUnique({ where: { id } });
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Server-side State Machine validation check
    if (result.data.status) {
      const current = card.status;
      const target = result.data.status;
      
      // Enforce lifecycle rules
      if (current === 'UNASSIGNED' && target !== 'PROVISIONED' && target !== 'UNASSIGNED') {
        return NextResponse.json({ error: 'Unassigned cards must be provisioned before activation' }, { status: 400 });
      }
      if (current === 'PROVISIONED' && target === 'ACTIVE') {
        // Need assignment check
        const activeAssignment = await db.cardAssignment.findFirst({
          where: { cardId: id, status: 'ACTIVE' },
        });
        if (!activeAssignment) {
          return NextResponse.json({ error: 'Card must be assigned to a profile before activation' }, { status: 400 });
        }
      }
    }

    const updatedCard = await db.card.update({
      where: { id },
      data: {
        cardNumber: result.data.cardNumber,
        nfcUid: result.data.nfcUid === undefined ? undefined : result.data.nfcUid,
        productId: result.data.productId === undefined ? undefined : result.data.productId,
        batchId: result.data.batchId === undefined ? undefined : result.data.batchId,
        status: result.data.status,
      },
    });

    await db.auditLog.create({
      data: {
        adminId: user.id,
        action: 'update_card',
        entityType: 'Card',
        entityId: id,
        newData: JSON.stringify(updatedCard),
        oldData: JSON.stringify(card),
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/cards/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Check if card exists
    const card = await db.card.findUnique({ where: { id } });
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    await db.card.delete({ where: { id } });

    await db.auditLog.create({
      data: {
        adminId: user.id,
        action: 'delete_card',
        entityType: 'Card',
        entityId: id,
        oldData: JSON.stringify(card),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
