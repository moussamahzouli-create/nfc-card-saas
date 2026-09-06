/**
 * Helper to calculate color contrast ratios.
 * Validates that custom QR code colors maintain enough contrast for standard readers to decode them.
 */

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(rgb: RGB): number {
  const a = [rgb.r, rgb.g, rgb.b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calculates the contrast ratio between foreground and background colors.
 * Contrast ratio is a value between 1.0 and 21.0.
 */
export function getContrastRatio(fgHex: string, bgHex: string): number {
  const fgRgb = hexToRgb(fgHex);
  const bgRgb = hexToRgb(bgHex);
  if (!fgRgb || !bgRgb) return 1.0;

  const l1 = getLuminance(fgRgb);
  const l2 = getLuminance(bgRgb);

  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Validates if the contrast ratio is sufficient for QR codes (minimum 3.0).
 */
export function hasSufficientContrast(fgHex: string, bgHex: string): boolean {
  return getContrastRatio(fgHex, bgHex) >= 3.0;
}
