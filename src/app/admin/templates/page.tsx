'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Filter, Sparkles, Eye, Edit2, Copy,
  CheckCircle, XCircle, Trash2, Star, Globe
} from 'lucide-react';
import { INDUSTRY_TEMPLATES, INDUSTRY_GROUPS, type IndustryTemplate } from '@/lib/templates/industry-templates';

/* ── Mini Preview ──────────────────────────────── */
function TemplatePreview({ tpl }: { tpl: IndustryTemplate }) {
  const initials = tpl.industry.slice(0, 2).toUpperCase();
  const btnRadius = tpl.buttonStyle === 'pill' ? '9999px' : tpl.borderRadius;
  return (
    <div className="w-full h-full overflow-hidden" style={{ background: tpl.background, fontFamily: `${tpl.font}, system-ui` }}>
      <div className="h-16 relative" style={{ background: `linear-gradient(135deg, ${tpl.primary}60, ${tpl.accent}40)` }}>
        {(tpl.headerStyle === 'hero' || tpl.headerStyle === 'cover') && (
          <div className="absolute inset-0 bg-black/20" />
        )}
      </div>
      <div className="flex flex-col items-center -mt-5 px-3 pb-3 gap-1">
        <div className="w-10 h-10 border-2 border-white flex items-center justify-center text-[10px] font-black shadow-md"
          style={{
            background: `linear-gradient(135deg, ${tpl.primary}, ${tpl.accent})`,
            color: tpl.background,
            borderRadius: tpl.avatarShape === 'circle' ? '9999px' : tpl.avatarShape === 'rounded' ? '8px' : '4px',
          }}>
          {initials}
        </div>
        <p className="text-[9px] font-black" style={{ color: tpl.text }}>{tpl.industry}</p>
        <p className="text-[8px] font-semibold" style={{ color: tpl.primary }}>{tpl.name}</p>
        <div className="flex gap-1 w-full mt-1">
          {['Book', 'Call'].map(label => (
            <div key={label} className="flex-1 text-center text-[7px] font-bold py-1"
              style={tpl.buttonStyle === 'outlined'
                ? { border: `1px solid ${tpl.primary}`, color: tpl.primary, borderRadius: btnRadius }
                : { background: tpl.primary, color: tpl.background, borderRadius: btnRadius }}>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Template Grid Card ────────────────────────── */
function AdminTemplateCard({ tpl, onDuplicate }: { tpl: IndustryTemplate; onDuplicate: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Preview */}
      <div className="h-40 relative overflow-hidden">
        <TemplatePreview tpl={tpl} />

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-slate-900/60 flex items-center justify-center gap-2 transition-all duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <Link href={`/admin/templates/${tpl.id}/edit`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors">
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </Link>
          <button onClick={onDuplicate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/20 text-white text-xs font-bold hover:bg-white/30 transition-colors border border-white/30">
            <Copy className="w-3.5 h-3.5" /> Duplicate
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {tpl.isRecommended && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-900 text-[9px] font-bold">
              <Star className="w-2.5 h-2.5" /> Best
            </span>
          )}
          {tpl.isPublished ? (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold">
              <CheckCircle className="w-2.5 h-2.5" /> Live
            </span>
          ) : (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-bold">
              <XCircle className="w-2.5 h-2.5" /> Draft
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800 truncate">{tpl.name}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{tpl.industry}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {/* Color dots */}
            {[tpl.primary, tpl.accent, tpl.background].map((c, i) => (
              <div key={i} className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ background: c }} />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {tpl.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-500">
              {tag}
            </span>
          ))}
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <span className="text-[10px] font-mono text-slate-400">{tpl.id}</span>
          <div className="flex items-center gap-1">
            <Link href={`/admin/templates/${tpl.id}/preview`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <Eye className="w-3.5 h-3.5" />
            </Link>
            <Link href={`/admin/templates/${tpl.id}/edit`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </Link>
            <button onClick={onDuplicate}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN PAGE ─────────────────────────────────── */
export default function AdminTemplatesPage() {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [styleFilter, setStyleFilter] = useState('');

  const filtered = useMemo(() => {
    let list = INDUSTRY_TEMPLATES;
    if (groupFilter) list = list.filter(t => t.industryGroup === groupFilter);
    if (styleFilter === 'dark') list = list.filter(t => t.background < '#888888');
    else if (styleFilter === 'light') list = list.filter(t => t.background >= '#888888');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.industry.toLowerCase().includes(q) || t.tags.some(tag => tag.includes(q)));
    }
    return list;
  }, [search, groupFilter, styleFilter]);

  const stats = {
    total: INDUSTRY_TEMPLATES.length,
    published: INDUSTRY_TEMPLATES.filter(t => t.isPublished).length,
    recommended: INDUSTRY_TEMPLATES.filter(t => t.isRecommended).length,
    industries: new Set(INDUSTRY_TEMPLATES.map(t => t.industryGroup)).size,
  };

  return (
    <div className="p-6 space-y-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Templates</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage industry templates for your customers</p>
        </div>
        <Link href="/admin/templates/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> Create Template
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Templates', value: stats.total, color: 'text-slate-900' },
          { label: 'Published',       value: stats.published, color: 'text-emerald-600' },
          { label: 'Recommended',     value: stats.recommended, color: 'text-amber-600' },
          { label: 'Industries',      value: stats.industries, color: 'text-blue-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4">
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-slate-400 w-56 transition-colors"
            placeholder="Search templates…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-slate-400 appearance-none cursor-pointer"
          value={groupFilter}
          onChange={e => setGroupFilter(e.target.value)}
        >
          <option value="">All Industries</option>
          {INDUSTRY_GROUPS.map(g => (
            <option key={g.id} value={g.id}>{g.icon} {g.label}</option>
          ))}
        </select>

        <select
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-slate-400 appearance-none cursor-pointer"
          value={styleFilter}
          onChange={e => setStyleFilter(e.target.value)}
        >
          <option value="">All Styles</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>

        <span className="text-sm text-slate-400 ml-auto">
          {filtered.length} of {stats.total} templates
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map(tpl => (
          <AdminTemplateCard
            key={tpl.id}
            tpl={tpl}
            onDuplicate={() => alert(`Duplicate: ${tpl.name}`)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg font-semibold">No templates match your filters</p>
          <button onClick={() => { setSearch(''); setGroupFilter(''); setStyleFilter(''); }}
            className="mt-3 text-sm text-slate-500 hover:text-slate-900 underline">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
