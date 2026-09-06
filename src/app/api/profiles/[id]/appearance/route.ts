import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';

const appearanceSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color code'),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color code'),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color code'),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color code'),
  buttonStyle: z.enum(['filled', 'outline', 'soft', 'minimal']),
  buttonRadius: z.string(),
  fontFamily: z.string(),
  profileImageStyle: z.enum(['circle', 'rounded', 'square']),
  cardWidth: z.string().optional(),
  spacing: z.string().optional(),
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

// PUT /api/profiles/[id]/appearance
export async function PUT(req: NextRequest, { params }: Params) {
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
    const result = appearanceSchema.safeParse(body);

    if (!result.success) {
      const messages = result.error.issues.map(i => i.message);
      return NextResponse.json({ error: messages.join(', ') }, { status: 400 });
    }

    const appearanceJson = JSON.stringify(result.data);

    const updated = await db.profile.update({
      where: { id },
      data: {
        appearanceJson,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
