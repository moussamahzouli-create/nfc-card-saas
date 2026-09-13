'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { 
  Zap, Shield, Smartphone, Layers, ChevronRight, Activity, 
  Mail, Globe, Phone, Star, QrCode, Wifi, Users, 
  BarChart3, Palette, Check, ArrowRight, Play, MapPin, 
  Sparkles, Award, TrendingUp, MessageCircle, Monitor, 
  Cpu, Video, Send, CheckCircle2, Camera, Share2,
  Languages, Eye, Compass, ArrowUpRight
} from 'lucide-react';
import { InstagramIcon } from '@/components/BrandLogo';
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
      pricing: 'Pricing',
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
          tagline: 'Visual Identity & System Design',
          desc: 'We craft unique visual identities that reflect your brand’s personality and values. From bespoke logo marks to typography, color psychology, and luxury packaging.',
          icon: Palette,
          gradient: 'from-[#844D98] to-[#301739]',
          borderHover: 'hover:border-[#844D98]/40',
        },
        {
          id: 'web',
          num: '02',
          title: 'Website Creation',
          tagline: 'UX Engineering & Web Platforms',
          desc: 'We design and develop modern, responsive websites that provide seamless user experiences. Built on Next.js 15 with lightning-fast speeds and conversion-optimized architectures.',
          icon: Monitor,
          gradient: 'from-blue-600 to-indigo-700',
          borderHover: 'hover:border-blue-400',
        },
        {
          id: 'media',
          num: '03',
          title: 'Photography & Video Editing',
          tagline: 'Cinematic Media & 3D Motion',
          desc: 'We capture and edit stunning visual content that tells your story and engages your audience. Commercial shoots, 3D product renders, and high-retention video content.',
          icon: Camera,
          gradient: 'from-fuchsia-600 to-pink-600',
          borderHover: 'hover:border-fuchsia-400',
        },
        {
          id: 'marketing',
          num: '04',
          title: 'Social Media Management & Ads',
          tagline: 'Growth Marketing & High ROAS',
          desc: 'We manage your social presence and run targeted ad campaigns that grow your brand online. Data-driven Meta & Google ad funnels with proven conversion optimization.',
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
    palette: {
      badge: 'Brand Identity System',
      title: 'Our Signature Color Palette & Typography',
      desc: 'The official Brandxpere aesthetic harmony: luxury, clarity, and modern sophistication.',
      fontTitle: 'Poppins Font (Geometric Sans)',
      fontSample: 'Aa Bb Cc 0123456789 •$#@&!%?+',
      swatches: [
        { code: '#301739', label: '01 Deep Royal Plum', role: 'Base Luxury & High-Contrast Typography' },
        { code: '#DACBE3', label: '02 Soft Lavender', role: 'Subtle Accents & Soft UI Cards' },
        { code: '#844D98', label: '03 Brand Amethyst', role: 'Primary Signature Brand Color' },
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
    pricing: {
      badge: 'Transparent Pricing',
      title: 'Plans for Individuals & Enterprises',
      subtitle: 'Get started free or upgrade to customized laser-engraved hardware.',
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
      pricing: 'الأسعار',
      contact: 'تواصل معنا',
      quote: 'طلب عرض سعر',
      signIn: 'تسجيل الدخول',
      startFree: 'ابدأ مجاناً',
    },
    hero: {
      tag: 'مرحباً بكم في Brandxpere • استوديو إبداعي معاصر',
      headlinePrefix: 'نبني علامات تجارية',
      headlineMain: 'تصنع النجاح لأعمالك.',
      headlineSub: 'رؤيتكم الاستثنائية. خبرتنا الإبداعية المتكاملة.',
      description: 'Brandxpere هو استوديو إبداعي معاصر مكرس لمساعدة العلامات التجارية على بناء حضور قوي ومميز وذي مغزى في العالم الرقمي المتسارع. نوحد بين تصميم الهوية البصرية الفاخرة، تطوير المواقع المتقدمة، الإنتاج الإعلامي السينمائي، وبطاقات الأعمال الذكية NFC.',
      createCardBtn: 'اطلب بطاقتك الذكية NFC',
      exploreStudioBtn: 'استكشف خدمات الاستوديو',
      whatsAppBtn: 'استشارة فورية عبر واتساب',
      trustedBy: 'موثوق به من أكثر من 50,000 مهني وشركة رائدة حول العالم',
    },
    about: {
      badge: 'عن Brandxpere',
      title: 'تجربة متكاملة تصنعها الهوية البصرية، الإبداع، والاستراتيجية',
      p1: 'Brandxpere هو استوديو إبداعي معاصر مكرس لمساعدة العلامات التجارية على بناء حضور قوي ومتميز ومؤثر في العالم الرقمي اليوم.',
      p2: 'نحن نؤمن بأن العلامة التجارية هي أكثر بكثير من مجرد شعار — إنها تجربة متكاملة تتشكل من خلال الهوية البصرية، الإبداع، التخطيط الاستراتيجي، والتواصل الفعّال.',
      p3: 'نهجنا يجمع بتناغم بين الهوية البصرية وتصميم العلامات، بناء وتطوير المواقع الإلكترونية، التصوير والإنتاج السينمائي، إدارة منصات التواصل الاجتماعي، والإعلانات الرقمية الممولة، مما يتيح لنا خلق تجارب علامة تجارية متسقة وقوية عبر كل نقطة اتصال مع جمهورك.',
      p4: 'يتم تصميم كل مشروع بتوازن دقيق بين الاستراتيجية، الجماليات، الابتكار، والوظيفة العملية، مما يضمن أن تمتلك كل علامة صوتها الفريد وشخصيتها البصرية الخاصة.',
      quoteHighlight: 'في Brandxpere، نحول الأفكار إلى تجارب بصرية تأسر الأنظار، تبني العلاقات المتينة، وتترك انطباعاً دائماً. نحن لا نصمم علامات تجارية فقط — نحن نصنع تجارب تجعلها مستحيلة النسيان.',
    },
    pillars: {
      badge: 'الركائز الإبداعية الأساسية',
      title: 'أربعة أركان للتميز الإبداعي',
      subtitle: 'من فكرة وبناء العلامة إلى الهيمنة الرقمية والعتاد الذكي المتصل.',
      items: [
        {
          id: 'branding',
          num: '01',
          title: 'الهوية البصرية والعلامة التجارية',
          tagline: 'Branding & Visual Identity',
          desc: 'نصمم هويات بصرية فريدة تعكس شخصية وقيم علامتك التجارية بدقة. من تصميم الشعارات الأيقونية إلى أنظمة الخطوط، سيكولوجية الألوان، وتغليف المنتجات الفاخرة.',
          icon: Palette,
          gradient: 'from-[#844D98] to-[#301739]',
          borderHover: 'hover:border-[#844D98]/40',
        },
        {
          id: 'web',
          num: '02',
          title: 'تطوير وبرمجة المواقع وتطبيقات الويب',
          tagline: 'Website Creation & UX Engineering',
          desc: 'نصمم ونطور مواقع وتطبيقات ويب عصرية ومتجاوبة بالكامل تمنح مستخدميك تجربة سلسة وفائقة السرعة (+99 على Google) عبر أحدث تقنيات Next.js 15.',
          icon: Monitor,
          gradient: 'from-blue-600 to-indigo-700',
          borderHover: 'hover:border-blue-400',
        },
        {
          id: 'media',
          num: '03',
          title: 'التصوير والإنتاج السينمائي',
          tagline: 'Photography & Video Editing',
          desc: 'نلتقط وننتج محتوى مرئياً مبهراً يروي قصة علامتك ويجذب جمهورك المستهدف. تصوير سينمائي إعلاني، مجسمات 3D تفاعلية، ومحتوى فيديو سريع الانتشار.',
          icon: Camera,
          gradient: 'from-fuchsia-600 to-pink-600',
          borderHover: 'hover:border-fuchsia-400',
        },
        {
          id: 'marketing',
          num: '04',
          title: 'إدارة التواصل الاجتماعي والإعلانات',
          tagline: 'Social Media Management & Ads',
          desc: 'ندير حضورك الرقمي ونطلق حملات إعلانية ممولة دقيقة على Meta و Google تحقق نمواً مستداماً وعائداً استثمارياً مرتفعاً (ROAS) لعلامتك.',
          icon: TrendingUp,
          gradient: 'from-emerald-600 to-teal-700',
          borderHover: 'hover:border-emerald-400',
        },
        {
          id: 'nfc',
          num: '05',
          title: 'بطاقات NFC والعتاد المتصل (المنتج الرائد)',
          tagline: 'Smart NFC & Connected Identity',
          desc: 'خط منتجاتنا الرائد: بطاقات أعمال ذكية معدنية ومات محفورة بالليزر بدقة فائقة. لمسة واحدة تنقل ملفك الرقمي بالكامل إلى أي هاتف بدون الحاجة لأي تطبيق.',
          icon: Cpu,
          gradient: 'from-[#844D98] via-[#602773] to-[#301739]',
          borderHover: 'hover:border-[#844D98]',
          isFlagship: true,
        },
      ],
    },
    palette: {
      badge: 'نظام الهوية البصرية',
      title: 'لوحة ألوان Brandxpere الرسمية والخطوط',
      desc: 'التناغم البصري الرسمي لعلامة Brandxpere: فخامة، وضوح، وأناقة عصرية.',
      fontTitle: 'خط Poppins الهندسي الحديث',
      fontSample: 'Aa Bb Cc 0123456789 •$#@&!%?+',
      swatches: [
        { code: '#301739', label: '01 البرقوقي الملكي الداكن', role: 'النصوص العريضة وتباين الفخامة' },
        { code: '#DACBE3', label: '02 اللافندر الفاتح الناعم', role: 'خلفيات البطاقات والحدود الناعمة' },
        { code: '#844D98', label: '03 الجمشت الأرجواني الأصيل', role: 'اللون التميزي الرئيسي للعلامة' },
      ],
    },
    nfcSection: {
      badge: 'منظومة العتاد الذكي المتصل',
      title: 'بطاقات الأعمال الذكية NFC برؤية معاصرة',
      subtitle: 'البديل الحديث والفاخر لبطاقات العمل الورقية القديمة. المس، تواصل، واصنع انطباعاً لا يُنسى.',
      features: [
        { title: 'بدون أي تطبيق', desc: 'تعمل مباشرة على جميع هواتف iPhone و Android بمجرد اللمس أو مسح رمز QR.' },
        { title: 'ملف رقمي سحابي متجدد', desc: 'عدّل بياناتك وأرقامك وروابطك في أي وقت وتتحدث البطاقة فورياً دون إعادة الطباعة.' },
        { title: 'إدارة بطاقات الشركات وفِرق العمل', desc: 'لوحة تحكم مركزية للشركات لإصدار وتعديل ومتابعة بطاقات الموظفين بسهولة.' },
        { title: 'إحصائيات وتحليلات تفاعلية مباشرة', desc: 'تتبع عدد مرات المسح، النقرات، ونسب التحويل من كل تفاعل.' },
      ],
    },
    pricing: {
      badge: 'أسعار واضحة وشفافة',
      title: 'باقات مخصصة للأفراد والشركات',
      subtitle: 'ابدأ مجاناً بملفك الرقمي أو اطلب بطاقتك المعدنية المحفورة بالليزر.',
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

const PLANS = [
  {
    name: 'Free Starter',
    price: '0',
    featuresEn: ['1 Digital Profile', 'QR Code Sync', 'Basic Templates', 'Standard Analytics'],
    featuresAr: ['بروفايل رقمي واحد', 'مزامنة رمز QR', 'قوالب أساسية', 'إحصائيات قياسية'],
    ctaEn: 'Start Free',
    ctaAr: 'ابدأ مجاناً',
  },
  {
    name: 'Pro Card & Cloud',
    price: '9',
    popular: true,
    featuresEn: ['Custom Matte NFC Card', 'Unlimited Profiles', '50+ Luxury Templates', 'Custom Domain Support', 'Advanced Lead Capture', 'Priority Studio Support'],
    featuresAr: ['بطاقة NFC مات فاخرة', 'بروفايلات غير محدودة', 'أكثر من 50 قالباً فخماً', 'ربط الدومين المخصص', 'جمع بيانات العملاء', 'دعم أولوية من الاستوديو'],
    ctaEn: 'Order Pro Card',
    ctaAr: 'اطلب باقة برو',
  },
  {
    name: 'Enterprise Fleet',
    price: '29',
    featuresEn: ['Laser-Engraved Metal NFC Cards', 'Company Team Dashboard', 'Full White-Label Branding', 'CRM & API Integrations', 'Dedicated Account Manager'],
    featuresAr: ['بطاقات معدنية محفورة بالليزر', 'لوحة تحكم لإدارة فريق الشركة', 'هوية بيضاء خاصة بالكامل', 'ربط مع أنظمة CRM و API', 'مدير حسابات مخصص'],
    ctaEn: 'Launch Enterprise',
    ctaAr: 'انطلق كشركة',
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
  const { language, setLanguage, dir } = useTranslation();
  const t = CONTENT[language] || CONTENT.en;
  const isArabic = language === 'ar';

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div 
      className="flex flex-col min-h-screen bg-white text-slate-900 overflow-x-hidden transition-all duration-300"
      dir={dir}
    >

      {/* ═══════════════════════════════════════
          HEADER / NAVBAR (CLEAN WHITE eSoft STYLE)
      ═══════════════════════════════════════ */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-95 transition-opacity group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#844D98] to-[#301739] p-1.5 flex items-center justify-center shadow-md shadow-[#844D98]/20 group-hover:scale-105 transition-transform">
              <img
                src="/brandxpere-icon.png"
                alt="brandxpere emblem"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-black tracking-tight font-sans text-slate-900 leading-none">
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-[#844D98] hover:bg-purple-100 transition-all font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#844D98]" />
              <span>{t.nav.agency}</span>
            </Link>
            <a href="#nfc" className="hover:text-[#844D98] transition-colors">
              {t.nav.nfc}
            </a>
            <Link href="/pricing" className="hover:text-[#844D98] transition-colors">
              {t.nav.pricing}
            </Link>
            <Link href="/contact" className="hover:text-[#844D98] transition-colors">
              {t.nav.contact}
            </Link>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3.5">
            
            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 text-xs font-bold text-slate-700 transition-all shadow-xs"
              title={isArabic ? 'Switch to English' : 'التحويل إلى العربية'}
            >
              <Languages className="w-3.5 h-3.5 text-[#844D98]" />
              <span className={isArabic ? 'text-[#844D98] font-extrabold' : 'text-slate-900 font-bold'}>EN</span>
              <span className="text-slate-300">|</span>
              <span className={isArabic ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'}>عربي</span>
            </button>

            <Link 
              href="/agency#quote"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-xs font-bold text-[#844D98] transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.nav.quote}</span>
            </Link>

            <Link 
              href="/auth/register" 
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#844D98] to-[#602773] text-sm font-bold text-white shadow-lg shadow-[#844D98]/25 hover:shadow-[#844D98]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
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
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-[#844D98] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#844D98] animate-ping" />
                <span>{t.hero.tag}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.12]">
                <span className="text-slate-600 block font-light text-2xl sm:text-3xl mb-1 tracking-normal">
                  {t.hero.headlinePrefix}
                </span>
                <span className="bg-gradient-to-r from-[#301739] via-[#844D98] to-[#602773] bg-clip-text text-transparent block font-black">
                  {t.hero.headlineMain}
                </span>
                <span className="text-xl sm:text-2xl font-semibold text-[#844D98] mt-2 block italic">
                  {t.hero.headlineSub}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                {t.hero.description}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-[#844D98] to-[#602773] text-white font-bold text-base shadow-xl shadow-[#844D98]/30 hover:shadow-[#844D98]/45 hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
                >
                  <Cpu className="w-5 h-5" />
                  <span>{t.hero.createCardBtn}</span>
                  <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
                </Link>
                <Link
                  href="/agency"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-white border-2 border-purple-100 hover:border-[#844D98]/40 text-[#301739] font-bold text-base shadow-sm hover:shadow-md hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
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
                    <span className="text-sm font-extrabold text-slate-900 ml-1">4.9 / 5</span>
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
              <div className="relative z-10 w-[275px] h-[530px] bg-white rounded-[44px] border-[7px] border-slate-900 shadow-2xl shadow-purple-900/15 overflow-hidden animate-float">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-b-2xl z-20" />

                {/* Inside Screen */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7FC] via-white to-[#F6F2F8] overflow-y-auto pt-7 pb-6 px-4 flex flex-col items-center">
                  
                  {/* Cover */}
                  <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-[#844D98] via-[#301739] to-[#602773]" />

                  {/* Avatar */}
                  <div className="relative mt-10 z-10">
                    <div className="w-18 h-18 rounded-full p-1 bg-white shadow-xl">
                      <div className="w-full h-full rounded-full bg-[#301739] flex items-center justify-center p-2">
                        <img src="/brandxpere-icon.png" alt="logo" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold mt-3 text-slate-900 z-10">BRANDXPERE</h3>
                  <p className="text-[10px] text-[#844D98] font-bold uppercase tracking-widest z-10">Creative Studio & Smart NFC</p>
                  <p className="text-[10px] text-slate-500 text-center mt-1.5 max-w-[190px] leading-relaxed z-10">
                    We Build Brands That Build Business.
                  </p>

                  <button className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-[#844D98] to-[#602773] text-white font-bold text-xs shadow-md shadow-[#844D98]/30 hover:scale-[1.02] transition-transform z-10">
                    💾 {isArabic ? 'حفظ جهة الاتصال' : 'Save Contact'}
                  </button>

                  <div className="grid grid-cols-3 gap-2 w-full mt-3.5 z-10">
                    {[
                      { icon: Phone, label: isArabic ? 'اتصال' : 'Call', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { icon: Mail, label: isArabic ? 'بريد' : 'Email', color: 'text-blue-600', bg: 'bg-blue-50' },
                      { icon: Globe, label: isArabic ? 'موقع' : 'Web', color: 'text-purple-600', bg: 'bg-purple-50' },
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

              {/* Floating Stat Badge */}
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-[#844D98]">
              <Sparkles className="w-3.5 h-3.5 text-[#844D98]" />
              <span>{t.about.badge}</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              {t.about.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-5 text-start">
              <p className="text-base sm:text-lg text-slate-900 font-semibold leading-relaxed">
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
              <div className="p-8 rounded-3xl bg-gradient-to-br from-[#FAF7FC] to-[#F3ECF8] border border-purple-100 shadow-xl shadow-purple-500/5 relative overflow-hidden group">
                <div className="text-5xl text-[#844D98] font-serif font-black mb-2 opacity-60">“</div>
                <p className="text-sm sm:text-base text-slate-800 font-bold leading-relaxed italic">
                  {t.about.quoteHighlight}
                </p>
                <div className="mt-6 pt-4 border-t border-purple-200/60 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#844D98] uppercase tracking-wider">Brandxpere Philosophy</span>
                  <div className="w-8 h-8 rounded-lg bg-[#844D98] p-1 flex items-center justify-center">
                    <img src="/brandxpere-icon.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-[#844D98]">
              <Layers className="w-3.5 h-3.5" />
              <span>{t.pillars.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
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
                  className={`card-hover-motion rounded-3xl p-8 flex flex-col justify-between border bg-white shadow-xl shadow-purple-500/5 ${
                    pillar.isFlagship
                      ? 'border-2 border-[#844D98] lg:col-span-2 bg-gradient-to-br from-white via-[#FAF7FC] to-[#F5EEFA]'
                      : 'border-slate-100 hover:border-purple-200'
                  }`}
                >
                  <div className="space-y-4 text-start">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono font-extrabold text-[#844D98] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                        {pillar.num}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
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
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100"
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
          COLOR PALETTE SHOWCASE (CLEAN LIGHT STYLE)
      ═══════════════════════════════════════ */}
      <section className="py-20 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#844D98] font-bold">
              {t.palette.badge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
              {t.palette.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.palette.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
            {t.palette.swatches.map((s, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-slate-100 p-5 bg-[#FAF7FC] shadow-sm flex flex-col justify-between space-y-4"
              >
                <div 
                  className="w-full h-20 rounded-xl shadow-md flex items-center justify-center font-mono font-bold text-sm"
                  style={{ backgroundColor: s.code, color: s.code === '#DACBE3' ? '#301739' : '#FFFFFF' }}
                >
                  {s.code}
                </div>
                <div className="text-start">
                  <div className="text-sm font-bold text-slate-900">{s.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.role}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-purple-50/70 border border-purple-100 text-center space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#844D98]">
              {t.palette.fontTitle}
            </span>
            <div className="text-xl sm:text-2xl font-bold font-sans tracking-wide text-slate-900">
              {t.palette.fontSample}
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SMART NFC SECTION
      ═══════════════════════════════════════ */}
      <section id="nfc" className="py-24 relative bg-[#FAF7FC] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-[#844D98]">
              <Cpu className="w-3.5 h-3.5" />
              <span>{t.nfcSection.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
              {t.nfcSection.title}
            </h2>
            <p className="text-base text-slate-600">
              {t.nfcSection.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.nfcSection.features.map((f, i) => (
              <div key={i} className="card-hover-motion p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3 text-start">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#844D98] border border-purple-100 flex items-center justify-center font-bold text-sm">
                  0{i + 1}
                </div>
                <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#844D98] to-[#602773] text-white font-bold text-base shadow-xl shadow-[#844D98]/25 hover:-translate-y-1 transition-all"
            >
              <Cpu className="w-5 h-5" />
              <span>{t.hero.createCardBtn}</span>
              <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
            </Link>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRICING (CLEAN eSoft STYLE)
      ═══════════════════════════════════════ */}
      <section id="pricing" className="py-24 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-[#844D98]">
              <Sparkles className="w-3.5 h-3.5 text-[#844D98]" />
              <span>{t.pricing.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
              {t.pricing.title}
            </h2>
            <p className="text-base text-slate-500">
              {t.pricing.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan, idx) => (
              <div
                key={idx}
                className={`card-hover-motion rounded-3xl p-8 flex flex-col justify-between border relative transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-b from-purple-50/50 via-white to-white border-2 border-[#844D98] shadow-2xl shadow-purple-500/15 scale-[1.03]'
                    : 'bg-white border-slate-200/80 shadow-md shadow-slate-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#844D98] text-white text-xs font-extrabold shadow-md">
                    {isArabic ? 'الأكثر طلباً' : 'Most Popular'}
                  </div>
                )}

                <div className="space-y-4 text-start">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg text-slate-400 font-bold">$</span>
                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-xs text-slate-500">/mo</span>
                  </div>

                  <ul className="space-y-3 pt-4 border-t border-slate-100">
                    {(isArabic ? plan.featuresAr : plan.featuresEn).map((f, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <Link
                    href="/auth/register"
                    className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center transition-all ${
                      plan.popular
                        ? 'bg-[#844D98] hover:bg-[#602773] text-white shadow-lg shadow-purple-500/25'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {isArabic ? plan.ctaAr : plan.ctaEn}
                  </Link>
                </div>
              </div>
            ))}
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
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base shadow-2xl shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all"
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
                <img src="/brandxpere-icon.png" alt="logo" className="w-9 h-9 object-contain" />
                <span className="text-2xl font-black tracking-tight font-sans text-slate-900 leading-none">
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
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-4">
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
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-4">
                {t.footer.nfcTitle}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                <li><Link href="/pricing" className="hover:text-[#844D98] transition-colors">{t.nav.pricing}</Link></li>
                <li><Link href="/auth/register" className="hover:text-[#844D98] transition-colors">{t.nav.startFree}</Link></li>
                <li><Link href="/dashboard" className="hover:text-[#844D98] transition-colors">{isArabic ? 'لوحة التحكم' : 'Client Dashboard'}</Link></li>
                <li><Link href="/contact" className="hover:text-[#844D98] transition-colors">{isArabic ? 'طلبات الشركات' : 'Corporate Fleet'}</Link></li>
              </ul>
            </div>

            {/* Column 3: Quick Hotline */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 text-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 block">
                {isArabic ? 'استشارة فورية' : 'Studio Hotline'}
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isArabic 
                  ? 'تحدث مباشرة مع فريق الاستوديو في مراكش لمناقشة هويتك أو مشروعك.'
                  : 'Connect directly with our Marrakech studio team on WhatsApp.'
                }
              </p>
              <a
                href="https://wa.me/212778481250?text=Hello%20Brandxpere%20Studio"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp +212 778-481250</span>
              </a>
            </div>

          </div>

          <div className="border-t border-slate-200/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">{t.footer.rights}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
              <Link href="/contact" className="hover:text-slate-800">{t.nav.contact}</Link>
              <Link href="/help" className="hover:text-slate-800">{isArabic ? 'مركز المساعدة' : 'Help & FAQ'}</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Quick-Action */}
      <aside aria-label="WhatsApp Support" className={`fixed bottom-6 ${isArabic ? 'left-6' : 'right-6'} z-50`}>
        <a
          href="https://wa.me/212778481250?text=Hello%20Brandxpere%20Studio"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all font-bold text-xs"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200" />
          </span>
          <MessageCircle className="w-5 h-5" />
          <span>WhatsApp +212 778-481250</span>
        </a>
      </aside>

    </div>
  );
}
