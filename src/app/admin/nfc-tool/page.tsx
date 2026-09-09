'use client';

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Cpu, CheckCircle2, AlertTriangle, RefreshCw, 
  ShieldCheck, Lock, Unlock, QrCode, ArrowRight, Sparkles, Copy, Check, Download
} from 'lucide-react';
import QRCode from 'qrcode';

export default function MobileNfcToolPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [useCustomUrl, setUseCustomUrl] = useState(false);
  const [lockTag, setLockTag] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // NFC States
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('اضغط على الزر أدناه والمس الكارت بظهر الهاتف');
  const [lastWritten, setLastWritten] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Check Web NFC support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'NDEFReader' in window;
      setIsSupported(supported);

      // Generate QR for opening on mobile phone if user is currently on PC
      const pageUrl = window.location.href;
      QRCode.toDataURL(pageUrl, { width: 220, margin: 2 })
        .then(url => setQrCodeDataUrl(url))
        .catch(console.error);
    }
  }, []);

  // Fetch profiles
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mobile/nfc/cards?filter=all');
      if (res.ok) {
        const data = await res.json();
        const list = data.items || [];
        setProfiles(list);
        if (list.length > 0) {
          // Prefer first pending card
          const pending = list.find((p: any) => p.status === 'PENDING');
          setSelectedProfile(pending || list[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching cards:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const getTargetUrl = () => {
    if (useCustomUrl && customUrl.trim()) return customUrl.trim();
    if (selectedProfile?.targetUrl) return selectedProfile.targetUrl;
    return 'https://www.brandxpere.com';
  };

  // Perform NFC Write & Lock
  const handleStartNfc = async () => {
    if (!('NDEFReader' in window)) {
      alert('مستشعر الـ NFC غير مدعوم في هذا المتصفح. يرجى فتح هذه الصفحة عبر متصفح Google Chrome على هاتف أندرويد.');
      return;
    }

    const targetUrl = getTargetUrl();
    setScanning(true);
    setLastWritten(null);
    setStatusMessage('📡 المستشعر نشط! ضع ظهر الهاتف الآن على كارت الـ NFC...');

    try {
      const ndef = new (window as any).NDEFReader();
      const ctrl = new AbortController();

      // 1. Listen for tag reading to capture UID
      let tagUid = 'UNKNOWN_UID';
      ndef.addEventListener('reading', (event: any) => {
        if (event.serialNumber) {
          tagUid = event.serialNumber;
        }
      }, { once: true });

      // 2. Write NDEF URL
      await ndef.write(
        {
          records: [{ recordType: 'url', data: targetUrl }]
        },
        { signal: ctrl.signal }
      );

      setStatusMessage('تمت كتابة الرابط بنجاح! جاري تأمين وقفل الكارت...');

      // 3. Hardware Lock (Make Read-Only) if selected
      let isLocked = false;
      if (lockTag && typeof ndef.makeReadOnly === 'function') {
        try {
          await ndef.makeReadOnly({ signal: ctrl.signal });
          isLocked = true;
          setStatusMessage('🔒 تم قفل الكارت نهائياً ضد أي تعديل أو مسح خارجي!');
        } catch (lockErr: any) {
          console.warn('makeReadOnly not supported or cancelled:', lockErr);
          setStatusMessage('تمت الكتابة بنجاح (لم يتم دعم أمر القفل النهائي على هذه الرقاقة)');
        }
      }

      // Haptic feedback vibration
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      // 4. Update SaaS Server
      try {
        await fetch('/api/mobile/nfc/complete-write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileId: selectedProfile?.id,
            profileSlug: selectedProfile?.slug,
            cardId: selectedProfile?.cardId || undefined,
            nfcUid: tagUid,
            chipType: 'NTAG213',
            lockType: isLocked ? 'PERMANENT_READ_ONLY' : 'PASSWORD_PROTECTED',
          }),
        });
      } catch (err) {
        console.error('Server sync error:', err);
      }

      setLastWritten({
        url: targetUrl,
        uid: tagUid,
        profileName: selectedProfile?.name || 'رابط مخصص',
        isLocked,
        time: new Date().toLocaleTimeString('ar-MA'),
      });

      setStatusMessage('✅ تم تجهيز الكارت وتوثيقه بنجاح على المنصة!');
      fetchProfiles(); // Refresh list
    } catch (err: any) {
      console.error('NFC Write error:', err);
      setStatusMessage(`❌ فشلت العملية: ${err.message || 'حدث خطأ في الاتصال بالرقاقة'}`);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 font-sans max-w-3xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">تطبيق برمجة كروت NFC للهاتف</h1>
            <span className="text-xs text-purple-400 font-bold">
              برمجة وقفل الكروت بلمسة واحدة مباشرة من الهاتف
            </span>
          </div>
        </div>
      </div>

      {/* Non-Android / PC Helper Notice */}
      {isSupported === false && (
        <div className="p-5 bg-purple-950/40 border border-purple-800/80 rounded-3xl mb-6 space-y-4 text-right">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>لتشغيل مستشعر الـ NFC والبرمجة بلمسة واحدة:</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            مستشعر الـ NFC يعمل مباشرة داخل متصفح <strong>Google Chrome على هواتف أندرويد</strong>. افتح هذه الصفحة على هاتفك الذكي للبدء بالبرمجة فوراً:
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            {qrCodeDataUrl && (
              <img src={qrCodeDataUrl} alt="Open on phone" className="w-36 h-36 rounded-xl bg-white p-2" />
            )}
            <div className="text-center sm:text-right space-y-2">
              <span className="text-xs font-bold text-slate-400 block">امسح الكود بكاميرا هاتفك:</span>
              <span className="text-xs font-mono text-purple-400 font-bold block dir-ltr truncate max-w-[240px]">
                {typeof window !== 'undefined' ? window.location.href : ''}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-all inline-flex items-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'تم نسخ الرابط' : 'نسخ رابط الصفحة'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Tool Body */}
      <div className="space-y-6">
        {/* 1. Client & Target Selection */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. اختيار بروفايل العميل أو الرابط المراد برمجته
            </label>
            <button
              type="button"
              onClick={fetchProfiles}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUseCustomUrl(false)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !useCustomUrl ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-400'
              }`}
            >
              بروفايلات المنصة
            </button>
            <button
              type="button"
              onClick={() => setUseCustomUrl(true)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                useCustomUrl ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-400'
              }`}
            >
              رابط مخصص خارجي
            </button>
          </div>

          {!useCustomUrl ? (
            <div>
              {loading ? (
                <div className="py-4 text-center text-xs text-slate-500">جاري تحميل البروفايلات...</div>
              ) : profiles.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">لا توجد بروفايلات مسجلة بعد</div>
              ) : (
                <select
                  value={selectedProfile?.id || ''}
                  onChange={(e) => {
                    const p = profiles.find((item: any) => item.id === e.target.value);
                    if (p) setSelectedProfile(p);
                  }}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {profiles.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.status === 'PENDING' ? '⏳ [جديد] ' : '✅ [مفعل] '}
                      {p.name} ({p.jobTitle || 'عضو'})
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://... أدخل أي رابط مخصص للكتابة على الكارت"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs font-mono text-white focus:outline-none focus:border-purple-500 dir-ltr text-left"
            />
          )}

          {/* Current Target Display */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-bold">الرابط المستهدف:</span>
            <span className="text-xs font-mono text-purple-400 font-bold dir-ltr truncate max-w-[260px]">
              {getTargetUrl()}
            </span>
          </div>
        </div>

        {/* 2. Hardware Security & Lock Toggle */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            2. حماية وتأمين الكارت من التعديل (Anti-Tamper Lock)
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-all">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${lockTag ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                {lockTag ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {lockTag ? 'تفعيل القفل النهائي للكارت (موصى به للعملاء)' : 'ترك الكارت قابلاً لإعادة الكتابة'}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {lockTag 
                    ? 'يمنع أي شخص أو تطبيق (مثل NFC Tools) من مسح أو استبدال الرابط على الكارت' 
                    : 'يمكن مسحه أو إعادة برمجته لاحقاً'}
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={lockTag}
              onChange={(e) => setLockTag(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded cursor-pointer"
            />
          </label>
        </div>

        {/* 3. NFC Interaction Pad */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-5">
          <div className="flex justify-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              scanning
                ? 'bg-purple-600/20 border-2 border-purple-500 animate-pulse scale-110 shadow-lg shadow-purple-600/30'
                : 'bg-slate-800/80 border border-slate-700'
            }`}>
              <Cpu className={`w-10 h-10 ${scanning ? 'text-purple-400 animate-spin' : 'text-slate-400'}`} />
            </div>
          </div>

          <div>
            <h3 className="text-base font-black text-white">
              {scanning ? 'المستشعر جاهز... ضع الكارت خلف الهاتف الآن!' : 'جاهز للبرمجة'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              {statusMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={handleStartNfc}
            disabled={scanning}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer active:scale-95 ${
              scanning
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-600/25'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            <span>{scanning ? 'جاري الاتصال بالرقاقة...' : 'بدء برمجة وقفل الكارت بلمسة واحدة ⚡'}</span>
          </button>
        </div>

        {/* Success Report Card */}
        {lastWritten && (
          <div className="p-5 bg-emerald-950/40 border border-emerald-800 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>تقرير البرمجة الأخير بنجاح:</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">العميل:</span>
                <span className="font-bold text-white">{lastWritten.profileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">معرف الرقاقة (UID):</span>
                <span className="font-mono text-emerald-400 font-bold">{lastWritten.uid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">حالة الحماية:</span>
                <span className="font-bold text-emerald-400">
                  {lastWritten.isLocked ? '🔒 مقفل نهائياً ضد التعديل' : 'مفتوح'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">وقت التنفيذ:</span>
                <span className="text-slate-400">{lastWritten.time}</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Standalone Native Mobile App Download Card */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Download className="w-5 h-5" />
              <span>تطبيق الهاتف المستقل (Brandxpere NFC Manager APK)</span>
            </div>
            <span className="text-[10px] bg-purple-950 text-purple-300 font-bold px-2 py-0.5 rounded-full">
              حزمة كاملة
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            إذا أردت تثبيت تطبيق أندرويد مستقل دائم على هواتف فريق العمل لبرمجة الكروت دون الحاجة للمتصفح، يمكنك تحميل حزمة التطبيق المجهزة بالكامل:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <a
              href="/brandxpere-nfc-mobile.zip"
              download="brandxpere-nfc-mobile.zip"
              className="py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل حزمة التطبيق (ZIP)</span>
            </a>

            <a
              href="https://play.google.com/store/apps/details?id=host.exp.exponent"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>تحميل مشغل Expo Go للهاتف</span>
            </a>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="text-[11px] font-bold text-slate-400">⚡ لتشغيل التطبيق على الهاتف في دقيقة واحدة:</div>
            <ol className="list-decimal list-inside text-[11px] text-slate-300 space-y-1">
              <li>حمل تطبيق <strong>Expo Go</strong> من Google Play على هاتفك.</li>
              <li>افتح مجلد التطبيق وشغل: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-purple-400 font-mono">cd apps/brandxpere-nfc-mobile && npm i && npx expo start</code></li>
              <li>امسح كود الـ QR بكاميرا هاتفك وسيفتح التطبيق فوراً وتبدأ بالبرمجة!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
