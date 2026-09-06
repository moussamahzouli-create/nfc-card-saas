import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';

const updateComponentSchema = z.object({
  title: z.string().min(1).optional(),
  value: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  isVisible: z.boolean().optional(),
  settingsJson: z.string().nullable().optional(),
});

interface Params {
  params: Promise<{
    id: string;
    componentId: string;
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

// PUT /api/profiles/[id]/components/[componentId]
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id, componentId } = await params;
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await checkProfileAccess(id, user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found or access denied' }, { status: 404 });
    }

    const body = await req.json();
    const result = updateComponentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid component input values' }, { status: 400 });
    }

    // Hardening: Prevent unsafe URL protocols (XSS/Redirect protection)
    if (result.data.url) {
      const lowerUrl = result.data.url.toLowerCase().trim();
      const isSafe = lowerUrl.startsWith('http://') || 
                     lowerUrl.startsWith('https://') || 
                     lowerUrl.startsWith('mailto:') || 
                     lowerUrl.startsWith('tel:') || 
                     lowerUrl.startsWith('sms:');
      if (!isSafe) {
        return NextResponse.json({ error: 'Unsafe URL scheme' }, { status: 400 });
      }
    }

    // Verify component belongs to profile
    const existingComponent = await db.profileComponent.findFirst({
      where: { id: componentId, profileId: id },
    });

    if (!existingComponent) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }

    const updated = await db.profileComponent.update({
      where: { id: componentId },
      data: result.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/profiles/[id]/components/[componentId]
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id, componentId } = await params;
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await checkProfileAccess(id, user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found or access denied' }, { status: 404 });
    }

    const existingComponent = await db.profileComponent.findFirst({
      where: { id: componentId, profileId: id },
    });

    if (!existingComponent) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }

    await db.profileComponent.delete({
      where: { id: componentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
