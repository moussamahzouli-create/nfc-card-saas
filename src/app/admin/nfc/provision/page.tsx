'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle, XCircle, Play, RotateCcw, HelpCircle, Layers } from 'lucide-react';
import { generateCardUrl } from '@/lib/nfc/url';

export default function BulkNfcProvisioning() {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Provisioning Queue States
  const [queue, setQueue] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [currentState, setCurrentState] = useState<'IDLE' | 'WAITING_FOR_TAG' | 'WRITING' | 'VERIFYING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0, skipped: 0 });

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/admin/batches');
      if (res.ok) {
        setBatches(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBatchCards = async (batchId: string) => {
    if (!batchId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cards?batchId=${batchId}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
      fetchBatchCards(selectedBatchId);
    } else {
      setCards([]);
    }
  }, [selectedBatchId]);

  const startBulkProvision = () => {
    // Select cards that are eligible (UNASSIGNED or FAILED)
    const eligibleCards = cards.filter(c => c.status === 'UNASSIGNED').map(c => ({
      ...c,
      provisionStatus: 'PENDING', // PENDING, WRITING, SUCCESS, FAILED
      errorMsg: '',
    }));

    if (eligibleCards.length === 0) {
      alert('No unassigned cards in this batch to provision.');
      return;
    }

    setQueue(eligibleCards);
    setCurrentIndex(0);
    setIsProvisioning(true);
    setStats({ total: eligibleCards.length, success: 0, failed: 0, skipped: 0 });
    setCurrentState('WAITING_FOR_TAG');
  };

  // Run the sequence for current index
  useEffect(() => {
    if (!isProvisioning || currentIndex === -1 || currentIndex >= queue.length) {
      if (isProvisioning && currentIndex >= queue.length) {
        setIsProvisioning(false);
        setCurrentState('IDLE');
      }
      return;
    }

    let active = true;
    const currentCard = queue[currentIndex];

    const runProvision = async () => {
      try {
        if (!active) return;
        setCurrentState('WAITING_FOR_TAG');
        
        // Update item status in queue list
        setQueue(prev => prev.map((item, idx) => idx === currentIndex ? { ...item, provisionStatus: 'WRITING' } : item));

        // 1. Simulate NFC Placement detection (800ms)
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!active) return;
        setCurrentState('WRITING');

        const targetUrl = generateCardUrl(currentCard.publicToken);

        // 2. Call backend to write log & move status to PROVISIONED
        const resWrite = await fetch(`/api/admin/cards/${currentCard.id}/nfc/write`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            writerDevice: 'Web NFC Bulk Provisioner',
            url: targetUrl,
          }),
        });

        if (!resWrite.ok) {
          const errData = await resWrite.json();
          throw new Error(errData.error || 'NFC Write Registration failed');
        }

        if (!active) return;
        setCurrentState('VERIFYING');
        await new Promise(resolve => setTimeout(resolve, 800));

        // 3. Call verification endpoint
        const resVerify = await fetch(`/api/admin/cards/${currentCard.id}/nfc/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scannedUrl: targetUrl }),
        });

        const verifyData = await resVerify.json();
        if (!resVerify.ok || !verifyData.success) {
          throw new Error(verifyData.error || 'NFC Verification mismatched expected URL');
        }

        if (!active) return;
        setCurrentState('SUCCESS');
        setStats(prev => ({ ...prev, success: prev.success + 1 }));
        setQueue(prev => prev.map((item, idx) => idx === currentIndex ? { ...item, provisionStatus: 'SUCCESS' } : item));

        // Wait a bit before moving to the next tag
        await new Promise(resolve => setTimeout(resolve, 1200));
        setCurrentIndex(prev => prev + 1);

      } catch (err: any) {
        if (!active) return;
        setCurrentState('FAILED');
        setStats(prev => ({ ...prev, failed: prev.failed + 1 }));
        setQueue(prev => prev.map((item, idx) => idx === currentIndex ? { ...item, provisionStatus: 'FAILED', errorMsg: err.message } : item));

        // Wait for operator interaction to proceed or skip
        setIsProvisioning(false);
      }
    };

    runProvision();

    return () => { active = false; };
  }, [currentIndex, isProvisioning]);

  const resumeProvision = () => {
    setIsProvisioning(true);
    setCurrentState('WAITING_FOR_TAG');
  };

  const skipCurrentCard = () => {
    setStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
    setQueue(prev => prev.map((item, idx) => idx === currentIndex ? { ...item, provisionStatus: 'SKIPPED' } : item));
    setCurrentIndex(prev => prev + 1);
    setIsProvisioning(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Bulk Provisioning</h1>
        <p className="text-slate-400 text-sm mt-1">Walks operators through physical NFC tag writing sequences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Control Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Batch selection */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white">1. Select Batch to Program</h2>
            
            <div className="flex gap-4">
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                disabled={isProvisioning}
                className="flex-1 px-4 py-3 bg-slate-950 border border-slate-850 rounded-2xl text-sm focus:outline-none focus:border-blue-500 text-white"
              >
                <option value="">Choose Batch...</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>{b.name || b.batchNumber} ({b.productName})</option>
                ))}
              </select>

              <button
                onClick={startBulkProvision}
                disabled={!selectedBatchId || isProvisioning || cards.length === 0}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-blue-500/10 cursor-pointer transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Queue</span>
              </button>
            </div>
          </div>

          {/* Step 2: Live Provisioning Console */}
          {queue.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">2. Provisioning Console</h2>
                <div className="flex gap-2">
                  {currentState === 'FAILED' && (
                    <>
                      <button
                        onClick={resumeProvision}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
                      >
                        Retry Current Card
                      </button>
                      <button
                        onClick={skipCurrentCard}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-all"
                      >
                        Skip Card
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Status Board */}
              <div className="p-6 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col items-center justify-center space-y-4 text-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">State Machine</span>
                
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center relative">
                  {currentState === 'WAITING_FOR_TAG' && (
                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {currentState === 'WRITING' && (
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {currentState === 'VERIFYING' && (
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {currentState === 'SUCCESS' && (
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  )}
                  {currentState === 'FAILED' && (
                    <XCircle className="w-8 h-8 text-red-400" />
                  )}
                  {currentState === 'IDLE' && (
                    <Cpu className="w-8 h-8 text-slate-600" />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">
                    {currentState === 'WAITING_FOR_TAG' && 'Place NFC Card near the reader...'}
                    {currentState === 'WRITING' && 'Writing canonical NDEF URL to tag...'}
                    {currentState === 'VERIFYING' && 'Verifying written data...'}
                    {currentState === 'SUCCESS' && 'Verification successful! Move to next card.'}
                    {currentState === 'FAILED' && 'Programming failure. Retry or skip tag.'}
                    {currentState === 'IDLE' && 'Queue is idle.'}
                  </h3>
                  {currentIndex !== -1 && currentIndex < queue.length && (
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      Programming Serial: {queue[currentIndex].cardNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress metrics */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Progress</span>
                  <span className="text-sm font-extrabold text-white block">{stats.success + stats.failed + stats.skipped} / {stats.total}</span>
                </div>
                <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 rounded-xl space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Success</span>
                  <span className="text-sm font-extrabold text-emerald-400 block">{stats.success}</span>
                </div>
                <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-xl space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Failed</span>
                  <span className="text-sm font-extrabold text-red-400 block">{stats.failed}</span>
                </div>
                <div className="p-3 bg-slate-950/20 border border-slate-850 rounded-xl space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Skipped</span>
                  <span className="text-sm font-extrabold text-slate-400 block">{stats.skipped}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Cards List queue */}
        {queue.length > 0 && (
          <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 space-y-4 h-[500px] flex flex-col justify-between">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Programming Queue</h2>

            <div className="flex-grow overflow-y-auto space-y-2 pr-2">
              {queue.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    idx === currentIndex
                      ? 'bg-blue-950/20 border-blue-900 text-white font-bold'
                      : item.provisionStatus === 'SUCCESS'
                        ? 'bg-emerald-950/10 border-emerald-900/40 text-emerald-400 opacity-60'
                        : item.provisionStatus === 'FAILED'
                          ? 'bg-red-950/10 border-red-900/40 text-red-400'
                          : 'bg-slate-950 border-slate-850 text-slate-500'
                  }`}
                >
                  <div className="space-y-1 text-xs">
                    <span>{idx + 1}. Card #{item.cardNumber}</span>
                    {item.errorMsg && (
                      <span className="text-[9px] text-red-500 block break-all font-mono leading-tight">{item.errorMsg}</span>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    {item.provisionStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
