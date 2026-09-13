'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Zap, Shield, ArrowRight, CheckCircle2, ChevronRight, 
  Phone, Mail, MapPin, MessageCircle, Star, Palette, Monitor, 
  Camera, TrendingUp, Cpu, Globe, Lock, Wifi, Layers, Languages,
  Share2, ArrowUpRight, Award, Compass, HeartHandshake, Send
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

// ═══════════════════════════════════════════════════════════
// BILINGUAL CONTENT MATRIX — BRANDXPERE IDENTITY
// ═══════════════════════════════════════════════════════════
const CONTENT = {
  en: {
    nav: {
      about: 'About Us',
      pillars: 'Creative Pillars',
      agency: 'Agency Studio',
      nfc: 'Smart NFC Cards',
      contact: 'Contact',
      quote: 'Get a Quote',
      signIn: 'Sign In',
      startFree: 'Start Free',
    },
    hero: {
      tag: 'Welcome to Brandxpere • Modern Creative Studio',
      headlinePrefix: 'We Build Brands That',
      headlineMain: 'Build Business.',
      headlineSub: 'Your Vision. Our Creative Expertise.',
      description: 'Brandxpere is a modern creative studio dedicated to helping brands build a strong, distinctive, and meaningful presence in today’s fast-moving digital world. We combine world-class visual identity, custom web engineering, cinematic media, and smart NFC hardware.',
      createCardBtn: 'Order Smart NFC Card',
      exploreStudioBtn: 'Explore Creative Studio',
      whatsAppBtn: 'WhatsApp Consultation',
      trustedBy: 'Trusted by 50,000+ professionals and leading companies',
    },
    about: {
      badge: 'About Brandxpere',
      title: 'A Complete Experience Shaped by Visual Identity, Creativity & Strategy',
      p1: 'Brandxpere is a modern creative studio dedicated to helping brands build a strong, distinctive, and meaningful presence in today’s fast-moving digital world.',
      p2: 'We believe that a brand is more than just a logo — it is a complete experience shaped by visual identity, creativity, strategy, and communication.',
      p3: 'Our approach brings together branding and visual identity, website creation, photography and video editing, social media management, and digital advertising, allowing us to create consistent and powerful brand experiences across every touchpoint.',
      p4: 'Every project is designed with a balance of strategy, aesthetics, innovation, and functionality, making sure that each brand has its own unique voice and visual personality.',
      quoteHighlight: 'At Brandxpere, we transform ideas into visual experiences that capture attention, create connections, and leave a lasting impression. We don’t just design brands — we create experiences that make them unforgettable.',
    },
    pillars: {
      badge: 'Core Creative Pillars',
      title: 'Four Pillars of Creative Excellence',
      subtitle: 'From brand conception to digital dominance and connected smart hardware.',
      items: [
        {
          id: 'branding',
          num: '01',
          title: 'Branding & Identity',
          tagline: 'Personality & Distinction',
          desc: 'We craft unique visual identities that reflect your brand’s personality and values, from logos and typography to comprehensive design systems.',
          icon: Palette,
          gradient: 'from-[#844D98] via-[#602773] to-[#301739]',
          borderHover: 'hover:border-[#844D98]',
        },
        {
          id: 'web',
          num: '02',
          title: 'Website Creation',
          tagline: 'Performance & Seamless UX',
          desc: 'We design and develop modern, high-performance Next.js websites that combine striking aesthetics with seamless user experiences.',
          icon: Monitor,
          gradient: 'from-blue-600 to-indigo-700',
          borderHover: 'hover:border-blue-400',
        },
        {
          id: 'media',
          num: '03',
          title: 'Photography & Video',
          tagline: 'Cinematic Storytelling',
          desc: 'We capture and edit stunning visual content and motion graphics that tell your brand’s authentic story and captivate your audience.',
          icon: Camera,
          gradient: 'from-purple-600 to-pink-600',
          borderHover: 'hover:border-purple-400',
        },
        {
          id: 'marketing',
          num: '04',
          title: 'Social Media & Growth',
          tagline: 'Measurable Reach & ROI',
          desc: 'We help brands grow with targeted digital marketing, high-converting social campaigns, and data-driven advertising strategies.',
          icon: TrendingUp,
          gradient: 'from-emerald-600 to-teal-700',
          borderHover: 'hover:border-emerald-400',
        },
        {
          id: 'nfc',
          num: '05',
          title: 'Smart NFC & Connected Identity',
          tagline: 'Physical Luxury Meets Digital Speed',
          desc: 'Our signature hardware product line: laser-engraved metal and matte smart NFC business cards. One tap transmits your full digital profile directly to any phone without apps.',
          icon: Cpu,
          gradient: 'from-[#844D98] via-[#602773] to-[#301739]',
          borderHover: 'hover:border-[#844D98]',
          isFlagship: true,
        },
      ],
    },
    nfcSection: {
      badge: 'Connected Hardware Ecosystem',
      title: 'Smart NFC Business Cards Reimagined',
      subtitle: 'The modern replacement for paper cards. Tap, connect, and impress instantly.',
      features: [
        { title: 'Zero App Required', desc: 'Works natively on every modern iPhone and Android device with built-in NFC and camera QR.' },
        { title: 'Live Dynamic Cloud Profile', desc: 'Update your contact details, social links, and bio anytime without reprinting cards.' },
        { title: 'Fleet Team Management', desc: 'Corporate portal to provision, manage, and track hundreds of employee smart cards in real-time.' },
        { title: 'Real-time Scan Analytics', desc: 'Track every interaction, tap, and lead with device and geographic insights.' },
      ],
    },
    quote: {
      badge: 'Start Your Project',
      title: 'Let’s Bring Your Vision to Life',
      subtitle: 'Select what you need and connect directly with our Marrakech studio.',
      btn: 'Send Project Inquiry via WhatsApp',
    },
    footer: {
      desc: 'Modern creative studio and smart NFC hardware platform. Elevating brands through world-class branding, Next.js engineering, and connected identity.',
      servicesTitle: 'Creative Services',
      nfcTitle: 'Smart NFC Platform',
      contactTitle: 'Studio & Support',
      hotline: 'Hotline & WhatsApp: +212 778-481250',
      email: 'BRANDXPER@GMAIL.COM',
      location: 'Marrakech, Morocco (المغرب)',
      rights: '© 2026 Brandxpere. All rights reserved.',
    },
  },
  ar: {
    nav: {
      about: 'من نحن',
      pillars: 'أركان الهوية',
      agency: 'استوديو الوكالة',
      nfc: 'بطاقات NFC الذكية',
      contact: 'تواصل معنا',
      quote: 'طلب عرض سعر',
      signIn: 'دخول',
      startFree: 'ابدأ مجاناً',
    },
    hero: {
      tag: 'مرحباً بكم في Brandxpere • استوديو إبداعي متكامل',
      headlinePrefix: 'نبني علامات تجارية تصنع',
      headlineMain: 'النجاح لأعمالك.',
      headlineSub: 'رؤيتكم الاستثنائية. خبرتنا الإبداعية المتكاملة.',
      description: 'Brandxpere هو استوديو إبداعي معاصر مكرس لمساعدة العلامات التجارية على بناء حضور قوي ومميز في العالم الرقمي اليوم. نجمع بين ابتكار الهويات البصرية، البرمجة وهندسة المواقع، المحتوى المرئي السينمائي، وأجهزة NFC الذكية.',
      createCardBtn: 'اطلب بطاقة NFC الذكية',
      exploreStudioBtn: 'استكشف الاستوديو الإبداعي',
      whatsAppBtn: 'استشارة واتساب فورية',
      trustedBy: 'يثق بنا أكثر من 50,000 محترف وأكبر الشركات',
    },
    about: {
      badge: 'عن Brandxpere',
      title: 'تجربة متكاملة تشكلها الهوية البصرية، الإبداع، والاستراتيجية',
      p1: 'Brandxpere هو استوديو إبداعي معاصر مكرس لمساعدة العلامات التجارية على بناء حضور قوي، مميز، وذي مغزى في العالم الرقمي سريع التطور اليوم.',
      p2: 'نحن نؤمن بأن العلامة التجارية أكثر من مجرد شعار — إنها تجربة متكاملة تتشكل من خلال الهوية البصرية، الابتكار الإبداعي، الاستراتيجية، والتواصل الفعال.',
      p3: 'نهجنا يجمع بين الهوية البصرية وتصميم العلامات، إنشاء المواقع وتطبيقات الويب، التصوير الفوتوغرافي والإنتاج المرئي، إدارة شبكات التواصل، والإعلانات الرقمية المركزة.',
      p4: 'يتم تصميم كل مشروع بتوازن دقيق بين الاستراتيجية، الجماليات، الابتكار، والوظيفة العملية، مما يضمن أن تمتلك كل علامة صوتها المميز وشخصيتها البصرية الخاصة.',
      quoteHighlight: 'في Brandxpere، نحول الأفكار إلى تجارب بصرية تأسر الانتباه، وتخلق الروابط، وتترك أثراً دائماً. نحن لا نصمم علامات تجارية فقط — بل نصنع تجارب تجعلها مستحيلة النسيان.',
    },
    pillars: {
      badge: 'الركائز الإبداعية الأربعة',
      title: 'منظومة الإبداع والنمو المتكاملة',
      subtitle: 'من بناء الهوية وتصميم الأيقونة وحتى الريادة الرقمية والأجهزة الذكية.',
      items: [
        {
          id: 'branding',
          num: '01',
          title: 'الهوية البصرية وتصميم العلامات',
          tagline: 'الشخصية والتميز البصري',
          desc: 'نصنع هويات بصرية فريدة تعكس شخصية وقيم علامتك التجارية بدقة، بدءاً من تصميم الشعارات والخطوط وحتى الدليل الإرشادي المتكامل (Brand Guidelines).',
          icon: Palette,
          gradient: 'from-[#844D98] via-[#602773] to-[#301739]',
          borderHover: 'hover:border-[#844D98]',
        },
        {
          id: 'web',
          num: '02',
          title: 'برمجة وتطوير المواقع والمنصات',
          tagline: 'الأداء الفائق وتجربة المستخدم',
          desc: 'نصمم ونطور مواقع وتطبيقات عصرية فائقة السرعة مدعومة بأحدث تقنيات Next.js تضمن تفاعلاً سلساً وتجربة مستخدم لا تُنسى.',
          icon: Monitor,
          gradient: 'from-blue-600 to-indigo-700',
          borderHover: 'hover:border-blue-400',
        },
        {
          id: 'media',
          num: '03',
          title: 'التصوير والمونتاج المرئي',
          tagline: 'رواية القصص بأسلوب سينمائي',
          desc: 'نلتقط وننتج محتوى بصرياً سينمائياً وموشن جرافيكس عالي الدقة يروي قصة علامتك بصدق ويجذب جمهورك المستهدف.',
          icon: Camera,
          gradient: 'from-purple-600 to-pink-600',
          borderHover: 'hover:border-purple-400',
        },
        {
          id: 'marketing',
          num: '04',
          title: 'إدارة التواصل والتسويق الرقمي',
          tagline: 'انتشار مدروس وعائد حقيقي',
          desc: 'نساعد علامتك على التوسع والنمو عبر استراتيجيات تسويق رقمي مدروسة، حملات إعلانية ممولة دقيقة، وبناء مجتمع وفي لعلامتك.',
          icon: TrendingUp,
          gradient: 'from-emerald-600 to-teal-700',
          borderHover: 'hover:border-emerald-400',
        },
        {
          id: 'nfc',
          num: '05',
          title: 'بطاقات NFC الذكية والأجهزة المتصلة',
          tagline: 'الفخامة الملموسة والسرعة الرقمية',
          desc: 'خط أجهزتنا المميز: بطاقات أعمال معدنية ومات محفورة بالليزر تعمل بتقنية NFC. لمسة واحدة على أي هاتف تنقل بروفايلك الرقمي فوراً بدون الحاجة لأي تطبيقات.',
          icon: Cpu,
          gradient: 'from-[#844D98] via-[#602773] to-[#301739]',
          borderHover: 'hover:border-[#844D98]',
          isFlagship: true,
        },
      ],
    },
    nfcSection: {
      badge: 'منظومة الأجهزة الذكية المتصلة',
      title: 'بطاقات الأعمال الذكية بحلة جديدة كلياً',
      subtitle: 'البديل العصري للبطاقات الورقية التقليدية. المس، تواصل، واصنع انطباعاً استثنائياً.',
      features: [
        { title: 'لا يتطلب أي تطبيق', desc: 'تعمل تلقائياً مع جميع أجهزة آيفون وأندرويد الحديثة بمجرد الملامسة أو مسح رمز QR.' },
        { title: 'ملف رقمي سحابي فوري', desc: 'حدّث معلوماتك وأرقامك وروابطك في أي لحظة من لوحة التحكم دون الحاجة لإعادة طباعة البطاقة.' },
        { title: 'إدارة فرق العمل والشركات', desc: 'لوحة تحكم مركزية للشركات لإصدار وتحديث ومتابعة بطاقات مئات الموظفين في ثوانٍ.' },
        { title: 'إحصائيات تفاعل وتحليلات مباشرة', desc: 'تتبع عدد مرات المسح، النقرات على الروابط، والموقع الجغرافي للتفاعلات بشكل مباشر.' },
      ],
    },
    quote: {
      badge: 'ابدأ مشروعك الآن',
      title: 'دعنا نحول رؤيتك إلى واقع ملهم',
      subtitle: 'حدد الخدمات التي تحتاجها وتواصل مباشرة مع فريق استوديو مراكش.',
      btn: 'إرسال تفاصيل المشروع عبر واتساب',
    },
    footer: {
      desc: 'استوديو إبداعي معاصر ومنصة بطاقات NFC الذكية. نرتقي بالعلامات التجارية عبر تصاميم عالمية، برمجة Next.js، وبطاقات الهوية المتصلة.',
      servicesTitle: 'الخدمات الإبداعية',
      nfcTitle: 'منصة بطاقات NFC',
      contactTitle: 'الاستوديو والدعم',
      hotline: 'الهاتف والواتساب: 212778481250+',
      email: 'BRANDXPER@GMAIL.COM',
      location: 'مراكش، المغرب (Marrakech, Morocco)',
      rights: '© 2026 Brandxpere. جميع الحقوق محفوظة.',
    },
  },
};

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
  const { language, setLanguage, dir } = useTranslation();
  const t = CONTENT[language] || CONTENT.en;
  const isArabic = language === 'ar';

  const [activeNfcMaterial, setActiveNfcMaterial] = useState<'matte' | 'bamboo' | 'metal'>('matte');

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div 
      className="flex flex-col min-h-screen bg-white text-slate-900 overflow-x-hidden font-sans transition-all duration-300"
      dir={dir}
    >

      {/* ═══════════════════════════════════════
          HEADER / NAVBAR (eSoft Clean Style - Freestanding Logo)
      ═══════════════════════════════════════ */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo - Freestanding & Professional without Box Background */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-95 transition-opacity group">
            <img
              src="/brandxpere-icon.png"
              alt="brandxpere logo"
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-2xl font-black tracking-tight font-sans text-[#301739] leading-none">
              <span>brand</span>
              <span className="text-[#844D98] font-black">x</span>
              <span>pere</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <a href="#about" className="hover:text-[#844D98] transition-colors">
              {t.nav.about}
            </a>
            <a href="#pillars" className="hover:text-[#844D98] transition-colors">
              {t.nav.pillars}
            </a>
            <Link 
              href="/agency" 
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF7FC] border border-[#DACBE3]/60 text-[#844D98] hover:bg-white transition-all font-bold shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#844D98]" />
              <span>{t.nav.agency}</span>
            </Link>
            <a href="#nfc" className="hover:text-[#844D98] transition-colors">
              {t.nav.nfc}
            </a>
            <Link href="/contact" className="hover:text-[#844D98] transition-colors">
              {t.nav.contact}
            </Link>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3.5">
            
            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#DACBE3]/60 bg-[#FAF7FC] hover:bg-white text-xs font-bold text-slate-700 transition-all shadow-xs"
              title={isArabic ? 'Switch to English' : 'التحويل إلى العربية'}
            >
              <Languages className="w-3.5 h-3.5 text-[#844D98]" />
              <span className={!isArabic ? 'text-[#844D98] font-black' : 'text-slate-500'}>EN</span>
              <span className="text-slate-300">|</span>
              <span className={isArabic ? 'text-[#844D98] font-black' : 'text-slate-500'}>عربي</span>
            </button>

            <Link 
              href="/agency#quote"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#DACBE3]/60 bg-[#FAF7FC] hover:bg-white text-xs font-bold text-[#844D98] transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.nav.quote}</span>
            </Link>

            <Link 
              href="/auth/register" 
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#844D98] hover:bg-[#6F2E82] text-xs sm:text-sm font-bold text-white shadow-md shadow-[#844D98]/25 hover:shadow-lg hover:shadow-[#844D98]/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span>{t.nav.startFree}</span>
              <ChevronRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════
          HERO SECTION (eSoft CLEAN WHITE STYLE)
      ═══════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-white via-[#FAF7FC] to-white">
        
        {/* Soft Ambient Floating Motion Graphic Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-[550px] h-[550px] bg-[#844D98]/8 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-1/3 right-0 w-[450px] h-[450px] bg-[#DACBE3]/40 rounded-full blur-[100px] animate-float" />
          <div className="absolute -bottom-20 left-1/3 w-[400px] h-[400px] bg-purple-100/60 rounded-full blur-[90px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#844D98_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-7 animate-slide-up text-start">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#DACBE3]/60 text-xs font-bold text-[#844D98] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#844D98] animate-ping" />
                <span>{t.hero.tag}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#301739] leading-[1.12]">
                <span className="text-slate-600 block font-light text-2xl sm:text-3xl mb-1 tracking-normal">
                  {t.hero.headlinePrefix}
                </span>
                <span className="bg-gradient-to-r from-[#301739] via-[#844D98] to-[#602773] bg-clip-text text-transparent block font-black">
                  {t.hero.headlineMain}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-[#844D98] mt-2 block italic">
                  {t.hero.headlineSub}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                {t.hero.description}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#844D98] hover:bg-[#6F2E82] text-white font-bold text-base shadow-xl shadow-[#844D98]/25 hover:shadow-2xl hover:shadow-[#844D98]/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <Cpu className="w-5 h-5" />
                  <span>{t.hero.createCardBtn}</span>
                  <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
                </Link>
                <Link
                  href="/agency"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white border border-[#DACBE3] hover:border-[#844D98] text-[#301739] font-bold text-base shadow-sm hover:bg-[#FAF7FC] hover:scale-105 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#844D98]" />
                  <span>{t.hero.exploreStudioBtn}</span>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-200/80">
                <div className="flex -space-x-2">
                  {['B','X','P','E','R'].map((l,i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-tr from-[#844D98] to-[#301739] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                    <span className="text-sm font-extrabold text-[#301739] ml-1">4.9 / 5</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{t.hero.trustedBy}</p>
                </div>
              </div>

            </div>

            {/* Hero Visual (Clean 3D Mockup & Motion Graphics) */}
            <div className="lg:col-span-5 relative flex justify-center items-center h-[560px] animate-fade-in delay-300">
              
              {/* Rotating Light Rings */}
              <div className="absolute w-[400px] h-[400px] rounded-full border border-purple-200/60 animate-spin-slow" />
              <div className="absolute w-[320px] h-[320px] rounded-full border border-[#844D98]/20 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '14s' }} />

              {/* iPhone Frame */}
              <div className="relative w-[280px] h-[520px] bg-slate-900 rounded-[48px] p-3 shadow-2xl shadow-purple-950/20 border-4 border-slate-800 flex flex-col justify-between overflow-hidden">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-20" />

                {/* Inner Screen */}
                <div className="w-full h-full rounded-[40px] bg-white overflow-hidden flex flex-col items-center p-5 pt-8 text-center relative">
                  
                  {/* Decorative Header Gradient */}
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-purple-100 via-purple-50/50 to-transparent pointer-events-none" />

                  {/* Avatar - Clean Freestanding Logo */}
                  <div className="relative mt-10 z-10">
                    <div className="w-18 h-18 rounded-full p-1 bg-white shadow-lg">
                      <div className="w-full h-full rounded-full bg-white border border-slate-100 flex items-center justify-center p-2">
                        <img src="/brandxpere-icon.png" alt="logo" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold mt-3 text-[#301739] z-10">BRANDXPERE</h3>
                  <p className="text-[10px] text-[#844D98] font-bold uppercase tracking-widest z-10">Creative Studio & Smart NFC</p>
                  <p className="text-[10px] text-slate-500 text-center mt-1.5 max-w-[190px] leading-relaxed z-10">
                    We Build Brands That Build Business.
                  </p>

                  <button className="w-full mt-4 py-2.5 rounded-full bg-[#844D98] hover:bg-[#6F2E82] text-white font-bold text-xs shadow-md shadow-[#844D98]/25 transition-transform z-10">
                    💾 {isArabic ? 'حفظ جهة الاتصال' : 'Save Contact'}
                  </button>

                  <div className="grid grid-cols-3 gap-2 w-full mt-3.5 z-10">
                    {[
                      { icon: Phone, label: isArabic ? 'اتصال' : 'Call', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { icon: Mail, label: isArabic ? 'بريد' : 'Email', color: 'text-blue-600', bg: 'bg-blue-50' },
                      { icon: Globe, label: isArabic ? 'موقع' : 'Web', color: 'text-[#844D98]', bg: 'bg-purple-50' },
                    ].map(({ icon: Icon, label, color, bg }) => (
                      <div key={label} className={`flex flex-col items-center gap-1 p-2 ${bg} border border-slate-200/60 rounded-xl hover:scale-105 transition-transform cursor-pointer`}>
                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                        <span className="text-[9px] text-slate-700 font-bold">{label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="w-full mt-3 space-y-1.5 z-10 text-start">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-[10px] text-slate-700 flex items-center gap-2">
                      <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="font-mono font-medium">+212 778-481250</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-[10px] text-slate-700 flex items-center gap-2">
                      <Mail className="w-3 h-3 text-blue-600 shrink-0" />
                      <span className="font-mono font-medium truncate">BRANDXPER@GMAIL.COM</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-[10px] text-slate-700 flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
                      <span className="font-medium">Marrakech, Morocco</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Floating Laser Engraved Card */}
              <div className="absolute bottom-6 right-0 w-60 h-36 z-20 animate-card-float delay-1000">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#301739] via-[#240e2b] to-[#140618] border border-white/20 p-4 flex flex-col justify-between shadow-2xl shadow-purple-900/30">
                  <div className="flex justify-between items-center">
                    <img src="/brandxpere-icon.png" alt="icon" className="w-5 h-5 object-contain" />
                    <span className="text-[9px] font-bold text-[#DACBE3] uppercase tracking-widest">SMART NFC CARD</span>
                    <Wifi className="w-4 h-4 text-purple-300" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white tracking-wide">brandxpere</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[9px] text-purple-200">Creative Studio</span>
                      <span className="text-[8px] font-mono text-emerald-300 bg-emerald-400/20 px-1.5 py-0.5 rounded border border-emerald-400/30">Active Chip</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Interaction Metric */}
              <div className="absolute top-12 left-0 z-20 animate-float-slow delay-500">
                <div className="px-4 py-2.5 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-purple-500/10 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-start">
                    <div className="text-[10px] text-slate-400 font-medium">Interaction Growth</div>
                    <div className="text-sm font-extrabold text-emerald-600">+184%</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STATS STRIP (LIGHT CLEAN eSoft STYLE)
      ═══════════════════════════════════════ */}
      <section className="py-12 border-y border-slate-100 bg-[#FAF7FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 150, suffix: '+', label: isArabic ? 'مشروع إبداعي منجز' : 'Delivered Projects', color: 'text-[#844D98]' },
              { value: 50000, suffix: '+', label: isArabic ? 'تفاعل ومسحة لبطاقات NFC' : 'NFC Card Interactions', color: 'text-blue-600' },
              { value: 99, suffix: '.8%', label: isArabic ? 'نسبة رضا العملاء' : 'Client Satisfaction', color: 'text-emerald-600' },
              { value: 8, suffix: '.4x', label: isArabic ? 'متوسط العائد الإعلاني ROAS' : 'Average Campaign ROAS', color: 'text-[#301739]' },
            ].map(({ value, suffix, label, color }) => (
              <div key={label} className="space-y-1">
                <div className={`text-3xl sm:text-4xl font-black ${color}`}>
                  <CountUp end={value} />{suffix}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ABOUT US SECTION (FROM BRAND PDF)
      ═══════════════════════════════════════ */}
      <section id="about" className="py-24 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-4xl mx-auto text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF7FC] border border-[#DACBE3]/60 text-xs font-bold text-[#844D98] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#844D98]" />
              <span>{t.about.badge}</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#301739] leading-tight">
              {t.about.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-5 text-start">
              <p className="text-base sm:text-lg text-[#301739] font-bold leading-relaxed">
                {t.about.p1}
              </p>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {t.about.p2}
              </p>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {t.about.p3}
              </p>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {t.about.p4}
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="p-8 rounded-3xl bg-[#FAF7FC] border border-[#DACBE3]/60 shadow-lg relative overflow-hidden group">
                <div className="text-5xl text-[#844D98] font-serif font-black mb-2 opacity-60">“</div>
                <p className="text-sm sm:text-base text-[#301739] font-bold leading-relaxed italic">
                  {t.about.quoteHighlight}
                </p>
                <div className="mt-6 pt-4 border-t border-[#DACBE3]/40 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#844D98] uppercase tracking-wider">Brandxpere Philosophy</span>
                  <img src="/brandxpere-icon.png" alt="logo" className="w-7 h-7 object-contain" />
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          CORE PILLARS (THE 4 + 1 FROM BRAND GUIDE)
      ═══════════════════════════════════════ */}
      <section id="pillars" className="py-24 relative bg-[#FAF7FC] border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#DACBE3]/60 text-xs font-bold text-[#844D98] shadow-xs">
              <Layers className="w-3.5 h-3.5" />
              <span>{t.pillars.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#301739]">
              {t.pillars.title}
            </h2>
            <p className="text-slate-600 text-base">
              {t.pillars.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.pillars.items.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.id}
                  className={`card-hover-motion rounded-3xl p-8 flex flex-col justify-between border bg-white shadow-sm hover:shadow-xl hover:shadow-purple-950/5 transition-all ${
                    pillar.isFlagship
                      ? 'border-[#844D98]/40 lg:col-span-2 bg-gradient-to-br from-white via-[#FAF7FC] to-purple-50/40 ring-1 ring-[#844D98]/20'
                      : 'border-slate-100 hover:border-[#DACBE3]'
                  }`}
                >
                  <div className="space-y-4 text-start">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono font-extrabold text-[#844D98] bg-[#FAF7FC] px-2.5 py-1 rounded-full border border-[#DACBE3]/60 shadow-xs">
                        {pillar.num}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-[#301739]">
                        {pillar.title}
                      </h3>
                      <p className="text-xs font-bold text-[#844D98] mt-1">
                        {pillar.tagline}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href="/agency"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#844D98] hover:text-[#301739] transition-colors"
                    >
                      <span>{isArabic ? 'تفاصيل الخدمة' : 'Explore Deliverables'}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} />
                    </Link>

                    <a
                      href={`https://wa.me/212778481250?text=Hello%20Brandxpere%2C%20I%20am%20interested%20in%20${encodeURIComponent(pillar.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'استفسار' : 'Inquire'}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SMART NFC SECTION (CLEAN WHITE eSoft STYLE)
      ═══════════════════════════════════════ */}
      <section id="nfc" className="py-24 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF7FC] border border-[#DACBE3]/60 text-xs font-bold text-[#844D98] shadow-xs">
              <Cpu className="w-3.5 h-3.5" />
              <span>{t.nfcSection.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#301739]">
              {t.nfcSection.title}
            </h2>
            <p className="text-base text-slate-600">
              {t.nfcSection.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.nfcSection.features.map((f, i) => (
              <div key={i} className="card-hover-motion p-6 rounded-3xl bg-[#FAF7FC] border border-slate-100 hover:border-[#DACBE3] shadow-xs space-y-3 text-start transition-all">
                <div className="w-10 h-10 rounded-2xl bg-white text-[#844D98] border border-[#DACBE3]/60 shadow-xs flex items-center justify-center font-bold text-sm">
                  0{i + 1}
                </div>
                <h3 className="text-base font-bold text-[#301739]">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#844D98] hover:bg-[#6F2E82] text-white font-bold text-base shadow-xl shadow-[#844D98]/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Cpu className="w-5 h-5" />
              <span>{t.hero.createCardBtn}</span>
              <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
            </Link>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          QUOTE BANNER (DEEP PURPLE CTA)
      ═══════════════════════════════════════ */}
      <section className="py-20 relative bg-gradient-to-r from-[#301739] via-[#844D98] to-[#301739] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#DACBE3] font-bold">
            {t.quote.badge}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black">
            {t.quote.title}
          </h2>
          <p className="text-base text-[#DACBE3]/90 max-w-xl mx-auto">
            {t.quote.subtitle}
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/212778481250?text=Hello%20Brandxpere%20Studio%2C%20I%20would%20like%20to%20discuss%20a%20project"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base shadow-2xl shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{t.quote.btn}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER (CLEAN LIGHT STYLE)
      ═══════════════════════════════════════ */}
      <footer className="border-t border-slate-200/80 bg-[#FAF7FC] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            
            {/* Brand Identity Column */}
            <div className="lg:col-span-2 space-y-4 text-start">
              <Link href="/" className="flex items-center gap-2.5">
                <img src="/brandxpere-icon.png" alt="brandxpere logo" className="w-9 h-9 object-contain" />
                <span className="text-2xl font-black tracking-tight font-sans text-[#301739] leading-none">
                  <span>brand</span>
                  <span className="text-[#844D98] font-black">x</span>
                  <span>pere</span>
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm">
                {t.footer.desc}
              </p>
              
              <div className="space-y-2 pt-2 text-xs text-slate-600">
                <a 
                  href="https://wa.me/212778481250" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-emerald-600 font-bold hover:underline"
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{t.footer.hotline}</span>
                </a>
                <a 
                  href="mailto:BRANDXPER@GMAIL.COM" 
                  className="flex items-center gap-2 text-[#844D98] font-bold hover:underline"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>{t.footer.email}</span>
                </a>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-amber-500" />
                  <span>{t.footer.location}</span>
                </div>
              </div>
            </div>

            {/* Column 1: Creative Pillars */}
            <div className="text-start">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#301739] mb-4">
                {t.footer.servicesTitle}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                <li><a href="#pillars" className="hover:text-[#844D98] transition-colors">Branding & Identity</a></li>
                <li><a href="#pillars" className="hover:text-[#844D98] transition-colors">Website Creation</a></li>
                <li><a href="#pillars" className="hover:text-[#844D98] transition-colors">Photography & Video</a></li>
                <li><a href="#pillars" className="hover:text-[#844D98] transition-colors">Social Media & Ads</a></li>
                <li><Link href="/agency#quote" className="text-[#844D98] font-bold hover:underline">Get a Proposal →</Link></li>
              </ul>
            </div>

            {/* Column 2: NFC Platform */}
            <div className="text-start">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#301739] mb-4">
                {t.footer.nfcTitle}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                <li><Link href="/auth/register" className="hover:text-[#844D98] transition-colors">{t.nav.startFree}</Link></li>
                <li><Link href="/dashboard" className="hover:text-[#844D98] transition-colors">{isArabic ? 'لوحة التحكم' : 'Client Dashboard'}</Link></li>
                <li><Link href="/contact" className="hover:text-[#844D98] transition-colors">{isArabic ? 'طلبات الشركات' : 'Corporate Fleet'}</Link></li>
                <li><Link href="/agency" className="hover:text-[#844D98] transition-colors">{isArabic ? 'استوديو الوكالة' : 'Agency Studio'}</Link></li>
              </ul>
            </div>

            {/* Column 3: Quick Hotline */}
            <div className="p-5 rounded-3xl bg-white border border-[#DACBE3]/60 shadow-xs space-y-3 text-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 block">
                {isArabic ? 'استشارة فورية' : 'Studio Hotline'}
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isArabic 
                  ? 'تحدث مباشرة مع فريق الاستوديو في مراكش لمناقشة هويتك أو مشروعك.'
                  : 'Speak directly with our Marrakech studio specialists to discuss your project.'}
              </p>
              <a 
                href="https://wa.me/212778481250"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                <span>WhatsApp: +212 778-481250</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} />
              </a>
            </div>

          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>{t.footer.rights}</p>
            <div className="flex items-center gap-6">
              <Link href="/agency" className="hover:text-[#844D98]">{t.nav.agency}</Link>
              <Link href="/contact" className="hover:text-[#844D98]">{t.nav.contact}</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
