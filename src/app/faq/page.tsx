'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      q: 'What is NFC?',
      a: 'NFC (Near Field Communication) is a short-range wireless technology that enables data exchange between devices. In Cardly, it allows tapping physical cards to resolve digital business profiles.'
    },
    {
      q: 'How does the card work?',
      a: 'When someone taps your card, their smartphone reads the canonical NDEF URL encoded inside it and redirects them immediately to your active public business profile page.'
    },
    {
      q: 'Do I need an app to read the card?',
      a: 'No! NFC reading is built-in natively on all modern iOS and Android smartphones without requiring external apps.'
    },
    {
      q: 'How do I edit my card details?',
      a: 'You can login to your Cardly Dashboard, update your active profile, components, templates, or social links. Changes reflect on the card immediately.'
    },
    {
      q: 'Can I use QR codes without NFC?',
      a: 'Yes. Every Cardly profile generates a high-definition dynamic QR code that you can copy, print, or share anywhere.'
    }
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans py-20 px-6 sm:px-12">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Title */}
        <div className="text-center space-y-4">
          <HelpCircle className="w-12 h-12 text-blue-500 mx-auto" />
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Frequently Asked Questions</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Everything you need to know about NFC business cards and templates.
          </p>
        </div>

        {/* FAQs List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 flex justify-between items-center text-xs font-bold text-slate-800 dark:text-white text-left focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-850">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
