import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';

const createComponentSchema = z.object({
  type: z.string().min(2),
  title: z.string().min(1),
  value: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  settingsJson: z.string().nullable().optional(),
});

interface Params {
  params: Promise<{
    id: string;
  }>;
}

async function checkProfileAccess(profileId: string, userId: string) {
  const profile = await db.profile.findUnique({
    where: { id: profileId },
  });
  if (!profile) return null;
  if (profile.userId === userId) return profile;
  if (profile.organizationId) {
    const member = await db.organizationMember.findFirst({
      where: { organizationId: profile.organizationId, userId: userId },
    });
    if (member) return profile;
  }
  return null;
}

// POST /api/profiles/[id]/components
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await checkProfileAccess(id, user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found or access denied' }, { status: 404 });
    }

    const body = await req.json();
    const result = createComponentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid component input parameters' }, { status: 400 });
    }

    const { type, title, value, url, icon, settingsJson } = result.data;

    // Hardening: Prevent unsafe URL protocols (XSS/Redirect protection)
    if (url) {
      const lowerUrl = url.toLowerCase().trim();
      const isSafe = lowerUrl.startsWith('http://') || 
                     lowerUrl.startsWith('https://') || 
                     lowerUrl.startsWith('mailto:') || 
                     lowerUrl.startsWith('tel:') || 
                     lowerUrl.startsWith('sms:');
      if (!isSafe) {
        return NextResponse.json({ error: 'Unsafe URL scheme' }, { status: 400 });
      }
    }

    // Get current max sortOrder
    const count = await db.profileComponent.count({
      where: { profileId: id },
    });

    const component = await db.profileComponent.create({
      data: {
        profileId: id,
        type,
        title,
        value: value || null,
        url: url || null,
        icon: icon || null,
        sortOrder: count,
        isVisible: true,
        settingsJson: settingsJson || null,
      },
    });

    return NextResponse.json(component, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
