'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  LayoutTemplate, CheckCircle, AlertTriangle, RefreshCw,
  Search, ExternalLink, Sliders, Sparkles, Check
} from 'lucide-react';
import {
  INDUSTRY_TEMPLATES, INDUSTRY_GROUPS, type IndustryTemplate
} from '@/lib/templates/industry-templates';

/* ── Mini Card Preview ── */
function MiniCardPreview({ tpl }: { tpl: IndustryTemplate }) {
  const initials = tpl.industry.slice(0, 2).toUpperCase();
  const btnRadius = tpl.buttonStyle === 'pill' ? '9999px' : tpl.borderRadius;
  return (
    <div className="w-full h-full overflow-hidden select-none flex flex-col justify-between"
      style={{ background: tpl.background, fontFamily: `${tpl.font}, system-ui` }}>
      {/* Cover */}
      <div className="h-16 w-full relative"
        style={{ background: `linear-gradient(135deg, ${tpl.primary}85, ${tpl.accent}60)` }}>
        <div className="absolute top-2 right-2 text-[8px] font-bold px-2 py-0.5 rounded-full bg-black/30 text-white backdrop-blur-sm">
          {tpl.industry}
        </div>
      </div>
      {/* Body */}
      <div className="flex flex-col items-center -mt-6 px-4 pb-4 gap-1.5 flex-1 justify-between">
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 border-2 border-white flex items-center justify-center text-xs font-black shadow-md"
            style={{
              background: `linear-gradient(135deg, ${tpl.primary}, ${tpl.accent})`,
              color: '#FFFFFF',
              borderRadius: tpl.avatarShape === 'circle' ? '9999px' : tpl.avatarShape === 'rounded' ? '10px' : '4px',
            }}>
            {initials}
          </div>
          <p className="text-[11px] font-black leading-tight text-center mt-1" style={{ color: tpl.text, fontFamily: `${tpl.headingFont}, system-ui` }}>
            {tpl.name}
          </p>
          <p className="text-[9px] font-semibold opacity-75" style={{ color: tpl.primary }}>
            {tpl.industry}
          </p>
        </div>

        <div className="flex gap-1.5 w-full mt-2">
          {['Connect', 'Save'].map((l, i) => (
            <div key={l} className="flex-1 text-center text-[8px] font-bold py-1.5 shadow-sm"
              style={i === 0
                ? (tpl.buttonStyle === 'outlined'
                    ? { border: `1.5px solid ${tpl.primary}`, color: tpl.primary, borderRadius: btnRadius }
                    : { background: tpl.primary, color: '#FFFFFF', borderRadius: btnRadius })
                : { background: `${tpl.primary}15`, color: tpl.primary, borderRadius: btnRadius }}>
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TemplatesSelector() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profiles');
      if (res.ok) {
        const list = await res.json();
        setProfiles(list);
        if (list.length > 0 && !selectedProfileId) {
          setSelectedProfileId(list[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  const filteredTemplates = useMemo(() => {
    return INDUSTRY_TEMPLATES.filter(tpl => {
      const matchesGroup = selectedGroup === 'all' || tpl.industryGroup === selectedGroup;
      const matchesSearch = !search ||
        tpl.name.toLowerCase().includes(search.toLowerCase()) ||
        tpl.industry.toLowerCase().includes(search.toLowerCase()) ||
        tpl.description.toLowerCase().includes(search.toLowerCase()) ||
        tpl.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      return matchesGroup && matchesSearch;
    });
  }, [selectedGroup, search]);

  const handleApplyTemplate = async (tpl: IndustryTemplate) => {
    if (!selectedProfileId) {
      setError('Please select or create a profile first to apply a template.');
      return;
    }
    setError(null);
    setMessage(null);
    setApplyingId(tpl.id);

    try {
      const appearancePayload = {
        templateId: tpl.id,
        name: tpl.name,
        background: tpl.background,
        surface: tpl.surface,
        primary: tpl.primary,
        secondary: tpl.secondary,
        accent: tpl.accent,
        text: tpl.text,
        muted: tpl.muted,
        border: tpl.border,
        font: tpl.font,
        headingFont: tpl.headingFont,
        buttonStyle: tpl.buttonStyle,
        cardStyle: tpl.cardStyle,
        borderRadius: tpl.borderRadius,
        headerStyle: tpl.headerStyle,
        avatarShape: tpl.avatarShape,
        animation: tpl.animation,
      };

      const res = await fetch(`/api/profiles/${selectedProfileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: tpl.id,
          appearanceJson: JSON.stringify(appearancePayload),
        }),
      });

      if (res.ok) {
        setMessage(`Applied "${tpl.name}" design to profile "${selectedProfile?.name || ''}" successfully!`);
        // Refresh profiles to reflect current template
        fetchProfiles();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to apply template.');
      }
    } catch {
      setError('Connection failure. Please try again.');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <LayoutTemplate className="w-8 h-8 text-[#8A509E]" />
            <span>Design Templates</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Choose from curated professional industry styles with live colors, fonts, and action layouts.
          </p>
        </div>
        <button
          onClick={fetchProfiles}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-slate-800 dark:hover:text-white shadow-sm flex items-center gap-2 text-xs font-semibold cursor-pointer w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Profile Selector Banner */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Target Profile for Template Application
          </label>
          {profiles.length > 0 ? (
            <div className="flex items-center gap-3">
              <select
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-[#8A509E]"
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.slug})</option>
                ))}
              </select>
              {selectedProfile && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/c/${selectedProfile.slug}`}
                    target="_blank"
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Card</span>
                  </Link>
                  <Link
                    href={`/dashboard/profiles/${selectedProfile.id}/builder`}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#8A509E]/10 text-[#8A509E] text-xs font-semibold hover:bg-[#8A509E]/20 transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Open in Builder</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-amber-600 font-medium">
              No profiles found.{' '}
              <Link href="/dashboard/profiles/new" className="underline font-bold">
                Create your first profile
              </Link>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates, industries…"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#8A509E]"
          />
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold rounded-2xl text-xs flex items-center justify-between gap-2 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
          {selectedProfile && (
            <Link
              href={`/c/${selectedProfile.slug}`}
              target="_blank"
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition-colors inline-flex items-center gap-1"
            >
              <span>View Live</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold rounded-2xl text-xs flex items-center gap-2 animate-fade-in shadow-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedGroup('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedGroup === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-400'
          }`}
        >
          All Templates ({INDUSTRY_TEMPLATES.length})
        </button>
        {INDUSTRY_GROUPS.map(g => {
          const count = INDUSTRY_TEMPLATES.filter(t => t.industryGroup === g.id).length;
          if (count === 0) return null;
          const isSelected = selectedGroup === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setSelectedGroup(g.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-400'
              }`}
            >
              <span>{g.icon}</span>
              <span>{g.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Templates Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((tpl) => {
          const isApplying = applyingId === tpl.id;
          const isCurrent = selectedProfile?.templateId === tpl.id;
          return (
            <div
              key={tpl.id}
              className={`bg-white dark:bg-slate-900 border-2 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                isCurrent
                  ? 'border-[#8A509E] ring-2 ring-[#8A509E]/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
              }`}
            >
              {/* Preview header */}
              <div className="h-56 relative bg-slate-100 border-b border-slate-100 dark:border-slate-800">
                <MiniCardPreview tpl={tpl} />
                {tpl.isRecommended && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/95 text-amber-600 border border-amber-200 text-[10px] font-black shadow-sm backdrop-blur-sm">
                    <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                    <span>Featured</span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#8A509E] text-white text-[10px] font-black shadow-md">
                    <Check className="w-3 h-3" />
                    <span>Active</span>
                  </div>
                )}
              </div>

              {/* Template details */}
              <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{tpl.name}</h3>
                      <p className="text-[11px] font-semibold text-[#8A509E] mt-0.5">{tpl.industry}</p>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                      {tpl.buttonStyle}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>

                  {/* Swatches */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <div className="w-4 h-4 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: tpl.primary }} title="Primary" />
                    <div className="w-4 h-4 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: tpl.accent }} title="Accent" />
                    <div className="w-4 h-4 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: tpl.background }} title="Background" />
                    <span className="text-[10px] font-mono text-slate-400 ml-1.5 uppercase">{tpl.font}</span>
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  disabled={isApplying || !selectedProfileId}
                  className={`w-full py-3 px-4 font-bold text-xs rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-default'
                      : 'bg-slate-900 hover:bg-[#8A509E] text-white dark:bg-white dark:text-slate-900 dark:hover:bg-[#8A509E] dark:hover:text-white'
                  }`}
                >
                  {isApplying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Applying…</span>
                    </>
                  ) : isCurrent ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Currently Applied</span>
                    </>
                  ) : (
                    <>
                      <LayoutTemplate className="w-4 h-4" />
                      <span>Apply Template</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

