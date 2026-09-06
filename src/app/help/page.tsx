'use client';

import React from 'react';
import { HelpCircle, BookOpen, Settings, Shield, PhoneCall } from 'lucide-react';

export default function HelpPage() {
  const categories = [
    { title: 'Getting Started', desc: 'Setup your account, create your first digital card profile, and select template styles.', icon: BookOpen },
    { title: 'NFC Cards', desc: 'Learn how to program NFC chips and assign them to public profiles.', icon: Settings },
    { title: 'Security & Privacy', desc: 'Manage your visibility settings, search engines index configs, and data controls.', icon: Shield },
    { title: 'Troubleshooting Support', desc: 'Fix device detection issues and contact technical specialists.', icon: PhoneCall }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans py-20 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Title */}
        <div className="text-center space-y-4">
          <HelpCircle className="w-12 h-12 text-blue-500 mx-auto" />
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Help Center</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Find documentation, guides, and tutorials.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {categories.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 shadow-sm hover:shadow transition-all space-y-4"
              >
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-850 dark:text-white">{c.title}</h3>
                  <p className="text-xs text-slate-450 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
