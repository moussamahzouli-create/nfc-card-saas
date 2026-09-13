'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Zap, Palette, Shield, ArrowRight, 
  CheckCircle2, ChevronRight, Phone, Mail, MapPin, 
  MessageCircle, Star, Monitor, Camera, TrendingUp, 
  Award, Layers, Cpu, Check, Send, Languages, ArrowUpRight
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
      stat1: '100% Bespoke Quality',
      stat2: 'Next-Gen Performance',
      stat3: 'Direct Expert Support',
    },
    pillarsTitle: 'Our Creative & Engineering Services',
    pillarsSubtitle: 'Every project is crafted with a balance of strategy, aesthetics, innovation, and functionality.',
    processTitle: 'Our Workflow Process',
    processSubtitle: 'A structured, transparent approach from initial strategy to launch and continuous scale.',
    quoteTitle: 'Let’s Build Something Exceptional',
    quoteSubtitle: 'Select your services, specify your goals, and receive a direct proposal tailored to your vision.',
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
      stat1: 'تصميم وهوية حصرية 100%',
      stat2: 'أداء برمجي فائق السرعة',
      stat3: 'دعم مباشر عبر واتساب',
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
      'High-End Commercial Photography',
      'Cinematic Brand Storytelling & Video Reels',
      '2D/3D Motion Graphics & Micro-Animations',
      'Color Grading, Sound Design & Audio Mixing',
      'Social Media Campaign Asset Suites'
    ],
    deliverablesAr: [
      'تصوير فوتوغرافي تجاري فائق الجودة',
      'فيديوهات إعلانية وسينمائية تروي قصة علامتك',
      'موشن جرافيكس 2D و 3D ومؤثرات بصرية',
      'تصحيح ألوان سينمائي وهندسة صوتية متكاملة',
      'حزم محتوى مرئي مخصصة لمنصات التواصل'
    ],
  },
  {
    id: 'marketing',
    titleEn: 'Digital Marketing & Growth Strategy',
    titleAr: 'التسويق الرقمي واستراتيجيات النمو',
    taglineEn: 'We help brands scale with targeted digital marketing, content strategy, and paid campaigns.',
    taglineAr: 'نساعد علامتك على التوسع عبر التسويق الرقمي المستهدف، استراتيجيات المحتوى، والإعلانات الممولة.',
    icon: TrendingUp,
    num: '04',
    deliverablesEn: [
      'Full-Funnel Paid Advertising (Meta, Google, TikTok)',
      'Brand Social Media Management & Organic Growth',
      'Comprehensive Organic SEO & Backlink Building',
      'Influencer Collaborations & PR Outreach',
      'Data Analytics, ROI Dashboards & KPI Tracking'
    ],
    deliverablesAr: [
      'حملات إعلانية مدفوعة عبر Meta و Google و TikTok',
      'إدارة حسابات التواصل وبناء المجتمعات الرقمية',
      'تصدر نتائج محركات البحث SEO وبناء الروابط',
      'التعاون مع المؤثرين والحملات الترويجية',
      'تحليلات دقيقة وتقارير دورية للعائد على الاستثمار'
    ],
  },
  {
    id: 'nfc',
    titleEn: 'Smart NFC Cards & Connected Hardware',
    titleAr: 'بطاقات NFC الذكية والأجهزة المتصلة',
    taglineEn: 'Seamless digital networking cards connecting physical interactions to your digital profile in one tap.',
    taglineAr: 'بطاقات أعمال رقمية ذكية تدمج العالم الحقيقي مع هويتك الرقمية بلمسة واحدة بدون تطبيقات.',
    icon: Cpu,
    num: '05',
    isFlagship: true,
    deliverablesEn: [
      'Bespoke Matte Black, Bamboo Wood & Metallic Cards',
      'Instant Tap-to-Share (vCard, Socials, Portfolio)',
      'Enterprise Team Management & Cloud Dashboard',
      'Zero App Requirement for Scanning Clients',
      'Real-Time Analytics & Dynamic Profile Updates'
    ],
    deliverablesAr: [
      'بطاقات معدنية، خشب بامبو، وبلاستيك مطفي فاخر',
      'مشاركة فورية للمعلومات والروابط بلمسة هاتف واحدة',
      'لوحة تحكم سحابية لإدارة بطاقات الشركات وفرق العمل',
      'لا تتطلب أي تطبيق من الطرف الآخر لقراءة البطاقة',
      'إحصائيات تفاعلية وتحديث فوري للمعلومات في أي وقت'
    ],
  },
];

