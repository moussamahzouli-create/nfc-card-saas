'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { 
  Zap, Shield, Smartphone, Layers, ChevronRight, Activity, 
  Mail, Globe, Phone, Star, QrCode, Wifi, Users, 
  BarChart3, Palette, Check, ArrowRight, Play, MapPin, 
  Sparkles, Award, TrendingUp, MessageCircle, Monitor, 
  Cpu, Video, Send, CheckCircle2, Camera, Share2,
  Languages
} from 'lucide-react';
import { InstagramIcon } from '@/components/BrandLogo';
import { useTranslation } from '@/lib/i18n';

// ═══════════════════════════════════════════════════════════
// BILINGUAL CONTENT MATRIX — DIRECTLY FROM BRANDXPERE IDENTITY
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
      description: 'Brandxpere is a modern creative studio dedicated to helping brands build a strong, distinctive, and meaningful presence in today’s fast-moving digital world. We unite high-end visual identity, bespoke web development, cinematic media, and smart NFC connected cards.',
      createCardBtn: 'Create Free NFC Card',
      exploreStudioBtn: 'Explore Creative Studio',
      whatsAppBtn: 'WhatsApp Consultation',
      trustedBy: 'Trusted by 50,000+ professionals & brands worldwide',
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
      subtitle: 'From brand conception to digital dominance and connected hardware.',
      items: [
        {
          id: 'branding',
          num: '01',
          title: 'Branding & Identity',
          tagline: 'Visual Identity & System Design',
          desc: 'We craft unique visual identities that reflect your brand’s personality and values. From bespoke logo systems to typography, color psychology, and luxury packaging.',
          icon: Palette,
          color: 'from-[#844D98] to-[#DACBE3]',
          accent: 'text-[#DACBE3]',
        },
        {
          id: 'web',
          num: '02',
          title: 'Website Creation',
          tagline: 'UX Engineering & Web Platforms',
          desc: 'We design and develop modern, responsive websites that provide seamless user experiences. Built with Next.js 15, lightning-fast loading speeds, and conversion-optimized architectures.',
          icon: Monitor,
          color: 'from-blue-500 to-indigo-400',
          accent: 'text-blue-300',
        },
        {
          id: 'media',
          num: '03',
          title: 'Photography & Video Editing',
          tagline: 'Cinematic Media & 3D Motion',
          desc: 'We capture and edit stunning visual content that tells your story and engages your audience. Commercial video shoots, 3D photorealistic product renders, and high-retention social content.',
          icon: Camera,
          color: 'from-fuchsia-500 to-rose-400',
          accent: 'text-fuchsia-300',
        },
        {
          id: 'marketing',
          num: '04',
          title: 'Social Media & Ads',
          tagline: 'Growth Marketing & High ROAS',
          desc: 'We manage your social presence and run targeted ad campaigns that grow your brand online. Data-driven Meta & Google ad funnels with proven conversion optimization.',
          icon: TrendingUp,
          color: 'from-emerald-500 to-teal-400',
          accent: 'text-emerald-300',
        },
        {
          id: 'nfc',
          num: '05',
          title: 'Smart NFC & Connected Hardware',
          tagline: 'Physical Luxury Meets Digital Speed',
          desc: 'Our signature hardware product line: laser-engraved metal and matte smart NFC business cards. One tap transmits your full digital profile directly to any smartphone with zero apps.',
          icon: Cpu,
          color: 'from-[#DACBE3] via-[#844D98] to-[#301739]',
          accent: 'text-[#DACBE3]',
          isFlagship: true,
        },
      ],
    },
    palette: {
      badge: 'Brand Identity System',
      title: 'Our Signature Color Palette & Typography',
      desc: 'The official Brandxpere aesthetic harmony: luxury, innovation, and timeless sophistication.',
      fontTitle: 'Poppins Font (Geometric Sans)',
      fontSample: 'Aa Bb Cc 0123456789 •$#@&!%?+',
      swatches: [
        { code: '#301739', label: '01 Deep Royal Plum', role: 'Base Background & Luxury Foundation' },
        { code: '#DACBE3', label: '02 Soft Lavender', role: 'Accent Highlights & Text Contrast' },
        { code: '#844D98', label: '03 Brand Amethyst', role: 'Primary Signature Brand Accent' },
      ],
    },
    nfcSection: {
      badge: 'Connected Hardware Ecosystem',
      title: 'Smart NFC Business Cards Reimagined',
      subtitle: 'The modern replacement for paper business cards. Tap, connect, and impress instantly.',
      features: [
        { title: 'No App Required', desc: 'Works natively on every modern iPhone and Android with built-in NFC and camera QR.' },
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
      createCardBtn: 'أنشئ بطاقتك الذكية مجاناً',
      exploreStudioBtn: 'استكشف خدمات الاستوديو',
      whatsAppBtn: 'استشارة فورية عبر واتساب',
      trustedBy: 'موثوق به من أكثر من 50,000 مهني وشركة حول العالم',
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
          color: 'from-[#844D98] to-[#DACBE3]',
          accent: 'text-[#DACBE3]',
        },
        {
          id: 'web',
          num: '02',
          title: 'تطوير وبرمجة المواقع',
          tagline: 'Website Creation & UX Engineering',
          desc: 'نصمم ونطور مواقع وتطبيقات ويب عصرية ومتجاوبة بالكامل تمنح مستخدميك تجربة سلسة وفائقة السرعة (+99 على Google) عبر أحدث تقنيات Next.js 15.',
          icon: Monitor,
          color: 'from-blue-500 to-indigo-400',
          accent: 'text-blue-300',
        },
        {
          id: 'media',
          num: '03',
          title: 'التصوير والإنتاج السينمائي',
          tagline: 'Photography & Video Editing',
          desc: 'نلتقط وننتج محتوى مرئياً مبهراً يروي قصة علامتك ويجذب جمهورك المستهدف. تصوير سينمائي إعلاني، مجسمات 3D تفاعلية، ومحتوى فيديو سريع الانتشار.',
          icon: Camera,
          color: 'from-fuchsia-500 to-rose-400',
          accent: 'text-fuchsia-300',
        },
        {
          id: 'marketing',
          num: '04',
          title: 'إدارة التواصل الاجتماعي والإعلانات',
          tagline: 'Social Media Management & Ads',
          desc: 'ندير حضورك الرقمي ونطلق حملات إعلانية ممولة دقيقة على Meta و Google تحقق نمواً مستداماً وعائداً استثمارياً مرتفعاً (ROAS) لعلامتك.',
          icon: TrendingUp,
          color: 'from-emerald-500 to-teal-400',
          accent: 'text-emerald-300',
        },
        {
          id: 'nfc',
          num: '05',
          title: 'بطاقات NFC والعتاد المتصل (المنتج الرائد)',
          tagline: 'Smart NFC & Connected Identity',
          desc: 'خط منتجاتنا الرائد: بطاقات أعمال ذكية معدنية ومات محفورة بالليزر بدقة فائقة. لمسة واحدة تنقل ملفك الرقمي بالكامل إلى أي هاتف بدون الحاجة لأي تطبيق.',
          icon: Cpu,
          color: 'from-[#DACBE3] via-[#844D98] to-[#301739]',
          accent: 'text-[#DACBE3]',
          isFlagship: true,
        },
      ],
    },
    palette: {
      badge: 'نظام الهوية البصرية',
      title: 'لوحة ألوان Brandxpere الرسمية والخطوط',
      desc: 'التناغم البصري الرسمي لعلامة Brandxpere: فخامة، ابتكار، وأناقة عابرة للزمن.',
      fontTitle: 'خط Poppins الهندسي الحديث',
      fontSample: 'Aa Bb Cc 0123456789 •$#@&!%?+',
      swatches: [
        { code: '#301739', label: '01 البرقوقي الملكي الداكن', role: 'الخلفية الأساسية وقاعدة الفخامة' },
        { code: '#DACBE3', label: '02 اللافندر الفاتح الناعم', role: 'الإضاءات والتباين النصي الأنيق' },
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
      className="flex flex-col min-h-screen bg-[#1B0C21] text-white overflow-x-hidden transition-all duration-300"
      dir={dir}
    >

      {/* ═══════════════════════════════════════
          HEADER / NAVBAR (BILINGUAL)
      ═══════════════════════════════════════ */}
      <header className="fixed top-0 w-full z-50 bg-[#1B0C21]/80 backdrop-blur-xl border-b border-[#DACBE3]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo with Brand Emblem */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-95 transition-opacity group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#844D98] to-[#301739] p-1.5 flex items-center justify-center border border-[#DACBE3]/20 shadow-lg shadow-[#844D98]/20 group-hover:scale-105 transition-transform">
              <img
                src="/brandxpere-icon.png"
                alt="brandxpere emblem"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-black tracking-tight font-sans text-white leading-none">
              <span>brand</span>
              <span className="text-[#844D98] font-black">x</span>
              <span>pere</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#DACBE3]/80">
            <a href="#about" className="hover:text-white hover:text-[#DACBE3] transition-colors">
              {t.nav.about}
            </a>
            <a href="#pillars" className="hover:text-white hover:text-[#DACBE3] transition-colors">
              {t.nav.pillars}
            </a>
            <Link 
              href="/agency" 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#844D98]/20 border border-[#844D98]/40 text-[#DACBE3] hover:text-white hover:bg-[#844D98]/30 transition-all font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#DACBE3]" />
              <span>{t.nav.agency}</span>
            </Link>
            <a href="#nfc" className="hover:text-white hover:text-[#DACBE3] transition-colors">
              {t.nav.nfc}
            </a>
            <Link href="/pricing" className="hover:text-white hover:text-[#DACBE3] transition-colors">
              {t.nav.pricing}
            </Link>
            <Link href="/contact" className="hover:text-white hover:text-[#DACBE3] transition-colors">
              {t.nav.contact}
            </Link>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            
            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DACBE3]/20 bg-[#301739]/60 hover:bg-[#844D98]/20 text-xs font-bold text-[#DACBE3] transition-all"
              title={isArabic ? 'Switch to English' : 'التحويل إلى العربية'}
            >
              <Languages className="w-3.5 h-3.5 text-[#DACBE3]" />
              <span className={isArabic ? 'text-[#844D98] font-extrabold' : 'text-white'}>EN</span>
              <span className="text-[#DACBE3]/40">|</span>
              <span className={isArabic ? 'text-white' : 'text-[#DACBE3]/70 font-semibold'}>عربي</span>
            </button>

            <Link 
              href="/agency#quote"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DACBE3]/15 hover:border-[#DACBE3]/30 bg-white/5 hover:bg-white/10 text-xs font-bold text-[#DACBE3] transition-all"
            >
              <Send className="w-3.5 h-3.5 text-[#DACBE3]" />
              <span>{t.nav.quote}</span>
            </Link>

            <Link 
              href="/auth/register" 
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#844D98] to-[#602773] text-sm font-bold text-white shadow-lg shadow-[#844D98]/30 hover:shadow-[#844D98]/50 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span>{t.nav.startFree}</span>
              <ChevronRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════
          HERO SECTION (BRAND IDENTITY STYLE)
      ═══════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-gradient-to-b from-[#1B0C21] via-[#26102F] to-[#1B0C21]">
        {/* Ambient Brand Glowing Orbs (#301739 & #844D98) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#844D98]/20 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-[420px] h-[420px] bg-[#301739]/60 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/3 w-[360px] h-[360px] bg-[#DACBE3]/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-7 animate-slide-up text-start">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#301739] border border-[#DACBE3]/25 text-xs font-bold text-[#DACBE3] shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-[#844D98] animate-pulse" />
                <span>{t.hero.tag}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.12]">
                <span className="text-[#DACBE3] block font-light text-2xl sm:text-3xl mb-2 tracking-normal">
                  {t.hero.headlinePrefix}
                </span>
                <span className="bg-gradient-to-r from-white via-[#DACBE3] to-[#844D98] bg-clip-text text-transparent block">
                  {t.hero.headlineMain}
                </span>
                <span className="text-xl sm:text-2xl font-medium text-[#DACBE3]/90 mt-2 block italic">
                  {t.hero.headlineSub}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#DACBE3]/80 max-w-xl leading-relaxed">
                {t.hero.description}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-[#844D98] via-[#6F2E82] to-[#301739] border border-[#DACBE3]/30 text-white font-bold text-base shadow-2xl shadow-[#844D98]/40 hover:shadow-[#844D98]/60 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
                >
                  <Cpu className="w-5 h-5 text-[#DACBE3]" />
                  <span>{t.hero.createCardBtn}</span>
                </Link>
                <Link
                  href="/agency"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-[#301739]/80 border border-[#DACBE3]/20 hover:border-[#DACBE3]/50 text-[#DACBE3] font-bold text-base hover:bg-[#301739] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4 text-[#844D98]" />
                  <span>{t.hero.exploreStudioBtn}</span>
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-[#DACBE3]/10">
                <div className="flex -space-x-2">
                  {['B','X','P','E','R'].map((l,i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1B0C21] bg-gradient-to-tr from-[#844D98] to-[#301739] flex items-center justify-center text-[10px] font-bold text-white shadow">
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                    <span className="text-sm font-bold text-white ml-1">4.9/5</span>
                  </div>
                  <p className="text-xs text-[#DACBE3]/70">{t.hero.trustedBy}</p>
                </div>
              </div>

            </div>

            {/* Hero Visual — Luxury Phone & Metal Card Mockup */}
            <div className="lg:col-span-5 relative flex justify-center items-center h-[560px] animate-fade-in delay-300">
              
              <div className="absolute w-[380px] h-[380px] rounded-full border border-[#844D98]/20 animate-spin-slow" />
              <div className="absolute w-[300px] h-[300px] rounded-full border border-[#DACBE3]/15 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '12s' }} />

              {/* iPhone Frame with Brandxpere Profile */}
              <div className="relative z-10 w-[270px] h-[520px] bg-[#120716] rounded-[42px] border-[5px] border-[#301739] shadow-2xl shadow-[#844D98]/30 overflow-hidden animate-float">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#301739] rounded-b-2xl z-20" />

                {/* Inside Screen */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#301739] via-[#1B0C21] to-[#120716] overflow-y-auto pt-7 pb-6 px-4 flex flex-col items-center">
                  
                  {/* Cover */}
                  <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-[#844D98] via-[#301739] to-[#602773] opacity-80" />

                  {/* Avatar with Glow Ring */}
                  <div className="relative mt-10 z-10">
                    <div className="w-18 h-18 rounded-full p-1 bg-gradient-to-tr from-[#DACBE3] via-[#844D98] to-[#301739] shadow-xl">
                      <div className="w-full h-full rounded-full bg-[#1B0C21] flex items-center justify-center p-2">
                        <img src="/brandxpere-icon.png" alt="logo" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold mt-3 text-white z-10">BRANDXPERE</h3>
                  <p className="text-[10px] text-[#DACBE3] font-bold uppercase tracking-widest z-10">Creative Studio & Smart NFC</p>
                  <p className="text-[10px] text-slate-300 text-center mt-1.5 max-w-[190px] leading-relaxed z-10">
                    We Build Brands That Build Business.
                  </p>

                  <button className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-[#844D98] to-[#602773] text-white font-bold text-xs shadow-md shadow-[#844D98]/40 hover:scale-[1.02] transition-transform z-10">
                    💾 {isArabic ? 'حفظ جهة الاتصال' : 'Save Contact'}
                  </button>

                  <div className="grid grid-cols-3 gap-2 w-full mt-3.5 z-10">
                    {[
                      { icon: Phone, label: isArabic ? 'اتصال' : 'Call', color: 'text-emerald-400' },
                      { icon: Mail, label: isArabic ? 'بريد' : 'Email', color: 'text-blue-300' },
                      { icon: Globe, label: isArabic ? 'موقع' : 'Web', color: 'text-[#DACBE3]' },
                    ].map(({ icon: Icon, label, color }) => (
                      <div key={label} className="flex flex-col items-center gap-1 p-2 bg-[#301739]/50 border border-[#DACBE3]/10 rounded-xl hover:scale-105 transition-transform cursor-pointer">
                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                        <span className="text-[9px] text-[#DACBE3] font-semibold">{label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="w-full mt-3 space-y-1.5 z-10">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-300 flex items-center gap-2">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span className="font-mono">+212 778-481250</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-300 flex items-center gap-2">
                      <Mail className="w-3 h-3 text-blue-300" />
                      <span className="font-mono truncate">BRANDXPER@GMAIL.COM</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-300 flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-rose-300" />
                      <span>Marrakech, Morocco</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Floating Laser Engraved Card */}
              <div className="absolute bottom-6 right-0 w-60 h-36 z-20 animate-card-float delay-1000">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#301739] via-[#220d2a] to-[#120716] border border-[#DACBE3]/30 p-4 flex flex-col justify-between shadow-2xl shadow-[#844D98]/50">
                  <div className="flex justify-between items-center">
                    <img src="/brandxpere-icon.png" alt="icon" className="w-5 h-5 object-contain" />
                    <span className="text-[9px] font-bold text-[#DACBE3] uppercase tracking-widest">SMART NFC CARD</span>
                    <Wifi className="w-4 h-4 text-[#844D98]" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">brandxpere</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[9px] text-[#DACBE3]/70">Creative Studio</span>
                      <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Active NFC</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ABOUT US SECTION (FROM BRAND PDF)
      ═══════════════════════════════════════ */}
      <section id="about" className="py-24 relative border-t border-[#DACBE3]/10 bg-[#16081B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#844D98]/20 border border-[#844D98]/40 text-xs font-bold text-[#DACBE3]">
              <Sparkles className="w-3.5 h-3.5 text-[#DACBE3]" />
              <span>{t.about.badge}</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {t.about.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-5 text-start">
              <p className="text-base sm:text-lg text-white font-medium leading-relaxed">
                {t.about.p1}
              </p>
              <p className="text-sm sm:text-base text-[#DACBE3]/85 leading-relaxed">
                {t.about.p2}
              </p>
              <p className="text-sm sm:text-base text-[#DACBE3]/85 leading-relaxed">
                {t.about.p3}
              </p>
              <p className="text-sm sm:text-base text-[#DACBE3]/85 leading-relaxed">
                {t.about.p4}
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="p-8 rounded-3xl bg-gradient-to-br from-[#301739] to-[#1F0E25] border border-[#DACBE3]/20 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#844D98]/20 rounded-full blur-2xl pointer-events-none" />
                <div className="text-4xl text-[#844D98] font-serif font-black mb-3">“</div>
                <p className="text-sm sm:text-base text-white font-semibold leading-relaxed italic">
                  {t.about.quoteHighlight}
                </p>
                <div className="mt-6 pt-4 border-t border-[#DACBE3]/15 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#DACBE3] uppercase tracking-wider">Brandxpere Philosophy</span>
                  <img src="/brandxpere-icon.png" alt="logo" className="w-6 h-6 object-contain" />
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          CORE PILLARS (THE 4 + 1 FROM BRAND GUIDE)
      ═══════════════════════════════════════ */}
      <section id="pillars" className="py-24 relative border-t border-[#DACBE3]/10 bg-gradient-to-b from-[#16081B] via-[#220D2B] to-[#16081B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#844D98]/20 border border-[#844D98]/40 text-xs font-bold text-[#DACBE3]">
              <Layers className="w-3.5 h-3.5 text-[#DACBE3]" />
              <span>{t.pillars.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              {t.pillars.title}
            </h2>
            <p className="text-[#DACBE3]/80 text-base">
              {t.pillars.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.pillars.items.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.id}
                  className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group ${
                    pillar.isFlagship
                      ? 'bg-gradient-to-br from-[#301739] via-[#844D98]/30 to-[#1B0C21] border-2 border-[#DACBE3]/40 shadow-2xl lg:col-span-2'
                      : 'bg-[#301739]/60 hover:bg-[#301739]/90 border border-[#DACBE3]/15 hover:border-[#DACBE3]/30 shadow-xl'
                  }`}
                >
                  <div className="space-y-4 text-start">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#844D98] to-[#301739] border border-[#DACBE3]/20 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6 text-[#DACBE3]" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#DACBE3]/70">
                        {pillar.num}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-[#DACBE3] transition-colors">
                        {pillar.title}
                      </h3>
                      <p className={`text-xs font-semibold mt-1 ${pillar.accent}`}>
                        {pillar.tagline}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                    <Link
                      href="/agency"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#DACBE3] hover:text-white transition-colors"
                    >
                      <span>{isArabic ? 'تفاصيل الخدمة' : 'Explore Deliverables'}</span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} />
                    </Link>

                    <a
                      href={`https://wa.me/212778481250?text=Hello%20Brandxpere%2C%20I%20am%20interested%20in%20${encodeURIComponent(pillar.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{isArabic ? 'استفسار واتساب' : 'Inquire'}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          COLOR PALETTE & TYPOGRAPHY SHOWCASE
      ═══════════════════════════════════════ */}
      <section className="py-20 relative border-t border-[#DACBE3]/10 bg-[#1B0C21]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-[#DACBE3] block">
              {t.palette.badge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              {t.palette.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {t.palette.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {t.palette.swatches.map((s, idx) => (
              <div 
                key={idx}
                className="rounded-2xl border border-[#DACBE3]/20 p-5 bg-[#301739]/40 flex flex-col justify-between space-y-4"
              >
                <div 
                  className="w-full h-24 rounded-xl border border-white/10 shadow-inner flex items-center justify-center font-mono font-bold text-sm"
                  style={{ backgroundColor: s.code, color: s.code === '#DACBE3' ? '#301739' : '#FFFFFF' }}
                >
                  {s.code}
                </div>
                <div className="text-start">
                  <div className="text-sm font-bold text-white">{s.label}</div>
                  <div className="text-xs text-[#DACBE3]/70 mt-0.5">{s.role}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-[#301739]/30 border border-[#DACBE3]/15 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#DACBE3]">
              {t.palette.fontTitle}
            </span>
            <div className="text-xl sm:text-2xl font-bold font-sans tracking-wide text-white">
              {t.palette.fontSample}
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          SMART NFC SECTION
      ═══════════════════════════════════════ */}
      <section id="nfc" className="py-24 relative border-t border-[#DACBE3]/10 bg-gradient-to-b from-[#1B0C21] via-[#281132] to-[#1B0C21]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#844D98]/20 border border-[#844D98]/40 text-xs font-bold text-[#DACBE3]">
              <Cpu className="w-3.5 h-3.5 text-[#DACBE3]" />
              <span>{t.nfcSection.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              {t.nfcSection.title}
            </h2>
            <p className="text-base text-[#DACBE3]/80">
              {t.nfcSection.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.nfcSection.features.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#301739]/50 border border-[#DACBE3]/15 space-y-3 text-start hover:border-[#844D98]/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#844D98]/30 text-[#DACBE3] flex items-center justify-center font-bold text-sm">
                  0{i + 1}
                </div>
                <h3 className="text-base font-bold text-white">{f.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#844D98] via-[#602773] to-[#301739] border border-[#DACBE3]/30 text-white font-bold text-base shadow-xl shadow-[#844D98]/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Cpu className="w-5 h-5 text-[#DACBE3]" />
              <span>{t.hero.createCardBtn}</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRICING
      ═══════════════════════════════════════ */}
      <section id="pricing" className="py-24 relative border-t border-[#DACBE3]/10 bg-[#16081B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#844D98]/20 border border-[#844D98]/40 text-xs font-bold text-[#DACBE3]">
              <Sparkles className="w-3.5 h-3.5 text-[#DACBE3]" />
              <span>{t.pricing.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              {t.pricing.title}
            </h2>
            <p className="text-base text-slate-400">
              {t.pricing.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-3xl p-8 flex flex-col justify-between border relative transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-b from-[#301739] to-[#1F0E25] border-[#DACBE3]/40 shadow-2xl shadow-[#844D98]/30 scale-[1.03]'
                    : 'bg-[#301739]/40 border-[#DACBE3]/15'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#844D98] text-white text-xs font-bold shadow-md">
                    {isArabic ? 'الأكثر طلباً' : 'Most Popular'}
                  </div>
                )}

                <div className="space-y-4 text-start">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg text-[#DACBE3]">$</span>
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400">/mo</span>
                  </div>

                  <ul className="space-y-3 pt-4 border-t border-[#DACBE3]/10">
                    {(isArabic ? plan.featuresAr : plan.featuresEn).map((f, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
                        ? 'bg-[#844D98] hover:bg-[#602773] text-white shadow-lg'
                        : 'bg-white/10 hover:bg-white/20 text-white'
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
          QUOTE & DIRECT WHATSAPP ACTION
      ═══════════════════════════════════════ */}
      <section className="py-20 relative border-t border-[#DACBE3]/10 bg-gradient-to-r from-[#301739] via-[#844D98]/40 to-[#301739]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#DACBE3]">
            {t.quote.badge}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            {t.quote.title}
          </h2>
          <p className="text-base text-slate-200 max-w-xl mx-auto">
            {t.quote.subtitle}
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/212778481250?text=Hello%20Brandxpere%20Studio%2C%20I%20would%20like%20to%20discuss%20a%20project"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all"
            >
              <MessageCircle className="w-5 h-5 text-white" />
              <span>{t.quote.btn}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER (BILINGUAL)
      ═══════════════════════════════════════ */}
      <footer className="border-t border-[#DACBE3]/10 bg-[#120716] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            
            {/* Brand Identity Column */}
            <div className="lg:col-span-2 space-y-4 text-start">
              <Link href="/" className="flex items-center gap-2.5">
                <img src="/brandxpere-icon.png" alt="logo" className="w-9 h-9 object-contain" />
                <span className="text-2xl font-black tracking-tight font-sans text-white leading-none">
                  <span>brand</span>
                  <span className="text-[#844D98] font-black">x</span>
                  <span>pere</span>
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
                {t.footer.desc}
              </p>
              
              <div className="space-y-2 pt-2 text-xs text-slate-300">
                <a 
                  href="https://wa.me/212778481250" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-emerald-400 hover:underline"
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{t.footer.hotline}</span>
                </a>
                <a 
                  href="mailto:BRANDXPER@GMAIL.COM" 
                  className="flex items-center gap-2 text-blue-300 hover:underline"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>{t.footer.email}</span>
                </a>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-amber-400" />
                  <span>{t.footer.location}</span>
                </div>
              </div>
            </div>

            {/* Column 1: Creative Pillars */}
            <div className="text-start">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
                {t.footer.servicesTitle}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><a href="#pillars" className="hover:text-white transition-colors">Branding & Identity</a></li>
                <li><a href="#pillars" className="hover:text-white transition-colors">Website Creation</a></li>
                <li><a href="#pillars" className="hover:text-white transition-colors">Photography & Video</a></li>
                <li><a href="#pillars" className="hover:text-white transition-colors">Social Media & Ads</a></li>
                <li><Link href="/agency#quote" className="text-[#DACBE3] hover:underline">Get a Proposal →</Link></li>
              </ul>
            </div>

            {/* Column 2: NFC Ecosystem */}
            <div className="text-start">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
                {t.footer.nfcTitle}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><Link href="/pricing" className="hover:text-white transition-colors">{t.nav.pricing}</Link></li>
                <li><Link href="/auth/register" className="hover:text-white transition-colors">{t.nav.startFree}</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">{isArabic ? 'لوحة التحكم' : 'Client Dashboard'}</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">{isArabic ? 'طلبات الشركات' : 'Corporate Fleet'}</Link></li>
              </ul>
            </div>

            {/* Column 3: Quick Hotline */}
            <div className="p-4 rounded-2xl bg-[#301739]/60 border border-[#DACBE3]/15 space-y-3 text-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                {isArabic ? 'استشارة فورية' : 'Studio Hotline'}
              </span>
              <p className="text-xs text-slate-300">
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

          <div className="border-t border-[#DACBE3]/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">{t.footer.rights}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <Link href="/contact" className="hover:text-slate-300">{t.nav.contact}</Link>
              <Link href="/help" className="hover:text-slate-300">{isArabic ? 'مركز المساعدة' : 'Help & FAQ'}</Link>
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
          className="group flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all font-bold text-xs"
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
