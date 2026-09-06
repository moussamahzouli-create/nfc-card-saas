'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, Calendar, FileDown, Smartphone, Globe, Laptop, ChevronDown, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [range, setRange] = useState('7d');
  const [selectedCardId, setSelectedCardId] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState('');

  const fetchFilters = async () => {
    try {
      const [resCards, resProfiles] = await Promise.all([
        fetch('/api/cards'),
        fetch('/api/profiles')
      ]);
      if (resCards.ok) setCards(await resCards.json());
      if (resProfiles.ok) setProfiles(await resProfiles.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        range,
        cardId: selectedCardId,
        profileId: selectedProfileId,
      });
      const res = await fetch(`/api/analytics?${query.toString()}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [range, selectedCardId, selectedProfileId]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const timeline = data?.timeline || [];
  const totalViews = data?.totalViews || 0;
  const viewsToday = data?.viewsToday || 0;
  const events = data?.events || [];
  const devices = data?.devices || [];
  const countries = data?.countries || [];
  const browsers = data?.browsers || [];

  // Find max value in timeline for scaling graph
  const maxTimelineCount = timeline.length > 0 ? Math.max(...timeline.map((t: any) => t.count)) : 1;

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track visitor interactions, click counts, and coarse user demographics.</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/api/analytics/export"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 font-bold text-sm transition-all text-slate-850 dark:text-slate-200"
          >
            <FileDown className="w-4 h-4 text-blue-500" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={fetchAnalytics}
            className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-2xl transition-all cursor-pointer text-slate-500 dark:text-slate-400"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-sm">
        {/* Date Filter */}
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Date Range</label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300 font-semibold"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        {/* Card Filter */}
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Filter by Card</label>
          <select
            value={selectedCardId}
            onChange={(e) => setSelectedCardId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300 font-semibold"
          >
            <option value="">All Physical Cards</option>
            {cards.map(c => (
              <option key={c.id} value={c.id}>Card #{c.cardNumber}</option>
            ))}
          </select>
        </div>

        {/* Profile Filter */}
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Filter by Profile</label>
          <select
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300 font-semibold"
          >
            <option value="">All Profiles</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Graphs */}
      {timeline.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
          <BarChart3 className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No analytics yet</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
            Scan your physical card or share your profile link to begin accumulating analytics insights.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Views Histogram */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 space-y-6 shadow-sm">
            <div>
              <h2 className="text-lg font-extrabold text-slate-850 dark:text-white">Views Timeline</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Track visitor views trends over the selected timeframe.</p>
            </div>

            {/* Custom Histogram Chart */}
            <div className="h-60 flex items-end justify-between gap-2 pt-6 border-b border-slate-100 dark:border-slate-850">
              {timeline.map((item: any, idx: number) => {
                const percent = (item.count / maxTimelineCount) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-950 text-white text-[9px] font-bold py-1 px-2 rounded shadow-lg whitespace-nowrap z-20">
                      {item.count} views
                    </div>
                    {/* Bar */}
                    <div
                      style={{ height: `${percent}%` }}
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-lg min-h-[6px] group-hover:from-blue-500 group-hover:to-blue-400 transition-all cursor-pointer"
                    />
                    {/* Date */}
                    <span className="text-[8px] text-slate-400 mt-2 rotate-45 origin-left truncate max-w-[32px] block">
                      {item.date.split('-').slice(1).join('/')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Clicks Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 space-y-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-850 dark:text-white">Actions Breakdown</h2>
            
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {events.filter((e: any) => e.type !== 'profile_view').map((evt: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500 capitalize">{evt.type.replace(/_CLICK|_/g, ' ').toLowerCase()}</span>
                  <span className="font-extrabold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-xl">
                    {evt.count}
                  </span>
                </div>
              ))}
              {events.filter((e: any) => e.type !== 'profile_view').length === 0 && (
                <p className="text-slate-500 text-xs text-center py-10">No button clicks recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Demographics & device types grid */}
      {timeline.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Devices */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 space-y-4 shadow-sm text-xs font-semibold">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-blue-500" />
              <span>Devices</span>
            </h3>
            <div className="space-y-3">
              {devices.map((d: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span className="text-slate-400">{d.name}</span>
                  <span className="text-slate-850 dark:text-white font-bold">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 space-y-4 shadow-sm text-xs font-semibold">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>Coarse Geography</span>
            </h3>
            <div className="space-y-3">
              {countries.map((c: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span className="text-slate-400">{c.name === 'Unknown' ? 'International' : c.name}</span>
                  <span className="text-slate-850 dark:text-white font-bold">{c.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Browsers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 space-y-4 shadow-sm text-xs font-semibold">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-500" />
              <span>Browsers</span>
            </h3>
            <div className="space-y-3">
              {browsers.map((b: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span className="text-slate-400">{b.name}</span>
                  <span className="text-slate-850 dark:text-white font-bold">{b.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
