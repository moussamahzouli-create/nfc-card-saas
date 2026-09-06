import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import crypto from 'crypto';

interface ImportRow {
  cardNumber: string;
  nfcUid?: string;
  productSku?: string;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length <= 1) {
      return NextResponse.json({ error: 'CSV file is empty or missing headers' }, { status: 400 });
    }

    // Parse header column indexes
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const cardNumIndex = headers.indexOf('cardnumber');
    const nfcUidIndex = headers.indexOf('nfcuid');
    const skuIndex = headers.indexOf('productsku');

    if (cardNumIndex === -1) {
      return NextResponse.json({ error: 'CSV missing required column: cardNumber' }, { status: 400 });
    }

    const importedRows: ImportRow[] = [];
    const failedRows: ImportRow[] = [];

    // Pre-load all existing card numbers and NFC UIDs for duplicate checks
    const existingCards = await db.card.findMany({
      select: { cardNumber: true, nfcUid: true }
    });
    const existingCardNumbers = new Set(existingCards.map(c => c.cardNumber));
    const existingNfcUids = new Set(existingCards.map(c => c.nfcUid).filter(Boolean) as string[]);

    // Pre-load products to map SKU to productId
    const products = await db.product.findMany();
    const productSkuMap = new Map(products.map(p => [p.sku.toLowerCase(), p.id]));

    // Let's parse data rows
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',').map(col => col.trim());
      const cardNumber = columns[cardNumIndex];
      const nfcUid = nfcUidIndex !== -1 ? columns[nfcUidIndex] : undefined;
      const sku = skuIndex !== -1 ? columns[skuIndex] : undefined;

      if (!cardNumber) {
        failedRows.push({ cardNumber: '', nfcUid, productSku: sku, error: 'Empty cardNumber' });
        continue;
      }

      // Check format
      if (!/^[a-zA-Z0-9_-]+$/.test(cardNumber)) {
        failedRows.push({ cardNumber, nfcUid, productSku: sku, error: 'Invalid characters in cardNumber' });
        continue;
      }

      // Duplicate card number check in CSV or Database
      if (existingCardNumbers.has(cardNumber)) {
        failedRows.push({ cardNumber, nfcUid, productSku: sku, error: 'Duplicate cardNumber (already exists)' });
        continue;
      }

      // Duplicate NFC UID check in CSV or Database
      if (nfcUid && existingNfcUids.has(nfcUid)) {
        failedRows.push({ cardNumber, nfcUid, productSku: sku, error: 'Duplicate nfcUid (already exists)' });
        continue;
      }

      importedRows.push({ cardNumber, nfcUid, productSku: sku });
    }

    // Execute batch writes in a transaction if there are valid rows
    let importedCount = 0;
    if (importedRows.length > 0) {
      await db.$transaction(
        importedRows.map(row => {
          const productId = row.productSku ? productSkuMap.get(row.productSku.toLowerCase()) : null;
          const publicToken = crypto.randomBytes(8).toString('hex');
          return db.card.create({
            data: {
              cardNumber: row.cardNumber,
              nfcUid: row.nfcUid || null,
              publicToken,
              productId: productId || null,
              status: 'UNASSIGNED',
            },
          });
        })
      );
      importedCount = importedRows.length;
    }

    // Log admin import action
    await db.auditLog.create({
      data: {
        adminId: user.id,
        action: 'import_cards',
        entityType: 'Card',
        entityId: 'bulk',
        newData: JSON.stringify({ importedCount, failedCount: failedRows.length }),
      },
    });

    return NextResponse.json({
      imported: importedCount,
      failed: failedRows.length,
      skipped: failedRows.length,
      errors: failedRows,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
