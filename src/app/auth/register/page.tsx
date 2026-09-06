'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Smartphone, Languages, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const { t, language, setLanguage, dir } = useTranslation();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300" dir={dir}>
      {/* Back button and Language Switcher */}
      <div className="absolute top-4 right-4 left-4 flex justify-between items-center z-50">
        <Link href="/" className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
          {dir === 'ltr' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          <span>Back</span>
        </Link>
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer"
        >
          <Languages className="w-4 h-4" />
          <span>{language === 'en' ? t('common.arabic') : t('common.english')}</span>
        </button>
      </div>

      {/* Decorative Column (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-tr from-blue-600 to-indigo-700 items-center justify-center p-12 text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-950/40 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-md space-y-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 font-bold text-2xl">
            C
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Create cards. Share profiles. Track views.
          </h2>
          <p className="text-blue-100 text-base leading-relaxed">
            Join thousands of professionals changing how connections are made. Setup your account in under two minutes.
          </p>
        </div>
      </div>

      {/* Form Column */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16 pt-24 sm:pt-12">
        <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('auth.registerTitle')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Get started for free today.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('auth.name')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white dark:bg-slate-950 focus:dark:bg-slate-900 border border-slate-200 focus:border-blue-600 dark:border-slate-800 focus:dark:border-blue-500 rounded-xl outline-none font-medium text-sm transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('auth.email')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white dark:bg-slate-950 focus:dark:bg-slate-900 border border-slate-200 focus:border-blue-600 dark:border-slate-800 focus:dark:border-blue-500 rounded-xl outline-none font-medium text-sm transition-all"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('auth.phone')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Smartphone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white dark:bg-slate-950 focus:dark:bg-slate-900 border border-slate-200 focus:border-blue-600 dark:border-slate-800 focus:dark:border-blue-500 rounded-xl outline-none font-medium text-sm transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('auth.password')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white dark:bg-slate-950 focus:dark:bg-slate-900 border border-slate-200 focus:border-blue-600 dark:border-slate-800 focus:dark:border-blue-500 rounded-xl outline-none font-medium text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 font-bold text-white rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center text-sm cursor-pointer mt-2"
            >
              {loading ? t('common.loading') : t('auth.registerBtn')}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            <span>{t('auth.alreadyHaveAccount')} </span>
            <Link href="/auth/login" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              {t('auth.loginBtn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
