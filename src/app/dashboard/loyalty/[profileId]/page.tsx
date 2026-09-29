'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  Crown, Sparkles, Users, Award, Gift, TrendingUp, Calendar, Clock,
  Search, Filter, Phone, MessageSquare, Download, Share2, ShieldCheck,
  ChevronRight, Check, X, RefreshCw, Smartphone, QrCode, Copy,
  AlertCircle, Settings, Store, Lock, Key, Plus, ExternalLink,
  Sliders, Eye, Send, CheckCircle2, Star, Trash2, ArrowUpRight,
  BarChart2, Coffee, Utensils, Scissors, Heart, ArrowLeft, ArrowRight,
  TrendingDown, Layers
} from 'lucide-react';

interface LoyaltyDashboardData {
  business: {
    id: string;
    name: string;
    company: string;
    slug: string;
    photoUrl?: string | null;
    role: string;
  };
  settings: {
    storeName: string;
    cardTitle: string;
    rewardText: string;
    targetStamps: number;
    stampIcon: string;
    merchantPin: string;
    cooldownMinutes: number;
  };
  stats: {
    totalCustomers: number;
    activeCustomers: number;
    totalVisits: number;
    stampsGiven: number;
    rewardsRedeemed: number;
    todayVisits: number;
    todayStamps: number;
  };
  customers: Array<{
    id: string;
    phone: string;
    customerName: string | null;
    stampsCount: number;
    rewardsEarned: number;
    visitsCount: number;
    lastStampAt: string | null;
    createdAt: string;
    isRewardReady: boolean;
    status: 'reward_ready' | 'almost_reward' | 'active' | 'new' | 'inactive' | 'en_cours';
  }>;
  recentActivity: Array<{
    id: string;
    phone: string;
    customerName: string | null;
    action: string;
    stampsCount: number;
    createdAt: string;
  }>;
  segments: {
    all: number;
    active: number;
    new: number;
    almost_reward: number;
    reward_ready: number;
    loyal: number;
    inactive: number;
  };
  analytics: {
    dailyActivity: Array<{ date: string; stamps: number; visits: number; rewards: number }>;
    hourlyDistribution: number[];
    returningRatio: number;
  };
}

