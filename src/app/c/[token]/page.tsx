import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { 
  Phone, Mail, Globe, MapPin, Clock, Download, AlertTriangle, EyeOff,
  Building2, ExternalLink, Sparkles, CheckCircle2, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import ReviewsWidget from './ReviewsWidget';
import ShareModal from './ShareModal';
import { INDUSTRY_TEMPLATES } from '@/lib/templates/industry-templates';

interface TokenPageProps {
  params: Promise<{
    token: string;
  }>;
}

// Metadata generator for high-res social sharing cards
export async function generateMetadata({ params }: TokenPageProps): Promise<Metadata> {
  const { token } = await params;
  const profile = await db.profile.findFirst({
    where: {
      OR: [
        { slug: token },
        { id: token }
      ]
    },
    select: { name: true, jobTitle: true, company: true, bio: true, photoUrl: true }
  });

  if (!profile) {
    return { title: 'Digital Business Card | brandxpere' };
  }

  const title = profile.name ? `${profile.name} | brandxpere` : 'Digital Card';
  const description = [profile.jobTitle, profile.company].filter(Boolean).join(' at ') || profile.bio || 'Digital Business Card';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: profile.photoUrl ? [{ url: profile.photoUrl }] : undefined,
    },
  };
}

function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
}

interface SocialConfig {
  id: string;
  label: string;
  gradient: string;
  solidColor: string;
  svg: React.ReactNode;
}

