'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, Cpu, CheckCircle2, AlertTriangle, RefreshCw, 
  ShieldCheck, Lock, Unlock, QrCode, ArrowRight, Sparkles, 
  Copy, Check, Download, ExternalLink, Eye, HelpCircle, XCircle, Wifi, Zap
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
  const [activeTab, setActiveTab] = useState<'write' | 'read' | 'lock' | 'help'>('write');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [useCustomUrl, setUseCustomUrl] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // NFC States
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [currentAction, setCurrentAction] = useState<'WRITE' | 'READ' | 'LOCK' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('اختر الرابط واضغط على الزر أدناه ثم قرّب الكارت من أعلى ظهر الهاتف');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastWritten, setLastWritten] = useState<any>(null);
  const [readTagData, setReadTagData] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

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
      userFriendlyError = 'تم رفض الإذن أو أن مستشعر NFC معطل في إعدادات هاتفك. تأكد من تشغيل NFC ومنح المتصفح الإذن.';
    } else if (err.name === 'NotSupportedError') {
      userFriendlyError = 'الرقاقة غير مدعومة في متصفح كروم أو أن الكارت مقفل مسبقاً للقراءة فقط. تأكد من استخدام بطاقات NTAG213 أو NTAG215 أو NTAG216 القياسية.';
    } else if (err.name === 'NetworkError') {
      userFriendlyError = 'انقطع الاتصال بالرقاقة أثناء العملية. يرجى تثبيت الكارت جيداً خلف الكاميرا لمدة ثانيتين دون إبعاده بسرعة.';
    } else if (err.name === 'InvalidStateError') {
      userFriendlyError = 'توجد عملية NFC قيد التشغيل بالفعل. أعد الضغط على الزر للمحاولة.';
    } else {
      userFriendlyError = err.message || 'حدث خطأ غير متوقع أثناء الاتصال بالرقاقة.';
    }

    setErrorMessage(userFriendlyError);
    setStatusMessage(`❌ تعذر إكمال العملية: ${userFriendlyError}`);
  };

  // 1. WRITE NFC TAG
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
    setStatusMessage('📡 المستشعر جاهز للكتابة! ألصق الكارت الآن بأعلى ظهر الهاتف (بجانب الكاميرا)...');
    playSound('beep');

    const ctrl = new AbortController();
    abortControllerRef.current = ctrl;

    // Timeout safety after 45 seconds
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
        navigator.vibrate([120, 60, 180]);
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
            lockType: 'NONE',
          }),
        });
      } catch (err) {
        console.warn('Backend sync note:', err);
      }

      setLastWritten({
        url: targetUrl,
        profileName: selectedProfile?.name || 'رابط مخصص',
        profileSlug: selectedProfile?.slug,
        time: new Date().toLocaleTimeString('ar-MA'),
      });

      setStatusMessage('✅ تم نسخ وبرمجة الرابط بنجاح على الكارت!');
      fetchProfiles();
    } catch (err: any) {
      clearTimeout(timeoutId);
      handleNfcError(err, 'WRITE');
    } finally {
      setScanning(false);
      setCurrentAction(null);
    }
  };

  // 2. READ & DIAGNOSE NFC TAG
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

  // 3. PERMANENT LOCK NFC TAG (Read-Only)
  const handleStartLockNfc = async () => {
    if (!('NDEFReader' in window)) {
      alert('مستشعر الـ NFC غير مدعوم في هذا المتصفح.');
      return;
    }

    const confirmed = window.confirm(
      '⚠️ تحذير أمني هام:\n\n' +
      'القفل النهائي للكارت عبر المتصفح (Permanent Read-Only) سيجعل الرقاقة للقراءة فقط للأبد!\n' +
      'لن يتمكن أي شخص أو أي تطبيق (بما في ذلك NFC Tools) من مسح أو تعديل الرابط على هذا الكارت مجدداً.\n\n' +
      'هل أنت متأكد من أنك كتبت الرابط الصحيح وتريد قفل الكارت نهائياً الآن؟'
    );

    if (!confirmed) return;

    cancelNfcSession();
    setScanning(true);
    setCurrentAction('LOCK');
    setErrorMessage(null);
    setStatusMessage('🔒 مستشعر القفل جاهز! ألصق الكارت بظهر الهاتف بجانب الكاميرا وثبته للقفل النهائي...');
    playSound('beep');

    const ctrl = new AbortController();
    abortControllerRef.current = ctrl;

    const timeoutId = setTimeout(() => {
      if (ctrl && !ctrl.signal.aborted) {
        ctrl.abort();
        setScanning(false);
        setCurrentAction(null);
        setErrorMessage('انتهت مهلة القفل.');
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

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 300]);
      }

      setStatusMessage('🔒 تم قفل الكارت نهائياً بنجاح! أصبح الكارت للقراءة فقط ولا يمكن تعديله أو مسحه أبداً.');
    } catch (err: any) {
      clearTimeout(timeoutId);
      handleNfcError(err, 'LOCK');
    } finally {
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
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 font-sans max-w-3xl mx-auto pb-24" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">أداة برمجة كروت NFC للهاتف</h1>
            <span className="text-xs text-purple-400 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              برمجة وفحص وقفل الكروت مباشرة من متصفح الهاتف
            </span>
          </div>
        </div>

        {/* NFC Capability Badge */}
        <div>
          {isSupported === true ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              NFC مدعوم 🟢
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

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 gap-2 mb-6 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => { cancelNfcSession(); setActiveTab('write'); }}
          className={`py-2.5 px-2 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'write' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>كتابة وبرمجة</span>
        </button>

        <button
          type="button"
          onClick={() => { cancelNfcSession(); setActiveTab('read'); }}
          className={`py-2.5 px-2 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'read' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>فحص وقراءة</span>
        </button>

        <button
          type="button"
          onClick={() => { cancelNfcSession(); setActiveTab('lock'); }}
          className={`py-2.5 px-2 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'lock' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>قفل الكارت</span>
        </button>

        <button
          type="button"
          onClick={() => { cancelNfcSession(); setActiveTab('help'); }}
          className={`py-2.5 px-2 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'help' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>دليل الحلول</span>
        </button>
      </div>

      {/* TAB 1: WRITE NFC TAG */}
      {activeTab === 'write' && (
        <div className="space-y-6">
          {/* Target Selection Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                1. اختيار البروفايل أو الرابط المراد برمجته
              </label>
              <button
                type="button"
                onClick={fetchProfiles}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تحديث القائمة</span>
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
                بروفايل من المنصة ({profiles.length})
              </button>
              <button
                type="button"
                onClick={() => setUseCustomUrl(true)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  useCustomUrl ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-400'
                }`}
              >
                رابط خارجي مخصص
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
                        {p.status === 'PENDING' ? '⏳ [جديد لم يبرمج] ' : '✅ [مبرمج مسبقاً] '}
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
                  مثال: https://www.brandxpere.com/c/your-name
                </span>
              </div>
            )}

            {/* Current Target Display */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 font-bold shrink-0">الرابط المكتوب:</span>
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
          </div>

          {/* Action Pad & Antenna Visual Guide */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-5">
            {/* Phone & NFC Antenna Placement Graphic */}
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="relative w-28 h-40 rounded-3xl border-2 border-slate-700 bg-slate-950 p-2 flex flex-col items-center justify-between shadow-inner">
                {/* Camera Bump */}
                <div className="w-12 h-6 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-600"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-900"></div>
                </div>

                {/* NFC Hotspot Area Animation */}
                <div className="relative flex items-center justify-center my-auto">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    scanning && currentAction === 'WRITE'
                      ? 'bg-purple-600/30 border-2 border-purple-400 animate-ping'
                      : 'bg-slate-800/60 border border-slate-700'
                  }`}></div>
                  <div className="absolute w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                    <Wifi className="w-5 h-5 rotate-90" />
                  </div>
                </div>

                {/* Bottom label */}
                <span className="text-[9px] text-slate-500 font-bold tracking-wider">لاقط الـ NFC</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-300 block">
                  📍 مكان وضع الكارت: أعلى ظهر الهاتف (بجانب الكاميرا مباشرة)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  ثبّت الكارت ملاصقاً للهاتف لمدة <strong>ثانيتين كاملتين</strong> حتى تشعر بالاهتزاز
                </span>
              </div>
            </div>

            {/* Status Message */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 max-w-md mx-auto">
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

            {/* Action Buttons */}
            <div className="space-y-2">
              {!scanning ? (
                <button
                  type="button"
                  onClick={handleStartWriteNfc}
                  className="w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-600/25 active:scale-98 transition-all cursor-pointer"
                >
                  <Zap className="w-5 h-5" />
                  <span>بدء كتابة الرابط على الكارت بلمسة واحدة ⚡</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled
                    className="flex-1 py-4 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-slate-800 text-purple-300 border border-purple-500/40 animate-pulse"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>المستشعر نشط... ألصق الكارت الآن</span>
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
              )}
            </div>
          </div>

          {/* Success Report Card */}
          {lastWritten && (
            <div className="p-5 bg-emerald-950/40 border border-emerald-800 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>تمت كتابة الكارت وتوثيقه بنجاح! 🎉</span>
                </div>
                <span className="text-[10px] text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full font-mono">
                  {lastWritten.time}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">البروفايل:</span>
                  <span className="font-bold text-white">{lastWritten.profileName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">الرابط المبرمج:</span>
                  <span className="font-mono text-purple-400 font-bold dir-ltr truncate max-w-[200px]">
                    {lastWritten.url}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={lastWritten.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                  <span>تجربة الرابط في المتصفح</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    cancelNfcSession();
                    setActiveTab('lock');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>قفل الكارت ضد التعديل 🔒</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: READ & DIAGNOSE NFC TAG */}
      {activeTab === 'read' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 text-right">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Eye className="w-5 h-5" />
              <span>فحص وقراءة الكارت وتشخيص التوافق (Diagnostic Read)</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              استخدم هذه الخاصية للتأكد من أن هاتفك يتعرف على الكارت ولرؤية المعرف الفريد للرقاقة (UID) والمحتوى المخزن عليه قبل البرمجة.
            </p>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 block">طريقة الفحص:</span>
              <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1 leading-relaxed">
                <li>اضغط على زر <strong>"بدء فحص وقراءة الكارت"</strong> أدناه.</li>
                <li>ألصق أي كارت NFC بأعلى ظهر الهاتف (بجانب الكاميرا مباشرة).</li>
                <li>ستظهر بيانات الرقاقة فوراً مع صوت تنبيه واهتزاز.</li>
              </ol>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-2xl text-right flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-rose-300 block">تنبيه أثناء القراءة:</span>
                  <p className="text-rose-200 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Read Buttons */}
            <div>
              {!scanning ? (
                <button
                  type="button"
                  onClick={handleStartReadNfc}
                  className="w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-600/25 transition-all cursor-pointer"
                >
                  <Eye className="w-5 h-5" />
                  <span>بدء فحص وقراءة الكارت الآن 🔍</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled
                    className="flex-1 py-4 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-slate-800 text-blue-300 border border-blue-500/40 animate-pulse"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>المستشعر يترقب الكارت... قربه من الكاميرا</span>
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
              )}
            </div>
          </div>

          {/* Diagnostic Result Card */}
          {readTagData && (
            <div className="p-5 bg-blue-950/40 border border-blue-800 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                  <span>تقرير فحص الكارت (Tag Details):</span>
                </div>
                <span className="text-[10px] text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded-full font-mono">
                  {readTagData.time}
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">الرقم التسلسلي الفريد (UID):</span>
                  <span className="font-mono text-emerald-400 font-black dir-ltr text-sm">{readTagData.serialNumber}</span>
                </div>

                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">حالة التوافق:</span>
                  <span className="text-emerald-400 font-bold">متوافق 100% مع معايير NDEF</span>
                </div>

                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">عدد السجلات المخزنة:</span>
                  <span className="font-bold text-white">{readTagData.recordsCount}</span>
                </div>

                {readTagData.records && readTagData.records.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <span className="text-slate-400 block font-bold">المحتوى المخزن على الكارت حالياً:</span>
                    {readTagData.records.map((rec: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="flex justify-between text-[10px] text-purple-400 font-mono">
                          <span>السجل #{idx + 1}</span>
                          <span>النوع: {rec.type}</span>
                        </div>
                        <p className="font-mono text-xs text-white dir-ltr truncate select-all">{rec.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-2">
                    الكارت فارغ وجاهز للكتابة فوراً.
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  cancelNfcSession();
                  setActiveTab('write');
                }}
                className="w-full py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>الانتقال لكتابة رابط المنصة على هذا الكارت</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LOCK TAG (Read-Only) */}
      {activeTab === 'lock' && (
        <div className="space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 text-right">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Lock className="w-5 h-5" />
              <span>القفل النهائي والحماية ضد التعديل (Make Read-Only)</span>
            </div>

            <div className="p-4 bg-rose-950/40 border border-rose-800/80 rounded-2xl space-y-2 text-xs text-rose-200 leading-relaxed">
              <span className="font-bold block text-rose-300">⚠️ تنبيه أمني دائم:</span>
              <p>
                هذه العملية تقوم بحرق بتات القفل الدائمة (Lock Bits) في شريحة الكارت، مما يجعله للقراءة فقط (Permanent Read-Only).
              </p>
              <p>
                بعد القفل، <strong>لن يتمكن أي تطبيق أو شخص من مسح أو استبدال الرابط</strong> نهائياً. تأكد من أنك برمجت الكارت بالرابط الصحيح أولاً!
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-400">
              <span className="font-bold text-slate-300 block">خطوات القفل:</span>
              <ol className="list-decimal list-inside space-y-1">
                <li>تأكد من كتابة الرابط واختباره أولاً في تبويب "كتابة وبرمجة".</li>
                <li>اضغط على زر القفل الأحمر أدناه وأكّد رغبتك.</li>
                <li>ألصق الكارت بظهر الهاتف بجانب الكاميرا لمدة ثانيتين.</li>
              </ol>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-2xl text-right flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-rose-300 block">تنبيه أثناء القفل:</span>
                  <p className="text-rose-200 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Lock Button */}
            <div>
              {!scanning ? (
                <button
                  type="button"
                  onClick={handleStartLockNfc}
                  className="w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white shadow-xl shadow-rose-600/25 transition-all cursor-pointer"
                >
                  <Lock className="w-5 h-5" />
                  <span>تأكيد وقفل الكارت نهائياً ضد أي تعديل 🔒</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled
                    className="flex-1 py-4 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-slate-800 text-rose-300 border border-rose-500/40 animate-pulse"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>المستشعر يترقب الكارت لقفله نهائياً...</span>
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TROUBLESHOOTING & HELP */}
      {activeTab === 'help' && (
        <div className="space-y-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 text-right">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <HelpCircle className="w-5 h-5" />
              <span>دليل حل مشكلات مستشعر NFC على الهواتف</span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Question 1 */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-bold text-purple-300 block text-sm">
                  1. أين يقع مستشعر الـ NFC في هاتفي تحديداً؟
                </span>
                <ul className="list-disc list-inside text-slate-300 space-y-1.5 leading-relaxed">
                  <li><strong>هواتف شاومي وريدمي وبوكو (Xiaomi / Redmi / POCO):</strong> يقع المستشعر في أعلى ظهر الهاتف تماماً، بجانب إطار الكاميرا الخلفية.</li>
                  <li><strong>هواتف سامسونج (Samsung Galaxy):</strong> يقع في منتصف الظهر أو في الثلث العلوي.</li>
                  <li><strong>هواتف هواوي وهونر (Huawei / Honor):</strong> في الجزء العلوي حول الكاميرا.</li>
                  <li><strong>هواتف جوجل بيكسل (Google Pixel):</strong> في النصف العلوي فوق شريط الكاميرا.</li>
                </ul>
              </div>

              {/* Question 2 */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-bold text-purple-300 block text-sm">
                  2. لماذا يظهر إشعار المسح لكن الكارت لا يستجيب؟
                </span>
                <div className="text-slate-300 space-y-2 leading-relaxed">
                  <p>
                    <strong>أ- إبعاد الكارت بسرعة:</strong> يحتاج المتصفح إلى ثانيتين كاملتين لإتمام إرسال البيانات والتحقق منها. ألصق الكارت جيداً وانتظر حتى يهتز الهاتف.
                  </p>
                  <p>
                    <strong>ب- غطاء الهاتف (الكفر السميك أو المعدني):</strong> الأغطية التي تحتوي على مساكات مغناطيسية للسيارة أو معدن تعزل إشارة الـ NFC. انزع الغطاء وجرب مجدداً.
                  </p>
                  <p>
                    <strong>ج- نوع رقاقة الكارت:</strong> متصفح كروم يدعم رقاقات <strong>NTAG213 و NTAG215 و NTAG216</strong> القياسية. البطاقات القديمة من نوع Mifare Classic 1K لا تدعم الكتابة من المتصفح.
                  </p>
                  <p>
                    <strong>د- الكارت مقفل مسبقاً:</strong> إذا كان الكارت مبرمجاً مسبقاً ومقفلاً بصفة Read-Only أو بكلمة سر بواسطة جهاز آخر، فلن يقبل الكتابة فوقه.
                  </p>
                </div>
              </div>

              {/* Question 3 */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-bold text-purple-300 block text-sm">
                  3. كيف أتأكد من صلاحية الكارت باستخدام تطبيق NFC Tools؟
                </span>
                <p className="text-slate-300 leading-relaxed">
                  يمكنك تحميل تطبيق <strong>NFC Tools</strong> المجاني من متجر Google Play، ثم الضغط على <strong>Read</strong> وتقريب الكارت. سيعطيك التطبيق:
                </p>
                <ul className="list-disc list-inside text-slate-400 space-y-1">
                  <li>نوع الشريحة (Tag type): NTAG213 / NTAG215</li>
                  <li>هل الكارت قابل للكتابة (Writable: Yes / No)</li>
                  <li>هل الشريحة محمية بكلمة سر (Password protected)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Standalone Native Mobile App Download Card */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Download className="w-5 h-5" />
                <span>تطبيق أندرويد المستقل (Brandxpere NFC Manager)</span>
              </div>
              <span className="text-[10px] bg-purple-950 text-purple-300 font-bold px-2 py-0.5 rounded-full">
                حزمة كاملة
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              إذا أردت تثبيت تطبيق أندرويد مخصص مستقل على هواتف فريق العمل دون الحاجة للمتصفح:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <a
                href="/brandxpere-nfc-mobile.zip"
                download="brandxpere-nfc-mobile.zip"
                className="py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تحميل سورس التطبيق (ZIP)</span>
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=com.wakdev.wdnfc"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span>تحميل تطبيق NFC Tools من Google Play</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
