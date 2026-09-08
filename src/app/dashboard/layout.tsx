'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, CreditCard, User, BarChart3, Settings, LogOut, Layers, ShoppingBag, Receipt, QrCode, HelpCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t, dir } = useTranslation();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/auth/login');
        } else {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch (err) {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-500">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row" dir={dir}>
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 space-y-8">
        <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-95 transition-opacity group">
          <img
            src="/brandxpere-icon.png"
            alt="brandxpere logo"
            className="w-9 h-9 object-contain group-hover:scale-105 transition-transform flex-shrink-0"
          />
          <span className="text-xl font-black tracking-tight font-sans text-slate-900 dark:text-white leading-none">
            <span>brand</span>
            <span className="text-[#8A509E] dark:text-purple-400 font-extrabold">x</span>
            <span>pere</span>
          </span>
        </Link>

        {/* User Card */}
        {currentUser && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center font-bold text-blue-600">
              {currentUser.name[0]}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-sm truncate">{currentUser.name}</h4>
              <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{currentUser.role.toLowerCase()}</span>
            </div>
          </div>
        )}

        {/* Admin Portal Switcher */}
        {currentUser && (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') && (
          <Link
            href="/admin"
            className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal (لوحة الإدارة)</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {currentUser.role === 'SUPER_ADMIN' ? 'Owner' : 'Vendor'}
            </span>
          </Link>
        )}

        <nav className="flex-grow space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-450 font-semibold text-sm transition-all">
            <LayoutDashboard className="w-5 h-5" />
            <span>{t('dashboard.overview')}</span>
          </Link>
          <Link href="/dashboard/cards" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-405 hover:bg-slate-100 dark:hover:bg-slate-850 font-semibold text-sm transition-all">
            <CreditCard className="w-5 h-5" />
            <span>{t('dashboard.myCards')}</span>
          </Link>
          <Link href="/dashboard/profiles" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-405 hover:bg-slate-100 dark:hover:bg-slate-850 font-semibold text-sm transition-all">
            <User className="w-5 h-5" />
            <span>{t('dashboard.myProfiles')}</span>
          </Link>
          <Link href="/dashboard/analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-405 hover:bg-slate-100 dark:hover:bg-slate-850 font-semibold text-sm transition-all">
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </Link>
          <Link href="/dashboard/templates" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-405 hover:bg-slate-100 dark:hover:bg-slate-850 font-semibold text-sm transition-all">
            <Layers className="w-5 h-5" />
            <span>{t('nav.templates')}</span>
          </Link>
          <Link href="/dashboard/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-405 hover:bg-slate-100 dark:hover:bg-slate-850 font-semibold text-sm transition-all">
            <ShoppingBag className="w-5 h-5" />
            <span>My Orders</span>
          </Link>
          <Link href="/dashboard/billing" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-405 hover:bg-slate-100 dark:hover:bg-slate-850 font-semibold text-sm transition-all">
            <Receipt className="w-5 h-5" />
            <span>Billing</span>
          </Link>
          <Link href="/dashboard/qr" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-405 hover:bg-slate-100 dark:hover:bg-slate-850 font-semibold text-sm transition-all">
            <QrCode className="w-5 h-5" />
            <span>{t('nav.qrCodes') || 'QR Codes'}</span>
          </Link>
          <Link href="/dashboard/qr-generator" className="flex items-center justify-between px-4 py-3 rounded-xl text-purple-700 dark:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 font-bold text-sm transition-all">
            <div className="flex items-center gap-3">
              <QrCode className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>مولد QR للروابط</span>
            </div>
            <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">جديد</span>
          </Link>
          <Link href="/help" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-405 hover:bg-slate-100 dark:hover:bg-slate-850 font-semibold text-sm transition-all">
            <HelpCircle className="w-5 h-5" />
            <span>Help Center</span>
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-405 hover:bg-slate-100 dark:hover:bg-slate-850 font-semibold text-sm transition-all">
            <Settings className="w-5 h-5" />
            <span>{t('dashboard.settings')}</span>
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-sm transition-all border border-transparent hover:border-red-100 dark:hover:border-red-950 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('nav.logout')}</span>
        </button>
      </aside>

      {/* Main Page Area */}
      <main className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6">
        {children}
      </main>
    </div>
  );
}
