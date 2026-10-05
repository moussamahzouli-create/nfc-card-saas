'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Crown, Sparkles, Plus, Store, ArrowRight, ShieldCheck, QrCode, Settings, ToggleLeft, ToggleRight } from 'lucide-react';

export default function LoyaltyIndexPage() {
  const [loyaltyProfiles, setLoyaltyProfiles] = useState<any[]>([]);
  const [otherProfiles, setOtherProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLoyaltyProfiles() {
      try {
        const res = await fetch('/api/profiles');
        if (res.ok) {
          const list = await res.json();
          const isLoyaltyActive = (p: any) =>
            p.type === 'LOYALTY' || (p.components && p.components.some((c: any) => c.isVisible !== false));

          const activeList = (list || []).filter(isLoyaltyActive);
          const inactiveList = (list || []).filter((p: any) => !isLoyaltyActive(p));

          setLoyaltyProfiles(activeList);
          setOtherProfiles(inactiveList);
        }
      } catch (e) {
        console.error('Error loading loyalty profiles:', e);
      } finally {
        setLoading(false);
      }
    }
    loadLoyaltyProfiles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-600 border-t-transparent animate-spin" />
        <span className="text-sm font-bold text-slate-500">Chargement de vos espaces fidélité...</span>
      </div>
    );
  }

  // If no profiles at all
  if (loyaltyProfiles.length === 0 && otherProfiles.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-purple-600/30">
          <Crown className="w-10 h-10 text-amber-300" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Programmes de Fidélité & Gestion Clients
          </h1>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Vous n'avez pas encore créé de carte de fidélité numérique pour votre commerce. Créez votre première carte VIP en quelques clics !
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-md mx-auto space-y-4 text-left">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Avantages de la Carte de Fidélité BrandXpere :</span>
          </h3>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 font-medium">
            <li className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Carte bancaire VIP dématérialisée sur smartphone</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Tampons sécurisés par code PIN en caisse</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Tableau de bord commerçant avec statistiques en temps réel</span>
            </li>
          </ul>

          <Link
            href="/dashboard/profiles/new?type=LOYALTY"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Créer ma Carte de Fidélité VIP</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Crown className="w-7 h-7 text-amber-500" />
            <span>Programmes de Fidélité VIP</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gérez vos cartes de fidélité numériques, vos clients fidèles et activez le programme sur vos profils
          </p>
        </div>

        <Link
          href="/dashboard/profiles/new?type=LOYALTY"
          className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nouvelle Carte Fidélité</span>
        </Link>
      </div>

      {/* ── SECTION 1: ACTIVE LOYALTY PROGRAMS ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cartes Actives ({loyaltyProfiles.length})</span>
          </h2>
        </div>

        {loyaltyProfiles.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
            <p className="text-xs font-bold text-slate-500">
              Aucun programme de fidélité actif actuellement. Activez-le sur une carte existante ci-dessous !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loyaltyProfiles.map(p => (
              <div
                key={p.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                      Programme Actif 👑
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">/c/{p.slug}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
                      {p.company || p.name}
                    </h3>
                    {p.jobTitle && <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.jobTitle}</p>}
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/loyalty/${p.id}`}
                      className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                    >
                      <span>Gérer les Clients</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/dashboard/profiles/${p.id}/edit?tab=loyalty`}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                      title="Réglages & Activation"
                    >
                      <Settings className="w-4 h-4" />
                    </Link>
                    <a
                      href={`/c/${p.slug}?view=loyalty`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                      title="Aperçu public de la carte"
                    >
                      <QrCode className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 2: OTHER PROFILES (ONE-CLICK ACTIVATE) ── */}
      {otherProfiles.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Activer la Fidélité sur vos autres cartes ({otherProfiles.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Vous pouvez activer la carte de fidélité sur n'importe quel profil en 1 clic
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherProfiles.map(p => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {p.company || p.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">/c/{p.slug}</span>
                </div>

                <Link
                  href={`/dashboard/profiles/${p.id}/edit?tab=loyalty`}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 border border-purple-200/60"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Activer</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
