import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { 
  Smartphone, Mail, Globe, MapPin, Calendar, Clock, Download, Share2, AlertTriangle, Lock, Eye, EyeOff,
  Phone, MessageSquare, Video, Star, Send, User, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import ReviewsWidget from './ReviewsWidget';

function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
}

function getComponentIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'phone': return Phone;
    case 'whatsapp': return MessageSquare;
    case 'email': return Mail;
    case 'website': return Globe;
    case 'facebook': return Globe;
    case 'instagram': return Globe;
    case 'linkedin': return Globe;
    case 'x': return Globe;
    case 'tiktok': return Video;
    case 'youtube': return Video;
    case 'snapchat': return User;
    case 'telegram': return Send;
    case 'googlemap': return MapPin;
    case 'googlereview': return Star;
    default: return Smartphone;
  }
}

const SOCIALS = [
  { id: 'linkedin',      label: 'LinkedIn',         color: '#0A66C2', letter: 'in' },
  { id: 'instagram',     label: 'Instagram',        color: '#E1306C', letter: 'ig' },
  { id: 'facebook',      label: 'Facebook',         color: '#1877F2', letter: 'fb' },
  { id: 'twitter',       label: 'Twitter / X',      color: '#14171A', letter: 'X' },
  { id: 'youtube',       label: 'YouTube',          color: '#FF0000', letter: 'YT' },
  { id: 'tiktok',        label: 'TikTok',           color: '#010101', letter: 'TT' },
  { id: 'whatsapp',      label: 'WhatsApp',         color: '#25D366', letter: 'WA' },
  { id: 'telegram',      label: 'Telegram',         color: '#2AABEE', letter: 'TG' },
  { id: 'github',        label: 'GitHub',           color: '#333333', letter: 'GH' },
  { id: 'snapchat',      label: 'Snapchat',         color: '#FFFC00', letter: 'SC' },
  { id: 'tripadvisor',   label: 'TripAdvisor',      color: '#34E0A1', letter: 'TA' },
  { id: 'googlemap',     label: 'Google Map',       color: '#EA4335', letter: 'GM' },
  { id: 'googlereviews', label: 'Google Reviews',   color: '#4285F4', letter: 'GR' },
  { id: 'booking',       label: 'Booking.com',      color: '#003580', letter: 'BK' },
  { id: 'behance',       label: 'Behance',          color: '#1769FF', letter: 'BE' },
];