const SOCIAL_MAP: Record<string, SocialConfig> = {
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    gradient: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)',
    solidColor: '#E1306C',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
  whatsapp: {
    id: 'whatsapp',
    label: 'WhatsApp',
    gradient: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
    solidColor: '#25D366',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.62.962 3.21 1.493 4.887 1.495 5.234 0 9.488-4.251 9.49-9.489.002-2.54-1.009-4.928-2.846-6.764C16.284 2.56 13.916 1.5 11.45 1.5 6.213 1.5 1.959 5.751 1.957 10.99c-.001 1.777.472 3.4 1.373 4.908L2.348 20.89l5.3-1.391z"/>
      </svg>
    ),
  },
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn',
    gradient: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
    solidColor: '#0A66C2',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zm15.11 13.02h-3.56v-5.6c0-1.34-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.7h-3.56V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/>
      </svg>
    ),
  },
  twitter: {
    id: 'twitter',
    label: 'X (Twitter)',
    gradient: 'linear-gradient(135deg, #24292e 0%, #000000 100%)',
    solidColor: '#000000',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  x: {
    id: 'x',
    label: 'X',
    gradient: 'linear-gradient(135deg, #24292e 0%, #000000 100%)',
    solidColor: '#000000',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  facebook: {
    id: 'facebook',
    label: 'Facebook',
    gradient: 'linear-gradient(135deg, #1877F2 0%, #0c56b8 100%)',
    solidColor: '#1877F2',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  youtube: {
    id: 'youtube',
    label: 'YouTube',
    gradient: 'linear-gradient(135deg, #FF0000 0%, #B20000 100%)',
    solidColor: '#FF0000',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  tiktok: {
    id: 'tiktok',
    label: 'TikTok',
    gradient: 'linear-gradient(135deg, #000000 0%, #1e1e1e 100%)',
    solidColor: '#000000',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
  },
  telegram: {
    id: 'telegram',
    label: 'Telegram',
    gradient: 'linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)',
    solidColor: '#2AABEE',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M11.944 0C5.346 0 0 5.346 0 11.944c0 6.598 5.346 11.944 11.944 11.944 6.598 0 11.944-5.346 11.944-11.944C23.888 5.346 18.542 0 11.944 0zm5.82 8.163c-.15 1.574-.8 5.414-1.13 7.183-.14.75-.415 1-.682 1.024-.582.054-1.023-.385-1.586-.754-.882-.577-1.38-1.365-2.237-1.93-.99-.652-.35-1.01.216-1.597.148-.153 2.722-2.495 2.772-2.707.006-.027.012-.127-.048-.18-.06-.054-.148-.035-.212-.02-.09.02-1.536.974-4.336 2.864-.41.282-.782.42-1.116.412-.367-.008-1.072-.208-1.596-.378-.642-.21-1.153-.32-1.108-.677.023-.186.28-.378.77-.577 3.012-1.31 5.02-2.176 6.023-2.597 2.857-1.2 3.45-1.408 3.836-1.415.085-.002.274.019.397.12.103.085.132.2.14.286.012.105.008.324-.007.494z"/>
      </svg>
    ),
  },
  github: {
    id: 'github',
    label: 'GitHub',
    gradient: 'linear-gradient(135deg, #24292e 0%, #040d21 100%)',
    solidColor: '#24292e',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    ),
  },
  snapchat: {
    id: 'snapchat',
    label: 'Snapchat',
    gradient: 'linear-gradient(135deg, #FFFC00 0%, #FFE600 100%)',
    solidColor: '#FFFC00',
    svg: (
      <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24">
        <path d="M12 2.1c-4.4 0-6.5 3.3-6.5 5.2 0 1 .5 1.9 1.2 2.3-.2.3-.4.8-.4 1.3 0 .7.4 1.2.9 1.4.1.3-.1.7-.5 1-.9.7-1.7 1.7-1.7 2.9 0 2 2.3 3.3 5.4 3.7.5.1.9.3 1.1.6.4.7 1 .7 1.3.1.2-.4.6-.6 1.1-.7 3.1-.4 5.4-1.7 5.4-3.7 0-1.2-.8-2.2-1.7-2.9-.4-.3-.6-.7-.5-1 .5-.2.9-.7.9-1.4 0-.5-.2-1-.4-1.3.7-.4 1.2-1.3 1.2-2.3 0-1.9-2.1-5.2-6.5-5.2"/>
      </svg>
    ),
  },
  tripadvisor: {
    id: 'tripadvisor',
    label: 'TripAdvisor',
    gradient: 'linear-gradient(135deg, #34E0A1 0%, #00AF87 100%)',
    solidColor: '#34E0A1',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 18.6a6.6 6.6 0 110-13.2 6.6 6.6 0 010 13.2zm-2.4-9.3a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm4.8 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
      </svg>
    ),
  },
  behance: {
    id: 'behance',
    label: 'Behance',
    gradient: 'linear-gradient(135deg, #1769FF 0%, #0047c7 100%)',
    solidColor: '#1769FF',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M22 12.5h-5c0-1.1.9-2 2-2s3 .9 3 2zm-12.8 1.9c0 .7-.6 1.3-1.3 1.3H5.3v-4.5h2.5c.7 0 1.3.6 1.3 1.3s-.6 1.3-1.3 1.3c.7.2 1.3.8 1.3 1.5v-.9H9.2zm14.8-2.4h-9v11h9v-11zm-13.8 2.5H5.3v1.8h2.6c.3 0 .5-.2.5-.5v-.8c0-.3-.2-.5-.5-.5z"/>
      </svg>
    ),
  },
};

