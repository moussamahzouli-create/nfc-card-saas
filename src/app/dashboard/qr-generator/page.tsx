'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { 
  QrCode, Download, Printer, Copy, Check, Sparkles, RefreshCw, 
  ExternalLink, Sliders, ShieldCheck, AlertTriangle, Image as ImageIcon, 
  Share2, ArrowRight, Layers, FileCode
} from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'هوية Brandxpere', fg: '#8A509E', bg: '#FFFFFF' },
  { name: 'الأسود الملكي', fg: '#090D16', bg: '#FFFFFF' },
  { name: 'الأزرق النيلي', fg: '#1E40AF', bg: '#FFFFFF' },
  { name: 'الأخضر الزمردي', fg: '#047857', bg: '#FFFFFF' },
  { name: 'الأحمر الياقوتي', fg: '#BE123C', bg: '#FFFFFF' },
  { name: 'الذهبي الفاخر', fg: '#B45309', bg: '#FFFBEB' },
  { name: 'داكن نيون', fg: '#A855F7', bg: '#0F172A' },
  { name: 'أبيض على داكن', fg: '#F8FAFC', bg: '#020617' },
];

export default function StandaloneQRGenerator() {
  const [url, setUrl] = useState('https://www.brandxpere.com');
  const [fgColor, setFgColor] = useState('#8A509E');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [customLogo, setCustomLogo] = useState<string | null>('/brandxpere-icon.png');
  const [resolution, setResolution] = useState<number>(1000); // 1000px HD
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [contrastRatio, setContrastRatio] = useState<number>(5);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate contrast helper
  const getLuminance = (hex: string) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    const a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  useEffect(() => {
    try {
      const l1 = getLuminance(fgColor);
      const l2 = getLuminance(bgColor);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      setContrastRatio(parseFloat(ratio.toFixed(2)));
    } catch {
      setContrastRatio(5);
    }
  }, [fgColor, bgColor]);

  // Generate QR Canvas
  useEffect(() => {
    if (!canvasRef.current || !url.trim()) return;

    let active = true;
    const canvas = canvasRef.current;

    QRCode.toCanvas(canvas, url.trim(), {
      width: 480,
      margin: 2,
      errorCorrectionLevel: errorCorrection,
      color: {
        dark: fgColor,
        light: bgColor,
      },
    }, (err) => {
      if (err || !active) return;

      // Draw Center Logo if enabled
      if (includeLogo && customLogo) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!active) return;
          const logoSize = canvas.width * 0.22; // 22% of QR width
          const x = (canvas.width - logoSize) / 2;
          const y = (canvas.height - logoSize) / 2;

          // Draw background badge behind logo
          ctx.fillStyle = bgColor;
          ctx.beginPath();
          ctx.roundRect(x - 6, y - 6, logoSize + 12, logoSize + 12, 16);
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = fgColor + '33';
          ctx.stroke();

          // Draw logo image
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(x, y, logoSize, logoSize, 12);
          ctx.clip();
          ctx.drawImage(img, x, y, logoSize, logoSize);
          ctx.restore();
        };
        img.src = customLogo;
      }
    });

    return () => { active = false; };
  }, [url, fgColor, bgColor, errorCorrection, includeLogo, customLogo]);

  // Download High-Res PNG
  const handleDownloadPng = async () => {
    try {
      // Render to offscreen canvas at requested resolution
      const offCanvas = document.createElement('canvas');
      await QRCode.toCanvas(offCanvas, url.trim(), {
        width: resolution,
        margin: 3,
        errorCorrectionLevel: errorCorrection,
        color: { dark: fgColor, light: bgColor },
      });

      if (includeLogo && customLogo) {
        const ctx = offCanvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve) => {
            img.onload = () => {
              const logoSize = offCanvas.width * 0.22;
              const x = (offCanvas.width - logoSize) / 2;
              const y = (offCanvas.height - logoSize) / 2;

              ctx.fillStyle = bgColor;
              ctx.beginPath();
              ctx.roundRect(x - 12, y - 12, logoSize + 24, logoSize + 24, 32);
              ctx.fill();
              ctx.lineWidth = 4;
              ctx.strokeStyle = fgColor + '33';
              ctx.stroke();

              ctx.save();
              ctx.beginPath();
              ctx.roundRect(x, y, logoSize, logoSize, 24);
              ctx.clip();
              ctx.drawImage(img, x, y, logoSize, logoSize);
              ctx.restore();
              resolve();
            };
            img.onerror = () => resolve();
            img.src = customLogo;
          });
        }
      }

      const link = document.createElement('a');
      link.download = `brandxpere-qr-${Date.now()}.png`;
      link.href = offCanvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error(e);
    }
  };

  // Download Scalable Vector SVG
  const handleDownloadSvg = async () => {
    try {
      const svgString = await QRCode.toString(url.trim(), {
        type: 'svg',
        margin: 2,
        errorCorrectionLevel: errorCorrection,
        color: { dark: fgColor, light: bgColor },
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const link = document.createElement('a');
      link.download = `brandxpere-qr-${Date.now()}.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();
    } catch (e) {
      console.error(e);
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);
      });
    } catch (err) {
      console.error('Clipboard write failed', err);
    }
  };

  // Print Table Display
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                مولد رموز QR المخصص للروابط
              </h1>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">
                أداة معزولة ومستقلة لتوليد باركود لأي رابط خارجي أو صفحة
              </span>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
            قم بإنشاء باركود QR احترافي لأي موقع ويب، قائمة طعام، رابط واتساب، درايف، أو متجر إلكتروني بجودة فائقة مجهزة للطباعة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/qr"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
          >
            <span>QR البروفايلات الرقمية</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Controls & Customization */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. URL Input Block */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              1. الرابط أو المحتوى المستهدف (URL)
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://your-website.com أو رابط المنيو أو صفحة انستغرام..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 transition-all ltr text-left"
              />
            </div>

            {/* Quick Prefixes */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400">بادئات سريعة:</span>
              {[
                { label: 'موقع ويب (https://)', prefix: 'https://' },
                { label: 'واتساب مباشر (wa.me/)', prefix: 'https://wa.me/' },
                { label: 'انستغرام (instagram.com/)', prefix: 'https://instagram.com/' },
                { label: 'اتصال هاتفي (tel:)', prefix: 'tel:' },
              ].map(item => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (!url.startsWith(item.prefix)) setUrl(item.prefix);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 cursor-pointer transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Color Palette & Presets */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                2. تنسيق الألوان والمظهر
              </label>
              {contrastRatio < 3 && (
                <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  تباين ضعيف (قد يصعب مسحه)
                </span>
              )}
            </div>

            {/* Preset Swatches */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COLOR_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setFgColor(preset.fg);
                    setBgColor(preset.bg);
                  }}
                  className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-400 flex items-center gap-2.5 cursor-pointer transition-all text-right"
                  style={{
                    backgroundColor: preset.bg === '#FFFFFF' ? '#F8FAFC' : preset.bg,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full shrink-0 border border-black/10 shadow-sm"
                    style={{ backgroundColor: preset.fg }}
                  />
                  <span className="text-[11px] font-bold truncate" style={{ color: preset.bg === '#0F172A' || preset.bg === '#020617' ? '#FFFFFF' : '#1E293B' }}>
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">لون النقاط (Foreground)</span>
                  <span className="text-[10px] text-slate-400 font-mono">{fgColor}</span>
                </div>
                <input
                  type="color"
                  value={fgColor}
                  onChange={e => setFgColor(e.target.value)}
                  className="w-9 h-9 rounded-xl cursor-pointer border-0 bg-transparent"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">لون الخلفية (Background)</span>
                  <span className="text-[10px] text-slate-400 font-mono">{bgColor}</span>
                </div>
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className="w-9 h-9 rounded-xl cursor-pointer border-0 bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* 3. Logo & Advanced Settings */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              3. الشعار في المنتصف ودقة الطباعة
            </label>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLogo}
                    onChange={e => setIncludeLogo(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">تضمين شعار في المنتصف</span>
                </label>
              </div>

              {includeLogo && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomLogo('/brandxpere-icon.png')}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      customLogo === '/brandxpere-icon.png' 
                        ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-400 text-purple-700 dark:text-purple-300' 
                        : 'border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    شعار brandxpere
                  </button>

                  <label className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all">
                    رفع لوجو مخصص
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setCustomLogo(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Resolution Selector */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">دقة التصدير والطباعة:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { label: 'عادية (400px)', val: 400 },
                  { label: 'عالية HD (1000px)', val: 1000 },
                  { label: 'فائقة للمطابع (2000px)', val: 2000 },
                ].map(r => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => setResolution(r.val)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      resolution === r.val
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Preview & Export Actions */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
              معاينة الباركود المباشرة
            </span>

            {/* Canvas Container */}
            <div className="flex justify-center items-center p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto rounded-2xl shadow-lg transition-transform hover:scale-[1.02]"
              />
            </div>

            {/* URL Display */}
            <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate ltr">
              {url}
            </div>

            {/* Export Actions Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>تحميل PNG (HD)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSvg}
                className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <FileCode className="w-4 h-4" />
                <span>تحميل فيكتور SVG</span>
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleCopyImage}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                {copiedImage ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedImage ? 'تم النسخ!' : 'نسخ كصورة'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة كارت طاولة</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
