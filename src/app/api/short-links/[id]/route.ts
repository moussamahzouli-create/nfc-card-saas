import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { validateDestinationUrl } from '@/lib/short-links';

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/short-links/[id]
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const link = await db.shortLink.findUnique({
      where: { id },
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    const isAdmin = session.role === 'SUPER_ADMIN' || session.role === 'ADMIN';
    if (!isAdmin && link.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ link });
  } catch (error) {
    console.error('Error fetching short link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/short-links/[id]
 * Updates destination URL or metadata WITHOUT changing the short code.
 * Essential for NFC cards so cards never need to be rewritten!
 */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.shortLink.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    const isAdmin = session.role === 'SUPER_ADMIN' || session.role === 'ADMIN';
    if (!isAdmin && existing.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const updateData: any = {};

    // Validate original URL if updating destination
    if (body.originalUrl !== undefined) {
      const urlValidation = validateDestinationUrl(body.originalUrl);
      if (!urlValidation.valid || !urlValidation.sanitizedUrl) {
        return NextResponse.json({ error: urlValidation.error || 'Invalid destination URL' }, { status: 400 });
      }
      updateData.originalUrl = urlValidation.sanitizedUrl;
    }

    if (body.title !== undefined) {
      updateData.title = typeof body.title === 'string' ? body.title.trim() : null;
    }

    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }

    const updated = await db.shortLink.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ link: updated, success: true });
  } catch (error) {
    console.error('Error updating short link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/short-links/[id]
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.shortLink.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    const isAdmin = session.role === 'SUPER_ADMIN' || session.role === 'ADMIN';
    if (!isAdmin && existing.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.shortLink.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting short link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
