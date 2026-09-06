import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  sku: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  currency: z.string().min(3).optional(),
  nfcType: z.string().min(2).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  variants: z.array(z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1),
    sku: z.string().min(1),
    price: z.number().int().min(0),
    stock: z.number().int().min(0),
    status: z.enum(['ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED']).optional(),
  })).optional(),
});

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = updateProductSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues.map(i => i.message).join(', ') }, { status: 400 });
    }

    const { variants, ...productFields } = result.data;

    const updatedProduct = await db.$transaction(async (tx) => {
      // 1. Update main product fields
      const p = await tx.product.update({
        where: { id },
        data: productFields,
      });

      // 2. Manage variants (Upsert/Delete)
      if (variants) {
        for (const variant of variants) {
          if (variant.id) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                name: variant.name,
                sku: variant.sku,
                price: variant.price,
                stock: variant.stock,
                status: variant.status || 'ACTIVE',
              },
            });
          } else {
            await tx.productVariant.create({
              data: {
                productId: id,
                name: variant.name,
                sku: variant.sku,
                price: variant.price,
                stock: variant.stock,
                status: variant.status || 'ACTIVE',
              },
            });
          }
        }
      }
      return p;
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await db.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
