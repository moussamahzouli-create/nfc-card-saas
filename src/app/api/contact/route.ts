import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const contactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional().nullable(),
  subject: z.string().min(3).max(150),
  message: z.string().min(10).max(3000), // spam/huge payload limits
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = contactFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues.map(i => i.message).join(', ') }, { status: 400 });
    }

    const { name, email, phone, subject, message } = result.data;

    // Simple anti-spam: Block messages containing obvious script tags
    if (/<script/i.test(message) || /javascript:/i.test(message)) {
      return NextResponse.json({ error: 'Message contains rejected html/scripts content.' }, { status: 400 });
    }

    const msg = await db.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: 'NEW',
      },
    });

    return NextResponse.json({ success: true, messageId: msg.id });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
