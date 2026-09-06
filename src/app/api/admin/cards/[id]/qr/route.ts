import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateCardUrl } from '@/lib/nfc/url';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/admin/cards/[id]/qr
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const card = await db.card.findUnique({ where: { id } });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const targetUrl = generateCardUrl(card.publicToken);

    return NextResponse.json({
      targetUrl,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
