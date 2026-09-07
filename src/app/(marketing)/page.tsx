'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { 
  Zap, Shield, Smartphone, Layers, ChevronRight, Activity, 
  Mail, Globe, Phone, MessageSquare, Star, Download, 
  QrCode, Wifi, Users, BarChart3, Palette, Check, 
  ArrowRight, Play, MapPin, Clock,
  Sparkles, Award, TrendingUp, MessageCircle
} from 'lucide-react';
import { InstagramIcon } from '@/components/BrandLogo';

const FEATURES = [
  {
    icon: Palette,
    color: 'from-violet-500 to-purple-500',
    glow: 'rgba(139,92,246,0.3)',
    title: 'Stunning Templates',
    desc: 'Choose from 50+ professionally designed templates and customize every pixel to match your brand identity.',
  },
  {
    icon: QrCode,
    color: 'from-blue-500 to-cyan-500',
    glow: 'rgba(59,130,246,0.3)',
    title: 'Smart QR & NFC',
    desc: 'Generate unique QR codes and program NFC chips. One tap — your full digital profile delivered instantly.',
  },
  {
    icon: BarChart3,
    color: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16,185,129,0.3)',
    title: 'Deep Analytics',
    desc: 'Track every scan, tap, and view with real-time insights. Know exactly how people interact with your card.',
  },
  {
    icon: Users,
    color: 'from-orange-500 to-amber-500',
    glow: 'rgba(249,115,22,0.3)',
    title: 'Multi Profiles',
    desc: 'Create unlimited profiles for different roles and contexts. Switch between personal, professional, and business.',
  },
  {
    icon: Shield,
    color: 'from-rose-500 to-pink-500',
    glow: 'rgba(244,63,94,0.3)',
    title: 'Enterprise Security',
    desc: 'Bank-grade encryption and GDPR compliance. Your data and your contacts stay private and secure.',
  },
  {
    icon: Globe,
    color: 'from-indigo-500 to-blue-500',
    glow: 'rgba(99,102,241,0.3)',
    title: 'Global Bio Links',
    desc: 'All your social, contact, and content links in one stunning shareable page. Works in 150+ countries.',
  },
];

const SOCIAL_ICONS = [
  { name: 'Instagram', color: 'from-pink-500 to-orange-500' },
  { name: 'LinkedIn', color: 'from-blue-600 to-blue-700' },
  { name: 'WhatsApp', color: 'from-green-500 to-green-600' },
  { name: 'Twitter/X', color: 'from-slate-700 to-slate-800' },
  { name: 'Telegram', color: 'from-blue-400 to-blue-500' },
  { name: 'YouTube', color: 'from-red-500 to-red-600' },
  { name: 'TikTok', color: 'from-slate-800 to-slate-900' },
  { name: 'Facebook', color: 'from-blue-600 to-blue-800' },
  { name: 'Google Map', color: 'from-red-400 to-orange-500' },
  { name: 'Snapchat', color: 'from-yellow-400 to-yellow-500' },
];

const PLANS = [
  {
    name: 'Free',
    price: '0',
    color: 'border-slate-700',
    features: ['1 Profile', '1 NFC Card', 'Basic Templates', 'QR Code', 'Basic Analytics'],
    cta: 'Get Started Free',
    ctaStyle: 'bg-slate-800 hover:bg-slate-700 text-white',
  },
  {
    name: 'Pro',
    price: '9',
    popular: true,
    color: 'border-indigo-500',
    glow: true,
    features: ['Unlimited Profiles', '5 NFC Cards', '50+ Templates', 'Custom QR Code', 'Advanced Analytics', 'Custom Domain', 'Priority Support'],
    cta: 'Start Pro',
    ctaStyle: 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white',
  },
  {
    name: 'Business',
    price: '29',
    color: 'border-slate-700',
    features: ['Unlimited Everything', 'Team Members', 'White Label', 'API Access', 'Dedicated Support', 'Custom Integrations'],
    cta: 'Start Business',
    ctaStyle: 'bg-slate-800 hover:bg-slate-700 text-white',
  },
];

