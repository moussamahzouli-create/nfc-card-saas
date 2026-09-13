'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Zap, Palette, Shield, ArrowRight, 
  CheckCircle2, ChevronRight, Phone, Mail, MapPin, 
  MessageCircle, Star, Monitor, Camera, TrendingUp, 
  Award, Layers, Cpu, Check, Send, Languages
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

const CONTENT = {
  en: {
    nav: {
      home: 'Home',
      nfc: 'Smart NFC Cards',
      services: 'Services',
      process: 'Process',
      pricing: 'Pricing',
      contact: 'Contact',
      quote: 'Get a Quote',
    },
    hero: {
      badge: 'Brandxpere • Creative Studio & Innovation Lab',
      titleMain: 'We Build Brands That Build Business.',
      titleSub: 'Your Vision. Our Creative Expertise.',
      description: 'Brandxpere is a modern creative studio dedicated to helping brands build a strong, distinctive, and meaningful presence in today’s fast-moving digital world. We don’t just design brands — we create experiences that make them unforgettable.',
      startProjectBtn: 'Start Your Project',
      exploreCardsBtn: 'Explore Smart NFC Cards',
      whatsAppBtn: 'WhatsApp Consultation',
    },
    pillarsTitle: 'Our Creative & Engineering Services',
    pillarsSubtitle: 'Every project is designed with a balance of strategy, aesthetics, innovation, and functionality.',
    processTitle: 'Our Workflow Process',
    processSubtitle: 'A structured approach from initial strategy to launch and scale.',
    quoteTitle: 'Let’s Build Something Exceptional',
    quoteSubtitle: 'Select your services, specify your goals, and receive a direct proposal.',
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      nfc: 'بطاقات NFC الذكية',
      services: 'خدماتنا',
      process: 'منهجية العمل',
      pricing: 'الأسعار',
      contact: 'تواصل معنا',
      quote: 'طلب عرض سعر',
    },
    hero: {
      badge: 'Brandxpere • استوديو إبداعي ومختبر ابتكار',
      titleMain: 'نبني علامات تجارية تصنع النجاح لأعمالك.',
      titleSub: 'رؤيتكم الاستثنائية. خبرتنا الإبداعية المتكاملة.',
      description: 'Brandxpere هو استوديو إبداعي معاصر مكرس لمساعدة العلامات التجارية على بناء حضور قوي ومميز وذي مغزى في العالم الرقمي اليوم. نحن لا نصمم علامات تجارية فقط — نحن نصنع تجارب تجعلها مستحيلة النسيان.',
      startProjectBtn: 'ابدأ مشروعك الآن',
      exploreCardsBtn: 'استكشف بطاقات NFC الذكية',
      whatsAppBtn: 'استشارة واتساب فورية',
    },
    pillarsTitle: 'خدماتنا الإبداعية والتقنية المتكاملة',
    pillarsSubtitle: 'يتم تصميم كل مشروع بتوازن دقيق بين الاستراتيجية، الجماليات، الابتكار، والوظيفة العملية.',
    processTitle: 'منهجية العمل المعتمدة',
    processSubtitle: 'مسار منظم ومدروس من التخطيط الأولي حتى الإطلاق والنمو المستمر.',
    quoteTitle: 'دعنا نحول رؤيتك إلى واقع ملهم',
    quoteSubtitle: 'حدد الخدمات التي تحتاجها وسنزودك بعرض سعر مخصص لمشروعك.',
  },
};

