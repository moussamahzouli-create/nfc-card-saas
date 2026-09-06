'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Edit3, User, CheckCircle, ShieldAlert, RefreshCw, Search } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/orders?${query.toString()}`);
      if (res.ok) setOrders(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setMessage('Order status updated successfully.');
        fetchOrders();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update order status.');
      }
    } catch (e) {
      setError('Connection failure.');
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Fulfillment Orders</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Process shipments, manage checkouts, and verify payments.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-2xl transition-all cursor-pointer text-slate-550"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-600 font-bold rounded-2xl text-xs flex items-center gap-2">
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

      {/* Filter strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-5 flex flex-col sm:flex-row gap-4 shadow-sm">
        {/* Search */}
        <div className="flex-grow flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold">
          <Search className="w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-slate-700 dark:text-slate-350"
            placeholder="Search by Order ID, Customer name or email..."
          />
        </div>

        {/* Status selector */}
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl text-xs text-slate-400">
          No system orders match the query criteria.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs font-semibold">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 border-b border-slate-100 dark:border-slate-850">
                <th className="p-4">Order Number</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4 text-center">Fulfillment Status</th>
                <th className="p-4 text-right">Price Total</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-all"
                >
                  <td className="p-4 font-extrabold text-slate-850 dark:text-white">{order.orderNumber}</td>
                  <td className="p-4 text-slate-450">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white block">{order.user.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{order.user.email}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                      order.status === 'PAID' || order.status === 'DELIVERED'
                        ? 'bg-emerald-50 border-emerald-250 text-emerald-600'
                        : order.status === 'CANCELLED'
                          ? 'bg-red-50 border-red-200 text-red-600'
                          : 'bg-orange-50 border-orange-200 text-orange-600'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-slate-900 dark:text-white">${order.total}</td>
                  <td className="p-4 text-center">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