function getSocialSvgIcon(platform: string) {
  const p = platform.toLowerCase();
  switch (p) {
    case 'facebook':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
        </svg>
      );
    case 'linkedin':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zm15.11 13.02h-3.56v-5.6c0-1.34-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.7h-3.56V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/>
        </svg>
      );
    case 'x':
    case 'twitter':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'whatsapp':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.62.962 3.21 1.493 4.887 1.495 5.234 0 9.488-4.251 9.49-9.489.002-2.54-1.009-4.928-2.846-6.764C16.284 2.56 13.916 1.5 11.45 1.5 6.213 1.5 1.959 5.751 1.957 10.99c-.001 1.777.472 3.4 1.373 4.908L2.348 20.89l5.3-1.391z"/>
        </svg>
      );
    case 'telegram':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M11.944 0C5.346 0 0 5.346 0 11.944c0 6.598 5.346 11.944 11.944 11.944 6.598 0 11.944-5.346 11.944-11.944C23.888 5.346 18.542 0 11.944 0zm5.82 8.163c-.15 1.574-.8 5.414-1.13 7.183-.14.75-.415 1-.682 1.024-.582.054-1.023-.385-1.586-.754-.882-.577-1.38-1.365-2.237-1.93-.99-.652-.35-1.01.216-1.597.148-.153 2.722-2.495 2.772-2.707.006-.027.012-.127-.048-.18-.06-.054-.148-.035-.212-.02-.09.02-1.536.974-4.336 2.864-.41.282-.782.42-1.116.412-.367-.008-1.072-.208-1.596-.378-.642-.21-1.153-.32-1.108-.677.023-.186.28-.378.77-.577 3.012-1.31 5.02-2.176 6.023-2.597 2.857-1.2 3.45-1.408 3.836-1.415.085-.002.274.019.397.12.103.085.132.2.14.286.012.105.008.324-.007.494z"/>
        </svg>
      );
    case 'tripadvisor':
      return (
        <svg className="w-5 h-5 fill-current animate-pulse" viewBox="0 0 24 24">
          <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 18.6a6.6 6.6 0 110-13.2 6.6 6.6 0 010 13.2zm-2.4-9.3a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm4.8 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
        </svg>
      );
    case 'booking':
      return (
        <svg className="w-5 h-5 fill-current font-black" viewBox="0 0 24 24">
          <path d="M21 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.3 3 3 3h18c1.7 0 3-1.3 3-3V3c0-1.7-1.3-3-3-3zM7.5 16.5H5v-9h3.5c1.4 0 2.5 1.1 2.5 2.5 0 1.1-.7 2-1.7 2.3 1.2.3 2.1 1.3 2.1 2.5 0 1.5-1.2 2.7-2.7 2.7h-1.2v-1zm1.2-5.5H7.5v-1.5h1.2c.6 0 1 .4 1 1s-.4.5-1 .5zm.5 4H7.5V13.5h1.7c.6 0 1.1.5 1.1 1.1s-.5 1.1-1.1 1.1z"/>
        </svg>
      );
    case 'behance':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M22 12.5h-5c0-1.1.9-2 2-2s3 .9 3 2zm-12.8 1.9c0 .7-.6 1.3-1.3 1.3H5.3v-4.5h2.5c.7 0 1.3.6 1.3 1.3s-.6 1.3-1.3 1.3c.7.2 1.3.8 1.3 1.5v-.9H9.2zm14.8-2.4h-9v11h9v-11zm-13.8 2.5H5.3v1.8h2.6c.3 0 .5-.2.5-.5v-.8c0-.3-.2-.5-.5-.5z"/>
        </svg>
      );
    case 'googlemap':
    case 'googlereviews':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.202 3.203c-2.482 0-4.502 2.02-4.502 4.502 0 3.328 4.502 8.798 4.502 8.798s4.502-5.47 4.502-8.798c0-2.482-2.02-4.502-4.502-4.502zm0 6.103c-.884 0-1.601-.717-1.601-1.601 0-.884.717-1.601 1.601-1.601s1.601.717 1.601 1.601c0 .884-.717 1.601-1.601 1.601z"/>
        </svg>
      );
    case 'github':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
      );
    case 'snapchat':
      return (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.1c-4.4 0-6.5 3.3-6.5 5.2 0 1 .5 1.9 1.2 2.3-.2.3-.4.8-.4 1.3 0 .7.4 1.2.9 1.4.1.3-.1.7-.5 1-.9.7-1.7 1.7-1.7 2.9 0 2 2.3 3.3 5.4 3.7.5.1.9.3 1.1.6.4.7 1 .7 1.3.1.2-.4.6-.6 1.1-.7 3.1-.4 5.4-1.7 5.4-3.7 0-1.2-.8-2.2-1.7-2.9-.4-.3-.6-.7-.5-1 .5-.2.9-.7.9-1.4 0-.5-.2-1-.4-1.3.7-.4 1.2-1.3 1.2-2.3 0-1.9-2.1-5.2-6.5-5.2"/>
        </svg>
      );
    default:
      return (
        <span className="text-xs uppercase font-extrabold">{platform.substring(0, 2)}</span>
      );
  }
}

interface TokenPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function PublicTokenPage({ params }: TokenPageProps) {
  const { token } = await params;

  // 1. Try to fetch profile directly by slug (slug acts as the permanent public token)
  let profile = await db.profile.findFirst({
    where: { slug: token },
    include: {
      components: { orderBy: { sortOrder: 'asc' } },
      socialLinks: { orderBy: { sortOrder: 'asc' } },
      locations: true,
      businessHours: { orderBy: { day: 'asc' } },
    },
  });

  let card = null;

