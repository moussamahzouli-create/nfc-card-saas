'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Cpu, CheckCircle, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { getNfcProvider } from '@/lib/nfc/NfcWriter';
import { generateCardUrl } from '@/lib/nfc/url';

export default function NfcCardWriterWizard() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Writer Stages: IDLE, PREPARING, WRITING, VERIFYING, SUCCESS, FAILED
  const [stage, setStage] = useState<'IDLE' | 'PREPARING' | 'WRITING' | 'VERIFYING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [nfcMode, setNfcMode] = useState<'web' | 'bridge' | 'mock'>('web');
  const [scannedUid, setScannedUid] = useState<string | null>(null);

  const fetchCardDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cards');
      if (res.ok) {
        const list = await res.json();
        const found = list.find((c: any) => c.id === id || c.cardNumber === id);
        if (found) {
          setCard(found);
        } else {
          setError('Card not found.');
        }
      }
    } catch (e) {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCardDetails();
  }, [id]);

  // Determine active NFC mode support on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!('NDEFReader' in window)) {
        setNfcMode(process.env.NODE_ENV !== 'production' ? 'mock' : 'bridge');
      }
    }
  }, []);

  const handleStartNfcWrite = async () => {
    if (!card) return;
    setError(null);
    setStage('PREPARING');
    setScannedUid(null);

    const provider = getNfcProvider(nfcMode);
    const expectedUrl = generateCardUrl(card.publicToken);

    try {
      // 1. Connect
      await provider.connect();
      
      // 2. Read first to detect card UID
      const readRes = await provider.read();
      if (!readRes.success) {
        setError(readRes.message || 'Tag connection lost.');
        setStage('FAILED');
        await provider.disconnect();
        return;
      }

      setScannedUid(readRes.uid || 'UNKNOWN_UID');
      setStage('WRITING');

      // 3. Write URL
      const writeRes = await provider.writeUrl(expectedUrl);
      if (!writeRes.success) {
        setError(writeRes.message || 'Failed to program NFC memory.');
        setStage('FAILED');
        await provider.disconnect();
        return;
      }

      setStage('VERIFYING');

      // 4. Verify URL
      const verifyRes = await provider.verifyUrl(expectedUrl);
      if (!verifyRes.success) {
        setError(verifyRes.message || 'Payload validation failed.');
        setStage('FAILED');
        await provider.disconnect();
        return;
      }

      // 5. Post to API logs
      const writeLogRes = await fetch(`/api/cards/${card.id}/nfc/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writerDevice: provider.name,
          url: expectedUrl,
        }),
      });

      if (!writeLogRes.ok) {
        setError('Failed to record NFC write operation in database.');
        setStage('FAILED');
        await provider.disconnect();
        return;
      }

      // Log Verification
      await fetch(`/api/cards/${card.id}/nfc/verify`, { method: 'POST' });
      setStage('SUCCESS');

    } catch (err: any) {
      setError(err.message || 'Hardware write operation timed out.');
      setStage('FAILED');
    } finally {
      await provider.disconnect();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const canonicalUrl = card ? generateCardUrl(card.publicToken) : '';
  const linkedProfile = card?.assignments?.[0]?.profile;

  return (
    <div className="space-y-8 font-sans max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/cards"
            className="p-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">NFC Provisioning Console</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Program your physical card NDEF record.</p>
          </div>
        </div>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-500 font-bold uppercase">
          {nfcMode === 'web' ? 'Web NFC' : nfcMode === 'bridge' ? 'Bridge' : 'Mock Mode'}
        </span>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 font-bold rounded-2xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Console Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-8 rounded-3xl shadow-sm text-center space-y-8">
        
        {stage === 'IDLE' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Cpu className="w-8 h-8 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-850 dark:text-white">Ready to Program NFC</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Make sure your device NFC reader is active. Press the button below and tap the card against your device.
              </p>
            </div>

            {/* Target Specs */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-left text-xs font-semibold space-y-1.5 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Linked Profile:</span>
                <span className="text-slate-850 dark:text-white font-bold">{linkedProfile?.name || 'My Profile'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Card Serial:</span>
                <span className="text-slate-850 dark:text-white font-bold">#{card?.cardNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">NDEF Target URL:</span>
                <span className="text-blue-500 font-bold break-all">{canonicalUrl}</span>
              </div>
            </div>

            {/* NFC Mode Selector */}
            <div className="space-y-2 max-w-sm mx-auto pt-3 border-t border-slate-100 dark:border-slate-850">
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider text-left">NFC Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'web', label: 'Web NFC' },
                  { id: 'bridge', label: 'Bridge (USB)' },
                  { id: 'mock', label: 'Mock (Dev)' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setNfcMode(opt.id as any)}
                    className={`py-1.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
                      nfcMode === opt.id
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartNfcWrite}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
            >
              Write NFC Tag
            </button>
          </div>
        )}

        {/* Loading Progress Stages */}
        {['PREPARING', 'WRITING', 'VERIFYING'].includes(stage) && (
          <div className="space-y-6 py-6">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-850 dark:text-white">
                {stage === 'PREPARING' && 'Connecting to reader...'}
                {stage === 'WRITING' && 'Writing canonical URL...'}
                {stage === 'VERIFYING' && 'Verifying NDEF record...'}
              </h3>
              <p className="text-xs text-slate-400">Keep the card close to your reader device antenna.</p>
              {scannedUid && <p className="text-[10px] font-mono text-slate-500 mt-2">UID: {scannedUid}</p>}
            </div>
          </div>
        )}

        {/* Success Screen */}
        {stage === 'SUCCESS' && (
          <div className="space-y-6">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-slate-850 dark:text-white">NFC Written & Verified!</h3>
              <p className="text-xs text-slate-450 max-w-sm mx-auto">
                URL verified successfully matching public profile. The card is fully provisioned and ready for digital sharing.
              </p>
            </div>
            
            <button
              onClick={() => router.push('/dashboard/cards')}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all"
            >
              Go to My Cards
            </button>
          </div>
        )}

        {/* Failed Screen */}
        {stage === 'FAILED' && (
          <div className="space-y-6">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-red-650">NFC Programming Failed</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Unable to complete writing. Please verify your device antenna positioning and retry.
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setStage('IDLE')}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold text-xs rounded-xl cursor-pointer"
              >
                Retry Setup
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
