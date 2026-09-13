'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Zap, Globe, Palette, Shield, ArrowRight, 
  CheckCircle2, ChevronRight, Phone, Mail, MapPin, 
  MessageCircle, Star, Monitor, Smartphone, Video, 
  TrendingUp, Award, Layers, Cpu, Check, Send
} from 'lucide-react';
import { InstagramIcon } from '@/components/BrandLogo';

const AGENCY_SERVICES = [
  {
    id: 'branding',
    title: 'Branding & Visual Identity Systems',
    tagline: 'Make your brand unmistakable in a crowded marketplace',
    icon: Palette,
    gradient: 'from-violet-500 to-fuchsia-500',
    borderGlow: 'hover:border-violet-500/40 hover:shadow-violet-500/20',
    accentColor: 'text-violet-400',
    description: 'We build complete, timeless brand systems that command premium pricing and emotional loyalty. From iconic logo marks to comprehensive design guidelines and luxury collateral.',
    deliverables: [
      'Bespoke Logo Design & Iconography',
      'Typography, Color Psychology & System Guidelines',
      'Luxury Brand Guidelines & Design Tokens',
      'Packaging, Stationary & Print Collateral',
      '3D Brand Mockups & Presentation Assets'
    ],
    highlight: 'Iconic Design'
  },
  {
    id: 'web-development',
    title: 'UX Engineering & Custom Web Platforms',
    tagline: 'High-performance digital products engineered for scale',
    icon: Monitor,
    gradient: 'from-blue-500 to-cyan-500',
    borderGlow: 'hover:border-blue-500/40 hover:shadow-blue-500/20',
    accentColor: 'text-cyan-400',
    description: 'We engineer lightning-fast, ultra-responsive web applications, modern SaaS platforms, and conversion-optimized corporate portals built on Next.js, React, and serverless architecture.',
    deliverables: [
      'Next.js 15 & React Enterprise Web Apps',
      'Full-Stack SaaS & Client Portal Development',
      'Luxury E-Commerce & Custom Checkouts',
      'API Integrations & Database Architecture',
      '99+ Google Lighthouse Speed & SEO Scores'
    ],
    highlight: 'Next.js & Cloud'
  },
  {
    id: 'nfc-solutions',
    title: 'Smart NFC & Connected Identity (Hardware)',
    tagline: 'Our flagship smart networking technology for modern teams',
    icon: Cpu,
    gradient: 'from-amber-400 to-orange-500',
    borderGlow: 'hover:border-amber-500/40 hover:shadow-amber-500/20',
    accentColor: 'text-amber-400',
    description: 'Empower your sales force and executive team with custom-crafted NFC smart cards linked directly to cloud digital profiles. Instant contact sharing with zero apps required.',
    deliverables: [
      'Laser-Engraved Matte Black & Gold Metal Cards',
      'Cloud Dynamic vCard & Profile Management',
      'Corporate Fleet Dashboard & Team Analytics',
      'Custom QR Codes & Contact Sync (vCard / CSV)',
      'Enterprise White-Label Solutions'
    ],
    highlight: 'Flagship Tech'
  },
  {
    id: 'growth-marketing',
    title: 'Growth Marketing & Performance Ads',
    tagline: 'Predictable, profitable customer acquisition funnels',
    icon: TrendingUp,
    gradient: 'from-emerald-500 to-teal-500',
    borderGlow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/20',
    accentColor: 'text-emerald-400',
    description: 'Data-driven growth strategies that convert cold attention into lifelong clients. We architect high-converting funnels, manage high-ROAS ad campaigns, and dominate search results.',
    deliverables: [
      'Meta (Instagram & Facebook) Ads Management',
      'Google Search & Performance Max Campaigns',
      'Conversion Rate Optimization (CRO) & A/B Testing',
      'Technical & Local SEO Domination',
      'Full-Funnel Attribution & Analytics Reporting'
    ],
    highlight: 'High ROAS'
  },
  {
    id: 'media-production',
    title: 'Cinematic Media & 3D Motion Graphics',
    tagline: 'World-class visual storytelling that elevates perception',
    icon: Video,
    gradient: 'from-rose-500 to-pink-500',
    borderGlow: 'hover:border-rose-500/40 hover:shadow-rose-500/20',
    accentColor: 'text-rose-400',
    description: 'Commercial video production, 3D product rendering, and motion graphics tailored for maximum engagement across digital channels, social media, and broadcast.',
    deliverables: [
      'Commercial Brand Videos & Product Showcases',
      '3D Photorealistic Modeling & Product Animations',
      'High-Engagement Social Video Production (Reels/TikTok)',
      'Professional Voiceover, Sound Design & Color Grading',
      'Interactive WebGL & 3D Interactive Assets'
    ],
    highlight: 'Studio Quality'
  }
];

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Discovery & Blueprint',
    desc: 'We dive deep into your market position, competitive landscape, target audience, and business goals to chart a precise execution roadmap.'
  },
  {
    step: '02',
    title: 'Creative Direction & Architecture',
    desc: 'Our design and engineering leads conceptualize wireframes, high-fidelity prototypes, tech stacks, and visual languages tailored to your vision.'
  },
  {
    step: '03',
    title: 'Agile Engineering & Production',
    desc: 'We build with clean code, modern frameworks, and cinematic visuals, holding weekly milestone demos to keep you fully aligned.'
  },
  {
    step: '04',
    title: 'Launch, Measurement & Growth',
    desc: 'Flawless deployment across global CDNs, cloud infrastructure, ad campaigns, or NFC distribution, followed by continuous optimization.'
  }
];

