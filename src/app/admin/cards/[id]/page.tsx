'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Cpu, UserCheck, ShieldAlert, Ban, RefreshCw, QrCode, Download, Link2, Copy, CheckCircle, Trash2, Calendar, FileClock } from 'lucide-react';
import { generateCardUrl } from '@/lib/nfc/url';

export default function CardDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [card, setCard] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Assignment states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [searchProfile, setSearchProfile] = useState('');

  // Replace states
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [availableCards, setAvailableCards] = useState<any[]>([]);
  const [selectedReplacementId, setSelectedReplacementId] = useState('');

  // NFC Mock Provider Simulation state
  const [nfcState, setNfcState] = useState<'IDLE' | 'WAITING' | 'WRITING' | 'VERIFYING' | 'SUCCESS' | 'FAILED'>('IDLE');

  const fetchCardData = async () => {
    try {
      const res = await fetch(`/api/admin/cards/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCard(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/admin/cards/${id}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadProfiles = async () => {
    try {
      const res = await fetch('/api/profiles'); // Lists profiles
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAvailableReplacementCards = async () => {
    try {
      const res = await fetch('/api/admin/cards?status=UNASSIGNED');
      if (res.ok) {
        const data = await res.json();
        setAvailableCards(data.cards);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      await Promise.all([fetchCardData(), fetchHistory()]);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleAction = async (endpoint: string, payload = {}) => {
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/cards/${id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        setMessage(`Card operation '${endpoint}' succeeded!`);
        fetchCardData();
        fetchHistory();
      } else {
        setError(json.error || 'Operation failed');
      }
    } catch (e) {
      setError('Connection failure');
    }
  };

  // Simulate NFC Writing on browser
  const simulateNfcWrite = async () => {
    if (!card) return;
    setNfcState('WAITING');
    setMessage(null);
    setError(null);

    const nfcUrl = generateCardUrl(card.publicToken);

    try {
      // Step 1: Wait for tag (Simulation)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setNfcState('WRITING');

      // Step 2: Write NDEF (Call Backend Write logging endpoint)
      const resWrite = await fetch(`/api/admin/cards/${id}/nfc/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          writerDevice: 'Web NFC Mock Client',
          url: nfcUrl,
        }),
      });

      if (!resWrite.ok) {
        const errJson = await resWrite.json();
        throw new Error(errJson.error || 'Server registration failed');
      }

      setNfcState('VERIFYING');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Verify read tag matches
      const resVerify = await fetch(`/api/admin/cards/${id}/nfc/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scannedUrl: nfcUrl }),
      });

      const verifyJson = await resVerify.json();
      if (!resVerify.ok || !verifyJson.success) {
        throw new Error(verifyJson.error || 'Tag URL verification failed');
      }

      setNfcState('SUCCESS');
      setMessage('NFC programming & verification succeeded!');
      fetchCardData();
      fetchHistory();
    } catch (err: any) {
      setNfcState('FAILED');
      setError(err.message || 'NFC write operation failed.');
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileId) return;
    await handleAction('assign', { profileId: selectedProfileId });
    setShowAssignModal(false);
  };

  const handleReplace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReplacementId) return;
    await handleAction('replace', { newCardId: selectedReplacementId });
    setShowReplaceModal(false);
  };

  const handleCopyUrl = () => {
    if (!card) return;
    navigator.clipboard.writeText(generateCardUrl(card.publicToken));
    setMessage('NFC Public URL copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-3xl">
        <p className="text-slate-400">Card not found</p>
      </div>
    );
  }

  const publicUrl = generateCardUrl(card.publicToken);
  const activeAssign = card.assignments.find((a: any) => a.status === 'ACTIVE');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/cards"
          className="p-3 bg-slate-900 border border-slate-850 hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Card #{card.cardNumber}</h1>
          <p className="text-slate-400 text-sm mt-1">Manage physical variables, programming statuses, and assigned customer profiles.</p>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-900 text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900 text-red-400 text-xs font-bold rounded-2xl flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left details grid */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card Information block */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white">Device Information</h2>

            <div className="grid grid-cols-2 gap-6 text-xs font-semibold">
              <div>
                <span className="text-slate-500 block mb-1">NFC Chip UID</span>
                <span className="text-sm font-mono text-white">{card.nfcUid || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Product SKU</span>
                <span className="text-sm text-white">{card.product?.sku || 'NFC-STANDARD'}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Public Token</span>
                <span className="text-sm font-mono text-white">{card.publicToken}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border w-fit block mt-1 ${
                  card.status === 'ACTIVE'
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900'
                    : card.status === 'PROVISIONED'
                      ? 'bg-amber-950/40 text-amber-400 border-amber-900'
                      : 'bg-slate-950/40 text-slate-400 border-slate-850'
                }`}>
                  {card.status}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-850 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Target NDEF URL</span>
                <span className="text-xs font-mono text-blue-400 break-all">{publicUrl}</span>
              </div>
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-850 text-[10px] font-bold transition-all cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </button>
            </div>
          </div>

          {/* Provisioning Actions */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white">NFC Hardware Provisioning</h2>

            <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">Mock Hardware Status:</span>
                <span className="text-white font-bold">{nfcState}</span>
              </div>
              {nfcState !== 'IDLE' && (
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full bg-blue-500 ${
                    nfcState === 'WAITING' ? 'w-1/3' : nfcState === 'WRITING' ? 'w-2/3' : 'w-full'
                  } transition-all duration-700`} />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-bold">
              <button
                onClick={simulateNfcWrite}
                disabled={nfcState === 'WAITING' || nfcState === 'WRITING'}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-md shadow-blue-500/10 cursor-pointer transition-all flex items-center gap-2"
              >
                <Cpu className="w-4 h-4" />
                <span>Simulate NFC Write & Verify</span>
              </button>

              <button
                onClick={() => handleAction('activate')}
                disabled={!activeAssign}
                className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-850 text-emerald-400 cursor-pointer transition-all"
              >
                Activate Card
              </button>
              <button
                onClick={() => handleAction('suspend')}
                className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-850 text-red-400 cursor-pointer transition-all"
              >
                Suspend Card
              </button>
              <button
                onClick={() => handleAction('lost')}
                className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-850 text-orange-400 cursor-pointer transition-all"
              >
                Mark Lost
              </button>
            </div>
          </div>

          {/* Card Event History */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileClock className="w-5 h-5 text-blue-500" />
              <span>Event Timeline Log</span>
            </h2>

            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
              {history.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">No history timeline events registered.</p>
              ) : (
                history.map((event: any, idx: number) => (
                  <div key={idx} className="flex gap-4 relative pl-8">
                    <div className="w-7 h-7 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center absolute left-0 top-0 text-[10px] text-blue-400 font-bold z-10">
                      {idx + 1}
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-white block">{event.title}</span>
                      <span className="text-xs text-slate-400 block">{event.details}</span>
                      <span className="text-[10px] text-slate-500 block">
                        {new Date(event.timestamp).toLocaleString()} | Operator: {event.operator}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right QR code & profile assignment panel */}
        <div className="space-y-8">
          {/* QR Display block */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 text-center space-y-6 flex flex-col items-center">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest self-start">QR Identification</h2>
            
            <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center p-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`}
                className="w-full h-full object-contain"
                alt="QR Identifier"
              />
            </div>

            <div className="w-full flex gap-3 text-xs font-bold">
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(publicUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-300 hover:text-white rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4 text-blue-500" />
                <span>Download</span>
              </a>
            </div>
          </div>

          {/* Assignment Management */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-6 space-y-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Active Profile</h2>

            {activeAssign?.profile ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Assigned To</span>
                  <span className="text-sm font-bold text-white block">{activeAssign.profile.name}</span>
                  <span className="text-xs text-slate-400 block">{activeAssign.user.email}</span>
                </div>
                
                <div className="flex gap-3 text-xs font-bold">
                  <button
                    onClick={() => { loadProfiles(); setShowAssignModal(true); }}
                    className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-300 hover:text-white rounded-xl cursor-pointer transition-all"
                  >
                    Transfer
                  </button>
                  <button
                    onClick={() => handleAction('unassign')}
                    className="flex-1 py-3 bg-red-950/20 hover:bg-red-950/40 border border-red-900/50 text-red-400 rounded-xl cursor-pointer transition-all"
                  >
                    Unassign
                  </button>
                </div>

                <button
                  onClick={() => { loadAvailableReplacementCards(); setShowReplaceModal(true); }}
                  className="w-full py-3 bg-slate-950 hover:bg-slate-800 border border-slate-850 text-orange-400 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Replace with New Card
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-slate-500 text-xs">No profile is assigned to this card.</p>
                <button
                  onClick={() => { loadProfiles(); setShowAssignModal(true); }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Assign Profile</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-white">Assign Profile</h3>
              <p className="text-xs text-slate-400 mt-1">Select a business profile to map with card #{card.cardNumber}.</p>
            </div>

            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Select Profile</label>
                <select
                  required
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose profile...</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.slug})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 py-3 border border-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedProfileId}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Replacement Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-white">Card Replacement</h3>
              <p className="text-xs text-slate-400 mt-1">Map the current profile to a new physical card. This permanently marks this card as REPLACED.</p>
            </div>

            <form onSubmit={handleReplace} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Choose Unassigned Replacement Card</label>
                <select
                  required
                  value={selectedReplacementId}
                  onChange={(e) => setSelectedReplacementId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select stock serial...</option>
                  {availableCards.map(c => (
                    <option key={c.id} value={c.id}>Card #{c.cardNumber}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReplaceModal(false)}
                  className="flex-1 py-3 border border-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedReplacementId}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Confirm Replacement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