function CountUp({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) requestAnimationFrame(step); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex flex-col min-h-screen bg-[#070714] text-white overflow-x-hidden">

      {/* ═══════════════════════════════════════
          HEADER / NAVBAR
      ═══════════════════════════════════════ */}
      <header className="fixed top-0 w-full z-50 glass-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-95 transition-opacity group">
            <img
              src="/brandxpere-icon.png"
              alt="brandxpere logo"
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-xl font-black tracking-tight font-sans text-white leading-none">
              <span>brand</span>
              <span className="text-[#8A509E] dark:text-purple-400 font-extrabold">x</span>
              <span>pere</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
            {['Features', 'Templates', 'Pricing', 'Contact'].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`} className="hover:text-white transition-colors hover:text-shadow-glow">
                {item}
              </Link>
            ))}
            <a
              href="https://www.instagram.com/brandxpere/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:text-pink-300 hover:bg-pink-500/20 transition-all text-xs font-semibold"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="hidden sm:block text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300">
              Get Started Free
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background animated blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-[100px] animate-blob delay-2000" />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-violet-600/15 rounded-full blur-[100px] animate-blob delay-3000" />
          {/* Subtle grid */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNiA2aDZ2LTZoLTZ2Nmh6bTAtNmg2di02aC02djZ6bTYtNmg2di02aC02djZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Hero Text */}
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass neon-border text-xs font-bold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>The #1 Digital Business Card Platform</span>
                <span className="px-2 py-0.5 bg-indigo-600/40 rounded-full text-indigo-200 text-[10px]">NEW</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
                <span className="gradient-text">Your Digital</span>
                <br />
                <span className="text-white">Business Card,</span>
                <br />
                <span className="gradient-text-blue">Reimagined.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-400 max-w-lg leading-relaxed">
                Create stunning digital profiles, program NFC cards, and share your identity in seconds — no app needed.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-base shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
                >
                  <Zap className="w-5 h-5" />
                  Create Free Card
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl glass neon-border text-white font-bold text-base hover:bg-white/8 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
                >
                  <Play className="w-4 h-4" />
                  View Demo
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div className="flex -space-x-2">
                  {['A','B','C','D','E'].map((l,i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-[10px] font-bold">{l}</div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                    <span className="text-sm font-bold ml-1">4.9/5</span>
                  </div>
                  <p className="text-xs text-slate-400">Trusted by 50,000+ professionals</p>
                </div>
              </div>
            </div>

            {/* Hero Visual — Phone + Floating Card */}
            <div className="relative flex justify-center items-center h-[600px] animate-fade-in delay-300">
              {/* Rotating ring */}
              <div className="absolute w-[400px] h-[400px] rounded-full border border-indigo-500/10 animate-spin-slow" />
              <div className="absolute w-[320px] h-[320px] rounded-full border border-blue-500/10 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '15s' }} />

              {/* Ambient glow */}
              <div className="absolute w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />

              {/* iPhone Frame */}
              <div className="relative z-10 w-[280px] h-[560px] bg-slate-950 rounded-[44px] border-[6px] border-slate-800 shadow-2xl shadow-indigo-900/50 overflow-hidden animate-float">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20 flex items-center justify-center">
                  <div className="w-10 h-1.5 bg-slate-700 rounded-full" />
                </div>

                {/* Screen Content */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c20] via-[#080818] to-[#0c0c20] overflow-y-auto pt-8 pb-6 px-4 flex flex-col items-center scrollbar-hide">
                  {/* Ambient inside screen */}
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-900/30 to-transparent pointer-events-none" />

                  {/* Cover strip */}
                  <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-indigo-900 to-blue-900 opacity-60" />

                  {/* Avatar with glow ring */}
                  <div className="relative mt-12 z-10">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full blur opacity-70 animate-pulse" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-800 to-blue-800 border-2 border-slate-900 flex items-center justify-center font-extrabold text-2xl text-indigo-200 shadow-xl z-10">
                      JD
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold mt-3 gradient-text z-10 relative">Jane Doe</h3>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest z-10 relative">VP of Sales · Acme Corp</p>
                  <p className="text-[10px] text-slate-400 text-center mt-2 max-w-[180px] leading-relaxed z-10 relative">Building enterprise partnerships across EMEA and APAC regions.</p>

                  {/* Save Contact Button */}
                  <button className="w-full mt-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-transform z-10 relative">
                    💾 Save Contact
                  </button>

                  {/* Action Grid */}
                  <div className="grid grid-cols-3 gap-2 w-full mt-4 z-10 relative">
                    {[
                      { icon: Phone, label: 'Call', color: 'text-emerald-400' },
                      { icon: Mail, label: 'Email', color: 'text-blue-400' },
                      { icon: Globe, label: 'Web', color: 'text-violet-400' },
                    ].map(({ icon: Icon, label, color }) => (
                      <div key={label} className="flex flex-col items-center gap-1 p-2.5 glass rounded-xl hover:scale-105 transition-transform cursor-pointer">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className="text-[9px] text-slate-300 font-semibold">{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Contact Rows */}
                  <div className="w-full mt-3 space-y-2 z-10 relative">
                    {[
                      { icon: Phone, value: '+1 234 567 8900', color: 'text-emerald-400' },
                      { icon: Mail, value: 'jane@acme.com', color: 'text-blue-400' },
                      { icon: MapPin, value: 'San Francisco, CA', color: 'text-rose-400' },
                    ].map(({ icon: Icon, value, color }) => (
                      <div key={value} className="flex items-center gap-2.5 p-2.5 glass rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                        <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
                        <span className="text-[10px] text-slate-300 truncate">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Social Row */}
                  <div className="flex gap-2 mt-4 z-10 relative">
                    {['in', 'ig', 'tw', 'wa'].map((s, i) => (
                      <div key={s} className="w-8 h-8 rounded-full glass border border-white/10 flex items-center justify-center text-[9px] font-extrabold text-slate-300 hover:scale-110 transition-transform cursor-pointer">
                        {s.toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating NFC Card */}
              <div className="absolute bottom-8 right-0 w-56 h-36 z-20 animate-card-float delay-1000">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-indigo-900/90 to-blue-900/90 glass-dark neon-border p-4 flex flex-col justify-between shadow-2xl shadow-indigo-900/50">
                  <div className="flex justify-between items-center">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">NFC CARD</span>
                    <Wifi className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white">ACME CORP</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[9px] text-slate-400">Jane Doe</span>
                      <div className="flex gap-0.5">
                        <div className="w-1 h-3 bg-indigo-400 rounded-sm opacity-40" />
                        <div className="w-1 h-4 bg-indigo-400 rounded-sm opacity-60" />
                        <div className="w-1 h-5 bg-indigo-400 rounded-sm" />
                        <div className="w-1 h-4 bg-indigo-400 rounded-sm opacity-60" />
                        <div className="w-1 h-3 bg-indigo-400 rounded-sm opacity-40" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating stat badge */}
              <div className="absolute top-12 left-0 z-20 animate-float-slow delay-500">
                <div className="px-4 py-2.5 glass-dark neon-border rounded-2xl shadow-xl">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Profile Views</div>
                      <div className="text-sm font-extrabold text-emerald-400">+142%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STATS STRIP
      ═══════════════════════════════════════ */}
      <section className="py-12 border-y border-white/5 glass-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 50000, suffix: '+', label: 'Active Users', color: 'text-indigo-400' },
              { value: 2000000, suffix: '+', label: 'Cards Scanned', color: 'text-blue-400' },
              { value: 150, suffix: '+', label: 'Countries', color: 'text-violet-400' },
              { value: 99, suffix: '.9%', label: 'Uptime SLA', color: 'text-emerald-400' },
            ].map(({ value, suffix, label, color }) => (
              <div key={label} className="space-y-1">
                <div className={`text-3xl sm:text-4xl font-black ${color}`}>
                  <CountUp end={value} />{suffix}
                </div>
                <p className="text-sm text-slate-400 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES GRID
      ═══════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass neon-border text-xs font-bold text-indigo-300">
              <Zap className="w-3.5 h-3.5" /> Everything You Need
            </div>
            <h2 className="text-4xl sm:text-5xl font-black gradient-text">Powerful Features</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Built for professionals who want to make an unforgettable first impression.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, color, glow, title, desc }, i) => (
              <div
                key={title}
                className="group glass-dark rounded-2xl p-7 hover:scale-[1.02] transition-all duration-500 cursor-pointer"
                style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.05)` }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  style={{ boxShadow: `0 8px 20px ${glow}` }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SOCIAL PLATFORMS
      ═══════════════════════════════════════ */}
      <section className="py-20 border-y border-white/5 glass-dark overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
          <h2 className="text-3xl font-black gradient-text mb-2">Connect All Your Platforms</h2>
          <p className="text-slate-400">50+ social networks and contact methods supported</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto px-4">
          {SOCIAL_ICONS.map(({ name, color }) => (
            <div key={name} className={`px-4 py-2 rounded-xl bg-gradient-to-r ${color} text-xs font-bold text-white shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer`}>
              {name}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass neon-border text-xs font-bold text-indigo-300 mb-4">
              <Award className="w-3.5 h-3.5" /> Simple Process
            </div>
            <h2 className="text-4xl sm:text-5xl font-black gradient-text">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
            
            {[
              { step: '01', icon: Palette, title: 'Design Your Card', desc: 'Pick a template, add your info, photos, social links — takes under 2 minutes.' },
              { step: '02', icon: QrCode, title: 'Share Instantly', desc: 'Get your unique link, QR code, and NFC-ready profile live immediately.' },
              { step: '03', icon: BarChart3, title: 'Track & Grow', desc: 'See who viewed your card, where they came from, and which links they tapped.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative text-center group">
                <div className="w-20 h-20 mx-auto rounded-2xl glass-dark neon-border flex flex-col items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                  <span className="text-xs font-extrabold text-indigo-400 mb-0.5">{step}</span>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-extrabold text-white mb-3">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRICING
      ═══════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass neon-border text-xs font-bold text-indigo-300 mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Transparent Pricing
            </div>
            <h2 className="text-4xl sm:text-5xl font-black gradient-text">Simple Plans</h2>
            <p className="text-slate-400 mt-3">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map(({ name, price, popular, color, glow, features, cta, ctaStyle }) => (
              <div
                key={name}
                className={`relative rounded-2xl p-7 flex flex-col border ${color} ${glow ? 'animate-glow' : ''} glass-dark hover:scale-[1.02] transition-all duration-500`}
              >
                {popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-xs font-bold text-white shadow-lg shadow-indigo-600/40">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-extrabold text-white">{name}</h3>
                <div className="mt-4 mb-6 flex items-baseline gap-1">
                  <span className="text-slate-400 text-lg">$</span>
                  <span className="text-5xl font-black gradient-text">{price}</span>
                  <span className="text-slate-400 text-sm">/mo</span>
                </div>
                <ul className="space-y-3 flex-grow mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className={`w-full py-3 rounded-xl font-bold text-sm text-center hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${ctaStyle}`}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 via-blue-900/40 to-violet-900/40 pointer-events-none" />
        <div className="absolute inset-0 border-y border-white/5 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-black gradient-text">
            Start Your Digital Journey Today
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Join 50,000+ professionals using brandxpere to make unforgettable first impressions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-base shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300">
              <Zap className="w-5 h-5" />
              Create Your Free Card
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer className="border-t border-white/5 glass-dark py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            
            {/* Brand Column (2 cols on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2.5 hover:opacity-95 transition-opacity group">
                <img
                  src="/brandxpere-icon.png"
                  alt="brandxpere logo"
                  className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
                />
                <span className="text-2xl font-black tracking-tight font-sans text-white leading-none">
                  <span>brand</span>
                  <span className="text-[#8A509E] dark:text-purple-400 font-extrabold">x</span>
                  <span>pere</span>
                </span>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                The premier digital business card and NFC solutions platform. Share contacts, showcase portfolios, and boost conversions effortlessly.
              </p>
              
              {/* Contact Snapshot */}
              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <a 
                  href="https://www.instagram.com/brandxpere/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors font-mono"
                >
                  <InstagramIcon className="w-4 h-4 flex-shrink-0" />
                  <span>@brandxpere (Instagram)</span>
                </a>
                <a 
                  href="https://wa.me/212606034080?text=Hello%20brandxpere" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-mono"
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span>+212 606-034080 (WhatsApp & Tel)</span>
                </a>
                <a 
                  href="mailto:BRANDXPER@GMAIL.COM" 
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-mono"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>BRANDXPER@GMAIL.COM</span>
                </a>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-amber-400" />
                  <span>Marrakech, Maroc (المغرب)</span>
                </div>
              </div>
            </div>

            {/* Column 1: Navigation */}
            <div>
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest mb-4">Product</h4>
              <ul className="space-y-2.5">
                <li><Link href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#templates" className="text-sm text-slate-400 hover:text-white transition-colors">Templates</Link></li>
                <li><Link href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/auth/register" className="text-sm text-slate-400 hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>

            {/* Column 2: Support & Company */}
            <div>
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest mb-4">Support & Company</h4>
              <ul className="space-y-2.5">
                <li><Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/help" className="text-sm text-slate-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/auth/login" className="text-sm text-slate-400 hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors">Custom NFC Orders</Link></li>
              </ul>
            </div>

            {/* Column 3: Quick Connect */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                Instant Assistance
              </span>
              <p className="text-xs text-slate-300">
                Need immediate help or consultation? Reach our team on WhatsApp directly.
              </p>
              <a
                href="https://wa.me/212606034080?text=Hello%20BrandXper%20Team"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">© 2026 BrandXper. All rights reserved. Marrakech, Maroc.</p>
            <div className="flex items-center gap-4">
              <Link href="/contact" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Contact Support</Link>
              <Link href="/help" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Help & FAQ</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Quick-Action Button */}
      <aside aria-label="WhatsApp Support" className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/212606034080?text=Hello%20BrandXper%20Team"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:scale-105 active:scale-95 transition-all duration-300 font-bold text-xs"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200" />
          </span>
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">WhatsApp +212 606-034080</span>
        </a>
      </aside>
    </div>
  );
}
