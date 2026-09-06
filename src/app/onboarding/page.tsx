'use client';

import React, { useState } from 'react';
import { User, Contact, ShieldCheck, ChevronRight, LayoutTemplate, Layers, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Profile basics
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');

  // Step 2: Contact Info
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsApp, setWhatsApp] = useState('');
  const [website, setWebsite] = useState('');

  // Step 3: Template Style Choice
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  // Templates options list
  const templates = [
    { id: 'modern', name: 'Modern Clean', colors: 'Blue/White' },
    { id: 'minimal', name: 'Minimalist Black', colors: 'Black/White' },
    { id: 'executive', name: 'Executive Slate', colors: 'Navy/Slate' },
    { id: 'dark', name: 'Midnight Dark', colors: 'Green/Obsidian' },
    { id: 'elegant', name: 'Ivory Gold', colors: 'Gold/Champagne' }
  ];

  const handleNext = () => {
    if (step === 1 && (!name || !slug)) {
      setError('Please provide your name and card url slug');
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleComplete = async () => {
    setError(null);
    try {
      // 1. Create Profile
      const resProfile = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug: slug.toLowerCase(),
          type: 'PERSONAL',
        }),
      });

      const profileData = await resProfile.json();

      if (!resProfile.ok) {
        setError(profileData.error || 'Failed to create profile.');
        return;
      }

      // 2. Update Profile with details and selected template style
      const resUpdate = await fetch(`/api/profiles/${profileData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          company,
          bio,
          phone,
          email,
          whatsApp,
          website,
          templateId: selectedTemplate,
        }),
      });

      if (resUpdate.ok) {
        router.push(`/dashboard?onboarded=true`);
      } else {
        const updateData = await resUpdate.json();
        setError(updateData.error || 'Failed to apply onboarding settings.');
      }
    } catch (e) {
      setError('Connection failure.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 space-y-8 shadow-sm">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-800 dark:text-white block">Cardly Setup</span>
              <span className="text-[10px] text-blue-500 font-bold block">Step {step} of 4</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`w-4 h-1.5 rounded-full transition-all ${
                  s === step ? 'bg-blue-600 w-8' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 font-bold rounded-2xl text-xs">
            {error}
          </div>
        )}

        {/* Step 1: Profile Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                <span>Welcome! Let&apos;s build your card.</span>
              </h2>
              <p className="text-xs text-slate-400">Introduce yourself to your contacts.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none"
                    placeholder="E.g. Ahmed Ali"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Card URL Slug</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none"
                    placeholder="E.g. ahmed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Short Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none h-20 resize-none"
                  placeholder="Tell people about what you do..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Contact Information */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
                <Contact className="w-5 h-5 text-blue-500" />
                <span>Contact Channels</span>
              </h2>
              <p className="text-xs text-slate-400">Add contact methods to share.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">WhatsApp Phone</label>
                  <input
                    type="tel"
                    value={whatsApp}
                    onChange={(e) => setWhatsApp(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Website URL</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Choose Template */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-blue-500" />
                <span>Select a Theme Layout</span>
              </h2>
              <p className="text-xs text-slate-400">Choose the baseline style for your digital card.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {templates.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`p-4 border ${
                    selectedTemplate === t.id
                      ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/10'
                      : 'border-slate-200 dark:border-slate-850'
                  } rounded-2xl cursor-pointer hover:shadow-sm transition-all`}
                >
                  <h4 className="font-bold text-xs text-slate-850 dark:text-white">{t.name}</h4>
                  <span className="text-[10px] text-slate-400 block mt-1">{t.colors} palette</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Final Preview & Publish */}
        {step === 4 && (
          <div className="space-y-6 text-center py-6">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h2 className="text-xl font-extrabold text-slate-850 dark:text-white">Ready to Go!</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your profile is compiled. Click Publish to generate your dynamic QR code and start linking physical cards.
            </p>
          </div>
        )}

        {/* Actions Navigation */}
        <div className="flex justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-850">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold text-xs rounded-xl cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm shadow-emerald-500/10"
            >
              Publish Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
