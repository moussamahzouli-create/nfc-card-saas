'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, Coffee, Star, Gift, Scissors, Heart, Utensils, 
  CheckCircle2, Sparkles, Lock, ArrowRight, Phone, RefreshCw, X, ShieldCheck
} from 'lucide-react';

interface LoyaltyWidgetProps {
  profileId: string;
  profileName?: string;
  isArabic?: boolean;
  primaryColor?: string;
  accentColor?: string;
  surfaceColor?: string;
  borderColor?: string;
  textColor?: string;
  mutedColor?: string;
}

interface LoyaltyState {
  enabled: boolean;
  title: string;
  targetStamps: number;
  rewardText: string;
  stampIcon: string;
  cooldownMinutes: number;
  customer: {
    phone: string;
    customerName: string | null;
    stampsCount: number;
    rewardsEarned: number;
    lastStampAt: string | null;
    isRewardReady: boolean;
  } | null;
}

export default function LoyaltyWidget({
  profileId,
  profileName = '',
  isArabic = false,
  primaryColor = '#8A509E',
  accentColor = '#A855F7',
  surfaceColor = 'rgba(255, 255, 255, 0.05)',
  borderColor = 'rgba(255, 255, 255, 0.1)',
  textColor = '#FFFFFF',
  mutedColor = '#94A3B8',
}: LoyaltyWidgetProps) {
  const [data, setData] = useState<LoyaltyState | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Customer identity
  const [phoneInput, setPhoneInput] = useState('');
  const [savedPhone, setSavedPhone] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // PIN Modal
  const [pinModalAction, setPinModalAction] = useState<'stamp' | 'redeem' | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [submittingPin, setSubmittingPin] = useState(false);
  
  // Success / celebration feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'celebration' } | null>(null);

  const storageKey = `brandxper_loyalty_${profileId}`;

  // 1. Fetch loyalty info
  const loadLoyalty = async (phoneToQuery?: string) => {
    try {
      const q = phoneToQuery ? `?phone=${encodeURIComponent(phoneToQuery)}` : '';
      const res = await fetch(`/api/profiles/${profileId}/loyalty${q}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.customer?.phone) {
          setSavedPhone(json.customer.phone);
          localStorage.setItem(storageKey, json.customer.phone);
        }
      }
    } catch (e) {
      console.error('Failed to load loyalty program', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    if (cached) {
      setSavedPhone(cached);
      setPhoneInput(cached);
      loadLoyalty(cached);
    } else {
      loadLoyalty();
    }
  }, [profileId]);

  // Handle phone submission
  const handleEnrollPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phoneInput.replace(/[\s\-\.\(\)]/g, '').trim();
    if (cleaned.length < 8) {
      setToastMessage({
        text: isArabic ? 'يرجى إدخال رقم هاتف صحيح (مثال: 0612345678)' : 'Veuillez entrer un numéro valide',
        type: 'error',
      });
      return;
    }

    setIsRegistering(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/loyalty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned }),
      });
      const result = await res.json();
      if (res.ok && result.customer) {
        setSavedPhone(result.customer.phone);
        localStorage.setItem(storageKey, result.customer.phone);
        await loadLoyalty(result.customer.phone);
        setToastMessage({
          text: isArabic ? 'مرحباً بك! تم تفعيل بطاقة الوفاء الخاصة بك 🎉' : 'Bienvenue ! Votre carte est prête 🎉',
          type: 'celebration',
        });
      } else {
        setToastMessage({ text: result.error || 'Erreur d\'inscription', type: 'error' });
      }
    } catch {
      setToastMessage({ text: isArabic ? 'خطأ في الاتصال بالخادم' : 'Erreur de connexion', type: 'error' });
    } finally {
      setIsRegistering(false);
    }
  };

  // Switch / change phone
  const handleResetPhone = () => {
    localStorage.removeItem(storageKey);
    setSavedPhone(null);
    setPhoneInput('');
    loadLoyalty();
  };

  // Handle PIN submission
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedPhone) return;
    if (!pinInput.trim()) {
      setPinError(isArabic ? 'أدخل الرمز السري' : 'Entrez le code PIN');
      return;
    }

    setSubmittingPin(true);
    setPinError(null);

    const endpoint = pinModalAction === 'redeem'
      ? `/api/profiles/${profileId}/loyalty/redeem`
      : `/api/profiles/${profileId}/loyalty/stamp`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: savedPhone, pin: pinInput.trim() }),
      });
      const result = await res.json();

      if (res.ok) {
        setPinModalAction(null);
        setPinInput('');
        await loadLoyalty(savedPhone);

        setToastMessage({
          text: result.message || (pinModalAction === 'redeem' ? 'Récompense validée !' : 'Tampon ajouté !'),
          type: 'celebration',
        });
      } else {
        setPinError(result.error || (isArabic ? 'الرمز غير صحيح' : 'Code PIN invalide'));
      }
    } catch {
      setPinError(isArabic ? 'خطأ في الاتصال' : 'Erreur de connexion');
    } finally {
      setSubmittingPin(false);
    }
  };

  // Helper to render icon
  const renderStampIcon = (name: string, active: boolean, size = 18) => {
    const props = { size, className: active ? 'animate-pulse' : 'opacity-40' };
    switch (name.toLowerCase()) {
      case 'coffee': return <Coffee {...props} />;
      case 'star': return <Star {...props} />;
      case 'gift': return <Gift {...props} />;
      case 'scissors': return <Scissors {...props} />;
      case 'heart': return <Heart {...props} />;
      case 'utensils':
      case 'burger': return <Utensils {...props} />;
      default: return <Award {...props} />;
    }
  };

  if (loading) {
    return (
      <div 
        className="w-full rounded-3xl p-5 border text-center animate-pulse"
        style={{ borderColor, background: surfaceColor }}
      >
        <div className="w-8 h-8 mx-auto rounded-full bg-white/10 mb-2" />
        <div className="h-4 w-32 bg-white/10 mx-auto rounded-full" />
      </div>
    );
  }

  if (!data?.enabled) {
    return null;
  }

  const targetStamps = data.targetStamps || 10;
  const currentStamps = data.customer?.stampsCount || 0;
  const isRewardReady = currentStamps >= targetStamps;
  const rewardsEarned = data.customer?.rewardsEarned || 0;
  const stampIcon = data.stampIcon || 'coffee';

  return (
    <div 
      className="w-full rounded-3xl overflow-hidden border shadow-xl relative transition-all duration-300"
      style={{
        borderColor: isRewardReady ? '#EAB308' : borderColor,
        background: surfaceColor,
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Top Banner Ribbon */}
      <div 
        className="px-4 py-3 flex items-center justify-between text-xs font-bold"
        style={{
          background: isRewardReady 
            ? 'linear-gradient(90deg, #CA8A04, #EAB308)' 
            : `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
          color: '#FFFFFF',
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="tracking-wide">
            {data.title || (isArabic ? 'بطاقة الوفاء VIP' : 'Carte de Fidélité')}
          </span>
        </div>
        <div className="text-[10px] font-black uppercase bg-black/25 px-2.5 py-1 rounded-full backdrop-blur-sm">
          {isRewardReady 
            ? (isArabic ? 'هدية جاهزة 🎁' : 'Récompense Prête !') 
            : `${currentStamps}/${targetStamps} ${isArabic ? 'طوابع' : 'tampons'}`}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4 text-center">
        {/* Toast / Notification Alert */}
        {toastMessage && (
          <div 
            className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-lg transition-all animate-bounce ${
              toastMessage.type === 'error' 
                ? 'bg-rose-500/90 text-white' 
                : 'bg-emerald-500/95 text-white'
            }`}
          >
            <span>{toastMessage.text}</span>
            <button onClick={() => setToastMessage(null)} className="p-1 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Reward Explanation Banner */}
        <div 
          className="rounded-2xl p-3 border text-left rtl:text-right flex items-start gap-3 shadow-inner"
          style={{ 
            borderColor: isRewardReady ? '#EAB308' : borderColor, 
            background: isRewardReady ? 'rgba(234, 179, 8, 0.12)' : 'rgba(0, 0, 0, 0.15)' 
          }}
        >
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md font-bold text-white"
            style={{ 
              background: isRewardReady 
                ? '#EAB308' 
                : `linear-gradient(135deg, ${primaryColor}, ${accentColor})` 
            }}
          >
            <Gift className="w-5 h-5 text-white animate-bounce" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-70" style={{ color: mutedColor }}>
              {isArabic ? 'المكافأة عند اكتمال الطوابع' : 'Objectif de Fidélité'}
            </span>
            <p className="text-xs font-black mt-0.5 leading-snug" style={{ color: textColor }}>
              {data.rewardText || (isArabic ? 'تخفيض خاص أو هدية مجانية' : 'Cadeau ou réduction exclusive')}
            </p>
          </div>
        </div>

        {/* Case 1: Customer not identified yet -> Phone input form */}
        {!savedPhone ? (
          <div className="py-2 space-y-3">
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold" style={{ color: textColor }}>
                {isArabic ? 'ابدأ في جمع الطوابع الآن' : 'Rejoignez le programme de fidélité'}
              </h4>
              <p className="text-[11px] font-medium opacity-70" style={{ color: mutedColor }}>
                {isArabic 
                  ? 'أدخل رقم هاتفك لمرة واحدة فقط لعرض بطاقتك وتجميع نقاطك عند الكاشير' 
                  : 'Entrez votre numéro pour activer votre carte et cumuler vos tampons'}
              </p>
            </div>

            <form onSubmit={handleEnrollPhone} className="space-y-2">
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: textColor }} />
                <input
                  type="tel"
                  placeholder={isArabic ? '06 12 34 56 78 أو +212' : '06 12 34 56 78'}
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  dir="ltr"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-black/20 text-xs font-bold outline-none transition-all focus:ring-2 focus:ring-purple-400"
                  style={{ borderColor, color: textColor }}
                />
              </div>
              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-2.5 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-1.5 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
              >
                {isRegistering ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>{isArabic ? 'عرض بطاقة الوفاء الخاصة بي' : 'Activer ma carte'}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Case 2: Customer identified -> Show stamp card */
          <div className="space-y-4">
            {/* Customer Header info */}
            <div className="flex items-center justify-between text-[11px] px-1 font-bold">
              <div className="flex items-center gap-1.5 opacity-80" style={{ color: textColor }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>{savedPhone}</span>
              </div>
              <button
                onClick={handleResetPhone}
                className="text-[10px] underline opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                style={{ color: mutedColor }}
              >
                {isArabic ? 'تغيير الرقم' : 'Changer'}
              </button>
            </div>

            {/* Stamp Grid */}
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5 py-1">
              {Array.from({ length: targetStamps }).map((_, idx) => {
                const isStamped = idx < currentStamps;
                const isTargetStamp = idx === targetStamps - 1;

                return (
                  <div
                    key={idx}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 ${
                      isStamped 
                        ? 'shadow-md scale-100' 
                        : 'border border-dashed opacity-45'
                    }`}
                    style={{
                      background: isStamped 
                        ? (isTargetStamp ? 'linear-gradient(135deg, #EAB308, #CA8A04)' : `linear-gradient(135deg, ${primaryColor}, ${accentColor})`) 
                        : 'rgba(255, 255, 255, 0.03)',
                      borderColor: isStamped ? 'transparent' : borderColor,
                      color: isStamped ? '#FFFFFF' : textColor,
                    }}
                  >
                    {isStamped ? (
                      <>
                        {renderStampIcon(stampIcon, true, 20)}
                        <CheckCircle2 className="w-3 h-3 absolute bottom-1 right-1 text-white bg-black/30 rounded-full" />
                      </>
                    ) : isTargetStamp ? (
                      <Gift className="w-5 h-5 text-amber-400 animate-pulse" />
                    ) : (
                      <>
                        {renderStampIcon(stampIcon, false, 16)}
                        <span className="text-[9px] font-black mt-0.5 opacity-50">{idx + 1}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total rewards won badge */}
            {rewardsEarned > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-extrabold text-amber-300">
                <Award className="w-3.5 h-3.5" />
                <span>
                  {isArabic 
                    ? `لقد ربحت ${rewardsEarned} مكافأة سابقة من ${profileName || 'هذا المحل'}!` 
                    : `${rewardsEarned} récompense(s) déjà obtenue(s) !`}
                </span>
              </div>
            )}

            {/* Action Buttons: Cashier Stamp or Claim Reward */}
            {isRewardReady ? (
              <div className="space-y-2 pt-1">
                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs font-bold">
                  🎉 {isArabic ? 'أظهر شاشتك للكاشير لتسلم هديتك الآن!' : 'Montrez votre écran en caisse pour obtenir votre cadeau !'}
                </div>
                <button
                  onClick={() => { setPinModalAction('redeem'); setPinInput(''); setPinError(null); }}
                  className="w-full py-3 px-4 rounded-2xl text-xs font-black text-slate-900 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Gift className="w-4 h-4" />
                  <span>{isArabic ? 'الكاشير: تأكيد تسليم المكافأة' : 'Valider en caisse (Récompense)'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setPinModalAction('stamp'); setPinInput(''); setPinError(null); }}
                className="w-full py-2.5 px-4 rounded-2xl text-xs font-extrabold text-white shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isArabic ? 'الكاشير: ختم البطاقة (إضافة طابع)' : 'Tamponner en caisse (+1 Tampon)'}</span>
              </button>
            )}

            <p className="text-[10px] opacity-50 font-medium" style={{ color: mutedColor }}>
              {isArabic 
                ? '🔒 الختم يتم برمز سري يكتبه موظف الكاشير عند الدفع' 
                : '🔒 Validation sécurisée par code PIN commerçant'}
            </p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
          CASHIER PIN MODAL (Pop-up sécurisé pour le commerçant)
         ═══════════════════════════════════════════════════════ */}
      {pinModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div 
            className="w-full max-w-sm rounded-3xl p-5 border shadow-2xl relative space-y-4"
            style={{ 
              background: '#18181B', 
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF' 
            }}
          >
            {/* Close button */}
            <button 
              onClick={() => setPinModalAction(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-1 pt-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white">
                {pinModalAction === 'redeem'
                  ? (isArabic ? 'تأكيد تسليم المكافأة' : 'Validation Récompense')
                  : (isArabic ? 'رمز الكاشير السري' : 'Code PIN Commerçant')}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {isArabic 
                  ? 'يقوم الكاشير بإدخال رمزه السري (4 أرقام) لإتمام العملية' 
                  : 'Le caissier saisit son code PIN secret pour valider'}
              </p>
            </div>

            {/* PIN Form */}
            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div className="flex justify-center">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoFocus
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-44 text-center tracking-[0.5em] text-2xl font-black py-2.5 px-3 rounded-2xl border bg-black/40 border-purple-500/50 text-white outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {pinError && (
                <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs text-center font-bold">
                  {pinError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPinModalAction(null)}
                  className="py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-slate-300 transition-all cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  disabled={submittingPin}
                  className="py-2.5 rounded-xl text-xs font-black text-white shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
                >
                  {submittingPin ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>{isArabic ? 'تأكيد الختم' : 'Valider'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
