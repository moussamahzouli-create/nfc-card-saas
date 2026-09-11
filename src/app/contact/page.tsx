'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  MessageCircle, 
  ArrowLeft, 
  ExternalLink,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { InstagramIcon } from '@/components/BrandLogo';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone: phone || null, subject, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
      } else {
        setError(data.error || 'Failed to submit contact message');
      }
    } catch (e) {
      setError('Connection failure. Please try again or reach us via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070714] text-slate-900 dark:text-slate-100 font-sans py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Navigation */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
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
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home / العودة للرئيسية</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Get in Touch with brandxpere</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          We&apos;re Here to Help
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          لديك استفسار حول بطاقات NFC الذكية أو ترغب في طلب مخصص أو تفعيل حساب؟ فريقنا متاح دائماً للرد عليك ومساعدتك فوراً.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
        
        {/* Contact Info Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Instagram Official Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent border border-pink-500/20 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 flex-shrink-0">
                <InstagramIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider block">
                  Official Instagram / انستغرام الرسمي
                </span>
                <h2 className="text-base font-bold">@brandxpere</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  تابعنا لمشاهدة تصاميم البطاقات وتحديثات المنتجات
                </p>
              </div>
            </div>

            <div className="mt-5">
              <a 
                href="https://www.instagram.com/brandxpere/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-pink-500/20 transition-all active:scale-[0.98]"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Visit Instagram @brandxpere</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* WhatsApp & Phone Primary Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Fastest Response / الرد الأسرع
                </span>
                <h2 className="text-base font-bold">WhatsApp & Telephone</h2>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
                  +212 778-481250
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <a 
                href="https://wa.me/212778481250?text=Hello%20brandxpere%20Team" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
              <a 
                href="tel:+212778481250"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all active:scale-[0.98]"
              >
                <Phone className="w-4 h-4" />
                <span>Direct Call</span>
              </a>
            </div>
          </div>

          {/* Email Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Official Email / البريد الإلكتروني
                </span>
                <h2 className="text-base font-bold">Email Support</h2>
                <a 
                  href="mailto:BRANDXPER@GMAIL.COM"
                  className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline block font-mono"
                >
                  BRANDXPER@GMAIL.COM
                </a>
              </div>
            </div>

            <a 
              href="mailto:BRANDXPER@GMAIL.COM"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send an Email</span>
            </a>
          </div>

          {/* Address / Location Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Location / المقر الرئيسي
                </span>
                <h2 className="text-base font-bold">Marrakech, Maroc</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Marrakech, Morocco (المغرب - مراكش)
                </p>
              </div>
            </div>

            <a 
              href="https://maps.google.com/?q=Marrakech,Morocco"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View on Google Maps</span>
            </a>
          </div>

          {/* Trust Badge */}
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-slate-900/50 border border-blue-100 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span>Dedicated technical support and NFC card customization specialists.</span>
          </div>

        </div>

        {/* Message Form (7 Cols) */}
        <div className="lg:col-span-7">
          <form 
            onSubmit={handleSubmit} 
            className="p-8 sm:p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6"
          >
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">Send Us a Direct Message</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Fill out the form below and we will get back to you promptly.
              </p>
            </div>

            {success && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold rounded-2xl text-xs flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>تم إرسال رسالتك بنجاح! سنتواصل معك عبر البريد أو الواتساب في أقرب وقت.</span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-bold rounded-2xl text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  Your Name / الاسم *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  Email Address / البريد *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  Phone / WhatsApp (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+212 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  Subject / الموضوع *
                </label>
                <input
                  type="text"
                  required
                  placeholder="NFC Card Inquiry, Account Setup..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                Your Message / تفاصيل الرسالة *
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all resize-none"
                placeholder="How can we help you today? اكتب استفسارك هنا..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl cursor-pointer shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Sending Message... جاري الإرسال' : 'Send Message / إرسال الرسالة'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
