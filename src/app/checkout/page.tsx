'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { CreditCard, Truck, ShoppingBag, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function CheckoutFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productId = searchParams.get('productId') || '';
  const variantId = searchParams.get('variantId') || '';

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [shippingName, setShippingName] = useState('');
  const [shippingCompany, setShippingCompany] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingCountry, setShippingCountry] = useState('Morocco');
  const [shippingState, setShippingState] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [shippingLine1, setShippingLine1] = useState('');
  const [shippingLine2, setShippingLine2] = useState('');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<any>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products`);
        if (res.ok) {
          const list = await res.json();
          const p = list.find((item: any) => item.id === productId) || list[0];
          setProduct(p);
        }
      } catch (e) {
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  const handleValidateCoupon = async () => {
    setCouponError(null);
    setCouponDiscount(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setCouponDiscount(data);
      } else {
        setCouponError(data.error || 'Invalid coupon code');
      }
    } catch (e) {
      setCouponError('Connection error');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!product) return;

    try {
      const payload = {
        productId: product.id,
        variantId: variantId || null,
        quantity: 1,
        couponCode: couponDiscount?.code || null,
        shippingName,
        shippingCompany: shippingCompany || null,
        shippingPhone,
        shippingPhoneAlt: null,
        shippingCountry,
        shippingState,
        shippingCity,
        shippingZip,
        shippingLine1,
        shippingLine2: shippingLine2 || null,
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.checkoutUrl) {
        router.push(data.checkoutUrl);
      } else {
        setError(data.error || 'Checkout generation failed.');
      }
    } catch (e) {
      setError('Connection failure.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const basePriceMinor = product ? Math.round(product.price * 100) : 0;
  const shippingMinor = 500; // $5.00
  let discountMinor = 0;

  if (couponDiscount) {
    if (couponDiscount.type === 'PERCENTAGE') {
      discountMinor = Math.round((basePriceMinor * couponDiscount.value) / 100);
    } else {
      discountMinor = couponDiscount.value;
    }
  }

  const subtotalMinor = basePriceMinor;
  const taxMinor = Math.round((subtotalMinor - discountMinor + shippingMinor) * 0.08);
  const totalMinor = subtotalMinor - discountMinor + shippingMinor + taxMinor;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans py-16 px-6 sm:px-12 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
      {/* Checkout Form */}
      <form onSubmit={handleCheckout} className="lg:col-span-3 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Shipping & Details</h1>
          <p className="text-xs text-slate-400 mt-1">Complete your shipment information for card delivery.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 font-bold rounded-2xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 space-y-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-500" />
            <span>Fulfillment Address</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Recipient Full Name</label>
              <input
                type="text"
                required
                value={shippingName}
                onChange={(e) => setShippingName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs text-slate-700 dark:text-slate-350 focus:outline-none focus:border-blue-500 font-semibold"
                placeholder="Ahmed Ali"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Phone Number</label>
              <input
                type="tel"
                required
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs text-slate-700 dark:text-slate-350 focus:outline-none focus:border-blue-500 font-semibold"
                placeholder="+2126000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Company (Optional)</label>
            <input
              type="text"
              value={shippingCompany}
              onChange={(e) => setShippingCompany(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs text-slate-700 dark:text-slate-350 focus:outline-none focus:border-blue-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Address Line 1</label>
            <input
              type="text"
              required
              value={shippingLine1}
              onChange={(e) => setShippingLine1(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs text-slate-700 dark:text-slate-350 focus:outline-none focus:border-blue-500 font-semibold"
              placeholder="Street Name, Building No."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">City</label>
              <input
                type="text"
                required
                value={shippingCity}
                onChange={(e) => setShippingCity(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs text-slate-700 dark:text-slate-350 focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">State/Province</label>
              <input
                type="text"
                required
                value={shippingState}
                onChange={(e) => setShippingState(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs text-slate-700 dark:text-slate-350 focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Postal/Zip Code</label>
              <input
                type="text"
                required
                value={shippingZip}
                onChange={(e) => setShippingZip(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs text-slate-700 dark:text-slate-350 focus:outline-none focus:border-blue-500 font-semibold"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl cursor-pointer shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          <span>Proceed to Payment</span>
        </button>
      </form>

      {/* Order Summary */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 space-y-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-blue-500" />
            <span>Order Summary</span>
          </h3>

          {product && (
            <div className="flex justify-between items-center text-xs">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">{product.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">SKU: {product.sku}</p>
              </div>
              <span className="font-extrabold text-slate-800 dark:text-white">${product.price}</span>
            </div>
          )}

          <hr className="border-slate-100 dark:border-slate-850" />

          {/* Coupon Input */}
          <div className="space-y-2">
            <label className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Coupon Discount Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-grow px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none"
                placeholder="PROMO20"
              />
              <button
                type="button"
                onClick={handleValidateCoupon}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                Apply
              </button>
            </div>
            {couponDiscount && (
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Coupon Applied successfully! ({couponDiscount.value}% off)</span>
              </p>
            )}
            {couponError && (
              <p className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{couponError}</span>
              </p>
            )}
          </div>

          <hr className="border-slate-100 dark:border-slate-850" />

          {/* Totals Box */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>${(subtotalMinor / 100).toFixed(2)}</span>
            </div>
            {discountMinor > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount</span>
                <span>-${(discountMinor / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Shipping</span>
              <span>${(shippingMinor / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Estimated Tax (8%)</span>
              <span>${(taxMinor / 100).toFixed(2)}</span>
            </div>
            <hr className="border-slate-100 dark:border-slate-850" />
            <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white">
              <span>Total</span>
              <span>${(totalMinor / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutFormContent />
    </Suspense>
  );
}
