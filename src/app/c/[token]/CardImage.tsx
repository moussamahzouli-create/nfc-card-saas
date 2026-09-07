'use client';

import React, { useState } from 'react';
import { ImageOff, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface CardImageProps {
  src: string;
  alt: string;
  title?: string;
  borderColor?: string;
  textColor?: string;
}

export default function CardImage({ src, alt, title, borderColor, textColor }: CardImageProps) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (hasError) {
    return (
      <div 
        className="w-full rounded-2xl border p-4 bg-white/5 backdrop-blur-md flex flex-col items-center justify-center text-center gap-2"
        style={{ borderColor: borderColor || 'rgba(255, 255, 255, 0.1)' }}
      >
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
          <ImageOff className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold" style={{ color: textColor || '#FFFFFF' }}>{title || 'صورة'}</p>
        <a 
          href={src} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 font-medium mt-1"
        >
          <span>فتح الرابط المرفق</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  return (
    <div 
      className="w-full rounded-3xl overflow-hidden border p-2 bg-white/5 backdrop-blur-md shadow-md transition-all"
      style={{ borderColor: borderColor || 'rgba(255, 255, 255, 0.1)' }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-black/20 min-h-[140px] flex items-center justify-center">
        {!loaded && (
          <div className="w-full h-44 animate-pulse bg-white/5 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 opacity-30 text-white" />
          </div>
        )}
        <img
          src={src}
          alt={alt || 'Photo Block'}
          onLoad={() => setLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-auto object-cover max-h-[450px] rounded-2xl transition-opacity duration-300 ${loaded ? 'opacity-100' : 'hidden'}`}
        />
      </div>
      {title && (
        <p className="text-xs font-bold text-center mt-2.5 opacity-80" style={{ color: textColor || '#FFFFFF' }}>
          {title}
        </p>
      )}
    </div>
  );
}
