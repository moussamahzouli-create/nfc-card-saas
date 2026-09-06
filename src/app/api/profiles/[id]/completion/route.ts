import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const profile = await db.profile.findUnique({
      where: { id },
      include: {
        components: true,
        socialLinks: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Enforce owner check
    if (profile.userId !== user.id && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Completion math
    let score = 0;
    const details: any[] = [];

    if (profile.name) { score += 15; details.push({ item: 'Name', val: 15 }); }
    if (profile.photoUrl) { score += 15; details.push({ item: 'Avatar Photo', val: 15 }); }
    if (profile.coverUrl) { score += 10; details.push({ item: 'Cover Photo', val: 10 }); }
    if (profile.jobTitle) { score += 10; details.push({ item: 'Job Title', val: 10 }); }
    if (profile.company) { score += 10; details.push({ item: 'Company Name', val: 10 }); }
    if (profile.bio) { score += 15; details.push({ item: 'Short Bio', val: 15 }); }
    if (profile.phone || profile.email) { score += 15; details.push({ item: 'Contact details', val: 15 }); }
    if (profile.socialLinks && profile.socialLinks.length > 0) { score += 10; details.push({ item: 'Social networks links', val: 10 }); }

    return NextResponse.json({
      score: Math.min(score, 100),
      breakdown: details,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
