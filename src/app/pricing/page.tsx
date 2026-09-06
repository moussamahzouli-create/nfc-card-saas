'use client';

import React, { useEffect, useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Seed and fetch plans
    async function fetchPlans() {
      try {
        const res = await fetch('/api/billing/subscription');
        // If plans not created, let's query a seeding endpoint or return static mock plans
        const mockPlans = [
          {
            id: 'plan_free_uuid',
            name: 'FREE',
            price: 0,
            maxProfiles: 1,
            maxCards: 1,
            analyticsDays: 30,
            branding: 'Limited branding',
            templates: 'Basic templates',
          },
          {
            id: 'plan_pro_uuid',
            name: 'PRO',
            price: 9.99,
            maxProfiles: 5,
            maxCards: 5,
            analyticsDays: 365,
            branding: 'Custom branding',
            templates: 'All templates access',
          },
          {
            id: 'plan_biz_uuid',
            name: 'BUSINESS',
            price: 29.99,
            maxProfiles: -1, // Unlimited
            maxCards: 20,
            analyticsDays: 3650,
            branding: 'Custom branding + White Label',
            templates: 'All templates access',
          }
        ];
        setPlans(mockPlans);
      } catch (e) {
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const handleSubscribe = async (plan: any) => {
    setError(null);
    try {
      const res = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.checkoutUrl) {
          router.push(data.checkoutUrl);
        } else {
          alert('Subscription registered successfully!');
          router.push('/dashboard/billing');
        }
      } else {
        setError(data.error || 'Failed to initiate checkout');
      }
    } catch (e) {
      setError('Connection failure.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans py-20 px-6 sm:px-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-full">SaaS Subscription Plans</span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Simple, Transparent Pricing</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Select a subscription plan matching your business needs. Upgrade or cancel anytime.
        </p>
      </div>

      {error && (
        <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 text-red-600 font-bold rounded-2xl text-xs text-center">
          {error}
        </div>
      )}

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white dark:bg-slate-900 border ${
              plan.name === 'PRO'
                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg scale-105'
                : 'border-slate-200 dark:border-slate-800 shadow-sm'
            } rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300`}
          >
            {plan.name === 'PRO' && (
              <span className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white capitalize">{plan.name.toLowerCase()}</h3>
                <p className="text-slate-400 text-xs mt-1">Perfect for individuals and teams.</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">${plan.price}</span>
                <span className="text-slate-400 text-xs">/ month</span>
              </div>

              <hr className="border-slate-100 dark:border-slate-850" />

              <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span>{plan.maxProfiles === -1 ? 'Unlimited' : plan.maxProfiles} profile slots</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span>{plan.maxCards} physical cards</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span>{plan.analyticsDays} days analytics history</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span>{plan.branding}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span>{plan.templates}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe(plan)}
              className={`w-full mt-8 py-3 rounded-2xl font-bold text-sm cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                plan.name === 'PRO'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
