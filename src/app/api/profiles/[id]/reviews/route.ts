import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createReviewSchema = z.object({
  authorName: z.string().min(1, 'Name is required').max(100),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000).optional().nullable(),
});

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/profiles/[id]/reviews
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Verify profile exists
    const profile = await db.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const reviews = await db.profileReview.findMany({
      where: { profileId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/profiles/[id]/reviews
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = createReviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues.map(i => i.message).join(', ') }, { status: 400 });
    }

    const { authorName, rating, text } = result.data;

    // Verify profile exists
    const profile = await db.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const newReview = await db.profileReview.create({
      data: {
        profileId: id,
        authorName,
        rating,
        text,
      },
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
