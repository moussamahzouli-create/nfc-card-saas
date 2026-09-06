import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7d';
    const cardId = searchParams.get('cardId') || '';
    const profileId = searchParams.get('profileId') || '';

    // 1. Gather all profiles owned by this customer
    const userProfiles = await db.profile.findMany({
      where: { userId: user.id },
      select: { id: true }
    });
    const profileIds = userProfiles.map(p => p.id);

    if (profileIds.length === 0) {
      return NextResponse.json({
        totalViews: 0,
        viewsToday: 0,
        timeline: [],
        devices: [],
        countries: [],
        browsers: [],
        events: []
      });
    }

    // 2. Establish Date Filter
    let startDate = new Date();
    const endDate = new Date();

    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '7d') {
      startDate.setDate(endDate.getDate() - 7);
    } else if (range === '30d') {
      startDate.setDate(endDate.getDate() - 30);
    } else if (range === '90d') {
      startDate.setDate(endDate.getDate() - 90);
    } else {
      // Default to 7 days
      startDate.setDate(endDate.getDate() - 7);
    }

    // 3. Build Prisma where conditions (enforce owner authorization locks)
    const whereClause: any = {
      timestamp: { gte: startDate, lte: endDate },
    };

    if (profileId) {
      if (!profileIds.includes(profileId)) {
        return NextResponse.json({ error: 'Access denied to profile analytics' }, { status: 403 });
      }
      whereClause.profileId = profileId;
    } else {
      whereClause.profileId = { in: profileIds };
    }

    if (cardId) {
      // Verify card belongs to user active assignments
      const cardAssign = await db.cardAssignment.findFirst({
        where: { cardId, userId: user.id, status: 'ACTIVE' }
      });
      if (!cardAssign) {
        return NextResponse.json({ error: 'Access denied to card analytics' }, { status: 403 });
      }
      whereClause.cardId = cardId;
    }

    // 4. Query Events
    const rawEvents = await db.cardEvent.findMany({
      where: whereClause,
      orderBy: { timestamp: 'asc' }
    });

    // 5. Aggregate Analytics in Memory (Database Dialect Agnostic)
    const timelineMap = new Map<string, number>();
    const deviceMap = new Map<string, number>();
    const countryMap = new Map<string, number>();
    const browserMap = new Map<string, number>();
    const eventMap = new Map<string, number>();

    rawEvents.forEach(evt => {
      // Timeline (group by YYYY-MM-DD)
      const dateStr = evt.timestamp.toISOString().split('T')[0];
      timelineMap.set(dateStr, (timelineMap.get(dateStr) || 0) + 1);

      // Device Type
      const device = evt.deviceType || 'Desktop';
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1);

      // Country
      const country = evt.country || 'Unknown';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);

      // Browser
      const browser = evt.browser || 'Other';
      browserMap.set(browser, (browserMap.get(browser) || 0) + 1);

      // Event Click Actions
      eventMap.set(evt.eventType, (eventMap.get(evt.eventType) || 0) + 1);
    });

    const timeline = Array.from(timelineMap.entries()).map(([date, count]) => ({ date, count }));
    const devices = Array.from(deviceMap.entries()).map(([name, value]) => ({ name, value }));
    const countries = Array.from(countryMap.entries()).map(([name, value]) => ({ name, value }));
    const browsers = Array.from(browserMap.entries()).map(([name, value]) => ({ name, value }));
    const events = Array.from(eventMap.entries()).map(([type, count]) => ({ type, count }));

    // Count today's views
    const todayStr = new Date().toISOString().split('T')[0];
    const viewsToday = timelineMap.get(todayStr) || 0;

    return NextResponse.json({
      totalViews: rawEvents.filter(e => e.eventType === 'profile_view').length,
      viewsToday,
      timeline,
      devices,
      countries,
      browsers,
      events,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