const PILLARS_DATA = [
  {
    id: 'branding',
    titleEn: 'Branding & Visual Identity',
    titleAr: 'الهوية البصرية والعلامة التجارية',
    taglineEn: 'We craft unique visual identities that reflect your brand’s personality and values.',
    taglineAr: 'نصمم هويات بصرية فريدة تعكس شخصية وقيم علامتك التجارية بدقة واحترافية.',
    icon: Palette,
    num: '01',
    deliverablesEn: [
      'Bespoke Logo Design & Iconography',
      'Typography, Color Psychology & System Guidelines',
      'Luxury Brand Books & Design Guidelines',
      'Packaging, Stationary & Print Collateral',
      '3D Brand Mockups & Presentation Assets'
    ],
    deliverablesAr: [
      'تصميم الشعارات الأيقونية وأنظمة الهوية',
      'أنظمة الخطوط، سيكولوجية الألوان، والقواعد البصرية',
      'دليل الهوية الكامل (Brand Guidelines)',
      'تغليف المنتجات، المطبوعات، ومستلزمات الشركات',
      'مجسمات 3D وعروض تقديمية واقعية'
    ],
  },
  {
    id: 'web',
    titleEn: 'Website Creation & UX Engineering',
    titleAr: 'تطوير وبرمجة المواقع وتطبيقات الويب',
    taglineEn: 'We design and develop modern, responsive websites that provide seamless user experiences.',
    taglineAr: 'نصمم ونطور مواقع وتطبيقات ويب عصرية ومتجاوبة بالكامل تمنح مستخدميك تجربة سلسة.',
    icon: Monitor,
    num: '02',
    deliverablesEn: [
      'Next.js 15 & React Enterprise Web Apps',
      'Custom SaaS Portals & Client Dashboards',
      'Luxury E-Commerce & Checkout Optimization',
      '99+ Google Lighthouse Speed Scores',
      'Technical SEO & Headless Architecture'
    ],
    deliverablesAr: [
      'تطبيقات ويب فائقة التطور عبر Next.js 15 و React',
      'منصات سحابية SaaS ولوحات تحكم مخصصة',
      'متاجر إلكترونية فاخرة وتجربة شراء سلسة',
      'سرعة فائقة تفوق 99 على معايير Google',
      'تهيئة محركات البحث الفنية SEO وهيكلة سحابية'
    ],
  },
  {
    id: 'media',
    titleEn: 'Photography & Video Editing',
    titleAr: 'التصوير والإنتاج السينمائي والموشن جرافيك',
    taglineEn: 'We capture and edit stunning visual content that tells your story and engages your audience.',
    taglineAr: 'نلتقط وننتج محتوى مرئياً مبهراً يروي قصة علامتك ويجذب جمهورك المستهدف.',
    icon: Camera,
    num: '03',
    deliverablesEn: [
      'Commercial Brand Videos & Product Showcases',
      '3D Photorealistic Modeling & Animations',
      'Viral Social Media Video Content (Reels & TikTok)',
      'Professional Voiceover, Sound Design & Color Grading',
      'Visual Storytelling tailored for conversions'
    ],
    deliverablesAr: [
      'فيديوهات إعلانية سينمائية للمنتجات والشركات',
      'مجسمات ورسوم متحركة 3D واقعية',
      'فيديوهات ريلز وتيك توك سريعة الانتشار',
      'تعليق صوتي احترافي، هندسة صوتية، وتلوين سنمائي',
      'سرد قصصي مرئي موجه لزيادة المبيعات'
    ],
  },
  {
    id: 'marketing',
    titleEn: 'Social Media Management & Ads',
    titleAr: 'إدارة التواصل الاجتماعي والإعلانات الممولة',
    taglineEn: 'We manage your social presence and run targeted ad campaigns that grow your brand online.',
    taglineAr: 'ندير حضورك الرقمي ونطلق حملات إعلانية ممولة دقيقة تحقق عائداً استثمارياً مرتفعاً.',
    icon: TrendingUp,
    num: '04',
    deliverablesEn: [
      'Meta (Instagram & Facebook) Ads Management',
      'Google Search & Performance Max Campaigns',
      'Conversion Rate Optimization (CRO) & Funnels',
      'High-Engagement Social Media Content Strategy',
      'Full-Funnel Attribution & Weekly Analytics'
    ],
    deliverablesAr: [
      'إدارة حملات Meta الإعلانية (إنستغرام وفيسبوك)',
      'إعلانات Google Search و Performance Max المتقدمة',
      'بناء مسارات المبيعات والتحويل (Sales Funnels)',
      'استراتيجية محتوى متفاعل لشبكات التواصل',
      'تقارير تفصيلية أسبوعية وتتبع العائد المالي'
    ],
  },
  {
    id: 'nfc',
    titleEn: 'Smart NFC & Connected Identity (Hardware)',
    titleAr: 'بطاقات NFC الذكية والعتاد المتصل (المنتج الرائد)',
    taglineEn: 'Physical luxury meets digital speed. One tap delivers your identity without apps.',
    taglineAr: 'الفخامة المادية تلتقي بالسرعة الرقمية. لمسة واحدة تنقل بياناتك بدون الحاجة لأي تطبيق.',
    icon: Cpu,
    num: '05',
    isFlagship: true,
    deliverablesEn: [
      'Laser-Engraved Matte Black & Metal Cards',
      'Dynamic Live Cloud Profile Management',
      'Fleet Team Management & Corporate Dashboard',
      'Real-time Analytics & Contact Sync',
      'Instant Tap for all iOS and Android devices'
    ],
    deliverablesAr: [
      'بطاقات معدنية وبلاستيكية مات محفورة بالليزر',
      'إدارة بروفايل سحابي ذكي يتحدث في ثوانٍ',
      'لوحة تحكم مركزية لإدارة بطاقات فِرق الشركات',
      'إحصائيات مباشرة لكل عملية مسح أو نقرة',
      'توافق فوري مع كافة هواتف آيفون وأندرويد'
    ],
  },
];

