'use client';

import React, { useState, useEffect } from 'react';
import { 
  Crown, Lock, Key, Phone, Plus, Gift, CheckCircle2, 
  AlertCircle, RefreshCw, LogOut, Search, Clock, Users,
  ExternalLink, ArrowLeft, ChevronRight, User, Smartphone
} from 'lucide-react';
import Link from 'next/link';

interface CashierPortalClientProps {
  profileId: string;
  slug: string;
  storeName: string;
  targetStamps: number;
  rewardText: string;
  photoUrl?: string | null;
}

export default function CashierPortalClient({
  profileId,
  slug,
  storeName,
  targetStamps,
  rewardText,
  photoUrl,
}: CashierPortalClientProps) {
  // Session state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // PIN Pad state
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [submittingPin, setSubmittingPin] = useState(false);

  // Dashboard Data state
  const [data, setData] = useState<any | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Cashier Stamping Form
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [lastActionSuccess, setLastActionSuccess] = useState<string | null>(null);

  // Customer search & view
  const [customerSearch, setCustomerSearch] = useState('');

  // Check auth session
  const verifySession = async () => {
    setCheckingAuth(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/loyalty/merchant`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    verifySession();
  }, [profileId]);

  // Handle PIN submission
  const handlePinSubmit = async (pinValue?: string) => {
    const pinToSubmit = pinValue || pin;
    if (!pinToSubmit || pinToSubmit.length < 1) return;

    setSubmittingPin(true);
    setPinError(null);

    try {
      const res = await fetch(`/api/profiles/${profileId}/loyalty/merchant/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinToSubmit }),
      });

      const json = await res.json();
      if (!res.ok) {
        setPinError(json.error || 'Code PIN incorrect');
        setPin('');
      } else {
        setIsAuthenticated(true);
        verifySession();
      }
    } catch {
      setPinError('Erreur de connexion');
    } finally {
      setSubmittingPin(false);
    }
  };

  // Handle Keypad button press
  const handleKeypadPress = (val: string) => {
    if (pin.length >= 6) return;
    const nextPin = pin + val;
    setPin(nextPin);
    if (nextPin.length === 4) {
      handlePinSubmit(nextPin);
    }
  };

  const handleKeypadBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  // Logout Cashier Session
  const handleLogout = async () => {
    try {
      await fetch(`/api/profiles/${profileId}/loyalty/merchant/auth`, { method: 'DELETE' });
    } catch {}
    setIsAuthenticated(false);
    setPin('');
    setData(null);
  };

  // Handle direct stamp or redeem
  const handleCashierAction = async (action: 'ADD_STAMP' | 'REDEEM_REWARD') => {
    if (!phoneInput.trim()) return;
    setActionLoading(true);
    setLastActionSuccess(null);

    try {
      const res = await fetch(`/api/profiles/${profileId}/loyalty/merchant/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          phone: phoneInput.trim(),
          customerName: nameInput.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Erreur lors de l’opération');
        return;
      }

      setLastActionSuccess(json.message);
      // Reload merchant data
      verifySession();
      // Reset inputs after 2.5s
      setTimeout(() => {
        setLastActionSuccess(null);
        setPhoneInput('');
        setNameInput('');
      }, 2500);
    } catch (e: any) {
      alert(e.message || 'Erreur de connexion');
    } finally {
      setActionLoading(false);
    }
  };

  // Current customer lookup preview
  const activeCustomer = React.useMemo(() => {
    if (!data?.customers || !phoneInput.trim()) return null;
    const clean = phoneInput.replace(/[\s\-\.]/g, '');
    return data.customers.find((c: any) => c.phone.includes(clean) || clean.includes(c.phone));
  }, [data?.customers, phoneInput]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0F071A] text-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
        <span className="text-xs font-bold text-purple-300">Vérification de la session caisse...</span>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // SCREEN 1: PIN PAD LOGIN FOR CASHIER
  // ─────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1E0938] via-[#0F071A] to-[#0A0412] text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-[32px] bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl text-center">
          {/* Logo / Badge */}
          <div className="space-y-2">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Crown className="w-8 h-8 text-amber-300" />
            </div>
            <h1 className="text-xl font-black tracking-tight">{storeName}</h1>
            <p className="text-xs text-purple-200">Espace Caisse & Tablette Commerçant</p>
          </div>

          {/* PIN Indicators */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
              Entrez le Code PIN Caisse
            </span>
            <div className="flex items-center justify-center gap-3">
              {[0, 1, 2, 3].map(idx => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    pin.length > idx
                      ? 'bg-amber-400 border-amber-400 scale-110 shadow-md shadow-amber-400/50'
                      : 'border-purple-400/40 bg-white/5'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Error message */}
          {pinError && (
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold animate-shake">
              {pinError}
            </div>
          )}

          {/* Numeric Touch Keypad */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                disabled={submittingPin}
                className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-purple-600/40 border border-white/10 text-xl font-black text-white transition-all cursor-pointer select-none active:scale-95 disabled:opacity-50"
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPin('')}
              className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-400 transition-all cursor-pointer select-none"
            >
              Effacer
            </button>

            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              disabled={submittingPin}
              className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-purple-600/40 border border-white/10 text-xl font-black text-white transition-all cursor-pointer select-none active:scale-95 disabled:opacity-50"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleKeypadBackspace}
              className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-base font-bold text-slate-300 transition-all cursor-pointer select-none flex items-center justify-center"
            >
              ⌫
            </button>
          </div>

          {/* Fallback button if 4 digits entered */}
          {pin.length >= 4 && (
            <button
              onClick={() => handlePinSubmit()}
              disabled={submittingPin}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {submittingPin ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Valider la connexion</span>}
            </button>
          )}

          <div className="pt-2">
            <Link
              href={`/c/${slug}`}
              className="text-[11px] text-purple-300/70 hover:text-purple-200 underline"
            >
              ← Retour à la carte de fidélité client
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // SCREEN 2: ACTIVE IN-STORE CASHIER INTERFACE
  // ─────────────────────────────────────────────────────────────────
  const target = data?.settings?.targetStamps || targetStamps;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white pb-12 font-sans">
      {/* Top Cashier Bar */}
      <header className="bg-[#1E0938] text-white px-4 sm:px-8 py-4 border-b border-purple-900 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/50 text-amber-300 border border-purple-400/30 flex items-center justify-center shadow-md">
            <Crown className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight">{storeName}</h1>
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Caisse Connectée & Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/loyalty/${profileId}`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-purple-200 transition-all"
            title="Ouvrir le tableau de bord complet avec statistiques"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tableau de Bord</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="Verrouiller la caisse (déconnexion PIN)"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Verrouiller</span>
          </button>
        </div>
      </header>

      {/* Main Cashier Workspace */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Success Banner */}
        {lastActionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span>{lastActionSuccess}</span>
          </div>
        )}

        {/* Big Stamping Box (Centerpiece of the cashier tablet) */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md space-y-6">
          <div className="text-center space-y-1">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 inline-block">
              Opération Comptoir
            </span>
            <h2 className="text-xl sm:text-2xl font-black">Tamponner un Client</h2>
            <p className="text-xs text-slate-500">Demandez le numéro de téléphone au client ou saisissez-le ci-dessous</p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            {/* Phone Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Numéro de Téléphone</label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-500" />
                <input
                  type="tel"
                  autoFocus
                  placeholder="0612345678"
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-900/60 text-base sm:text-lg font-mono font-black text-slate-900 dark:text-white outline-none focus:border-purple-600 focus:bg-white dark:focus:bg-slate-800 shadow-inner"
                />
              </div>
            </div>

            {/* Optional Name Input */}
            {!activeCustomer && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Nom du Client (Optionnel)</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ex: Yassine"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-600"
                  />
                </div>
              </div>
            )}

            {/* Active Customer Real-Time Card */}
            {activeCustomer && (
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                      {(activeCustomer.customerName || 'V')[0]?.toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        {activeCustomer.customerName || 'Client VIP'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{activeCustomer.phone}</span>
                    </div>
                  </div>

                  <span className="text-xs font-black text-purple-700 dark:text-purple-300">
                    {activeCustomer.stampsCount} / {target} tampons
                  </span>
                </div>

                {activeCustomer.isRewardReady && (
                  <div className="p-2.5 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md animate-pulse">
                    <Gift className="w-4 h-4" />
                    <span>Récompense Débloquée ! Prêt à offrir</span>
                  </div>
                )}
              </div>
            )}

            {/* Big Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleCashierAction('ADD_STAMP')}
                disabled={actionLoading || !phoneInput.trim()}
                className="py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-black text-sm sm:text-base shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5 stroke-[3]" />
                    <span>Ajouter +1 Tampon</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleCashierAction('REDEEM_REWARD')}
                disabled={actionLoading || !phoneInput.trim() || (activeCustomer && !activeCustomer.isRewardReady)}
                className={`py-4 px-6 rounded-2xl text-white font-black text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                  activeCustomer?.isRewardReady
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25 animate-pulse'
                    : 'bg-slate-400 dark:bg-slate-700 opacity-60 cursor-not-allowed'
                }`}
              >
                <Gift className="w-5 h-5" />
                <span>Valider Récompense 🎁</span>
              </button>
            </div>
          </div>
        </div>

        {/* Today's Cashier Quick Stats */}
        {data?.stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Passages Aujourd'hui</span>
              <p className="text-2xl font-black text-purple-600">{data.stats.todayVisits}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tampons Donnés</span>
              <p className="text-2xl font-black text-amber-500">{data.stats.todayStamps}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Cadeaux Débloqués</span>
              <p className="text-2xl font-black text-emerald-500">{data.segments?.reward_ready || 0}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Clients Totaux</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{data.stats.totalCustomers}</p>
            </div>
          </div>
        )}

        {/* Recent Activity Mini-Feed */}
        {data?.recentActivity && data.recentActivity.length > 0 && (
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>Derniers Passages en Caisse</span>
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {data.recentActivity.slice(0, 5).map((log: any) => {
                const isReward = log.action === 'REWARD_REDEEMED';
                return (
                  <div key={log.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{isReward ? '🎁' : '⭐'}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {log.customerName || 'Client VIP'}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px]">{log.phone}</span>
                    </div>

                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                        isReward
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                      }`}
                    >
                      {isReward ? 'Cadeau Remis' : `+1 (${log.stampsCount}/${target})`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
