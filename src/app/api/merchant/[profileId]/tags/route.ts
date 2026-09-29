import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { canAccessMerchantLoyalty } from '@/lib/auth/merchant-loyalty-access';

interface Params { params: Promise<{ profileId: string }>; }

export async function GET(req: NextRequest, { params }: Params) {
  const { profileId } = await params;
  const auth = await canAccessMerchantLoyalty(profileId, req);
  if (!auth.allowed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customerId');

  const tags = await db.customerTag.findMany({
    where: { profileId, ...(customerId ? { customerId } : {}) },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ tags });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { profileId } = await params;
  const auth = await canAccessMerchantLoyalty(profileId, req);
  if (!auth.allowed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { customerId, tag } = await req.json();
  if (!customerId || !tag) return NextResponse.json({ error: 'customerId and tag required' }, { status: 400 });

  // Ensure customer belongs to this profile
  const customer = await db.loyaltyCustomer.findFirst({ where: { id: customerId, profileId } });
  if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

  const created = await db.customerTag.upsert({
    where: { customerId_tag: { customerId, tag: tag.trim().toUpperCase() } },
    update: {},
    create: { profileId, customerId, tag: tag.trim().toUpperCase() },
  });
  return NextResponse.json({ tag: created });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { profileId } = await params;
  const auth = await canAccessMerchantLoyalty(profileId, req);
  if (!auth.allowed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { customerId, tag } = await req.json();
  await db.customerTag.deleteMany({ where: { profileId, customerId, tag: tag.trim().toUpperCase() } });
  return NextResponse.json({ success: true });
}
