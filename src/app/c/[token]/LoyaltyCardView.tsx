'use client';

import React, { useState, useEffect } from 'react';
import { 
  Coffee, Star, Gift, Scissors, Heart, Utensils, 
  CheckCircle2, Sparkles, Lock, ArrowRight, Phone, RefreshCw, X, ShieldCheck,
  ChevronRight, Smartphone, User, Crown, Check, Edit3, QrCode, Eye, EyeOff
} from 'lucide-react';
import QRCode from 'qrcode';

interface LoyaltyCardViewProps {
  profile: any;
  isArabic?: boolean;
}

interface LoyaltyData {
  enabled: boolean;
  componentId?: string;
  title: string;
  targetStamps: number;
  rewardText: string;
  stampIcon: string;
  cooldownMinutes: number;
  customer: {
    id?: string;
    phone: string;
    customerName: string | null;
    stampsCount: number;
    rewardsEarned: number;
    lastStampAt: string | null;
    isRewardReady: boolean;
  } | null;
}

export default function LoyaltyCardView({
  profile,
  isArabic = false,
}: LoyaltyCardViewProps) {
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);

  // Customer phone & name identity
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [savedPhone, setSavedPhone] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Edit Name Modal
  const [showNameModal, setShowNameModal] = useState(false);
  const [editNameInput, setEditNameInput] = useState('');
  const [updatingName, setUpdatingName] = useState(false);

  // Cashier PIN Modal
  const [pinModalAction, setPinModalAction] = useState<'stamp' | 'redeem' | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [submittingPin, setSubmittingPin] = useState(false);

  // Success toast (green alert shown in reference image)
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Save to phone modal / hint
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Customer Personal QR Code & PIN visibility
  const [customerQrUrl, setCustomerQrUrl] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);

  const storageKey = `brandxper_loyalty_${profile.id}`;

  const fetchLoyalty = async (phoneToQuery?: string) => {
    try {
      const q = phoneToQuery ? `?phone=${encodeURIComponent(phoneToQuery)}` : '';
      const res = await fetch(`/api/profiles/${profile.id}/loyalty${q}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.customer?.phone) {
          setSavedPhone(json.customer.phone);
          localStorage.setItem(storageKey, json.customer.phone);
        }
      }
    } catch (e) {
      console.error('Failed to load loyalty card', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    if (cached) {
      setSavedPhone(cached);
      setPhoneInput(cached);
      fetchLoyalty(cached);
    } else {
      fetchLoyalty();
    }
  }, [profile.id]);

  useEffect(() => {
    const activePhone = data?.customer?.phone || savedPhone;
    if (activePhone && profile?.id) {
      const fallbackCompId = profile?.components?.find?.((c: any) => 
        ['loyalty', 'fidelite', 'carte_fidelite'].includes(c.type?.toLowerCase())
      )?.id;

      const payload = JSON.stringify({
        type: 'bx_loyalty_customer',
        customer_id: data?.customer?.id || undefined,
        merchant_id: profile.id,
        loyalty_program_id: data?.componentId || fallbackCompId || profile.id,
        phone: activePhone,
      });

      QRCode.toDataURL(payload, {
        width: 320,
        margin: 1.5,
        color: {
          dark: '#3B0764',
          light: '#FFFFFF',
        },
      })
        .then(setCustomerQrUrl)
        .catch(console.error);
    } else {
      setCustomerQrUrl(null);
    }
  }, [data?.customer?.id, data?.customer?.phone, data?.componentId, savedPhone, profile?.id, profile?.slug]);

  // Handle phone submission (Only phone is required)
  const handleEnrollPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    // Normalize Arabic/Persian digits & clean whitespace
    let cleaned = phoneInput
      .replace(/[٠-٩]/g, d => (d.charCodeAt(0) - 1632).toString())
      .replace(/[۰-۹]/g, d => (d.charCodeAt(0) - 1776).toString())
      .replace(/[\s\-\.\(\)]/g, '')
      .trim();

    // Normalize Moroccan prefixes
    if (cleaned.startsWith('+212')) {
      cleaned = '0' + cleaned.slice(4);
    } else if (cleaned.startsWith('00212')) {
      cleaned = '0' + cleaned.slice(5);
    } else if (cleaned.startsWith('212') && cleaned.length >= 11) {
      cleaned = '0' + cleaned.slice(3);
    } else if (/^[5-7]\d{8}$/.test(cleaned)) {
      cleaned = '0' + cleaned;
    }

    if (cleaned.length < 6) {
      setErrorToast(isArabic ? 'يرجى إدخال رقم هاتف صحيح' : 'Veuillez entrer un numéro valide');
      setTimeout(() => setErrorToast(null), 4000);
      return;
    }

    setIsRegistering(true);
    setErrorToast(null);
    try {
      const res = await fetch(`/api/profiles/${profile.id}/loyalty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: cleaned,
          customerName: nameInput.trim() || undefined,
        }),
      });
      const result = await res.json();
      if (res.ok && result.customer) {
        setSavedPhone(result.customer.phone);
        localStorage.setItem(storageKey, result.customer.phone);
        await fetchLoyalty(result.customer.phone);
        setSuccessToast(isArabic ? 'تم تفعيل بطاقتك بنجاح !' : 'Carte de fidélité activée avec succès !');
        setTimeout(() => setSuccessToast(null), 4000);
      } else {
        setErrorToast(result.error || 'Erreur d\'activation');
        setTimeout(() => setErrorToast(null), 4000);
      }
    } catch {
      setErrorToast(isArabic ? 'خطأ في الاتصال بالخادم' : 'Erreur de connexion');
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setIsRegistering(false);
    }
  };

  // Update customer name on card
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedPhone || !editNameInput.trim()) return;
    setUpdatingName(true);
    try {
      const res = await fetch(`/api/profiles/${profile.id}/loyalty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: savedPhone,
          customerName: editNameInput.trim(),
        }),
      });
      const result = await res.json();
      if (res.ok && result.customer) {
        await fetchLoyalty(savedPhone);
        setShowNameModal(false);
        setSuccessToast(isArabic ? 'تم تحديث اسمك على البطاقة بنجاح !' : 'Nom mis à jour avec succès !');
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } catch {
      setErrorToast('Erreur de mise à jour');
    } finally {
      setUpdatingName(false);
    }
  };

  // Cashier PIN submission
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
      ? `/api/profiles/${profile.id}/loyalty/redeem`
      : `/api/profiles/${profile.id}/loyalty/stamp`;

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
        await fetchLoyalty(savedPhone);

        setSuccessToast(
          result.message || (pinModalAction === 'redeem' ? 'Récompense validée avec succès !' : 'Tampon ajouté avec succès !')
        );
        setTimeout(() => setSuccessToast(null), 5000);
      } else {
        setPinError(result.error || (isArabic ? 'الرمز غير صحيح' : 'Code PIN incorrect'));
      }
    } catch {
      setPinError(isArabic ? 'خطأ في الاتصال' : 'Erreur de connexion');
    } finally {
      setSubmittingPin(false);
    }
  };

  // Helper for stamp icon
  const renderStampIcon = (name: string, isDone: boolean) => {
    const iconSize = isDone ? 20 : 16;
    const strokeWidth = isDone ? 2.5 : 1.8;
    switch (name.toLowerCase()) {
      case 'star': return <Star size={iconSize} strokeWidth={strokeWidth} />;
      case 'gift': return <Gift size={iconSize} strokeWidth={strokeWidth} />;
      case 'scissors': return <Scissors size={iconSize} strokeWidth={strokeWidth} />;
      case 'heart': return <Heart size={iconSize} strokeWidth={strokeWidth} />;
      case 'utensils':
      case 'burger': return <Utensils size={iconSize} strokeWidth={strokeWidth} />;
      default: return <Coffee size={iconSize} strokeWidth={strokeWidth} />;
    }
  };

  // Fallback to profile.components for instant real-time live preview responsiveness
  const loyaltyComp = profile?.components?.find?.((c: any) => 
    ['loyalty', 'fidelite', 'carte_fidelite'].includes(c.type?.toLowerCase())
  );
  let compSettings: any = {};
  if (loyaltyComp?.settingsJson) {
    try { compSettings = JSON.parse(loyaltyComp.settingsJson); } catch {}
  }

  const targetStamps = data?.targetStamps || (compSettings.targetStamps ? Number(compSettings.targetStamps) : 10);
  const currentStamps = data?.customer?.stampsCount || 0;
  const isRewardReady = currentStamps >= targetStamps;
  const rewardText = data?.rewardText || compSettings.rewardText || (isArabic ? 'قهوة أو هدية مجانية' : 'Cadeau ou réduction exclusive');
  const stampIcon = data?.stampIcon || compSettings.stampIcon || 'coffee';
  const storeName = profile.company || profile.name || (isArabic ? 'متجر الشريك' : 'Commerce Partenaire');
  const cardTitle = data?.title || compSettings.title || loyaltyComp?.title || 'Carte Fidélité';

  // Helper to format Moroccan phone for display (e.g. 06 12 34 56 78)
  const formatPhone = (p?: string | null) => {
    if (!p) return '';
    const digits = p.replace(/\D/g, '');
    if (digits.length === 10) {
      return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
    }
    return p;
  };

  // Customer Name / Identity displayed on the card
  const customerDisplayName = data?.customer?.customerName
    || (savedPhone ? formatPhone(savedPhone) : null)
    || (isArabic ? 'عميل VIP' : 'Client VIP');

  return (
    <div className="min-h-screen w-full bg-[#F6F2FD] flex flex-col items-center justify-start py-4 px-4 sm:py-8 sm:px-6 relative overflow-x-hidden font-sans text-slate-800 select-none">
      
      {/* ── Soft Ambient Purple Background Glows ── */}
      <div 
        className="fixed w-[500px] h-[500px] rounded-full blur-[140px] -top-32 -left-32 pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle, #C084FC 0%, #A855F7 50%, transparent 80%)' }}
      />
      <div 
        className="fixed w-[500px] h-[500px] rounded-full blur-[140px] -bottom-32 -right-32 pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, #7C3AED 0%, #9333EA 50%, transparent 80%)' }}
      />

      {/* ── Outer Mobile Container ── */}
      <div className="w-full max-w-[420px] flex flex-col items-center gap-4 relative z-10">

        {/* ── 1. Top App Header (BrandXpere Logo & Profile Icon) ── */}
        <header className="w-full flex items-center justify-between px-2 pt-1 pb-2">
          {/* Brand Logo */}
          <div className="flex items-center gap-1">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#3B0764] lowercase font-sans">
              brandxpere
            </span>
          </div>

          {/* Profile Circle Icon */}
          <div className="w-9 h-9 rounded-full bg-white/80 border border-purple-200 shadow-sm flex items-center justify-center text-[#581C87] cursor-pointer hover:bg-white transition-all">
            <User className="w-4 h-4" />
          </div>
        </header>

        {/* ── 2. The Luxury Digital Banking VIP Card ── */}
        <div 
          className="w-full aspect-[1.58/1] rounded-[26px] p-5 sm:p-6 text-white relative overflow-hidden shadow-[0_20px_45px_-10px_rgba(88,28,135,0.45)] border border-white/25 flex flex-col justify-between transition-all duration-300 group hover:shadow-[0_25px_50px_-8px_rgba(88,28,135,0.55)]"
          style={{
            background: 'linear-gradient(135deg, #4A1D96 0%, #2E1065 40%, #581C87 75%, #7C3AED 100%)',
          }}
        >
          {/* Diagonal Glass Glossy Sheen Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(115deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.04) 40%, transparent 60%)',
            }}
          />

          {/* Subtle curved wave background lines */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 100% 100%, rgba(255,255,255,0.4) 0%, transparent 60%)',
            }}
          />

          {/* Card Top Row: Store / Business Name + NFC Badge */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-1.5 max-w-[210px]">
              <span className="text-sm sm:text-base font-black tracking-wide text-white drop-shadow-sm truncate uppercase font-sans">
                {storeName}
              </span>
            </div>

            {/* Pill NFC Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-md text-[10px] sm:text-[11px] font-black tracking-wider text-white shadow-sm shrink-0">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
              <span>NFC</span>
              <span className="tracking-tighter font-mono text-xs opacity-90">)))</span>
            </div>
          </div>

          {/* Card Center Content: Heading + Subtitle */}
          <div className="relative z-10 my-auto pt-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {cardTitle}
            </h1>
            <p className="text-[11px] sm:text-xs text-white/80 font-medium mt-1 leading-snug max-w-[240px]">
              {profile.bio || (isArabic ? 'مشترياتك تقربك من مزايا وتخفيضات حصرية' : 'Vos achats vous rapprochent de plus d\'avantages')}
            </p>
          </div>

          {/* Card Bottom Row: Crown + Customer Name, and The Glowing BrandXpere "X" Symbol */}
          <div className="flex items-end justify-between relative z-10 pt-1">
            {/* Customer Name with Crown */}
            <div className="flex items-center gap-1.5 max-w-[200px]">
              <Crown className="w-3.5 h-3.5 text-amber-300 drop-shadow shrink-0" />
              <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide truncate">
                {customerDisplayName}
              </span>
            </div>

            {/* Glowing 3D BrandXpere "X" Symbol (Clean, modern, pure BrandXpere DNA) */}
            <div className="relative flex items-center justify-center -mr-1 -mb-1">
              <div 
                className="w-14 h-14 sm:w-16 sm:h-16 relative flex items-center justify-center opacity-90 group-hover:scale-105 transition-transform"
                style={{
                  filter: 'drop-shadow(0 0 14px rgba(168, 85, 247, 0.65))',
                }}
              >
                {/* Stylized rounded 3D 'X' mark */}
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                  {/* First diagonal bar */}
                  <rect 
                    x="18" y="42" width="64" height="16" rx="8" 
                    transform="rotate(45 50 50)" 
                    fill="url(#xGradient)" 
                    opacity="0.85" 
                  />
                  {/* Second diagonal bar */}
                  <rect 
                    x="18" y="42" width="64" height="16" rx="8" 
                    transform="rotate(-45 50 50)" 
                    fill="url(#xGradient)" 
                    opacity="0.95" 
                  />
                  <defs>
                    <linearGradient id="xGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#C084FC" />
                      <stop offset="50%" stopColor="#A855F7" />
                      <stop offset="100%" stopColor="#7E22CE" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Middle Pill Button: Save Card to Phone ── */}
        <button
          type="button"
          onClick={() => setShowSaveModal(true)}
          className="w-full py-3 px-4 rounded-2xl bg-white/90 border border-purple-200/80 shadow-sm flex items-center justify-between text-slate-700 hover:bg-white active:scale-[0.99] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-[#7C3AED] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-800">
              {isArabic ? 'حفظ بطاقتك على هاتفك' : 'Sauvegarder votre carte sur téléphone'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* ── 4. The Stamp Card Section (Container Blanc avec en-tête violet) ── */}
        <div className="w-full rounded-[30px] bg-white border border-purple-100 shadow-[0_15px_35px_-8px_rgba(88,28,135,0.12)] overflow-hidden space-y-4 pb-4">
          
          {/* Card Top Banner (En-tête violette) */}
          <div 
            className="px-5 py-3.5 flex items-center justify-between text-white"
            style={{
              background: 'linear-gradient(90deg, #6B21A8 0%, #7C3AED 50%, #8B5CF6 100%)',
            }}
          >
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-white" />
              <span className="text-xs sm:text-sm font-black tracking-wide">
                {isArabic ? 'بطاقة الوفاء' : 'Carte de Fidélité'}
              </span>
            </div>

            {/* Stamp Count Pill */}
            <div className="px-3 py-1 rounded-full bg-[#2E1065]/70 border border-white/20 text-[10px] sm:text-[11px] font-black uppercase tracking-wider backdrop-blur-sm shadow-inner">
              {currentStamps}/{targetStamps} {isArabic ? 'طوابع' : 'TAMPONS'}
            </div>
          </div>

          <div className="px-4 sm:px-5 space-y-3.5">
            
            {/* Green Success Toast (Tampon ajouté avec succès !) */}
            {successToast && (
              <div className="w-full py-2.5 px-3.5 rounded-2xl bg-[#10B981] text-white text-xs font-bold flex items-center justify-between shadow-md animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span>{successToast}</span>
                </div>
                <button onClick={() => setSuccessToast(null)} className="p-1 hover:opacity-75">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Error Toast */}
            {errorToast && (
              <div className="w-full py-2.5 px-3.5 rounded-2xl bg-rose-500 text-white text-xs font-bold flex items-center justify-between shadow-md animate-fade-in">
                <span>{errorToast}</span>
                <button onClick={() => setErrorToast(null)} className="p-1 hover:opacity-75">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Objective Banner with 3D Gift Icon */}
            <div className="rounded-2xl p-3 bg-[#FBF7FF] border border-purple-100 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md text-white">
                <Gift className="w-5 h-5 animate-bounce" style={{ animationDuration: '2.5s' }} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#7C3AED] block">
                  {isArabic ? 'هدف برنامج الوفاء' : 'OBJECTIF DE FIDÉLITÉ'}
                </span>
                <p className="text-xs font-black text-slate-800 mt-0.5 truncate leading-tight">
                  {rewardText}
                </p>
              </div>
            </div>

            {/* ── Case A: Customer not registered -> Phone Input (Phone ONLY required) ── */}
            {!savedPhone ? (
              <form onSubmit={handleEnrollPhone} className="space-y-3 py-2">
                <div className="text-center space-y-0.5 mb-1">
                  <p className="text-xs font-extrabold text-slate-800">
                    {isArabic ? 'أدخل رقم هاتفك لتفعيل بطاقتك وتجميع طوابعك' : 'Entrez votre numéro pour activer votre carte'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {isArabic ? 'التسجيل برقم الهاتف فقط وبضغطة واحدة' : 'Inscription rapide uniquement avec votre numéro'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      placeholder="06 12 34 56 78"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      dir="ltr"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-purple-200 bg-purple-50/40 text-xs font-bold text-slate-900 outline-none focus:border-[#7C3AED] focus:bg-white transition-all shadow-inner placeholder:text-slate-400"
                    />
                  </div>

                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-300" />
                    <input
                      type="text"
                      placeholder={isArabic ? 'اسمك الكامل (اختياري، ليظهر على البطاقة)' : 'Votre nom (optionnel, pour la carte)'}
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-purple-100 bg-white text-xs font-medium text-slate-800 outline-none focus:border-[#7C3AED] transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-2.5 rounded-xl text-xs font-black text-white shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  style={{
                    background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%)',
                  }}
                >
                  {isRegistering ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>{isArabic ? 'تفعيل بطاقتي الآن' : 'Activer ma carte'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* ── Case B: Customer registered -> Stamp Grid 5 x 2 ── */
              <div className="space-y-4">
                
                {/* Stamp Circles Grid: 2 rows of 5 circles */}
                <div className="grid grid-cols-5 gap-2.5 py-1">
                  {Array.from({ length: targetStamps }).map((_, idx) => {
                    const isStamped = idx < currentStamps;
                    const isLastGoal = idx === targetStamps - 1;

                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-full flex flex-col items-center justify-center relative transition-all duration-300 ${
                          isStamped
                            ? 'shadow-[0_4px_10px_rgba(124,58,237,0.35)] scale-[1.02]'
                            : isLastGoal
                            ? 'bg-[#FAF5FF] border-2 border-purple-300 shadow-sm'
                            : 'bg-white border border-slate-200 shadow-inner'
                        }`}
                        style={{
                          background: isStamped
                            ? 'radial-gradient(circle at 35% 35%, #A855F7 0%, #7E22CE 65%, #581C87 100%)'
                            : undefined,
                          color: isStamped ? '#FFFFFF' : '#94A3B8',
                        }}
                      >
                        {isStamped ? (
                          <>
                            {renderStampIcon(stampIcon, true)}
                            {/* Small checkmark pill on bottom-right */}
                            <div className="w-3.5 h-3.5 rounded-full bg-[#3B0764] border border-white/80 absolute -bottom-0.5 -right-0.5 flex items-center justify-center text-white shadow-sm">
                              <Check className="w-2 h-2" strokeWidth={3.5} />
                            </div>
                          </>
                        ) : isLastGoal ? (
                          <div className="flex flex-col items-center justify-center">
                            <div className="relative">
                              <Gift className="w-4 h-4 text-[#7C3AED]" />
                              <Sparkles className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1" />
                            </div>
                            <span className="text-[8px] font-black text-[#7C3AED] mt-0.5">{idx + 1}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            {renderStampIcon(stampIcon, false)}
                            <span className="text-[8px] font-bold opacity-60 mt-0.5">{idx + 1}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ── Cashier Action Button ── */}
                {isRewardReady ? (
                  <button
                    type="button"
                    onClick={() => { setPinModalAction('redeem'); setPinInput(''); setPinError(null); }}
                    className="w-full py-3.5 px-4 rounded-2xl text-xs font-black text-slate-900 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-400 shadow-lg hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Gift className="w-4 h-4" />
                    <span>{isArabic ? 'الكاشير: تسليم المكافأة' : 'Valider en caisse (Réclamer la récompense)'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setPinModalAction('stamp'); setPinInput(''); setPinError(null); }}
                    className="w-full py-3 px-4 rounded-2xl text-xs font-black text-white shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer group"
                    style={{
                      background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-200" />
                      <span>{isArabic ? 'ختم في الكاشير (+1 طابع)' : 'Tamponner en caisse (+1 Tampon)'}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-200 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}

                {/* ── Mon QR Code Fidélité (Scan Rapide en Caisse) ── */}
                <div className="rounded-2xl border border-purple-100 bg-gradient-to-b from-purple-50/70 to-white p-3.5 text-center space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-purple-950">
                      <QrCode className="w-4 h-4 text-purple-600" />
                      <span>{isArabic ? 'رمز QR الخاص بك' : 'Mon QR Code Fidélité'}</span>
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full border border-purple-200/50">
                      {isArabic ? 'مسح سريع' : 'Sans code PIN'}
                    </span>
                  </div>

                  {customerQrUrl ? (
                    <div className="flex flex-col items-center justify-center pt-0.5">
                      <div className="p-2 bg-white rounded-2xl border border-purple-200/70 shadow-sm inline-block">
                        <img
                          src={customerQrUrl}
                          alt="QR Fidélité Client"
                          className="w-32 h-32 mx-auto rounded-xl object-contain"
                        />
                      </div>
                      <p className="text-[11px] font-semibold text-slate-600 mt-1.5 max-w-[260px] leading-tight">
                        {isArabic
                          ? 'أظهر هذا الرمز للكاشير لمسحه والحصول على طابعك فوراً'
                          : 'Présentez ce QR code en caisse pour recevoir votre tampon instantanément'}
                      </p>
                    </div>
                  ) : (
                    <div className="py-3 text-xs text-purple-400">
                      {isArabic ? 'جاري تحضير الرمز...' : 'Génération du QR...'}
                    </div>
                  )}
                </div>

                {/* Active Phone & Customer Name Display */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold px-1 pt-1 border-t border-purple-100">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
                    <span className="text-slate-700 font-mono text-xs">{formatPhone(savedPhone)}</span>
                    {data?.customer?.customerName && (
                      <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                        {data.customer.customerName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditNameInput(data?.customer?.customerName || '');
                        setShowNameModal(true);
                      }}
                      className="text-purple-600 underline hover:text-purple-800 cursor-pointer flex items-center gap-0.5"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{data?.customer?.customerName ? (isArabic ? 'تعديل الاسم' : 'Nom') : (isArabic ? '+ أضف اسمك' : '+ Nom')}</span>
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem(storageKey);
                        setSavedPhone(null);
                        setPhoneInput('');
                        fetchLoyalty();
                      }}
                      className="text-slate-400 underline hover:text-slate-600 cursor-pointer"
                    >
                      {isArabic ? 'تغيير' : 'Changer'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 5. Security Footer ── */}
        <footer className="text-center space-y-1.5 pt-1 pb-4">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500">
            <Lock className="w-3 h-3 text-purple-500" />
            <span>{isArabic ? 'بياناتك مشفرة ومحمية بأمان' : 'Vos données sont sécurisées et cryptées'}</span>
          </div>
          <p className="text-[9px] font-medium text-slate-400">
            BrandXpere • {isArabic ? 'وفاء آمن ومحمي' : 'Fidélité sécurisée'}
          </p>
          <div className="pt-1.5 flex items-center justify-center gap-3">
            <a
              href={`/merchant/${profile.slug}`}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600/70 hover:text-purple-700 hover:underline transition-colors"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>{isArabic ? 'بوابة التاجر والكاشير 🔐' : 'Espace Commerçant 🔐'}</span>
            </a>
          </div>

        </footer>
      </div>

      {/* ── 6. Cashier PIN Pop-up Modal ── */}
      {pinModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-[28px] p-6 bg-[#18181B] text-white border border-white/15 shadow-2xl relative space-y-4">
            {/* Close button */}
            <button 
              type="button"
              onClick={() => setPinModalAction(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center space-y-1 pt-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">
                {pinModalAction === 'redeem'
                  ? (isArabic ? 'تأكيد تسليم المكافأة' : 'Validation Récompense')
                  : (isArabic ? 'رمز الكاشير السري' : 'Code PIN Commerçant')}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {isArabic 
                  ? 'يقوم موظف الكاشير بكتابة الرمز السري لإتمام العملية' 
                  : 'Saisie exclusive par le personnel de caisse'}
              </p>
            </div>

            {/* PIN Form */}
            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    placeholder="••••"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-52 text-center tracking-[0.4em] text-3xl font-black py-3 px-4 rounded-2xl border-2 bg-slate-950 border-purple-400 text-white placeholder-slate-400 caret-white outline-none focus:ring-4 focus:ring-purple-500/40 focus:border-purple-300 shadow-2xl transition-all"
                    style={{
                      color: '#ffffff',
                      WebkitTextFillColor: '#ffffff',
                      backgroundColor: '#09090b',
                      caretColor: '#ffffff',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {showPin 
                    ? (isArabic ? 'الأرقام ظاهرة' : 'Code visible') 
                    : (isArabic ? 'انقر على العين لإظهار الأرقام' : 'Cliquez sur l\'œil pour voir les chiffres')}
                </span>
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
                  style={{
                    background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%)',
                  }}
                >
                  {submittingPin ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>{isArabic ? 'تأكيد' : 'Valider'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. Save to Phone Modal ── */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-[28px] p-6 bg-white text-slate-800 border border-purple-100 shadow-2xl relative space-y-4">
            <button 
              type="button"
              onClick={() => setShowSaveModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-all text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2 pt-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                {isArabic ? 'حفظ البطاقة على هاتفك' : 'Sauvegarder sur votre téléphone'}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {isArabic 
                  ? 'يمكنك إضافة هذه الصفحة مباشرة إلى الشاشة الرئيسية لهاتفك للوصول إليها بنقرة واحدة عند كل زيارة للمحل!' 
                  : 'Ajoutez cette page à votre écran d\'accueil pour y accéder en un instant lors de chaque visite en caisse !'}
              </p>
            </div>

            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-xs font-semibold text-purple-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <span>📱 iPhone (Safari):</span>
              </p>
              <p className="text-[11px] text-slate-600 pl-2">
                اضغط على زر المشاركة (Share) في أسفل الشاشة، ثم اختر **"Sur l'écran d'accueil / إضافة للشاشة الرئيسية"**.
              </p>
              <p className="font-bold flex items-center gap-1.5 pt-1">
                <span>🤖 Android (Chrome):</span>
              </p>
              <p className="text-[11px] text-slate-600 pl-2">
                اضغط على الثلاث نقاط أعلى الشاشة، ثم اختر **"Ajouter à l'écran d'accueil"**.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSaveModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-black text-white shadow-md hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%)',
              }}
            >
              {isArabic ? 'حسناً، فهمت' : 'J\'ai compris'}
            </button>
          </div>
        </div>
      )}

      {/* ── 8. Edit Customer Name Modal ── */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-[28px] p-6 bg-white text-slate-800 border border-purple-100 shadow-2xl relative space-y-4">
            <button 
              type="button"
              onClick={() => setShowNameModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-all text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1 pt-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                {isArabic ? 'اسمك على بطاقة الولاء VIP' : 'Votre nom sur la carte VIP'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isArabic ? 'سيظهر اسمك تحت التاج الذهبي على وجه البطاقة البنكية' : 'Apparaîtra sous la couronne dorée sur la carte'}
              </p>
            </div>

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Ex: Ahmed Benali"
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-purple-200 bg-purple-50/30 text-xs font-bold text-slate-900 outline-none focus:border-[#7C3AED] focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowNameModal(false)}
                  className="py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  disabled={updatingName || !editNameInput.trim()}
                  className="py-2.5 rounded-xl text-xs font-black text-white shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  style={{
                    background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%)',
                  }}
                >
                  {updatingName ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>{isArabic ? 'حفظ الاسم' : 'Enregistrer'}</span>
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