function getSocialInfo(platform: string) {
  const p = (platform || '').toLowerCase().trim();
  if (SOCIAL_MAP[p]) return SOCIAL_MAP[p];
  return {
    id: p,
    label: platform.charAt(0).toUpperCase() + platform.slice(1),
    gradient: 'linear-gradient(135deg, #374151 0%, #111827 100%)',
    solidColor: '#374151',
    svg: <Globe className="w-5 h-5 fill-current" />,
  };
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

  // 5. Resolve Template & Appearance
  let appearance = {
    background: '#0D0E15',
    surface: '#151722',
    primary: '#8A509E',
    secondary: '#3B82F6',
    accent: '#A855F7',
    text: '#FFFFFF',
    muted: '#94A3B8',
    border: 'rgba(255, 255, 255, 0.08)',
    font: 'Inter',
    headingFont: 'Inter',
    buttonStyle: 'filled',
    cardStyle: 'glass',
    borderRadius: '28px',
    headerStyle: 'hero',
    avatarShape: 'circle',
    animation: 'smooth',
  };

  // Fallback to IndustryTemplate defaults if templateId is set
  if (profile.templateId) {
    const matched = INDUSTRY_TEMPLATES.find(t => t.id === profile.templateId);
    if (matched) {
      appearance = {
        background: matched.background,
        surface: matched.surface,
        primary: matched.primary,
        secondary: matched.secondary,
        accent: matched.accent,
        text: matched.text,
        muted: matched.muted,
        border: matched.border,
        font: matched.font,
        headingFont: matched.headingFont,
        buttonStyle: matched.buttonStyle,
        cardStyle: matched.cardStyle,
        borderRadius: matched.borderRadius,
        headerStyle: matched.headerStyle,
        avatarShape: matched.avatarShape,
        animation: matched.animation,
      };
    }
  }

  // Parse appearanceJson overrides
  let appearanceSocialsFallback: any[] = [];
  if (profile.appearanceJson) {
    try {
      const parsed = JSON.parse(profile.appearanceJson);
      appearance = {
        background: parsed.background || parsed.backgroundColor || appearance.background,
        surface: parsed.surface || parsed.surfaceColor || appearance.surface,
        primary: parsed.primary || parsed.primaryColor || appearance.primary,
        secondary: parsed.secondary || parsed.secondaryColor || appearance.secondary,
        accent: parsed.accent || parsed.accentColor || appearance.accent,
        text: parsed.text || parsed.textColor || appearance.text,
        muted: parsed.muted || parsed.mutedColor || appearance.muted,
        border: parsed.border || parsed.borderColor || appearance.border,
        font: parsed.font || parsed.fontFamily || appearance.font,
        headingFont: parsed.headingFont || parsed.font || appearance.headingFont,
        buttonStyle: parsed.buttonStyle || appearance.buttonStyle,
        cardStyle: parsed.cardStyle || appearance.cardStyle,
        borderRadius: parsed.borderRadius || parsed.buttonRadius || appearance.borderRadius,
        headerStyle: parsed.headerStyle || appearance.headerStyle,
        avatarShape: parsed.avatarShape || parsed.profileImageStyle || appearance.avatarShape,
        animation: parsed.animation || appearance.animation,
      };

      if (parsed.socialLinks && Array.isArray(parsed.socialLinks)) {
        appearanceSocialsFallback = parsed.socialLinks;
      }
    } catch (e) {
      console.error('Appearance parse error:', e);
    }
  }

  // 6. Merge Social Links: Relational records first, then JSON fallback
  const activeSocials: Array<{ id: string; platform: string; url: string; username?: string }> = [];
  const seenPlatforms = new Set<string>();

  for (const sl of profile.socialLinks || []) {
    if (sl.isVisible !== false && sl.url && sl.url.trim()) {
      activeSocials.push({
        id: sl.id,
        platform: sl.platform.toLowerCase(),
        url: sl.url.startsWith('http://') || sl.url.startsWith('https://') || sl.url.startsWith('mailto:') || sl.url.startsWith('tel:')
          ? sl.url
          : `https://${sl.url}`,
        username: sl.username,
      });
      seenPlatforms.add(sl.platform.toLowerCase());
    }
  }

  for (const sl of appearanceSocialsFallback) {
    const plat = (sl.platform || '').toLowerCase();
    if (plat && sl.url && !seenPlatforms.has(plat)) {
      activeSocials.push({
        id: plat,
        platform: plat,
        url: sl.url.startsWith('http://') || sl.url.startsWith('https://') ? sl.url : `https://${sl.url}`,
        username: sl.username || sl.url,
      });
      seenPlatforms.add(plat);
    }
  }

  const isArabic = !!(profile.bio?.includes('ال') || profile.name.match(/[\u0600-\u06FF]/));
  const dir = isArabic ? 'rtl' : 'ltr';

  const initials = [profile.firstName, profile.lastName]
    .filter((s): s is string => !!s)
    .map((s) => s[0])
    .join('')
    .toUpperCase() || profile.name?.[0]?.toUpperCase() || 'B';

  const avatarRadius = appearance.avatarShape === 'circle' ? '9999px' : appearance.avatarShape === 'rounded' ? '20px' : '8px';

  const rawPhone = profile.whatsApp || profile.phone || '';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start sm:justify-center py-0 sm:py-10 px-0 sm:px-4 relative overflow-x-hidden select-none transition-colors duration-300"
      dir={dir}
      style={{
        backgroundColor: appearance.background,
        fontFamily: `${appearance.font}, system-ui, -apple-system, sans-serif`,
        color: appearance.text,
      }}
    >
      {/* Dynamic Ambient Blur Orbs */}
      <div
        className="fixed w-96 h-96 rounded-full blur-[140px] -top-20 -left-20 pointer-events-none opacity-40 animate-pulse"
        style={{ background: appearance.primary }}
      />
      <div
        className="fixed w-96 h-96 rounded-full blur-[140px] -bottom-20 -right-20 pointer-events-none opacity-30 animate-pulse"
        style={{ background: appearance.accent, animationDelay: '3s' }}
      />

      {/* Main vCard Frame */}
      <main
        className="w-full sm:max-w-md min-h-screen sm:min-h-0 sm:rounded-[32px] overflow-hidden flex flex-col relative z-10 shadow-2xl transition-all duration-300"
        style={{
          backgroundColor: appearance.surface,
          borderRadius: appearance.borderRadius,
          border: `1px solid ${appearance.border}`,
          backdropFilter: appearance.cardStyle === 'glass' ? 'blur(20px)' : 'none',
        }}
      >
        {/* Cover Header */}
        <div className="relative h-48 sm:h-52 w-full overflow-hidden shrink-0">
          {profile.coverUrl ? (
            <img
              src={profile.coverUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full relative"
              style={{
                background: `linear-gradient(135deg, ${appearance.primary}CC 0%, ${appearance.accent}99 50%, ${appearance.background} 100%)`,
              }}
            >
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '24px 24px',
                }}
              />
            </div>
          )}

          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, ${appearance.surface} 100%)`,
            }}
          />

          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isArabic ? 'بطاقة مفعّلة' : 'Verified Profile'}</span>
            </div>

            <ShareModal
              slug={profile.slug}
              name={profile.name}
              title={profile.jobTitle}
              primaryColor={appearance.primary}
              isArabic={isArabic}
            />
          </div>
        </div>

        {/* Identity Section */}
        <div className="px-6 pb-6 pt-0 flex flex-col items-center text-center -mt-16 sm:-mt-18 relative z-20">
          <div className="relative group mb-3">
            <div
              className="absolute -inset-1 rounded-full blur-md opacity-75 animate-pulse"
              style={{ background: `linear-gradient(135deg, ${appearance.primary}, ${appearance.accent})` }}
            />
            <div
              className="relative w-28 h-28 sm:w-32 sm:h-32 border-4 flex items-center justify-center overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-105"
              style={{
                borderColor: appearance.surface,
                borderRadius: avatarRadius,
                background: `linear-gradient(135deg, ${appearance.primary}, ${appearance.accent})`,
              }}
            >
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl sm:text-4xl font-black text-white tracking-wider">
                  {initials}
                </span>
              )}
            </div>

            <div
              className="absolute bottom-1 right-1 rtl:right-auto rtl:left-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 shadow-md"
              title="Online"
            />
          </div>

          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight flex items-center justify-center gap-1.5"
            style={{ fontFamily: `${appearance.headingFont}, sans-serif` }}
          >
            <span>{profile.name}</span>
            <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 inline fill-sky-400/20" />
          </h1>

          {(profile.jobTitle || profile.company) && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1.5">
              {profile.jobTitle && (
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    background: `${appearance.primary}22`,
                    color: appearance.primary,
                    border: `1px solid ${appearance.primary}44`,
                  }}
                >
                  {profile.jobTitle}
                </span>
              )}
              {profile.company && (
                <span className="text-xs font-semibold flex items-center gap-1 opacity-80" style={{ color: appearance.muted }}>
                  <Building2 className="w-3 h-3" />
                  <span>{profile.company}</span>
                </span>
              )}
            </div>
          )}

          {profile.locations && profile.locations.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] font-medium mt-1.5 opacity-75" style={{ color: appearance.muted }}>
              <MapPin className="w-3 h-3 text-red-400 shrink-0" />
              <span>{profile.locations[0].address}</span>
            </div>
          )}

          {profile.bio && (
            <p
              className="text-xs sm:text-sm mt-3.5 max-w-sm leading-relaxed px-2"
              style={{ color: appearance.muted }}
            >
              {profile.bio}
            </p>
          )}

          {/* Hero Action Buttons */}
          <div className="w-full mt-6 space-y-2.5">
            <a
              href={`/api/profiles/${profile.id}/vcard`}
              className="w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 text-white shadow-xl hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${appearance.primary} 0%, ${appearance.accent} 100%)`,
                boxShadow: `0 10px 25px -5px ${appearance.primary}50`,
              }}
            >
              <Download className="w-4 h-4" />
              <span>{isArabic ? 'حفظ جهة الاتصال في الهاتف' : 'Save Contact to Phone'}</span>
            </a>

            <div className="grid grid-cols-2 gap-2 w-full">
              {cleanPhone && (
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <div className="w-5 h-5 shrink-0 text-[#25D366]">
                    {SOCIAL_MAP.whatsapp.svg}
                  </div>
                  <span>WhatsApp</span>
                </a>
              )}

              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="py-3 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all hover:bg-white/5 active:scale-[0.98]"
                  style={{ borderColor: appearance.border, color: appearance.text }}
                >
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isArabic ? 'اتصال مباشر' : 'Call'}</span>
                </a>
              )}

              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className={`py-3 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all hover:bg-white/5 active:scale-[0.98] ${!cleanPhone || !profile.phone ? 'col-span-2' : ''}`}
                  style={{ borderColor: appearance.border, color: appearance.text }}
                >
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </a>
              )}

              {profile.website && (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`py-3 px-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all hover:bg-white/5 active:scale-[0.98] ${(!profile.phone || !cleanPhone) && profile.email ? '' : 'col-span-2'}`}
                  style={{ borderColor: appearance.border, color: appearance.text }}
                >
                  <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate">{isArabic ? 'الموقع الإلكتروني' : 'Visit Website'}</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
            </div>
          </div>

          {/* Social Networks Showcase */}
          {activeSocials.length > 0 && (
            <div className="w-full mt-7 pt-6 border-t border-white/10 space-y-3.5">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#8A509E]" />
                <h3 className="text-[11px] font-black uppercase tracking-widest opacity-70">
                  {isArabic ? 'وسائل التواصل الاجتماعي' : 'Social Networks'}
                </h3>
                <Sparkles className="w-3.5 h-3.5 text-[#8A509E]" />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {activeSocials.map((link) => {
                  const info = getSocialInfo(link.platform);
                  return (
                    <a
                      key={link.id || link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-2xl flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm group border"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderColor: appearance.border,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-110 transition-transform"
                        style={{ background: info.gradient }}
                      >
                        {info.svg}
                      </div>
                      <div className="text-left rtl:text-right min-w-0 flex-1">
                        <span className="text-xs font-black block truncate" style={{ color: appearance.text }}>
                          {info.label}
                        </span>
                        <span className="text-[10px] font-medium block truncate opacity-60" style={{ color: appearance.muted }}>
                          {link.username || (isArabic ? 'متابعة' : 'Follow')}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Blocks & Components */}
          {profile.components && profile.components.length > 0 && (
            <div className="w-full mt-6 space-y-4">
              {profile.components.map((comp: any) => {
                if (!comp.isVisible) return null;
                const compType = comp.type.toLowerCase();

                if (compType === 'googlemap') {
                  return (
                    <div
                      key={comp.id}
                      className="w-full rounded-2xl overflow-hidden border p-3 bg-white/5"
                      style={{ borderColor: appearance.border }}
                    >
                      <div className="text-left rtl:text-right font-bold text-xs pb-2 flex items-center gap-2 opacity-80">
                        <MapPin className="w-4 h-4 text-red-400" />
                        <span>{comp.title || 'Location'}</span>
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

                if (compType === 'googlereview') {
                  return (
                    <ReviewsWidget key={comp.id} profileId={profile.id} isArabic={isArabic} />
                  );
                }

                if (compType === 'video') {
                  const embedUrl = getYoutubeEmbedUrl(comp.value || comp.url || '');
                  if (!embedUrl) return null;
                  return (
                    <div
                      key={comp.id}
                      className="w-full rounded-2xl overflow-hidden border p-3 bg-white/5"
                      style={{ borderColor: appearance.border }}
                    >
                      {comp.title && (
                        <p className="text-left rtl:text-right font-bold text-xs pb-2 opacity-80">
                          {comp.title}
                        </p>
                      )}
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

                if (compType === 'image') {
                  const imgUrl = comp.value || comp.url;
                  if (!imgUrl) return null;
                  return (
                    <div
                      key={comp.id}
                      className="w-full rounded-2xl overflow-hidden border p-2 bg-white/5"
                      style={{ borderColor: appearance.border }}
                    >
                      <img src={imgUrl} alt={comp.title || 'Image'} className="w-full h-auto rounded-xl object-cover" />
                      {comp.title && (
                        <p className="text-xs font-bold text-center mt-2 opacity-80">{comp.title}</p>
                      )}
                    </div>
                  );
                }

                const href = comp.url || comp.value || '#';
                return (
                  <a
                    key={comp.id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl flex items-center justify-between border transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      borderColor: appearance.border,
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <div className="text-left rtl:text-right">
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block">
                        {comp.title}
                      </span>
                      <span className="text-xs font-bold block truncate max-w-[260px]">
                        {comp.value || comp.url}
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-50" />
                  </a>
                );
              })}
            </div>
          )}

          {/* Business Hours */}
          {profile.businessHours && profile.businessHours.length > 0 && (
            <div
              className="w-full mt-6 p-4 rounded-2xl border text-left rtl:text-right space-y-3"
              style={{
                borderColor: appearance.border,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8A509E]" />
                  <h3 className="text-xs font-black uppercase tracking-wider">
                    {isArabic ? 'ساعات العمل' : 'Business Hours'}
                  </h3>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                {profile.businessHours.map((hour: any) => {
                  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  const arabicDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                  return (
                    <div key={hour.id} className="flex justify-between items-center opacity-85">
                      <span>{isArabic ? arabicDays[hour.day] : days[hour.day]}</span>
                      {hour.isClosed ? (
                        <span className="text-red-400 font-bold text-[11px]">{isArabic ? 'مغلق' : 'Closed'}</span>
                      ) : (
                        <span className="font-semibold text-[11px] font-mono">
                          {hour.openTime} - {hour.closeTime}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Branding */}
          <footer className="mt-10 pt-6 pb-2 text-center w-full border-t border-white/5">
            <Link
              href="https://www.brandxpere.com"
              target="_blank"
              className="inline-flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity text-[11px] font-medium"
            >
              <img src="/brandxpere-icon.png" alt="Logo" className="w-4 h-4 rounded-sm object-contain" />
              <span>
                Powered by <strong className="font-bold">brand<span className="text-[#8A509E]">x</span>pere</strong>
              </span>
            </Link>
          </footer>
        </div>
      </main>
    </div>
  );
}
