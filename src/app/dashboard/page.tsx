'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { CreditCard, Copy, ExternalLink, QrCode, Plus, CheckCircle, Link2, User } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  const { t } = useTranslation();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const stats = {
    totalCards: 2,
    activeCards: 1,
    totalViews: 342,
    viewsThisMonth: 128
  };

  const cards = [
    {
      id: 'card-1',
      cardNumber: 'CARD-NFC-001',
      publicToken: '8fK29Lm',
      status: 'ACTIVE',
      activatedAt: '2026-08-19',
      profileSlug: 'jane-doe',
      profileName: 'Jane Doe',
      productName: 'Metal NFC Card'
    },
    {
      id: 'card-2',
      cardNumber: 'CARD-NFC-002',
      publicToken: 't5G9mP1',
      status: 'UNASSIGNED',
      activatedAt: null,
      profileSlug: null,
      profileName: null,
      productName: 'PVC NFC Card'
    }
  ];

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/c/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {t('dashboard.overview')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Welcome back to your digital business card workspace.
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Link href="/dashboard/profiles/new" className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-2xl text-center shadow-sm hover:shadow-md transition-all space-y-2">
          <Plus className="w-5 h-5 text-blue-500 mx-auto" />
          <span className="text-xs font-bold block">New Profile</span>
        </Link>
        <Link href="/dashboard/profiles" className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-2xl text-center shadow-sm hover:shadow-md transition-all space-y-2">
          <User className="w-5 h-5 text-emerald-500 mx-auto" />
          <span className="text-xs font-bold block">My Profiles</span>
        </Link>
        <Link href="/dashboard/qr" className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-2xl text-center shadow-sm hover:shadow-md transition-all space-y-2">
          <QrCode className="w-5 h-5 text-purple-500 mx-auto" />
          <span className="text-xs font-bold block">QR Generator</span>
        </Link>
        <Link href="/dashboard/connect-card" className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-2xl text-center shadow-sm hover:shadow-md transition-all space-y-2">
          <Link2 className="w-5 h-5 text-blue-600 mx-auto" />
          <span className="text-xs font-bold block">Connect Card</span>
        </Link>
        <Link href="/dashboard/cards" className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-2xl text-center shadow-sm hover:shadow-md transition-all space-y-2">
          <CreditCard className="w-5 h-5 text-orange-500 mx-auto" />
          <span className="text-xs font-bold block">My NFC Cards</span>
        </Link>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.totalCards')}</span>
          <p className="text-3xl font-extrabold">{stats.totalCards}</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.activeCards')}</span>
          <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{stats.activeCards}</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.totalViews')}</span>
          <p className="text-3xl font-extrabold">{stats.totalViews}</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.viewsThisMonth')}</span>
          <p className="text-3xl font-extrabold">{stats.viewsThisMonth}</p>
        </div>
      </div>

      {/* Cards Catalog */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{t('dashboard.myCards')}</h2>
          <Link href="/dashboard/connect-card" className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-950 transition-all cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Connect Card</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-400">{card.productName}</span>
                    <h4 className="text-lg font-bold tracking-tight mt-0.5">{card.cardNumber}</h4>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                    card.status === 'ACTIVE'
                      ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900 dark:text-green-400'
                      : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                  }`}>
                    {card.status}
                  </span>
                </div>

                {card.profileSlug && (
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Connected Profile</span>
                      <span className="text-xs font-bold">{card.profileName}</span>
                    </div>
                    <Link
                      href={`/c/${card.publicToken}`}
                      target="_blank"
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => copyToClipboard(card.publicToken)}
                  className="flex-1 py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  {copiedToken === card.publicToken ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToken === card.publicToken ? 'Copied!' : 'Copy Link'}</span>
                </button>
                <button className="py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Code</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
