'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Crown, LogOut, Users, BarChart2, MessageSquare, Settings,
  Search, Star, Gift, Clock, TrendingUp, ChevronRight, X,
  Plus, RefreshCw, Check, Copy, Download, Bell, Home, Activity,
  Zap, Send, User, ShoppingBag, Award, Target, ZapOff,
  Eye, EyeOff, Info, ArrowUp, ArrowDown, Percent, Calculator,
  Sliders, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2,
  Mail, Smartphone, Play, Pause, Edit3, ChevronDown,
  TrendingDown, Repeat, BarChart, PieChart, Layers
} from 'lucide-react';
import QRCode from 'qrcode';

// ─── TYPES ─────────────────────────────────────────────────────────────────────

interface Customer {
  id: string; phone: string; customerName: string | null;
  stampsCount: number; rewardsEarned: number; lastStampAt: string | null;
  createdAt: string; isNew: boolean; isActive: boolean; isInactive: boolean;
  isLoyal: boolean; isRewardReady: boolean; isAlmostReward: boolean;
}
interface ActivityLog { id: string; phone: string; action: string; stampsCount: number; createdAt: string; }
interface DayData { label: string; stamps: number; rewards: number; }

interface DashboardData {
  profile: { id: string; slug: string; name: string; company: string | null; photoUrl: string | null; };
  settings: { storeName: string; cardTitle: string; rewardText: string; targetStamps: number; stampIcon: string; merchantPin: string; cooldownMinutes: number; };
  stats: {
    totalCustomers: number; activeCustomers: number; newCustomers: number; inactiveCustomers: number;
    loyalCustomers: number; rewardReadyCustomers: number; almostRewardCustomers: number;
    stampsThisMonth: number; rewardsThisMonth: number; newThisMonth: number;
    totalStamps: number; totalRewards: number;
  };
  customers: Customer[]; activity: ActivityLog[]; weeklyData: DayData[];
}

type Tab = 'home' | 'customers' | 'activity' | 'analytics' | 'campaigns' | 'automations' | 'settings';
type CustomerFilter = 'all' | 'new' | 'active' | 'inactive' | 'loyal' | 'reward_ready' | 'almost_reward';

// ─── HELPERS ───────────────────────────────────────────────────────────────────

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
function fmtDate(d: string) { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); }
function maskPhone(p: string) { return p.length <= 4 ? p : p.slice(0, -4).replace(/\d/g, '•') + p.slice(-4); }
function pctChange(curr: number, prev: number) { if (!prev) return curr > 0 ? 100 : 0; return Math.round(((curr - prev) / prev) * 100); }

// ─── UI ATOMS ──────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, change, color = 'purple' }: { icon: any; label: string; value: string | number; sub?: string; change?: number; color?: string; }) {
  const colors: Record<string, string> = {
    purple: 'bg-purple-900/40 border-purple-700/40 text-purple-300',
    amber: 'bg-amber-900/30 border-amber-700/30 text-amber-400',
    green: 'bg-green-900/30 border-green-700/30 text-green-400',
    red: 'bg-red-900/30 border-red-700/30 text-red-400',
    blue: 'bg-blue-900/30 border-blue-700/30 text-blue-400',
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[color] || colors.purple}`}>
      <div className="flex items-center gap-2 mb-2"><Icon size={15} /><span className="text-xs font-medium">{label}</span></div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {(sub || change !== undefined) && (
        <div className="flex items-center gap-1 mt-1">
          {change !== undefined && (
            <span className={`text-xs flex items-center gap-0.5 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}{Math.abs(change)}%
            </span>
          )}
          {sub && <span className="text-xs opacity-60">{sub}</span>}
        </div>
      )}
    </div>
  );
}

function StampBar({ count, total }: { count: number; total: number }) {
  const pct = Math.min(100, Math.round((count / total) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-purple-900/50 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-purple-300 font-mono w-10 text-right">{count}/{total}</span>
    </div>
  );
}

function SegmentBadge({ c }: { c: Customer }) {
  if (c.isRewardReady) return <span className="inline-flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5"><Gift size={10} /> Récompense</span>;
  if (c.isNew) return <span className="inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-2 py-0.5"><Zap size={10} /> Nouveau</span>;
  if (c.isLoyal) return <span className="inline-flex items-center gap-1 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-2 py-0.5"><Crown size={10} /> Fidèle</span>;
  if (c.isAlmostReward) return <span className="inline-flex items-center gap-1 text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full px-2 py-0.5"><Target size={10} /> Presque</span>;
  if (c.isInactive) return <span className="inline-flex items-center gap-1 text-xs bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full px-2 py-0.5"><ZapOff size={10} /> Inactif</span>;
  return <span className="inline-flex items-center gap-1 text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full px-2 py-0.5"><Activity size={10} /> Actif</span>;
}

// ─── MINI CHART ────────────────────────────────────────────────────────────────

function MiniBarChart({ data, color = '#7C3AED', height = 48 }: { data: number[]; color?: string; height?: number }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm opacity-80 transition-all" style={{ height: `${Math.max(4, (v / max) * height)}px`, background: color }} />
      ))}
    </div>
  );
}