  // 2. If not found by slug, look up Card by publicToken, id or cardNumber
  if (!profile) {
    card = await db.card.findFirst({
      where: {
        OR: [
          { publicToken: token },
          { id: token },
          { cardNumber: token }
        ]
      },
      include: {
        assignments: {
          include: {
            profile: {
              include: {
                components: { orderBy: { sortOrder: 'asc' } },
                socialLinks: { orderBy: { sortOrder: 'asc' } },
                locations: true,
                businessHours: { orderBy: { day: 'asc' } },
              },
            },
          },
        },
      },
    });

    if (card && card.assignments?.[0]?.profile) {
      profile = card.assignments[0].profile;
    }
  }

  // 3. If no profile matches, show 404 notFound
  if (!profile) {
    return notFound();
  }

  // 4. Check Card state restrictions (if resolved via card lookup, or if the profile is connected to a card)
  if (!card) {
    card = await db.card.findFirst({
      where: {
        assignments: {
          some: {
            profileId: profile.id,
            unassignedAt: null
          }
        }
      }
    });
  }

  if (card) {
    if (card.status === 'SUSPENDED') {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Card Suspended</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              This digital business card has been suspended by the owner or administration. Please contact support if you believe this is an error.
            </p>
          </div>
        </div>
      );
    }

