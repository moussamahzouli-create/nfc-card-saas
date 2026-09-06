'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { CreditCard, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function CheckoutConfirmContent() {
  const router = useRouter();
  
  // Safe extraction of query parameters
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [planId, setPlanId] = useState('');
  const [userId, setUserId] = useState('');

  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setOrderId(params.get('orderId') || '');
      setAmount(params.get('amount') || '1999');
      setCurrency(params.get('currency') || 'USD');
      setPlanId(params.get('planId') || '');
      
      // Get current user id from endpoint
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (data.user) setUserId(data.user.id);
        })
        .catch(e => console.error(e));
    }
  }, []);

  const handleSimulatePayment = async () => {
    setPaying(true);
    setError(null);
    try {
      const payload = {
        event: 'checkout.completed',
        orderId: orderId || null,
        planId: planId || null,
        userId: userId || 'test_user_id',
        amount: parseInt(amount),
        currency,
        transactionId: `mock_tx_${Date.now()}`,
      };

      const res = await fetch('/api/payments/webhook/mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-payment-signature': 'mock_sig_123',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          if (planId) {
            window.location.href = '/dashboard/billing?success=true';
          } else {
            window.location.href = '/dashboard/orders?success=true';
          }
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Webhook verification failed.');
      }
    } catch (e) {
      setError('Connection failure.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 space-y-8 shadow-md text-center">
        <div className="space-y-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Sandbox Gateway</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This is a mock sandbox environment. No actual money will be charged.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 font-bold rounded-2xl text-xs text-left flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 bg-emerald-50 text-emerald-600 font-bold rounded-3xl space-y-2">
            <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 animate-bounce" />
            <h3 className="text-sm">Payment Successful!</h3>
            <p className="text-[10px] text-slate-400">Redirecting to your dashboard...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-left text-xs font-semibold space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Price:</span>
                <span className="text-slate-850 dark:text-white font-extrabold">${(parseInt(amount) / 100).toFixed(2)} {currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reference:</span>
                <span className="text-slate-850 dark:text-white font-bold">{orderId ? `Order #${orderId.slice(0, 8)}` : 'Subscription Upgrade'}</span>
              </div>
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={paying}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm rounded-2xl cursor-pointer shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>{paying ? 'Authorizing...' : 'Authorize sandbox Payment'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutConfirmPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutConfirmContent />
    </Suspense>
  );
}
