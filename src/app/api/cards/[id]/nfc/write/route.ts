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
        assignments: true
      }
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const isOwner = card.assignments.some(a => a.userId === user.id);
    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { writerDevice, url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Log the NFC writing operation
    const nfcWrite = await db.nfcWrite.create({
      data: {
        cardId: card.id,
        operatorId: user.id,
        writerDevice: writerDevice || 'Web NFC API',
        url,
        status: 'SUCCESS',
      },
    });

    // Update card status to PROVISIONED
    await db.card.update({
      where: { id: card.id },
      data: {
        status: 'ACTIVE', // Instantly active since customer is writing it
      },
    });

    return NextResponse.json({ success: true, nfcWrite });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
