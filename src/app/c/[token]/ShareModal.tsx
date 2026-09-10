'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Share2, QrCode, Copy, Check, X, Download, MessageCircle } from 'lucide-react';
import QRCode from 'qrcode';

interface ShareModalProps {
  slug: string;
  name: string;
  title?: string | null;
  primaryColor?: string;
  isArabic?: boolean;
}

export default function ShareModal({ slug, name, title, primaryColor = '#8A509E', isArabic = false }: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [cardUrl, setCardUrl] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/c/${slug}`;
      setCardUrl(url);

      QRCode.toDataURL(url, {
        width: 360,
        margin: 3,
        errorCorrectionLevel: 'L',
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      })
        .then((dataUrl) => setQrDataUrl(dataUrl))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [slug]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.createElement('input');
      input.value = cardUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${slug}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareText = isArabic
    ? `بطاقة العمل الرقمية لـ ${name}: ${cardUrl}`
    : `Digital business card for ${name}: ${cardUrl}`;

  const modalContent = isOpen && mounted ? (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      dir={isArabic ? 'rtl' : 'ltr'}
      onClick={() => setIsOpen(false)}
      style={{ margin: 0, isolation: 'isolate' }}
    >
      <div
        className="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-5 my-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          aria-label={isArabic ? 'إغلاق' : 'Close'}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="text-center pt-2">
          <div
            className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white mb-2 shadow-lg"
            style={{ background: primaryColor }}
          >
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {isArabic ? 'مشاركة البطاقة الرقمية' : 'Share Digital Card'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isArabic ? 'امسح الرمز أو انسخ الرابط المباشر' : 'Scan the QR code or copy direct link'}
          </p>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          {qrDataUrl ? (
            <div className="bg-white p-3 rounded-xl shadow-md border border-slate-200/60">
              <img src={qrDataUrl} alt="QR Code" className="w-44 h-44 sm:w-48 sm:h-48 block" />
            </div>
          ) : (
            <div className="w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center text-slate-400">
              {isArabic ? 'جاري إنشاء الرمز...' : 'Loading QR Code…'}
            </div>
          )}
          <div className="mt-3 text-center">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 block truncate max-w-[240px]">
              {name}
            </span>
            {title && (
              <span className="text-[10px] text-slate-400 block truncate max-w-[240px]">
                {title}
              </span>
            )}
          </div>
        </div>

        {/* URL Copy Bar */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="flex-1 text-[11px] font-mono text-slate-600 dark:text-slate-300 px-2 truncate select-all">
            {cardUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 text-white transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
            style={{ background: primaryColor }}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isArabic ? 'تم النسخ!' : 'Copied!') : isArabic ? 'نسخ' : 'Copy'}</span>
          </button>
        </div>

        {/* Quick Share Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-sm"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={handleDownloadQr}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{isArabic ? 'تحميل الرمز' : 'Download QR'}</span>
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center cursor-pointer border border-white/25 transition-all hover:scale-110 active:scale-95 shadow-md shrink-0"
        title={isArabic ? 'مشاركة البطاقة والرمز' : 'Share card & QR Code'}
        aria-label="Share"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {mounted && typeof document !== 'undefined' && modalContent
        ? createPortal(modalContent, document.body)
        : null}
    </>
  );
}
