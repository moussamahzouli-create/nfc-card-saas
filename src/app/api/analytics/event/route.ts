import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const logEventSchema = z.object({
  eventType: z.enum([
    'profile_view',
    'PHONE_CLICK',
    'WHATSAPP_CLICK',
    'EMAIL_CLICK',
    'WEBSITE_CLICK',
    'SOCIAL_CLICK',
    'MAP_CLICK',
    'BOOKING_CLICK',
    'SAVE_CONTACT',
    'SHARE_CLICK',
    'QR_SCAN',
  ]),
  profileId: z.string().uuid(),
  cardId: z.string().uuid().optional().nullable(),
  source: z.enum(['NFC', 'QR', 'DIRECT', 'SHARE', 'UNKNOWN']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = logEventSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid event parameters' }, { status: 400 });
    }

    const { eventType, profileId, cardId, source } = result.data;

    // 1. Verify target profile exists
    const profile = await db.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 2. Parse User-Agent parameters safely
    const userAgent = req.headers.get('user-agent') || '';
    let deviceType = 'Desktop';
    let OS = 'Other';
    let browser = 'Other';

    // Normalize Device Type
    if (/mobi|android|iphone|ipad|ipod/i.test(userAgent)) {
      deviceType = /ipad|tablet/i.test(userAgent) ? 'Tablet' : 'Mobile';
    }

    // Normalize OS
    if (/iphone|ipad|ipod/i.test(userAgent)) OS = 'iOS';
    else if (/android/i.test(userAgent)) OS = 'Android';
    else if (/windows/i.test(userAgent)) OS = 'Windows';
    else if (/macintosh/i.test(userAgent)) OS = 'macOS';
    else if (/linux/i.test(userAgent)) OS = 'Linux';

    // Normalize Browser
    if (/chrome|crios/i.test(userAgent) && !/edge|edg/i.test(userAgent)) browser = 'Chrome';
    else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) browser = 'Safari';
    else if (/firefox|fxios/i.test(userAgent)) browser = 'Firefox';
    else if (/edge|edg/i.test(userAgent)) browser = 'Edge';

    // 3. Resolve Coarse Geography (e.g. via Cloudflare Headers or reverse GeoIP)
    const country = req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || 'Unknown';
    const city = req.headers.get('x-vercel-ip-city') || 'Unknown';

    // 4. Save Event (never log raw client IP address)
    const event = await db.cardEvent.create({
      data: {
        profileId,
        cardId: cardId || null,
        eventType,
        deviceType,
        OS,
        browser,
        country: country !== 'Unknown' ? country : null,
        city: city !== 'Unknown' ? city : null,
        referrer: req.headers.get('referer')?.split('?')[0] || null, // Strip search parameters
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
