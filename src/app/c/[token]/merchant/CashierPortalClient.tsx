'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Crown, Lock, Key, Phone, Plus, Gift, CheckCircle2, 
  AlertCircle, RefreshCw, LogOut, Search, Clock, Users,
  ArrowLeft, ChevronRight, User, Smartphone, BarChart2,
  MessageSquare, Settings, Copy, Check, Download, TrendingUp,
  Sparkles, Filter, X, QrCode, ShieldCheck, Star, Trash2
} from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';

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

  // Dedicated Store Dashboard Tabs: 'caisse' | 'customers' | 'analytics' | 'messages' | 'settings'
  const [activeTab, setActiveTab] = useState<'caisse' | 'customers' | 'analytics' | 'messages' | 'settings'>('caisse');

  // Dashboard Data state
  const [data, setData] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Cashier Stamping Form (Mode Caisse)
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Customers Search & Filter
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');

  // Customer Detail Drawer
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerLogs, setCustomerLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [drawerActionLoading, setDrawerActionLoading] = useState(false);

  // Messaging State
  const [selectedSegment, setSelectedSegment] = useState('reward_ready');
  const [customMessage, setCustomMessage] = useState('');
  const [copiedPhones, setCopiedPhones] = useState(false);

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    storeName: '',
    cardTitle: '',
    rewardText: '',
    targetStamps: 10,
    stampIcon: 'coffee',
    merchantPin: '1234',
    cooldownMinutes: 5,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // QR Download State
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Check auth session & load store loyalty data
  const verifySession = async (silent = false) => {
    if (!silent) setCheckingAuth(true);
    else setRefreshing(true);

    try {
      const res = await fetch(`/api/profiles/${profileId}/loyalty/merchant`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setSettingsForm({
          storeName: json.settings.storeName,
          cardTitle: json.settings.cardTitle,
          rewardText: json.settings.rewardText,
          targetStamps: json.settings.targetStamps,
          stampIcon: json.settings.stampIcon,
          merchantPin: json.settings.merchantPin,
          cooldownMinutes: json.settings.cooldownMinutes,
        });

        // Generate QR code for the counter
        const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${slug}`;
        QRCode.toDataURL(publicUrl, { width: 400, margin: 2 })
          .then(url => setQrDataUrl(url))
          .catch(console.error);

        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
      setRefreshing(false);
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
        verifySession(true);
      }
    } catch {
      setPinError('Erreur de connexion');
    } finally {
      setSubmittingPin(false);
    }
  };

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

  // Logout Cashier Session (Locks back to PIN keypad)
  const handleLogout = async () => {
    try {
      await fetch(`/api/profiles/${profileId}/loyalty/merchant/auth`, { method: 'DELETE' });
    } catch {}
    setIsAuthenticated(false);
    setPin('');
    setData(null);
  };

  // Cashier Stamping & Redeem Action
  const handleCashierAction = async (action: 'ADD_STAMP' | 'REDEEM_REWARD') => {
    if (!phoneInput.trim()) return;
    setActionLoading(true);

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

      showToast(json.message);
      verifySession(true);
      setPhoneInput('');
      setNameInput('');
    } catch (e: any) {
      alert(e.message || 'Erreur de connexion');
    } finally {
      setActionLoading(false);
    }
  };

  // Customer Drawer Action
  const handleOpenCustomer = async (cust: any) => {
    setSelectedCustomer(cust);
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/loyalty/merchant/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GET_HISTORY', phone: cust.phone }),
      });
      if (res.ok) {
        const json = await res.json();
        setCustomerLogs(json.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleExecuteDrawerAction = async (action: 'ADD_STAMP' | 'REDEEM_REWARD' | 'RESET', custPhone: string) => {
    setDrawerActionLoading(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/loyalty/merchant/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, phone: custPhone }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Erreur lors de l’opération');
        return;
      }
      showToast(json.message);
      if (selectedCustomer && selectedCustomer.phone === custPhone) {
        setSelectedCustomer((prev: any) => ({
          ...prev,
          stampsCount: json.customer.stampsCount,
          rewardsEarned: json.customer.rewardsEarned,
          isRewardReady: json.customer.isRewardReady,
          lastStampAt: json.customer.lastStampAt,
        }));
        handleOpenCustomer({ ...selectedCustomer, phone: custPhone });
      }
      verifySession(true);
    } catch (e: any) {
      alert(e.message || 'Erreur');
    } finally {
      setDrawerActionLoading(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/loyalty/merchant`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Erreur de sauvegarde');
        return;
      }
      showToast('Paramètres du magasin mis à jour !');
      verifySession(true);
    } catch (e: any) {
      alert(e.message || 'Erreur réseau');
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    if (!data?.customers) return [];
    return data.customers.filter((c: any) => {
      const matchesSearch =
        (c.customerName || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch);
      if (!matchesSearch) return false;

      if (customerFilter === 'all') return true;
      if (customerFilter === 'reward_ready') return c.isRewardReady;
      if (customerFilter === 'almost_reward') return c.status === 'almost_reward';
      if (customerFilter === 'active') return c.status === 'active' || c.status === 'reward_ready';
      if (customerFilter === 'new') return c.status === 'new';
      if (customerFilter === 'inactive') return c.status === 'inactive';
      return true;
    });
  }, [data?.customers, customerSearch, customerFilter]);

  // Current customer lookup preview in Caisse Mode
  const activeCustomer = useMemo(() => {
    if (!data?.customers || !phoneInput.trim()) return null;
    const clean = phoneInput.replace(/[\s\-\.]/g, '');
    return data.customers.find((c: any) => c.phone.includes(clean) || clean.includes(c.phone));
  }, [data?.customers, phoneInput]);

  // Audience for Messaging
  const audienceForMessage = useMemo(() => {
    if (!data?.customers) return [];
    return data.customers.filter((c: any) => {
      if (selectedSegment === 'all') return true;
      if (selectedSegment === 'reward_ready') return c.isRewardReady;
      if (selectedSegment === 'almost_reward') return c.status === 'almost_reward';
      if (selectedSegment === 'new') return c.status === 'new';
      if (selectedSegment === 'inactive') return c.status === 'inactive';
      if (selectedSegment === 'loyal') return c.rewardsEarned >= 1 || c.visitsCount >= 5;
      return true;
    });
  }, [data?.customers, selectedSegment]);

  const formatDate = (iso: string | null) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return iso;
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0F071A] text-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
        <span className="text-xs font-bold text-purple-300">Vérification de la session caisse...</span>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // SCREEN 1: PIN PAD LOGIN FOR CASHIER & STORE OWNER
  // ─────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1E0938] via-[#0F071A] to-[#0A0412] text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm rounded-[32px] bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl text-center">
          {/* Logo / Badge */}
          <div className="space-y-2">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Crown className="w-8 h-8 text-amber-300" />
            </div>
            <h1 className="text-xl font-black tracking-tight">{storeName}</h1>
            <p className="text-xs text-purple-200">Espace Fidélité & Caisse du Magasin</p>
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
  // SCREEN 2: STANDALONE STORE LOYALTY PORTAL (100% ISOLATED)
  // Zero links to SaaS dashboard, zero sidebar, strictly store data!
  // ─────────────────────────────────────────────────────────────────
  const target = data?.settings?.targetStamps || targetStamps;
  const currentReward = data?.settings?.rewardText || rewardText;
  const publicCardUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${slug}`;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white pb-16 font-sans">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Header Bar (Isolated to this store only) */}
      <header className="bg-[#1E0938] text-white px-4 sm:px-8 py-3.5 border-b border-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/50 text-amber-300 border border-purple-400/30 flex items-center justify-center shadow-md">
              <Crown className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight">{data?.settings?.storeName || storeName}</h1>
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Espace Fidélité Sécurisé • PIN Actif</span>
              </div>
            </div>
          </div>

          {/* Mobile Lock button */}
          <button
            onClick={handleLogout}
            className="sm:hidden p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold"
            title="Verrouiller la caisse"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs (Inside this store only) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'caisse', label: 'Caisse Rapide ⚡', icon: Plus },
            { id: 'customers', label: `Clients (${data?.stats?.totalCustomers || 0})`, icon: Users },
            { id: 'analytics', label: 'Statistiques & Affluence', icon: BarChart2 },
            { id: 'messages', label: 'Marketing & Relances', icon: MessageSquare },
            { id: 'settings', label: 'Paramètres & QR', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-purple-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Desktop Lock button */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer ml-2"
            title="Verrouiller la caisse (déconnexion PIN)"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Verrouiller</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">

        {/* ──────────────────────────────────────────────────────────── */}
        {/* 1. TAB: CAISSE RAPIDE (QUICK COUNTER OPERATIONS)            */}
        {/* ──────────────────────────────────────────────────────────── */}
        {activeTab === 'caisse' && (
          <div className="space-y-6">
            {/* Big Counter Stamping Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md space-y-6">
              <div className="text-center space-y-1">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 inline-block">
                  Opération Comptoir & Caisse
                </span>
                <h2 className="text-xl sm:text-2xl font-black">Tamponner un Client</h2>
                <p className="text-xs text-slate-500">Saisissez le numéro de téléphone pour attribuer un tampon ou valider une récompense</p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                {/* Phone Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Numéro de Téléphone du Client</label>
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

                {/* Optional Name for new customer */}
                {!activeCustomer && phoneInput.trim().length >= 6 && (
                  <div className="space-y-1 animate-fade-in">
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
                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                          {(activeCustomer.customerName || 'V')[0]?.toUpperCase()}
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 dark:text-white block">
                            {activeCustomer.customerName || 'Client VIP'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">{activeCustomer.phone}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-purple-700 dark:text-purple-300 block">
                          {activeCustomer.stampsCount} / {target} tampons
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {activeCustomer.rewardsEarned > 0 ? `🏆 ${activeCustomer.rewardsEarned} cadeau(x)` : 'En cours'}
                        </span>
                      </div>
                    </div>

                    {activeCustomer.isRewardReady && (
                      <div className="p-2.5 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md animate-pulse">
                        <Gift className="w-4 h-4" />
                        <span>Récompense Prête : "{currentReward}"</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Stamping Buttons */}
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

            {/* Quick Stats Grid */}
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Clients Inscrits</span>
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
                  {data.recentActivity.slice(0, 6).map((log: any) => {
                    const isReward = log.action === 'REWARD_REDEEMED';
                    return (
                      <div key={log.id} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span>{isReward ? '🎁' : '⭐'}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {log.customerName || 'Client VIP'}
                          </span>
                          <span className="font-mono text-slate-400 text-[11px]">{log.phone}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-400">{formatDate(log.createdAt)}</span>
                          <span
                            className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                              isReward
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                            }`}
                          >
                            {isReward ? 'Cadeau Validé' : `+1 (${log.stampsCount}/${target})`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* 2. TAB: CLIENTS (DATABASE & HISTORY)                        */}
        {/* ──────────────────────────────────────────────────────────── */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou numéro..."
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
                {[
                  { id: 'all', label: 'Tous' },
                  { id: 'reward_ready', label: 'Cadeau Prêt 🎁' },
                  { id: 'almost_reward', label: 'Presque Prêt ⚡' },
                  { id: 'active', label: 'Actifs' },
                  { id: 'new', label: 'Nouveaux' },
                  { id: 'inactive', label: 'Inactifs' },
                ].map(pill => (
                  <button
                    key={pill.id}
                    onClick={() => setCustomerFilter(pill.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      customerFilter === pill.id
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {filteredCustomers.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 font-bold">
                  Aucun client trouvé pour cette recherche.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Tampons</th>
                        <th className="py-3 px-4">Cadeaux</th>
                        <th className="py-3 px-4">Visites</th>
                        <th className="py-3 px-4">Dernier Passage</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredCustomers.map((cust: any) => (
                        <tr
                          key={cust.id}
                          className="hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-colors cursor-pointer"
                          onClick={() => handleOpenCustomer(cust)}
                        >
                          <td className="py-3 px-4">
                            <span className="font-extrabold text-slate-900 dark:text-white block">
                              {cust.customerName || 'Client VIP'}
                            </span>
                            <span className="font-mono text-[11px] text-slate-400">{cust.phone}</span>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`font-black ${cust.isRewardReady ? 'text-emerald-600' : 'text-purple-600'}`}>
                              {cust.stampsCount} / {target}
                            </span>
                            {cust.isRewardReady && <span className="ml-1">🎁</span>}
                          </td>

                          <td className="py-3 px-4">
                            {cust.rewardsEarned > 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                                🏆 {cust.rewardsEarned}
                              </span>
                            ) : '-'}
                          </td>

                          <td className="py-3 px-4 font-bold">{cust.visitsCount}</td>

                          <td className="py-3 px-4 text-slate-400 text-[11px]">{formatDate(cust.lastStampAt)}</td>

                          <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleExecuteDrawerAction('ADD_STAMP', cust.phone)}
                                className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold cursor-pointer"
                                title="Ajouter +1 tampon"
                              >
                                +1 ⭐
                              </button>
                              {cust.isRewardReady && (
                                <button
                                  onClick={() => handleExecuteDrawerAction('REDEEM_REWARD', cust.phone)}
                                  className="px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold cursor-pointer animate-pulse"
                                  title="Valider la récompense"
                                >
                                  🎁 Valider
                                </button>
                              )}
                              <a
                                href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  `Bonjour ${cust.customerName || ''}, merci pour votre fidélité chez ${storeName} !`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs"
                                title="WhatsApp"
                              >
                                💬
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* 3. TAB: STATISTIQUES & AFFLUENCE (PEAK HOURS & CHARTS)      */}
        {/* ──────────────────────────────────────────────────────────── */}
        {activeTab === 'analytics' && data?.analytics && (
          <div className="space-y-6">
            {/* Top KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Taux de Rétention Client</span>
                <p className="text-3xl font-black text-purple-600">{data.analytics.returningRatio}%</p>
                <p className="text-[11px] text-slate-500">reviennent au moins 2 fois au magasin</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Moyenne de Visites</span>
                <p className="text-3xl font-black text-indigo-600">
                  {data.stats.totalCustomers > 0 ? (data.stats.totalVisits / data.stats.totalCustomers).toFixed(1) : '0'}
                </p>
                <p className="text-[11px] text-slate-500">passages par client enregistré</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Récompenses Remises</span>
                <p className="text-3xl font-black text-emerald-600">{data.stats.rewardsRedeemed}</p>
                <p className="text-[11px] text-slate-500">cadeaux offerts en caisse</p>
              </div>
            </div>

            {/* Peak Hours (Affluence 08h - 22h) */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span>Heures de Pointe au Magasin (Affluence en Caisse)</span>
                  </h3>
                  <p className="text-xs text-slate-500">Découvrez à quelle heure vos clients passent le plus souvent</p>
                </div>
              </div>

              <div className="pt-2 h-44 flex items-end gap-1.5 sm:gap-2 justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                {data.analytics.hourlyDistribution.slice(8, 23).map((count: number, i: number) => {
                  const hour = i + 8;
                  const maxHour = Math.max(1, ...data.analytics.hourlyDistribution);
                  const height = Math.round((count / maxHour) * 120);
                  const isPeak = count === maxHour && count > 0;

                  return (
                    <div key={hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-1.5 rounded pointer-events-none whitespace-nowrap z-20">
                        {hour}h : {count} passage(s)
                      </div>
                      <div
                        className={`w-full rounded-t-md transition-all ${
                          isPeak ? 'bg-amber-400 shadow-md' : 'bg-purple-500/70 hover:bg-purple-600'
                        }`}
                        style={{ height: `${Math.max(4, height)}px` }}
                      />
                      <span className={`text-[10px] font-mono ${isPeak ? 'font-black text-amber-600' : 'text-slate-400'}`}>
                        {hour}h
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 14-day history chart */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Activité Quotidienne (14 Derniers Jours)</h3>
              <div className="pt-2 h-40 flex items-end gap-2 justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                {data.analytics.dailyActivity.map((day: any, idx: number) => {
                  const maxVal = Math.max(1, ...data.analytics.dailyActivity.map((d: any) => Math.max(d.stamps, d.visits)));
                  const stampH = Math.round((day.stamps / maxVal) * 110);
                  const visitH = Math.round((day.visits / maxVal) * 110);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="w-full flex items-end justify-center gap-0.5 h-28">
                        <div className="w-1/2 bg-purple-600 rounded-t" style={{ height: `${Math.max(4, stampH)}px` }} />
                        <div className="w-1/2 bg-indigo-300 dark:bg-indigo-900/60 rounded-t" style={{ height: `${Math.max(4, visitH)}px` }} />
                      </div>
                      <span className="text-[9px] font-mono text-slate-400">{day.date.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* 4. TAB: MARKETING & RELANCES (WHATSAPP CAMPAIGNS)           */}
        {/* ──────────────────────────────────────────────────────────── */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span>1. Choisir l'Audience Cible</span>
              </h3>

              <div className="space-y-2">
                {[
                  { id: 'reward_ready', label: 'Cadeau Disponible 🎁', count: data?.segments?.reward_ready || 0 },
                  { id: 'almost_reward', label: 'Presque Prêt (≥ 70%) ⚡', count: data?.segments?.almost_reward || 0 },
                  { id: 'new', label: 'Nouveaux Inscrits (< 7j)', count: data?.segments?.new || 0 },
                  { id: 'loyal', label: 'Clients VIP Récurrents 👑', count: data?.segments?.loyal || 0 },
                  { id: 'inactive', label: 'Clients Inactifs (> 30j)', count: data?.segments?.inactive || 0 },
                  { id: 'all', label: 'Tous les Clients', count: data?.segments?.all || 0 },
                ].map(seg => (
                  <button
                    key={seg.id}
                    onClick={() => setSelectedSegment(seg.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                      selectedSegment === seg.id
                        ? 'border-purple-600 bg-purple-50 text-purple-900 dark:bg-purple-950/40 dark:text-purple-100 ring-2 ring-purple-600/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span>{seg.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-black">
                      {seg.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    const phones = audienceForMessage.map((c: any) => c.phone).join('\n');
                    navigator.clipboard.writeText(phones);
                    setCopiedPhones(true);
                    setTimeout(() => setCopiedPhones(false), 2500);
                  }}
                  disabled={audienceForMessage.length === 0}
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {copiedPhones ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPhones ? 'Numéros copiés !' : `Copier ${audienceForMessage.length} numéros`}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span>2. Message Promotionnel</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    label: '🎁 Cadeau prêt à récupérer',
                    text: `Félicitations ! 🎉 Votre carte de fidélité chez ${storeName} est complète ! Venez récupérer votre cadeau : "${currentReward}". À très vite !`,
                  },
                  {
                    label: '⚡ Plus que quelques tampons',
                    text: `Bonjour ! Vous êtes tout proche de votre cadeau chez ${storeName} 🎁. Passez nous voir pour compléter votre carte !`,
                  },
                  {
                    label: '☕ Vous nous manquez',
                    text: `Bonjour ! Cela fait un moment que nous ne vous avons pas vu chez ${storeName} 😊. Votre carte de fidélité vous attend avec plaisir !`,
                  },
                  {
                    label: '👑 Offre VIP spéciale',
                    text: `Merci de faire partie de nos meilleurs clients VIP chez ${storeName} 👑 ! Nous vous réservons une surprise lors de votre prochaine visite.`,
                  },
                ].map((tmpl, i) => (
                  <button
                    key={i}
                    onClick={() => setCustomMessage(tmpl.text)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-colors cursor-pointer"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>

              <textarea
                rows={4}
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                placeholder="Rédigez votre message ici..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none focus:border-purple-600"
              />

              <div className="flex gap-2">
                <a
                  href={
                    audienceForMessage.length > 0
                      ? `sms:${audienceForMessage.map((c: any) => c.phone).join(',')}?body=${encodeURIComponent(customMessage)}`
                      : '#'
                  }
                  className={`flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md ${
                    audienceForMessage.length === 0 || !customMessage ? 'pointer-events-none opacity-50' : ''
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Envoyer par SMS</span>
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(customMessage);
                    showToast('Texte copié !');
                  }}
                  disabled={!customMessage}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copier</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────── */}
        {/* 5. TAB: PARAMÈTRES & QR (SETTINGS & QR DOWNLOAD)            */}
        {/* ──────────────────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-600" />
                <span>Paramètres de la Carte de Fidélité</span>
              </h3>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Nom du Magasin</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.storeName}
                    onChange={e => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Description du Cadeau / Récompense</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.rewardText}
                    onChange={e => setSettingsForm({ ...settingsForm, rewardText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-purple-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Nombre de Tampons</label>
                    <select
                      value={settingsForm.targetStamps}
                      onChange={e => setSettingsForm({ ...settingsForm, targetStamps: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-purple-600"
                    >
                      {[5, 6, 8, 10, 12, 15, 20].map(n => (
                        <option key={n} value={n}>{n} Tampons</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Code PIN Caisse (4 chiffres)</label>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      value={settingsForm.merchantPin}
                      onChange={e => setSettingsForm({ ...settingsForm, merchantPin: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-black tracking-widest outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Enregistrer les modifications</span>
                </button>
              </form>
            </div>

            {/* QR Code Download for counter */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">QR Code Caisse du Magasin</h3>
                <p className="text-xs text-slate-500">À imprimer et poser sur le comptoir</p>
              </div>

              {qrDataUrl && (
                <div className="p-2.5 bg-white rounded-2xl border-2 border-purple-200 inline-block shadow-md">
                  <img src={qrDataUrl} alt="QR Code" className="w-44 h-44 mx-auto" />
                </div>
              )}

              <div className="space-y-2">
                <a
                  href={qrDataUrl}
                  download={`qr-fidelite-${slug}.png`}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger l'image (PNG)</span>
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(publicCardUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Lien copié !' : 'Copier le lien public'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Customer Detail Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-base flex items-center justify-center">
                {(selectedCustomer.customerName || 'V')[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {selectedCustomer.customerName || 'Client VIP'}
                </h3>
                <span className="text-xs font-mono text-slate-500">{selectedCustomer.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40">
                <span className="text-[10px] uppercase font-bold text-purple-600">Tampons</span>
                <p className="text-lg font-black text-purple-900 dark:text-purple-100">{selectedCustomer.stampsCount} / {target}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40">
                <span className="text-[10px] uppercase font-bold text-amber-600">Cadeaux</span>
                <p className="text-lg font-black text-amber-900 dark:text-amber-100">{selectedCustomer.rewardsEarned}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
                <span className="text-[10px] uppercase font-bold text-indigo-600">Visites</span>
                <p className="text-lg font-black text-indigo-900 dark:text-indigo-100">{selectedCustomer.visitsCount}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Actions Rapides</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExecuteDrawerAction('ADD_STAMP', selectedCustomer.phone)}
                  disabled={drawerActionLoading}
                  className="py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+1 Tampon</span>
                </button>
                {selectedCustomer.isRewardReady && (
                  <button
                    onClick={() => handleExecuteDrawerAction('REDEEM_REWARD', selectedCustomer.phone)}
                    disabled={drawerActionLoading}
                    className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer animate-pulse"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Valider Cadeau</span>
                  </button>
                )}
              </div>
              <a
                href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Bonjour ${selectedCustomer.customerName || ''}, nous vous remercions pour votre fidélité chez ${storeName} !`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>💬 Écrire sur WhatsApp</span>
              </a>
            </div>

            {/* Logs timeline */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500">Historique des passages :</span>
              {loadingLogs ? (
                <p className="text-xs text-slate-400">Chargement...</p>
              ) : customerLogs.length === 0 ? (
                <p className="text-xs text-slate-400">Aucun événement enregistré.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto text-xs pr-1">
                  {customerLogs.map((log: any) => (
                    <div key={log.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between">
                      <span>{log.action === 'REWARD_REDEEMED' ? '🎁 Cadeau validé' : '⭐ +1 Tampon'}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(log.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
