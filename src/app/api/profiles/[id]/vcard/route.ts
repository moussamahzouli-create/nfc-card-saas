import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

function escapeVCardValue(val: string): string {
  if (!val) return '';
  return val
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Fetch Profile along with locations and details
    const profile = await db.profile.findUnique({
      where: { id },
      include: {
        locations: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Authorization: If profile is private, require authenticated owner
    if (!profile.isPublic) {
      const user = await getSessionUser(req);
      if (!user || user.id !== profile.userId) {
        return NextResponse.json({ error: 'Unauthorized. This profile is private.' }, { status: 403 });
      }
    }

    // Log Save Contact event asynchronously in the background
    db.cardEvent.create({
      data: {
        profileId: profile.id,
        eventType: 'SAVE_CONTACT',
        deviceType: 'Mobile',
      },
    }).catch(err => console.error('Failed to log vCard event', err));

    const nameEscaped = escapeVCardValue(profile.name);
    const firstNameEscaped = escapeVCardValue(profile.firstName || '');
    const lastNameEscaped = escapeVCardValue(profile.lastName || '');

    // Build standard vCard 3.0 lines
    const vCardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${nameEscaped}`,
    ];

    if (lastNameEscaped || firstNameEscaped) {
      vCardLines.push(`N:${lastNameEscaped};${firstNameEscaped};;;`);
    } else {
      vCardLines.push(`N:${nameEscaped};;;;;`);
    }

    if (profile.jobTitle) {
      vCardLines.push(`TITLE:${escapeVCardValue(profile.jobTitle)}`);
    }
    if (profile.company) {
      vCardLines.push(`ORG:${escapeVCardValue(profile.company)}`);
    }
    let phone2 = '';
    let whatsApp2 = '';
    if (profile.appearanceJson) {
      try {
        const parsed = JSON.parse(profile.appearanceJson);
        phone2 = parsed.phone2 || '';
        whatsApp2 = parsed.whatsApp2 || '';
      } catch {}
    }

    if (profile.phone) {
      vCardLines.push(`TEL;TYPE=CELL,VOICE:${escapeVCardValue(profile.phone)}`);
    }
    if (phone2) {
      vCardLines.push(`TEL;TYPE=WORK,VOICE:${escapeVCardValue(phone2)}`);
    }
    if (profile.whatsApp) {
      vCardLines.push(`TEL;TYPE=MSG,CELL:${escapeVCardValue(profile.whatsApp)}`);
    }
    if (whatsApp2) {
      vCardLines.push(`TEL;TYPE=MSG,WORK:${escapeVCardValue(whatsApp2)}`);
    }
    if (profile.email) {
      vCardLines.push(`EMAIL;TYPE=PREF,INTERNET:${escapeVCardValue(profile.email)}`);
    }
    if (profile.website) {
      vCardLines.push(`URL:${escapeVCardValue(profile.website)}`);
    }

    // Map Address if location is configured
    if (profile.locations && profile.locations.length > 0) {
      const adr = escapeVCardValue(profile.locations[0].address);
      vCardLines.push(`ADR;TYPE=WORK:;;${adr};;;;`);
    }

    vCardLines.push(`NOTE:Digital NFC Card - ${escapeVCardValue(profile.slug)}`);
    vCardLines.push('END:VCARD');

    const vCardContent = vCardLines.join('\r\n');

    // Return custom headers to trigger download behavior on mobile/desktop browsers with UTF-8 encoding
    return new NextResponse(vCardContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/vcard; charset=utf-8',
        'Content-Disposition': `attachment; filename="${profile.slug || 'contact'}.vcf"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
