'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { Languages, Send, ChevronRight, Menu, X } from 'lucide-react';

interface MainNavbarProps {
  variant?: 'light' | 'dark';
}

const NAV_LABELS = {
  en: {
    about: 'About Us',
    pillars: 'Creative Pillars',
    agency: 'Agency Studio',
    nfc: 'Smart NFC Cards',
    loyalty: 'Loyalty Card',
    contact: 'Contact',
    quote: 'Get a Quote',
    startFree: 'Start Free',
  },
  ar: {
    about: 'من نحن',
    pillars: 'أركان الهوية',
    agency: 'استوديو الوكالة',
    nfc: 'بطاقات NFC الذكية',
    loyalty: 'بطاقة الولاء',
    contact: 'تواصل معنا',
    quote: 'طلب عرض سعر',
    startFree: 'ابدأ مجاناً',
  },
};

export default function MainNavbar({ variant = 'light' }: MainNavbarProps) {
  const pathname = usePathname();
  const { language, setLanguage, dir } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isArabic = language === 'ar';
  const t = NAV_LABELS[isArabic ? 'ar' : 'en'];

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const isLoyaltyPage = pathname === '/loyalty' || pathname === '/fidelity';
  const isHomePage = pathname === '/';

  // Base prefix for anchor links
  const anchorPrefix = isHomePage ? '' : '/';

  // Theme-dependent colors
  const isDark = variant === 'dark';
  const headerBg = isDark
    ? 'bg-slate-950/90 backdrop-blur-xl border-b border-purple-900/30'
    : 'bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-xs';

  const linkBaseClass = isDark
    ? 'text-sm font-semibold text-slate-300 hover:text-white transition-colors relative py-1'
    : 'text-sm font-semibold text-slate-700 hover:text-[#844D98] transition-colors relative py-1';

  const linkActiveClass = isDark
    ? 'text-purple-300 font-bold after:content-[""] after:absolute after:-bottom-2.5 after:inset-x-0 after:h-0.5 after:bg-purple-400 after:rounded-full'
    : 'text-[#844D98] font-bold after:content-[""] after:absolute after:-bottom-2.5 after:inset-x-0 after:h-0.5 after:bg-[#844D98] after:rounded-full';

  return (
    <header className={`sticky top-0 w-full z-50 transition-all ${headerBg}`} dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* LOGO — Freestanding & Professional                          */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-95 transition-opacity shrink-0 group">
          <img
            src="/brandxpere-icon.png"
            alt="brandxpere logo"
            className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
          />
          <span
            className={`text-2xl font-black tracking-tight font-sans leading-none ${
              isDark ? 'text-white' : 'text-[#301739]'
            }`}
          >
            <span>brand</span>
            <span className="text-[#844D98] font-black">x</span>
            <span>pere</span>
          </span>
        </Link>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* DESKTOP NAVIGATION LINKS                                   */}
        {/* Spacing: 32–48px from logo, 24–32px between links         */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <nav className="hidden lg:flex items-center ms-8 xl:ms-12 gap-6 xl:gap-8">
          <Link
            href={`${anchorPrefix}#about`}
            className={`${linkBaseClass} ${pathname === '/about' ? linkActiveClass : ''}`}
          >
            {t.about}
          </Link>

          <Link
            href={`${anchorPrefix}#pillars`}
            className={`${linkBaseClass} ${pathname === '/pillars' ? linkActiveClass : ''}`}
          >
            {t.pillars}
          </Link>

          <Link
            href="/agency"
            className={`${linkBaseClass} ${pathname === '/agency' ? linkActiveClass : ''}`}
          >
            {t.agency}
          </Link>

          <Link
            href={`${anchorPrefix}#nfc`}
            className={`${linkBaseClass} ${pathname === '/nfc' ? linkActiveClass : ''}`}
          >
            {t.nfc}
          </Link>

          {/* Loyalty Card — Normal text link with active state */}
          <Link
            href="/loyalty"
            className={`${linkBaseClass} ${isLoyaltyPage ? linkActiveClass : ''}`}
          >
            {t.loyalty}
          </Link>

          <Link
            href="/contact"
            className={`${linkBaseClass} ${pathname === '/contact' ? linkActiveClass : ''}`}
          >
            {t.contact}
          </Link>
        </nav>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* RIGHT ACTION TOOLS (Language + CTAs)                       */}
        {/* Spacing: 32–48px from nav, 10–14px between CTAs           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex items-center ms-8 xl:ms-12 gap-4 shrink-0">
          {/* Language Switcher [EN | عربي] */}
          <button
            onClick={toggleLanguage}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shadow-xs ${
              isDark
                ? 'border-purple-800/60 bg-purple-950/40 hover:bg-purple-900/40 text-slate-200'
                : 'border-[#DACBE3]/60 bg-[#FAF7FC] hover:bg-white text-slate-700'
            }`}
            title={isArabic ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Languages className="w-3.5 h-3.5 text-[#844D98]" />
            <span className={!isArabic ? 'text-[#844D98] font-black' : 'text-slate-400'}>EN</span>
            <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>|</span>
            <span className={isArabic ? 'text-[#844D98] font-black' : 'text-slate-400'}>عربي</span>
          </button>

          {/* Secondary CTA: Get a Quote */}
          <Link
            href="/agency#quote"
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-bold transition-all shadow-xs ${
              isDark
                ? 'border-purple-700/60 bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 hover:text-white'
                : 'border-[#DACBE3]/80 bg-[#FAF7FC] hover:bg-white text-[#844D98] hover:border-[#844D98]/60'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.quote}</span>
          </Link>

          {/* Primary CTA: Start Free */}
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#844D98] hover:bg-[#6F2E82] text-xs sm:text-sm font-bold text-white shadow-md shadow-[#844D98]/25 hover:shadow-lg hover:shadow-[#844D98]/30 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span>{t.startFree}</span>
            <ChevronRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
          </Link>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* MOBILE & TABLET HAMBURGER BUTTON                            */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="flex lg:hidden items-center gap-2.5">
          {/* Quick Language Toggle on Mobile */}
          <button
            onClick={toggleLanguage}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all ${
              isDark
                ? 'border-purple-800/60 bg-purple-950/40 text-slate-200'
                : 'border-[#DACBE3]/60 bg-[#FAF7FC] text-slate-700'
            }`}
            title="Language"
          >
            <span className={!isArabic ? 'text-[#844D98] font-black' : 'text-slate-400'}>EN</span>
            <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>|</span>
            <span className={isArabic ? 'text-[#844D98] font-black' : 'text-slate-400'}>عربي</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? 'border-purple-800/50 bg-slate-900 text-slate-200 hover:text-white'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:text-[#844D98]'
            }`}
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MOBILE MENU DROPDOWN                                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div
          className={`lg:hidden border-b shadow-2xl px-6 py-6 transition-all animate-in slide-in-from-top-2 duration-200 ${
            isDark
              ? 'bg-slate-950 border-purple-900/40 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <nav className="flex flex-col space-y-3.5 pb-5">
            <Link
              href={`${anchorPrefix}#about`}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold py-1 hover:text-[#844D98] transition-colors"
            >
              {t.about}
            </Link>

            <Link
              href={`${anchorPrefix}#pillars`}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold py-1 hover:text-[#844D98] transition-colors"
            >
              {t.pillars}
            </Link>

            <Link
              href="/agency"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold py-1 hover:text-[#844D98] transition-colors"
            >
              {t.agency}
            </Link>

            <Link
              href={`${anchorPrefix}#nfc`}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold py-1 hover:text-[#844D98] transition-colors"
            >
              {t.nfc}
            </Link>

            {/* Loyalty Card in Mobile Menu */}
            <Link
              href="/loyalty"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-semibold py-1 transition-colors flex items-center justify-between ${
                isLoyaltyPage
                  ? 'text-[#844D98] font-bold border-s-2 border-[#844D98] ps-2.5'
                  : 'hover:text-[#844D98]'
              }`}
            >
              <span>{t.loyalty}</span>
              {isLoyaltyPage && (
                <span className="text-[10px] uppercase font-bold bg-[#844D98]/10 text-[#844D98] px-2 py-0.5 rounded-full">
                  Actif
                </span>
              )}
            </Link>

            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold py-1 hover:text-[#844D98] transition-colors"
            >
              {t.contact}
            </Link>
          </nav>

          {/* Separator */}
          <div className={`border-t pt-5 space-y-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            {/* Mobile CTAs */}
            <Link
              href="/agency#quote"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all ${
                isDark
                  ? 'border-purple-800/60 bg-purple-950/60 text-purple-200'
                  : 'border-[#DACBE3] bg-[#FAF7FC] text-[#844D98]'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{t.quote}</span>
            </Link>

            <Link
              href="/auth/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#844D98] hover:bg-[#6F2E82] text-sm font-bold text-white shadow-md shadow-[#844D98]/25"
            >
              <span>{t.startFree}</span>
              <ChevronRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