const PROCESS_STEPS = [
  {
    step: '01',
    titleEn: 'Discovery & Strategy',
    titleAr: 'الاكتشاف والتخطيط الاستراتيجي',
    descEn: 'We dissect your market positioning, target audience, and business targets to architect an execution blueprint.',
    descAr: 'ندرس وضع علامتك في السوق، جمهورك المستهدف، وأهدافك التجارية لبناء خطة عمل واضحة.',
  },
  {
    step: '02',
    titleEn: 'Creative Direction & Design',
    titleAr: 'التوجيه الإبداعي والتصميم',
    descEn: 'Our art directors craft moodboards, high-fidelity prototypes, and brand systems tailored to your identity.',
    descAr: 'يبتكر مصممونا النماذج الأولية المتقدمة والهوية البصرية بما ينسجم تماماً مع طموح علامتك.',
  },
  {
    step: '03',
    titleEn: 'Agile Engineering & Production',
    titleAr: 'التطوير البرمجي والإنتاج',
    descEn: 'We write clean, high-performance code and produce studio-quality media with weekly milestone demos.',
    descAr: 'نبرمج بأحدث التقنيات وننتج المحتوى الإعلاني بأعلى المعايير مع إطلاعك على كل مرحلة.',
  },
  {
    step: '04',
    titleEn: 'Launch, Growth & Support',
    titleAr: 'الإطلاق، النمو، والدعم المستمر',
    descEn: 'Flawless global deployment followed by conversion tracking, continuous optimization, and warranty.',
    descAr: 'إطلاق سلس على السحابة، متابعة مؤشرات الأداء، وضمان صيانة مستمر لمشروعك.',
  },
];

