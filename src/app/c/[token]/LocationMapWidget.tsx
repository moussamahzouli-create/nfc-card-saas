'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, Copy, Check, ExternalLink } from 'lucide-react';

interface LocationMapWidgetProps {
  address: string;
  title?: string;
  isArabic?: boolean;
  primaryColor?: string;
  surfaceColor?: string;
  borderColor?: string;
  textColor?: string;
  mutedColor?: string;
}

export default function LocationMapWidget({
  address,
  title,
  isArabic = false,
  primaryColor = '#8A509E',
  surfaceColor = 'rgba(255, 255, 255, 0.03)',
  borderColor = 'rgba(255, 255, 255, 0.08)',
  textColor = '#FFFFFF',
  mutedColor = '#94A3B8',
}: LocationMapWidgetProps) {
  const [copied, setCopied] = useState(false);

  if (!address || !address.trim()) return null;

  const isUrl = address.startsWith('http://') || address.startsWith('https://');
  
  // Resolve friendly label and embed query
  let displayAddress = address;
  let embedQuery = address;
  let directMapsUrl = isUrl ? address : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  if (isUrl) {
    if (address.includes('PC4RSK7CmeR6dSFf8') || address.toLowerCase().includes('moussa')) {
      displayAddress = 'Moussa print - مراكش، المغرب';
      embedQuery = '31.5645365,-7.6628174';
    } else {
      displayAddress = isArabic ? 'موقعنا عبر خرائط Google' : 'Google Maps Location';
      embedQuery = 'Marrakech, Maroc';
    }
  }

  const displayTitle = title || (isArabic ? 'موقعنا على الخريطة' : 'Location Map');
  const googleMapsDirectionsUrl = isUrl && !address.includes('?') 
    ? address 
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(embedQuery)}`;
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(embedQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const handleCopy = async () => {
    const textToCopy = isUrl ? address : displayAddress;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = textToCopy;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="w-full rounded-3xl overflow-hidden border p-4 space-y-3.5 transition-all duration-300 shadow-lg relative group text-left rtl:text-right"
      style={{
        backgroundColor: surfaceColor,
        borderColor: borderColor,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md bg-gradient-to-br from-rose-500 to-red-600">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div className="text-left rtl:text-right min-w-0">
            <h3 className="text-xs font-black tracking-wide uppercase truncate" style={{ color: textColor }}>
              {displayTitle}
            </h3>
            <p className="text-[11px] font-semibold truncate opacity-85" style={{ color: mutedColor }}>
              {displayAddress}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-2.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1 shrink-0 transition-all hover:bg-white/10 active:scale-95 cursor-pointer"
          style={{ borderColor: borderColor, color: textColor }}
          title={isArabic ? 'نسخ العنوان' : 'Copy address'}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">{isArabic ? 'تم النسخ' : 'Copied'}</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 opacity-70" />
              <span>{isArabic ? 'نسخ' : 'Copy'}</span>
            </>
          )}
        </button>
      </div>

      {/* Embedded Interactive Map */}
      <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden border border-white/10 shadow-inner bg-slate-900">
        <iframe
          title="Google Map Location"
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'contrast(1.05)' }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
        />

        {/* Ambient Map overlay indicator */}
        <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white text-[10px] font-bold pointer-events-none shadow-sm">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>Google Maps</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 text-white shadow-md transition-all hover:opacity-95 active:scale-98 cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, #EA4335 100%)`,
          }}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{isArabic ? 'الاتجاهات' : 'Directions'}</span>
        </a>

        <a
          href={directMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all hover:bg-white/10 active:scale-98 cursor-pointer"
          style={{
            borderColor: borderColor,
            color: textColor,
          }}
        >
          <span>{isArabic ? 'فتح في خرائط Google' : 'Open in Maps'}</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      </div>
    </div>
  );
}
