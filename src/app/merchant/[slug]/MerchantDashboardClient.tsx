'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Crown, LogOut, Users, BarChart2, MessageSquare, Settings,
  Search, Filter, Phone, Star, Gift, Clock, TrendingUp,
  ChevronRight, X, Plus, RefreshCw, Check, Copy, Download,
  Bell, Home, Activity, AlertTriangle, Zap, Tag, Send,
  ChevronDown, ArrowUp, ArrowDown, Minus, User, Hash,
  ShoppingBag, Award, Target, Flame, ZapOff, MoreVertical,
  QrCode, Eye, EyeOff, CheckCircle2, XCircle, Info
} from 'lucide-react';
import QRCode from 'qrcode';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Customer {
  id: string;
  phone: string;
  customerName: string | null;
  stampsCount: number;
  rewardsEarned: number;
  lastStampAt: string | null;
  createdAt: string;
  isNew: boolean;
  isActive: boolean;
  isInactive: boolean;
  isLoyal: boolean;
  isRewardReady: boolean;
  isAlmostReward: boolean;
}

interface ActivityLog {
  id: string;
  phone: string;
  action: string;
  stampsCount: number;
  createdAt: string;
}

interface DayData {
  label: string;
  stamps: number;
  rewards: number;
}

interface DashboardData {
  profile: {
    id: string;
    slug: string;
    name: string;
    company: string | null;
    photoUrl: string | null;
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
    newCustomers: number;
    inactiveCustomers: number;
    loyalCustomers: number;
    rewardReadyCustomers: number;
    almostRewardCustomers: number;
    stampsThisMonth: number;
    rewardsThisMonth: number;
    newThisMonth: number;
    totalStamps: number;
    totalRewards: number;
  };
  customers: Customer[];
  activity: ActivityLog[];
  weeklyData: DayData[];
}

type Tab = 'home' | 'customers' | 'activity' | 'messages' | 'settings';
type CustomerFilter = 'all' | 'new' | 'active' | 'inactive' | 'loyal' | 'reward_ready' | 'almost_reward';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'à l\'instant';
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `il y a ${days}j`;
  return `il y a ${Math.floor(days / 30)} mois`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  return phone.slice(0, -4).replace(/\d/g, '•') + phone.slice(-4);
}

// ─── STAMP PROGRESS BAR ───────────────────────────────────────────────────────

function StampBar({ count, total }: { count: number; total: number }) {
  const pct = Math.min(100, Math.round((count / total) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-purple-900/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-purple-300 font-mono w-10 text-right">{count}/{total}</span>
    </div>
  );
}

// ─── WEEKLY CHART ─────────────────────────────────────────────────────────────

function WeeklyChart({ data }: { data: DayData[] }) {
  const maxStamps = Math.max(...data.map(d => d.stamps), 1);
  return (
    <div className="flex items-end justify-between gap-2 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="relative w-full flex items-end justify-center" style={{ height: '72px' }}>
            <div
              className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg opacity-80 transition-all duration-500"
              style={{ height: `${Math.max(4, (d.stamps / maxStamps) * 72)}px` }}
            />
            {d.rewards > 0 && (
              <div
                className="absolute bottom-0 w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg opacity-90"
                style={{ height: `${Math.max(4, (d.rewards / maxStamps) * 24)}px` }}
              />
            )}
          </div>
          <span className="text-xs text-purple-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color = 'purple' }: {
  icon: any; label: string; value: string | number; sub?: string; color?: string;
}) {
  const colors: Record<string, string> = {
    purple: 'bg-purple-900/40 border-purple-700/40 text-purple-300',
    amber: 'bg-amber-900/30 border-amber-700/30 text-amber-400',
    green: 'bg-green-900/30 border-green-700/30 text-green-400',
    red: 'bg-red-900/30 border-red-700/30 text-red-400',
    blue: 'bg-blue-900/30 border-blue-700/30 text-blue-400',
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[color] || colors.purple}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs mt-1 opacity-70">{sub}</div>}
    </div>
  );
}

// ─── SEGMENT BADGE ────────────────────────────────────────────────────────────

