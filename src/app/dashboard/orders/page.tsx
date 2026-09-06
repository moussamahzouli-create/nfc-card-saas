'use client';

import React, { useEffect, useState } from 'react';
import { Package, Truck, Calendar, ShoppingBag, Receipt, CheckCircle, RefreshCw } from 'lucide-react';

export default function CustomerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) setOrders(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading && orders.length === 0) {
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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Order History</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track shipping details and check fulfillment logs for card orders.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-2xl transition-all cursor-pointer text-slate-500 dark:text-slate-400"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">No orders found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
            You haven&apos;t purchased any physical NFC cards yet. Visit the catalog to get yours!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Cards List */}
          <div className="lg:col-span-2 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`bg-white dark:bg-slate-900 border ${
                  selectedOrder?.id === order.id
                    ? 'border-blue-500 ring-2 ring-blue-500/10'
                    : 'border-slate-200 dark:border-slate-850'
                } rounded-3xl p-5 shadow-sm hover:shadow transition-all cursor-pointer flex justify-between items-center gap-4`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-800 dark:text-white">{order.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      order.status === 'PAID' || order.status === 'DELIVERED'
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-250'
                        : order.status === 'CANCELLED'
                          ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200'
                          : 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-450 block">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="text-right">
                  <span className="font-black text-sm text-slate-900 dark:text-white">${order.total}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{order.items.length} items</span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Order Detail Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm space-y-6">
            {selectedOrder ? (
              <div className="space-y-6 text-xs font-semibold">
                <div>
                  <h3 className="text-sm font-bold text-slate-850 dark:text-white">Order Details</h3>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{selectedOrder.orderNumber}</span>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Items</h4>
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-450">{item.product.name} (x{item.quantity})</span>
                      <span className="font-bold text-slate-800 dark:text-white">${item.unitPrice}</span>
                    </div>
                  ))}
                </div>

                <hr className="border-slate-100 dark:border-slate-850" />

                {/* Shipping Details */}
                <div className="space-y-2">
                  <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Shipping Address</h4>
                  <div className="text-slate-600 dark:text-slate-450 space-y-1">
                    <span className="font-bold block text-slate-850 dark:text-white">{selectedOrder.shippingName}</span>
                    <span>{selectedOrder.shippingLine1}</span>
                    <span className="block">{selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingZip}</span>
                    <span>{selectedOrder.shippingCountry}</span>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-850" />

                {/* Pricing Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal</span>
                    <span>${selectedOrder.subtotal}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount</span>
                      <span>-${selectedOrder.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shipping</span>
                    <span>${selectedOrder.shipping}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tax</span>
                    <span>${selectedOrder.tax}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-850">
                    <span>Total Paid</span>
                    <span>${selectedOrder.total}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 text-xs">
                Select an order from the list to view full shipping details and receipt invoice data.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
