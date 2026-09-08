import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { hasSufficientContrast } from '@/lib/qr/contrast';
import QRCode from 'qrcode';
import { z } from 'zod';

const qrRequestSchema = z.object({
  data: z.string().url(),
  fgColor: z.string().regex(/^#[0-9A-F]{6}$/i, { message: 'Invalid hex foreground color' }),
  bgColor: z.string().regex(/^#[0-9A-F]{6}$/i, { message: 'Invalid hex background color' }),
  format: z.enum(['png', 'svg']).default('png'),
  errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).default('L'),
  margin: z.number().min(0).max(10).default(3),
  width: z.number().min(200).max(4000).default(1000),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = qrRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues.map(i => i.message).join(', ') }, { status: 400 });
    }

    const { data, fgColor, bgColor, format, errorCorrectionLevel, margin, width } = result.data;

    // 2. Validate contrast
    if (!hasSufficientContrast(fgColor, bgColor)) {
      return NextResponse.json({ error: 'QR colors have insufficient contrast' }, { status: 400 });
    }

    // 3. Generate QR code locally (Defaulting to Level L for light, clean, print-friendly matrix)
    if (format === 'svg') {
      const svgString = await QRCode.toString(data, {
        type: 'svg',
        margin: margin ?? 3,
        errorCorrectionLevel: errorCorrectionLevel || 'L',
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      return new NextResponse(svgString, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': 'attachment; filename="profile-qr.svg"',
        },
      });
    } else {
      const pngBuffer = await QRCode.toBuffer(data, {
        type: 'png',
        width: width ?? 1000,
        margin: margin ?? 3,
        errorCorrectionLevel: errorCorrectionLevel || 'L',
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      return new NextResponse(new Uint8Array(pngBuffer), {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': 'attachment; filename="profile-qr.png"',
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