function SegmentBadge({ customer }: { customer: Customer }) {
  if (customer.isRewardReady) return (
    <span className="inline-flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5">
      <Gift size={10} /> Récompense prête
    </span>
  );
  if (customer.isNew) return (
    <span className="inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-2 py-0.5">
      <Zap size={10} /> Nouveau
    </span>
  );
  if (customer.isLoyal) return (
    <span className="inline-flex items-center gap-1 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-2 py-0.5">
      <Crown size={10} /> Fidèle
    </span>
  );
  if (customer.isAlmostReward) return (
    <span className="inline-flex items-center gap-1 text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full px-2 py-0.5">
      <Target size={10} /> Presque
    </span>
  );
  if (customer.isInactive) return (
    <span className="inline-flex items-center gap-1 text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full px-2 py-0.5">
      <ZapOff size={10} /> Inactif
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full px-2 py-0.5">
      <Activity size={10} /> Actif
    </span>
  );
}

// ─── CUSTOMER DRAWER ──────────────────────────────────────────────────────────

function CustomerDrawer({
  customer, profileId, targetStamps, onClose, onRefresh
}: {
  customer: Customer;
  profileId: string;
  targetStamps: number;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [showPinConfirm, setShowPinConfirm] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch(`/api/profiles/${profileId}/loyalty/merchant/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'GET_HISTORY', phone: customer.phone }),
    })
      .then(r => r.json())
      .then(j => setLogs(j.logs || []))
      .catch(console.error);
  }, [customer.phone, profileId]);

  const doAction = async (action: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/loyalty/merchant/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, phone: customer.phone }),
      });
      const json = await res.json();
      if (res.ok) {
        showToast(json.message || 'Action effectuée');
        onRefresh();
        onClose();
      } else {
        showToast(json.error || 'Erreur');
      }
    } catch {
      showToast('Erreur de connexion');
    } finally {
      setLoading(false);
      setShowPinConfirm(null);
    }
  };

  const pct = Math.min(100, Math.round((customer.stampsCount / targetStamps) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-gradient-to-br from-purple-950 to-indigo-950 border border-purple-700/40 sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        
        {toast && (
          <div className="absolute top-4 left-4 right-4 bg-green-500/20 border border-green-500/40 text-green-300 rounded-xl px-4 py-2 text-sm text-center z-10">
            {toast}
          </div>
        )}

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-800/50 flex items-center justify-center">
              <User size={22} className="text-purple-300" />
            </div>
            <div>
              <div className="text-white font-bold">
                {customer.customerName || 'Client sans nom'}
              </div>
              <div className="text-purple-400 text-sm font-mono">{maskPhone(customer.phone)}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Segment badge */}
        <div className="mb-4">
          <SegmentBadge customer={customer} />
        </div>

        {/* Stamp progress */}
        <div className="bg-purple-900/30 rounded-2xl border border-purple-700/30 p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-purple-300 text-sm font-medium">Progression</span>
            <span className="text-white font-bold">{customer.stampsCount}/{targetStamps} tampons</span>
          </div>
          <div className="h-2.5 bg-purple-900/60 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-amber-500 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-purple-400">
            <span>{customer.rewardsEarned} récompense(s) gagnée(s)</span>
            <span>{pct}%</span>
          </div>
        </div>

        {/* Info row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-purple-900/20 rounded-xl p-3 text-center">
            <div className="text-xs text-purple-400 mb-1">Dernier tampon</div>
            <div className="text-white text-sm font-medium">
              {customer.lastStampAt ? timeAgo(customer.lastStampAt) : 'Jamais'}
            </div>
          </div>
          <div className="bg-purple-900/20 rounded-xl p-3 text-center">
            <div className="text-xs text-purple-400 mb-1">Client depuis</div>
            <div className="text-white text-sm font-medium">{formatDate(customer.createdAt)}</div>
          </div>
        </div>

        {/* Action buttons */}
        {!showPinConfirm ? (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => doAction('ADD_STAMP')}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-2.5 text-sm font-medium transition-colors flex flex-col items-center gap-1 disabled:opacity-50"
            >
              <Plus size={16} />
              Tampon
            </button>
            <button
              onClick={() => setShowPinConfirm('REDEEM_REWARD')}
              disabled={loading || customer.stampsCount < targetStamps}
              className="bg-amber-600 hover:bg-amber-500 text-white rounded-xl py-2.5 text-sm font-medium transition-colors flex flex-col items-center gap-1 disabled:opacity-50"
            >
              <Gift size={16} />
              Récompense
            </button>
            <button
              onClick={() => setShowPinConfirm('RESET')}
              disabled={loading}
              className="bg-red-900/60 hover:bg-red-800/60 text-red-300 rounded-xl py-2.5 text-sm font-medium transition-colors flex flex-col items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Reset
            </button>
          </div>
        ) : (
          <div className="bg-red-900/20 border border-red-700/30 rounded-2xl p-4 mb-4">
            <p className="text-red-300 text-sm mb-3 text-center">
              {showPinConfirm === 'RESET' ? '⚠️ Confirmer la réinitialisation de ce client ?' : '🎁 Valider la récompense ?'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPinConfirm(null)}
                className="flex-1 bg-white/10 text-white rounded-xl py-2 text-sm transition-colors hover:bg-white/20"
              >
                Annuler
              </button>
              <button
                onClick={() => doAction(showPinConfirm)}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl py-2 text-sm font-semibold transition-colors"
              >
                {loading ? '...' : 'Confirmer'}
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {logs.length > 0 && (
          <div>
            <h4 className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">Historique récent</h4>
            <div className="space-y-2">
              {logs.slice(0, 8).map((log, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {log.action === 'STAMP_ADDED' && <Star size={13} className="text-purple-400" />}
                    {log.action === 'REWARD_REDEEMED' && <Gift size={13} className="text-amber-400" />}
                    {log.action === 'RESET' && <RefreshCw size={13} className="text-gray-400" />}
                    <span className="text-gray-300">
                      {log.action === 'STAMP_ADDED' ? `+1 tampon (total: ${log.stampsCount})` :
                       log.action === 'REWARD_REDEEMED' ? 'Récompense utilisée' :
                       'Réinitialisation'}
                    </span>
                  </div>
                  <span className="text-purple-500 text-xs">{timeAgo(log.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MESSAGES TAB ─────────────────────────────────────────────────────────────

function MessagesTab({ data, profileId }: { data: DashboardData; profileId: string }) {
  const [selectedSegment, setSelectedSegment] = useState('reward_ready');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('whatsapp');
  const [copiedPhones, setCopiedPhones] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedCampaign, setSavedCampaign] = useState(false);

  const segments = [
    { id: 'all', label: 'Tous les clients', count: data.stats.totalCustomers, icon: Users },
    { id: 'reward_ready', label: 'Récompense prête', count: data.stats.rewardReadyCustomers, icon: Gift },
    { id: 'almost_reward', label: 'Presque (≥70%)', count: data.stats.almostRewardCustomers, icon: Target },
    { id: 'new', label: 'Nouveaux (7j)', count: data.stats.newCustomers, icon: Zap },
    { id: 'active', label: 'Actifs (30j)', count: data.stats.activeCustomers, icon: Activity },
    { id: 'inactive', label: 'Inactifs', count: data.stats.inactiveCustomers, icon: ZapOff },
    { id: 'loyal', label: 'Fidèles (2+ récompenses)', count: data.stats.loyalCustomers, icon: Crown },
  ];

  const selectedSeg = segments.find(s => s.id === selectedSegment)!;
  
  const filteredCustomers = useMemo(() => {
    switch (selectedSegment) {
      case 'new': return data.customers.filter(c => c.isNew);
      case 'active': return data.customers.filter(c => c.isActive);
      case 'inactive': return data.customers.filter(c => c.isInactive);
      case 'loyal': return data.customers.filter(c => c.isLoyal);
      case 'reward_ready': return data.customers.filter(c => c.isRewardReady);
      case 'almost_reward': return data.customers.filter(c => c.isAlmostReward);
      default: return data.customers;
    }
  }, [selectedSegment, data.customers]);

  const defaultMessages: Record<string, string> = {
    reward_ready: `🎁 Félicitations ! Votre récompense vous attend chez ${data.settings.storeName}. Passez nous voir pour la récupérer !`,
    almost_reward: `⭐ Vous êtes presque arrivé(e) ! Il ne vous manque que quelques tampons pour votre récompense chez ${data.settings.storeName}.`,
    new: `👋 Bienvenue chez ${data.settings.storeName} ! Merci de votre première visite. On vous attend bientôt !`,
    inactive: `😊 ${data.settings.storeName} vous attend ! Cela fait un moment. Revenez profiter de votre programme fidélité.`,
    active: `💜 Merci pour votre fidélité chez ${data.settings.storeName} ! Continuez comme ça !`,
    loyal: `👑 Merci d'être un client VIP de ${data.settings.storeName} ! Vous êtes parmi nos meilleurs clients.`,
    all: `💜 Un message de ${data.settings.storeName} ! Merci pour votre confiance.`,
  };

  const allPhones = filteredCustomers.map(c => c.phone).join('\n');

  const handleCopyPhones = () => {
    navigator.clipboard.writeText(allPhones).then(() => {
      setCopiedPhones(true);
      setTimeout(() => setCopiedPhones(false), 2500);
    });
  };

  const handleSaveCampaign = async () => {
    if (!campaignName.trim() || !message.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/merchant/${profileId}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName,
          segment: selectedSegment,
          message,
          channel,
        }),
      });
      if (res.ok) {
        setSavedCampaign(true);
        setTimeout(() => setSavedCampaign(false), 3000);
        setCampaignName('');
      }
    } catch {}
    finally { setSaving(false); }
  };

  const whatsappUrl = filteredCustomers.length === 1
    ? `https://wa.me/${filteredCustomers[0].phone.replace(/\D/g, '')}?text=${encodeURIComponent(message || defaultMessages[selectedSegment])}`
    : `https://wa.me/?text=${encodeURIComponent(message || defaultMessages[selectedSegment])}`;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-white font-bold text-lg mb-1">Campagnes & Messages</h2>
        <p className="text-purple-400 text-sm">Ciblez vos clients par segment et envoyez des messages personnalisés.</p>
      </div>

      {/* Segment selector */}
      <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
        <h3 className="text-purple-300 text-sm font-semibold mb-3">1. Choisir le segment</h3>
        <div className="grid grid-cols-2 gap-2">
          {segments.map(seg => {
            const Icon = seg.icon;
            return (
              <button
                key={seg.id}
                onClick={() => setSelectedSegment(seg.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                  selectedSegment === seg.id
                    ? 'bg-purple-600/30 border-purple-500 text-white'
                    : 'bg-purple-900/30 border-purple-800/40 text-purple-300 hover:border-purple-600'
                }`}
              >
                <Icon size={14} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{seg.label}</div>
                  <div className="text-xs opacity-70">{seg.count} clients</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Message composer */}
      <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
        <h3 className="text-purple-300 text-sm font-semibold mb-3">
          2. Composer le message ({filteredCustomers.length} destinataires)
        </h3>
        
        {/* Channel */}
        <div className="flex gap-2 mb-3">
          {['whatsapp', 'sms'].map(ch => (
            <button
              key={ch}
              onClick={() => setChannel(ch)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                channel === ch
                  ? 'bg-green-700/40 border-green-600 text-green-300'
                  : 'bg-purple-900/30 border-purple-800/40 text-purple-400 hover:border-purple-600'
              }`}
            >
              {ch === 'whatsapp' ? '💬 WhatsApp' : '📱 SMS'}
            </button>
          ))}
        </div>

        <textarea
          value={message || defaultMessages[selectedSegment]}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          className="w-full bg-purple-900/30 border border-purple-700/40 text-white placeholder-purple-500 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:border-purple-500 transition-colors"
          placeholder="Votre message personnalisé..."
        />

        {/* Campaign name */}
        <input
          type="text"
          value={campaignName}
          onChange={e => setCampaignName(e.target.value)}
          className="w-full mt-3 bg-purple-900/30 border border-purple-700/40 text-white placeholder-purple-500 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors"
          placeholder="Nom de la campagne (optionnel)"
        />
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        {/* Copy phones */}
        <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
          <h3 className="text-purple-300 text-sm font-semibold mb-3">3. Actions disponibles</h3>
          
          <div className="space-y-2">
            <button
              onClick={handleCopyPhones}
              className="w-full flex items-center justify-between bg-purple-700/30 hover:bg-purple-700/50 border border-purple-600/30 text-white rounded-xl px-4 py-3 transition-all"
            >
              <div className="flex items-center gap-2">
                <Copy size={16} className="text-purple-400" />
                <div className="text-left">
                  <div className="text-sm font-medium">Copier les numéros</div>
                  <div className="text-xs text-purple-400">{filteredCustomers.length} numéros pour WhatsApp, Excel...</div>
                </div>
              </div>
              {copiedPhones ? <Check size={16} className="text-green-400" /> : <ChevronRight size={16} className="text-purple-400" />}
            </button>

            {channel === 'whatsapp' && filteredCustomers.length === 1 && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between bg-green-700/30 hover:bg-green-700/50 border border-green-600/30 text-white rounded-xl px-4 py-3 transition-all"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-green-400" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Ouvrir WhatsApp</div>
                    <div className="text-xs text-green-400">Envoyer directement à ce client</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-green-400" />
              </a>
            )}

            {campaignName.trim() && (
              <button
                onClick={handleSaveCampaign}
                disabled={saving}
                className="w-full flex items-center justify-between bg-amber-700/30 hover:bg-amber-700/50 border border-amber-600/30 text-white rounded-xl px-4 py-3 transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Send size={16} className="text-amber-400" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Enregistrer la campagne</div>
                    <div className="text-xs text-amber-400">Sauvegarder pour référence future</div>
                  </div>
                </div>
                {savedCampaign ? <Check size={16} className="text-green-400" /> : <ChevronRight size={16} className="text-amber-400" />}
              </button>
            )}
          </div>
        </div>

        {/* Info box */}
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-2xl p-4 flex gap-3">
          <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-300">
            <strong className="block mb-1">Comment envoyer des messages ?</strong>
            Copiez les numéros et collez-les dans WhatsApp, ou utilisez une application d'envoi SMS groupé. 
            L'envoi automatique nécessite une intégration WhatsApp Business (disponible prochainement).
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────

