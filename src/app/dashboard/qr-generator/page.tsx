'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { 
  QrCode, Download, Printer, Copy, Check, Sparkles, RefreshCw, 
  ExternalLink, Sliders, ShieldCheck, AlertTriangle, Image as ImageIcon, 
  Share2, ArrowRight, Layers, FileCode, CheckCircle2, Eye, Info
} from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'الأسود الملكي للطباعة', fg: '#090D16', bg: '#FFFFFF' },
  { name: 'هوية Brandxpere', fg: '#8A509E', bg: '#FFFFFF' },
  { name: 'الأزرق النيلي', fg: '#1E40AF', bg: '#FFFFFF' },
  { name: 'الأخضر الزمردي', fg: '#047857', bg: '#FFFFFF' },
  { name: 'الأحمر الياقوتي', fg: '#BE123C', bg: '#FFFFFF' },
  { name: 'الذهبي الفاخر', fg: '#B45309', bg: '#FFFBEB' },
  { name: 'داكن نيون', fg: '#A855F7', bg: '#0F172A' },
  { name: 'أبيض على داكن', fg: '#F8FAFC', bg: '#020617' },
];

export default function StandaloneQRGenerator() {
  const [url, setUrl] = useState('https://www.brandxpere.com');
  const [fgColor, setFgColor] = useState('#090D16');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  // Default to 'L' (Low error correction = least dense, largest dots, ultra light and print-friendly)
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('L');
  // Default includeLogo to false so QR code isn't crowded with micro-dots
  const [includeLogo, setIncludeLogo] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>('/brandxpere-icon.png');
  const [margin, setMargin] = useState<number>(3);
  const [resolution, setResolution] = useState<number>(1000); // 1000px HD
  const [previewMode, setPreviewMode] = useState<'canvas' | 'card'>('canvas');
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [contrastRatio, setContrastRatio] = useState<number>(21);

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

  // Handle Logo Toggle: Automatically pick appropriate density
  const handleToggleLogo = (enable: boolean) => {
    setIncludeLogo(enable);
    if (enable) {
      // Placing a center logo blocks ~20-25% of QR area, requiring Level H for scan reliability
      setErrorCorrection('H');
    } else {
      // Revert to Level L for spacious, light, uncluttered modules
      setErrorCorrection('L');
    }
  };

  // 1-Click Fast Print Setup
  const handleApplyPrintPreset = () => {
    setErrorCorrection('L');
    setIncludeLogo(false);
    setFgColor('#090D16');
    setBgColor('#FFFFFF');
    setMargin(4);
    setResolution(2000);
  };

  // Generate QR Canvas
  useEffect(() => {
    if (!canvasRef.current || !url.trim()) return;

    let active = true;
    const canvas = canvasRef.current;

    QRCode.toCanvas(canvas, url.trim(), {
      width: 480,
      margin: margin,
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
  }, [url, fgColor, bgColor, errorCorrection, includeLogo, customLogo, margin]);

  // Download High-Res PNG
  const handleDownloadPng = async () => {
    try {
      const offCanvas = document.createElement('canvas');
      await QRCode.toCanvas(offCanvas, url.trim(), {
        width: resolution,
        margin: margin,
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
      link.download = `brandxpere-qr-${errorCorrection === 'L' ? 'light' : 'dense'}-${Date.now()}.png`;
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
        margin: margin,
        errorCorrectionLevel: errorCorrection,
        color: { dark: fgColor, light: bgColor },
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const link = document.createElement('a');
      link.download = `brandxpere-qr-${errorCorrection === 'L' ? 'light' : 'dense'}-${Date.now()}.svg`;
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

  // Print Formatted Stand / Card
  const handlePrint = () => {
    if (!canvasRef.current) return;
    const imgData = canvasRef.current.toDataURL('image/png');
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <title>طباعة رمز QR مخصص للطباعة - Brandxpere</title>
          <style>
            @media print {
              body { margin: 0; padding: 20mm; background: white !important; }
              .no-print { display: none !important; }
              .card { box-shadow: none !important; border: 1.5px dashed #94a3b8 !important; }
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              background: #f8fafc;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 30px;
              box-sizing: border-box;
            }
            .card {
              background: white;
              border: 2px dashed #cbd5e1;
              border-radius: 28px;
              padding: 36px 32px;
              max-width: 360px;
              width: 100%;
              text-align: center;
              box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            }
            .brand-tag {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #8A509E;
              background: #fdf4ff;
              display: inline-block;
              padding: 4px 12px;
              border-radius: 999px;
              margin-bottom: 12px;
            }
            .title {
              font-size: 22px;
              font-weight: 900;
              color: #0f172a;
              margin: 0 0 6px 0;
            }
            .subtitle {
              font-size: 13px;
              color: #64748b;
              margin: 0 0 22px 0;
              font-weight: 500;
            }
            .qr-wrapper {
              background: #ffffff;
              display: inline-block;
              padding: 12px;
              border-radius: 20px;
              border: 1px solid #e2e8f0;
            }
            .qr-img {
              width: 230px;
              height: 230px;
              display: block;
            }
            .url {
              font-family: monospace;
              font-size: 11px;
              color: #334155;
              margin-top: 18px;
              word-break: break-all;
              direction: ltr;
              background: #f1f5f9;
              padding: 6px 12px;
              border-radius: 8px;
            }
            .footer-tip {
              font-size: 11px;
              color: #94a3b8;
              margin-top: 14px;
              font-weight: 600;
            }
            .print-btn {
              margin-top: 24px;
              padding: 12px 28px;
              background: #8A509E;
              color: white;
              font-weight: bold;
              border: none;
              border-radius: 16px;
              cursor: pointer;
              font-size: 15px;
              box-shadow: 0 4px 14px rgba(138,80,158,0.3);
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand-tag">Brandxpere Smart Code</div>
            <h1 class="title">امسح الرمز للتواصل</h1>
            <p class="subtitle">وجه كاميرا الهاتف إلى الرمز للمتابعة الفورية</p>
            <div class="qr-wrapper">
              <img src="${imgData}" class="qr-img" alt="QR Code" />
            </div>
            <div class="url">${url}</div>
            <div class="footer-tip">رمز خفيف عالي الدقة مُهيأ للطباعة والمسح السريع</div>
          </div>
          <button class="print-btn no-print" onclick="window.print()">🖨️ اضغط للطباعة الآن</button>
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 450);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
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
                أداة معزولة ومستقلة لتوليد باركود خفيف ونظيف وسهل الطباعة لأي رابط
              </span>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
            تم ضبط الباركود افتراضياً بنمط <strong>خفيف ومتباعد</strong> بنقاط عريضة يسهل طباعتها على كروت العمل، وقوائم المطاعم، والملصقات دون تداخل الأحبار.
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

          {/* 2. Density & Print Optimization Mode (CORE FIX FOR USER REQUEST) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  2. كثافة الرمز ونمط الطباعة (QR Density)
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  تحكم بحجم النقاط وخفتها لتسهيل الطباعة وسرعة المسح
                </span>
              </div>

              {/* 1-Click Fast Print Setup Button */}
              <button
                type="button"
                onClick={handleApplyPrintPreset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                title="يضبط الرمز فوراً بأعلى خفة وأفضل ألوان للمطابع"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>⚡ ضبط سريع للمطابع (خفيف جداً)</span>
              </button>
            </div>

            {/* 3 Density Level Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Level L - Light */}
              <button
                type="button"
                onClick={() => {
                  setErrorCorrection('L');
                  if (includeLogo) setIncludeLogo(false);
                }}
                className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer relative flex flex-col justify-between ${
                  errorCorrection === 'L'
                    ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-500 text-purple-900 dark:text-purple-200 shadow-sm ring-1 ring-purple-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black">خفيف ومثالي للطباعة ⭐</span>
                    {errorCorrection === 'L' && <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    نقاط عريضة ومتباعدة وغير مزدحمة، يسهل مسحه من مسافة بعيدة ويمنع تداخل الحبر عند الطباعة.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-purple-200/60 dark:border-purple-900/50 flex items-center justify-between text-[10px] font-bold text-purple-700 dark:text-purple-300">
                  <span>مستوى L (7% تصحيح)</span>
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[9px]">
                    موصى به
                  </span>
                </div>
              </button>

              {/* Level M - Balanced */}
              <button
                type="button"
                onClick={() => {
                  setErrorCorrection('M');
                }}
                className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  errorCorrection === 'M'
                    ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-500 text-purple-900 dark:text-purple-200 shadow-sm ring-1 ring-purple-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black">متوازن (القياسي)</span>
                    {errorCorrection === 'M' && <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    كثافة متوسطة، يوفر توازناً قياسياً بين عدد النقاط وقابلية تعافي الرمز عند الخدوش.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span>مستوى M (15% تصحيح)</span>
                </div>
              </button>

              {/* Level H - Dense (for Logo) */}
              <button
                type="button"
                onClick={() => {
                  setErrorCorrection('H');
                }}
                className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  errorCorrection === 'H'
                    ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-500 text-purple-900 dark:text-purple-200 shadow-sm ring-1 ring-purple-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black">كثيف (مخصص للشعار)</span>
                    {errorCorrection === 'H' && <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    نقاط صغيرة ومزدحمة، مخصص عند وضع صورة أو لوجو في المنتصف لتعويض المساحة المحجوبة.
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-500">
                  <span>مستوى H (30% تصحيح)</span>
                </div>
              </button>
            </div>

            {/* Explanatory Banner */}
            <div className="p-3 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <div className="text-[11px] leading-relaxed">
                <strong>لماذا يفضل النمط الخفيف؟</strong> عند طباعة الباركود على كروت بحجم صغير أو طابعات إيصالات حرارية، تتسبب الكثافة العالية بازدحام النقاط وسيلان الحبر. النمط الخفيف يمنح الرمز مساحات بيضاء واسعة تتيح لأي هاتف قراءته في أجزاء من الثانية.
              </div>
            </div>
          </div>

          {/* 3. Color Palette & Presets */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                3. تنسيق الألوان والمظهر
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

          {/* 4. Margin & Logo & Resolution */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              4. خيارات الإطار وهوامش الطباعة والشعار
            </label>

            {/* Margin / Quiet Zone selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  هامش الأمان حول الرمز (Quiet Zone):
                </span>
                <span className="text-[10px] text-slate-400">
                  إطار فارغ يحيط بالرمز لحمايته من التداخل مع حواف الكارت
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { label: 'إطار ضيق (2)', val: 2 },
                  { label: 'متوازن (3)', val: 3 },
                  { label: 'قياسي للطباعة (4)', val: 4 },
                  { label: 'عريض (5)', val: 5 },
                ].map(m => (
                  <button
                    key={m.val}
                    type="button"
                    onClick={() => setMargin(m.val)}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      margin === m.val
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Settings */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLogo}
                    onChange={e => handleToggleLogo(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">تضمين شعار في المنتصف</span>
                </label>
                {includeLogo && (
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md">
                    تم رفع الكثافة تلقائياً لدعم الشعار
                  </span>
                )}
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
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 text-center">
            {/* View Mode Toggle: Raw Canvas vs Card Mockup */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                معاينة الباركود
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewMode('canvas')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    previewMode === 'canvas'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  رمز مباشر
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('card')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    previewMode === 'card'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  محاكاة كارت مطبوع
                </button>
              </div>
            </div>

            {/* Density State Badge */}
            <div className="flex items-center justify-center gap-2">
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                errorCorrection === 'L'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
                  : errorCorrection === 'M'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                  : 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {errorCorrection === 'L'
                  ? 'نمط خفيف جداً ومثالي للطباعة (مربعات كبيرة)'
                  : errorCorrection === 'M'
                  ? 'نمط متوازن (كثافة متوسطة)'
                  : 'نمط كثيف (مخصص للشعارات)'}
              </span>
            </div>

            {/* Preview Display: Canvas or Realistic Card Mockup */}
            {previewMode === 'canvas' ? (
              <div className="flex justify-center items-center p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[300px]">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto rounded-2xl shadow-md transition-transform hover:scale-[1.02]"
                />
              </div>
            ) : (
              /* Realistic Card Mockup */
              <div className="p-6 bg-slate-100 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 flex justify-center">
                <div className="w-full max-w-[280px] bg-white rounded-2xl p-5 shadow-xl border border-slate-200/80 text-center space-y-3">
                  <div className="inline-block bg-purple-50 text-purple-700 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    امسح للتواصل
                  </div>
                  <h4 className="text-sm font-black text-slate-900">Brandxpere Smart NFC</h4>
                  <div className="flex justify-center">
                    <canvas
                      ref={canvasRef}
                      className="w-[180px] h-[180px] rounded-xl shadow-xs border border-slate-100"
                    />
                  </div>
                  <p className="text-[9px] font-mono text-slate-400 truncate dir-ltr">
                    {url}
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold">
                    وجه كاميرا الهاتف للمسح الفوري
                  </p>
                </div>
              </div>
            )}

            {/* URL Display */}
            <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate ltr">
              {url}
            </div>

            {/* Export Actions Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
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

            {/* Secondary Actions: Copy Image & Direct Print */}
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
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>طباعة كارت طاولة فوراً</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
