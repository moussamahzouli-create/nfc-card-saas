'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Plus, ArrowRight, Layers, FileUp, ShieldAlert, Cpu } from 'lucide-react';

export default function CardInventory() {
  const [cards, setCards] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [batchId, setBatchId] = useState('');
  const [productId, setProductId] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newNfcUid, setNewNfcUid] = useState('');
  const [newBatchId, setNewBatchId] = useState('');
  const [newProductId, setNewProductId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        status,
        batchId,
        productId,
        page: page.toString(),
        limit: '10',
      });
      const res = await fetch(`/api/admin/cards?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [resBatches, resProducts] = await Promise.all([
        fetch('/api/admin/batches'),
        fetch('/api/products') // Assume standard product listings from seed
      ]);
      if (resBatches.ok) setBatches(await resBatches.json());
      if (resProducts.ok) setProducts(await resProducts.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchCards();
  }, [search, status, batchId, productId, page]);

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const res = await fetch('/api/admin/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: newCardNumber,
          nfcUid: newNfcUid || null,
          batchId: newBatchId || null,
          productId: newProductId || null,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewCardNumber('');
        setNewNfcUid('');
        fetchCards();
      } else {
        const error = await res.json();
        setFormError(error.error || 'Failed to create card');
      }
    } catch (err) {
      setFormError('Connection error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Card Inventory</h1>
          <p className="text-slate-400 text-sm mt-1">Manage physical hardware tags, serial registers, and activations.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/cards/import"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-sm transition-all"
          >
            <FileUp className="w-4 h-4 text-blue-500" />
            <span>CSV Import</span>
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Card</span>
          </button>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-3xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search card serial, UID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-850 rounded-2xl text-sm focus:outline-none focus:border-blue-500 text-white"
          />
        </div>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-2xl text-sm focus:outline-none focus:border-blue-500 text-slate-300"
        >
          <option value="">All Statuses</option>
          <option value="UNASSIGNED">UNASSIGNED</option>
          <option value="PROVISIONED">PROVISIONED</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="LOST">LOST</option>
          <option value="REPLACED">REPLACED</option>
        </select>

        {/* Batch */}
        <select
          value={batchId}
          onChange={(e) => { setBatchId(e.target.value); setPage(1); }}
          className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-2xl text-sm focus:outline-none focus:border-blue-500 text-slate-300"
        >
          <option value="">All Batches</option>
          {batches.map(b => (
            <option key={b.id} value={b.id}>{b.name || b.batchNumber}</option>
          ))}
        </select>

        {/* Product */}
        <select
          value={productId}
          onChange={(e) => { setProductId(e.target.value); setPage(1); }}
          className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-2xl text-sm focus:outline-none focus:border-blue-500 text-slate-300"
        >
          <option value="">All Products</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Catalog Table */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 text-xs font-bold text-slate-400 uppercase bg-slate-900/20">
                <th className="px-6 py-4">Card Number</th>
                <th className="px-6 py-4">NFC UID</th>
                <th className="px-6 py-4">Product / Batch</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned Profile</th>
                <th className="px-6 py-4">Registration</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading registers...</span>
                  </td>
                </tr>
              ) : cards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-500">No matching physical cards found.</td>
                </tr>
              ) : (
                cards.map(card => {
                  const activeAssign = card.assignments[0];
                  return (
                    <tr key={card.id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{card.cardNumber}</td>
                      <td className="px-6 py-4 font-mono text-xs opacity-75">{card.nfcUid || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="block font-semibold text-xs text-slate-200">{card.product?.name || 'Standard Card'}</span>
                        <span className="block text-[10px] text-slate-500 font-medium">Batch: {card.batch?.name || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          card.status === 'ACTIVE'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/80'
                            : card.status === 'PROVISIONED'
                              ? 'bg-amber-950/40 text-amber-400 border-amber-900/80'
                              : card.status === 'SUSPENDED'
                                ? 'bg-red-950/40 text-red-400 border-red-900/80'
                                : 'bg-slate-950/40 text-slate-400 border-slate-850'
                        }`}>
                          {card.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {activeAssign?.profile ? (
                          <div>
                            <span className="block font-bold text-white text-xs">{activeAssign.profile.name}</span>
                            <span className="block text-[10px] text-slate-500">{activeAssign.user.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(card.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/cards/${card.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <span>Manage</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Strip */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-850 flex justify-between items-center text-xs">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-xl hover:bg-slate-900 disabled:opacity-50 font-bold transition-all cursor-pointer"
            >
              Previous
            </button>
            <span className="text-slate-400">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-xl hover:bg-slate-900 disabled:opacity-50 font-bold transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-white">Register NFC Card</h3>
              <p className="text-xs text-slate-400 mt-1">Insert serial and hardware identifiers to add to stock.</p>
            </div>

            {formError && (
              <div className="p-3.5 bg-red-950/20 border border-red-900 text-red-400 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCard} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-400 mb-1">Card Serial Number (Required)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CARD-2026-0001"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">NFC Chip UID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 04A1B2C3D4E5"
                  value={newNfcUid}
                  onChange={(e) => setNewNfcUid(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Associate Batch</label>
                <select
                  value={newBatchId}
                  onChange={(e) => setNewBatchId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">No Batch</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name || b.batchNumber}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Product SKU</label>
                <select
                  value={newProductId}
                  onChange={(e) => setNewProductId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="">No Product Type</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 border border-slate-800 hover:bg-slate-850 rounded-xl text-slate-300 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
