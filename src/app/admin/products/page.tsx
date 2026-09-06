'use client';

import React, { useEffect, useState } from 'react';
import { Package, Plus, Trash2, Edit3, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states for creating products
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(19.99);
  const [currency, setCurrency] = useState('USD');
  const [nfcType, setNfcType] = useState('Ntag213');
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE' | 'ARCHIVED'>('ACTIVE');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) setProducts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          sku,
          description,
          price,
          currency,
          nfcType,
          status,
        }),
      });
      if (res.ok) {
        setMessage('Product created successfully.');
        setShowAddForm(false);
        fetchProducts();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create product.');
      }
    } catch (e) {
      setError('Connection failure.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This will remove all associated variant registers.')) {
      return;
    }
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Product deleted.');
        fetchProducts();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete product.');
      }
    } catch (e) {
      setError('Connection failure.');
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Products Catalogs</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage physical hardware products, custom variants, and pricing structures.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Product</span>
          </button>
          <button
            onClick={fetchProducts}
            className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl transition-all cursor-pointer text-slate-500"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 font-bold rounded-2xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-lg font-bold text-slate-850 dark:text-white">Register New Product</h3>
              <p className="text-xs text-slate-400 mt-1">Specify catalog pricing and SKU registers.</p>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">NFC Chip Type</label>
                  <input
                    type="text"
                    required
                    value={nfcType}
                    onChange={(e) => setNfcType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Currency</label>
                  <input
                    type="text"
                    required
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">SKU: {product.sku}</span>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white mt-0.5">{product.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                  product.status === 'ACTIVE'
                    ? 'bg-emerald-50 border-emerald-250 text-emerald-600'
                    : 'bg-orange-50 border-orange-200 text-orange-600'
                }`}>
                  {product.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">{product.description || 'No description available.'}</p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-850">
              <span className="text-lg font-black text-slate-900 dark:text-white">${product.price} {product.currency}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl cursor-pointer transition-all border border-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
