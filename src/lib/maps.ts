/**
 * Google Maps Link & Address Parser & Resolver
 * Handles short links (maps.app.goo.gl), place URLs, search URLs, coordinates, embed iframes, and plain addresses.
 */

export interface ResolvedMapInfo {
  embedUrl: string;
  directUrl: string;
  directionsUrl: string;
  displayAddress: string;
  query: string;
  coordinates?: string | null;
}

function cleanPlaceName(raw: string): string {
  if (!raw) return '';
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw.replace(/\+/g, ' '));
  } catch {}
  return decoded.trim();
}

export function parseMapsInput(
  input: string,
  fallbackName?: string,
  isArabic = false
): ResolvedMapInfo {
  if (!input || !input.trim()) {
    const q = fallbackName || (isArabic ? 'موقعنا' : 'Location');
    return {
      embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
      directUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`,
      displayAddress: q,
      query: q,
      coordinates: null,
    };
  }

  const text = input.trim();

  // 1. If full iframe tag was pasted: <iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>
  const iframeMatch = text.match(/src=["'](https:\/\/[^"']+)["']/i);
  if (iframeMatch) {
    const src = iframeMatch[1];
    return {
      embedUrl: src,
      directUrl: src,
      directionsUrl: src,
      displayAddress: fallbackName || (isArabic ? 'موقعنا عبر الخريطة' : 'Google Maps Location'),
      query: fallbackName || '',
      coordinates: null,
    };
  }

  // 2. If direct embed URL was pasted: https://www.google.com/maps/embed?pb=...
  if (text.includes('/maps/embed')) {
    return {
      embedUrl: text,
      directUrl: text,
      directionsUrl: text,
      displayAddress: fallbackName || (isArabic ? 'موقعنا عبر الخريطة' : 'Google Maps Location'),
      query: fallbackName || '',
      coordinates: null,
    };
  }

  const isUrl = text.startsWith('http://') || text.startsWith('https://');

  if (isUrl) {
    // 3. Extract place name and coordinates from /maps/place/{PLACE_NAME}/@{LAT},{LNG},{ZOOM}z/
    const placeMatch = text.match(/\/maps\/place\/([^/@?#]+)(?:\/@(-?\d+\.\d+),(-?\d+\.\d+))?/i);
    if (placeMatch) {
      const placeName = cleanPlaceName(placeMatch[1]);
      const lat = placeMatch[2];
      const lng = placeMatch[3];
      const coords = lat && lng ? `${lat},${lng}` : null;
      // Coordinates give exact pin location; placeName gives display title
      const query = coords || placeName;
      return {
        embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
        directUrl: text,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`,
        displayAddress: placeName || fallbackName || (isArabic ? 'موقعنا عبر خرائط Google' : 'Google Maps Location'),
        query,
        coordinates: coords,
      };
    }

    // 4. Extract from /@{LAT},{LNG},{ZOOM}z
    const atCoordsMatch = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atCoordsMatch) {
      const coords = `${atCoordsMatch[1]},${atCoordsMatch[2]}`;
      return {
        embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(coords)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
        directUrl: text,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coords)}`,
        displayAddress: fallbackName || coords,
        query: coords,
        coordinates: coords,
      };
    }

    // 5. Extract from URL query params (?q=... or ?query=... or ?destination=...)
    try {
      const parsed = new URL(text);
      const q = parsed.searchParams.get('q') || parsed.searchParams.get('query') || parsed.searchParams.get('destination');
      if (q) {
        return {
          embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
          directUrl: text,
          directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`,
          displayAddress: fallbackName || q,
          query: q,
          coordinates: null,
        };
      }
      const ll = parsed.searchParams.get('ll');
      if (ll) {
        return {
          embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(ll)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
          directUrl: text,
          directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ll)}`,
          displayAddress: fallbackName || ll,
          query: ll,
          coordinates: ll,
        };
      }
    } catch {}

    // Other URLs: keep the link for direct opening, use fallback for embed query
    const fallbackQ = fallbackName || 'Location';
    return {
      embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQ)}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
      directUrl: text,
      directionsUrl: text,
      displayAddress: fallbackName || (isArabic ? 'موقعنا عبر خرائط Google' : 'Google Maps Location'),
      query: fallbackQ,
      coordinates: null,
    };
  }

  // 6. Plain address or coordinates (e.g. "Casablanca Anfa" or "31.6295,-7.9811")
  const coordsMatch = text.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
  const coords = coordsMatch ? `${coordsMatch[1]},${coordsMatch[2]}` : null;
  return {
    embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(text)}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
    directUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(text)}`,
    displayAddress: text,
    query: text,
    coordinates: coords,
  };
}

/**
 * Resolves short links (maps.app.goo.gl or goo.gl/maps) on the server by following 302 redirect.
 */
export async function resolveShortUrl(url: string): Promise<string> {
  if (!url || (!url.includes('maps.app.goo.gl') && !url.includes('goo.gl/maps'))) {
    return url;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });
    clearTimeout(timeout);

    const location = res.headers.get('location');
    if (location) {
      return location;
    }
  } catch (err) {
    // If HEAD fails or is blocked, try GET
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(url, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });
      clearTimeout(timeout);
      const location = res.headers.get('location');
      if (location) {
        return location;
      }
    } catch {}
  }
  return url;
}

/**
 * Master resolver: resolves short links if needed, then parses into complete map props.
 */
export async function resolveAndParseMapsInput(
  input: string,
  fallbackName?: string,
  isArabic = false
): Promise<ResolvedMapInfo> {
  let finalInput = input;
  if (input && (input.includes('maps.app.goo.gl') || input.includes('goo.gl/maps'))) {
    finalInput = await resolveShortUrl(input);
  }
  const parsed = parseMapsInput(finalInput, fallbackName, isArabic);
  // Preserve original link as directUrl if input was a short URL
  if (input && input.startsWith('http')) {
    parsed.directUrl = input;
  }
  return parsed;
}
