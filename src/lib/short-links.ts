import { db } from '@/lib/db';

// Reserved system paths that cannot be used as short codes
export const RESERVED_SHORT_CODES = new Set([
  'admin',
  'agency',
  'api',
  'auth',
  'c',
  'checkout',
  'contact',
  'dashboard',
  'faq',
  'fidelity',
  'help',
  'loyalty',
  'merchant',
  'onboarding',
  'pricing',
  's',
  'l',
  'r',
  'qr',
  'nfc',
  'link',
  'links',
  'login',
  'logout',
  'register',
  'signin',
  'signup',
  'robots',
  'robots.txt',
  'sitemap',
  'sitemap.xml',
  'favicon',
  'favicon.ico',
  'manifest',
  'images',
  'icons',
  '_next',
  'public',
]);

// Character set for unambiguous, human-friendly short codes
// Omits confusing characters like 0, O, 1, l, I
const CODE_ALPHABET = '23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Generates a random alphanumeric short code of specified length (default 5 chars).
 */
export function generateRandomCode(length = 5): string {
  let result = '';
  const alphabetLength = CODE_ALPHABET.length;
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphabetLength);
    result += CODE_ALPHABET[randomIndex];
  }
  return result;
}

/**
 * Generates a unique, collision-free short code from the database.
 */
export async function generateUniqueShortCode(length = 5): Promise<string> {
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateRandomCode(length + (attempt > 5 ? 1 : 0));
    
    // Ensure not reserved
    if (RESERVED_SHORT_CODES.has(candidate.toLowerCase())) {
      continue;
    }

    // Check collision in database
    const existing = await db.shortLink.findUnique({
      where: { code: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  // Fallback with timestamp suffix if extreme collision
  return `x${Date.now().toString(36).slice(-5)}`;
}

/**
 * Validates a custom short code string.
 */
export function validateCustomCode(code: string): { valid: boolean; error?: string } {
  const trimmed = code.trim();
  
  if (trimmed.length < 3 || trimmed.length > 20) {
    return { valid: false, error: 'Short code must be between 3 and 20 characters.' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: 'Short code may only contain letters, numbers, hyphens, and underscores.' };
  }

  if (RESERVED_SHORT_CODES.has(trimmed.toLowerCase())) {
    return { valid: false, error: `The code "${trimmed}" is reserved by the system.` };
  }

  return { valid: true };
}

/**
 * Validates that the original URL is a safe, valid HTTP/HTTPS address.
 * Prevents SSRF, javascript:, data: URIs, loopbacks, etc.
 */
export function validateDestinationUrl(urlStr: string): { valid: boolean; sanitizedUrl?: string; error?: string } {
  let trimmed = urlStr.trim();
  if (!trimmed) {
    return { valid: false, error: 'Destination URL is required.' };
  }

  // Prepend https:// if user omitted protocol
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: 'Invalid URL format. Please provide a valid web address.' };
  }

  // Protocol check
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Prevent dangerous loopback / private IP / internal cloud addresses (SSRF mitigation)
  const isLoopback =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname === '169.254.169.254' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local');

  if (isLoopback) {
    return { valid: false, error: 'Localhost and internal loopback addresses are not allowed.' };
  }

  return { valid: true, sanitizedUrl: parsed.toString() };
}