const STATS = [
  { number: '150+', label: 'Delivered Projects' },
  { number: '50K+', label: 'NFC Taps & Scans' },
  { number: '99.8%', label: 'Client Satisfaction' },
  { number: '8.4x', label: 'Average Client ROAS' }
];

export default function AgencyPage() {
  const [selectedServices, setSelectedServices] = useState<string[]>(['branding']);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [budget, setBudget] = useState('Medium ($1,000 - $3,000)');
  const [projectNotes, setProjectNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleService = (id: string) => {
    if (selectedServices.includes(id)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter(s => s !== id));
      }
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceNames = selectedServices.map(s => {
      const found = AGENCY_SERVICES.find(srv => srv.id === s);
      return found ? found.title : s;
    }).join(', ');

    const whatsappMessage = encodeURIComponent(
      `*BRANDXPER Project Inquiry*\n\n` +
      `*Name:* ${clientName || 'Not provided'}\n` +
      `*Email:* ${clientEmail || 'Not provided'}\n` +
      `*Phone:* ${clientPhone || 'Not provided'}\n` +
      `*Services Requested:* ${serviceNames}\n` +
      `*Estimated Budget:* ${budget}\n` +
      `*Project Details:* ${projectNotes || 'No notes added'}\n\n` +
      `Sent via brandxpere.com/agency`
    );

    window.open(`https://wa.me/212778481250?text=${whatsappMessage}`, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070714] text-white overflow-x-hidden font-sans">
      
      {/* ═══════════════════════════════════════
          HEADER / NAVBAR
      ═══════════════════════════════════════ */}
      <header className="fixed top-0 w-full z-50 glass-dark border-b border-white/5 backdrop-blur-xl">
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

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">
              NFC Platform
            </Link>
            <a href="#services" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Agency Services
            </a>
            <a href="#process" className="hover:text-white transition-colors">
              Process
            </a>
            <Link href="/pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/212778481250?text=Hello%20BRANDXPER%20Team%2C%20I%20would%20like%20to%20consult%20about%20a%20project"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Direct</span>
            </a>
            <a
              href="#quote"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Zap className="w-4 h-4" />
              <span>Get a Quote</span>
            </a>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════
          AGENCY HERO SECTION
      ═══════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Glow & Backdrop Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-pink-600/20 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 left-10 w-72 h-72 bg-blue-600/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-purple-500/30 text-xs font-bold text-purple-300 shadow-inner">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>BRANDXPER Digital Agency & Innovation Lab</span>
            <span className="px-2 py-0.5 bg-purple-600/40 rounded-full text-purple-200 text-[10px] uppercase font-mono">Full-Service</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.15] max-w-5xl mx-auto">
            We Engineer <span className="gradient-text">Iconic Brands</span>,
            <br />
            Custom Web Platforms & <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Smart Hardware</span>.
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            From bespoke Next.js platforms and high-converting marketing funnels to cinematic video production and custom-engraved NFC business cards — we build digital dominance for modern enterprises.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#quote"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Send className="w-4 h-4" />
              <span>Start Your Project</span>
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl glass border border-white/10 hover:border-white/20 text-white font-bold text-base hover:bg-white/5 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>Explore Smart NFC Cards</span>
            </Link>
            <a
              href="https://wa.me/212778481250?text=Hello%20BRANDXPER%20Team%2C%20I%20would%20like%20to%20discuss%20a%20new%20project"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 font-bold text-base transition-all hover:scale-105"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span>WhatsApp Consultation</span>
            </a>
          </div>

          {/* Agency Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 border-t border-white/10 max-w-5xl mx-auto">
            {STATS.map((s, idx) => (
              <div key={idx} className="p-4 rounded-2xl glass border border-white/5 text-center">
                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                  {s.number}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SERVICES SHOWCASE (5 PILLARS)
      ═══════════════════════════════════════ */}
      <section id="services" className="py-24 relative border-t border-white/5 bg-gradient-to-b from-[#070714] via-[#0b0c20] to-[#070714]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400">
              <Layers className="w-3.5 h-3.5" />
              <span>Full-Spectrum Digital Services</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              End-to-End Solutions for <span className="gradient-text">High-Growth Brands</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              We eliminate the friction of coordinating between multiple freelancers or agencies. We handle everything from concept to code, identity to high-ROAS marketing.
            </p>
          </div>

          <div className="space-y-12">
            {AGENCY_SERVICES.map((srv, idx) => {
              const Icon = srv.icon;
              const isEven = idx % 2 === 0;

              return (
                <div 
                  key={srv.id}
                  className="rounded-3xl glass border border-white/10 p-8 sm:p-12 hover:border-white/20 transition-all duration-300 relative overflow-hidden group"
                >
                  {/* Subtle top glow */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${srv.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    <div className="lg:col-span-7 space-y-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${srv.gradient} flex items-center justify-center text-white shadow-lg`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs uppercase font-mono tracking-wider px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                          {srv.highlight}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                          {srv.title}
                        </h3>
                        <p className={`text-sm font-semibold ${srv.accentColor}`}>
                          {srv.tagline}
                        </p>
                      </div>

                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                        {srv.description}
                      </p>

                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Key Deliverables:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {srv.deliverables.map((d, dIdx) => (
                            <div key={dIdx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                              <CheckCircle2 className={`w-4 h-4 ${srv.accentColor} shrink-0`} />
                              <span>{d}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 flex flex-wrap items-center gap-4">
                        <a
                          href="#quote"
                          onClick={() => {
                            if (!selectedServices.includes(srv.id)) {
                              setSelectedServices([...selectedServices, srv.id]);
                            }
                          }}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${srv.gradient} text-white text-xs sm:text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all`}
                        >
                          <span>Request Quote for This Service</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                        {srv.id === 'nfc-solutions' && (
                          <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-semibold transition-all"
                          >
                            <span>View NFC Live Demo</span>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-5 flex justify-center">
                      <div className="w-full max-w-md p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Execution Standards</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>

                        <ul className="space-y-3 text-xs text-slate-300">
                          <li className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
                            <span>Dedicated Senior Project Manager & Lead Designer</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
                            <span>Direct Slack / WhatsApp channel with execution team</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
                            <span>Full intellectual property & source files transfer</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
                            <span>Post-launch warranty and technical maintenance</span>
                          </li>
                        </ul>

                        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Delivery Timeline:</span>
                          <span className="text-white font-mono font-bold">1 - 3 Weeks</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          AGENCY PROCESS
      ═══════════════════════════════════════ */}
      <section id="process" className="py-24 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
              <Award className="w-3.5 h-3.5" />
              <span>Our Battle-Tested Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              How We Turn Ideas into <span className="gradient-text">Market Leaders</span>
            </h2>
            <p className="text-slate-400 text-base">
              A transparent, disciplined process designed to deliver exceptional results on schedule.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((p, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-3xl glass border border-white/10 hover:border-indigo-500/40 transition-all group relative overflow-hidden"
              >
                <div className="text-4xl font-black font-mono text-white/10 group-hover:text-indigo-400/30 transition-colors mb-4">
                  {p.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          PROJECT INQUIRY / QUOTE FORM
      ═══════════════════════════════════════ */}
      <section id="quote" className="py-24 relative border-t border-white/5 bg-gradient-to-b from-[#0c0c24] via-[#070714] to-[#070714]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-300">
              <Zap className="w-3.5 h-3.5" />
              <span>Direct Project Inquiry</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Let's Build Something <span className="gradient-text">Exceptional</span>
            </h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto">
              Select the services you need, tell us about your goals, and receive a customized proposal within 24 hours.
            </p>
          </div>

          <div className="rounded-3xl glass border border-white/10 p-6 sm:p-10 shadow-2xl">
            {submitted ? (
              <div className="text-center py-12 space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Inquiry Transmitted to WhatsApp</h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  Your project specifications have been formatted. Our direct consultation team on WhatsApp (+212 778-481250) has received your request.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 rounded-xl border border-white/20 bg-white/5 text-white text-xs font-bold hover:bg-white/10 transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-8">
                
                {/* 1. Service Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                    1. Select Service(s) Required:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AGENCY_SERVICES.map((srv) => {
                      const isChecked = selectedServices.includes(srv.id);
                      return (
                        <div
                          key={srv.id}
                          onClick={() => toggleService(srv.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                            isChecked 
                              ? 'border-indigo-500 bg-indigo-500/15 text-white shadow-md shadow-indigo-500/20' 
                              : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center border text-[11px] ${
                              isChecked ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-white/20 bg-transparent'
                            }`}>
                              {isChecked && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <span className="text-xs sm:text-sm font-semibold">{srv.title}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Client Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Your Name / Company
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe / Acme Inc"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* 3. Phone / WhatsApp & Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Phone or WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+212 ... / +1 ..."
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Estimated Project Budget
                    </label>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#0e0e24] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="Starter ($500 - $1,000)">Starter ($500 - $1,000)</option>
                      <option value="Medium ($1,000 - $3,000)">Medium ($1,000 - $3,000)</option>
                      <option value="Scale ($3,000 - $7,000)">Scale ($3,000 - $7,000)</option>
                      <option value="Enterprise ($7,000+)">Enterprise ($7,000+)</option>
                      <option value="Not sure / Open to consultation">Not sure / Open to consultation</option>
                    </select>
                  </div>
                </div>

                {/* 4. Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Project Goals & Timeline
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe what you want to achieve, any reference links, or target completion dates..."
                    value={projectNotes}
                    onChange={(e) => setProjectNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                {/* CTA Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-base shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                  <span>Submit Inquiry & Connect via WhatsApp</span>
                </button>

                <p className="text-center text-xs text-slate-500">
                  Prefer direct email? Send specs to{' '}
                  <a href="mailto:BRANDXPER@GMAIL.COM" className="text-indigo-400 hover:underline">
                    BRANDXPER@GMAIL.COM
                  </a>{' '}
                  or call{' '}
                  <a href="tel:+212778481250" className="text-emerald-400 hover:underline">
                    +212 778-481250
                  </a>.
                </p>

              </form>
            )}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer className="border-t border-white/5 glass-dark py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            
            {/* Brand Column */}
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
                Full-service digital agency and smart NFC solutions provider. Crafting high-converting visual systems, enterprise web apps, and connected hardware.
              </p>
              
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
                  href="https://wa.me/212778481250?text=Hello%20BRANDXPER%20Team" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-mono"
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span>+212 778-481250 (WhatsApp & Tel)</span>
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

            {/* Column 1: Agency Services */}
            <div>
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest mb-4">Services</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><a href="#services" className="hover:text-white transition-colors">Branding & Identity</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Web & UX Engineering</a></li>
                <li><Link href="/" className="hover:text-white transition-colors">Smart NFC Cards</Link></li>
                <li><a href="#services" className="hover:text-white transition-colors">Growth Marketing</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Cinematic 3D Media</a></li>
              </ul>
            </div>

            {/* Column 2: Platform & Ecosystem */}
            <div>
              <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest mb-4">NFC Ecosystem</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Client Dashboard</Link></li>
                <li><Link href="/auth/register" className="hover:text-white transition-colors">Create Free vCard</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Card Plans & Pricing</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Custom Corporate Fleet</Link></li>
              </ul>
            </div>

            {/* Column 3: Quick Action */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                Direct Hotline
              </span>
              <p className="text-xs text-slate-300">
                Discuss your next project or card order with our Marrakech studio team immediately.
              </p>
              <a
                href="https://wa.me/212778481250?text=Hello%20BRANDXPER%20Team"
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
              <Link href="/help" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Help Center</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Quick-Action */}
      <aside aria-label="WhatsApp Support" className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/212778481250?text=Hello%20BRANDXPER%20Team"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:scale-105 active:scale-95 transition-all duration-300 font-bold text-xs"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200" />
          </span>
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">WhatsApp +212 778-481250</span>
        </a>
      </aside>

    </div>
  );
}
