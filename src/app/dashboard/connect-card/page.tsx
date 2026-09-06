'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, ShieldCheck, Layers, Link2, CheckCircle, AlertTriangle, Cpu, Copy, Download, RefreshCw, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getNfcProvider, type NfcProvider } from '@/lib/nfc/NfcWriter';
import { generateCardUrl } from '@/lib/nfc/url';

export default function ConnectCardWizard() {
  const router = useRouter();
  
  // Stages: 1 = Profile & Card Selection, 2 = NFC Connection & Write, 3 = Success
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);

  // Selection states
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [customSerial, setCustomSerial] = useState('');
  const [useCustomSerial, setUseCustomSerial] = useState(false);

  // NFC states
  const [nfcMode, setNfcMode] = useState<'web' | 'bridge' | 'mock'>('web');
  const [nfcStage, setNfcStage] = useState<'IDLE' | 'WAITING' | 'DETECTED' | 'WRITING' | 'VERIFYING' | 'FAILED'>('IDLE');
  const [scannedUid, setScannedUid] = useState<string | null>(null);
  const [detectedUrl, setDetectedUrl] = useState<string | null>(null);
  const [providerInstance, setProviderInstance] = useState<NfcProvider | null>(null);

  // Fetch initial profile & card options
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch profiles
        const resProfiles = await fetch('/api/profiles');
        if (resProfiles.ok) {
          const data = await resProfiles.json();
          setProfiles(data);
          if (data.length > 0) setSelectedProfileId(data[0].id);
        }
        
        // Fetch cards
        const resCards = await fetch('/api/cards');
        if (resCards.ok) {
          const data = await resCards.json();
          setCards(data);
          // Auto select first card if available
          if (data.length > 0) setSelectedCardId(data[0].id);
        }
      } catch (e) {
        console.error('Failed to load provisioning prerequisites', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Determine active NFC mode support on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!('NDEFReader' in window)) {
        // If Web NFC isn't supported, try Bridge/Mock default
        setNfcMode(process.env.NODE_ENV !== 'production' ? 'mock' : 'bridge');
      }
    }
  }, []);

  // Handle selected card target URL
  const getSelectedCardObj = useCallback(() => {
    if (useCustomSerial) {
      return { id: customSerial, cardNumber: customSerial, publicToken: customSerial, status: 'AVAILABLE' };
    }
    return cards.find(c => c.id === selectedCardId);
  }, [cards, selectedCardId, customSerial, useCustomSerial]);

  // Connect & Wait for Tag
  const handleStartNfcConnection = async () => {
    setError(null);
    setNfcStage('WAITING');
    setScannedUid(null);

    const provider = getNfcProvider(nfcMode);
    setProviderInstance(provider);

    try {
      await provider.connect();
      
      // Step: Read Tag to detect UID
      const readRes = await provider.read();
      if (readRes.success) {
        setScannedUid(readRes.uid || 'UNKNOWN_UID');
        setNfcStage('DETECTED');
        if (readRes.records && readRes.records.length > 0) {
          setDetectedUrl(readRes.records[0].data);
        }
      } else {
        setError(readRes.message || 'Failed to detect NFC tag.');
        setNfcStage('FAILED');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to NFC reader.');
      setNfcStage('FAILED');
    }
  };

  // Write canonical NDEF URL and verify
  const handleWriteNfc = async () => {
    if (!providerInstance) return;
    setError(null);
    setNfcStage('WRITING');

    const card = getSelectedCardObj();
    if (!card) {
      setError('Please select a valid card first.');
      setNfcStage('FAILED');
      return;
    }

    // Generate expected canonical URL using publicToken
    const expectedUrl = generateCardUrl(card.publicToken);

    try {
      // 1. Write NDEF URL
      const writeRes = await providerInstance.writeUrl(expectedUrl);
      if (!writeRes.success) {
        setError(writeRes.message || 'NFC Write failed.');
        setNfcStage('FAILED');
        return;
      }

      setNfcStage('VERIFYING');

      // 2. Read back & verify NDEF URL
      const verifyRes = await providerInstance.verifyUrl(expectedUrl);
      if (!verifyRes.success) {
        setError(verifyRes.message || 'NFC Verification mismatch.');
        setNfcStage('FAILED');
        return;
      }

      // 3. Post writes & assignments metadata to Server DB
      // Log Write Action
      const writeLogRes = await fetch(`/api/cards/${card.id}/nfc/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writerDevice: providerInstance.name,
          url: expectedUrl,
        }),
      });

      if (!writeLogRes.ok) {
        setError('Failed to record NFC write metadata in database.');
        setNfcStage('FAILED');
        return;
      }

      // Log Verification Action
      await fetch(`/api/cards/${card.id}/nfc/verify`, { method: 'POST' });

      // Link Selected Profile (Assignment)
      const assignRes = await fetch(`/api/cards/${card.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: selectedProfileId }),
      });

      const assignData = await assignRes.json();

      if (assignRes.ok) {
        setSuccess({
          profileName: assignData.profileName || profiles.find(p => p.id === selectedProfileId)?.name,
          cardId: card.cardNumber,
          slug: assignData.slug,
          publicToken: card.publicToken,
        });
        setStep(3);
      } else {
        setError(assignData.error || 'Failed to complete assignment.');
        setNfcStage('FAILED');
      }

    } catch (err: any) {
      setError(err.message || 'NFC write operation aborted.');
      setNfcStage('FAILED');
    } finally {
      await providerInstance.disconnect();
    }
  };

  const handleCopyUrl = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/c/${slug}`);
  };

  return (
    <div className="min-h-[550px] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-8 shadow-sm">
        
        {/* Wizard step header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-850 dark:text-white">NFC Provisioning Wizard</h1>
              <span className="text-[10px] text-blue-500 font-bold block">Step {step} of 3</span>
            </div>
          </div>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-500 font-bold uppercase">
            {nfcMode === 'web' ? 'Web NFC' : nfcMode === 'bridge' ? 'Bridge' : 'Mock Mode'}
          </span>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 font-bold rounded-2xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: CHOOSE PROFILE & CARD */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Profile Dropdown */}
            <div className="space-y-2">
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Select Profile *</label>
              {profiles.length === 0 ? (
                <p className="text-xs text-red-500 font-bold">Please create a business profile first before linking cards.</p>
              ) : (
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.slug})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Card Dropdown or Custom code toggle */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Select Physical Card *</label>
                <button type="button" onClick={() => setUseCustomSerial(p => !p)} className="text-[10px] text-blue-500 font-bold hover:underline">
                  {useCustomSerial ? 'Choose Owned List' : 'Enter Serial Code'}
                </button>
              </div>

              {useCustomSerial ? (
                <input
                  type="text"
                  value={customSerial}
                  onChange={(e) => setCustomSerial(e.target.value)}
                  placeholder="Enter serial number (e.g. CARD-0001)"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none"
                />
              ) : cards.length === 0 ? (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-orange-650 text-xs font-semibold">
                  No unassigned physical cards found in your catalog. Please toggle "Enter Serial Code" to link a new card.
                </div>
              ) : (
                <select
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none"
                >
                  {cards.map(c => (
                    <option key={c.id} value={c.id}>Serial: #{c.cardNumber} ({c.status})</option>
                  ))}
                </select>
              )}
            </div>

            {/* NFC Mode Selector */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">NFC Hardware Interface</label>
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
                    className={`py-2 px-3 border rounded-xl text-[10px] font-bold text-center transition-all cursor-pointer ${
                      nfcMode === opt.id
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!selectedProfileId || (!useCustomSerial && cards.length === 0) || (useCustomSerial && !customSerial.trim())}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all"
            >
              Continue to NFC Setup
            </button>
          </div>
        )}

        {/* STEP 2: CONNECT NFC CARD */}
        {step === 2 && (
          <div className="space-y-6 text-center">
            {nfcStage === 'IDLE' && (
              <div className="space-y-6">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Cpu className="w-8 h-8 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-slate-850 dark:text-white">Ready for NFC Connection</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Ensure your selected NFC mode interface is connected. Press the button below to start scan.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer">
                    Back
                  </button>
                  <button onClick={handleStartNfcConnection} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow">
                    Start NFC Scan
                  </button>
                </div>
              </div>
            )}

            {nfcStage === 'WAITING' && (
              <div className="space-y-6 py-6">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-slate-850 dark:text-white">Waiting for NFC card...</h3>
                  <p className="text-xs text-slate-400">Place your NFC card on the reader antenna area.</p>
                </div>
              </div>
            )}

            {nfcStage === 'DETECTED' && (
              <div className="space-y-6">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-slate-850 dark:text-white">NFC Card Detected</h3>
                  <p className="text-xs text-slate-400">NFC antenna verified. Ready to program profile record.</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-left text-xs font-semibold space-y-1.5 max-w-sm mx-auto">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Card Serial:</span>
                    <span className="text-slate-850 dark:text-white font-bold">#{getSelectedCardObj()?.cardNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Card UID:</span>
                    <span className="text-slate-850 dark:text-white font-mono text-[10px] font-bold">{scannedUid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Selected Profile:</span>
                    <span className="text-slate-850 dark:text-white font-bold">{profiles.find(p => p.id === selectedProfileId)?.name}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setNfcStage('IDLE')} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer">
                    Reset Scan
                  </button>
                  <button onClick={handleWriteNfc} className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs rounded-xl cursor-pointer shadow">
                    Write NFC URL
                  </button>
                </div>
              </div>
            )}

            {['WRITING', 'VERIFYING'].includes(nfcStage) && (
              <div className="space-y-6 py-6">
                <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-slate-850 dark:text-white">
                    {nfcStage === 'WRITING' ? 'Writing NDEF profile URL...' : 'Verifying payload configuration...'}
                  </h3>
                  <p className="text-xs text-slate-400">Keep the tag steady on the reader.</p>
                </div>
              </div>
            )}

            {nfcStage === 'FAILED' && (
              <div className="space-y-6">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-650 rounded-2xl flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-red-650">NFC Programming Failed</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    NFC transaction failed. Position the tag correctly and restart connection.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-850 font-bold text-xs rounded-xl cursor-pointer">
                    Change Setup
                  </button>
                  <button onClick={handleStartNfcConnection} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow">
                    Retry Scan
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: SUCCESS & PROVISIONS SUMMARY */}
        {step === 3 && (
          <div className="text-center space-y-6 py-4">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">NFC Card Connected!</h2>
              <p className="text-xs text-slate-450 max-w-sm mx-auto">
                Your physical card has been bound and programmed to profile **{success?.profileName}**.
              </p>
            </div>

            {/* Target card details */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-left text-xs font-semibold space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Card Number:</span>
                <span className="text-slate-850 dark:text-white font-bold">#{success?.cardId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Redirect Link:</span>
                <span className="text-blue-500 font-bold break-all">{window.location.origin}/c/{success?.publicToken}</span>
              </div>
            </div>

            {/* Action panel */}
            <div className="flex flex-col gap-2.5 max-w-sm mx-auto pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between gap-3 text-xs font-bold">
                <button
                  onClick={() => handleCopyUrl(success?.publicToken)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-blue-500" />
                  Copy Link
                </button>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(generateCardUrl(success?.publicToken))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-purple-500" />
                  QR Download
                </a>
              </div>
              <button
                onClick={() => router.push('/dashboard/cards')}
                className="w-full py-3 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                Go to My Cards
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
