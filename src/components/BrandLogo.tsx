'use client';

import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
  textClassName?: string;
  href?: string;
}

export default function BrandLogo({
  className = '',
  iconSize = 36,
  showText = true,
  textClassName = 'text-xl',
  href = '/'
}: BrandLogoProps) {
  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <img
        src="/brandxpere-icon.png"
        alt="brandxpere logo"
        width={iconSize}
        height={iconSize}
        className="object-contain flex-shrink-0 transition-transform duration-300 hover:scale-105"
        style={{ width: iconSize, height: iconSize }}
      />
      {showText && (
        <span className={`font-black tracking-tight font-sans text-slate-900 dark:text-white leading-none ${textClassName}`}>
          <span>brand</span>
          <span className="text-[#8A509E] dark:text-purple-400 font-extrabold">x</span>
          <span>pere</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

export function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
