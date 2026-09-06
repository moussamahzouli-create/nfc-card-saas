import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import crypto from 'crypto';
import { z } from 'zod';

const createCardSchema = z.object({
  cardNumber: z.string().min(2),
  nfcUid: z.string().nullable().optional(),
  productId: z.string().nullable().optional(),
  batchId: z.string().nullable().optional(),
});

// GET /api/admin/cards
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const productId = searchParams.get('productId') || '';
    const batchId = searchParams.get('batchId') || '';
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Build Prisma query filters
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { cardNumber: { contains: search, mode: 'insensitive' } },
        { nfcUid: { contains: search, mode: 'insensitive' } },
        { publicToken: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }
    if (productId) {
      whereClause.productId = productId;
    }
    if (batchId) {
      whereClause.batchId = batchId;
    }

    const [cards, total] = await Promise.all([
      db.card.findMany({
        where: whereClause,
        include: {
          product: true,
          batch: true,
          assignments: {
            where: { status: 'ACTIVE' },
            include: {
              user: true,
              profile: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.card.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      cards,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/admin/cards
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = createCardSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid card input parameters' }, { status: 400 });
    }

    const { cardNumber, nfcUid, productId, batchId } = result.data;

    // Check unique card number
    const existingCard = await db.card.findUnique({ where: { cardNumber } });
    if (existingCard) {
      return NextResponse.json({ error: 'Card number already registered' }, { status: 400 });
    }

    // Check unique NFC UID if provided
    if (nfcUid) {
      const existingUid = await db.card.findUnique({ where: { nfcUid } });
      if (existingUid) {
        return NextResponse.json({ error: 'NFC UID already registered' }, { status: 400 });
      }
    }

    // Generate secure random public token (8 cryptographically secure bytes -> 16 URL safe hex characters)
    const publicToken = crypto.randomBytes(8).toString('hex');

    const card = await db.card.create({
      data: {
        cardNumber,
        nfcUid: nfcUid || null,
        publicToken,
        productId: productId || null,
        batchId: batchId || null,
        status: 'UNASSIGNED',
      },
    });

    // Log admin audit action
    await db.auditLog.create({
      data: {
        adminId: user.id,
        action: 'create_card',
        entityType: 'Card',
        entityId: card.id,
        newData: JSON.stringify(card),
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
