import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const filter = url.searchParams.get('filter') || 'all'; // 'all' | 'pending' | 'active'
    const search = url.searchParams.get('q')?.toLowerCase() || '';

    // If Super Admin or Admin, get all profiles; otherwise user's own profiles
    const isStaff = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
    const whereProfile: any = isStaff ? {} : { userId: user.id };

    const profiles = await db.profile.findMany({
      where: whereProfile,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    // Also fetch cards
    const cards = await db.card.findMany({
      include: {
        assignments: {
          where: { status: 'ACTIVE' },
          include: {
            profile: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    // Map profiles into actionable items for the mobile app
    const items = profiles
      .filter((p: any) => {
        if (!search) return true;
        return (
          p.name?.toLowerCase().includes(search) ||
          p.slug?.toLowerCase().includes(search) ||
          p.jobTitle?.toLowerCase().includes(search) ||
          p.company?.toLowerCase().includes(search)
        );
      })
      .map((p: any) => {
        const assignedCard = cards.find((c: any) =>
          c.assignments.some((a: any) => a.profileId === p.id)
        );

        const targetUrl = `https://www.brandxpere.com/c/${p.slug}`;
        const hasNfc = !!assignedCard?.nfcUid;
        const status = hasNfc ? 'ACTIVE' : 'PENDING';

        return {
          id: p.id,
          type: 'PROFILE',
          name: p.name,
          slug: p.slug,
          targetUrl,
          jobTitle: p.jobTitle || 'عضو Brandxpere',
          company: p.company || 'Brand Expert',
          photoUrl: p.photoUrl,
          cardId: assignedCard?.id || null,
          cardNumber: assignedCard?.cardNumber || null,
          nfcUid: assignedCard?.nfcUid || null,
          status,
          ownerName: p.user?.name || 'غير محدد',
          ownerEmail: p.user?.email || '',
          updatedAt: p.updatedAt,
        };
      });

    // Filter by pending if requested
    const filteredItems = filter === 'pending'
      ? items.filter((i: any) => i.status === 'PENDING')
      : filter === 'active'
      ? items.filter((i: any) => i.status === 'ACTIVE')
      : items;

    return NextResponse.json(
      {
        success: true,
        count: filteredItems.length,
        items: filteredItems,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Mobile cards fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
