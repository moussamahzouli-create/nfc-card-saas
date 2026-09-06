'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Check, AlertCircle, RefreshCw,
  Zap, Search, Sparkles
} from 'lucide-react';
import {
  INDUSTRY_TEMPLATES, INDUSTRY_GROUPS, type IndustryTemplate
} from '@/lib/templates/industry-templates';

/* ── Step Indicator ────────────────────────────────────── */
function StepDot({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
        done  ? 'bg-emerald-500 border-emerald-500 text-white' :
        active ? 'bg-slate-800 border-slate-800 text-white' :
                 'bg-white border-slate-200 text-slate-400'
      }`}>
        {done ? <Check className="w-4 h-4" /> : n}
      </div>
      <span className={`text-sm font-semibold hidden sm:block transition-colors ${
        active ? 'text-slate-900' : done ? 'text-emerald-600' : 'text-slate-400'
      }`}>{label}</span>
    </div>
  );
}

/* ── Mini Card Preview ─────────────────────────────────── */
function MiniCardPreview({ tpl }: { tpl: IndustryTemplate }) {
  const initials = tpl.industry.slice(0, 2).toUpperCase();
  const btnRadius = tpl.buttonStyle === 'pill' ? '9999px' : tpl.borderRadius;
  return (
    <div className="w-full h-full overflow-hidden select-none"
      style={{ background: tpl.background, fontFamily: `${tpl.font}, system-ui` }}>
      {/* Cover */}
      <div className="h-14 w-full"
        style={{ background: `linear-gradient(135deg, ${tpl.primary}70, ${tpl.accent}50)` }} />
      {/* Body */}
      <div className="flex flex-col items-center -mt-5 px-3 pb-3 gap-1">
        <div className="w-10 h-10 border-2 border-white flex items-center justify-center text-[10px] font-black shadow"
          style={{
            background: `linear-gradient(135deg, ${tpl.primary}, ${tpl.accent})`,
            color: tpl.background,
            borderRadius: tpl.avatarShape === 'circle' ? '9999px' : tpl.avatarShape === 'rounded' ? '8px' : '4px',
          }}>
          {initials}
        </div>
        <p className="text-[9px] font-black leading-tight text-center" style={{ color: tpl.text, fontFamily: `${tpl.headingFont}, system-ui` }}>
          {tpl.industry}
        </p>
        <p className="text-[8px] font-semibold" style={{ color: tpl.primary }}>{tpl.name}</p>
        <div className="flex gap-1 w-full mt-1">
          {['Book', 'Call'].map(l => (
            <div key={l} className="flex-1 text-center text-[7px] font-bold py-1"
              style={tpl.buttonStyle === 'outlined'
                ? { border: `1px solid ${tpl.primary}`, color: tpl.primary, borderRadius: btnRadius }
                : { background: tpl.primary, color: tpl.background, borderRadius: btnRadius }}>
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Industry Group Card ───────────────────────────────── */
function IndustryCard({ group, selected, onClick, count }: {
  group: typeof INDUSTRY_GROUPS[0]; selected: boolean; onClick: () => void; count: number;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-center hover:shadow-md cursor-pointer ${
        selected
          ? 'border-slate-800 bg-slate-800 text-white shadow-lg'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900'
      }`}>
      <span className="text-2xl">{group.icon}</span>
      <div>
        <p className={`text-xs font-bold leading-tight ${selected ? 'text-white' : 'text-slate-800'}`}>{group.label}</p>
        <p className={`text-[10px] mt-0.5 ${selected ? 'text-slate-300' : 'text-slate-400'}`}>{count} templates</p>
      </div>
      {selected && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  );
}

/* ── Template Card ─────────────────────────────────────── */
function TemplateCard({ tpl, selected, onSelect }: {
  tpl: IndustryTemplate; selected: boolean; onSelect: () => void;
}) {
  return (
    <button type="button" onClick={onSelect}
      className={`relative flex flex-col rounded-2xl border-2 overflow-hidden text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer ${
        selected ? 'border-slate-800 shadow-xl -translate-y-0.5' : 'border-slate-200 hover:border-slate-400'
      }`}>
      {selected && (
        <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      {tpl.isRecommended && !selected && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 border border-amber-200 text-amber-700 text-[9px] font-bold shadow-sm">
          <Sparkles className="w-2.5 h-2.5" /> Best
        </div>
      )}
      <div className="h-32 overflow-hidden">
        <MiniCardPreview tpl={tpl} />
      </div>
      <div className="px-3 py-2.5 bg-white border-t border-slate-100">
        <p className="text-xs font-bold text-slate-800 truncate">{tpl.name}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{tpl.industry}</p>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {tpl.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-500">{tag}</span>
          ))}
        </div>
      </div>
    </button>
  );
}