function SettingsTab({ data, profileId, onRefresh }: {
  data: DashboardData; profileId: string; onRefresh: () => void;
}) {
  const [form, setForm] = useState({ ...data.settings });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/c/${data.profile.slug}` : '';

  useEffect(() => {
    if (publicUrl) {
      QRCode.toDataURL(publicUrl, { width: 300, margin: 2, color: { dark: '#7C3AED', light: '#FFFFFF' } })
        .then(setQrUrl)
        .catch(console.error);
    }
  }, [publicUrl]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/loyalty/merchant`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: form }),
      });
      if (res.ok) {
        setSaved(true);
        onRefresh();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {}
    finally { setSaving(false); }
  };

  const handleLogout = async () => {
    await fetch('/api/merchant/auth', { method: 'DELETE' });
    // Also clear profile-specific cookie
    await fetch(`/api/profiles/${profileId}/loyalty/merchant/auth`, { method: 'DELETE' });
    window.location.href = `/merchant/login?store=${data.profile.slug}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-white font-bold text-lg mb-1">Paramètres</h2>
        <p className="text-purple-400 text-sm">Configurez votre programme de fidélité.</p>
      </div>

      {/* QR Code */}
      <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4 text-center">
        <h3 className="text-purple-300 text-sm font-semibold mb-3">QR Code de votre carte</h3>
        {qrUrl && (
          <div className="bg-white rounded-2xl p-4 inline-block mb-3">
            <img src={qrUrl} alt="QR Code" className="w-40 h-40" />
          </div>
        )}
        <p className="text-purple-400 text-xs mb-3">{publicUrl}</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => { navigator.clipboard.writeText(publicUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="flex items-center gap-2 bg-purple-700/40 hover:bg-purple-700/60 text-purple-300 border border-purple-600/30 rounded-xl px-4 py-2 text-sm transition-all"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? 'Copié !' : 'Copier le lien'}
          </button>
          {qrUrl && (
            <a
              href={qrUrl}
              download={`qr-${data.profile.slug}.png`}
              className="flex items-center gap-2 bg-purple-700/40 hover:bg-purple-700/60 text-purple-300 border border-purple-600/30 rounded-xl px-4 py-2 text-sm transition-all"
            >
              <Download size={14} />
              Télécharger
            </a>
          )}
        </div>
      </div>

      {/* Settings form */}
      <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
        <h3 className="text-purple-300 text-sm font-semibold mb-4">Programme de fidélité</h3>
        <div className="space-y-3">
          {[
            { key: 'storeName', label: 'Nom du magasin', type: 'text', placeholder: 'Mon magasin' },
            { key: 'cardTitle', label: 'Titre de la carte', type: 'text', placeholder: 'Carte Fidélité' },
            { key: 'rewardText', label: 'Récompense', type: 'text', placeholder: 'Café gratuit' },
            { key: 'targetStamps', label: 'Tampons requis', type: 'number', placeholder: '10' },
            { key: 'cooldownMinutes', label: 'Délai entre tampons (min)', type: 'number', placeholder: '5' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-purple-400 text-xs font-medium block mb-1.5">{field.label}</label>
              <input
                type={field.type}
                value={(form as any)[field.key] || ''}
                onChange={e => setForm(prev => ({ ...prev, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                placeholder={field.placeholder}
                className="w-full bg-purple-900/40 border border-purple-700/40 text-white placeholder-purple-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          ))}

          {/* PIN field */}
          <div>
            <label className="text-purple-400 text-xs font-medium block mb-1.5">Code PIN commerçant</label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={form.merchantPin}
                onChange={e => setForm(prev => ({ ...prev, merchantPin: e.target.value }))}
                className="w-full bg-purple-900/40 border border-purple-700/40 text-white placeholder-purple-600 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:border-purple-500 transition-colors"
                placeholder="1234"
              />
              <button
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm transition-all ${
            saved
              ? 'bg-green-600/40 border border-green-600 text-green-300'
              : 'bg-purple-600 hover:bg-purple-500 text-white'
          } disabled:opacity-50`}
        >
          {saving ? 'Sauvegarde...' : saved ? '✓ Sauvegardé !' : 'Enregistrer les paramètres'}
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 text-red-400 rounded-2xl py-3 text-sm font-medium transition-all"
      >
        <LogOut size={16} />
        Déconnexion
      </button>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

