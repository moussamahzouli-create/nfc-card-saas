import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import {
  generateUniqueShortCode,
  validateCustomCode,
  validateDestinationUrl,
} from '@/lib/short-links';

/**
 * GET /api/short-links
 * Fetch all short links belonging to the authenticated user (or all for admins).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.trim().toLowerCase();

    const isAdmin = session.role === 'SUPER_ADMIN' || session.role === 'ADMIN';

    const whereClause: any = isAdmin ? {} : { userId: session.id };

    if (search) {
      whereClause.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { originalUrl: { contains: search, mode: 'insensitive' } },
      ];
    }

    const links = await db.shortLink.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error fetching short links:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/short-links
 * Create a new dynamic short link for NFC or QR.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { originalUrl, title, customCode } = body;

    // 1. Validate destination URL
    const urlValidation = validateDestinationUrl(originalUrl || '');
    if (!urlValidation.valid || !urlValidation.sanitizedUrl) {
      return NextResponse.json({ error: urlValidation.error || 'Invalid URL' }, { status: 400 });
    }

    let code: string;

    // 2. Custom code or auto-generated
    if (customCode && typeof customCode === 'string' && customCode.trim()) {
      const trimmedCustom = customCode.trim();
      const codeValidation = validateCustomCode(trimmedCustom);
      if (!codeValidation.valid) {
        return NextResponse.json({ error: codeValidation.error }, { status: 400 });
      }

      // Check uniqueness
      const existing = await db.shortLink.findUnique({
        where: { code: trimmedCustom },
      });
      if (existing) {
        return NextResponse.json({ error: 'This short code is already in use. Please choose another.' }, { status: 409 });
      }

      code = trimmedCustom;
    } else {
      // Auto-generate 5-character short code
      code = await generateUniqueShortCode(5);
    }

    // 3. Create short link in database
    const newLink = await db.shortLink.create({
      data: {
        code,
        originalUrl: urlValidation.sanitizedUrl,
        title: title?.trim() || null,
        userId: session.id,
        isActive: true,
      },
    });

    return NextResponse.json({ link: newLink, success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating short link:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Short code collision. Please try again.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
