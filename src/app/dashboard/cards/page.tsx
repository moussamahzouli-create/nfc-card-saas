'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, Copy, Download, AlertTriangle, CheckCircle, RefreshCw, QrCode } from 'lucide-react';
import { generateCardUrl } from '@/lib/nfc/url';

export default function CustomerCards() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerCards = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cards');
      if (res.ok) {
        setCards(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerCards();
  }, []);

  const handleCopyUrl = (publicToken: string) => {
    const url = generateCardUrl(publicToken);
    navigator.clipboard.writeText(url);
    setMessage('NFC Public URL copied to clipboard!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleReportLost = async (cardId: string) => {
    if (!confirm('Are you sure you want to report this card as LOST? This will immediately suspend profile resolution.')) {
      return;
    }
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/cards/${cardId}/lost`, {
        method: 'POST',
      });
      if (res.ok) {
        setMessage('Card reported lost successfully.');
        fetchCustomerCards();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to report card lost.');
      }
    } catch (e) {
      setError('Connection failure.');
    }
  };

  if (loading) {
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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">My NFC Cards</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your active physical digital business cards.</p>
        </div>
        <button
          onClick={fetchCustomerCards}
          className="p-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all cursor-pointer text-slate-500 dark:text-slate-400"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2">
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

      {cards.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
          <CreditCard className="w-12 h-12 text-slate-400 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No active cards found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
            You don&apos;t have any physical NFC cards assigned to your profile yet. Please contact support or activate your card using a provisioning token.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {cards.map(card => {
            const activeAssign = card.assignments[0];
            const publicUrl = generateCardUrl(card.publicToken);
            return (
              <div
                key={card.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6"
              >
                {/* Details */}
                <div className="space-y-6 flex-grow">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Physical Card</span>
                    <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">Serial: #{card.cardNumber}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border w-fit block mt-1.5 ${
                      card.status === 'ACTIVE'
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                        : card.status === 'SUSPENDED'
                          ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900'
                          : 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900'
                    }`}>
                      {card.status}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Linked Profile</span>
                    <span className="text-sm font-bold text-slate-850 dark:text-white block">
                      {activeAssign?.profile?.name || 'My Business Card'}
                    </span>
                    <span className="text-[10px] text-slate-500 block break-all">{publicUrl}</span>
                  </div>

                  <div className="flex gap-3 text-xs font-bold">
                    <button
                      onClick={() => handleCopyUrl(card.publicToken)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Copy className="w-4 h-4 text-blue-500" />
                      <span>Copy Link</span>
                    </button>
                    {card.status !== 'LOST' && (
                      <button
                        onClick={() => handleReportLost(card.id)}
                        className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span>Report Lost</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* QR Display */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl text-center space-y-3 w-full md:w-44">
                  <div className="w-28 h-28 bg-white rounded-xl p-2 flex items-center justify-center shadow-inner">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicUrl)}`}
                      className="w-full h-full object-contain"
                      alt="QR Link"
                    />
                  </div>
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QR</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
