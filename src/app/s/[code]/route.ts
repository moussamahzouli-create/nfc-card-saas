import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface Params {
  params: Promise<{ code: string }>;
}

/**
 * Sub-path redirect handler for short links:
 * Example: https://domain.com/s/a7X9 -> https://instagram.com/...
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { code } = await params;

    if (!code || typeof code !== 'string') {
      return new NextResponse('Not found', { status: 404 });
    }

    const shortLink = await db.shortLink.findUnique({
      where: { code },
      select: {
        id: true,
        originalUrl: true,
        isActive: true,
      },
    });

    if (!shortLink || !shortLink.isActive) {
      return new NextResponse(
        `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>رابط غير متوفر | Brand Xper</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0B0612; color: #fff; text-align: center; padding: 20px; }
    .box { max-width: 420px; padding: 32px; background: #170d24; border: 1px solid #3d2358; border-radius: 24px; }
    h1 { font-size: 20px; margin-bottom: 8px; color: #e9d5ff; }
    p { font-size: 14px; color: #a8a29e; margin-bottom: 24px; }
    a { display: inline-block; padding: 12px 24px; background: #844D98; color: #fff; text-decoration: none; border-radius: 999px; font-weight: bold; font-size: 14px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>الرابط غير متوفر أو تم تعطيله</h1>
    <p>تأكد من صحة الرابط أو تواصل مع صاحب بطاقة NFC أو كود QR لتحديث الوجهة.</p>
    <a href="/">العودة للموقع الرئيسي</a>
  </div>
</body>
</html>`,
        {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }

    db.shortLink
      .update({
        where: { id: shortLink.id },
        data: {
          clicks: { increment: 1 },
          lastScannedAt: new Date(),
        },
      })
      .catch((err) => console.error('Failed to increment short link clicks:', err));

    return NextResponse.redirect(shortLink.originalUrl, {
      status: 307,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Error handling /s/[code] redirect:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
