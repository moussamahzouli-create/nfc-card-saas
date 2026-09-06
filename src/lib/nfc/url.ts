/**
 * Generates the canonical public NFC redirect URL for a card.
 */
export function generateCardUrl(publicToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl.replace(/\/$/, '')}/c/${publicToken}`;
}