/* ── Input helper ──────────────────────────────────────── */
const inp = 'w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 text-slate-900 text-sm outline-none transition-all placeholder-slate-400';

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function CreateProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null);
  const [templateSearch, setTemplateSearch] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-slug
  useEffect(() => {
    if (!slugTouched && firstName) {
      setSlug(`${firstName} ${lastName}`.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  }, [firstName, lastName, slugTouched]);

  const groupCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of INDUSTRY_TEMPLATES) c[t.industryGroup] = (c[t.industryGroup] || 0) + 1;
    return c;
  }, []);

  const filtered = useMemo(() => {
    let list = INDUSTRY_TEMPLATES.filter(t => t.isPublished);
    if (selectedGroup) list = list.filter(t => t.industryGroup === selectedGroup);
    if (templateSearch.trim()) {
      const q = templateSearch.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.industry.toLowerCase().includes(q) || t.tags.some(tag => tag.includes(q)));
    }
    return list;
  }, [selectedGroup, templateSearch]);

  const handleCreate = useCallback(async () => {
    if (!firstName.trim() || !slug.trim()) { setError('First name and URL slug are required.'); return; }
    if (!/^[a-z0-9-_]+$/.test(slug)) { setError('Slug: lowercase letters, numbers, hyphens only.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: [firstName, lastName].filter(Boolean).join(' '),
          slug, type: 'PERSONAL', jobTitle, company,
          templateId: selectedTemplate?.id,
          appearanceJson: selectedTemplate ? JSON.stringify({
            templateId: selectedTemplate.id,
            primaryColor: selectedTemplate.primary,
            backgroundColor: selectedTemplate.background,
            secondaryColor: selectedTemplate.secondary,
            accentColor: selectedTemplate.accent,
            fontFamily: selectedTemplate.font,
            headingFont: selectedTemplate.headingFont,
            buttonStyle: selectedTemplate.buttonStyle,
            cardStyle: selectedTemplate.cardStyle,
            borderRadius: selectedTemplate.borderRadius,
            headerStyle: selectedTemplate.headerStyle,
            avatarShape: selectedTemplate.avatarShape,
            animation: selectedTemplate.animation,
          }) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create.'); return; }
      router.push(`/dashboard/profiles/${data.id}/edit`);
    } catch { setError('Network error. Try again.'); }
    finally { setLoading(false); }
  }, [firstName, lastName, slug, jobTitle, company, selectedTemplate, router]);

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Progress Bar ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/dashboard/profiles"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:block">Back</span>
          </Link>
          <div className="flex items-center gap-3">
            <StepDot n={1} label="Industry" active={step === 1} done={step > 1} />
            <div className={`w-10 h-0.5 rounded transition-colors ${step > 1 ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            <StepDot n={2} label="Template" active={step === 2} done={step > 2} />
            <div className={`w-10 h-0.5 rounded transition-colors ${step > 2 ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            <StepDot n={3} label="Details" active={step === 3} done={false} />
          </div>
          <div className="w-16" />
        </div>
      </div>

      {/* ══ STEP 1 — INDUSTRY ══ */}
      {step === 1 && (
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">What's your business type?</h1>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">Choose your industry to see the best templates for you.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {INDUSTRY_GROUPS.map(g => (
              <IndustryCard key={g.id} group={g} selected={selectedGroup === g.id}
                onClick={() => setSelectedGroup(p => p === g.id ? '' : g.id)}
                count={groupCounts[g.id] || 0} />
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-3">
            <button type="button" onClick={() => setStep(2)}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
              {selectedGroup ? `Browse ${INDUSTRY_GROUPS.find(g => g.id === selectedGroup)?.label} Templates` : 'Browse All Templates'}
              <ArrowRight className="w-4 h-4" />
            </button>
            {!selectedGroup && <p className="text-xs text-slate-400">You can also skip and browse all 30+ templates</p>}
          </div>
        </div>
      )}

      {/* ══ STEP 2 — TEMPLATE ══ */}
      {step === 2 && (
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Choose a template</h1>
              <p className="text-slate-500 text-sm mt-1">
                {selectedGroup ? `${INDUSTRY_GROUPS.find(g => g.id === selectedGroup)?.label}` : 'All templates'} — {filtered.length} available
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-slate-400 w-52 transition-colors"
                placeholder="Search…" value={templateSearch} onChange={e => setTemplateSearch(e.target.value)} />
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button type="button" onClick={() => setSelectedGroup('')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${!selectedGroup ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
              All
            </button>
            {INDUSTRY_GROUPS.filter(g => groupCounts[g.id]).map(g => (
              <button key={g.id} type="button" onClick={() => setSelectedGroup(g.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${selectedGroup === g.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
                {g.icon} {g.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(tpl => (
              <TemplateCard key={tpl.id} tpl={tpl}
                selected={selectedTemplate?.id === tpl.id}
                onSelect={() => setSelectedTemplate(p => p?.id === tpl.id ? null : tpl)} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <p className="text-lg font-semibold">No templates found</p>
              <button onClick={() => { setTemplateSearch(''); setSelectedGroup(''); }} className="mt-2 text-sm underline">Clear filters</button>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between">
            <button type="button" onClick={() => setStep(1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-slate-400 transition-all">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-3">
              {selectedTemplate && (
                <span className="text-sm text-slate-600 font-medium hidden sm:block">✓ <strong>{selectedTemplate.name}</strong></span>
              )}
              <button type="button" onClick={() => setStep(3)} disabled={!selectedTemplate}
                className={`flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm transition-all ${selectedTemplate ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="text-center mt-4">
            <button type="button" onClick={() => setStep(3)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors underline">
              Skip and continue without a template
            </button>
          </div>
        </div>
      )}

      {/* ══ STEP 3 — DETAILS ══ */}
      {step === 3 && (
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Selected template summary */}
          {selectedTemplate && (
            <div className="mb-6 p-4 rounded-2xl border border-slate-200 bg-white flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                <MiniCardPreview tpl={selectedTemplate} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Template</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{selectedTemplate.name}</p>
                <p className="text-xs text-slate-500">{selectedTemplate.industry}</p>
              </div>
              <button type="button" onClick={() => setStep(2)} className="text-xs text-slate-500 hover:text-slate-900 underline shrink-0">Change</button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-1">Your details</h2>
            <p className="text-sm text-slate-500 mb-7">You can update everything later in the editor.</p>

            {error && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-5">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">First Name *</label>
                  <input className={inp} placeholder="Ahmed" value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Last Name</label>
                  <input className={inp} placeholder="Al-Rashid" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Job Title</label>
                <input className={inp} placeholder={selectedTemplate ? `e.g. ${selectedTemplate.industry}` : 'CEO, Doctor, Designer…'}
                  value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Company / Business</label>
                <input className={inp} placeholder="Acme Corp" value={company} onChange={e => setCompany(e.target.value)} />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Public Card URL *</label>
                <div className="flex items-center border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-slate-400 rounded-xl overflow-hidden transition-all">
                  <span className="px-3 py-3 text-xs font-mono text-slate-400 bg-slate-100 border-r border-slate-200 select-none whitespace-nowrap">/c/</span>
                  <input className="flex-1 px-3 py-3 bg-transparent outline-none text-slate-900 placeholder-slate-400 font-mono text-sm"
                    placeholder="your-name" value={slug}
                    onChange={e => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '')); setSlugTouched(true); }} />
                  <button type="button" onClick={() => {
                    const b = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    setSlug(b + '-' + Math.random().toString(36).slice(2, 5));
                    setSlugTouched(true);
                  }} className="px-3 py-3 text-slate-400 hover:text-slate-700 transition-colors" title="Auto-generate">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 font-mono mt-1">connectcard.io/c/{slug || 'your-slug'}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-slate-400 transition-all">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button type="button" onClick={handleCreate}
                disabled={loading || !firstName.trim() || !slug.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 text-white font-extrabold text-sm hover:bg-slate-800 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                {loading
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Creating…</>
                  : <><Zap className="w-4 h-4" /> Create Card & Open Editor</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
