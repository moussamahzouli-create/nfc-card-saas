'use client';

import React, { useEffect, useState } from 'react';
import { Mail, CheckCircle, ShieldAlert, RefreshCw, Search } from 'lucide-react';

export default function AdminContactMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter) query.set('status', statusFilter);
      const res = await fetch(`/api/admin/contact?${query.toString()}`);
      if (res.ok) setMessages(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSuccessMsg('Message status updated successfully.');
        fetchMessages();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to update message status.');
      }
    } catch (e) {
      setErrorMsg('Connection error');
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Contact Messages</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review contact inbox queries and filter spam reports.</p>
        </div>
        <button
          onClick={fetchMessages}
          className="p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-slate-500 hover:bg-slate-200"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-600 font-bold rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 font-bold rounded-2xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter strip */}
      <div className="w-full sm:w-48">
        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Filter by Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none"
        >
          <option value="">All Inquiries</option>
          <option value="NEW">NEW</option>
          <option value="READ">READ</option>
          <option value="REPLIED">REPLIED</option>
          <option value="CLOSED">CLOSED</option>
          <option value="SPAM">SPAM</option>
        </select>
      </div>

      {/* Messages list */}
      {loading && messages.length === 0 ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl text-xs text-slate-400">
          No contact messages in this folder.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col md:flex-row justify-between gap-6"
            >
              <div className="space-y-3 flex-grow">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-850 dark:text-white">{msg.subject}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                    msg.status === 'NEW'
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : msg.status === 'SPAM'
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-slate-100 border-slate-250 text-slate-600'
                  }`}>
                    {msg.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <span className="block font-semibold">From: {msg.name} ({msg.email}) {msg.phone ? `| Tel: ${msg.phone}` : ''}</span>
                  <span className="block text-[10px]">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-850 rounded-2xl">
                  {msg.message}
                </p>
              </div>

              {/* Action transitions */}
              <div className="flex md:flex-col gap-2 justify-end items-end text-xs">
                <select
                  value={msg.status}
                  onChange={(e) => handleUpdateStatus(msg.id, e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                >
                  <option value="NEW">NEW</option>
                  <option value="READ">READ</option>
                  <option value="REPLIED">REPLIED</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="SPAM">SPAM</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
