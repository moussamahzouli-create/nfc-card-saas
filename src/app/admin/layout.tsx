'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, CreditCard, Import, Layers, ShieldAlert, Cpu, ArrowLeft, LogOut, Loader2, Globe, Package, ShoppingBag, Mail, Users } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          const user = data.user || data;
          if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
            setAdmin(user);
          } else {
            router.push('/dashboard');
          }
        } else {
          router.push('/auth/login');
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
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!admin) return null;

  const menuItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users & Vendors', icon: Users },
    { href: '/admin/cards', label: 'Card Inventory', icon: CreditCard },
    { href: '/admin/nfc/provision', label: 'NFC Provisioning', icon: Cpu },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders Fulfillment', icon: ShoppingBag },
    { href: '/admin/contact', label: 'Contact Messages', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900/60 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col justify-between backdrop-blur-xl">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-2.5 hover:opacity-95 transition-opacity group">
            <img
              src="/brandxpere-icon.png"
              alt="brandxpere logo"
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform flex-shrink-0"
            />
            <div>
              <div className="text-lg font-black tracking-tight font-sans text-white leading-none">
                <span>brand</span>
                <span className="text-[#8A509E] dark:text-purple-400 font-extrabold">x</span>
                <span>pere</span>
              </div>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mt-1 block">Admin Portal</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-sm text-blue-400">
              {admin.name[0]}
            </div>
            <div>
              <span className="text-xs font-bold block text-white">{admin.name}</span>
              <span className="text-[10px] text-slate-500 block">{admin.email}</span>
            </div>
          </div>

          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800/40 hover:text-white transition-all cursor-pointer"
          >
            <Globe className="w-4 h-4 text-blue-500" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>

          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800/40 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Customer Portal</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
