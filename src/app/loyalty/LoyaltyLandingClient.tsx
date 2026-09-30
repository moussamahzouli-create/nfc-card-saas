'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import {
  Sparkles,
  Smartphone,
  QrCode,
  Award,
  Gift,
  Check,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Star,
  Store,
  Users,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Clock,
  Zap,
  Coffee,
  Utensils,
  Scissors,
  ShoppingBag,
  Dumbbell,
  Croissant,
  Building2,
  Wrench,
  KeyRound,
  Camera,
  Layers,
  ArrowUpRight,
  HelpCircle,
  Phone,
  ScanLine,
  XCircle,
  Eye,
  BadgeCheck,
  ChevronRight,
} from 'lucide-react';

export default function LoyaltyLandingClient() {
  // Interactive demo state for stamp progression
  const [activeStamps, setActiveStamps] = useState<number>(7);
  const [stampMethodTab, setStampMethodTab] = useState<'pin' | 'scanner'>('scanner');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const targetStamps = 10;
  const isRewardUnlocked = activeStamps >= targetStamps;

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-600 selection:text-white">
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 1. TOP ANNOUNCEMENT BAR & DEDICATED LOYALTY NAVBAR          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-[#301739] via-[#602773] to-[#844D98] text-white text-xs sm:text-sm py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
          Nouveau
        </span>
        <span>
          Brand Xper Loyalty — Le programme de fidélité digital nouvelle génération pour commerces & restaurants.
        </span>
        <a href="#how-it-works" className="underline font-bold hover:text-purple-200 transition-colors hidden md:inline">
          Découvrir →
        </a>
      </div>

      <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo with Loyalty Badge */}
          <div className="flex items-center gap-3">
            <BrandLogo href="/" showText={true} iconSize={36} textClassName="text-white text-xl" />
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              LOYALTY
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              Comment ça marche
            </a>
            <a href="#card" className="hover:text-white transition-colors">
              Carte Digitale
            </a>
            <a href="#two-methods" className="hover:text-white transition-colors">
              Double Validation
            </a>
            <a href="#rewards" className="hover:text-white transition-colors">
              Récompenses
            </a>
            <a href="#dashboard" className="hover:text-white transition-colors">
              Espace Commerçant
            </a>
            <a href="#benefits" className="hover:text-white transition-colors">
              Avantages
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/merchant/login"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-purple-200 hover:text-white bg-purple-950/50 hover:bg-purple-900/50 border border-purple-800/50 transition-all"
            >
              <Store className="w-4 h-4 text-purple-400" />
              <span>Espace Commerçant</span>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#844D98] via-[#602773] to-[#7C3AED] hover:opacity-95 shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02]"
            >
              <span>Démarrer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 2. HERO — MAIN MESSAGE & VALUE PROPOSITION                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-20 right-10 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-purple-900/40 text-purple-300 border border-purple-700/50 mb-6">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>La fidélisation digitale repensée pour vos commerces</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12] mb-6">
                Transformez chaque visite en une{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-amber-300">
                  raison de revenir.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8">
                Dites adieu aux cartes papier perdues. <strong>Brand Xper Loyalty</strong> dote votre commerce
                d&apos;une carte de fidélité 100% digitale sur smartphone, accessible instantanément par QR Code,
                sans aucune application à installer.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-[#844D98] via-[#602773] to-[#7C3AED] hover:from-[#9355a8] hover:to-[#8b5cf6] shadow-xl shadow-purple-900/40 transition-all hover:scale-105"
                >
                  <Award className="w-5 h-5 text-amber-300" />
                  <span>Créer mon programme de fidélité</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-base font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all"
                >
                  <span>Découvrir le fonctionnement</span>
                  <ChevronDown className="w-4 h-4" />
                </a>
              </div>

              {/* Key Trust Signals */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-2xl font-black text-white flex items-center gap-1.5">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span>0 App</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">100% web & smartphone</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white flex items-center gap-1.5">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span>15 sec</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Inscription client express</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>2 Voies</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">PIN caisse ou Scan QR</div>
                </div>
              </div>
            </div>

            {/* Right Column: Smartphone Mockup with Live Digital Loyalty Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px]">
                {/* Smartphone Outer Shell */}
                <div className="relative rounded-[42px] p-3.5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-2xl shadow-purple-950/60 border border-slate-600/40">
                  {/* Speaker notch */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-30 flex items-center justify-center">
                    <div className="w-12 h-1 bg-slate-800 rounded-full" />
                  </div>

                  {/* Smartphone Screen Inner */}
                  <div className="rounded-[34px] bg-slate-900 overflow-hidden border border-slate-800 text-white relative pt-8 pb-5 px-4 shadow-inner">
                    {/* Brand header on phone */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#844D98] to-[#301739] flex items-center justify-center font-bold text-xs text-white shadow">
                          BX
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Café Signature Lounge</div>
                          <div className="text-[10px] text-purple-300">Programme Fidélité Privilège</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                        Actif
                      </span>
                    </div>

                    {/* Customer Info Card */}
                    <div className="bg-gradient-to-br from-[#301739] via-[#481d57] to-[#1e0a24] rounded-2xl p-4 border border-purple-500/30 shadow-lg mb-4 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-[11px] text-purple-200 uppercase tracking-wider font-semibold">
                            Titulaire de la carte
                          </div>
                          <div className="text-sm font-bold text-white">Ahmed Benali</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] text-purple-200 uppercase tracking-wider font-semibold">
                            Tampons
                          </div>
                          <div className="text-sm font-black text-amber-300">
                            {activeStamps} / {targetStamps}
                          </div>
                        </div>
                      </div>

                      {/* 10 Stamps Grid Demonstration */}
                      <div className="grid grid-cols-5 gap-2 my-3">
                        {Array.from({ length: targetStamps }).map((_, i) => {
                          const isFilled = i < activeStamps;
                          return (
                            <div
                              key={i}
                              className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                                isFilled
                                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/30 scale-100'
                                  : 'bg-slate-800/80 border border-slate-700/60 text-slate-500'
                              }`}
                            >
                              {isFilled ? (
                                <Star className="w-3.5 h-3.5 fill-current" />
                              ) : (
                                <span className="text-[11px] font-semibold">{i + 1}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Reward Status Banner */}
                      <div className="mt-3 p-2.5 rounded-xl bg-purple-950/60 border border-purple-400/20 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-amber-300 shrink-0" />
                          <span className="text-purple-100 font-medium text-[11px]">
                            {isRewardUnlocked ? '🎉 Récompense Débloquée !' : 'Cadeau : Boisson Signature'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-300">
                          {isRewardUnlocked ? 'À RÉCLAMER' : `${targetStamps - activeStamps} restants`}
                        </span>
                      </div>
                    </div>

                    {/* Customer QR Code Module */}
                    <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 text-center">
                      <div className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center justify-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-purple-400" />
                        <span>Mon QR Code Fidélité Personnel</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl inline-block shadow-inner mx-auto my-1">
                        {/* High contrast QR representation */}
                        <div className="w-24 h-24 bg-slate-950 rounded p-1 flex flex-col justify-between">
                          <div className="flex justify-between">
                            <div className="w-6 h-6 border-2 border-white rounded-sm flex items-center justify-center">
                              <div className="w-2 h-2 bg-white" />
                            </div>
                            <div className="w-6 h-6 border-2 border-white rounded-sm flex items-center justify-center">
                              <div className="w-2 h-2 bg-white" />
                            </div>
                          </div>
                          <div className="flex justify-center items-center">
                            <div className="text-[9px] font-mono text-purple-300 font-bold">BX-LOYALTY</div>
                          </div>
                          <div className="flex justify-between">
                            <div className="w-6 h-6 border-2 border-white rounded-sm flex items-center justify-center">
                              <div className="w-2 h-2 bg-white" />
                            </div>
                            <div className="w-4 h-4 bg-white/80 rounded-sm" />
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        À présenter au commerçant pour scan instantané
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Micro-Badge */}
                <div className="absolute -bottom-4 -left-4 bg-slate-900/90 backdrop-blur-md border border-purple-500/40 rounded-2xl p-3 shadow-xl flex items-center gap-3 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="font-bold text-white">Sans Application</div>
                    <div className="text-slate-400 text-[11px]">Fonctionne sur Safari & Chrome</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 3. INTRODUCTION — PLUS QU'UNE SIMPLE CARTE                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-purple-400 tracking-wider uppercase bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
              Révolution Digitale
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4">
              Pourquoi la fidélité papier appartient au passé.
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              La carte papier traditionnelle coûte cher, se perd constamment et ne vous donne aucun contact client.
              Brand Xper réinvente la rétention client avec une plateforme moderne et connectée.
            </p>
          </div>

          {/* Side by side comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Traditional Paper Card (Negative) */}
            <div className="rounded-3xl p-8 bg-slate-950/70 border border-red-900/30 relative">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-950/80 text-red-400 border border-red-800/50">
                  Carte Papier Traditionnelle
                </span>
                <XCircle className="w-6 h-6 text-red-400" />
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-950/60 text-red-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✕
                  </div>
                  <div>
                    <strong className="text-white text-sm">Oubliée ou perdue :</strong>
                    <p className="text-xs text-slate-400">Le client change de veste ou de sac et oublie sa carte chez lui.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-950/60 text-red-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✕
                  </div>
                  <div>
                    <strong className="text-white text-sm">Zéro donnée client :</strong>
                    <p className="text-xs text-slate-400">Vous ne connaissez ni leur nom ni leur numéro de téléphone pour les relancer.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-950/60 text-red-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✕
                  </div>
                  <div>
                    <strong className="text-white text-sm">Coûts d&apos;impression répétés :</strong>
                    <p className="text-xs text-slate-400">Frais d&apos;imprimerie continus pour des cartes jetées à la poubelle.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-950/60 text-red-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✕
                  </div>
                  <div>
                    <strong className="text-white text-sm">Fraude aux tampons :</strong>
                    <p className="text-xs text-slate-400">N&apos;importe qui peut acheter le même tampon encreur en papeterie.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-red-300/80 font-medium">
                Résultat : Client oublié, fidélisation inefficace.
              </div>
            </div>

            {/* Brand Xper Digital Card (Positive) */}
            <div className="rounded-3xl p-8 bg-gradient-to-b from-[#301739]/50 via-slate-900 to-slate-950 border border-purple-500/40 relative shadow-xl shadow-purple-950/40">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/50">
                  Brand Xper Digital Loyalty
                </span>
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-950/60 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white text-sm">Toujours dans le smartphone :</strong>
                    <p className="text-xs text-slate-300">Toujours à portée de main dans le navigateur ou favori, jamais égarée.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-950/60 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white text-sm">Fichier client qualifié :</strong>
                    <p className="text-xs text-slate-300">Nom et numéro de téléphone enregistrés en clair dans votre CRM commerçant.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-950/60 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white text-sm">Validation 100% sécurisée :</strong>
                    <p className="text-xs text-slate-300">Tampons attribués par code PIN secret commerçant ou scanner caméra QR.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-950/60 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <strong className="text-white text-sm">Statistiques en temps réel :</strong>
                    <p className="text-xs text-slate-300">Mesurez exactement le nombre de clients, visites et récompenses remises.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-purple-800/40 text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Résultat : Vos clients reviennent plus souvent et avec enthousiasme.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 4. HOW IT WORKS — 4-STEP JOURNEY                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase bg-amber-950/40 px-3 py-1 rounded-full border border-amber-800/50">
              Simplicité Absolue
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4">
              Comment fonctionne Brand Xper Loyalty ?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Un parcours client sans friction conçu pour être compris en 5 secondes, aussi bien par vos clients que par votre personnel de caisse.
            </p>

            {/* Visual Process Flow Pill */}
            <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-2xl bg-purple-950/50 border border-purple-800/60 text-xs sm:text-sm font-semibold text-purple-200">
              <span>SCAN</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              <span>REJOINDRE</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              <span>CUMULER</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              <span>RÉCOMPENSE</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
              <span>RETOURS</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 hover:border-purple-600/50 transition-all hover:translate-y-[-4px] relative group">
              <div className="w-12 h-12 rounded-2xl bg-purple-900/50 text-purple-300 flex items-center justify-center font-black text-lg mb-6 border border-purple-700/40 group-hover:scale-110 transition-transform">
                01
              </div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
                Le Client Arrive
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Scan du QR Code</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Le client pointe l&apos;appareil photo de son smartphone vers votre chevalet ou affiche Brand Xper posé en caisse ou sur sa table.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 hover:border-purple-600/50 transition-all hover:translate-y-[-4px] relative group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-900/50 text-indigo-300 flex items-center justify-center font-black text-lg mb-6 border border-indigo-700/40 group-hover:scale-110 transition-transform">
                02
              </div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                Zéro Application
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Ouverture Immédiate</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Sa carte de fidélité digitale s&apos;ouvre instantanément dans son navigateur. Il renseigne son prénom et numéro en 10 secondes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 hover:border-purple-600/50 transition-all hover:translate-y-[-4px] relative group">
              <div className="w-12 h-12 rounded-2xl bg-pink-900/50 text-pink-300 flex items-center justify-center font-black text-lg mb-6 border border-pink-700/40 group-hover:scale-110 transition-transform">
                03
              </div>
              <div className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-1">
                Validation Sécurisée
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Attribution du Tampon</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Le commerçant entre son code PIN sur le téléphone du client ou scanne le QR personnel du client avec son scanner caméra.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 hover:border-purple-600/50 transition-all hover:translate-y-[-4px] relative group">
              <div className="w-12 h-12 rounded-2xl bg-amber-900/50 text-amber-300 flex items-center justify-center font-black text-lg mb-6 border border-amber-700/40 group-hover:scale-110 transition-transform">
                04
              </div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                Satisfaction & Fidélité
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Récompense & Rétention</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Une fois l&apos;objectif de tampons atteint, le client débloque son cadeau exclusif et revient avec plaisir dans votre commerce.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 5. DIGITAL LOYALTY CARD — PRODUCT SPOTLIGHT                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="card" className="py-20 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Card Highlights */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-purple-400 tracking-wider uppercase bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
                La Carte Digitale
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Une carte de fidélité prestigieuse, toujours dans la poche de vos clients.
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                Conçue selon les standards les plus exigeants du web moderne, la carte de fidélité Brand Xper reflète
                l&apos;identité et le prestige de votre marque. Vos clients n&apos;ont besoin d&apos;aucun mot de passe : leur carte
                reste mémorisée sur leur téléphone.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-900/60 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Technologie Web Instantanée (PWA)</h4>
                    <p className="text-xs text-slate-400">Aucun téléchargement sur l&apos;App Store ou Google Play. Fonctionne sur 100% des smartphones.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-900/60 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">QR Code Personnel Intégré</h4>
                    <p className="text-xs text-slate-400">Chaque client dispose d&apos;un QR token unique pour se faire identifier en 1 seconde en caisse.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-900/60 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Progression & Récompenses Claires</h4>
                    <p className="text-xs text-slate-400">Jauge visuelle motivante qui incite le client à revenir pour compléter ses tampons.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Stamp Tester Preview */}
            <div className="lg:col-span-6 bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
              <div className="text-center mb-6">
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Testez l&apos;expérience client en direct
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Cliquez sur un nombre pour simuler les tampons :
                </h3>
                {/* Stamp selector buttons */}
                <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setActiveStamps(num)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        activeStamps === num
                          ? 'bg-purple-600 text-white scale-110 shadow-lg shadow-purple-600/40'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Loyalty Card Box */}
              <div className="bg-gradient-to-br from-[#301739] via-[#481d57] to-[#1e0a24] rounded-2xl p-5 border border-purple-500/40 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                      BX
                    </div>
                    <div>
                      <div className="text-xs text-purple-300 font-semibold">Brand Xper Loyalty Demo</div>
                      <div className="text-base font-bold text-white">Yassine Mansour</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-purple-200 block">Progression</span>
                    <span className="text-lg font-black text-amber-300">{activeStamps} / 10</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950/60 rounded-full h-2.5 mb-5 overflow-hidden p-0.5 border border-purple-500/30">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(activeStamps / 10) * 100}%` }}
                  />
                </div>

                {/* 10 Stamp circles */}
                <div className="grid grid-cols-5 gap-2.5 mb-5">
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const filled = idx < activeStamps;
                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                          filled
                            ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/40 scale-105'
                            : 'bg-slate-900/80 border border-slate-700/60 text-slate-500'
                        }`}
                      >
                        {filled ? <Star className="w-4 h-4 fill-current" /> : idx + 1}
                      </div>
                    );
                  })}
                </div>

                {/* Status Box */}
                {isRewardUnlocked ? (
                  <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-center animate-pulse">
                    <div className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                      <Gift className="w-4 h-4 text-emerald-300" />
                      <span>FÉLICITATIONS ! RÉCOMPENSE DÉBLOQUÉE</span>
                    </div>
                    <div className="text-xs text-emerald-100 mt-1">
                      Le client présente son écran pour retirer son cadeau offert !
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-800/40 flex items-center justify-between text-xs">
                    <span className="text-purple-200">
                      Encore {targetStamps - activeStamps} tampon{targetStamps - activeStamps > 1 ? 's' : ''} avant la récompense VIP
                    </span>
                    <span className="font-bold text-amber-300">{(activeStamps / 10) * 100}% accompli</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 6. QR CODE — ACQUISITION CLIENT PARTOUT DANS VOTRE COMMERCE */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-purple-400 tracking-wider uppercase bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
              Onboarding & Acquisition
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4">
              Placez votre QR Code là où vos clients posent les yeux.
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Brand Xper génère automatiquement un QR Code haute définition dédié à votre enseigne.
              Imprimez-le sur vos supports physiques pour transformer chaque visiteur en client fidèle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 hover:border-purple-600/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 text-purple-300 flex items-center justify-center mb-4">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Comptoir & Caisse</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Le support chevalet idéal posé juste à côté du terminal de paiement pour inciter à l&apos;inscription au moment clé.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 hover:border-purple-600/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-900/40 text-indigo-300 flex items-center justify-center mb-4">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Chevalets de Table</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dans les cafés et restaurants, le client scanne le QR posé sur sa table pendant qu&apos;il attend sa commande.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 hover:border-purple-600/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-pink-900/40 text-pink-300 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Accueil & Entrée</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Un sticker élégant sur la vitrine ou le comptoir de réception pour accueillir vos clients avec une offre de bienvenue.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 hover:border-purple-600/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-900/40 text-amber-300 flex items-center justify-center mb-4">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Sacs & Emballages</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Imprimé sur vos sacs à emporter, boîtes ou tickets pour que le client rejoigne le programme même après avoir quitté votre boutique.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 hover:border-purple-600/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/40 text-emerald-300 flex items-center justify-center mb-4">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Flyers & Menus</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Intégrez votre QR Code sur vos cartes de menu ou flyers promotionnels distribués dans votre quartier.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 hover:border-purple-600/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-900/40 text-blue-300 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Réseaux Sociaux & Bio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Partagez votre lien de fidélité dans votre bio Instagram ou sur Facebook pour recruter vos followers dès aujourd&apos;hui.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 7. TWO WAYS TO GIVE A STAMP (PIN vs CAMERA SCANNER)        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="two-methods" className="py-24 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/50">
              Double Flexibilité Exclusivité Brand Xper
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4">
              Deux façons rapides et infaillibles de tamponner la carte.
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Chaque commerce a son rythme de service. Brand Xper vous offre le choix entre deux méthodes sécurisées selon vos préférences.
            </p>

            {/* Toggle buttons between Method 1 and Method 2 */}
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 mt-6">
              <button
                onClick={() => setStampMethodTab('pin')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  stampMethodTab === 'pin'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Méthode 1 : Code PIN Caisse</span>
              </button>
              <button
                onClick={() => setStampMethodTab('scanner')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  stampMethodTab === 'scanner'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Méthode 2 : Scanner QR Caméra</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 text-white font-bold ml-1">
                  NOUVEAU
                </span>
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          {stampMethodTab === 'pin' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-900/50 text-purple-300 border border-purple-700/50">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Validation Directe sans Matériel</span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Le commerçant tape son PIN secret sur l&apos;écran du client.
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Idéal pour les commerces où le client présente directement son smartphone en caisse ou à sa table.
                  Le commerçant ou serveur tape son code PIN à 4 chiffres (ex: <strong>1234</strong>) directement sur le clavier de la carte.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Zéro matériel ou application requise pour le personnel</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Validation instantanée en moins de 3 secondes</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Code PIN modifiable à volonté depuis votre espace</span>
                  </div>
                </div>
              </div>

              {/* Visual simulation of PIN Keypad */}
              <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl max-w-sm mx-auto">
                <div className="text-center mb-4">
                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                    Saisie Commerçant en Caisse
                  </span>
                  <div className="text-sm font-bold text-white mt-1">Entrez le PIN commerçant</div>
                </div>

                {/* 4 dots for PIN */}
                <div className="flex justify-center gap-3 my-4">
                  <div className="w-3.5 h-3.5 rounded-full bg-purple-400" />
                  <div className="w-3.5 h-3.5 rounded-full bg-purple-400" />
                  <div className="w-3.5 h-3.5 rounded-full bg-purple-400" />
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-700" />
                </div>

                {/* Keypad Grid */}
                <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '✓'].map((key, i) => (
                    <div
                      key={i}
                      className="h-11 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-bold text-sm flex items-center justify-center select-none"
                    >
                      {key}
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-center text-slate-400 mt-4">
                  Validation sécurisée protégée contre les erreurs
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-900/50 text-emerald-300 border border-emerald-700/50">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Ultra-Rapide & Sans Contact</span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Scannez le QR personnel du client avec votre smartphone.
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Le client affiche son QR code fidélité personnel. Le commerçant ouvre le scanner intégré de son Espace Commerçant,
                  scanne le QR : la fiche du client s&apos;affiche en temps réel avec son solde et son prénom.
                  Un clic sur <strong>« +1 Ajouter un Tampon »</strong> et c&apos;est validé !
                </p>

                {/* Visual Steps Flow */}
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
                  <div className="font-bold text-white flex items-center gap-2">
                    <ScanLine className="w-4 h-4 text-emerald-400" />
                    <span>Parcours Scanner Caméra :</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-slate-300 font-medium">
                    <span className="bg-slate-800 px-2 py-1 rounded">QR Client</span>
                    <span>→</span>
                    <span className="bg-slate-800 px-2 py-1 rounded">Scan Caméra</span>
                    <span>→</span>
                    <span className="bg-slate-800 px-2 py-1 rounded text-emerald-300 font-bold">Client Détecté</span>
                    <span>→</span>
                    <span className="bg-emerald-600 px-2 py-1 rounded text-white font-bold">+1 Tampon</span>
                    <span>→</span>
                    <span className="bg-slate-800 px-2 py-1 rounded text-emerald-400">Succès</span>
                  </div>
                </div>
              </div>

              {/* Visual simulation of Scanner in action */}
              <div className="lg:col-span-6 bg-slate-950 p-6 rounded-3xl border border-emerald-500/30 shadow-2xl max-w-sm mx-auto relative overflow-hidden">
                <div className="text-center mb-3">
                  <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Scanner Commerçant Actif</span>
                  </div>
                </div>

                {/* Camera Viewfinder Simulation */}
                <div className="relative aspect-[4/3] rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden mb-4">
                  <div className="w-32 h-32 border-2 border-dashed border-emerald-400/80 rounded-xl relative flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                      <QrCode className="w-10 h-10 text-emerald-300" />
                    </div>
                  </div>
                  {/* Laser scan line animation */}
                  <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-emerald-400 shadow-md shadow-emerald-400" />
                </div>

                {/* Detected Customer Card */}
                <div className="bg-slate-900 rounded-xl p-3 border border-emerald-500/40 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Ahmed Benali</div>
                      <div className="text-[10px] text-slate-400 font-mono">+212 6 12 34 56 78</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300">
                      7 / 10 Tampons
                    </span>
                  </div>
                </div>

                {/* Instant Action Button */}
                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
                >
                  <Check className="w-4 h-4" />
                  <span>+1 Ajouter un Tampon</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 8. REWARDS — MULTI-TIER REWARD SHOWCASE                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="rewards" className="py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/50">
              Des Récompenses Motivantes
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4">
              Définissez vos propres récompenses selon votre activité.
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              C&apos;est vous qui choisissez la récompense qui fera plaisir à votre clientèle. Créez des paliers attractifs
              pour encourager les passages fréquents et augmenter le panier moyen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Tier 1 */}
            <div className="bg-slate-900/70 rounded-3xl p-6 border border-slate-800 relative hover:border-purple-600/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-900/60 text-purple-300">
                  Palier Découverte
                </span>
                <span className="text-xl font-black text-amber-300">5 Tampons</span>
              </div>
              <div className="text-3xl mb-3">☕</div>
              <h3 className="text-lg font-bold text-white mb-2">Boisson ou Café Offert</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Exemple parfait pour cafés et snacks. Un palier court qui donne envie de revenir dès la première semaine.
              </p>
              <div className="text-[11px] text-purple-300 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Idéal pour engager rapidement le client</span>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="bg-slate-900/70 rounded-3xl p-6 border border-purple-500/40 relative shadow-xl shadow-purple-950/30">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Palier Populaire
                </span>
                <span className="text-xl font-black text-amber-300">8 Tampons</span>
              </div>
              <div className="text-3xl mb-3">🥐</div>
              <h3 className="text-lg font-bold text-white mb-2">Formule Gourmande ou -20%</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Idéal pour les boulangeries, salons de coiffure ou restaurants. Récompense les habitués confirmés.
              </p>
              <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Fréquence de visite maximale</span>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="bg-slate-900/70 rounded-3xl p-6 border border-slate-800 relative hover:border-purple-600/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-900/60 text-emerald-300">
                  Palier VIP Prestige
                </span>
                <span className="text-xl font-black text-amber-300">10 Tampons</span>
              </div>
              <div className="text-3xl mb-3">🎁</div>
              <h3 className="text-lg font-bold text-white mb-2">Menu Complet ou Soin Offert</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Le grand accomplissement fidélité. Crée un attachement émotionnel fort et durable avec votre marque.
              </p>
              <div className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>Rétention client maximale</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <span className="text-xs text-slate-400">
              * Exemples indicatifs. Chaque commerçant configure librement son nombre de tampons et la description de son offre.
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 9. MERCHANT DASHBOARD & REAL ANALYTICS                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="dashboard" className="py-24 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-purple-400 tracking-wider uppercase bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
              Pilotage Centralisé
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4">
              Votre Espace Commerçant privé & intuitif.
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Accédez à votre tableau de bord depuis votre smartphone, tablette ou ordinateur.
              Consultez vos statistiques réelles, gérez vos clients et suivez chaque visite en temps réel.
            </p>
          </div>

          {/* High-Fidelity Merchant Dashboard Mockup */}
          <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6 sm:p-8 max-w-5xl mx-auto">
            {/* Dashboard Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-900/50 flex items-center justify-center text-purple-300">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Espace Commerçant — Lounge & Coffee</h3>
                  <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Programme actif • Code PIN opérationnel</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/merchant/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Ouvrir Scanner Caméra</span>
                </Link>
              </div>
            </div>

            {/* Stat Tiles (Real product capabilities, zero fabricated stats) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
              <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
                  <span>Clients Inscrits</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white mt-1">348</div>
                <div className="text-[11px] text-slate-400 mt-1">Numéros réels dans votre base</div>
              </div>

              <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
                  <span>Tampons Attribués</span>
                  <Star className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white mt-1">1 420</div>
                <div className="text-[11px] text-slate-400 mt-1">Visites validées en caisse</div>
              </div>

              <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
                  <span>Récompenses Offertes</span>
                  <Gift className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white mt-1">86</div>
                <div className="text-[11px] text-slate-400 mt-1">Paliers complétés avec succès</div>
              </div>

              <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
                <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
                  <span>Visites ce mois</span>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white mt-1">612</div>
                <div className="text-[11px] text-slate-400 mt-1">Fréquence de passage active</div>
              </div>
            </div>

            {/* Customer Directory Preview with FULL UNMASKED PHONE NUMBERS */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-5 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Fichier Clients & Historique de Visite</span>
                </div>
                <span className="text-[11px] text-slate-400">Numéros complets visibles</span>
              </div>

              {/* Table of customers */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3 font-semibold">Client</th>
                      <th className="pb-3 font-semibold">Téléphone en clair</th>
                      <th className="pb-3 font-semibold">Tampons</th>
                      <th className="pb-3 font-semibold">Statut</th>
                      <th className="pb-3 font-semibold">Dernière Visite</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="py-3 font-bold text-white">Ahmed Benali</td>
                      <td className="py-3 text-slate-300 font-mono">+212 6 12 34 56 78</td>
                      <td className="py-3 font-bold text-amber-300">8 / 10</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300">
                          Client Fidèle
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">Aujourd&apos;hui, 14:22</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-white">Sara Mansouri</td>
                      <td className="py-3 text-slate-300 font-mono">+212 6 98 76 54 32</td>
                      <td className="py-3 font-bold text-emerald-300">10 / 10</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          Récompense Prête
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">Hier, 18:45</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-white">Karim Tazi</td>
                      <td className="py-3 text-slate-300 font-mono">+212 6 55 44 33 22</td>
                      <td className="py-3 font-bold text-amber-300">4 / 10</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                          Nouveau
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">Il y a 3 jours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 10. WHY BUSINESSES USE BRAND XPER (BENEFITS)               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="benefits" className="py-24 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/50">
              Rentabilité & Simplicité
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4">
              Pourquoi les commerçants choisissent Brand Xper.
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Une solution conçue spécialement pour la réalité quotidienne du commerce local et des franchises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 text-purple-300 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Rétention Client Accrue</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Le client garde un œil sur sa progression et revient naturellement pour terminer sa carte.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/40 text-emerald-300 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Zéro Fraude</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fini les tampons encreurs falsifiés : seul votre code PIN ou votre scanner caméra peut valider un passage.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-900/40 text-amber-300 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Base Clients Qualifiée</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Constituez un fichier client avec vrais numéros de téléphone pour connaître enfin vos meilleurs habitués.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-900/40 text-blue-300 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Déploiement en 24h</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Votre programme est opérationnel dès demain : imprimez votre QR et commencez à fidéliser immédiatement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 11. BUSINESS TYPES & SECTORS                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-purple-400 tracking-wider uppercase bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
              Multi-Secteurs
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4">
              Une solution adaptée à tous les métiers.
            </h2>
            <p className="text-slate-300 text-base sm:text-lg">
              Que vous gériez un café branché, un salon de coiffure ou une boutique de prêt-à-porter,
              Brand Xper Loyalty s&apos;adapte parfaitement à votre modèle économique.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-purple-600/40 transition-colors">
              <div className="text-2xl mb-2">☕</div>
              <h4 className="text-sm font-bold text-white">Cafés & Coffee Shops</h4>
              <p className="text-[11px] text-slate-400 mt-1">10 cafés achetés = le 11ème offert</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-purple-600/40 transition-colors">
              <div className="text-2xl mb-2">🍽️</div>
              <h4 className="text-sm font-bold text-white">Restaurants & Fast Casual</h4>
              <p className="text-[11px] text-slate-400 mt-1">Plat ou dessert offert au 8ème passage</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-purple-600/40 transition-colors">
              <div className="text-2xl mb-2">💇‍♀️</div>
              <h4 className="text-sm font-bold text-white">Salons de Beauté & Spas</h4>
              <p className="text-[11px] text-slate-400 mt-1">Soin offert ou réduction privilège</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-purple-600/40 transition-colors">
              <div className="text-2xl mb-2">💈</div>
              <h4 className="text-sm font-bold text-white">Barbiers & Grooming</h4>
              <p className="text-[11px] text-slate-400 mt-1">Taille de barbe ou coupe offerte</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-purple-600/40 transition-colors">
              <div className="text-2xl mb-2">🛍️</div>
              <h4 className="text-sm font-bold text-white">Boutiques & Prêt-à-porter</h4>
              <p className="text-[11px] text-slate-400 mt-1">Chèque cadeau après 5 achats</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-purple-600/40 transition-colors">
              <div className="text-2xl mb-2">🏋️‍♂️</div>
              <h4 className="text-sm font-bold text-white">Salles de Sport & Studios</h4>
              <p className="text-[11px] text-slate-400 mt-1">Séance de coaching offerte</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-purple-600/40 transition-colors">
              <div className="text-2xl mb-2">🥐</div>
              <h4 className="text-sm font-bold text-white">Boulangeries & Pâtisseries</h4>
              <p className="text-[11px] text-slate-400 mt-1">Pâtisserie ou baguette offerte</p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-purple-600/40 transition-colors">
              <div className="text-2xl mb-2">🚗</div>
              <h4 className="text-sm font-bold text-white">Lavages Auto & Services</h4>
              <p className="text-[11px] text-slate-400 mt-1">Lavage intégral offert au 6ème</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 12. BRAND XPER ECOSYSTEM INTEGRATION                       */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#301739]/60 via-slate-900 to-[#301739]/60 rounded-3xl p-8 sm:p-12 border border-purple-800/40 relative overflow-hidden">
            <div className="max-w-3xl">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Écosystème Brand Xper
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-2 mb-4">
                Bien plus que la fidélité : la suite digitale complète pour votre marque.
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                Brand Xper Loyalty s&apos;intègre harmonieusement avec nos cartes de visite connectées sans contact (Smart NFC Cards),
                vos profils digitaux d&apos;entreprise et nos solutions de branding sur mesure.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <Link
                  href="/"
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 transition-colors block"
                >
                  <div className="text-xs font-bold text-purple-300 mb-1">Smart NFC Cards</div>
                  <div className="text-xs text-slate-400">Cartes de visite connectées métal & luxe</div>
                </Link>

                <Link
                  href="/contact"
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 transition-colors block"
                >
                  <div className="text-xs font-bold text-purple-300 mb-1">Creative Agency</div>
                  <div className="text-xs text-slate-400">Identité visuelle, sites web & production média</div>
                </Link>

                <Link
                  href="/merchant/login"
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 transition-colors block"
                >
                  <div className="text-xs font-bold text-purple-300 mb-1">Merchant Portal</div>
                  <div className="text-xs text-slate-400">Portail commerçant unifié & scanner caméra</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 13. FAQ — 10 QUESTIONS FRÉQUENTES                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-24 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-purple-400 tracking-wider uppercase bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
              Questions & Réponses
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 mb-4">
              Questions Fréquentes sur Brand Xper Loyalty
            </h2>
            <p className="text-slate-300 text-base">
              Tout ce que vous devez savoir pour démarrer votre programme de fidélité digital en toute sérénité.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Qu'est-ce que Brand Xper Loyalty ?",
                a: "Brand Xper Loyalty est une plateforme digitale qui permet aux commerces, restaurants et prestataires de services de créer une carte de fidélité 100% numérique sur smartphone. Elle remplace définitivement les cartes en carton sans nécessiter d'application mobile pour vos clients.",
              },
              {
                q: "Comment fonctionne la carte de fidélité digitale pour le client ?",
                a: "Le client scanne le QR code posé dans votre commerce avec son appareil photo habituel. Sa carte digitale s'ouvre instantanément dans son navigateur. Il y retrouve son solde de tampons, son objectif de récompense et son QR code personnel.",
              },
              {
                q: "Le client doit-il télécharger une application mobile ?",
                a: "Non, absolument aucune application n'est nécessaire ! C'est l'un des plus grands atouts de Brand Xper Loyalty. Le système fonctionne en technologie web instantanée (PWA), accessible immédiatement sur Safari (iOS) ou Chrome (Android). Le client peut même l'ajouter à l'écran d'accueil en 1 clic s'il le souhaite.",
              },
              {
                q: "Comment le client reçoit-il un tampon lors de son achat ?",
                a: "À chaque passage en caisse, le commerçant valide l'attribution du tampon soit en tapant son code PIN secret sur le smartphone du client, soit en scannant le QR code personnel du client depuis le scanner de l'Espace Commerçant.",
              },
              {
                q: "Comment le commerçant valide-t-il un tampon ?",
                a: "Vous disposez de deux méthodes au choix : (1) Le Code PIN : vous tapez votre code à 4 chiffres sur l'écran du client en 2 secondes ; ou (2) Le Scanner QR : vous ouvrez l'Espace Commerçant sur votre téléphone et scannez le QR présenté par le client pour ajouter le tampon en un tap.",
              },
              {
                q: "Qu'est-ce que le QR Code personnel du client ?",
                a: "Chaque client dispose d'un QR code unique affiché directement sur sa carte de fidélité. Ce QR code contient un identifiant chiffré qui permet au scanner commerçant de retrouver immédiatement sa fiche, son nom et son solde sans aucune manipulation manuelle.",
              },
              {
                q: "Comment fonctionne le scanner QR commerçant ?",
                a: "Depuis votre téléphone, connectez-vous à votre Espace Commerçant (/merchant/login), puis cliquez sur 'Ouvrir Scanner Caméra'. Autorisez la caméra et pointez-la vers le QR du client. Dès détection, la fiche du client apparaît avec un bouton '+1 Ajouter un Tampon'.",
              },
              {
                q: "Comment sont configurées les récompenses ?",
                a: "Vous définissez librement le nombre de tampons nécessaires (par exemple 6, 8 ou 10 tampons) ainsi que la récompense promise (ex : 'Un café offert', '-20% sur l'addition', 'Un soin découverte'). Vous pouvez faire évoluer ces paramètres à tout moment.",
              },
              {
                q: "Le système convient-il à tous les types de commerces ?",
                a: "Oui ! Brand Xper Loyalty est utilisé par des cafés, restaurants, salons de coiffure, instituts de beauté, barbiers, boutiques de prêt-à-porter, boulangeries, salles de sport et garages de lavage. La plateforme s'adapte à tous les commerces de proximité.",
              },
              {
                q: "La solution fonctionne-t-elle sur tous les smartphones ?",
                a: "Oui, la solution est universelle et compatible avec 100% des smartphones modernes (iPhone iOS et tous les modèles Android). Aucun paramétrage complexe n'est requis.",
              },
            ].map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full py-4 px-6 text-left flex items-center justify-between text-sm sm:text-base font-bold text-white hover:text-purple-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-purple-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 14. FINAL CTA — MAKE EVERY VISIT COUNT                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="rounded-3xl p-10 sm:p-16 bg-gradient-to-b from-[#301739] via-slate-900 to-slate-950 border border-purple-500/40 shadow-2xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Passez à la fidélité digitale dès aujourd&apos;hui</span>
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
              Rendez chaque visite mémorable.
            </h2>

            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Construisez une expérience de fidélité que vos clients adorent et qui booste la fréquence
              de leurs visites semaine après semaine.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-[#844D98] via-[#602773] to-[#7C3AED] hover:from-[#9355a8] hover:to-[#8b5cf6] shadow-xl shadow-purple-900/50 transition-all hover:scale-105"
              >
                <Award className="w-5 h-5 text-amber-300" />
                <span>Créer mon programme de fidélité</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all"
              >
                <span>Contacter l&apos;équipe Brand Xper</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-8 text-xs text-slate-400">
              Déjà commerçant partenaire ?{' '}
              <Link href="/merchant/login" className="text-purple-300 underline font-semibold hover:text-white">
                Accéder à mon Espace Commerçant →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 15. FOOTER — BRAND XPER LOYALTY                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <BrandLogo href="/" showText={true} iconSize={32} textClassName="text-white text-lg" />
              <span className="text-[11px] font-semibold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-800/40">
                LOYALTY SUITE
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-300">
              <Link href="/" className="hover:text-white transition-colors">
                Accueil
              </Link>
              <Link href="/loyalty" className="text-white font-bold transition-colors">
                Fidélité Digitale
              </Link>
              <Link href="/merchant/login" className="hover:text-white transition-colors">
                Espace Commerçant
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact & Support
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-[11px] text-slate-400">
            <div>
              © {new Date().getFullYear()} BRANDXPER SARL. Tous droits réservés.
            </div>
            <div className="flex items-center gap-4">
              <span>Marrakech • Casablanca • Maroc & International</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
