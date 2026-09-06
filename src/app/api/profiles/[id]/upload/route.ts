import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { storage } from '@/lib/storage';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/profiles/[id]/upload
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.profile.findUnique({ where: { id } });
    if (!profile || profile.userId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const uploadType = formData.get('type') as string | null; // 'photo' or 'cover'

    if (!file || !uploadType) {
      return NextResponse.json({ error: 'File and upload type are required' }, { status: 400 });
    }

    const uploadPrefix = uploadType === 'photo' ? 'avatar' : 'cover';
    const uploadResult = await storage.upload(file, uploadPrefix);

    if (!uploadResult.success || !uploadResult.url) {
      return NextResponse.json({ error: uploadResult.message || 'File upload failed' }, { status: 400 });
    }

    // Update profile in DB
    const dataUpdate: any = {};
    if (uploadType === 'photo') {
      dataUpdate.photoUrl = uploadResult.url;
    } else {
      dataUpdate.coverUrl = uploadResult.url;
    }

    const updatedProfile = await db.profile.update({
      where: { id },
      data: dataUpdate,
    });

    return NextResponse.json({ success: true, url: uploadResult.url, profile: updatedProfile });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
