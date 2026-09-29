'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// ─── SLUG INPUT SCREEN ────────────────────────────────────────────────────────

function SlugScreen({ onSlugConfirmed }: { onSlugConfirmed: (slug: string) => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const slug = value.trim().toLowerCase();
    if (!slug) { setError('Entrez l\'identifiant de votre magasin'); return; }
    onSlugConfirmed(slug);
  };

  return (
    <div>
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h2 className="text-white font-bold text-xl mb-1">Identifiant du magasin</h2>
        <p className="text-purple-300 text-sm">Entrez le nom d'identifiant de votre magasin</p>
      </div>

      <input
        type="text"
        value={value}
        onChange={e => { setValue(e.target.value); setError(''); }}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        placeholder="ex: cafe-nasro"
        autoFocus
        className="w-full bg-white/10 border border-white/20 text-white placeholder-purple-400 rounded-2xl px-4 py-3 mb-3 text-center text-lg outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
      />

      {error && (
        <p className="text-red-300 text-sm text-center mb-3 bg-red-900/30 rounded-xl py-2">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 active:from-purple-700 active:to-purple-600 text-white font-semibold rounded-2xl py-3 transition-all duration-200"
      >
        Continuer →
      </button>
    </div>
  );
}

// ─── PIN KEYPAD SCREEN ────────────────────────────────────────────────────────

function PinScreen({ slug, onBack }: { slug: string; onBack: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleKey = (key: string) => {
    if (submitting) return;
    setError('');

    if (key === '⌫') {
      setPin(prev => prev.slice(0, -1));
      return;
    }
    if (pin.length >= 4) return;
    const nextPin = pin + key;
    setPin(nextPin);

    if (nextPin.length === 4) {
      submitPin(nextPin);
    }
  };

  const submitPin = async (pinValue: string) => {
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/merchant/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, pin: pinValue }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        // Redirect to merchant dashboard
        window.location.href = `/merchant/${json.slug}`;
      } else {
        setError(json.error || 'Code PIN incorrect. Réessayez.');
        setPin('');
        setSubmitting(false);
      }
    } catch {
      setError('Erreur de connexion. Réessayez.');
      setPin('');
      setSubmitting(false);
    }
  };

  const KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, '⌫'];

  return (
    <div>
      {/* Store name */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="text-white font-bold text-xl mb-1">Code d'accès</h2>
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-purple-300 text-sm">Magasin :</span>
          <span className="text-white font-semibold text-sm">{slug}</span>
        </div>
        <p className="text-purple-400 text-xs">Entrez votre code PIN commerçant</p>
      </div>

      {/* PIN dots */}
      <div className="flex justify-center gap-4 mb-6">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="w-4 h-4 rounded-full border-2 transition-all duration-200"
            style={{
              borderColor: i < pin.length ? '#a855f7' : '#9333ea',
              background: i < pin.length ? '#a855f7' : 'transparent',
              transform: i < pin.length ? 'scale(1.2)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 text-center">
          <p className="text-red-300 text-sm bg-red-900/30 rounded-xl py-2 px-4">{error}</p>
        </div>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {KEYS.map((k, idx) => {
          if (k === null) return <div key={idx} />;
          return (
            <button
              key={idx}
              onClick={() => handleKey(String(k))}
              disabled={submitting}
              className="bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:opacity-40 border border-white/20 text-white rounded-2xl h-14 text-xl font-semibold transition-all duration-150 select-none"
            >
              {k}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {submitting && (
        <div className="text-center py-3">
          <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-purple-300 text-sm">Vérification...</p>
        </div>
      )}

      {/* Back */}
      <button
        onClick={onBack}
        disabled={submitting}
        className="w-full text-center text-purple-400 hover:text-purple-300 text-sm py-2 transition-colors disabled:opacity-40"
      >
        ← Changer de magasin
      </button>
    </div>
  );
}

// ─── MAIN LOGIN PAGE ──────────────────────────────────────────────────────────

export default function MerchantLoginClient() {
  const searchParams = useSearchParams();
  const initialStore = searchParams.get('store') || '';
  const [slug, setSlug] = useState(initialStore);
  const [screen, setScreen] = useState<'slug' | 'pin'>(initialStore ? 'pin' : 'slug');

  const handleSlugConfirmed = (s: string) => {
    setSlug(s);
    setScreen('pin');
    // Update URL without reload so refresh stays on PIN screen
    window.history.replaceState(null, '', `/merchant/login?store=${encodeURIComponent(s)}`);
  };

  const handleBack = () => {
    setSlug('');
    setScreen('slug');
    window.history.replaceState(null, '', '/merchant/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">B</div>
            <div className="text-left">
              <div className="text-white font-bold text-lg leading-tight">BRAND XPER</div>
              <div className="text-purple-300 text-xs">Espace Commerçant</div>
            </div>
          </div>
          <p className="text-purple-300 text-sm">Tableau de bord privé</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-7 shadow-2xl">
          {screen === 'slug' ? (
            <SlugScreen onSlugConfirmed={handleSlugConfirmed} />
          ) : (
            <PinScreen slug={slug} onBack={handleBack} />
          )}
        </div>

        <p className="text-center text-purple-500 text-xs mt-5">
          Zone sécurisée réservée aux commerçants • Brand Xper
        </p>
      </div>
    </div>
  );
}
