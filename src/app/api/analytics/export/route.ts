import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';

// GET /api/analytics/export
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Gather all profiles owned by this user
    const userProfiles = await db.profile.findMany({
      where: { userId: user.id },
      select: { id: true, name: true }
    });
    const profileIds = userProfiles.map(p => p.id);
    const profileNameMap = new Map(userProfiles.map(p => [p.id, p.name]));

    if (profileIds.length === 0) {
      return NextResponse.json({ error: 'No profile data to export' }, { status: 400 });
    }

    // 2. Fetch all events associated with these profiles
    const events = await db.cardEvent.findMany({
      where: {
        profileId: { in: profileIds }
      },
      include: {
        card: true
      },
      orderBy: { timestamp: 'desc' }
    });

    // 3. Generate CSV rows
    const headers = ['Date', 'Card Number', 'Profile Name', 'Event Type', 'Country', 'City', 'Device Type', 'OS', 'Browser', 'Referrer'];
    const csvRows = [headers.join(',')];

    events.forEach(evt => {
      const date = evt.timestamp.toISOString().split('T')[0];
      const cardNum = evt.card ? evt.card.cardNumber : '—';
      const profileName = profileNameMap.get(evt.profileId || '') || '—';
      const eventType = evt.eventType;
      const country = evt.country || 'Unknown';
      const city = evt.city || 'Unknown';
      const device = evt.deviceType || 'Desktop';
      const os = evt.OS || 'Other';
      const browser = evt.browser || 'Other';
      const referrer = evt.referrer || 'Direct';

      // Safe escape helper
      const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;

      const row = [
        date,
        escape(cardNum),
        escape(profileName),
        escape(eventType),
        escape(country),
        escape(city),
        escape(device),
        escape(os),
        escape(browser),
        escape(referrer)
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="analytics_export.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