export default function AgencyPage() {
  const { language, setLanguage, dir } = useTranslation();
  const isArabic = language === 'ar';
  const t = CONTENT[language] || CONTENT.en;

  const [selectedServices, setSelectedServices] = useState<string[]>(['branding']);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [budget, setBudget] = useState('$1,000 - $3,000');
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
      const found = PILLARS_DATA.find(srv => srv.id === s);
      return found ? (isArabic ? found.titleAr : found.titleEn) : s;
    }).join(', ');

    const msg = encodeURIComponent(
      `*Brandxpere Project Inquiry*\n\n` +
      `*Name:* ${clientName || 'N/A'}\n` +
      `*Email:* ${clientEmail || 'N/A'}\n` +
      `*Phone:* ${clientPhone || 'N/A'}\n` +
      `*Services:* ${serviceNames}\n` +
      `*Budget:* ${budget}\n` +
      `*Notes:* ${projectNotes || 'No notes'}\n\n` +
      `Sent from brandxpere.com/agency`
    );

    window.open(`https://wa.me/212778481250?text=${msg}`, '_blank');
    setSubmitted(true);
  };

  return (
    <div 
      className="flex flex-col min-h-screen bg-[#1B0C21] text-white overflow-x-hidden font-sans transition-all duration-300"
      dir={dir}
    >
      
      {/* ═══════════════════════════════════════
          HEADER / NAVBAR
      ═══════════════════════════════════════ */}
      <header className="fixed top-0 w-full z-50 bg-[#1B0C21]/85 backdrop-blur-xl border-b border-[#DACBE3]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-95 transition-opacity group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#844D98] to-[#301739] p-1.5 flex items-center justify-center border border-[#DACBE3]/20 shadow-lg shadow-[#844D98]/20 group-hover:scale-105 transition-transform">
              <img
                src="/brandxpere-icon.png"
                alt="brandxpere logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-black tracking-tight font-sans text-white leading-none">
              <span>brand</span>
              <span className="text-[#844D98] font-black">x</span>
              <span>pere</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#DACBE3]/80">
            <Link href="/" className="hover:text-white transition-colors">
              {t.nav.home}
            </Link>
            <a href="#services" className="text-[#DACBE3] font-bold transition-colors">
              {t.nav.services}
            </a>
            <a href="#process" className="hover:text-white transition-colors">
              {t.nav.process}
            </a>
            <Link href="/pricing" className="hover:text-white transition-colors">
              {t.nav.pricing}
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              {t.nav.contact}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DACBE3]/20 bg-[#301739]/60 hover:bg-[#844D98]/20 text-xs font-bold text-[#DACBE3] transition-all"
            >
              <Languages className="w-3.5 h-3.5 text-[#DACBE3]" />
              <span className={isArabic ? 'text-[#844D98] font-extrabold' : 'text-white'}>EN</span>
              <span className="text-[#DACBE3]/40">|</span>
              <span className={isArabic ? 'text-white' : 'text-[#DACBE3]/70'}>عربي</span>
            </button>

            <a
              href="#quote"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#844D98] to-[#602773] text-sm font-bold text-white shadow-lg shadow-[#844D98]/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{t.nav.quote}</span>
            </a>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════
          AGENCY HERO SECTION
      ═══════════════════════════════════════ */}
      <section className="relative pt-36 pb-20 overflow-hidden bg-gradient-to-b from-[#1B0C21] via-[#26102F] to-[#1B0C21]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#844D98]/20 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 left-10 w-72 h-72 bg-[#301739]/60 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#301739] border border-[#DACBE3]/20 text-xs font-bold text-[#DACBE3]">
            <Sparkles className="w-3.5 h-3.5 text-[#844D98] animate-pulse" />
            <span>{t.hero.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.12] max-w-5xl mx-auto">
            <span className="bg-gradient-to-r from-white via-[#DACBE3] to-[#844D98] bg-clip-text text-transparent block">
              {t.hero.titleMain}
            </span>
            <span className="text-xl sm:text-3xl font-medium text-[#DACBE3]/90 mt-3 block italic">
              {t.hero.titleSub}
            </span>
          </h1>

          <p className="text-base sm:text-xl text-[#DACBE3]/80 max-w-3xl mx-auto leading-relaxed">
            {t.hero.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#quote"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#844D98] via-[#6F2E82] to-[#301739] border border-[#DACBE3]/30 text-white font-bold text-base shadow-2xl shadow-[#844D98]/40 hover:scale-105 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{t.hero.startProjectBtn}</span>
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-[#301739]/80 border border-[#DACBE3]/20 hover:border-[#DACBE3]/50 text-[#DACBE3] font-bold text-base hover:scale-105 transition-all"
            >
              <Cpu className="w-4 h-4 text-[#844D98]" />
              <span>{t.hero.exploreCardsBtn}</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SERVICES SHOWCASE (THE 5 PILLARS)
      ═══════════════════════════════════════ */}
      <section id="services" className="py-24 relative border-t border-[#DACBE3]/10 bg-[#16081B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#844D98]/20 border border-[#844D98]/40 text-xs font-bold text-[#DACBE3]">
              <Layers className="w-3.5 h-3.5 text-[#DACBE3]" />
              <span>{isArabic ? 'الركائز الإبداعية' : 'Creative Pillars'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              {t.pillarsTitle}
            </h2>
            <p className="text-[#DACBE3]/80 text-base sm:text-lg">
              {t.pillarsSubtitle}
            </p>
          </div>

          <div className="space-y-12">
            {PILLARS_DATA.map((srv) => {
              const Icon = srv.icon;
              return (
                <div 
                  key={srv.id}
                  className={`rounded-3xl p-8 sm:p-12 border transition-all duration-300 relative overflow-hidden group ${
                    srv.isFlagship
                      ? 'bg-gradient-to-br from-[#301739] via-[#844D98]/25 to-[#1B0C21] border-[#DACBE3]/40 shadow-2xl'
                      : 'bg-[#301739]/50 hover:bg-[#301739]/70 border-[#DACBE3]/15 hover:border-[#DACBE3]/30 shadow-xl'
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    <div className="lg:col-span-7 space-y-5 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#844D98] to-[#301739] border border-[#DACBE3]/20 flex items-center justify-center text-white shadow-lg">
                          <Icon className="w-6 h-6 text-[#DACBE3]" />
                        </div>
                        <span className="text-xs font-mono font-bold text-[#DACBE3]/80 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                          {srv.num}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                          {isArabic ? srv.titleAr : srv.titleEn}
                        </h3>
                        <p className="text-xs sm:text-sm font-semibold text-[#DACBE3]">
                          {isArabic ? srv.taglineAr : srv.taglineEn}
                        </p>
                      </div>

                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-[#DACBE3] uppercase tracking-wider mb-3">
                          {isArabic ? 'نطاق العمل ومخرجات الخدمة:' : 'Key Deliverables:'}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {(isArabic ? srv.deliverablesAr : srv.deliverablesEn).map((d, dIdx) => (
                            <div key={dIdx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-200">
                              <CheckCircle2 className="w-4 h-4 text-[#844D98] shrink-0" />
                              <span>{d}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 flex flex-wrap items-center gap-3">
                        <a
                          href="#quote"
                          onClick={() => {
                            if (!selectedServices.includes(srv.id)) {
                              setSelectedServices([...selectedServices, srv.id]);
                            }
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#844D98] to-[#602773] text-white text-xs sm:text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
                        >
                          <span>{isArabic ? 'طلب عرض سعر لهذه الخدمة' : 'Request Quote for This Service'}</span>
                          <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
                        </a>

                        {srv.id === 'nfc' && (
                          <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DACBE3]/20 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-semibold transition-all"
                          >
                            <span>{isArabic ? 'معاينة البطاقات الذكية' : 'View NFC Platform'}</span>
                            <ChevronRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-5 flex justify-center">
                      <div className="w-full max-w-md p-6 rounded-2xl bg-[#1B0C21]/80 border border-[#DACBE3]/15 space-y-4 text-start">
                        <div className="flex items-center justify-between border-b border-[#DACBE3]/10 pb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#DACBE3]">
                            {isArabic ? 'معايير الجودة' : 'Execution Standards'}
                          </span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>

                        <ul className="space-y-3 text-xs text-slate-300">
                          <li className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
                            <span>{isArabic ? 'فريق عمل متمرس ومصمم أول مخصص لمشروعك' : 'Dedicated Senior Art Director & Lead Engineer'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
                            <span>{isArabic ? 'قناة تواصل مباشرة عبر واتساب لمتابعة المراحل' : 'Direct WhatsApp & Slack communication channel'}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
                            <span>{isArabic ? 'تسليم كامل الملفات المصدرية وحقوق الملكية' : 'Full intellectual property & source file delivery'}</span>
                          </li>
                        </ul>
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
          PROCESS WORKFLOW
      ═══════════════════════════════════════ */}
      <section id="process" className="py-24 relative border-t border-[#DACBE3]/10 bg-gradient-to-b from-[#16081B] via-[#220D2B] to-[#16081B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#844D98]/20 border border-[#844D98]/40 text-xs font-bold text-[#DACBE3]">
              <Award className="w-3.5 h-3.5 text-[#DACBE3]" />
              <span>{isArabic ? 'منهجيتنا المعتمدة' : 'Disciplined Methodology'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              {t.processTitle}
            </h2>
            <p className="text-[#DACBE3]/80 text-base">
              {t.processSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((p, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-3xl bg-[#301739]/50 border border-[#DACBE3]/15 hover:border-[#844D98]/50 transition-all text-start group"
              >
                <div className="text-3xl font-black font-mono text-[#DACBE3]/40 group-hover:text-[#844D98] transition-colors mb-3">
                  {p.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {isArabic ? p.titleAr : p.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {isArabic ? p.descAr : p.descEn}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          PROJECT INQUIRY FORM
      ═══════════════════════════════════════ */}
      <section id="quote" className="py-24 relative border-t border-[#DACBE3]/10 bg-[#120716]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#DACBE3]">
              {isArabic ? 'طلب استشارة ومقترح' : 'Direct Inquiry'}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              {t.quoteTitle}
            </h2>
            <p className="text-[#DACBE3]/80 text-base max-w-xl mx-auto">
              {t.quoteSubtitle}
            </p>
          </div>

          <div className="rounded-3xl bg-[#301739]/60 border border-[#DACBE3]/20 p-6 sm:p-10 shadow-2xl">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {isArabic ? 'تم فتح محادثة الواتساب بنجاح' : 'Inquiry Formatted for WhatsApp'}
                </h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  {isArabic 
                    ? 'تم إرسال مواصفات مشروعك إلى استوديو مراكش (+212 778-481250) وسيتواصل معك الفريق فوراً.'
                    : 'Our team on WhatsApp (+212 778-481250) has received your request.'
                  }
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6 text-start">
                
                {/* Services Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#DACBE3] mb-3">
                    {isArabic ? '1. اختر الخدمات المطلوبة:' : '1. Select Services Required:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PILLARS_DATA.map((srv) => {
                      const isChecked = selectedServices.includes(srv.id);
                      return (
                        <div
                          key={srv.id}
                          onClick={() => toggleService(srv.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                            isChecked 
                              ? 'border-[#844D98] bg-[#844D98]/20 text-white shadow' 
                              : 'border-[#DACBE3]/15 bg-white/5 text-[#DACBE3] hover:border-[#DACBE3]/30'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                            isChecked ? 'border-[#844D98] bg-[#844D98] text-white' : 'border-[#DACBE3]/30'
                          }`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <span className="text-xs sm:text-sm font-semibold">
                            {isArabic ? srv.titleAr : srv.titleEn}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#DACBE3] mb-1.5">
                      {isArabic ? 'الاسم / اسم الشركة' : 'Your Name / Company'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe / Brand"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#1B0C21] border border-[#DACBE3]/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#844D98]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#DACBE3] mb-1.5">
                      {isArabic ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+212 ... / +1 ..."
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#1B0C21] border border-[#DACBE3]/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#844D98]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#DACBE3] mb-1.5">
                    {isArabic ? 'نبذة عن المشروع والأهداف' : 'Project Overview & Goals'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={isArabic ? 'اشرح ما ترغب في إنجازه، روابط مرجعية، أو الموعد المستهدف...' : 'Describe what you want to achieve, timeline, references...'}
                    value={projectNotes}
                    onChange={(e) => setProjectNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#1B0C21] border border-[#DACBE3]/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#844D98] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#844D98] via-[#6F2E82] to-[#301739] text-white font-bold text-base shadow-2xl shadow-[#844D98]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{isArabic ? 'إرسال الطلب والتواصل عبر واتساب' : 'Submit & Connect via WhatsApp'}</span>
                </button>

              </form>
            )}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════ */}
      <footer className="border-t border-[#DACBE3]/10 bg-[#120716] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">© 2026 Brandxpere. All rights reserved. Marrakech, Morocco.</p>
          <div className="flex items-center gap-4 text-xs text-[#DACBE3]/70">
            <Link href="/" className="hover:text-white">{t.nav.home}</Link>
            <Link href="/pricing" className="hover:text-white">{t.nav.pricing}</Link>
            <Link href="/contact" className="hover:text-white">{t.nav.contact}</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
