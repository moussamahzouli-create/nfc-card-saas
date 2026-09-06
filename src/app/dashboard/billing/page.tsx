'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, Shield, Receipt, Download, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export default function BillingDashboard() {
  const [report, setReport] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const [resSub, resInvoices] = await Promise.all([
        fetch('/api/billing/subscription'),
        fetch('/api/billing/invoices')
      ]);
      if (resSub.ok) setReport(await resSub.json());
      if (resInvoices.ok) setInvoices(await resInvoices.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription renewal? You will retain access until the current period ends.')) {
      return;
    }
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/billing/cancel', { method: 'POST' });
      if (res.ok) {
        setMessage('Subscription cancellation scheduled successfully.');
        fetchBillingData();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to cancel subscription.');
      }
    } catch (e) {
      setError('Connection error');
    }
  };

  if (loading && !report) {
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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Billing & Subscription</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your active SaaS plan, usage capacity, and check receipts.</p>
        </div>
        <button
          onClick={fetchBillingData}
          className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-2xl transition-all cursor-pointer text-slate-500 dark:text-slate-400"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2 animate-pulse">
          <CheckCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-bold rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Billing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plan & Usage */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Active Plan</span>
                <h3 className="text-xl font-black text-slate-800 dark:text-white capitalize">{report?.planName.toLowerCase()} Plan</h3>
              </div>
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase rounded-full">
                Active
              </span>
            </div>

            {/* Usage meters */}
            <div className="space-y-4 text-xs font-bold">
              {/* Profile progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Profile Slots Used</span>
                  <span>{report?.profilesUsed} / {report?.maxProfiles === -1 ? '∞' : report?.maxProfiles}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${report?.maxProfiles === -1 ? 100 : (report?.profilesUsed / report?.maxProfiles) * 100}%` }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>

              {/* Card progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Physical Cards Assigned</span>
                  <span>{report?.cardsUsed} / {report?.maxCards}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(report?.cardsUsed / report?.maxCards) * 100}%` }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Upgrade/Cancel triggers */}
            <div className="flex flex-wrap gap-4 text-xs font-bold pt-4 border-t border-slate-100 dark:border-slate-850">
              <a
                href="/pricing"
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all"
              >
                Change Plan / Upgrade
              </a>
              {report?.planName !== 'FREE' && (
                <button
                  onClick={handleCancelSubscription}
                  className="px-5 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl cursor-pointer transition-all border border-red-200 dark:border-red-900"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Invoice list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
              <Receipt className="w-4.5 h-4.5 text-blue-500" />
              <span>Invoices History</span>
            </h3>

            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex justify-between items-center text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl"
                >
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">{inv.invoiceNumber}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{new Date(inv.issuedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-800 dark:text-white">${(inv.total / 100).toFixed(2)}</span>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Invoice details generation is ready for export.');
                      }}
                      className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-slate-100"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
              {invoices.length === 0 && (
                <p className="text-slate-500 text-xs text-center py-10">No invoices generated yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
