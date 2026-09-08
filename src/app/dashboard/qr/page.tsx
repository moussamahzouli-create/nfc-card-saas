'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { QrCode, Download, Printer, Copy, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function DedicatedQRManager() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // QR Customizer
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [contrastError, setContrastError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profiles');
      if (res.ok) {
        const list = await res.json();
        setProfiles(list);
        
        // Read URL query parameter
        const queryProfileId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('profileId') : null;
        const matched = list.find((p: any) => p.id === queryProfileId);
        
        if (matched) {
          setSelectedProfile(matched);
        } else if (list.length > 0) {
          setSelectedProfile(list[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Update local QR Preview when settings change
  useEffect(() => {
    async function updateQrPreview() {
      if (!selectedProfile) return;
      setContrastError(null);
      try {
        const canonical = `${window.location.origin}/c/${selectedProfile.slug}`;
        const res = await fetch('/api/qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: canonical,
            fgColor,
            bgColor,
            format: 'png',
          }),
        });

        if (res.ok) {
          const blob = await res.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setQrDataUrl(reader.result as string);
          };
          reader.readAsDataURL(blob);
        } else {
          const data = await res.json();
          if (data.error && data.error.includes('contrast')) {
            setContrastError('QR colors have insufficient contrast');
          } else {
            setContrastError(data.error || 'Failed to render QR Code');
          }
        }
      } catch (e) {
        console.error('Failed to fetch QR preview', e);
      }
    }
    updateQrPreview();
  }, [selectedProfile, fgColor, bgColor]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = profiles.find(item => item.id === e.target.value);
    if (p) setSelectedProfile(p);
  };

  const getCanonicalUrl = () => {
    if (!selectedProfile) return '';
    return `${window.location.origin}/c/${selectedProfile.slug}`;
  };

  const handleCopyLink = () => {
    const url = getCanonicalUrl();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setMessage('Canonical profile link copied to clipboard!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDownload = async (format: 'png' | 'svg') => {
    if (contrastError || !selectedProfile) return;
    try {
      const canonical = getCanonicalUrl();
      const res = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: canonical,
          fgColor,
          bgColor,
          format,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const sanitizedSlug = selectedProfile.slug.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        a.download = `profile-${sanitizedSlug}-qr.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    if (!selectedProfile || !qrDataUrl) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - Cardly</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
              img { width: 300px; height: 300px; }
              h1 { font-size: 24px; margin-bottom: 5px; }
              p { font-size: 14px; color: #666; margin-top: 5px; }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            <h1>${selectedProfile.name}</h1>
            <p>${getCanonicalUrl()}</p>
            <img src="${qrDataUrl}" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (loading && profiles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const publicUrl = getCanonicalUrl();

  return (
    <div className="space-y-8 font-sans max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">QR Code Generator</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Generate dynamic QR codes for any profile card.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/qr-generator"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>مولد QR للروابط المخصصة (أداة مستقلة) ✨</span>
          </Link>
          <button
            onClick={fetchProfiles}
            className="p-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-880 rounded-2xl transition-all cursor-pointer text-slate-500 dark:text-slate-405"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-bold rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
          <QrCode className="w-12 h-12 text-slate-400 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No profiles created yet</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
            Create your first profile card to enable dynamic QR code generation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Customizer */}
          <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2">
              <QrCode className="w-4.5 h-4.5 text-blue-500" />
              <span>QR Code Styling</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Select Profile</label>
                <select
                  value={selectedProfile?.id || ''}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.slug})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Foreground Color</label>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full h-11 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none p-1 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Background Color</label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full h-11 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none p-1 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview & Actions */}
          <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between text-center gap-6">
            <div className="space-y-4">
              <div className="w-48 h-48 bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-center shadow-sm relative">
                {contrastError ? (
                  <div className="absolute inset-0 bg-red-50/90 text-red-600 font-bold flex flex-col items-center justify-center p-4 text-xs text-center rounded-2xl">
                    <AlertTriangle className="w-6 h-6 mb-1 text-red-500" />
                    <span>{contrastError}</span>
                  </div>
                ) : (
                  qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      className="w-full h-full object-contain"
                      alt="Dynamic QR Code"
                    />
                  )
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Public Target Link</span>
              <p className="text-xs text-slate-500 font-bold break-all max-w-[200px]">{publicUrl}</p>
            </div>

            <div className="w-full space-y-2.5 text-xs font-bold">
              <button
                onClick={handleCopyLink}
                className="w-full py-3 bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Copy className="w-4 h-4 text-blue-500" />
                <span>Copy Link</span>
              </button>

              <button
                onClick={() => handleDownload('png')}
                disabled={!!contrastError}
                className="w-full py-3 bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-800 dark:text-slate-200 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-blue-500" />
                <span>Download PNG</span>
              </button>

              <button
                onClick={() => handleDownload('svg')}
                disabled={!!contrastError}
                className="w-full py-3 bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-800 dark:text-slate-200 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-blue-500" />
                <span>Download SVG</span>
              </button>

              <button
                onClick={handlePrint}
                disabled={!!contrastError}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-450 text-white rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print QR Code</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
