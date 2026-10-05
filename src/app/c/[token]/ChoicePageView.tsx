'use client';

import React from 'react';
import Link from 'next/link';
import { User, Gift, ChevronRight, Sparkles } from 'lucide-react';

interface ChoicePageViewProps {
  profile: {
    id: string;
    name: string;
    slug?: string | null;
    company?: string | null;
    jobTitle?: string | null;
    photoUrl?: string | null;
    appearanceJson?: string | null;
  };
  token: string;
}

export default function ChoicePageView({ profile, token }: ChoicePageViewProps) {
  const businessName = (profile.company || profile.name || 'Brand Xpere Business').trim();
  const initial = businessName.charAt(0).toUpperCase() || 'B';
  const encodedToken = encodeURIComponent(token);

  // Destinations preserving the NFC token context
  const profileUrl = `/c/${encodedToken}?view=profile`;
  const loyaltyUrl = `/c/${encodedToken}?view=loyalty`;

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-between py-6 px-4 relative overflow-x-hidden select-none bg-[#F8F6FA]"
      dir="ltr"
      style={{ fontFamily: 'var(--font-poppins), Inter, system-ui, -apple-system, sans-serif' }}
    >
      {/* ── Soft Ambient Purple Background Glows (Brand Xpere Identity) ── */}
      <div
        className="fixed w-[420px] h-[420px] rounded-full blur-[130px] -top-24 -left-24 pointer-events-none opacity-35"
        style={{ background: 'radial-gradient(circle, #C084FC 0%, #844D98 60%, transparent 80%)' }}
      />
      <div
        className="fixed w-[420px] h-[420px] rounded-full blur-[130px] -bottom-24 -right-24 pointer-events-none opacity-25"
        style={{ background: 'radial-gradient(circle, #7C3AED 0%, #301739 60%, transparent 80%)' }}
      />

      {/* ── Top Subtle Brand Bar ── */}
      <header className="w-full max-w-[420px] flex items-center justify-between pt-1 pb-2 relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-lg sm:text-xl font-black tracking-tight text-[#301739] lowercase">
            brandxpere
          </span>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/70 border border-purple-100 shadow-xs text-[11px] font-semibold text-[#844D98]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>NFC Tap Verified</span>
        </div>
      </header>

      {/* ── Main Centered Selection Area ── */}
      <main className="w-full max-w-[420px] flex-1 flex flex-col items-center justify-center my-auto relative z-10 py-4">
        {/* Business Branding (Dynamic Logo or Monogram) */}
        <div className="relative mb-4 flex flex-col items-center">
          {profile.photoUrl ? (
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl overflow-hidden shadow-[0_12px_28px_-6px_rgba(48,23,57,0.18)] border-2 border-white ring-4 ring-[#844D98]/15 bg-white flex items-center justify-center">
              <img
                src={profile.photoUrl}
                alt={businessName}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-br from-[#844D98] via-[#602773] to-[#301739] text-white shadow-[0_12px_28px_-6px_rgba(48,23,57,0.25)] border-2 border-white ring-4 ring-[#844D98]/15 flex items-center justify-center">
              <span className="text-3xl font-black tracking-tight">
                {initial}
              </span>
            </div>
          )}

          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-tr from-[#301739] to-[#844D98] text-white flex items-center justify-center shadow-sm border border-white">
            <Sparkles className="w-3 h-3 text-[#DACBE3]" />
          </div>
        </div>

        {/* Business Name Badge */}
        <h2 className="text-base sm:text-lg font-bold text-[#301739] tracking-tight text-center max-w-[340px] truncate mb-0.5">
          {businessName}
        </h2>

        {/* Main Heading & Subtitle */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1B0C21] text-center mt-2 mb-2">
          Welcome
        </h1>
        <p className="text-sm font-medium text-slate-500 text-center max-w-[320px] mb-7 leading-snug">
          What would you like to access?
        </p>

        {/* ── The Two Selection Cards ── */}
        <div className="w-full flex flex-col gap-3.5">
          {/* OPTION 1 — PROFILE */}
          <Link
            href={profileUrl}
            prefetch={true}
            className="group w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md border border-purple-100/90 shadow-[0_8px_24px_-4px_rgba(48,23,57,0.06)] hover:shadow-[0_16px_36px_-6px_rgba(132,77,152,0.18)] hover:border-[#844D98]/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center gap-4 cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#F5EEF9] to-[#EBDDF4] text-[#844D98] border border-[#DACBE3]/60 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-[#844D98] group-hover:text-white transition-all duration-200 shadow-xs">
              <User className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-bold text-[#1B0C21] group-hover:text-[#844D98] transition-colors leading-tight">
                  Profile
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-normal leading-relaxed mt-0.5">
                Discover the business profile, information and contact details.
              </p>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-[#F5EEF9] group-hover:text-[#844D98] flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-all">
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </Link>

          {/* OPTION 2 — LOYALTY CARD */}
          <Link
            href={loyaltyUrl}
            prefetch={true}
            className="group w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md border border-purple-100/90 shadow-[0_8px_24px_-4px_rgba(48,23,57,0.06)] hover:shadow-[0_16px_36px_-6px_rgba(132,77,152,0.18)] hover:border-[#844D98]/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center gap-4 cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#844D98] via-[#602773] to-[#301739] text-white shadow-md shadow-purple-900/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-200">
              <Gift className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-bold text-[#1B0C21] group-hover:text-[#844D98] transition-colors leading-tight">
                  Loyalty Card
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-normal leading-relaxed mt-0.5">
                Access your loyalty card, points and rewards.
              </p>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-[#F5EEF9] group-hover:text-[#844D98] flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-all">
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </Link>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full max-w-[420px] text-center pt-4 pb-2 relative z-10">
        <div className="inline-flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-400">
          <span>Powered by</span>
          <span className="text-[#844D98] font-bold">Brand Xpere</span>
        </div>
      </footer>
    </div>
  );
}
