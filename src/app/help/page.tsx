'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, BookOpen, Settings, Shield, PhoneCall, ArrowLeft, MessageCircle, Mail, MapPin, Sparkles } from 'lucide-react';
import { InstagramIcon } from '@/components/BrandLogo';

export default function HelpPage() {
  const categories = [
    { title: 'Getting Started', desc: 'Setup your account, create your first digital card profile, and select template styles.', icon: BookOpen },
    { title: 'NFC Cards', desc: 'Learn how to program NFC chips and assign them to public profiles.', icon: Settings },
    { title: 'Security & Privacy', desc: 'Manage your visibility settings, search engines index configs, and data controls.', icon: Shield },
    { title: 'Troubleshooting Support', desc: 'Fix device detection issues and contact technical specialists.', icon: PhoneCall }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070714] text-slate-900 dark:text-slate-100 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-95 transition-opacity group">
            <img
              src="/brandxpere-icon.png"
              alt="brandxpere logo"
              className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-xl font-black tracking-tight font-sans text-slate-900 dark:text-white leading-none">
              <span>brand</span>
              <span className="text-[#8A509E] dark:text-purple-400 font-extrabold">x</span>
              <span>pere</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/brandxpere/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-pink-500 hover:text-pink-400 flex items-center gap-1.5"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span>@brandxpere</span>
            </a>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Help Center & Support</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            Find documentation, guides, and tutorials or talk directly to our specialized support team.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow transition-all space-y-4"
              >
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold">{c.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Direct Contact Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-indigo-500/10 border border-emerald-500/20 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
              <Sparkles className="w-3 h-3" />
              <span>Direct Hotline & WhatsApp</span>
            </div>
            <h3 className="text-lg font-black">Still Need Help? We&apos;re Available on WhatsApp</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md">
              Marrakech, Maroc &bull; +212 778-481250 &bull; BRANDXPER@GMAIL.COM
            </p>
          </div>

          <div className="flex flex-wrap gap-3 flex-shrink-0">
            <a
              href="https://www.instagram.com/brandxpere/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-pink-600/20 flex items-center gap-2 transition-all"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>Instagram @brandxpere</span>
            </a>
            <a
              href="https://wa.me/212778481250?text=Hello%20brandxpere%20Support"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Chat</span>
            </a>
            <Link
              href="/contact"
              className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Page</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