    if (card.status === 'LOST') {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-650 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-red-650">Card Reported Lost</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              This card has been reported lost. Profile resolution is suspended for security purposes.
            </p>
          </div>
        </div>
      );
    }
  }

  // 5. Check profile visibility
  if (!profile.isPublic) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center mx-auto">
            <EyeOff className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Profile Private</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            This profile is currently marked as private and is not available for public view.
          </p>
        </div>
      </div>
    );
  }

  // 6. Log analytics event in the background (Non-blocking)
  db.cardEvent.create({
    data: {
      cardId: card?.id || null,
      profileId: profile.id,
      eventType: 'profile_view',
      deviceType: 'Mobile',
      OS: 'iOS',
      browser: 'Safari',
    },
  }).catch(err => console.error('Failed to log analytics event', err));

  // 5. Parse styling config from appearanceJson
  let appearance = {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    primary: '#1A1A1A',
    secondary: '#374151',
    accent: '#3B82F6',
    text: '#111827',
    muted: '#6B7280',
    border: '#E5E7EB',
    font: 'Inter, sans-serif',
    headingFont: 'Inter, sans-serif',
    buttonStyle: 'filled',
    cardStyle: 'flat',
    borderRadius: '12px',
    headerStyle: 'centered',
    avatarShape: 'circle',
    animation: 'subtle',
  };

  if (profile.appearanceJson) {
    try {
      const parsed = JSON.parse(profile.appearanceJson);
      appearance = {
        background: parsed.backgroundColor || parsed.background || appearance.background,
        surface: parsed.surfaceColor || parsed.surface || (parsed.backgroundColor === '#FFFFFF' ? '#F8FAFC' : '#FFFFFF'),
        primary: parsed.primaryColor || parsed.primary || appearance.primary,
        secondary: parsed.secondaryColor || parsed.secondary || appearance.secondary,
        accent: parsed.accentColor || parsed.accent || parsed.primaryColor || appearance.accent,
        text: parsed.textColor || parsed.text || appearance.text,
        muted: parsed.mutedColor || parsed.muted || appearance.muted,
        border: parsed.borderColor || parsed.border || appearance.border,
        font: parsed.fontFamily || parsed.font || appearance.font,
        headingFont: parsed.headingFont || parsed.fontFamily || parsed.font || appearance.headingFont,
        buttonStyle: parsed.buttonStyle || appearance.buttonStyle,
        cardStyle: parsed.cardStyle || appearance.cardStyle,
        borderRadius: parsed.buttonRadius || parsed.borderRadius || appearance.borderRadius,
        headerStyle: parsed.headerStyle || appearance.headerStyle,
        avatarShape: parsed.profileImageStyle || parsed.avatarShape || appearance.avatarShape,
        animation: parsed.animation || appearance.animation,
      };
    } catch (e) {
      console.error('Failed to parse appearance Json on public resolver', e);
    }
  }

  const isArabic = !!(profile.bio?.includes('الأعمال') || profile.name.match(/[\u0600-\u06FF]/));
  const dir = isArabic ? 'rtl' : 'ltr';
  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Button class mapper
  const getButtonClass = (style: string) => {
    switch (style) {
      case 'outlined': return 'btn-outlined';
      case 'soft': return 'btn-soft';
      case 'pill': return 'btn-pill';
      case 'glass': return 'btn-glass';
      default: return 'btn-primary';
    }
  };

  // Avatar radius mapper
  const getAvatarRadiusClass = (shape: string) => {
    switch (shape) {
      case 'rounded': return 'avatar-rounded';
      case 'square': return 'avatar-square';
      default: return 'avatar-circle';
    }
  };

  const initials = [profile.firstName || '', profile.lastName || '']
    .filter(Boolean).map((s: string) => s[0]).join('').toUpperCase() || profile.name?.[0]?.toUpperCase() || '?';

  // CSS variables for styling
  const cssVars = {
    '--theme-background': appearance.background,
    '--theme-surface': appearance.surface,
    '--theme-primary': appearance.primary,
    '--theme-secondary': appearance.secondary,
    '--theme-accent': appearance.accent,
    '--theme-text': appearance.text,
    '--theme-muted': appearance.muted,
    '--theme-border': appearance.border,
    '--theme-radius': appearance.borderRadius,
    '--theme-font': appearance.font,
    '--theme-heading-font': appearance.headingFont,
  } as React.CSSProperties;

  return (
    <div
      className="min-h-screen flex justify-center py-12 px-4 sm:px-6 transition-colors duration-300 card-page relative overflow-hidden"
      dir={dir}
      style={cssVars}
    >
      {/* Decorative Shifting Glow Bubbles */}
      <div className="absolute w-72 h-72 rounded-full blur-[120px] top-10 left-10 animate-pulse pointer-events-none" 
        style={{ background: `color-mix(in srgb, ${appearance.primary} 15%, transparent)` }} />
      <div className="absolute w-80 h-80 rounded-full blur-[130px] bottom-10 right-10 animate-pulse pointer-events-none" 
        style={{ background: `color-mix(in srgb, ${appearance.accent} 12%, transparent)`, animationDelay: '2s' }} />

      <div 
        className={`w-full max-w-lg overflow-hidden flex flex-col h-fit relative z-10 ${
          appearance.cardStyle === 'glass' ? 'glass border border-white/10 shadow-2xl' :
          appearance.cardStyle === 'bordered' ? 'bg-[var(--theme-surface)] border-2 border-[var(--theme-border)] shadow-md' :
          appearance.cardStyle === 'soft' ? 'bg-[var(--theme-surface)] shadow-lg hover:shadow-xl' :
          'bg-[var(--theme-surface)] shadow-sm'
        } ${appearance.animation === 'smooth' ? 'animate-slide-up' : appearance.animation === 'subtle' ? 'animate-fade-in' : ''}`}
        style={{ borderRadius: appearance.borderRadius }}
      >
        {/* Cover Photo */}
        {(appearance.headerStyle === 'hero' || appearance.headerStyle === 'cover') ? (
          <div className="h-40 relative flex justify-end p-4 cover-gradient">
            {profile.coverUrl ? (
              <img src={profile.coverUrl} className="absolute inset-0 w-full h-full object-cover" alt="Cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${appearance.primary}80, ${appearance.accent}50)` }} />
            )}
            <button className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center cursor-pointer border border-white/10 relative z-10">
              <Share2 className="w-4 h-4" />
            </button>

            {appearance.headerStyle === 'hero' && (
              <div className="absolute bottom-4 left-6 z-10 flex items-center gap-3">
                <div className={`w-14 h-14 border-2 border-white/30 flex items-center justify-center font-black text-lg ${getAvatarRadiusClass(appearance.avatarShape)}`}
                  style={{ background: `${appearance.primary}30`, color: 'white' }}>
                  {profile.photoUrl ? <img src={profile.photoUrl} alt="" className="w-full h-full object-cover rounded-inherit" /> : initials}
                </div>
                <div>
                  <h1 className="text-lg font-black text-white card-heading">{profile.name}</h1>
                  {(profile.jobTitle || profile.company) && (
                    <p className="text-white/80 text-xs mt-0.5">{[profile.jobTitle, profile.company].filter(Boolean).join(' · ')}</p>
                  )}
                </div>
              </div>
            )}
            
            {appearance.headerStyle === 'cover' && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-10">
                <div className={`w-20 h-20 border-4 border-[var(--theme-surface)] flex items-center justify-center font-black text-2xl shadow-md ${getAvatarRadiusClass(appearance.avatarShape)}`}
                  style={{ background: `color-mix(in srgb, ${appearance.primary} 30%, transparent)`, color: appearance.primary }}>
                  {profile.photoUrl ? <img src={profile.photoUrl} alt="" className="w-full h-full object-cover rounded-inherit" /> : initials}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Profile Details Container */}
        <div className={`px-6 pb-8 flex-grow flex flex-col relative ${
          appearance.headerStyle === 'cover' ? 'pt-12 items-center' :
          appearance.headerStyle === 'hero' ? 'pt-6 items-start' :
          appearance.headerStyle === 'left' ? 'pt-6 items-start' :
          'pt-6 items-center -mt-10' // centered/minimal defaults
        }`}>
          
          {/* Avatar for non-cover/non-hero headers */}
          {appearance.headerStyle !== 'hero' && appearance.headerStyle !== 'cover' && (
            <div className="relative group mb-4">
              <div className={`w-20 h-20 relative flex items-center justify-center font-bold text-2xl border-2 border-[var(--theme-border)] shadow-md overflow-hidden ${getAvatarRadiusClass(appearance.avatarShape)}`}
                style={{ background: `linear-gradient(135deg, ${appearance.primary}20, ${appearance.accent}15)`, color: appearance.primary }}>
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} className="w-full h-full object-cover rounded-inherit" alt={profile.name} />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
            </div>
          )}

          {/* Name & Titles */}
          {appearance.headerStyle !== 'hero' && (
            <div className={appearance.headerStyle === 'left' || appearance.headerStyle === 'hero' ? 'text-left w-full' : 'text-center'}>
              <h2 className="text-2xl font-black card-heading" style={{ color: 'var(--theme-text)' }}>{profile.name}</h2>
              {(profile.jobTitle || profile.company) && (
                <p className="text-xs font-bold tracking-wider uppercase mt-1" style={{ color: 'var(--theme-primary)' }}>
                  {[profile.jobTitle, profile.company].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          )}

          {profile.bio && (
            <p className={`text-xs mt-3.5 max-w-sm leading-relaxed ${
              appearance.headerStyle === 'left' || appearance.headerStyle === 'hero' ? 'text-left w-full' : 'text-center mx-auto'
            }`} style={{ color: 'var(--theme-muted)' }}>
              {profile.bio}
            </p>
          )}

          {/* Quick Action buttons */}
          <div className="grid grid-cols-2 gap-3 w-full mt-6">
            <a
              href={`/api/profiles/${profile.id}/vcard`}
              className={`py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow hover:opacity-90 active:scale-[0.98] transition-all ${getButtonClass(appearance.buttonStyle)}`}
            >
              <Download className="w-4 h-4" />
              <span>{isArabic ? 'حفظ جهة الاتصال' : 'Save Contact'}</span>
            </a>
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-[var(--theme-border)] hover:bg-slate-50 transition-all text-slate-700 dark:text-slate-200`}
              >
                <Globe className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                <span>{isArabic ? 'الموقع الإلكتروني' : 'Website'}</span>
              </a>
            )}
          </div>

          {/* Components Section */}
          <div className="w-full mt-6 space-y-4">
            {profile.components.map((comp: any) => {
              if (!comp.isVisible) return null;

              const compType = comp.type.toLowerCase();

              // 1. Google Map Embed
              if (compType === 'googlemap') {
                return (
                  <div key={comp.id} className="w-full rounded-2xl overflow-hidden border border-[var(--theme-border)] shadow-sm bg-[var(--theme-surface)] p-2.5">
                    <div className="text-left rtl:text-right font-bold text-xs px-2 pb-2.5 opacity-75 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[var(--theme-primary)]" />
                      <span>{comp.title}</span>
                    </div>
                    <iframe
                      width="100%"
                      height="200"
                      style={{ border: 0, borderRadius: '12px' }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(comp.value || comp.url || 'Location')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    />
                  </div>
                );
              }

              // 2. Google Review Local Widget
              if (compType === 'googlereview') {
                return (
                  <ReviewsWidget key={comp.id} profileId={profile.id} isArabic={isArabic} />
                );
              }

              // 3. Image block
              if (compType === 'image') {
                const imgUrl = comp.value || comp.url;
                if (!imgUrl) return null;
                return (
                  <div key={comp.id} className="w-full rounded-2xl overflow-hidden border border-[var(--theme-border)] shadow-sm bg-[var(--theme-surface)] p-2">
                    <img src={imgUrl} className="w-full h-auto object-cover rounded-xl hover:scale-[1.01] transition-transform duration-300" alt={comp.title || 'Image'} />
                    {comp.title && (
                      <p className="text-[10px] font-bold text-center mt-2 opacity-70 px-2">{comp.title}</p>
                    )}
                  </div>
                );
              }

              // 4. Video block (YouTube Embed)
              if (compType === 'video') {
                const embedUrl = getYoutubeEmbedUrl(comp.value || comp.url || '');
                if (!embedUrl) return null;
                return (
                  <div key={comp.id} className="w-full rounded-2xl overflow-hidden border border-[var(--theme-border)] shadow-sm bg-[var(--theme-surface)] p-2.5">
                    <div className="text-left rtl:text-right font-bold text-[10px] uppercase tracking-wider px-2 pb-2 opacity-60">
                      {comp.title || 'Featured Video'}
                    </div>
                    <div className="relative pb-[56.25%] h-0 rounded-xl overflow-hidden">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full border-0"
                        src={embedUrl}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                );
              }

              // Default: Normal links / buttons
              let href = comp.url || comp.value || '#';
              if (compType === 'phone') href = `tel:${comp.value || ''}`;
              else if (compType === 'email') href = `mailto:${comp.value || ''}`;
              else if (compType === 'whatsapp') href = `https://wa.me/${(comp.value || '').replace(/[^0-9]/g, '')}`;

              const Icon = getComponentIcon(comp.type);

              return (
                <a
                  key={comp.id}
                  href={href}
                  target={compType === 'phone' || compType === 'email' ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className={`p-3.5 flex items-center justify-between border border-[var(--theme-border)] shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer info-row`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 info-row-icon" />
                    </div>
                    <div className="text-left rtl:text-right">
                      <span className="text-[9px] uppercase tracking-wider block opacity-60 font-semibold">{comp.title}</span>
                      <span className="text-xs font-bold truncate max-w-[200px] block">{comp.value || comp.url}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Social Icons */}
          {profile.socialLinks.length > 0 && (
            <div className="w-full mt-6 space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest block text-center opacity-60">
                {isArabic ? 'روابط التواصل الاجتماعي' : 'Social Networks'}
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {profile.socialLinks.map((link: any) => {
                  if (!link.isVisible) return null;
                  const SVG = getSocialSvgIcon(link.platform);
                  const socialInfo = SOCIALS.find(s => s.id === link.platform.toLowerCase());
                  
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-sm"
                      style={{ background: socialInfo?.color || 'var(--theme-primary)' }}
                      title={link.platform}
                    >
                      {SVG}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Business Hours */}
          {profile.businessHours.length > 0 && (
            <div className="w-full mt-6 p-4 rounded-2xl border border-[var(--theme-border)] bg-slate-50/50">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text)' }}>
                  {isArabic ? 'ساعات العمل' : 'Business Hours'}
                </h3>
              </div>
              <div className="space-y-1.5">
                {profile.businessHours.map((hour: any) => (
                  <div key={hour.id} className="flex justify-between text-xs font-medium" style={{ color: 'var(--theme-text)' }}>
                    <span className="opacity-70">{daysMap[hour.day]}</span>
                    {hour.isClosed ? (
                      <span className="font-bold text-red-500">{isArabic ? 'مغلق' : 'Closed'}</span>
                    ) : (
                      <span className="font-bold">
                        {hour.openTime} - {hour.closeTime}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