const PROCESS_STEPS = [
  {
    step: '01',
    titleEn: 'Discovery & Strategy',
    titleAr: 'الاستكشاف والتخطيط الاستراتيجي',
    descEn: 'We dive deep into your market position, competitive landscape, and audience psyche to formulate a clear roadmap.',
    descAr: 'ندرس وضع علامتك في السوق ونحلل المنافسين بدقة لوضع خارطة طريق استراتيجية واضحة.',
  },
  {
    step: '02',
    titleEn: 'Creative Concept & Art Direction',
    titleAr: 'التصميم الإبداعي والتوجيه الفني',
    descEn: 'Our art directors craft moodboards, prototypes, and aesthetic guidelines perfectly tailored to your ambitions.',
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
      className="flex flex-col min-h-screen bg-white text-slate-900 overflow-x-hidden transition-all duration-300"
      dir={dir}
    >
      
      {/* ═══════════════════════════════════════
          HEADER / NAVBAR (eSoft White Style)
      ═══════════════════════════════════════ */}
      <header className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-95 transition-opacity group">
            <img
              src="/brandxpere-icon.png"
              alt="brandxpere logo"
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-2xl font-black tracking-tight text-[#301739] leading-none">
              <span>brand</span>
              <span className="text-[#844D98] font-black">x</span>
              <span>pere</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-[#844D98] transition-colors">
              {t.nav.home}
            </Link>
            <a href="#services" className="text-[#844D98] font-bold transition-colors">
              {t.nav.services}
            </a>
            <a href="#process" className="hover:text-[#844D98] transition-colors">
              {t.nav.process}
            </a>
            <Link href="/pricing" className="hover:text-[#844D98] transition-colors">
              {t.nav.pricing}
            </Link>
            <Link href="/contact" className="hover:text-[#844D98] transition-colors">
              {t.nav.contact}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#DACBE3]/60 bg-[#FAF7FC] hover:bg-white text-xs font-bold text-[#301739] transition-all shadow-xs"
            >
              <Languages className="w-3.5 h-3.5 text-[#844D98]" />
              <span className={!isArabic ? 'text-[#844D98] font-black' : 'text-slate-500'}>EN</span>
              <span className="text-slate-300">|</span>
              <span className={isArabic ? 'text-[#844D98] font-black' : 'text-slate-500'}>عربي</span>
            </button>

            <a
              href="#quote"
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#844D98] hover:bg-[#6F2E82] text-xs sm:text-sm font-bold text-white shadow-md shadow-[#844D98]/25 hover:shadow-lg hover:shadow-[#844D98]/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.nav.quote}</span>
            </a>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════
          AGENCY HERO SECTION (eSoft Light Style)
      ═══════════════════════════════════════ */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-b from-[#FAF7FC] via-white to-[#FAF7FC]">
        {/* Soft Motion Graphic Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-[#844D98]/15 via-[#DACBE3]/30 to-purple-100/40 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute top-1/3 left-10 w-72 h-72 bg-[#DACBE3]/30 rounded-full blur-[80px]" />
          <div className="absolute top-1/4 right-10 w-80 h-80 bg-purple-100/40 rounded-full blur-[90px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#DACBE3]/60 text-xs font-bold text-[#844D98] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#844D98] animate-pulse" />
            <span>{t.hero.badge}</span>
          </div>

          <div className="space-y-4 max-w-5xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#301739] leading-[1.12]">
              {t.hero.titleMain}
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-[#844D98]">
              {t.hero.titleSub}
            </p>
          </div>

          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {t.hero.description}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#quote"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#844D98] hover:bg-[#6F2E82] text-white font-bold text-base shadow-xl shadow-[#844D98]/25 hover:shadow-2xl hover:shadow-[#844D98]/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{t.hero.startProjectBtn}</span>
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white border border-[#DACBE3] hover:border-[#844D98] text-[#301739] font-bold text-base shadow-sm hover:bg-[#FAF7FC] hover:scale-105 transition-all"
            >
              <Cpu className="w-4 h-4 text-[#844D98]" />
              <span>{t.hero.exploreCardsBtn}</span>
            </Link>
          </div>

          {/* Trust Metric Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-6">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-[#DACBE3]/40 shadow-xs flex items-center justify-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#844D98]" />
              <span className="text-xs sm:text-sm font-bold text-[#301739]">{t.hero.stat1}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-[#DACBE3]/40 shadow-xs flex items-center justify-center gap-3">
              <Zap className="w-5 h-5 text-[#844D98]" />
              <span className="text-xs sm:text-sm font-bold text-[#301739]">{t.hero.stat2}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-[#DACBE3]/40 shadow-xs flex items-center justify-center gap-3">
              <MessageCircle className="w-5 h-5 text-[#844D98]" />
              <span className="text-xs sm:text-sm font-bold text-[#301739]">{t.hero.stat3}</span>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SERVICES SHOWCASE (THE 5 PILLARS)
      ═══════════════════════════════════════ */}
      <section id="services" className="py-24 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF7FC] border border-[#DACBE3]/60 text-xs font-bold text-[#844D98]">
              <Layers className="w-3.5 h-3.5 text-[#844D98]" />
              <span>{isArabic ? 'الركائز الإبداعية' : 'Creative Pillars'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#301739]">
              {t.pillarsTitle}
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              {t.pillarsSubtitle}
            </p>
          </div>

          <div className="space-y-10">
            {PILLARS_DATA.map((srv) => {
              const Icon = srv.icon;
              return (
                <div 
                  key={srv.id}
                  className={`rounded-3xl p-8 sm:p-12 border transition-all duration-300 relative overflow-hidden card-hover-motion ${
                    srv.isFlagship
                      ? 'bg-gradient-to-br from-[#FAF7FC] via-white to-purple-50/50 border-[#844D98]/40 shadow-xl shadow-purple-950/5 ring-1 ring-[#844D98]/20'
                      : 'bg-[#FAF7FC]/60 hover:bg-white border-slate-100 hover:border-[#DACBE3] shadow-sm hover:shadow-xl hover:shadow-purple-950/5'
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    <div className="lg:col-span-7 space-y-5 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#844D98] to-[#301739] flex items-center justify-center text-white shadow-md shadow-[#844D98]/20">
                          <Icon className="w-6 h-6 text-[#DACBE3]" />
                        </div>
                        <span className="text-xs font-mono font-bold text-[#844D98] px-3 py-1 rounded-full bg-white border border-[#DACBE3]/50 shadow-xs">
                          {srv.num}
                        </span>
                        {srv.isFlagship && (
                          <span className="text-[11px] font-bold text-white px-2.5 py-0.5 rounded-full bg-[#844D98]">
                            {isArabic ? 'الخدمة المميزة' : 'Flagship Service'}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-2xl sm:text-3xl font-black text-[#301739]">
                          {isArabic ? srv.titleAr : srv.titleEn}
                        </h3>
                        <p className="text-sm sm:text-base font-semibold text-[#844D98]">
                          {isArabic ? srv.taglineAr : srv.taglineEn}
                        </p>
                      </div>

                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                          {isArabic ? 'نطاق العمل ومخرجات الخدمة:' : 'Key Deliverables:'}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {(isArabic ? srv.deliverablesAr : srv.deliverablesEn).map((d, dIdx) => (
                            <div key={dIdx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
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
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#844D98] hover:bg-[#6F2E82] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#844D98]/20 hover:scale-105 active:scale-95 transition-all"
                        >
                          <span>{isArabic ? 'طلب عرض سعر لهذه الخدمة' : 'Request Quote for This Service'}</span>
                          <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
                        </a>

                        {srv.id === 'nfc' && (
                          <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#DACBE3] bg-white hover:bg-[#FAF7FC] text-[#301739] text-xs sm:text-sm font-bold transition-all shadow-xs"
                          >
                            <span>{isArabic ? 'معاينة المنصة والبطاقات' : 'Explore NFC Platform'}</span>
                            <ChevronRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-5 flex justify-center">
                      <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-[#DACBE3]/50 shadow-md space-y-4 text-start">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#301739]">
                            {isArabic ? 'معايير الجودة' : 'Execution Standards'}
                          </span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>

                        <ul className="space-y-3 text-xs text-slate-600">
                          <li className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
                            <span>{isArabic ? 'فريق عمل متمرس ومصمم أول مخصص لمشروعك' : 'Dedicated Senior Art Director & Lead Engineer'}</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
                            <span>{isArabic ? 'قناة تواصل مباشرة عبر واتساب لمتابعة المراحل' : 'Direct WhatsApp communication channel with lead team'}</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
                            <span>{isArabic ? 'تسليم كامل الملفات المصدرية وحقوق الملكية الفكرية' : 'Full intellectual property & source file delivery'}</span>
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
          PROCESS WORKFLOW (eSoft Style)
      ═══════════════════════════════════════ */}
      <section id="process" className="py-24 relative bg-[#FAF7FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#DACBE3]/60 text-xs font-bold text-[#844D98] shadow-xs">
              <Award className="w-3.5 h-3.5 text-[#844D98]" />
              <span>{isArabic ? 'منهجيتنا المعتمدة' : 'Disciplined Methodology'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-[#301739]">
              {t.processTitle}
            </h2>
            <p className="text-slate-600 text-base">
              {t.processSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((p, idx) => (
              <div 
                key={idx}
                className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-[#DACBE3] shadow-sm hover:shadow-xl hover:shadow-purple-950/5 card-hover-motion text-start group transition-all"
              >
                <div className="text-3xl font-black font-mono text-[#844D98]/40 group-hover:text-[#844D98] transition-colors mb-3">
                  {p.step}
                </div>
                <h3 className="text-lg font-bold text-[#301739] mb-2">
                  {isArabic ? p.titleAr : p.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {isArabic ? p.descAr : p.descEn}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          PROJECT INQUIRY FORM (White eSoft Card)
      ═══════════════════════════════════════ */}
      <section id="quote" className="py-24 relative bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#844D98] font-bold">
              {isArabic ? 'طلب استشارة ومقترح' : 'Direct Proposal Inquiry'}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#301739]">
              {t.quoteTitle}
            </h2>
            <p className="text-slate-600 text-base max-w-xl mx-auto">
              {t.quoteSubtitle}
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-[#DACBE3]/60 p-6 sm:p-10 shadow-xl shadow-purple-950/5">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#301739]">
                  {isArabic ? 'تم تجهيز الرسالة ومشاركتها عبر واتساب' : 'Inquiry Ready on WhatsApp'}
                </h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  {isArabic 
                    ? 'تم إرسال مواصفات مشروعك إلى استوديو مراكش (+212 778-481250) وسيتواصل معك الفريق فوراً.'
                    : 'Our team on WhatsApp (+212 778-481250) is ready to discuss your project.'
                  }
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6 text-start">
                
                {/* Services Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#301739] mb-3">
                    {isArabic ? '1. اختر الخدمات المطلوبة:' : '1. Select Services Required:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PILLARS_DATA.map((srv) => {
                      const isChecked = selectedServices.includes(srv.id);
                      return (
                        <div
                          key={srv.id}
                          onClick={() => toggleService(srv.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                            isChecked 
                              ? 'border-[#844D98] bg-[#FAF7FC] text-[#301739] shadow-xs' 
                              : 'border-slate-200 bg-white text-slate-600 hover:border-[#DACBE3]'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                            isChecked ? 'border-[#844D98] bg-[#844D98] text-white' : 'border-slate-300'
                          }`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <span className="text-xs sm:text-sm font-bold">
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {isArabic ? 'الاسم / اسم الشركة' : 'Your Name / Company'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe / Brand"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#844D98] focus:ring-2 focus:ring-[#844D98]/10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      {isArabic ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+212 ... / +1 ..."
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#844D98] focus:ring-2 focus:ring-[#844D98]/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {isArabic ? 'نبذة عن المشروع والأهداف' : 'Project Overview & Goals'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={isArabic ? 'اشرح ما ترغب في إنجازه، روابط مرجعية، أو الموعد المستهدف...' : 'Describe what you want to achieve, timeline, references...'}
                    value={projectNotes}
                    onChange={(e) => setProjectNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#844D98] focus:ring-2 focus:ring-[#844D98]/10 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-[#844D98] hover:bg-[#6F2E82] text-white font-bold text-base shadow-xl shadow-[#844D98]/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
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
          FOOTER (eSoft Style)
      ═══════════════════════════════════════ */}
      <footer className="border-t border-slate-100 bg-[#FAF7FC] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">© 2026 Brandxpere. All rights reserved. Marrakech, Morocco.</p>
          <div className="flex items-center gap-6 text-xs text-slate-600 font-semibold">
            <Link href="/" className="hover:text-[#844D98] transition-colors">{t.nav.home}</Link>
            <Link href="/pricing" className="hover:text-[#844D98] transition-colors">{t.nav.pricing}</Link>
            <Link href="/contact" className="hover:text-[#844D98] transition-colors">{t.nav.contact}</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
