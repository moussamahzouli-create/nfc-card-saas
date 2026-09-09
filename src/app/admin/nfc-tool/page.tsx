'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, Cpu, CheckCircle2, AlertTriangle, RefreshCw, 
  ShieldCheck, Lock, Unlock, QrCode, ArrowRight, Sparkles, 
  Copy, Check, Download, ExternalLink, Eye, HelpCircle, XCircle, Wifi, Zap, 
  ChevronDown, ChevronUp, KeyRound, ShieldAlert
} from 'lucide-react';
import QRCode from 'qrcode';

// Audio feedback helper using Web Audio API
function playSound(type: 'success' | 'beep' | 'error') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'beep') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      osc.frequency.setValueAtTime(146.83, ctx.currentTime + 0.12); // D3
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    // AudioContext blocked or not supported
  }
}

export default function MobileNfcToolPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [useCustomUrl, setUseCustomUrl] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Auto-lock toggle during write
  const [autoLockAfterWrite, setAutoLockAfterWrite] = useState(false);

  // Live Generated QR for the selected target
  const [cardQrCode, setCardQrCode] = useState<string>('');

  // NFC States
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [currentAction, setCurrentAction] = useState<'WRITE' | 'READ' | 'LOCK' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('اختر البروفايل واضغط على زر البرمجة أو القفل أدناه');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastWritten, setLastWritten] = useState<any>(null);
  const [lastLocked, setLastLocked] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Diagnostic Read States
  const [showDiagnostic, setShowDiagnostic] = useState(true);
  const [readTagData, setReadTagData] = useState<any>(null);

  // Password / NFC Tools Guide State
  const [showPasswordGuide, setShowPasswordGuide] = useState(false);

  // Guide Section State
  const [showGuide, setShowGuide] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

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
        if (list.length > 0 && !selectedProfile) {
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
    let url = '';
    if (useCustomUrl && customUrl.trim()) {
      url = customUrl.trim();
    } else if (selectedProfile?.targetUrl) {
      url = selectedProfile.targetUrl;
    } else {
      url = 'https://www.brandxpere.com';
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  };

  // Generate QR code whenever target URL changes
  useEffect(() => {
    const url = getTargetUrl();
    if (url) {
      QRCode.toDataURL(url, { width: 260, margin: 2 })
        .then(dataUrl => setCardQrCode(dataUrl))
        .catch(console.error);
    }
  }, [selectedProfile, customUrl, useCustomUrl]);

  // Cancel any active NFC session
  const cancelNfcSession = () => {
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {}
      abortControllerRef.current = null;
    }
    setScanning(false);
    setCurrentAction(null);
    setStatusMessage('تم إلغاء عملية المسح.');
  };

  // Translate and handle NFC errors
  const handleNfcError = (err: any, actionType: string) => {
    console.error('NFC error:', err);
    playSound('error');

    if (err.name === 'AbortError') {
      setStatusMessage('تم إيقاف المسح.');
      return;
    }

    let userFriendlyError = '';
    if (err.name === 'NotAllowedError') {
      userFriendlyError = 'تم رفض الإذن أو أن مستشعر NFC معطل في إعدادات هاتفك. تأكد من تفعيل NFC في الهاتف ومنح المتصفح الإذن.';
    } else if (err.name === 'NotSupportedError') {
      userFriendlyError = 'الرقاقة غير مدعومة في متصفح كروم أو أن الكارت مقفل مسبقاً. تأكد من استخدام بطاقات NTAG213 أو NTAG215 أو NTAG216 القياسية.';
    } else if (err.name === 'NetworkError') {
      userFriendlyError = 'انقطع الاتصال بالرقاقة أثناء العملية. يرجى تثبيت الكارت جيداً ملاصقاً لأعلى ظهر الهاتف (بجانب الكاميرا) لمدة ثانيتين كاملتين دون إبعاده بسرعة حتى يهتز الهاتف.';
    } else if (err.name === 'InvalidStateError') {
      userFriendlyError = 'توجد عملية NFC قيد التشغيل بالفعل. أعد الضغط على الزر للمحاولة.';
    } else {
      userFriendlyError = err.message || 'حدث خطأ غير متوقع أثناء الاتصال بالرقاقة.';
    }

    setErrorMessage(userFriendlyError);
    setStatusMessage(`❌ تعذر إكمال العملية: ${userFriendlyError}`);
  };

  // 1. PRIMARY ACTION: WRITE NFC TAG (Instant Single-Tap)
  const handleStartWriteNfc = async () => {
    if (!('NDEFReader' in window)) {
      alert('مستشعر الـ NFC غير مدعوم في هذا المتصفح. يرجى فتح هذه الصفحة عبر متصفح Google Chrome على هاتف أندرويد.');
      return;
    }

    cancelNfcSession();
    const targetUrl = getTargetUrl();

    setScanning(true);
    setCurrentAction('WRITE');
    setErrorMessage(null);
    setLastWritten(null);
    setLastLocked(false);
    setStatusMessage('📡 المستشعر جاهز للكتابة! ألصق الكارت الآن بأعلى ظهر الهاتف (بجانب الكاميرا)...');
    playSound('beep');

    const ctrl = new AbortController();
    abortControllerRef.current = ctrl;

    const timeoutId = setTimeout(() => {
      if (ctrl && !ctrl.signal.aborted) {
        ctrl.abort();
        setScanning(false);
        setCurrentAction(null);
        setErrorMessage('انتهت مهلة الانتظار (45 ثانية). تأكد من تقريب الكارت من أعلى ظهر الهاتف قرب الكاميرا.');
      }
    }, 45000);

    try {
      const ndef = new (window as any).NDEFReader();

      // Write URL record directly
      await ndef.write(
        {
          records: [{ recordType: 'url', data: targetUrl }]
        },
        { signal: ctrl.signal }
      );

      clearTimeout(timeoutId);
      playSound('success');

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([150, 60, 200]);
      }

      // If auto-lock was enabled, prompt to lock
      let isLocked = false;
      if (autoLockAfterWrite && typeof ndef.makeReadOnly === 'function') {
        setStatusMessage('تمت كتابة الرابط! أبقِ الكارت ملاصقاً للهاتف لقفل الرقاقة نهائياً...');
        try {
          await new Promise(r => setTimeout(r, 600));
          await ndef.makeReadOnly({ signal: ctrl.signal });
          isLocked = true;
          setLastLocked(true);
          playSound('success');
        } catch (lockErr) {
          console.warn('Auto-lock note:', lockErr);
          setStatusMessage('تمت كتابة الرابط بنجاح! (لقفل الكارت، استخدم زر القفل المخصص أدناه وثبت الكارت لثانيتين)');
        }
      }

      // Sync with SaaS platform
      try {
        await fetch('/api/mobile/nfc/complete-write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileId: selectedProfile?.id,
            profileSlug: selectedProfile?.slug,
            cardId: selectedProfile?.cardId || undefined,
            chipType: 'NTAG213',
            lockType: isLocked ? 'PERMANENT_READ_ONLY' : 'NONE',
          }),
        });
      } catch (err) {
        console.warn('Backend sync note:', err);
      }

      setLastWritten({
        url: targetUrl,
        profileName: selectedProfile?.name || 'رابط مخصص',
        profileSlug: selectedProfile?.slug,
        isLocked,
        time: new Date().toLocaleTimeString('ar-MA'),
      });

      setStatusMessage(isLocked ? '🔒 تم برمجة وقفل الكارت نهائياً بنجاح!' : '✅ تم نسخ وبرمجة الرابط بنجاح على الكارت!');
      fetchProfiles();
    } catch (err: any) {
      clearTimeout(timeoutId);
      handleNfcError(err, 'WRITE');
    } finally {
      setScanning(false);
      setCurrentAction(null);
    }
  };

  // 2. DEDICATED LOCK ACTION (Make Read-Only)
  const handleStartLockNfc = async () => {
    if (!('NDEFReader' in window)) {
      alert('مستشعر الـ NFC غير مدعوم في هذا المتصفح. استخدم متصفح Google Chrome على هاتف أندرويد.');
      return;
    }

    const confirmed = window.confirm(
      '⚠️ تأكيد قفل الكارت نهائياً (Make Read-Only):\n\n' +
      'هذه العملية ستقوم بحرق بتات القفل في الشريحة وتجعل الكارت للقراءة فقط للأبد!\n' +
      'لن يتمكن أي شخص أو أي تطبيق (بما في ذلك NFC Tools) من مسح أو تعديل الرابط على هذا الكارت مجدداً.\n\n' +
      'هل الكارت مبرمج بالرابط الصحيح وتريد قفله نهائياً الآن؟'
    );

    if (!confirmed) return;

    cancelNfcSession();
    setScanning(true);
    setCurrentAction('LOCK');
    setErrorMessage(null);
    setStatusMessage('🔒 مستشعر القفل نشط الآن! ألصق الكارت بأعلى ظهر الهاتف (بجانب الكاميرا) وثبته لمدة ثانيتين كاملتين دون تحريكه...');
    playSound('beep');

    const ctrl = new AbortController();
    abortControllerRef.current = ctrl;

    const timeoutId = setTimeout(() => {
      if (ctrl && !ctrl.signal.aborted) {
        ctrl.abort();
        setScanning(false);
        setCurrentAction(null);
        setErrorMessage('انتهت مهلة القفل. تأكد من تثبيت الكارت جيداً بجانب الكاميرا.');
      }
    }, 45000);

    try {
      const ndef = new (window as any).NDEFReader();
      if (typeof ndef.makeReadOnly !== 'function') {
        throw new Error('خاصية القفل النهائي غير مدعومة في إصدار متصفح كروم الحالي.');
      }

      await ndef.makeReadOnly({ signal: ctrl.signal });

      clearTimeout(timeoutId);
      playSound('success');
      setLastLocked(true);

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 300]);
      }

      setStatusMessage('🔒 تم قفل الكارت نهائياً بنجاح! أصبح الكارت للقراءة فقط (Read-Only) ولا يمكن تعديله أو مسحه أبداً.');
    } catch (err: any) {
      clearTimeout(timeoutId);
      handleNfcError(err, 'LOCK');
    } finally {
      setScanning(false);
      setCurrentAction(null);
    }
  };

  // 3. DIAGNOSTIC READ ACTION
  const handleStartReadNfc = async () => {
    if (!('NDEFReader' in window)) {
      alert('مستشعر الـ NFC غير مدعوم في هذا المتصفح. استخدم متصفح Google Chrome على هاتف أندرويد.');
      return;
    }

    cancelNfcSession();
    setScanning(true);
    setCurrentAction('READ');
    setErrorMessage(null);
    setReadTagData(null);
    setStatusMessage('🔍 المستشعر نشط في وضع الفحص! ضع أي كارت NFC الآن خلف الكاميرا لفحصه...');
    playSound('beep');

    const ctrl = new AbortController();
    abortControllerRef.current = ctrl;

    const timeoutId = setTimeout(() => {
      if (ctrl && !ctrl.signal.aborted) {
        ctrl.abort();
        setScanning(false);
        setCurrentAction(null);
        setErrorMessage('انتهت مهلة الفحص. تأكد من لصق الكارت بظهر الهاتف.');
      }
    }, 45000);

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan({ signal: ctrl.signal });

      ndef.addEventListener('reading', ({ serialNumber, message }: any) => {
        clearTimeout(timeoutId);
        playSound('success');

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }

        const recordsParsed: any[] = [];
        if (message && message.records) {
          for (const record of message.records) {
            let content = '';
            try {
              if (record.recordType === 'url') {
                const textDecoder = new TextDecoder();
                content = textDecoder.decode(record.data);
              } else if (record.recordType === 'text') {
                const textDecoder = new TextDecoder(record.encoding || 'utf-8');
                content = textDecoder.decode(record.data);
              } else {
                content = `سجل من نوع (${record.recordType}) بحجم ${record.data?.byteLength || 0} بايت`;
              }
            } catch (decErr) {
              content = 'محتوى غير قابل للقراءة كنص';
            }

            recordsParsed.push({
              type: record.recordType,
              content,
            });
          }
        }

        setReadTagData({
          serialNumber: serialNumber || 'غير محدد من النظام',
          recordsCount: recordsParsed.length,
          records: recordsParsed,
          time: new Date().toLocaleTimeString('ar-MA'),
        });

        setStatusMessage('✅ تم فحص وقراءة بيانات الكارت بنجاح!');
        cancelNfcSession();
      }, { signal: ctrl.signal });

    } catch (err: any) {
      clearTimeout(timeoutId);
      handleNfcError(err, 'READ');
      setScanning(false);
      setCurrentAction(null);
    }
  };

  const filteredProfiles = profiles.filter((p: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q) ||
      p.jobTitle?.toLowerCase().includes(q) ||
      p.company?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 font-sans max-w-3xl mx-auto pb-28" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">برمجة وقفل كروت الـ NFC</h1>
            <span className="text-xs text-purple-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              كتابة الرابط، توليد الـ QR، وقفل الكارت ضد التعديل نهائياً
            </span>
          </div>
        </div>

        {/* NFC Capability Badge */}
        <div>
          {isSupported === true ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              NFC جاهز 🟢
            </span>
          ) : isSupported === false ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950 border border-amber-800 text-amber-300 text-xs font-bold">
              يتطلب هاتف أندرويد
            </span>
          ) : null}
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
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700 transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'تم نسخ الرابط' : 'نسخ رابط الصفحة'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Single Flow Workspace */}
      <div className="space-y-6">
        {/* Step 1: Profile & Target Selection Card */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black">1</span>
              <span>اختيار البروفايل المراد برمجته وقفله</span>
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
              بروفايلات المنصة ({profiles.length})
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
            <div className="space-y-2">
              {profiles.length > 5 && (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 ابحث بالاسم أو الشركة..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              )}

              {loading ? (
                <div className="py-4 text-center text-xs text-slate-500">جاري تحميل البروفايلات...</div>
              ) : filteredProfiles.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">لا توجد بروفايلات مطابقة للبحث</div>
              ) : (
                <select
                  value={selectedProfile?.id || ''}
                  onChange={(e) => {
                    const p = profiles.find((item: any) => item.id === e.target.value);
                    if (p) setSelectedProfile(p);
                  }}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {filteredProfiles.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.status === 'PENDING' ? '⏳ [جديد] ' : '✅ [مبرمج] '}
                      {p.name} — {p.jobTitle || 'عضو'}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://... أدخل الرابط المستهدف هنا"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs font-mono text-white focus:outline-none focus:border-purple-500 dir-ltr text-left"
              />
              <span className="text-[10px] text-slate-400 block text-right">
                مثال: https://www.brandxpere.com/c/your-slug
              </span>
            </div>
          )}

          {/* Target URL & QR Code Live Box */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 font-bold shrink-0">الرابط المبرمج:</span>
              <span className="text-xs font-mono text-purple-400 font-bold dir-ltr truncate">
                {getTargetUrl()}
              </span>
              <a
                href={getTargetUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                title="معاينة الرابط في نافذة جديدة"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Generated QR Code Card */}
            {cardQrCode && (
              <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={cardQrCode} 
                    alt="QR Code" 
                    className="w-20 h-20 bg-white p-1.5 rounded-xl shadow-md shrink-0" 
                  />
                  <div className="text-right space-y-1">
                    <span className="text-xs font-bold text-white block">كود الـ QR جاهز للمسح والطباعة 🖨️</span>
                    <span className="text-[10px] text-slate-400 block">
                      يمكنك تحميل هذا الكود أو طباعته مباشرة على الكارت.
                    </span>
                  </div>
                </div>

                <a
                  href={cardQrCode}
                  download={`qr-${selectedProfile?.slug || 'card'}.png`}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>تحميل كود الـ QR</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: The Primary NFC Write Pad */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
              <span>برمجة كارت الـ NFC</span>
            </span>
            <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800/80">
              عملية فورية ⚡
            </span>
          </div>

          {/* Visual placement helper */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="relative w-24 h-36 rounded-3xl border-2 border-slate-700 bg-slate-950 p-2 flex flex-col items-center justify-between shadow-inner">
              {/* Camera Bump */}
              <div className="w-10 h-5 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-600"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
              </div>

              {/* Pulsating NFC Target */}
              <div className="relative flex items-center justify-center my-auto">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  scanning && currentAction === 'WRITE'
                    ? 'bg-purple-600/30 border-2 border-purple-400 animate-ping'
                    : 'bg-slate-800/60 border border-slate-700'
                }`}></div>
                <div className="absolute w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Wifi className="w-4 h-4 rotate-90" />
                </div>
              </div>

              <span className="text-[8px] text-slate-500 font-bold">لاقط NFC</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs font-bold text-amber-300 block">
                مكان اللمس: أعلى ظهر الهاتف (بجانب الكاميرا مباشرة)
              </span>
              <span className="text-[11px] text-slate-400 block">
                ثبّت الكارت ملاصقاً للهاتف لمدة <strong>ثانيتين</strong> حتى تشعر بالاهتزاز أو تسمع النغمة
              </span>
            </div>
          </div>

          {/* Auto Lock Checkbox */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-right">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoLockAfterWrite}
                onChange={(e) => setAutoLockAfterWrite(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded cursor-pointer shrink-0"
              />
              <div>
                <span className="text-xs font-bold text-white block">
                  قفل الكارت تلقائياً فور كتابة الرابط (Auto-Lock)
                </span>
                <span className="text-[10px] text-slate-400 block">
                  يقوم بحرق بتات القفل فوراً لجعل الكارت للقراءة فقط وحمايته من أي مسح أو تعديل.
                </span>
              </div>
            </label>
          </div>

          {/* Status Message */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 max-w-md mx-auto">
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {statusMessage}
            </p>
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-2xl text-right flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-rose-300 block">تنبيه أثناء العملية:</span>
                <p className="text-rose-200 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="space-y-2">
            {!scanning ? (
              <button
                type="button"
                onClick={handleStartWriteNfc}
                className="w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-600/25 active:scale-98 transition-all cursor-pointer"
              >
                <Zap className="w-5 h-5" />
                <span>كتابة وبرمجة الكود على الكارت بلمسة واحدة ⚡</span>
              </button>
            ) : currentAction === 'WRITE' ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled
                  className="flex-1 py-4 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-slate-800 text-purple-300 border border-purple-500/40 animate-pulse"
                >
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>المستشعر نشط... ألصق الكارت بظهر الهاتف الآن</span>
                </button>

                <button
                  type="button"
                  onClick={cancelNfcSession}
                  className="py-4 px-5 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 transition-all cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>إلغاء</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Step 3: THE DEDICATED LOCK & PROTECT SECTION (Always Visible!) */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-900 border-2 border-rose-800/60 rounded-3xl space-y-4 text-right">
          <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
            <div className="flex items-center gap-2 text-rose-400 font-black text-sm">
              <Lock className="w-5 h-5" />
              <span>3. قفل الكارت نهائياً ضد التعديل أو المسح (Permanent Read-Only)</span>
            </div>
            {lastLocked ? (
              <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full">
                🔒 مقفل ومحمي
              </span>
            ) : (
              <span className="text-[10px] bg-rose-950 border border-rose-800 text-rose-300 font-bold px-2.5 py-0.5 rounded-full">
                حماية أمنية
              </span>
            )}
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-rose-900/30 space-y-2 text-xs text-slate-300 leading-relaxed">
            <p className="font-bold text-white">
              🛡️ هل برمجت الكارت وتريد قفله الآن لمنع أي شخص من استبداله أو مسحه؟
            </p>
            <p className="text-slate-400">
              القفل النهائي يقوم بحرق بتات القفل الدائمة (Lock Bits) في شريحة الكارت.
              <strong> بعد القفل، لن يتمكن أي تطبيق (بما في ذلك NFC Tools) من مسح أو تغيير الرابط نهائياً!</strong>
            </p>
            <div className="p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-200 text-[11px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>ملاحظة هامة للقفل الناجح: ألصق الكارت بأعلى ظهر الهاتف (بجانب الكاميرا مباشرة) وثبّته لمدة <strong>ثانيتين كاملتين</strong> دون سحبه حتى يهتز الهاتف.</span>
            </div>
          </div>

          {/* Lock Action Button */}
          <div>
            {!scanning ? (
              <button
                type="button"
                onClick={handleStartLockNfc}
                className="w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-700 hover:to-red-800 text-white shadow-xl shadow-rose-600/25 active:scale-98 transition-all cursor-pointer"
              >
                <Lock className="w-5 h-5" />
                <span>🔒 قفل هذا الكارت نهائياً الآن ضد أي تعديل</span>
              </button>
            ) : currentAction === 'LOCK' ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled
                  className="flex-1 py-4 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-slate-800 text-rose-300 border border-rose-500/40 animate-pulse"
                >
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>المستشعر ينتظر الكارت... ثبته خلف الكاميرا لثانيتين</span>
                </button>

                <button
                  type="button"
                  onClick={cancelNfcSession}
                  className="py-4 px-5 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>إلغاء</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Step 4: Password Protection with NFC Tools (Alternative Method) */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <button
            type="button"
            onClick={() => setShowPasswordGuide(!showPasswordGuide)}
            className="w-full flex items-center justify-between text-right cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">
                🔐 طريقة الحماية برقم سري (Password Protection) عبر NFC Tools
              </span>
            </div>
            {showPasswordGuide ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showPasswordGuide && (
            <div className="space-y-3 pt-3 border-t border-slate-800 text-xs text-slate-300 leading-relaxed text-right">
              <p className="text-slate-300">
                إذا أردت وضع <strong>رقم سري سري (PIN Password مثل 1234)</strong> بحيث يفتح الكارت الرابط مع أي زبون بشكل طبيعي، ولكن إذا حاول أحد فتحه لتعديله يطلب منه الرقم السري:
              </p>

              <ol className="list-decimal list-inside space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-200">
                <li>افتح تطبيق <strong>NFC Tools</strong> المجاني من متجر هاتفك.</li>
                <li>اضغط على تبويب <strong>Other (أخرى)</strong> في الأعلى.</li>
                <li>اختر خيار <strong>Lock tag (قفل الكارت)</strong> أو <strong>Set password</strong>.</li>
                <li>أدخل الرمز السري الذي تريده (مثلاً: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-400 font-mono">1234</code>).</li>
                <li>ألصق الكارت بظهر الهاتف حتى يكتمل القفل.</li>
              </ol>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-[11px]">
                ✅ النتيجة: الكارت يفتح البروفايل تلقائياً عند أي شخص، لكنه مشفر برقم سري ومستحيل تعديله أو مسحه إلا بإدخال رقمك السري!
              </div>
            </div>
          )}
        </div>

        {/* Step 5: Diagnostic Read (Collapsible) */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <button
            type="button"
            onClick={() => setShowDiagnostic(!showDiagnostic)}
            className="w-full flex items-center justify-between text-right cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-white">
                🔍 فحص وقراءة كارت للتأكد من سلامته ومحتواه (Diagnostic Read)
              </span>
            </div>
            {showDiagnostic ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showDiagnostic && (
            <div className="space-y-4 pt-2 border-t border-slate-800 text-right">
              <p className="text-xs text-slate-300 leading-relaxed">
                اضغط على زر الفحص ثم ألصق أي كارت بظهر هاتفك لقراءة الرقم التسلسلي (UID) ومعرفة ما هو مكتوب داخله حالياً.
              </p>

              {!scanning ? (
                <button
                  type="button"
                  onClick={handleStartReadNfc}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>بدء فحص وقراءة الكارت الآن</span>
                </button>
              ) : currentAction === 'READ' ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled
                    className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center justify-center gap-2 animate-pulse"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>ضع الكارت خلف الكاميرا لقراءته...</span>
                  </button>
                  <button
                    type="button"
                    onClick={cancelNfcSession}
                    className="py-3 px-4 rounded-2xl bg-rose-900/60 text-rose-200 border border-rose-700 text-xs font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              ) : null}

              {/* Diagnostic Result */}
              {readTagData && (
                <div className="p-4 bg-blue-950/40 border border-blue-800 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">الرقم التسلسلي (UID):</span>
                    <span className="font-mono text-emerald-400 font-bold dir-ltr">{readTagData.serialNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">عدد السجلات:</span>
                    <span className="font-bold text-white">{readTagData.recordsCount}</span>
                  </div>
                  {readTagData.records && readTagData.records.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-slate-400 block font-bold">المحتوى المخزن:</span>
                      {readTagData.records.map((rec: any, idx: number) => (
                        <div key={idx} className="p-2 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] dir-ltr text-white truncate">
                          {rec.content}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 block text-center py-1">الكارت فارغ.</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapsible Section: Troubleshooting & Guidance */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="w-full flex items-center justify-between text-right cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white">
                💡 دليل حل مشكلات عدم استجابة الكارت
              </span>
            </div>
            {showGuide ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showGuide && (
            <div className="space-y-3 pt-2 border-t border-slate-800 text-xs text-slate-300 leading-relaxed text-right">
              <p><strong>1. أين تضع الكارت؟</strong> في معظم هواتف أندرويد (شاومي، سامسونج، ريدمي)، يقع لاقط الـ NFC في أعلى ظهر الهاتف تماماً بجانب الكاميرا.</p>
              <p><strong>2. مدة اللمس:</strong> ألصق الكارت بظهر الهاتف لمدة <strong>ثانيتين كاملتين</strong> دون سحبه بسرعة حتى ينتهي الهاتف من الكتابة أو القفل ويهتز.</p>
              <p><strong>3. غطاء الهاتف:</strong> الأغطية السميكة أو التي بها مغناطيس أو مساكات معدنية تعزل الإشارة. انزع الغطاء وجرب مجدداً.</p>
              <p><strong>4. نوع الرقاقة:</strong> المتصفح يدعم بطاقات NTAG213 / NTAG215 / NTAG216 القياسية.</p>
              <p><strong>5. تطبيق NFC Tools البديل:</strong> يمكنك أيضاً استخدام تطبيق <strong>NFC Tools</strong> المجاني من متجر Google Play لقفل الرقاقات بكلمة سر في أي وقت.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
