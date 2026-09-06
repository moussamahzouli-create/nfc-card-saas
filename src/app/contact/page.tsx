'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertTriangle } from 'lucide-react';

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
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans py-20 px-6 sm:px-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-full">Get In Touch</span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">We&apos;re Here to Help</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Have questions about NFC programming or card variants? Message us and our support team will respond quickly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
        {/* Info Columns */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-850 dark:text-white">Contact Information</h3>

            <div className="space-y-4 text-xs font-semibold">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Email Support</span>
                  <span className="text-slate-850 dark:text-slate-200">support@cardly.com</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">WhatsApp Hotline</span>
                  <span className="text-slate-850 dark:text-slate-200">+212 600 000 000</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Office Headquarters</span>
                  <span className="text-slate-850 dark:text-slate-200">Casablanca, Morocco</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-8 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold text-slate-850 dark:text-white">Send Message</h3>

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-600 font-bold rounded-2xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Your message has been sent successfully. We will respond shortly!</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 font-bold rounded-2xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Phone (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Your Message</label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500 h-32 resize-none"
              placeholder="Write your message details..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs rounded-2xl cursor-pointer shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