interface MerchantDashboardClientProps {
  profileId: string;
  slug: string;
  initialData: DashboardData;
}

export default function MerchantDashboardClient({
  profileId,
  slug,
  initialData,
}: MerchantDashboardClientProps) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [refreshing, setRefreshing] = useState(false);

  // Customer list state
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CustomerFilter>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Cashier mode state (home tab)
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(null), 3500);
  };

  const refresh = useCallback(async (silent = true) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/loyalty/merchant`);
      if (res.ok) {
        const json = await res.json();
        // Rebuild customer data with segments (server-computed in initial load, recompute here)
        const targetStamps = Number(json.settings?.targetStamps) || 10;
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const enriched = (json.customers || []).map((c: any) => ({
          ...c,
          isNew: new Date(c.createdAt) >= sevenDaysAgo,
          isActive: !!(c.lastStampAt && new Date(c.lastStampAt) >= thirtyDaysAgo),
          isInactive: !c.lastStampAt || new Date(c.lastStampAt) < thirtyDaysAgo,
          isLoyal: c.rewardsEarned >= 2,
          isRewardReady: c.stampsCount >= targetStamps,
          isAlmostReward: c.stampsCount >= Math.ceil(targetStamps * 0.7) && c.stampsCount < targetStamps,
        }));

        setData(prev => ({
          ...prev,
          ...json,
          customers: enriched,
        }));
      }
    } catch {}
    finally { setRefreshing(false); }
  }, [profileId]);

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
      if (res.ok) {
        showToast(json.message || (action === 'ADD_STAMP' ? '✓ Tampon ajouté !' : '🎁 Récompense validée !'));
        setPhoneInput('');
        setNameInput('');
        refresh(true);
      } else {
        showToast(json.error || 'Erreur', 'error');
      }
    } catch {
      showToast('Erreur de connexion', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    let list = data.customers;
    if (filter === 'new') list = list.filter(c => c.isNew);
    else if (filter === 'active') list = list.filter(c => c.isActive);
    else if (filter === 'inactive') list = list.filter(c => c.isInactive);
    else if (filter === 'loyal') list = list.filter(c => c.isLoyal);
    else if (filter === 'reward_ready') list = list.filter(c => c.isRewardReady);
    else if (filter === 'almost_reward') list = list.filter(c => c.isAlmostReward);

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(c =>
        c.phone.includes(s) || (c.customerName || '').toLowerCase().includes(s)
      );
    }
    return list;
  }, [data.customers, filter, search]);

  // ─── TABS ──────────────────────────────────────────────────────────────────

  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: 'home', icon: Home, label: 'Caisse' },
    { id: 'customers', icon: Users, label: 'Clients' },
    { id: 'activity', icon: Activity, label: 'Activité' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'settings', icon: Settings, label: 'Réglages' },
  ];

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-[#1a0933] to-indigo-950 text-white">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-medium shadow-xl transition-all ${
          toastType === 'error'
            ? 'bg-red-500/90 text-white border border-red-400/50'
            : 'bg-green-500/90 text-white border border-green-400/50'
        }`}>
          {toast}
        </div>
      )}

      {/* Customer Drawer */}
      {selectedCustomer && (
        <CustomerDrawer
          customer={selectedCustomer}
          profileId={profileId}
          targetStamps={data.settings.targetStamps}
          onClose={() => setSelectedCustomer(null)}
          onRefresh={() => refresh(true)}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-purple-950/90 backdrop-blur-xl border-b border-purple-800/30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data.profile.photoUrl ? (
              <img src={data.profile.photoUrl} alt="" className="w-9 h-9 rounded-xl object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-sm">
                {(data.settings.storeName || '?')[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-white font-bold text-sm leading-tight">{data.settings.storeName}</div>
              <div className="text-purple-400 text-xs">Tableau de bord commerçant</div>
            </div>
          </div>
          <button
            onClick={() => refresh(false)}
            disabled={refreshing}
            className="p-2 rounded-xl text-purple-400 hover:text-white hover:bg-purple-800/40 transition-colors"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pb-24 pt-4">

        {/* ── HOME TAB ─────────────────────────────────────────────────────── */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={Users} label="Clients" value={data.stats.totalCustomers} color="purple" />
              <StatCard icon={Star} label="Tampons/mois" value={data.stats.stampsThisMonth} color="blue" />
              <StatCard icon={Gift} label="Récomp./mois" value={data.stats.rewardsThisMonth} color="amber" />
            </div>

            {/* Cashier stamp form */}
            <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-5">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <ShoppingBag size={18} className="text-purple-400" />
                Mode Caisse
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-purple-400 text-xs font-medium block mb-1.5">Numéro de téléphone *</label>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCashierAction('ADD_STAMP')}
                    placeholder="Ex: 0612345678"
                    className="w-full bg-purple-900/40 border border-purple-700/40 text-white placeholder-purple-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors"
                    autoComplete="off"
                    inputMode="tel"
                  />
                </div>

                <div>
                  <label className="text-purple-400 text-xs font-medium block mb-1.5">Nom du client (optionnel)</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    placeholder="Prénom / Nom"
                    className="w-full bg-purple-900/40 border border-purple-700/40 text-white placeholder-purple-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => handleCashierAction('ADD_STAMP')}
                    disabled={actionLoading || !phoneInput.trim()}
                    className="bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold rounded-xl py-3 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
                    Tampon
                  </button>
                  <button
                    onClick={() => handleCashierAction('REDEEM_REWARD')}
                    disabled={actionLoading || !phoneInput.trim()}
                    className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-semibold rounded-xl py-3 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Gift size={16} />
                    Récompense
                  </button>
                </div>
              </div>
            </div>

            {/* Weekly chart */}
            <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <TrendingUp size={16} className="text-purple-400" />
                  Activité (7 derniers jours)
                </h3>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-purple-400"><span className="w-2 h-2 rounded-sm bg-purple-500 inline-block" /> Tampons</span>
                  <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-sm bg-amber-500 inline-block" /> Récomp.</span>
                </div>
              </div>
              <WeeklyChart data={data.weeklyData} />
            </div>

            {/* Segment summary */}
            <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Target size={16} className="text-purple-400" />
                Segments clients
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Récompense prête 🎁', count: data.stats.rewardReadyCustomers, color: 'amber' },
                  { label: 'Presque (≥70%) ⭐', count: data.stats.almostRewardCustomers, color: 'orange' },
                  { label: 'Nouveaux (7j) 🆕', count: data.stats.newCustomers, color: 'green' },
                  { label: 'Inactifs ⚠️', count: data.stats.inactiveCustomers, color: 'gray' },
                  { label: 'Fidèles 👑', count: data.stats.loyalCustomers, color: 'purple' },
                ].map(seg => (
                  <div key={seg.label} className="flex items-center justify-between">
                    <span className="text-purple-300 text-sm">{seg.label}</span>
                    <span className="text-white font-bold text-sm">{seg.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity preview */}
            {data.activity.length > 0 && (
              <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-purple-400" />
                  Activité récente
                </h3>
                <div className="space-y-2">
                  {data.activity.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {log.action === 'STAMP_ADDED' && <Star size={13} className="text-purple-400 flex-shrink-0" />}
                        {log.action === 'REWARD_REDEEMED' && <Gift size={13} className="text-amber-400 flex-shrink-0" />}
                        {log.action === 'RESET' && <RefreshCw size={13} className="text-gray-400 flex-shrink-0" />}
                        <span className="text-gray-300 font-mono text-xs">{maskPhone(log.phone)}</span>
                        <span className="text-purple-500 text-xs">
                          {log.action === 'STAMP_ADDED' ? `+1 tampon` :
                           log.action === 'REWARD_REDEEMED' ? 'Récompense' : 'Reset'}
                        </span>
                      </div>
                      <span className="text-purple-500 text-xs">{timeAgo(log.createdAt)}</span>
                    </div>
                  ))}
                </div>
                {data.activity.length > 5 && (
                  <button
                    onClick={() => setActiveTab('activity')}
                    className="w-full text-center text-purple-400 text-xs mt-3 hover:text-purple-300 transition-colors"
                  >
                    Voir toute l'activité →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CUSTOMERS TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Clients</h2>
                <p className="text-purple-400 text-sm">{data.stats.totalCustomers} clients enregistrés</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par nom ou téléphone..."
                className="w-full bg-purple-900/30 border border-purple-700/40 text-white placeholder-purple-500 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {([
                ['all', 'Tous'],
                ['reward_ready', '🎁 Récompense'],
                ['almost_reward', '⭐ Presque'],
                ['new', '🆕 Nouveaux'],
                ['active', '✅ Actifs'],
                ['inactive', '⚠️ Inactifs'],
                ['loyal', '👑 Fidèles'],
              ] as [CustomerFilter, string][]).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    filter === id
                      ? 'bg-purple-600/40 border-purple-500 text-white'
                      : 'bg-purple-900/30 border-purple-800/30 text-purple-400 hover:border-purple-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Customer list */}
            <div className="space-y-2">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-12 text-purple-400">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun client trouvé</p>
                </div>
              ) : (
                filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="w-full bg-purple-900/20 hover:bg-purple-900/40 border border-purple-700/30 hover:border-purple-600/50 rounded-2xl p-4 text-left transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-800/50 flex items-center justify-center">
                          <User size={16} className="text-purple-300" />
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">
                            {c.customerName || 'Client sans nom'}
                          </div>
                          <div className="text-purple-400 text-xs font-mono">{maskPhone(c.phone)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <SegmentBadge customer={c} />
                      </div>
                    </div>
                    <StampBar count={c.stampsCount} total={data.settings.targetStamps} />
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── ACTIVITY TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-white font-bold text-lg">Activité en temps réel</h2>
              <p className="text-purple-400 text-sm">Historique de toutes les transactions</p>
            </div>

            {data.activity.length === 0 ? (
              <div className="text-center py-16 text-purple-400">
                <Activity size={48} className="mx-auto mb-3 opacity-30" />
                <p>Aucune activité enregistrée</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.activity.map(log => (
                  <div key={log.id} className="bg-purple-900/20 border border-purple-700/30 rounded-2xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        log.action === 'STAMP_ADDED' ? 'bg-purple-700/40' :
                        log.action === 'REWARD_REDEEMED' ? 'bg-amber-700/40' :
                        'bg-gray-700/40'
                      }`}>
                        {log.action === 'STAMP_ADDED' && <Star size={14} className="text-purple-400" />}
                        {log.action === 'REWARD_REDEEMED' && <Gift size={14} className="text-amber-400" />}
                        {log.action === 'RESET' && <RefreshCw size={14} className="text-gray-400" />}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">
                          {log.action === 'STAMP_ADDED' ? `Tampon ajouté (${log.stampsCount} total)` :
                           log.action === 'REWARD_REDEEMED' ? 'Récompense utilisée' :
                           'Carte réinitialisée'}
                        </div>
                        <div className="text-purple-400 text-xs font-mono">{maskPhone(log.phone)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-purple-400 text-xs">{timeAgo(log.createdAt)}</div>
                      <div className="text-purple-600 text-xs">{formatDate(log.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MESSAGES TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'messages' && (
          <MessagesTab data={data} profileId={profileId} />
        )}

        {/* ── SETTINGS TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <SettingsTab data={data} profileId={profileId} onRefresh={() => refresh(true)} />
        )}

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-purple-950/95 backdrop-blur-xl border-t border-purple-800/40">
        <div className="max-w-2xl mx-auto px-2 py-2 flex">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                  isActive ? 'text-white' : 'text-purple-500 hover:text-purple-300'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-purple-700/50' : ''
                }`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
