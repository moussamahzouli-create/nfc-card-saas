'use client';

import React, { useEffect, useState } from 'react';
import { LayoutTemplate, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { templatesList } from '@/lib/templates/templates';

export default function TemplatesSelector() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profiles');
      if (res.ok) {
        const list = await res.json();
        setProfiles(list);
        if (list.length > 0) setSelectedProfileId(list[0].id);
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

  const handleApplyTemplate = async (templateId: string) => {
    if (!selectedProfileId) {
      setError('Please create a profile first to apply template styles.');
      return;
    }
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/profiles/${selectedProfileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
        }),
      });

      if (res.ok) {
        setMessage(`Applied ${templateId} style layout to selected profile successfully.`);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to apply template.');
      }
    } catch (e) {
      setError('Connection failure.');
    }
  };

  if (loading && profiles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Design Templates</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Select and apply responsive custom stylesheets layouts.</p>
        </div>
        <button
          onClick={fetchProfiles}
          className="p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-slate-500 hover:bg-slate-200"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-600 font-bold rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 font-bold rounded-2xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {profiles.length > 0 && (
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl max-w-sm shadow-sm space-y-2">
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Select Profile to Customize</label>
          <select
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none"
          >
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.slug})</option>
            ))}
          </select>
        </div>
      )}

      {/* Templates Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templatesList.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-extrabold text-slate-850 dark:text-white">{tpl.name}</h3>
                <span className="text-[9px] font-black uppercase bg-blue-50 dark:bg-blue-950 text-blue-600 px-2 py-0.5 rounded border border-blue-200">
                  {tpl.buttonStyle}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{tpl.description}</p>
            </div>

            {/* Config Specs Visual */}
            <div className="flex gap-2 items-center">
              <div className="w-5 h-5 rounded-full border border-slate-200" style={{ backgroundColor: tpl.primaryColor }} title="Primary Color" />
              <div className="w-5 h-5 rounded-full border border-slate-200" style={{ backgroundColor: tpl.secondaryColor }} title="Secondary Color" />
              <div className="w-5 h-5 rounded-full border border-slate-200" style={{ backgroundColor: tpl.backgroundColor }} title="Background" />
              <span className="text-[10px] text-slate-400 font-bold block ml-1.5 uppercase">{tpl.fontFamily}</span>
            </div>

            <button
              onClick={() => handleApplyTemplate(tpl.id)}
              className="w-full py-3 bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <LayoutTemplate className="w-4 h-4" />
              <span>Apply Template</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
