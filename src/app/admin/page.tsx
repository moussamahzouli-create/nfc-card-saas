'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, Cpu, CheckCircle, Ban, AlertTriangle, RefreshCw, Layers, ListTodo } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const kpis = data?.kpis || { total: 0, unassigned: 0, provisioned: 0, active: 0, suspended: 0, lost: 0, replaced: 0 };

  const cardsKpis = [
    { label: 'Total Cards', value: kpis.total, icon: CreditCard, color: 'text-slate-300 bg-slate-900 border-slate-800' },
    { label: 'Unassigned', value: kpis.unassigned, icon: ListTodo, color: 'text-blue-400 bg-blue-950/20 border-blue-900/50' },
    { label: 'Provisioned', value: kpis.provisioned, icon: Cpu, color: 'text-amber-400 bg-amber-950/20 border-amber-900/50' },
    { label: 'Active', value: kpis.active, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-950/20 border-emerald-900/50' },
    { label: 'Suspended', value: kpis.suspended, icon: Ban, color: 'text-red-400 bg-red-950/20 border-red-900/50' },
    { label: 'Lost', value: kpis.lost, icon: AlertTriangle, color: 'text-orange-400 bg-orange-950/20 border-orange-900/50' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Admin Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Management of physical cards and provisioning events.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded-2xl transition-all cursor-pointer text-slate-400 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {cardsKpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`p-5 rounded-3xl border ${kpi.color} space-y-4`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider block opacity-75">{kpi.label}</span>
                <Icon className="w-5 h-5 opacity-80" />
              </div>
              <span className="text-3xl font-extrabold block">{kpi.value}</span>
            </div>
          );
        })}
      </div>

      {/* Lists section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent NFC Write operations */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Recent NFC Writes</h2>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-950/50 border border-blue-900 text-blue-400 uppercase">Live Updates</span>
          </div>

          <div className="divide-y divide-slate-850 space-y-4">
            {data?.recentWrites.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">No recent write operations recorded.</p>
            ) : (
              data?.recentWrites.map((write: any) => (
                <div key={write.id} className="flex justify-between items-center pt-4 first:pt-0">
                  <div>
                    <span className="font-bold text-sm block text-white">Card #{write.card.cardNumber}</span>
                    <span className="text-xs text-slate-500 block">Device: {write.writerDevice}</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      write.status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-red-950 text-red-400 border border-red-900'
                    }`}>
                      {write.status}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">{new Date(write.writtenAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Assignments log */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Recent Assignments</h2>
          </div>

          <div className="divide-y divide-slate-850 space-y-4">
            {data?.recentAssignments.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">No assignments registered yet.</p>
            ) : (
              data?.recentAssignments.map((assign: any) => (
                <div key={assign.id} className="flex justify-between items-center pt-4 first:pt-0">
                  <div>
                    <span className="font-bold text-sm block text-white">{assign.profile?.name || assign.user.email}</span>
                    <span className="text-xs text-slate-500 block">Assigned Card: #{assign.card.cardNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">By: {assign.assignedBy ? 'Admin' : 'System'}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{new Date(assign.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
