import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { z } from 'zod';

interface Params {
  params: Promise<{
    id: string; // This can be card ID, cardNumber or publicToken
  }>;
}

const assignSchema = z.object({
  profileId: z.string(),
});

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = assignSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues.map(i => i.message).join(', ') }, { status: 400 });
    }

    const { profileId } = result.data;

    // 1. Locate the card (by ID or serial number)
    const card = await db.card.findFirst({
      where: {
        OR: [
          { id },
          { cardNumber: id },
          { publicToken: id }
        ]
      },
      include: {
        assignments: true
      }
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // 2. Security validation: check state of card
    if (['SUSPENDED', 'LOST', 'REPLACED'].includes(card.status)) {
      return NextResponse.json({ error: `Card is in status ${card.status} and cannot be assigned.` }, { status: 400 });
    }

    // Check if assigned to another user
    const otherUserAssignment = card.assignments.find(a => a.userId !== user.id);
    if (otherUserAssignment) {
      return NextResponse.json({ error: 'Card is already connected to another user.' }, { status: 400 });
    }

    // 3. Verify profile ownership
    const profile = await db.profile.findFirst({
      where: {
        id: profileId,
        userId: user.id
      }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found or access denied.' }, { status: 404 });
    }

    // 4. Create/update assignment
    const existingAssignment = card.assignments.find(a => a.userId === user.id);
    if (existingAssignment) {
      await db.cardAssignment.update({
        where: { id: existingAssignment.id },
        data: {
          profileId,
          status: 'ACTIVE',
          unassignedAt: null
        }
      });
    } else {
      await db.cardAssignment.create({
        data: {
          cardId: card.id,
          userId: user.id,
          profileId,
          status: 'ACTIVE'
        }
      });
    }

    // Update Card status
    await db.card.update({
      where: { id: card.id },
      data: {
        status: 'ACTIVE',
        activatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      cardId: card.cardNumber,
      profileName: profile.name,
      slug: profile.slug
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