export default function MerchantLoyaltyDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const profileId = (params?.profileId || '') as string;

  const [data, setData] = useState<LoyaltyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Tabs: 'overview' | 'customers' | 'activity' | 'analytics' | 'rewards' | 'messages' | 'settings'
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'activity' | 'analytics' | 'rewards' | 'messages' | 'settings'>('overview');

  // Customer search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<string>('all');

  // Customer Detail Drawer
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerLogs, setCustomerLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [customerActionLoading, setCustomerActionLoading] = useState(false);

  // Quick Action Modal (direct stamp/redeem)
  const [quickPhoneInput, setQuickPhoneInput] = useState('');
  const [quickNameInput, setQuickNameInput] = useState('');
  const [quickActionType, setQuickActionType] = useState<'ADD_STAMP' | 'REDEEM_REWARD'>('ADD_STAMP');
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [quickActionLoading, setQuickActionLoading] = useState(false);

  // Messaging state
  const [selectedMessageSegment, setSelectedMessageSegment] = useState<string>('reward_ready');
  const [customMessage, setCustomMessage] = useState('');
  const [copiedPhones, setCopiedPhones] = useState(false);

  // Settings editing state
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

  // QR Code State
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Fetch full isolated loyalty data
  const fetchData = async (isSilent = false) => {
    if (!profileId) return;
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch(`/api/profiles/${profileId}/loyalty/merchant`);
      if (res.status === 401) {
        setError('Accès non autorisé à cet espace de fidélité.');
        return;
      }
      if (!res.ok) {
        throw new Error('Erreur de chargement');
      }
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

      // Generate QR Code for public card link
      const publicUrl = `${window.location.origin}/c/${json.business.slug}`;
      QRCode.toDataURL(publicUrl, { width: 400, margin: 2 })
        .then(url => setQrDataUrl(url))
        .catch(console.error);

    } catch (e: any) {
      setError(e.message || 'Impossible de charger les données');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profileId]);

  // Open Customer Detail Drawer & load their logs
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

  // Direct Customer Action (Stamp, Redeem, Reset)
  const handleExecuteCustomerAction = async (action: 'ADD_STAMP' | 'REDEEM_REWARD' | 'RESET', custPhone: string, customStamps?: number) => {
    setCustomerActionLoading(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/loyalty/merchant/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          phone: custPhone,
          stampsCount: customStamps,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Erreur lors de l’action');
        return;
      }
      showToast(json.message);
      // Refresh current customer if drawer open
      if (selectedCustomer && selectedCustomer.phone === custPhone) {
        setSelectedCustomer((prev: any) => ({
          ...prev,
          stampsCount: json.customer.stampsCount,
          rewardsEarned: json.customer.rewardsEarned,
          isRewardReady: json.customer.isRewardReady,
          lastStampAt: json.customer.lastStampAt,
        }));
        // Reload logs
        handleOpenCustomer({ ...selectedCustomer, phone: custPhone });
      }
      fetchData(true);
    } catch (err: any) {
      alert(err.message || 'Erreur réseau');
    } finally {
      setCustomerActionLoading(false);
    }
  };

  // Quick Action form submission
  const handleQuickActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPhoneInput.trim()) return;

    setQuickActionLoading(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/loyalty/merchant/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: quickActionType,
          phone: quickPhoneInput.trim(),
          customerName: quickNameInput.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Erreur lors de l’action');
        return;
      }
      showToast(json.message);
      setShowQuickModal(false);
      setQuickPhoneInput('');
      setQuickNameInput('');
      fetchData(true);
    } catch (err: any) {
      alert(err.message || 'Erreur réseau');
    } finally {
      setQuickActionLoading(false);
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
      showToast('Paramètres mis à jour avec succès !');
      fetchData(true);
    } catch (e: any) {
      alert(e.message || 'Erreur de connexion');
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    if (!data?.customers) return [];
    return data.customers.filter(c => {
      // Search filter
      const matchesSearch =
        (c.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery);

      if (!matchesSearch) return false;

      // Segment filter
      if (selectedSegmentFilter === 'all') return true;
      if (selectedSegmentFilter === 'reward_ready') return c.isRewardReady;
      if (selectedSegmentFilter === 'almost_reward') return c.status === 'almost_reward';
      if (selectedSegmentFilter === 'active') return c.status === 'active' || c.status === 'reward_ready' || c.status === 'almost_reward';
      if (selectedSegmentFilter === 'new') return c.status === 'new';
      if (selectedSegmentFilter === 'inactive') return c.status === 'inactive';
      return true;
    });
  }, [data?.customers, searchQuery, selectedSegmentFilter]);

  // Segment Audience for Messaging
  const audienceForMessage = useMemo(() => {
    if (!data?.customers) return [];
    return data.customers.filter(c => {
      if (selectedMessageSegment === 'all') return true;
      if (selectedMessageSegment === 'reward_ready') return c.isRewardReady;
      if (selectedMessageSegment === 'almost_reward') return c.status === 'almost_reward';
      if (selectedMessageSegment === 'new') return c.status === 'new';
      if (selectedMessageSegment === 'inactive') return c.status === 'inactive';
      if (selectedMessageSegment === 'loyal') return c.rewardsEarned >= 1 || c.visitsCount >= 5;
      return true;
    });
  }, [data?.customers, selectedMessageSegment]);

  // Pre-filled message templates
  const messageTemplates = useMemo(() => {
    const store = data?.settings?.storeName || 'notre magasin';
    const reward = data?.settings?.rewardText || 'votre cadeau';
    return [
      {
        id: 'reward_ready',
        label: '🎁 Cadeau prêt à être récupéré',
        text: `Félicitations ! 🎉 Votre carte de fidélité chez ${store} est complète ! Venez récupérer votre cadeau : "${reward}". À très vite !`,
      },
      {
        id: 'almost_there',
        label: '⚡ Plus que quelques tampons !',
        text: `Bonjour ! Vous êtes tout proche de votre récompense chez ${store} 🎁. Passez nous voir pour compléter votre carte et profiter de votre cadeau exclusif !`,
      },
      {
        id: 'win_back',
        label: '☕ Vous nous manquez',
        text: `Bonjour ! Cela fait un moment que nous ne vous avons pas vu chez ${store} 😊. Votre carte de fidélité vous attend ! Venez nous rendre visite cette semaine.`,
      },
      {
        id: 'vip_thanks',
        label: '👑 Remerciement VIP',
        text: `Merci de faire partie de nos meilleurs clients VIP chez ${store} 👑 ! Nous vous réservons une attention toute particulière lors de votre prochaine visite.`,
      },
    ];
  }, [data]);

  // Copy phone numbers
  const handleCopyAudiencePhones = () => {
    const phones = audienceForMessage.map(c => c.phone).join('\n');
    navigator.clipboard.writeText(phones);
    setCopiedPhones(true);
    setTimeout(() => setCopiedPhones(false), 2500);
  };

  // Format date helper
  const formatDate = (iso: string | null) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-600 border-t-transparent animate-spin" />
        <span className="text-sm font-bold text-slate-500">Chargement de votre Espace Fidélité...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Accès restreint</h2>
        <p className="text-sm text-slate-500">{error || 'Impossible d’accéder à ce programme de fidélité.'}</p>
        <Link
          href="/dashboard/profiles"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux profils</span>
        </Link>
      </div>
    );
  }

  const { business, settings, stats, segments, analytics, recentActivity } = data;
  const targetStamps = settings.targetStamps || 10;
  const publicCardUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${business.slug}`;
  const cashierPortalUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${business.slug}/merchant`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── Toast Notification ── */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ── Top Header Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2E0854] via-[#581C87] to-[#7C3AED] p-6 sm:p-8 text-white shadow-xl shadow-purple-950/20 border border-purple-400/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>Espace Fidélité Marchand</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-purple-100 border border-white/20">
                Code PIN Caisse : <span className="font-mono font-black">{settings.merchantPin}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              <span>{settings.storeName || business.company || business.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 font-medium max-w-xl">
              Gérez vos clients fidèles, attribuez des tampons en caisse, observez les heures de pointe et envoyez des relances marketing.
            </p>
          </div>

          {/* Header Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setQuickActionType('ADD_STAMP');
                setShowQuickModal(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+1 Tampon Client</span>
            </button>

            <a
              href={publicCardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Ouvrir la carte publique du client"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voir Carte</span>
            </a>

            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer disabled:opacity-50"
              title="Rafraîchir les données en direct"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-purple-400/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: Sparkles },
            { id: 'customers', label: `Clients (${stats.totalCustomers})`, icon: Users },
            { id: 'activity', label: 'Flux d\'activité', icon: Clock },
            { id: 'analytics', label: 'Statistiques & Affluence', icon: BarChart2 },
            { id: 'rewards', label: `Récompenses (${stats.rewardsRedeemed})`, icon: Gift },
            { id: 'messages', label: 'Marketing & Relances', icon: MessageSquare },
            { id: 'settings', label: 'Paramètres & QR Caisse', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-purple-900 shadow-md font-black'
                    : 'text-purple-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-700' : 'text-purple-300'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. TAB: VUE D'ENSEMBLE (OVERVIEW)                            */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Total Clients */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Clients Totaux</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalCustomers}</p>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{segments.new} nouveaux (7j)</span>
              </span>
            </div>

            {/* Clients Actifs */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Clients Actifs</span>
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.activeCustomers}</p>
              <span className="text-[10px] text-indigo-600 font-bold">Derniers 30 jours</span>
            </div>

            {/* Total Visites */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Passages</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalVisits}</p>
              <span className="text-[10px] text-blue-600 font-bold">Scans & passages</span>
            </div>

            {/* Tampons Distribués */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Tampons Donnés</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.stampsGiven}</p>
              <span className="text-[10px] text-amber-600 font-bold">Total cumulé</span>
            </div>

            {/* Récompenses Débloquées */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Cadeaux Offerts</span>
                <Gift className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.rewardsRedeemed}</p>
              <span className="text-[10px] text-emerald-600 font-bold">Validés en caisse</span>
            </div>

            {/* Aujourd'hui */}
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-purple-700 dark:text-purple-300">
                <span className="text-[11px] font-bold uppercase tracking-wider">Aujourd'hui</span>
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-purple-900 dark:text-purple-100">{stats.todayVisits}</p>
              <span className="text-[10px] text-purple-600 font-bold">{stats.todayStamps} tampons ce jour</span>
            </div>
          </div>

          {/* Quick Cashier Bar */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 flex items-center justify-center font-bold">
                ⚡
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Opération Caisse Rapide</h3>
                <p className="text-xs text-slate-500">Ajoutez un tampon ou validez une récompense en tapant le numéro du client</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => {
                  setQuickActionType('ADD_STAMP');
                  setShowQuickModal(true);
                }}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tamponner (+1)</span>
              </button>
              <button
                onClick={() => {
                  setQuickActionType('REDEEM_REWARD');
                  setShowQuickModal(true);
                }}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Gift className="w-4 h-4" />
                <span>Valider Cadeau</span>
              </button>
              <a
                href={cashierPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Lien direct pour la tablette ou le smartphone en caisse (Mode PIN)"
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Mode Tablette</span>
              </a>
            </div>
          </div>

          {/* Two-Column Layout: Audience Segments & Recent Live Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Audience Segments Breakdown */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Segmentation Clients</span>
                </h3>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                  Temps réel
                </span>
              </div>

              <div className="space-y-2">
                {[
                  {
                    key: 'reward_ready',
                    label: 'Cadeau disponible ! 🎁',
                    desc: 'Clients ayant atteint les 10 tampons',
                    count: segments.reward_ready,
                    color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900',
                  },
                  {
                    key: 'almost_reward',
                    label: 'Presque au cadeau ⚡',
                    desc: '70% ou plus du palier complété',
                    count: segments.almost_reward,
                    color: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900',
                  },
                  {
                    key: 'active',
                    label: 'Clients Actifs',
                    desc: 'Visite dans les 30 derniers jours',
                    count: segments.active,
                    color: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-900',
                  },
                  {
                    key: 'new',
                    label: 'Nouveaux Inscrits',
                    desc: 'Première visite cette semaine',
                    count: segments.new,
                    color: 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900',
                  },
                  {
                    key: 'inactive',
                    label: 'Clients Inactifs (>30j)',
                    desc: 'Opportunité de relance SMS/WhatsApp',
                    count: segments.inactive,
                    color: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900',
                  },
                ].map(seg => (
                  <div
                    key={seg.key}
                    onClick={() => {
                      setSelectedSegmentFilter(seg.key);
                      setActiveTab('customers');
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform ${seg.color}`}
                  >
                    <div>
                      <h4 className="text-xs font-bold">{seg.label}</h4>
                      <p className="text-[10px] opacity-80">{seg.desc}</p>
                    </div>
                    <span className="text-lg font-black">{seg.count}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveTab('messages')}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Lancer une relance ciblée</span>
              </button>
            </div>

            {/* Right: Live Activity Stream (Recent 15) */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Derniers Passages en Caisse</h3>
                </div>
                <button
                  onClick={() => setActiveTab('activity')}
                  className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Voir l'historique complet</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {recentActivity.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-500">Aucun passage enregistré pour le moment.</p>
                  <p className="text-[11px] text-slate-400">Présentez votre QR Code en caisse pour débuter !</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentActivity.slice(0, 8).map(log => {
                    const isReward = log.action === 'REWARD_REDEEMED';
                    const isReset = log.action === 'RESET';
                    return (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between hover:bg-slate-100/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black ${
                              isReward
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60'
                                : isReset
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-950/60'
                            }`}
                          >
                            {isReward ? '🎁' : isReset ? '🔄' : '⭐'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                {log.customerName || 'Client VIP'}
                              </span>
                              <span className="text-[11px] font-mono text-slate-500">{log.phone}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{formatDate(log.createdAt)}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-xs font-black px-2 py-0.5 rounded-full ${
                              isReward
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : isReset
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                            }`}
                          >
                            {isReward ? 'Cadeau Récupéré 🎉' : isReset ? 'Réinitialisation' : `+1 Tampon (${log.stampsCount}/${targetStamps})`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. TAB: CLIENTS (CUSTOMERS DATABASE)                        */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          {/* Filters & Search Header */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou téléphone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'reward_ready', label: 'Prêt Cadeau 🎁' },
                { id: 'almost_reward', label: 'Presque Prêt ⚡' },
                { id: 'active', label: 'Actifs' },
                { id: 'new', label: 'Nouveaux' },
                { id: 'inactive', label: 'Inactifs' },
              ].map(pill => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedSegmentFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSegmentFilter === pill.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customers Table / List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {filteredCustomers.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-300" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Aucun client trouvé</h4>
                <p className="text-xs text-slate-400">Essayez un autre terme de recherche ou changez le filtre.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">
                      <th className="py-3 px-4">Client VIP</th>
                      <th className="py-3 px-4">Progression Tampons</th>
                      <th className="py-3 px-4">Cadeaux Obtenus</th>
                      <th className="py-3 px-4">Passages</th>
                      <th className="py-3 px-4">Dernière Visite</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                    {filteredCustomers.map(cust => {
                      const progressPct = Math.min(100, Math.round((cust.stampsCount / targetStamps) * 100));
                      const isReady = cust.isRewardReady;

                      return (
                        <tr
                          key={cust.id}
                          className="hover:bg-purple-50/30 dark:hover:bg-purple-950/10 transition-colors cursor-pointer"
                          onClick={() => handleOpenCustomer(cust)}
                        >
                          {/* Name & Phone */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 font-black text-xs flex items-center justify-center">
                                {(cust.customerName || 'V')[0]?.toUpperCase()}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900 dark:text-white block">
                                  {cust.customerName || 'Client VIP'}
                                </span>
                                <span className="text-[11px] font-mono text-slate-500">{cust.phone}</span>
                              </div>
                            </div>
                          </td>

                          {/* Stamps Progress */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1 w-36">
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className={isReady ? 'text-emerald-600 font-black' : 'text-slate-700 dark:text-slate-300'}>
                                  {cust.stampsCount} / {targetStamps}
                                </span>
                                <span className="text-[10px] text-slate-400">{progressPct}%</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isReady
                                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                      : 'bg-gradient-to-r from-purple-600 to-indigo-500'
                                  }`}
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Rewards Earned */}
                          <td className="py-3.5 px-4">
                            {cust.rewardsEarned > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                🏆 {cust.rewardsEarned}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Visits count */}
                          <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                            {cust.visitsCount}
                          </td>

                          {/* Last visit */}
                          <td className="py-3.5 px-4 text-[11px] text-slate-500">
                            {formatDate(cust.lastStampAt)}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            {isReady ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 animate-pulse">
                                Cadeau Prêt 🎁
                              </span>
                            ) : cust.status === 'almost_reward' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                Presque là ⚡
                              </span>
                            ) : cust.status === 'new' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                Nouveau
                              </span>
                            ) : cust.status === 'inactive' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                Inactif
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                                Actif
                              </span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleExecuteCustomerAction('ADD_STAMP', cust.phone)}
                                className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 text-[11px] font-bold transition-all cursor-pointer"
                                title="Ajouter 1 tampon"
                              >
                                +1 ⭐
                              </button>

                              {isReady && (
                                <button
                                  onClick={() => handleExecuteCustomerAction('REDEEM_REWARD', cust.phone)}
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[11px] font-bold transition-all cursor-pointer"
                                  title="Valider la récompense"
                                >
                                  🎁 Valider
                                </button>
                              )}

                              <a
                                href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  `Bonjour ${cust.customerName || ''}, merci pour votre fidélité chez ${settings.storeName} !`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[11px] font-bold transition-all cursor-pointer"
                                title="Écrire sur WhatsApp"
                              >
                                💬
                              </a>

                              <button
                                onClick={() => handleOpenCustomer(cust)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-all cursor-pointer"
                                title="Détails du client"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. TAB: FLUX D'ACTIVITÉ (ACTIVITY STREAM)                   */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Journal des Activités de Caisse</h3>
                <p className="text-xs text-slate-500">Chaque passage, tampon attribué ou cadeau offert est archivé ici avec horodatage</p>
              </div>
              <button
                onClick={() => fetchData(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Actualiser</span>
              </button>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <Clock className="w-12 h-12 mx-auto text-slate-300" />
                <h4 className="text-sm font-bold text-slate-600">Aucune activité enregistrée</h4>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {recentActivity.map(act => {
                  const isReward = act.action === 'REWARD_REDEEMED';
                  const isReset = act.action === 'RESET';
                  return (
                    <div key={act.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-850/50 px-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold ${
                            isReward
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60'
                              : isReset
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-950/60'
                          }`}
                        >
                          {isReward ? '🎁' : isReset ? '🔄' : '⭐'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {act.customerName || 'Client VIP'}
                            </span>
                            <span className="font-mono text-xs text-slate-500 font-semibold">{act.phone}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {formatDate(act.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
                            isReward
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : isReset
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                          }`}
                        >
                          {isReward
                            ? 'Récompense Validée 🏆'
                            : isReset
                            ? 'Remise à zéro'
                            : `+1 Tampon (${act.stampsCount}/${targetStamps})`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 4. TAB: ANALYTICS & AFFLUENCE (STATS & PEAK HOURS)         */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taux de Fidélisation</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-purple-600">{analytics.returningRatio}%</span>
                <span className="text-xs text-slate-500 font-medium">clients reviennent au moins 2 fois</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${analytics.returningRatio}%` }}
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Moyenne de Passages</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-600">
                  {stats.totalCustomers > 0 ? (stats.totalVisits / stats.totalCustomers).toFixed(1) : '0'}
                </span>
                <span className="text-xs text-slate-500 font-medium">visites par client inscrit</span>
              </div>
              <p className="text-[11px] text-slate-400">Indicateur direct de rétention clientèle</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taux de Complétion Cadeau</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-600">
                  {stats.totalCustomers > 0
                    ? Math.round((stats.rewardsRedeemed / stats.totalCustomers) * 100)
                    : 0}%
                </span>
                <span className="text-xs text-slate-500 font-medium">de conversion en cadeau</span>
              </div>
              <p className="text-[11px] text-slate-400">Total cadeaux : {stats.rewardsRedeemed} validés</p>
            </div>
          </div>

          {/* 14-Day Activity Bar Chart */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Passages & Tampons des 14 Derniers Jours</h3>
                <p className="text-xs text-slate-500">Évolution quotidienne de l'activité fidélité en caisse</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-600" />
                  <span>Tampons</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-indigo-300" />
                  <span>Passages</span>
                </div>
              </div>
            </div>

            {/* Visual CSS Chart */}
            <div className="pt-4 h-48 flex items-end gap-2 sm:gap-4 justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              {analytics.dailyActivity.map((day, idx) => {
                const maxVal = Math.max(1, ...analytics.dailyActivity.map(d => Math.max(d.stamps, d.visits)));
                const stampHeight = Math.round((day.stamps / maxVal) * 140);
                const visitHeight = Math.round((day.visits / maxVal) * 140);
                const dayLabel = day.date.slice(5); // MM-DD

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg">
                      {day.date} : {day.stamps} tampons, {day.visits} visites
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      <div
                        className="w-1/2 bg-purple-600 rounded-t-md transition-all group-hover:brightness-125"
                        style={{ height: `${Math.max(4, stampHeight)}px` }}
                      />
                      <div
                        className="w-1/2 bg-indigo-300 dark:bg-indigo-900/60 rounded-t-md transition-all group-hover:brightness-125"
                        style={{ height: `${Math.max(4, visitHeight)}px` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Peak Hours (Affluence par heure de la journée) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>Heures d'Affluence (Pic d'activité en caisse)</span>
                </h3>
                <p className="text-xs text-slate-500">Identifiez les créneaux horaires où votre établissement est le plus fréquenté</p>
              </div>
            </div>

            <div className="pt-2 h-44 flex items-end gap-1 sm:gap-2 justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              {analytics.hourlyDistribution.slice(8, 23).map((count, i) => {
                const hour = i + 8; // 8h to 22h
                const maxHour = Math.max(1, ...analytics.hourlyDistribution);
                const height = Math.round((count / maxHour) * 120);
                const isPeak = count === maxHour && count > 0;

                return (
                  <div key={hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-1.5 rounded pointer-events-none whitespace-nowrap z-20">
                      {hour}h00 : {count} passage{count > 1 ? 's' : ''}
                    </div>

                    <div
                      className={`w-full rounded-t-md transition-all ${
                        isPeak
                          ? 'bg-amber-400 shadow-md shadow-amber-400/30'
                          : 'bg-purple-500/70 hover:bg-purple-600'
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
            <p className="text-[11px] text-slate-400 text-center">
              Plage analysée : de 08:00 à 22:00. La colonne dorée indique l'heure de pointe principale.
            </p>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 5. TAB: RÉCOMPENSES & PALIERS (REWARDS CONFIG & REDEEM)     */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          {/* Active Reward Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 to-indigo-950 text-white border border-purple-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 inline-flex items-center gap-1">
                <Gift className="w-3.5 h-3.5" />
                <span>Palier Actuel de Fidélité</span>
              </span>
              <h2 className="text-2xl font-black tracking-tight">{settings.rewardText}</h2>
              <p className="text-xs text-purple-200">
                Débloqué dès que le client cumule <span className="font-black text-white">{targetStamps} tampons</span>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-1 min-w-44">
              <span className="text-[10px] uppercase font-bold text-purple-200">Total Récompenses Offertes</span>
              <p className="text-3xl font-black text-amber-400">{stats.rewardsRedeemed}</p>
              <span className="text-[10px] text-purple-200 font-medium">cadeaux remis en main propre</span>
            </div>
          </div>

          {/* Customers waiting for reward */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Gift className="w-4 h-4 text-emerald-600" />
                  <span>Clients Éligibles à leur Récompense ({segments.reward_ready})</span>
                </h3>
                <p className="text-xs text-slate-500">Ces clients ont complété leur carte et peuvent récupérer leur cadeau en magasin</p>
              </div>
            </div>

            {segments.reward_ready === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Gift className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-500">Aucun client n'a de récompense en attente actuellement.</p>
                <p className="text-[11px] text-slate-400">Vos clients cumulent actuellement leurs tampons !</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.customers
                  .filter(c => c.isRewardReady)
                  .map(cust => (
                    <div
                      key={cust.id}
                      className="p-4 rounded-2xl border-2 border-emerald-400/50 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {cust.customerName || 'Client VIP'}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-500">{cust.phone}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                          {cust.stampsCount} / {targetStamps} tampons
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          Visites : {cust.visitsCount}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleExecuteCustomerAction('REDEEM_REWARD', cust.phone)}
                          disabled={customerActionLoading}
                          className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>Valider</span>
                        </button>
                        <a
                          href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Bonjour ${cust.customerName || ''} ! Votre cadeau chez ${settings.storeName} est prêt ! Venez en profiter 🎁`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 6. TAB: MARKETING & RELANCES (SEGMENTATION & MESSAGING)     */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Segment Selector */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span>1. Choisir l'Audience Cible</span>
              </h3>
              <p className="text-xs text-slate-500">Sélectionnez le groupe de clients à contacter</p>
            </div>

            <div className="space-y-2">
              {[
                { id: 'reward_ready', label: 'Cadeau Disponible 🎁', count: segments.reward_ready },
                { id: 'almost_reward', label: 'Presque Prêt (≥ 70%) ⚡', count: segments.almost_reward },
                { id: 'new', label: 'Nouveaux Inscrits (< 7j)', count: segments.new },
                { id: 'loyal', label: 'Clients VIP Récurrents 👑', count: segments.loyal },
                { id: 'inactive', label: 'Clients Inactifs (> 30j)', count: segments.inactive },
                { id: 'all', label: 'Tous les Clients Inscrits', count: segments.all },
              ].map(seg => {
                const isSelected = selectedMessageSegment === seg.id;
                return (
                  <button
                    key={seg.id}
                    onClick={() => setSelectedMessageSegment(seg.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-100 ring-2 ring-purple-600/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold">{seg.label}</span>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      {seg.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Export audience numbers */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={handleCopyAudiencePhones}
                disabled={audienceForMessage.length === 0}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {copiedPhones ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPhones ? 'Numéros copiés !' : `Copier les ${audienceForMessage.length} numéros`}</span>
              </button>
              <p className="text-[10px] text-slate-400 text-center">
                Utile pour WhatsApp Business broadcast ou campagnes SMS
              </p>
            </div>
          </div>

          {/* Right: Message Composer & Quick Templates */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <span>2. Rédiger le Message Promotionnel</span>
              </h3>
              <p className="text-xs text-slate-500">
                Audience ciblée : <strong className="text-purple-600">{audienceForMessage.length} clients</strong>
              </p>
            </div>

            {/* Pre-made template buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Modèles Recommandés</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {messageTemplates.map(tmpl => (
                  <button
                    key={tmpl.id}
                    onClick={() => setCustomMessage(tmpl.text)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 bg-slate-50/50 dark:bg-slate-850/50 text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600 transition-all cursor-pointer"
                  >
                    <span>{tmpl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500">Texte du Message</label>
              <textarea
                rows={4}
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                placeholder="Rédigez votre offre spéciale, invitation ou rappel de cadeau..."
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-purple-600 shadow-inner"
              />
            </div>

            {/* Live Message Preview */}
            {customMessage && (
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1">
                  <span>📱 Aperçu SMS / WhatsApp</span>
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {customMessage}
                </p>
              </div>
            )}

            {/* Actions: Send via SMS / WhatsApp link */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={
                  audienceForMessage.length > 0
                    ? `sms:${audienceForMessage.map(c => c.phone).join(',')}?body=${encodeURIComponent(customMessage)}`
                    : '#'
                }
                className={`flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                  audienceForMessage.length === 0 || !customMessage ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Ouvrir l'application SMS</span>
              </a>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(customMessage);
                  showToast('Message copié dans le presse-papiers !');
                }}
                disabled={!customMessage}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <Copy className="w-4 h-4" />
                <span>Copier le texte</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 7. TAB: PARAMÈTRES & QR CODE (SETTINGS & QR DOWNLOAD)       */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Form */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-600" />
                <span>Configuration du Programme de Fidélité</span>
              </h3>
              <p className="text-xs text-slate-500">Personnalisez votre palier, votre cadeau et votre code secret de caisse</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Nom de l'Établissement</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.storeName}
                    onChange={e => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Titre de la Carte</label>
                  <input
                    type="text"
                    value={settingsForm.cardTitle}
                    onChange={e => setSettingsForm({ ...settingsForm, cardTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Description du Cadeau / Récompense</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Café ou Thé gourmand offert, 10% sur l'addition..."
                  value={settingsForm.rewardText}
                  onChange={e => setSettingsForm({ ...settingsForm, rewardText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Nombre de Tampons</label>
                  <select
                    value={settingsForm.targetStamps}
                    onChange={e => setSettingsForm({ ...settingsForm, targetStamps: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-purple-600 cursor-pointer"
                  >
                    {[5, 6, 8, 10, 12, 15, 20].map(n => (
                      <option key={n} value={n}>
                        {n} Tampons
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Code PIN Caisse (4 chiffres)</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={settingsForm.merchantPin}
                    onChange={e => setSettingsForm({ ...settingsForm, merchantPin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-black tracking-widest outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Délai Anti-Fraude (Cooldown)</label>
                  <select
                    value={settingsForm.cooldownMinutes}
                    onChange={e => setSettingsForm({ ...settingsForm, cooldownMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:border-purple-600 cursor-pointer"
                  >
                    <option value={0}>Désactivé (0 min)</option>
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 heure</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Enregistrer les Modifications</span>
                </button>
              </div>
            </form>
          </div>

          {/* QR Code Caisse & Links */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">QR Code Présentoir Caisse</h3>
              <p className="text-xs text-slate-500">Imprimez ce QR Code pour que vos clients le scannent au comptoir</p>
            </div>

            {/* QR Image */}
            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-2xl border-2 border-purple-200 inline-block shadow-md">
                <img src={qrDataUrl} alt="QR Code Fidélité" className="w-48 h-48 mx-auto" />
              </div>
            ) : (
              <div className="w-48 h-48 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-slate-400" />
              </div>
            )}

            <div className="space-y-2">
              <a
                href={qrDataUrl}
                download={`qr-fidelite-${business.slug}.png`}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger le QR Code (PNG)</span>
              </a>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(publicCardUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2500);
                }}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Lien copié !' : 'Copier le lien public'}</span>
              </button>
            </div>

            {/* In-store Cashier Standalone Mode */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-left space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Mode Caisse Dédié (Tablette)
              </span>
              <p className="text-[11px] text-slate-500">
                Lien sans mot de passe SaaS, accessible uniquement avec le code PIN en caisse :
              </p>
              <a
                href={cashierPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono font-bold text-purple-600 hover:underline flex items-center gap-1 break-all"
              >
                <span>/c/{business.slug}/merchant</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL: CUSTOMER DETAIL DRAWER                               */}
      {/* ──────────────────────────────────────────────────────────── */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Customer Header */}
            <div className="flex items-center gap-3.5 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md">
                {(selectedCustomer.customerName || 'V')[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{selectedCustomer.customerName || 'Client VIP'}</span>
                  {selectedCustomer.isRewardReady && <span className="text-sm">🎁</span>}
                </h3>
                <span className="text-xs font-mono font-bold text-slate-500">{selectedCustomer.phone}</span>
              </div>
            </div>

            {/* Progress & Stats Cards */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40">
                <span className="text-[10px] uppercase font-bold text-purple-600">Tampons</span>
                <p className="text-xl font-black text-purple-950 dark:text-purple-100">
                  {selectedCustomer.stampsCount} / {targetStamps}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
                <span className="text-[10px] uppercase font-bold text-amber-600">Cadeaux</span>
                <p className="text-xl font-black text-amber-950 dark:text-amber-100">
                  {selectedCustomer.rewardsEarned}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
                <span className="text-[10px] uppercase font-bold text-indigo-600">Visites</span>
                <p className="text-xl font-black text-indigo-950 dark:text-indigo-100">
                  {selectedCustomer.visitsCount || 1}
                </p>
              </div>
            </div>

            {/* Quick Actions for this customer */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions Directes en Caisse</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExecuteCustomerAction('ADD_STAMP', selectedCustomer.phone)}
                  disabled={customerActionLoading}
                  className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+1 Tampon</span>
                </button>

                {selectedCustomer.isRewardReady ? (
                  <button
                    onClick={() => handleExecuteCustomerAction('REDEEM_REWARD', selectedCustomer.phone)}
                    disabled={customerActionLoading}
                    className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 animate-pulse"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Valider Cadeau 🎉</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const ans = confirm('Réinitialiser le compteur de ce client ?');
                      if (ans) handleExecuteCustomerAction('RESET', selectedCustomer.phone, 0);
                    }}
                    disabled={customerActionLoading}
                    className="py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Remise à 0</span>
                  </button>
                )}
              </div>

              {/* Direct WhatsApp button */}
              <a
                href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Bonjour ${selectedCustomer.customerName || ''}, nous vous remercions pour votre fidélité chez ${settings.storeName} !`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>💬 Envoyer un message WhatsApp</span>
              </a>
            </div>

            {/* Visit & Stamp History Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Historique des Passages</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400">{customerLogs.length} événements</span>
              </div>

              {loadingLogs ? (
                <div className="py-6 text-center text-xs text-slate-400">Chargement de l'historique...</div>
              ) : customerLogs.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">Aucun historique disponible</div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {customerLogs.map((log: any) => {
                    const isReward = log.action === 'REWARD_REDEEMED';
                    return (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span>{isReward ? '🎁' : '⭐'}</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {isReward ? 'Récompense remise' : `Tampon attribué (${log.stampsCount}/${targetStamps})`}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{formatDate(log.createdAt)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MODAL: QUICK ACTION (STAMP OR REDEEM)                       */}
      {/* ──────────────────────────────────────────────────────────── */}
      {showQuickModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowQuickModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <div
                className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-xl font-bold ${
                  quickActionType === 'ADD_STAMP' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {quickActionType === 'ADD_STAMP' ? '⭐' : '🎁'}
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {quickActionType === 'ADD_STAMP' ? 'Ajouter 1 Tampon' : 'Valider une Récompense'}
              </h3>
              <p className="text-xs text-slate-500">
                Saisissez le numéro de téléphone du client
              </p>
            </div>

            <form onSubmit={handleQuickActionSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500">Téléphone du Client</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type="tel"
                    required
                    autoFocus
                    placeholder="0612345678"
                    value={quickPhoneInput}
                    onChange={e => setQuickPhoneInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-purple-200 bg-purple-50/20 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-purple-600 focus:bg-white"
                  />
                </div>
              </div>

              {quickActionType === 'ADD_STAMP' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Nom du Client (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: Yassine"
                    value={quickNameInput}
                    onChange={e => setQuickNameInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-purple-600"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={quickActionLoading || !quickPhoneInput.trim()}
                className={`w-full py-2.5 rounded-xl text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  quickActionType === 'ADD_STAMP'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                } disabled:opacity-50`}
              >
                {quickActionLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>{quickActionType === 'ADD_STAMP' ? 'Valider le Tampon (+1)' : 'Valider la Récompense 🎉'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