function LineChart({ data, height = 80 }: { data: { label: string; stamps: number; rewards: number }[]; height?: number }) {
  const maxStamps = Math.max(...data.map(d => d.stamps), 1);
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (d.stamps / maxStamps) * 85,
    v: d.stamps,
    label: d.label,
  }));
  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  return (
    <svg viewBox={`0 0 100 100`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${pathD} L 100 100 L 0 100 Z`} fill="url(#lineGrad)" />
      <path d={pathD} fill="none" stroke="#7C3AED" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="#C084FC" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

// ─── CUSTOMER DRAWER ───────────────────────────────────────────────────────────

function CustomerDrawer({ customer, profileId, targetStamps, storeName, onClose, onRefresh }: {
  customer: Customer; profileId: string; targetStamps: number; storeName: string; onClose: () => void; onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [addingTag, setAddingTag] = useState('');

  const PRESET_TAGS = ['VIP', 'Régulier', 'Anniversaire', 'Potentiel VIP', 'À relancer'];

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    // Load logs
    fetch(`/api/profiles/${profileId}/loyalty/merchant/action`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'GET_HISTORY', phone: customer.phone }),
    }).then(r => r.json()).then(j => setLogs(j.logs || [])).catch(console.error);

    // Load tags
    fetch(`/api/merchant/${profileId}/tags?customerId=${customer.id}`)
      .then(r => r.json()).then(j => setTags((j.tags || []).map((t: any) => t.tag))).catch(console.error);
  }, [customer.id, customer.phone, profileId]);

  const doAction = async (action: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/loyalty/merchant/action`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, phone: customer.phone }),
      });
      const j = await res.json();
      if (res.ok) { showToast(j.message || 'Action effectuée'); onRefresh(); onClose(); }
      else showToast(j.error || 'Erreur');
    } catch { showToast('Erreur de connexion'); }
    finally { setLoading(false); setConfirm(null); }
  };

  const addTag = async (tag: string) => {
    const t = tag.trim().toUpperCase();
    if (!t || tags.includes(t)) return;
    await fetch(`/api/merchant/${profileId}/tags`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId: customer.id, tag: t }),
    });
    setTags(prev => [...prev, t]);
    setAddingTag('');
  };

  const removeTag = async (tag: string) => {
    await fetch(`/api/merchant/${profileId}/tags`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId: customer.id, tag }),
    });
    setTags(prev => prev.filter(t => t !== tag));
  };

  const pct = Math.min(100, Math.round((customer.stampsCount / targetStamps) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-gradient-to-br from-purple-950 to-indigo-950 border border-purple-700/40 sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {toast && <div className="absolute top-4 left-4 right-4 bg-green-500/20 border border-green-500/40 text-green-300 rounded-xl px-4 py-2 text-sm text-center z-10">{toast}</div>}

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-800/50 flex items-center justify-center">
              <User size={22} className="text-purple-300" />
            </div>
            <div>
              <div className="text-white font-bold">{customer.customerName || 'Client sans nom'}</div>
              <div className="text-purple-400 text-sm font-mono">{maskPhone(customer.phone)}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-white p-2 rounded-xl hover:bg-white/10"><X size={20} /></button>
        </div>

        <div className="mb-3"><SegmentBadge c={customer} /></div>

        {/* Progress */}
        <div className="bg-purple-900/30 rounded-2xl border border-purple-700/30 p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-purple-300 text-sm font-medium">Progression Carte</span>
            <span className="text-white font-bold">{customer.stampsCount}/{targetStamps}</span>
          </div>
          <div className="h-2.5 bg-purple-900/60 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-purple-500 to-amber-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-purple-400">
            <span>{customer.rewardsEarned} récompense(s)</span>
            <span>{pct}%</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Tampons', value: customer.stampsCount },
            { label: 'Récompenses', value: customer.rewardsEarned },
            { label: 'Dernier passage', value: customer.lastStampAt ? timeAgo(customer.lastStampAt) : 'Jamais' },
          ].map(s => (
            <div key={s.label} className="bg-purple-900/20 rounded-xl p-2.5 text-center">
              <div className="text-white font-bold text-sm">{s.value}</div>
              <div className="text-purple-400 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Client since */}
        <p className="text-purple-400 text-xs mb-4">Client depuis le {fmtDate(customer.createdAt)}</p>

        {/* Tags */}
        <div className="mb-4">
          <div className="text-purple-300 text-xs font-semibold mb-2">Tags internes</div>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(t => (
              <span key={t} className="inline-flex items-center gap-1 text-xs bg-purple-700/30 border border-purple-600/30 text-purple-300 rounded-full px-2.5 py-1">
                {t}
                <button onClick={() => removeTag(t)} className="hover:text-white"><X size={10} /></button>
              </span>
            ))}
            {tags.length === 0 && <span className="text-purple-600 text-xs">Aucun tag</span>}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {PRESET_TAGS.filter(t => !tags.includes(t.toUpperCase())).map(t => (
              <button key={t} onClick={() => addTag(t)}
                className="text-xs bg-purple-900/40 border border-purple-700/30 text-purple-400 rounded-full px-2.5 py-1 hover:border-purple-500 hover:text-purple-300 transition-colors">
                + {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={addingTag} onChange={e => setAddingTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag(addingTag)}
              placeholder="Tag personnalisé..."
              className="flex-1 bg-purple-900/30 border border-purple-700/30 text-white placeholder-purple-600 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-purple-500" />
            <button onClick={() => addTag(addingTag)}
              className="bg-purple-700/40 hover:bg-purple-700/60 text-purple-300 rounded-xl px-3 text-xs transition-colors">Ajouter</button>
          </div>
        </div>

        {/* Actions */}
        {!confirm ? (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button onClick={() => doAction('ADD_STAMP')} disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl py-2.5 text-sm font-medium flex flex-col items-center gap-1 disabled:opacity-50">
              <Plus size={16} />Tampon
            </button>
            <button onClick={() => setConfirm('REDEEM_REWARD')} disabled={loading || customer.stampsCount < targetStamps}
              className="bg-amber-600 hover:bg-amber-500 text-white rounded-xl py-2.5 text-sm font-medium flex flex-col items-center gap-1 disabled:opacity-50">
              <Gift size={16} />Récomp.
            </button>
            <button onClick={() => setConfirm('RESET')} disabled={loading}
              className="bg-red-900/60 hover:bg-red-800/60 text-red-300 rounded-xl py-2.5 text-sm font-medium flex flex-col items-center gap-1 disabled:opacity-50">
              <RefreshCw size={16} />Reset
            </button>
          </div>
        ) : (
          <div className="bg-red-900/20 border border-red-700/30 rounded-2xl p-4 mb-4">
            <p className="text-red-300 text-sm text-center mb-3">{confirm === 'RESET' ? '⚠️ Confirmer la réinitialisation ?' : '🎁 Valider la récompense ?'}</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirm(null)} className="flex-1 bg-white/10 text-white rounded-xl py-2 text-sm hover:bg-white/20">Annuler</button>
              <button onClick={() => doAction(confirm)} disabled={loading} className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl py-2 text-sm font-semibold">{loading ? '...' : 'Confirmer'}</button>
            </div>
          </div>
        )}

        {/* History */}
        {logs.length > 0 && (
          <div>
            <div className="text-purple-300 text-xs font-semibold mb-2">Historique</div>
            <div className="space-y-1.5">
              {logs.slice(0, 8).map((l, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {l.action === 'STAMP_ADDED' && <Star size={12} className="text-purple-400" />}
                    {l.action === 'REWARD_REDEEMED' && <Gift size={12} className="text-amber-400" />}
                    {l.action === 'RESET' && <RefreshCw size={12} className="text-gray-400" />}
                    <span className="text-gray-300">{l.action === 'STAMP_ADDED' ? `+1 tampon (${l.stampsCount} total)` : l.action === 'REWARD_REDEEMED' ? 'Récompense utilisée' : 'Réinitialisation'}</span>
                  </div>
                  <span className="text-purple-500">{timeAgo(l.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROI CALCULATOR ─────────────────────────────────────────────────────────────

function ROICalculator({ storeName }: { storeName: string }) {
  const [customersPerDay, setCustomersPerDay] = useState(30);
  const [avgBasket, setAvgBasket] = useState(80);
  const [daysPerMonth, setDaysPerMonth] = useState(25);
  const [frequencyBoost, setFrequencyBoost] = useState(15);
  const [brandXperCost, setBrandXperCost] = useState(299);

  const currentRevenue = customersPerDay * avgBasket * daysPerMonth;
  const additionalRevenue = currentRevenue * (frequencyBoost / 100);
  const netDifference = additionalRevenue - brandXperCost;
  const annualAdditional = additionalRevenue * 12;
  const roi = brandXperCost > 0 ? Math.round((netDifference / brandXperCost) * 100) : 0;

  const SliderInput = ({ label, value, min, max, step, unit, onChange }: any) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-purple-300 text-sm font-medium">{label}</label>
        <span className="text-white font-bold text-sm">{value.toLocaleString()} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-purple-900/40 rounded-full appearance-none cursor-pointer accent-purple-500" />
      <div className="flex justify-between text-xs text-purple-600 mt-1">
        <span>{min} {unit}</span><span>{max} {unit}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-white font-bold text-lg mb-1 flex items-center gap-2"><Calculator size={20} className="text-purple-400" />Calculateur d'impact</h2>
        <p className="text-purple-400 text-sm">Estimez l'impact de votre programme fidélité sur votre activité.</p>
        <div className="mt-2 flex items-center gap-2 bg-blue-900/20 border border-blue-700/30 rounded-xl px-3 py-2">
          <Info size={14} className="text-blue-400 flex-shrink-0" />
          <span className="text-blue-300 text-xs">Ces résultats sont des estimations basées sur vos hypothèses. Non garantis.</span>
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-5">
        <h3 className="text-white font-semibold mb-4">Données de votre activité</h3>
        <SliderInput label="Clients par jour" value={customersPerDay} min={5} max={300} step={5} unit="clients" onChange={setCustomersPerDay} />
        <SliderInput label="Panier moyen" value={avgBasket} min={10} max={500} step={5} unit="DH" onChange={setAvgBasket} />
        <SliderInput label="Jours d'ouverture/mois" value={daysPerMonth} min={10} max={31} step={1} unit="jours" onChange={setDaysPerMonth} />
        <SliderInput label="Hausse de fréquence estimée" value={frequencyBoost} min={5} max={50} step={5} unit="%" onChange={setFrequencyBoost} />
        <SliderInput label="Coût mensuel Brand Xper" value={brandXperCost} min={99} max={999} step={50} unit="DH" onChange={setBrandXperCost} />
      </div>

      {/* Results */}
      <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-2xl border border-purple-600/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Estimation mensuelle</h3>
          <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5">Estimation</span>
        </div>

        <div className="space-y-3">
          {[
            { label: 'CA actuel estimé', value: currentRevenue, color: 'text-white', prefix: '' },
            { label: 'Revenus additionnels estimés', value: additionalRevenue, color: 'text-green-400', prefix: '+' },
            { label: 'Coût mensuel Brand Xper', value: brandXperCost, color: 'text-red-400', prefix: '-' },
            { label: 'Gain net estimé', value: netDifference, color: netDifference >= 0 ? 'text-green-400' : 'text-red-400', prefix: netDifference >= 0 ? '+' : '' },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-purple-800/30 last:border-0">
              <span className="text-purple-300 text-sm">{r.label}</span>
              <span className={`font-bold ${r.color}`}>{r.prefix}{r.value.toLocaleString('fr-FR')} DH</span>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-purple-900/30 rounded-xl p-3 text-center">
            <div className="text-purple-400 text-xs mb-1">Gain annuel estimé</div>
            <div className="text-white font-bold text-lg">{annualAdditional.toLocaleString('fr-FR')} DH</div>
          </div>
          <div className={`${roi >= 0 ? 'bg-green-900/20 border-green-700/30' : 'bg-red-900/20 border-red-700/30'} border rounded-xl p-3 text-center`}>
            <div className={`${roi >= 0 ? 'text-green-400' : 'text-red-400'} text-xs mb-1`}>ROI estimé</div>
            <div className={`font-bold text-lg ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>×{(Math.abs(netDifference) / Math.max(brandXperCost, 1)).toFixed(1)}</div>
          </div>
        </div>

        <p className="text-purple-500 text-xs text-center mt-4">
          Ces estimations supposent une hausse de {frequencyBoost}% de la fréquence de visite grâce au programme fidélité.
          Les résultats réels peuvent varier.
        </p>
      </div>
    </div>
  );
}

// ─── ANALYTICS TAB ─────────────────────────────────────────────────────────────

function AnalyticsTab({ data, profileId }: { data: DashboardData; profileId: string }) {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'overview' | 'roi'>('overview');

  useEffect(() => {
    fetch(`/api/merchant/${profileId}/analytics`)
      .then(r => r.json())
      .then(j => setAnalytics(j))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [profileId]);

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <RefreshCw size={32} className="text-purple-400 animate-spin mx-auto mb-3" />
        <p className="text-purple-400 text-sm">Chargement des analytics...</p>
      </div>
    </div>
  );

  const ov = analytics?.overview || {};
  const daily = analytics?.daily || [];
  const weekly = analytics?.weekly || [];
  const topCustomers = analytics?.topCustomers || [];
  const campaigns = analytics?.campaigns || [];

  const stampTrend = pctChange(ov.stampsThisMonth, ov.stampsLastMonth);
  const rewardTrend = pctChange(ov.rewardsThisMonth, ov.rewardsLastMonth);
  const customerTrend = pctChange(ov.newThisMonth, ov.newLastMonth);

  return (
    <div className="space-y-4">
      {/* Sub-nav */}
      <div className="flex gap-2">
        {[
          { id: 'overview', label: 'Vue générale', icon: BarChart2 },
          { id: 'roi', label: 'Impact business', icon: Calculator },
        ].map(v => (
          <button key={v.id} onClick={() => setView(v.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${view === v.id ? 'bg-purple-600/30 border-purple-500 text-white' : 'bg-purple-900/20 border-purple-800/30 text-purple-400 hover:border-purple-600'}`}>
            <v.icon size={14} />{v.label}
          </button>
        ))}
      </div>

      {view === 'roi' ? (
        <ROICalculator storeName={data.settings.storeName} />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Users} label="Total clients" value={ov.totalCustomers || data.stats.totalCustomers} sub="base totale" color="purple" />
            <StatCard icon={Zap} label="Nouveaux (mois)" value={ov.newThisMonth || data.stats.newThisMonth} change={customerTrend} color="green" />
            <StatCard icon={Star} label="Tampons (mois)" value={ov.stampsThisMonth || data.stats.stampsThisMonth} change={stampTrend} color="blue" />
            <StatCard icon={Gift} label="Récompenses (mois)" value={ov.rewardsThisMonth || data.stats.rewardsThisMonth} change={rewardTrend} color="amber" />
          </div>

          {/* Retention indicators */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Taux rétention', value: `${ov.retentionRate || 0}%`, icon: Repeat, color: 'text-purple-400' },
              { label: 'Complétion carte', value: `${ov.completionRate || 0}%`, icon: Award, color: 'text-amber-400' },
              { label: 'Tampons/client actif', value: ov.avgStamps || 0, icon: Target, color: 'text-blue-400' },
            ].map(m => (
              <div key={m.label} className="bg-purple-900/20 border border-purple-700/30 rounded-2xl p-3 text-center">
                <m.icon size={18} className={`${m.color} mx-auto mb-1`} />
                <div className="text-white font-bold text-lg">{m.value}</div>
                <div className="text-purple-400 text-xs">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Segment breakdown */}
          <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><PieChart size={16} className="text-purple-400" />Répartition des segments</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Actifs (30j)', count: ov.activeCustomers || data.stats.activeCustomers, total: ov.totalCustomers || data.stats.totalCustomers, color: '#7C3AED' },
                { label: 'Fidèles (2+ récomp.)', count: ov.loyalCustomers || data.stats.loyalCustomers, total: ov.totalCustomers || data.stats.totalCustomers, color: '#C084FC' },
                { label: 'Récompense prête', count: ov.rewardReadyCustomers || data.stats.rewardReadyCustomers, total: ov.totalCustomers || data.stats.totalCustomers, color: '#F59E0B' },
                { label: 'Inactifs', count: ov.inactiveCustomers || data.stats.inactiveCustomers, total: ov.totalCustomers || data.stats.totalCustomers, color: '#6B7280' },
              ].map(seg => {
                const pct = seg.total > 0 ? Math.round((seg.count / seg.total) * 100) : 0;
                return (
                  <div key={seg.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-purple-300">{seg.label}</span>
                      <span className="text-white font-medium">{seg.count} clients ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-purple-900/40 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: seg.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 30-day stamps chart */}
          {daily.length > 0 && (
            <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-purple-400" />Tampons — 30 derniers jours</h3>
              <LineChart data={daily.slice(-30).map((d: any) => ({ label: d.label, stamps: d.stamps, rewards: d.rewards }))} height={80} />
              <div className="flex justify-between text-xs text-purple-500 mt-1">
                <span>{daily[0]?.label || ''}</span>
                <span>{daily[daily.length - 1]?.label || 'Aujourd\'hui'}</span>
              </div>
            </div>
          )}

          {/* Weekly overview */}
          {weekly.length > 0 && (
            <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><BarChart size={16} className="text-purple-400" />Activité hebdomadaire (12 sem.)</h3>
              <div className="flex items-end justify-between gap-1 h-16">
                {weekly.map((w: any, i: number) => {
                  const maxW = Math.max(...weekly.map((x: any) => x.stamps), 1);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t opacity-80"
                        style={{ height: `${Math.max(4, (w.stamps / maxW) * 56)}px` }} />
                      <span className="text-xs text-purple-500">{w.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top customers */}
          {topCustomers.length > 0 && (
            <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Crown size={16} className="text-amber-400" />Top clients</h3>
              <div className="space-y-2">
                {topCustomers.map((c: any, i: number) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-purple-800 text-purple-300'}`}>{i + 1}</div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{c.customerName || 'Sans nom'}</div>
                      <div className="text-purple-400 text-xs">{c.rewardsEarned} récompenses · {c.stampsCount} tampons</div>
                    </div>
                    {c.lastStampAt && <span className="text-purple-500 text-xs">{timeAgo(c.lastStampAt)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campaigns summary */}
          {campaigns.length > 0 && (
            <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Send size={16} className="text-purple-400" />Campagnes récentes</h3>
              <div className="space-y-2">
                {campaigns.slice(0, 5).map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-purple-800/30 last:border-0">
                    <div>
                      <div className="text-white text-sm font-medium">{c.name}</div>
                      <div className="text-purple-400 text-xs">{c.channel} · {c.recipientCount} destinataires</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${c.status === 'SENT' ? 'bg-green-900/20 border-green-700/30 text-green-400' : 'bg-gray-900/20 border-gray-700/30 text-gray-400'}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── CAMPAIGNS TAB ─────────────────────────────────────────────────────────────

function CampaignsTab({ data, profileId }: { data: DashboardData; profileId: string }) {
  const [selectedSegment, setSelectedSegment] = useState('reward_ready');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('whatsapp');
  const [campaignName, setCampaignName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copiedPhones, setCopiedPhones] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [view, setView] = useState<'create' | 'history'>('create');

  const segments = [
    { id: 'all', label: 'Tous les clients', count: data.stats.totalCustomers, icon: Users },
    { id: 'reward_ready', label: 'Récompense prête 🎁', count: data.stats.rewardReadyCustomers, icon: Gift },
    { id: 'almost_reward', label: 'Presque (≥70%) ⭐', count: data.stats.almostRewardCustomers, icon: Target },
    { id: 'new', label: 'Nouveaux (7j) 🆕', count: data.stats.newCustomers, icon: Zap },
    { id: 'active', label: 'Actifs (30j) ✅', count: data.stats.activeCustomers, icon: Activity },
    { id: 'inactive', label: 'Inactifs ⚠️', count: data.stats.inactiveCustomers, icon: ZapOff },
    { id: 'loyal', label: 'Fidèles 👑', count: data.stats.loyalCustomers, icon: Crown },
  ];

  const defaultMessages: Record<string, string> = {
    reward_ready: `🎁 Félicitations ! Votre récompense vous attend chez ${data.settings.storeName}. Passez nous voir !`,
    almost_reward: `⭐ Vous y êtes presque ! Encore quelques tampons pour votre récompense chez ${data.settings.storeName}.`,
    new: `👋 Bienvenue chez ${data.settings.storeName} ! Merci de votre première visite.`,
    inactive: `😊 ${data.settings.storeName} vous attend ! Revenez profiter de votre programme fidélité.`,
    active: `💜 Merci pour votre fidélité chez ${data.settings.storeName} !`,
    loyal: `👑 Merci d'être un client VIP de ${data.settings.storeName} !`,
    all: `💜 Un message de ${data.settings.storeName}. Merci pour votre confiance.`,
  };

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

  useEffect(() => {
    fetch(`/api/merchant/${profileId}/campaigns`)
      .then(r => r.json()).then(j => setCampaigns(j.campaigns || [])).catch(console.error);
  }, [profileId]);

  const handleSave = async () => {
    if (!campaignName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/merchant/${profileId}/campaigns`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: campaignName, segment: selectedSegment, message: message || defaultMessages[selectedSegment], channel }),
      });
      if (res.ok) {
        const j = await res.json();
        setSaved(true);
        setCampaigns(prev => [j.campaign, ...prev]);
        setTimeout(() => { setSaved(false); setCampaignName(''); }, 3000);
      }
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg">Campagnes & Messages</h2>
          <p className="text-purple-400 text-sm">Ciblez vos clients par segment.</p>
        </div>
        <div className="flex gap-2">
          {[{ id: 'create', label: 'Créer' }, { id: 'history', label: 'Historique' }].map(v => (
            <button key={v.id} onClick={() => setView(v.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${view === v.id ? 'bg-purple-600/30 border-purple-500 text-white' : 'bg-purple-900/20 border-purple-800/30 text-purple-400'}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'history' ? (
        <div className="space-y-2">
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-purple-400">
              <Send size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune campagne enregistrée</p>
            </div>
          ) : campaigns.map(c => (
            <div key={c.id} className="bg-purple-900/20 border border-purple-700/30 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-white font-medium">{c.name}</div>
                  <div className="text-purple-400 text-xs">{c.channel} · Segment: {c.segment} · {c.recipientCount} clients</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${c.status === 'SENT' ? 'bg-green-900/20 border-green-700/30 text-green-400' : 'bg-gray-900/20 border-gray-700/30 text-gray-400'}`}>{c.status}</span>
              </div>
              <p className="text-purple-500 text-xs">{fmtDate(c.createdAt)}</p>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Segment */}
          <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
            <h3 className="text-purple-300 text-sm font-semibold mb-3">1. Segment cible</h3>
            <div className="grid grid-cols-2 gap-2">
              {segments.map(seg => {
                const Icon = seg.icon;
                return (
                  <button key={seg.id} onClick={() => setSelectedSegment(seg.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${selectedSegment === seg.id ? 'bg-purple-600/30 border-purple-500 text-white' : 'bg-purple-900/30 border-purple-800/40 text-purple-300 hover:border-purple-600'}`}>
                    <Icon size={13} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{seg.label}</div>
                      <div className="text-xs opacity-60">{seg.count} clients</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 bg-purple-800/20 rounded-xl px-4 py-2 text-sm text-center">
              <span className="text-purple-300">Destinataires : </span>
              <span className="text-white font-bold">{filteredCustomers.length} clients</span>
            </div>
          </div>

          {/* Channel + Message */}
          <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
            <h3 className="text-purple-300 text-sm font-semibold mb-3">2. Canal & Message</h3>
            <div className="flex gap-2 mb-3">
              {[
                { id: 'whatsapp', label: '💬 WhatsApp' },
                { id: 'sms', label: '📱 SMS' },
                { id: 'email', label: '✉️ Email' },
              ].map(ch => (
                <button key={ch.id} onClick={() => setChannel(ch.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${channel === ch.id ? 'bg-green-700/30 border-green-600 text-green-300' : 'bg-purple-900/20 border-purple-800/30 text-purple-400 hover:border-purple-600'}`}>
                  {ch.label}
                </button>
              ))}
            </div>
            {(channel === 'sms' || channel === 'email') && (
              <div className="mb-3 flex items-center gap-2 bg-orange-900/20 border border-orange-700/30 rounded-xl px-3 py-2">
                <AlertCircle size={14} className="text-orange-400 flex-shrink-0" />
                <span className="text-orange-300 text-xs">Fournisseur {channel === 'email' ? 'email' : 'SMS'} non connecté. Configurez un fournisseur dans les paramètres.</span>
              </div>
            )}
            <textarea value={message || defaultMessages[selectedSegment]} onChange={e => setMessage(e.target.value)}
              rows={4} placeholder="Votre message..."
              className="w-full bg-purple-900/30 border border-purple-700/40 text-white placeholder-purple-500 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:border-purple-500" />
          </div>

          {/* Campaign name + actions */}
          <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
            <h3 className="text-purple-300 text-sm font-semibold mb-3">3. Enregistrer la campagne</h3>
            <input type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)}
              placeholder="Nom de la campagne (ex: Relance été 2026)"
              className="w-full bg-purple-900/30 border border-purple-700/40 text-white placeholder-purple-500 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500 mb-3" />
            <div className="space-y-2">
              <button onClick={() => { navigator.clipboard.writeText(filteredCustomers.map(c => c.phone).join('\n')); setCopiedPhones(true); setTimeout(() => setCopiedPhones(false), 2500); }}
                className="w-full flex items-center justify-between bg-purple-700/30 hover:bg-purple-700/50 border border-purple-600/30 text-white rounded-xl px-4 py-3 transition-all">
                <div className="flex items-center gap-2">
                  <Copy size={15} className="text-purple-400" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Copier les numéros</div>
                    <div className="text-xs text-purple-400">{filteredCustomers.length} numéros</div>
                  </div>
                </div>
                {copiedPhones ? <Check size={15} className="text-green-400" /> : <ChevronRight size={15} className="text-purple-400" />}
              </button>

              <button onClick={handleSave} disabled={saving || !campaignName.trim()}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${saved ? 'bg-green-600/30 border border-green-600/40 text-green-300' : 'bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40'}`}>
                {saved ? <><Check size={16} /> Campagne sauvegardée</> : saving ? 'Enregistrement...' : <><Send size={16} /> Enregistrer la campagne</>}
              </button>
            </div>
          </div>

          {/* Info note */}
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-2xl p-4 flex gap-3">
            <Info size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-300">
              <strong className="block mb-1">Envoi de messages</strong>
              Copiez les numéros et utilisez WhatsApp Business, ou connectez un fournisseur SMS/Email dans les paramètres pour l'envoi automatique.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── AUTOMATIONS TAB ───────────────────────────────────────────────────────────

function AutomationsTab({ profileId, storeName }: { profileId: string; storeName: string }) {
  const [automations, setAutomations] = useState<any[]>([]);
  const [usageLimits, setUsageLimits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/merchant/${profileId}/automations`)
      .then(r => r.json())
      .then(j => { setAutomations(j.automations || []); setUsageLimits(j.usageLimits || null); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [profileId]);

  const toggle = async (id: string, enabled: boolean) => {
    setToggling(id);
    try {
      const res = await fetch(`/api/merchant/${profileId}/automations`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ automationId: id, enabled: !enabled }),
      });
      if (res.ok) {
        setAutomations(prev => prev.map(a => a.id === id ? { ...a, enabled: !enabled } : a));
      }
    } catch {} finally { setToggling(null); }
  };

  const TRIGGER_ICONS: Record<string, any> = {
    new_customer: Zap,
    almost_reward: Target,
    reward_ready: Gift,
    inactive_30d: ZapOff,
    reward_redeemed: CheckCircle2,
  };

  if (loading) return <div className="py-12 text-center"><RefreshCw size={28} className="text-purple-400 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-white font-bold text-lg mb-1">Automatisations</h2>
        <p className="text-purple-400 text-sm">Configurez des messages automatiques basés sur le comportement client.</p>
      </div>

      {/* Provider notice */}
      <div className="bg-orange-900/20 border border-orange-700/30 rounded-2xl p-4 flex gap-3">
        <AlertCircle size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-orange-300">
          <strong className="block mb-1">Fournisseur de messagerie requis</strong>
          Les automatisations nécessitent un fournisseur WhatsApp Business, SMS ou Email connecté. Aucun message ne sera envoyé tant qu'un fournisseur n'est pas configuré.
        </div>
      </div>

      {/* Automation rules */}
      <div className="space-y-3">
        {automations.map(auto => {
          const Icon = TRIGGER_ICONS[auto.trigger] || Zap;
          return (
            <div key={auto.id} className={`bg-purple-900/20 rounded-2xl border p-4 transition-all ${auto.enabled ? 'border-purple-600/50' : 'border-purple-800/30'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${auto.enabled ? 'bg-purple-700/50' : 'bg-purple-900/40'}`}>
                    <Icon size={16} className={auto.enabled ? 'text-purple-300' : 'text-purple-600'} />
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{auto.name}</div>
                    <div className="text-purple-400 text-xs">{auto.triggerLabel}</div>
                  </div>
                </div>
                <button onClick={() => toggle(auto.id, auto.enabled)} disabled={toggling === auto.id}
                  className={`flex-shrink-0 p-1 transition-colors rounded-lg ${auto.enabled ? 'text-purple-400 hover:text-white' : 'text-purple-700 hover:text-purple-400'} disabled:opacity-50`}>
                  {auto.enabled
                    ? <div className="w-10 h-5 bg-purple-600 rounded-full flex items-center px-0.5 justify-end transition-all"><div className="w-4 h-4 bg-white rounded-full" /></div>
                    : <div className="w-10 h-5 bg-purple-900/60 border border-purple-700/40 rounded-full flex items-center px-0.5 justify-start transition-all"><div className="w-4 h-4 bg-purple-600 rounded-full" /></div>
                  }
                </button>
              </div>

              {/* Channel */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-purple-500">Canal :</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${auto.channel === 'whatsapp' ? 'bg-green-900/20 border-green-700/30 text-green-400' : auto.channel === 'sms' ? 'bg-blue-900/20 border-blue-700/30 text-blue-400' : 'bg-orange-900/20 border-orange-700/30 text-orange-400'}`}>
                  {auto.channel === 'whatsapp' ? '💬 WhatsApp' : auto.channel === 'sms' ? '📱 SMS' : '✉️ Email'}
                </span>
                {auto.enabled && <span className="text-xs text-orange-400">· Fournisseur requis</span>}
              </div>

              {/* Message preview */}
              <div className="bg-purple-900/30 rounded-xl px-3 py-2">
                <p className="text-purple-300 text-xs italic">
                  "{auto.messageTemplate.replace('{storeName}', storeName).replace('{remaining}', '3')}"
                </p>
              </div>

              {auto.enabled && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400">
                  <AlertCircle size={11} />
                  <span>Activé · En attente d'un fournisseur de messagerie</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Usage Limits */}
      {usageLimits && (
        <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Layers size={16} className="text-purple-400" />Limites d'utilisation</h3>
          <div className="space-y-3">
            {Object.entries(usageLimits).map(([key, val]: [string, any]) => {
              const pct = val.limit > 0 ? Math.round((val.used / val.limit) * 100) : 0;
              const isHigh = pct >= 80;
              const labels: Record<string, string> = { email: 'Emails', sms: 'SMS', whatsapp: 'WhatsApp', campaigns: 'Campagnes' };
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-purple-300 font-medium">{labels[key] || key}</span>
                    <span className={isHigh ? 'text-orange-400' : 'text-purple-400'}>{val.used.toLocaleString()} / {val.limit.toLocaleString()} {val.unit}</span>
                  </div>
                  <div className="h-1.5 bg-purple-900/50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${isHigh ? 'bg-orange-500' : 'bg-purple-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  {pct >= 100 && <p className="text-red-400 text-xs mt-1">⚠️ Limite mensuelle atteinte.</p>}
                  {pct >= 80 && pct < 100 && <p className="text-orange-400 text-xs mt-1">Approche de la limite — {100 - pct}% restant.</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS TAB ──────────────────────────────────────────────────────────────

function SettingsTab({ data, profileId, onRefresh }: { data: DashboardData; profileId: string; onRefresh: () => void }) {
  const [form, setForm] = useState({ ...data.settings });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/c/${data.profile.slug}` : '';

  useEffect(() => {
    if (publicUrl) QRCode.toDataURL(publicUrl, { width: 300, margin: 2, color: { dark: '#7C3AED', light: '#FFFFFF' } })
      .then(setQrUrl).catch(console.error);
  }, [publicUrl]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/loyalty/merchant`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: form }),
      });
      if (res.ok) { setSaved(true); onRefresh(); setTimeout(() => setSaved(false), 3000); }
    } catch {} finally { setSaving(false); }
  };

  const handleLogout = async () => {
    await fetch('/api/merchant/auth', { method: 'DELETE' });
    await fetch(`/api/profiles/${profileId}/loyalty/merchant/auth`, { method: 'DELETE' });
    window.location.href = `/merchant/login?store=${data.profile.slug}`;
  };

  return (
    <div className="space-y-4">
      <div><h2 className="text-white font-bold text-lg mb-1">Paramètres</h2></div>

      {/* QR Code */}
      <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4 text-center">
        <h3 className="text-purple-300 text-sm font-semibold mb-3">QR Code de votre carte fidélité</h3>
        {qrUrl && <div className="bg-white rounded-2xl p-4 inline-block mb-3"><img src={qrUrl} alt="QR" className="w-36 h-36" /></div>}
        <p className="text-purple-400 text-xs mb-3 break-all">{publicUrl}</p>
        <div className="flex gap-2 justify-center">
          <button onClick={() => { navigator.clipboard.writeText(publicUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="flex items-center gap-1.5 bg-purple-700/40 hover:bg-purple-700/60 text-purple-300 border border-purple-600/30 rounded-xl px-3 py-2 text-xs transition-all">
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}{copied ? 'Copié !' : 'Copier'}
          </button>
          {qrUrl && (
            <a href={qrUrl} download={`qr-${data.profile.slug}.png`}
              className="flex items-center gap-1.5 bg-purple-700/40 hover:bg-purple-700/60 text-purple-300 border border-purple-600/30 rounded-xl px-3 py-2 text-xs transition-all">
              <Download size={13} />Télécharger
            </a>
          )}
        </div>
      </div>

      {/* Loyalty settings */}
      <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
        <h3 className="text-purple-300 text-sm font-semibold mb-4">Configuration fidélité</h3>
        <div className="space-y-3">
          {[
            { key: 'storeName', label: 'Nom du magasin', type: 'text', placeholder: 'Mon magasin' },
            { key: 'cardTitle', label: 'Titre de la carte', type: 'text', placeholder: 'Carte Fidélité' },
            { key: 'rewardText', label: 'Récompense', type: 'text', placeholder: 'Café gratuit' },
            { key: 'targetStamps', label: 'Tampons requis', type: 'number', placeholder: '10' },
            { key: 'cooldownMinutes', label: 'Délai entre tampons (min)', type: 'number', placeholder: '5' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-purple-400 text-xs font-medium block mb-1.5">{f.label}</label>
              <input type={f.type} value={(form as any)[f.key] || ''} placeholder={f.placeholder}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                className="w-full bg-purple-900/40 border border-purple-700/40 text-white placeholder-purple-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500" />
            </div>
          ))}
          <div>
            <label className="text-purple-400 text-xs font-medium block mb-1.5">Code PIN commerçant</label>
            <div className="relative">
              <input type={showPin ? 'text' : 'password'} value={form.merchantPin}
                onChange={e => setForm(prev => ({ ...prev, merchantPin: e.target.value }))}
                className="w-full bg-purple-900/40 border border-purple-700/40 text-white placeholder-purple-600 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:border-purple-500" />
              <button onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white">
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving}
          className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm transition-all ${saved ? 'bg-green-600/30 border border-green-600 text-green-300' : 'bg-purple-600 hover:bg-purple-500 text-white'} disabled:opacity-50`}>
          {saving ? 'Sauvegarde...' : saved ? '✓ Sauvegardé !' : 'Enregistrer les paramètres'}
        </button>
      </div>

      {/* Messaging providers */}
      <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
        <h3 className="text-purple-300 text-sm font-semibold mb-3">Fournisseurs de messagerie</h3>
        {[
          { label: 'WhatsApp Business', icon: '💬', status: 'not_connected' },
          { label: 'SMS (Twilio / autre)', icon: '📱', status: 'not_connected' },
          { label: 'Email (SendGrid / autre)', icon: '✉️', status: 'not_connected' },
        ].map(p => (
          <div key={p.label} className="flex items-center justify-between py-2.5 border-b border-purple-800/30 last:border-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">{p.icon}</span>
              <span className="text-white text-sm">{p.label}</span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-900/30 border border-gray-700/30 rounded-full px-2 py-0.5">Non connecté</span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 text-red-400 rounded-2xl py-3 text-sm font-medium transition-all">
        <LogOut size={16} />Déconnexion
      </button>
    </div>
  );
}

// ─── NOTIFICATION PANEL ────────────────────────────────────────────────────────

function NotificationPanel({ profileId, onClose }: { profileId: string; onClose: () => void }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/merchant/${profileId}/notifications`)
      .then(r => r.json()).then(j => setNotifications(j.notifications || []))
      .catch(console.error).finally(() => setLoading(false));

    // Mark as read
    fetch(`/api/merchant/${profileId}/notifications`, { method: 'PUT' }).catch(console.error);
  }, [profileId]);

  const NOTIF_ICONS: Record<string, any> = {
    new_customer: Zap, stamp_added: Star, reward_redeemed: Gift, campaign_sent: Send,
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-purple-950 border border-purple-700/40 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-purple-800/40 flex items-center justify-between">
        <span className="text-white font-semibold text-sm">Notifications</span>
        <button onClick={onClose} className="text-purple-400 hover:text-white"><X size={16} /></button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {loading ? <div className="py-8 text-center"><RefreshCw size={20} className="text-purple-400 animate-spin mx-auto" /></div>
          : notifications.length === 0 ? (
            <div className="py-8 text-center text-purple-400 text-sm">
              <Bell size={28} className="mx-auto mb-2 opacity-30" />Aucune notification
            </div>
          ) : notifications.map(n => {
            const Icon = NOTIF_ICONS[n.type] || Bell;
            return (
              <div key={n.id} className={`px-4 py-3 border-b border-purple-800/20 last:border-0 ${!n.isRead ? 'bg-purple-900/20' : ''}`}>
                <div className="flex items-start gap-2">
                  <Icon size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-white text-xs">{n.message}</p>
                    <p className="text-purple-500 text-xs mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────────

interface MerchantDashboardClientProps {
  profileId: string; slug: string; initialData: DashboardData;
}

export default function MerchantDashboardClient({ profileId, slug, initialData }: MerchantDashboardClientProps) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CustomerFilter>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg); setToastType(type); setTimeout(() => setToast(null), 3500);
  };

  // Load unread notification count
  useEffect(() => {
    fetch(`/api/merchant/${profileId}/notifications`)
      .then(r => r.json()).then(j => setUnreadCount(j.unreadCount || 0)).catch(console.error);
  }, [profileId]);

  // Close notif panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const refresh = useCallback(async (silent = true) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/loyalty/merchant`);
      if (res.ok) {
        const json = await res.json();
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
        setData(prev => ({ ...prev, ...json, customers: enriched }));
      }
    } catch {} finally { setRefreshing(false); }
  }, [profileId]);

  const handleCashierAction = async (action: 'ADD_STAMP' | 'REDEEM_REWARD') => {
    if (!phoneInput.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/loyalty/merchant/action`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, phone: phoneInput.trim(), customerName: nameInput.trim() || undefined }),
      });
      const json = await res.json();
      if (res.ok) {
        showToast(json.message || (action === 'ADD_STAMP' ? '✓ Tampon ajouté !' : '🎁 Récompense validée !'));
        setPhoneInput(''); setNameInput(''); refresh(true);
      } else showToast(json.error || 'Erreur', 'error');
    } catch { showToast('Erreur de connexion', 'error'); }
    finally { setActionLoading(false); }
  };

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
      list = list.filter(c => c.phone.includes(s) || (c.customerName || '').toLowerCase().includes(s));
    }
    return list;
  }, [data.customers, filter, search]);

  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: 'home', icon: Home, label: 'Caisse' },
    { id: 'customers', icon: Users, label: 'Clients' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
    { id: 'campaigns', icon: MessageSquare, label: 'Campagnes' },
    { id: 'automations', icon: Zap, label: 'Auto' },
    { id: 'settings', icon: Settings, label: 'Réglages' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-[#1a0933] to-indigo-950 text-white">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-medium shadow-xl ${toastType === 'error' ? 'bg-red-500/90 text-white border border-red-400/50' : 'bg-green-500/90 text-white border border-green-400/50'}`}>
          {toast}
        </div>
      )}

      {/* Customer Drawer */}
      {selectedCustomer && (
        <CustomerDrawer customer={selectedCustomer} profileId={profileId} targetStamps={data.settings.targetStamps}
          storeName={data.settings.storeName} onClose={() => setSelectedCustomer(null)} onRefresh={() => refresh(true)} />
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-purple-950/90 backdrop-blur-xl border-b border-purple-800/30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data.profile.photoUrl
              ? <img src={data.profile.photoUrl} alt="" className="w-9 h-9 rounded-xl object-cover" />
              : <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-sm">{(data.settings.storeName || '?')[0].toUpperCase()}</div>
            }
            <div>
              <div className="text-white font-bold text-sm leading-tight">{data.settings.storeName}</div>
              <div className="text-purple-400 text-xs">{data.stats.totalCustomers} clients · Tableau de bord</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) setUnreadCount(0); }}
                className="relative p-2 rounded-xl text-purple-400 hover:text-white hover:bg-purple-800/40 transition-colors">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              {showNotifications && <NotificationPanel profileId={profileId} onClose={() => setShowNotifications(false)} />}
            </div>
            <button onClick={() => refresh(false)} disabled={refreshing}
              className="p-2 rounded-xl text-purple-400 hover:text-white hover:bg-purple-800/40 transition-colors">
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pb-28 pt-4">

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={Users} label="Total clients" value={data.stats.totalCustomers} color="purple" />
              <StatCard icon={Star} label="Tampons/mois" value={data.stats.stampsThisMonth} color="blue" />
              <StatCard icon={Gift} label="Récomp./mois" value={data.stats.rewardsThisMonth} color="amber" />
            </div>

            {/* Cashier form */}
            <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-5">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2"><ShoppingBag size={18} className="text-purple-400" />Mode Caisse</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-purple-400 text-xs font-medium block mb-1.5">Numéro de téléphone *</label>
                  <input type="tel" value={phoneInput} onChange={e => setPhoneInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCashierAction('ADD_STAMP')}
                    placeholder="Ex: 0612345678" inputMode="tel" autoComplete="off"
                    className="w-full bg-purple-900/40 border border-purple-700/40 text-white placeholder-purple-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="text-purple-400 text-xs font-medium block mb-1.5">Nom du client (optionnel)</label>
                  <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Prénom / Nom"
                    className="w-full bg-purple-900/40 border border-purple-700/40 text-white placeholder-purple-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-purple-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleCashierAction('ADD_STAMP')} disabled={actionLoading || !phoneInput.trim()}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                    {actionLoading ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}Tampon
                  </button>
                  <button onClick={() => handleCashierAction('REDEEM_REWARD')} disabled={actionLoading || !phoneInput.trim()}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                    <Gift size={16} />Récompense
                  </button>
                </div>
              </div>
            </div>

            {/* Mini weekly chart */}
            <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold flex items-center gap-2"><TrendingUp size={16} className="text-purple-400" />7 derniers jours</h3>
                <button onClick={() => setActiveTab('analytics')} className="text-purple-400 text-xs hover:text-purple-300">Analytics →</button>
              </div>
              <div className="flex items-end gap-2 h-16">
                {data.weeklyData.map((d, i) => {
                  const max = Math.max(...data.weeklyData.map(x => x.stamps), 1);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t opacity-80" style={{ height: `${Math.max(4, (d.stamps / max) * 48)}px` }} />
                      <span className="text-xs text-purple-500">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Segments summary */}
            <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold flex items-center gap-2"><Target size={16} className="text-purple-400" />Segments</h3>
                <button onClick={() => setActiveTab('customers')} className="text-purple-400 text-xs hover:text-purple-300">Voir tous →</button>
              </div>
              <div className="space-y-1.5">
                {[
                  { label: 'Récompense prête 🎁', count: data.stats.rewardReadyCustomers },
                  { label: 'Presque arrivé ⭐', count: data.stats.almostRewardCustomers },
                  { label: 'Nouveaux (7j) 🆕', count: data.stats.newCustomers },
                  { label: 'Inactifs ⚠️', count: data.stats.inactiveCustomers },
                  { label: 'Fidèles 👑', count: data.stats.loyalCustomers },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center">
                    <span className="text-purple-300 text-sm">{s.label}</span>
                    <span className="text-white font-bold">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            {data.activity.length > 0 && (
              <div className="bg-purple-900/20 rounded-2xl border border-purple-700/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold flex items-center gap-2"><Clock size={16} className="text-purple-400" />Activité récente</h3>
                  <button onClick={() => setActiveTab('activity')} className="text-purple-400 text-xs hover:text-purple-300">Tout voir →</button>
                </div>
                <div className="space-y-2">
                  {data.activity.slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {log.action === 'STAMP_ADDED' && <Star size={13} className="text-purple-400 flex-shrink-0" />}
                        {log.action === 'REWARD_REDEEMED' && <Gift size={13} className="text-amber-400 flex-shrink-0" />}
                        {log.action === 'RESET' && <RefreshCw size={13} className="text-gray-400 flex-shrink-0" />}
                        <span className="text-gray-300 font-mono text-xs">{maskPhone(log.phone)}</span>
                        <span className="text-purple-500 text-xs">{log.action === 'STAMP_ADDED' ? '+1 tampon' : log.action === 'REWARD_REDEEMED' ? 'Récompense' : 'Reset'}</span>
                      </div>
                      <span className="text-purple-500 text-xs">{timeAgo(log.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Clients</h2>
                <p className="text-purple-400 text-sm">{data.stats.totalCustomers} clients enregistrés</p>
              </div>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom ou téléphone..."
                className="w-full bg-purple-900/30 border border-purple-700/40 text-white placeholder-purple-500 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:border-purple-500" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"><X size={16} /></button>}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {([['all', 'Tous'], ['reward_ready', '🎁 Récompense'], ['almost_reward', '⭐ Presque'], ['new', '🆕 Nouveaux'], ['active', '✅ Actifs'], ['inactive', '⚠️ Inactifs'], ['loyal', '👑 Fidèles']] as [CustomerFilter, string][]).map(([id, label]) => (
                <button key={id} onClick={() => setFilter(id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${filter === id ? 'bg-purple-600/40 border-purple-500 text-white' : 'bg-purple-900/30 border-purple-800/30 text-purple-400 hover:border-purple-600'}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-12 text-purple-400"><Users size={40} className="mx-auto mb-3 opacity-30" /><p className="text-sm">Aucun client trouvé</p></div>
              ) : filteredCustomers.map(c => (
                <button key={c.id} onClick={() => setSelectedCustomer(c)}
                  className="w-full bg-purple-900/20 hover:bg-purple-900/40 border border-purple-700/30 hover:border-purple-600/50 rounded-2xl p-4 text-left transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-800/50 flex items-center justify-center"><User size={16} className="text-purple-300" /></div>
                      <div>
                        <div className="text-white font-medium text-sm">{c.customerName || 'Client sans nom'}</div>
                        <div className="text-purple-400 text-xs font-mono">{maskPhone(c.phone)}</div>
                      </div>
                    </div>
                    <SegmentBadge c={c} />
                  </div>
                  <StampBar count={c.stampsCount} total={data.settings.targetStamps} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div><h2 className="text-white font-bold text-lg">Activité en temps réel</h2><p className="text-purple-400 text-sm">Historique de toutes les transactions</p></div>
            {data.activity.length === 0 ? (
              <div className="text-center py-16 text-purple-400"><Activity size={48} className="mx-auto mb-3 opacity-30" /><p>Aucune activité enregistrée</p></div>
            ) : (
              <div className="space-y-2">
                {data.activity.map(log => (
                  <div key={log.id} className="bg-purple-900/20 border border-purple-700/30 rounded-2xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${log.action === 'STAMP_ADDED' ? 'bg-purple-700/40' : log.action === 'REWARD_REDEEMED' ? 'bg-amber-700/40' : 'bg-gray-700/40'}`}>
                        {log.action === 'STAMP_ADDED' && <Star size={14} className="text-purple-400" />}
                        {log.action === 'REWARD_REDEEMED' && <Gift size={14} className="text-amber-400" />}
                        {log.action === 'RESET' && <RefreshCw size={14} className="text-gray-400" />}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">
                          {log.action === 'STAMP_ADDED' ? `Tampon ajouté (${log.stampsCount} total)` : log.action === 'REWARD_REDEEMED' ? 'Récompense utilisée' : 'Carte réinitialisée'}
                        </div>
                        <div className="text-purple-400 text-xs font-mono">{maskPhone(log.phone)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-purple-400 text-xs">{timeAgo(log.createdAt)}</div>
                      <div className="text-purple-600 text-xs">{fmtDate(log.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && <AnalyticsTab data={data} profileId={profileId} />}

        {/* CAMPAIGNS TAB */}
        {activeTab === 'campaigns' && <CampaignsTab data={data} profileId={profileId} />}

        {/* AUTOMATIONS TAB */}
        {activeTab === 'automations' && <AutomationsTab profileId={profileId} storeName={data.settings.storeName} />}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && <SettingsTab data={data} profileId={profileId} onRefresh={() => refresh(true)} />}
      </div>

      {/* Bottom Nav — scrollable on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-purple-950/95 backdrop-blur-xl border-t border-purple-800/40">
        <div className="max-w-2xl mx-auto px-1 py-2 flex overflow-x-auto gap-0.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex-shrink-0 flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-all min-w-[60px] ${isActive ? 'text-white' : 'text-purple-600 hover:text-purple-400'}`}>
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-purple-700/50' : ''}`}><Icon size={19} /></div>
                <span className="text-xs font-medium whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
