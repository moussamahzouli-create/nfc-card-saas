'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Eye, Smartphone, Monitor, Tablet,
  User, Phone, Globe, Palette, Plus, Trash2, Check,
  AlertCircle, RefreshCw, Mail, MapPin, Clock,
  ChevronUp, ChevronDown, GripVertical, Settings,
  Camera, Layers, Search, Zap, ExternalLink, Share2
} from 'lucide-react';
import { INDUSTRY_TEMPLATES, type IndustryTemplate } from '@/lib/templates/industry-templates';
import { compressImage } from '@/lib/image-compression';

/* ═══════════════════════════════
   TYPES & CONSTANTS
═══════════════════════════════ */
type DeviceView = 'mobile' | 'tablet' | 'desktop';
type EditorTab = 'info' | 'contact' | 'social' | 'design' | 'components';

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
  { id: 'pinterest',     label: 'Pinterest',        color: '#E60023', letter: 'PI' },
];

function getComponentIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'phone': return Phone;
    case 'whatsapp': return MessageSquareIcon;
    case 'email': return Mail;
    case 'website': return Globe;
    case 'googlemap': return MapPin;
    case 'googlereview': return StarIcon;
    default: return Smartphone;
  }
}

// Simple placeholder icons
function MessageSquareIcon(props: any) {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function StarIcon(props: any) {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.178 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.783-.57-.38-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function getSocialSvgIcon(platform: string) {
  const p = platform.toLowerCase();
  switch (p) {
    case 'facebook':
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
        </svg>
      );
    case 'linkedin':
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zm15.11 13.02h-3.56v-5.6c0-1.34-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.7h-3.56V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/>
        </svg>
      );
    case 'whatsapp':
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.301-.15-1.782-.879-2.057-.979-.276-.1-.476-.15-.677.15-.2.301-.777.979-.953 1.18-.175.2-.351.226-.652.076-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.675-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.175.201-.301.301-.501.101-.2.05-.376-.025-.527-.075-.15-.677-1.632-.928-2.233-.244-.585-.492-.506-.677-.515-.175-.008-.376-.01-.576-.01s-.527.075-.803.376c-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.909 1.229 3.109.15.2 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.38.197 1.9-.12.58-.354 1.782-1.053 2.033-1.68.251-.627.251-1.164.175-1.289-.075-.125-.276-.2-.577-.35zm2.12-10.94C17.405 1.258 14.787.008 12.008.008c-6.615 0-12 5.385-12 12 0 2.112.551 4.172 1.597 5.986L0 24l6.19-1.623c1.751.954 3.737 1.457 5.814 1.457h.005c6.615 0 12-5.385 12-12 0-3.204-1.248-6.216-3.417-8.392zM12.008 21.808h-.004c-1.788 0-3.541-.481-5.068-1.388l-.364-.216-3.766.988 1.005-3.671-.237-.377C2.639 15.617 2.025 13.85 2.025 12.008c0-5.505 4.478-9.983 9.987-9.983 2.668 0 5.176 1.039 7.062 2.925 1.887 1.886 2.926 4.394 2.926 7.062 0 5.505-4.479 9.983-9.988 9.983z"/>
        </svg>
      );
    case 'pinterest':
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
        </svg>
      );
    case 'x':
    case 'twitter':
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    default:
      return <span className="text-[10px] uppercase font-bold">{platform.slice(0, 2)}</span>;
  }
}

/* ═══════════════════════════════
   PREVIEW SUB-CONTENT
═══════════════════════════════ */
function CardContent({ headerStyle, primary, accent, bg, surface, textColor, muted, border,
  btnBaseStyle, avatarRadius, initials, profile, font, headingFont, visibleSocials, radius, components, appearance }: any) {
  return (
    <div style={{ background: bg, color: textColor, fontFamily: font }} className="pb-8">
      {/* Cover image/header */}
      {(headerStyle === 'hero' || headerStyle === 'cover') ? (
        <div className="relative w-full h-40 flex items-end"
          style={{ background: `linear-gradient(135deg, ${primary}CC, ${accent}80)` }}>
          {profile.coverUrl && <img src={profile.coverUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />}
          <div className="absolute inset-0 bg-black/20" />
          
          {headerStyle === 'hero' && (
            <div className="relative z-10 p-5 w-full">
              <div className="w-14 h-14 border-2 border-white/30 flex items-center justify-center font-black text-lg mb-2 shadow"
                style={{ background: `${primary}40`, color: 'white', borderRadius: avatarRadius }}>
                {profile.photoUrl ? <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" style={{ borderRadius: avatarRadius }} /> : initials}
              </div>
              <h1 className="text-lg font-black text-white" style={{ fontFamily: headingFont }}>{profile.name || 'Your Name'}</h1>
              {(profile.jobTitle || profile.company) && (
                <p className="text-white/80 text-xs mt-0.5">{[profile.jobTitle, profile.company].filter(Boolean).join(' · ')}</p>
              )}
            </div>
          )}
          {headerStyle === 'cover' && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-10">
              <div className="w-18 h-18 border-4 border-[var(--theme-surface)] flex items-center justify-center font-black text-xl shadow-md"
                style={{ background: `color-mix(in srgb, ${primary} 30%, transparent)`, color: primary, borderRadius: avatarRadius }}>
                {profile.photoUrl ? <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" style={{ borderRadius: avatarRadius }} /> : initials}
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div className={`px-5 flex flex-col gap-4 ${headerStyle === 'cover' ? 'pt-12' : 'pt-5'}`}>
        {/* Profile Info (centered, left, cover etc.) */}
        {headerStyle !== 'hero' && (
          <div className={headerStyle === 'left' ? 'text-left' : 'text-center'}>
            {headerStyle !== 'cover' && (
              <div className={`w-16 h-16 border border-slate-200/50 flex items-center justify-center font-black text-xl shadow-sm mb-3 ${headerStyle === 'left' ? 'mr-auto' : 'mx-auto'}`}
                style={{ background: `color-mix(in srgb, ${primary} 12%, transparent)`, color: primary, borderRadius: avatarRadius }}>
                {profile.photoUrl ? <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" style={{ borderRadius: avatarRadius }} /> : initials}
              </div>
            )}
            <h1 className="text-lg font-black" style={{ fontFamily: headingFont }}>{profile.name || 'Your Name'}</h1>
            {(profile.jobTitle || profile.company) && (
              <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: primary }}>
                {[profile.jobTitle, profile.company].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        )}

        {profile.bio && (
          <p className={`text-xs leading-relaxed opacity-85 ${headerStyle === 'left' ? 'text-left' : 'text-center'}`} style={{ color: muted }}>
            {profile.bio}
          </p>
        )}

        {/* CTA buttons */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          {profile.phone && (
            <div className="flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold" style={btnBaseStyle}>
              <Phone className="w-3.5 h-3.5" /> Call
            </div>
          )}
          {profile.email && (
            <div className="flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold" style={btnBaseStyle}>
              <Mail className="w-3.5 h-3.5" /> Email
            </div>
          )}
        </div>

        {/* Component list */}
        {components.length > 0 && (
          <div className="space-y-3 mt-2 text-left">
            {components.map((comp: any) => {
              if (!comp.isVisible) return null;
              const compType = comp.type.toLowerCase();

              if (compType === 'googlemap') {
                if (appearance?.showMap === false) return null;
                return (
                  <div key={comp.id} className="w-full rounded-xl overflow-hidden border p-2 bg-slate-50/50" style={{ borderColor: border }}>
                    <div className="text-[9px] uppercase tracking-wider block opacity-60 font-semibold mb-1 px-1">{comp.title}</div>
                    <iframe
                      width="100%"
                      height="120"
                      style={{ border: 0, borderRadius: '8px' }}
                      loading="lazy"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(comp.value || comp.url || 'Location')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    />
                  </div>
                );
              }

              if (compType === 'googlereview') {
                return (
                  <div key={comp.id} className="w-full rounded-xl border p-3.5 bg-slate-50/50 text-center space-y-1.5" style={{ borderColor: border }}>
                    <span className="text-[9px] uppercase tracking-wider block opacity-60 font-semibold">{comp.title}</span>
                    <div className="flex justify-center gap-0.5 text-amber-500 text-sm">★★★★★</div>
                    <p className="text-[9px] text-slate-400 font-bold">Direct reviews form will render live on public page</p>
                  </div>
                );
              }

              if (compType === 'image') {
                const imgUrl = (comp.value || comp.url || '').trim();
                const isPinterest = /pinterest\.|pin\.it/i.test(imgUrl);
                const isDirectImage = /^data:image\//i.test(imgUrl) || 
                  /^\/api\/profiles\/.*\/upload/i.test(imgUrl) || 
                  /^\/uploads\//i.test(imgUrl) || 
                  /\.(jpe?g|png|gif|webp|svg|avif)(\?.*)?$/i.test(imgUrl);
                const isWebPage = imgUrl && (isPinterest || !isDirectImage);

                return (
                  <div key={comp.id} className="w-full rounded-xl overflow-hidden border p-2 bg-slate-50/50" style={{ borderColor: border }}>
                    {isWebPage ? (
                      <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center justify-between text-xs font-bold">
                        <span className="truncate">{comp.title || (isPinterest ? 'Pinterest Showcase' : 'Web Link')}</span>
                        <ExternalLink className="w-4 h-4 shrink-0" />
                      </div>
                    ) : imgUrl ? (
                      <img src={imgUrl} className="w-full h-auto object-cover rounded-lg max-h-48" alt="" />
                    ) : (
                      <div className="h-20 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-semibold">لم يتم رفع صورة بعد</div>
                    )}
                    {comp.title && <p className="text-[9px] text-center mt-1.5 opacity-60 font-semibold">{comp.title}</p>}
                  </div>
                );
              }

              if (compType === 'video') {
                const urlVal = comp.value || comp.url || '';
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                const match = urlVal.match(regExp);
                const embedUrl = match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
                
                return (
                  <div key={comp.id} className="w-full rounded-xl overflow-hidden border p-2 bg-slate-50/50" style={{ borderColor: border }}>
                    <div className="text-[9px] uppercase tracking-wider block opacity-60 font-semibold mb-1 px-1">{comp.title}</div>
                    {embedUrl ? (
                      <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden">
                        <iframe className="absolute top-0 left-0 w-full h-full border-0" src={embedUrl} />
                      </div>
                    ) : (
                      <div className="h-20 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-semibold">Enter YouTube URL</div>
                    )}
                  </div>
                );
              }

              const Icon = getComponentIcon(comp.type);
              return (
                <div key={comp.id} className="p-3 flex items-center justify-between border border-[var(--theme-border)] shadow-sm rounded-xl info-row"
                  style={{ background: `${primary}06`, borderColor: `${primary}12` }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${primary}10`, color: primary }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] uppercase tracking-wider block opacity-60 font-semibold">{comp.title}</span>
                      <span className="text-xs font-bold">{comp.value || comp.url}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Social Network icons */}
        {visibleSocials.length > 0 && (
          <div className="mt-2">
            <p className="text-[9px] font-bold uppercase tracking-wider text-center opacity-50 mb-2">Social Networks</p>
            <div className="flex flex-wrap justify-center gap-2">
              {visibleSocials.map((s: any) => {
                const sBg = appearance?.iconStyle === 'unified' && appearance?.iconBg
                  ? appearance.iconBg
                  : appearance?.iconStyle === 'glass'
                  ? 'rgba(0, 0, 0, 0.08)'
                  : appearance?.iconStyle === 'gradient'
                  ? `linear-gradient(135deg, ${primary}, ${accent})`
                  : s.color;

                return (
                  <div key={s.id} className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-sm"
                    style={{ background: sBg, color: appearance?.iconColor || '#FFFFFF' }}>
                    {getSocialSvgIcon(s.id)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="py-3 text-center font-extrabold text-xs text-white rounded-xl mt-3"
          style={{ background: `linear-gradient(135deg, ${primary}, ${accent})`, borderRadius: radius }}>
          💾 Save Contact
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════
   LIVE PREVIEW SYSTEM (device wrap)
═══════════════════════════════ */
function LiveCardPreview({ profile, appearance, deviceView, components }: any) {
  const bg = appearance.background || '#FFFFFF';
  const primary = appearance.primary || '#1A1A1A';
  const accent = appearance.accent || primary;
  const textColor = appearance.text || '#111827';
  const muted = appearance.muted || '#6B7280';
  const border = appearance.border || '#E5E7EB';
  const surface = appearance.surface || '#FFFFFF';
  const font = appearance.font || 'Inter';
  const headingFont = appearance.headingFont || font;
  const btnStyle = appearance.buttonStyle || 'filled';
  const radius = appearance.borderRadius || '12px';
  const avatarShape = appearance.avatarShape || 'circle';
  const headerStyle = appearance.headerStyle || 'centered';

  const initials = [profile.firstName || '', profile.lastName || '']
    .filter(Boolean).map((s: string) => s[0]).join('').toUpperCase() || profile.name?.[0]?.toUpperCase() || '?';

  const avatarRadius = avatarShape === 'circle' ? '9999px' : avatarShape === 'rounded' ? '16px' : '6px';

  const btnBaseStyle: React.CSSProperties = btnStyle === 'outlined'
    ? { border: `2px solid ${primary}`, color: primary, background: 'transparent', borderRadius: radius }
    : btnStyle === 'soft'
    ? { background: `${primary}15`, color: primary, borderRadius: radius }
    : btnStyle === 'pill'
    ? { background: primary, color: bg, borderRadius: '9999px' }
    : { background: primary, color: bg, borderRadius: radius };

  const deviceWidth = deviceView === 'mobile' ? '375px' : deviceView === 'tablet' ? '768px' : '100%';

  const socialLinks = (profile.socialLinks || []) as Array<{ platform: string; url: string }>;
  const visibleSocials = SOCIALS.filter((s: any) =>
    socialLinks.some((l: any) => l.platform === s.id && l.url)
  );

  return (
    <div className="flex-1 overflow-auto bg-slate-100 flex items-start justify-center p-4 sm:p-8">
      <div
        style={{ width: deviceView === 'desktop' ? '100%' : deviceWidth, maxWidth: '900px' }}
        className="shadow-2xl transition-all duration-300"
      >
        {deviceView === 'mobile' ? (
          <div className="rounded-[36px] border-[8px] border-slate-900 overflow-hidden shadow-2xl" style={{ background: bg }}>
            <div className="h-6 bg-slate-900 flex items-center justify-center">
              <div className="w-16 h-2 bg-slate-800 rounded-full" />
            </div>
            <CardContent
              headerStyle={headerStyle} primary={primary} accent={accent} bg={bg}
              surface={surface} textColor={textColor} muted={muted} border={border}
              btnBaseStyle={btnBaseStyle} avatarRadius={avatarRadius}
              initials={initials} profile={profile} font={font} headingFont={headingFont}
              visibleSocials={visibleSocials} radius={radius} components={components} appearance={appearance} />
          </div>
        ) : deviceView === 'tablet' ? (
          <div className="rounded-2xl border-4 border-slate-800 overflow-hidden shadow-2xl" style={{ background: bg }}>
            <div className="h-4 bg-slate-800" />
            <CardContent
              headerStyle={headerStyle} primary={primary} accent={accent} bg={bg}
              surface={surface} textColor={textColor} muted={muted} border={border}
              btnBaseStyle={btnBaseStyle} avatarRadius={avatarRadius}
              initials={initials} profile={profile} font={font} headingFont={headingFont}
              visibleSocials={visibleSocials} radius={radius} components={components} appearance={appearance} />
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden bg-white shadow-xl" style={{ background: bg }}>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-200 border-b border-slate-300/50">
              <div className="flex gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-red-400" />
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400" />
                <div className="w-3.5 h-3.5 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4 px-3 py-1 bg-white rounded-lg text-xs font-mono text-slate-500 truncate">
                connectcard.io/c/{profile.slug}
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </div>
            <div className="max-w-xl mx-auto py-8">
              <CardContent
                headerStyle={headerStyle} primary={primary} accent={accent} bg={bg}
                surface={surface} textColor={textColor} muted={muted} border={border}
                btnBaseStyle={btnBaseStyle} avatarRadius={avatarRadius}
                initials={initials} profile={profile} font={font} headingFont={headingFont}
                visibleSocials={visibleSocials} radius={radius} components={components} appearance={appearance} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════
   MAIN PAGE CONTROLLER
═══════════════════════════════ */
export default function PremiumVisualBuilder() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // State
  const [profile, setProfile] = useState<any>(null);
  const [draft, setDraft] = useState<any>({});
  const [appearance, setAppearance] = useState<Partial<IndustryTemplate>>({
    background: '#FAFAFA', surface: '#FFFFFF', primary: '#1A1A1A',
    secondary: '#374151', accent: '#3B82F6', text: '#111827',
    muted: '#6B7280', border: '#E5E7EB', font: 'Inter',
    headingFont: 'Inter', buttonStyle: 'filled', cardStyle: 'flat',
    borderRadius: '12px', headerStyle: 'centered', avatarShape: 'circle',
    animation: 'subtle',
    showMap: true,
    iconColor: '#FFFFFF',
    iconBg: '#8A509E',
    iconStyle: 'brand',
  });
  const [components, setComponents] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [enabledSocials, setEnabledSocials] = useState<string[]>([]);
  
  // Controls
  const [activeTab, setActiveTab] = useState<EditorTab>('info');
  const [deviceView, setDeviceView] = useState<DeviceView>('mobile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Load profile
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/profiles/${id}`);
        if (!res.ok) { router.push('/dashboard/profiles'); return; }
        const data = await res.json();
        setProfile(data);
        setDraft({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          jobTitle: data.jobTitle || '',
          company: data.company || '',
          bio: data.bio || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          whatsApp: data.whatsApp || '',
        });
        setComponents(data.components || []);
        
        // Parse styling config
        if (data.appearanceJson) {
          try {
            const parsed = JSON.parse(data.appearanceJson);
            setAppearance(prev => ({
              ...prev,
              background: parsed.backgroundColor || parsed.background || prev.background,
              surface: parsed.surfaceColor || parsed.surface || prev.surface,
              primary: parsed.primaryColor || parsed.primary || prev.primary,
              secondary: parsed.secondaryColor || parsed.secondary || prev.secondary,
              accent: parsed.accentColor || parsed.accent || prev.accent,
              text: parsed.textColor || parsed.text || prev.text,
              muted: parsed.mutedColor || parsed.muted || prev.muted,
              border: parsed.borderColor || parsed.border || prev.border,
              font: parsed.fontFamily || parsed.font || prev.font,
              headingFont: parsed.headingFont || parsed.headingFont || prev.headingFont,
              buttonStyle: parsed.buttonStyle || prev.buttonStyle,
              cardStyle: parsed.cardStyle || prev.cardStyle,
              borderRadius: parsed.buttonRadius || parsed.borderRadius || prev.borderRadius,
              headerStyle: parsed.headerStyle || prev.headerStyle,
              avatarShape: parsed.profileImageStyle || parsed.avatarShape || prev.avatarShape,
              animation: parsed.animation || prev.animation,
              showMap: parsed.showMap !== undefined ? Boolean(parsed.showMap) : prev.showMap ?? true,
              iconColor: parsed.iconColor || prev.iconColor || '#FFFFFF',
              iconBg: parsed.iconBg || prev.iconBg || '#8A509E',
              iconStyle: parsed.iconStyle || prev.iconStyle || 'brand',
            }));
          } catch {}
        }
        
        // Load socials
        const socialsMap: Record<string, string> = {};
        const enabledList: string[] = [];
        for (const link of (data.socialLinks || [])) {
          socialsMap[link.platform] = link.url;
          if (link.url) enabledList.push(link.platform);
        }
        setSocialLinks(socialsMap);
        setEnabledSocials(enabledList);
      } catch { router.push('/dashboard/profiles'); }
      finally { setLoading(false); }
    }
    load();
  }, [id, router]);

  // Apply template helper
  const applyTemplate = useCallback((tpl: IndustryTemplate) => {
    setAppearance({
      background: tpl.background, surface: tpl.surface, primary: tpl.primary,
      secondary: tpl.secondary, accent: tpl.accent, text: tpl.text,
      muted: tpl.muted, border: tpl.border, font: tpl.font,
      headingFont: tpl.headingFont, buttonStyle: tpl.buttonStyle,
      cardStyle: tpl.cardStyle, borderRadius: tpl.borderRadius,
      headerStyle: tpl.headerStyle, avatarShape: tpl.avatarShape,
      animation: tpl.animation,
    });
  }, []);

  // Save changes
  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    
    // Save appearance mapping to legacy formats too for backwards compatibility
    const appearanceToSave = {
      ...appearance,
      showMap: appearance.showMap !== false,
      iconColor: appearance.iconColor || '#FFFFFF',
      iconBg: appearance.iconBg || '#8A509E',
      iconStyle: appearance.iconStyle || 'brand',
      backgroundColor: appearance.background,
      surfaceColor: appearance.surface,
      primaryColor: appearance.primary,
      secondaryColor: appearance.secondary,
      accentColor: appearance.accent,
      textColor: appearance.text,
      mutedColor: appearance.muted,
      borderColor: appearance.border,
      fontFamily: appearance.font,
      buttonRadius: appearance.borderRadius,
      profileImageStyle: appearance.avatarShape,
    };

    try {
      const res = await fetch(`/api/profiles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          name: [draft.firstName, draft.lastName].filter(Boolean).join(' ') || profile?.name,
          photoUrl: profile?.photoUrl,
          coverUrl: profile?.coverUrl,
          appearanceJson: JSON.stringify(appearanceToSave),
          socialLinks: Object.entries(socialLinks)
            .filter(([, v]) => v.trim())
            .map(([platform, url]) => ({ platform, url, username: url, isVisible: true })),
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Save failed'); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  }, [id, draft, appearance, socialLinks, profile]);

  // Image Upload handler with client-side compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'photo') setUploadingAvatar(true);
    else setUploadingCover(true);

    try {
      const maxWidth = type === 'photo' ? 600 : 1200;
      const maxHeight = type === 'photo' ? 600 : 600;
      const { dataUrl, blob } = await compressImage(file, maxWidth, maxHeight, 0.85);

      // Instant preview
      setProfile((prev: any) => ({
        ...prev,
        [type === 'photo' ? 'photoUrl' : 'coverUrl']: dataUrl,
      }));

      const formData = new FormData();
      formData.append('file', blob, file.name);
      formData.append('type', type);

      const res = await fetch(`/api/profiles/${id}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setProfile((prev: any) => ({
          ...prev,
          [type === 'photo' ? 'photoUrl' : 'coverUrl']: data.url,
        }));
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch {
      setError('Connection error');
    } finally {
      if (type === 'photo') setUploadingAvatar(false);
      else setUploadingCover(false);
    }
  };

  const handleRemoveImage = async (type: 'photo' | 'cover') => {
    setProfile((prev: any) => ({
      ...prev,
      [type === 'photo' ? 'photoUrl' : 'coverUrl']: null,
    }));
    try {
      await fetch(`/api/profiles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [type === 'photo' ? 'photoUrl' : 'coverUrl']: null,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Add Component call
  const addComponent = async (type: string, title: string) => {
    try {
      const res = await fetch(`/api/profiles/${id}/components`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, icon: 'smartphone', value: '', url: '' }),
      });
      if (res.ok) {
        const newComp = await res.json();
        setComponents(prev => [...prev, newComp]);
      }
    } catch {
      setError('Failed to add block');
    }
  };

  // Delete Component call
  const deleteComponent = async (compId: string) => {
    try {
      const res = await fetch(`/api/profiles/${id}/components/${compId}`, { method: 'DELETE' });
      if (res.ok) {
        setComponents(prev => prev.filter(c => c.id !== compId));
      }
    } catch {
      setError('Failed to remove block');
    }
  };

  // Update component value or visibility
  const updateComponent = async (compId: string, fields: any) => {
    try {
      const res = await fetch(`/api/profiles/${id}/components/${compId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        const updated = await res.json();
        setComponents(prev => prev.map(c => c.id === compId ? updated : c));
      }
    } catch {
      setError('Failed to update block');
    }
  };

  // Component Reordering Sorters
  const moveComponent = async (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= components.length) return;

    const list = [...components];
    const temp = list[index];
    list[index] = list[nextIndex];
    list[nextIndex] = temp;

    setComponents(list);

    try {
      await fetch(`/api/profiles/${id}/components/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentIds: list.map(c => c.id) }),
      });
    } catch {
      setError('Failed to save reorder position');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  const filteredTemplates = INDUSTRY_TEMPLATES.filter(t =>
    t.isPublished && (!templateSearch || t.name.toLowerCase().includes(templateSearch.toLowerCase()) || t.industry.toLowerCase().includes(templateSearch.toLowerCase()))
  );

  const previewProfile = {
    ...profile,
    ...draft,
    socialLinks: Object.entries(socialLinks).filter(([,v]) => v).map(([k,v]) => ({ platform: k, url: v, isVisible: true }))
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col z-50 overflow-hidden"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* TOP HEADER */}
      <header className="shrink-0 h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 z-30">
        <Link href="/dashboard/profiles"
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold shrink-0">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="w-px h-5 bg-slate-200 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">
            {[draft.firstName, draft.lastName].filter(Boolean).join(' ') || profile?.name || 'Edit Card'}
          </p>
        </div>

        {/* Device views */}
        <div className="hidden md:flex items-center gap-0.5 p-1 bg-slate-100 rounded-xl shrink-0">
          {([['mobile', Smartphone], ['tablet', Tablet], ['desktop', Monitor]] as const).map(([view, Icon]) => (
            <button key={view} onClick={() => setDeviceView(view)}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${deviceView === view ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        <Link href={`/c/${profile?.slug}`} target="_blank"
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all shrink-0">
          <Eye className="w-4 h-4" /> Preview
        </Link>

        {error && <span className="text-xs text-red-500 hidden md:block max-w-[150px] truncate">{error}</span>}
        <button onClick={handleSave} disabled={saving}
          className={`shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            saved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-850 hover:shadow-lg'
          }`}>
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}</span>
        </button>
      </header>

      {/* WORKSPACE */}
      <div className="flex-1 flex min-h-0">
        
        {/* LEFT COLUMN PANEL */}
        <div className="w-[310px] xl:w-[350px] shrink-0 flex flex-col bg-white border-r border-slate-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto shrink-0 scrollbar-none">
            {([
              ['info',       'Info',      User],
              ['contact',    'Contact',   Phone],
              ['social',     'Social',    Globe],
              ['design',     'Design',    Palette],
              ['components', 'Blocks',    Layers],
            ] as [EditorTab, string, any][]).map(([t, label, Icon]) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`flex flex-col items-center gap-1 px-2.5 py-2.5 text-[9px] font-extrabold border-b-2 transition-all flex-1 whitespace-nowrap cursor-pointer ${
                  activeTab === t ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Form container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* 1. INFO TAB */}
            {activeTab === 'info' && (<>
              <div className="grid grid-cols-2 gap-3">
                {/* Photo upload */}
                <div className="space-y-1.5 col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avatar Image</label>
                    {profile?.photoUrl && (
                      <button type="button" onClick={() => handleRemoveImage('photo')} className="text-[10px] text-red-500 hover:text-red-700 font-semibold flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-dashed border-slate-200 hover:border-slate-400 rounded-xl cursor-pointer transition-colors relative">
                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'photo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
                      {uploadingAvatar ? (
                        <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
                      ) : profile?.photoUrl ? (
                        <img src={profile.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{profile?.photoUrl ? 'Replace avatar' : 'Upload avatar'}</p>
                      <p className="text-[10px] text-slate-400">Square recommended · Auto-optimized</p>
                    </div>
                  </div>
                </div>

                {/* Cover upload */}
                <div className="space-y-1.5 col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cover Banner</label>
                    {profile?.coverUrl && (
                      <button type="button" onClick={() => handleRemoveImage('cover')} className="text-[10px] text-red-500 hover:text-red-700 font-semibold flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 p-3 border border-dashed border-slate-200 hover:border-slate-400 rounded-xl cursor-pointer transition-colors relative">
                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'cover')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="w-16 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
                      {uploadingCover ? (
                        <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
                      ) : profile?.coverUrl ? (
                        <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{profile?.coverUrl ? 'Replace cover banner' : 'Upload cover banner'}</p>
                      <p className="text-[10px] text-slate-400">Landscape banner aspect · Auto-optimized</p>
                    </div>
                  </div>
                </div>

                {/* Name fields */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                  <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-lg text-xs outline-none transition-all"
                    placeholder="Ahmed" value={draft.firstName || ''} onChange={e => setDraft((p: any) => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                  <input className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-lg text-xs outline-none transition-all"
                    placeholder="Al-Rashid" value={draft.lastName || ''} onChange={e => setDraft((p: any) => ({ ...p, lastName: e.target.value }))} />
                </div>

                {/* Job / Company */}
                <div className="space-y-1.5 col-span-2">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Job Title</label>
                  <input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-lg text-xs outline-none transition-all"
                    placeholder="CEO, Doctor, Designer…" value={draft.jobTitle || ''} onChange={e => setDraft((p: any) => ({ ...p, jobTitle: e.target.value }))} />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Company / Organisation</label>
                  <input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-lg text-xs outline-none transition-all"
                    placeholder="Acme Corp" value={draft.company || ''} onChange={e => setDraft((p: any) => ({ ...p, company: e.target.value }))} />
                </div>

                {/* Bio */}
                <div className="space-y-1.5 col-span-2">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Bio / Description</label>
                  <textarea rows={3} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-lg text-xs outline-none transition-all resize-none"
                    placeholder="Tell visitors about your professional profile…" value={draft.bio || ''} onChange={e => setDraft((p: any) => ({ ...p, bio: e.target.value }))} />
                </div>
              </div>
            </>)}

            {/* 2. CONTACT DETAILS */}
            {activeTab === 'contact' && (<>
              {[
                { key: 'phone',    label: 'Phone number', placeholder: '+123 456 789' },
                { key: 'email',    label: 'Email address', placeholder: 'me@example.com' },
                { key: 'website',  label: 'Website link', placeholder: 'https://...' },
                { key: 'whatsApp', label: 'WhatsApp', placeholder: '+123 456 789' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                  <input className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-lg text-xs outline-none transition-all"
                    placeholder={placeholder} value={draft[key] || ''} onChange={e => setDraft((p: any) => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}

              {/* GOOGLE MAPS CONTROLLER WITH CANCEL / DISABLE BUTTON */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-3 mt-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${appearance.showMap !== false ? 'bg-red-500/10 text-red-500' : 'bg-slate-200 text-slate-400'}`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Google Maps (خريطة الموقع)</span>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {appearance.showMap !== false ? 'مفعلة وتظهر في بطاقتك' : 'تم إلغاء وتعطيل الخريطة'}
                      </span>
                    </div>
                  </div>

                  {/* CANCEL / ENABLE BUTTON */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = appearance.showMap === false ? true : false;
                      setAppearance(p => ({ ...p, showMap: next }));
                      const mapComp = components.find(c => c.type.toLowerCase() === 'googlemap');
                      if (mapComp) {
                        updateComponent(mapComp.id, { isVisible: next });
                      } else if (next) {
                        addComponent('GoogleMap', 'Location Map');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      appearance.showMap === false
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                    }`}
                  >
                    {appearance.showMap === false ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>الخريطة ملغاة (إعادة التفعيل)</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span>مفعلة (إلغاء الخريطة)</span>
                      </>
                    )}
                  </button>
                </div>

                {appearance.showMap !== false && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">عنوان أو رابط الخريطة</label>
                    <input
                      type="text"
                      placeholder="مثال: Marrakech, Maroc أو رابط خرائط Google"
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-xs outline-none transition-all"
                      value={(() => {
                        const mc = components.find(c => c.type.toLowerCase() === 'googlemap');
                        return mc?.value || draft.location || '';
                      })()}
                      onChange={e => {
                        const val = e.target.value;
                        const mapComp = components.find(c => c.type.toLowerCase() === 'googlemap');
                        if (mapComp) {
                          const list = [...components];
                          const idx = list.findIndex(c => c.id === mapComp.id);
                          if (idx !== -1) {
                            list[idx].value = val;
                            setComponents(list);
                          }
                        }
                      }}
                      onBlur={e => {
                        const val = e.target.value;
                        const mapComp = components.find(c => c.type.toLowerCase() === 'googlemap');
                        if (mapComp) {
                          updateComponent(mapComp.id, { value: val });
                        } else if (val) {
                          fetch(`/api/profiles/${id}/components`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ type: 'GoogleMap', title: 'Location Map', icon: 'map-pin', value: val, url: val }),
                          }).then(res => res.json()).then(newComp => {
                            if (newComp?.id) setComponents(prev => [...prev, newComp]);
                          });
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </>)}

            {/* 3. SOCIAL LINKS */}
            {activeTab === 'social' && (
              <div className="space-y-2.5">
                {SOCIALS.map(s => {
                  const enabled = enabledSocials.includes(s.id);
                  return (
                    <div key={s.id} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between p-2.5 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-black shrink-0" style={{ background: s.color }}>
                            {s.letter}
                          </div>
                          <span className="text-xs font-bold text-slate-750">{s.label}</span>
                        </div>
                        <button type="button" onClick={() => setEnabledSocials(p => p.includes(s.id) ? p.filter(x => x !== s.id) : [...p, s.id])}
                          className={`w-8 h-4.5 rounded-full relative transition-all ${enabled ? 'bg-slate-900' : 'bg-slate-200'}`}>
                          <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${enabled ? 'left-[16px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                      {enabled && (
                        <div className="p-2.5 border-t border-slate-100">
                          <input className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400 focus:bg-white"
                            placeholder={`${s.label} Link or handle`} value={socialLinks[s.id] || ''} onChange={e => setSocialLinks(p => ({ ...p, [s.id]: e.target.value }))} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4. DESIGN TAB */}
            {activeTab === 'design' && (<>
              {/* Template catalog search */}
              <div className="space-y-2">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Apply Industry Template</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400 focus:bg-white"
                    placeholder="Search industry templates…" value={templateSearch} onChange={e => setTemplateSearch(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {filteredTemplates.map(tpl => (
                    <button key={tpl.id} type="button" onClick={() => applyTemplate(tpl)}
                      className={`relative border rounded-xl overflow-hidden text-left p-1.5 transition-all hover:-translate-y-0.5 cursor-pointer ${
                        appearance.primary === tpl.primary && appearance.background === tpl.background
                          ? 'border-slate-900 shadow-md' : 'border-slate-200 hover:border-slate-400'
                      }`}>
                      <div className="h-10 rounded-lg mb-1.5 flex items-center justify-center text-[10px] font-black text-white" style={{ background: tpl.background, color: tpl.text }}>
                        Aa
                      </div>
                      <p className="text-[10px] font-extrabold text-slate-800 truncate">{tpl.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual color pickers */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Colors & Fonts</label>
                {[
                  { key: 'background', label: 'Page Background' },
                  { key: 'surface',    label: 'Card Surface' },
                  { key: 'primary',    label: 'Primary Accent' },
                  { key: 'text',       label: 'Body Text' },
                  { key: 'iconColor',  label: 'Icon Color (لون الأيقونات)' },
                  { key: 'iconBg',     label: 'Icon Background (خلفية الأيقونات)' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-semibold">{label}</span>
                    <input type="color" value={(appearance as any)[key] || (key === 'iconColor' ? '#FFFFFF' : key === 'iconBg' ? '#8A509E' : '#000000')}
                      onChange={e => setAppearance(p => ({ ...p, [key]: e.target.value }))}
                      className="w-7 h-7 rounded border border-slate-200 cursor-pointer" />
                  </div>
                ))}
              </div>

              {/* Icon Style Selector */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Icon Style (نمط الأيقونات)</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'brand',      label: 'Brand Colors (ألوان التطبيقات)' },
                    { id: 'unified',    label: 'Custom Color (لون موحد مخصص)' },
                    { id: 'gradient',   label: 'Brand Gradient (تدرج بنفسجي)' },
                    { id: 'glass',      label: 'Glassmorphism (زجاجي شفاف)' },
                  ].map(styleOpt => (
                    <button
                      key={styleOpt.id}
                      type="button"
                      onClick={() => setAppearance(p => ({ ...p, iconStyle: styleOpt.id as any }))}
                      className={`py-2 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer text-center ${
                        (appearance.iconStyle || 'brand') === styleOpt.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {styleOpt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout styles */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Header Layout</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['centered', 'left', 'hero', 'cover'] as const).map(s => (
                    <button key={s} type="button" onClick={() => setAppearance(p => ({ ...p, headerStyle: s }))}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border capitalize transition-all cursor-pointer ${
                        appearance.headerStyle === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                      }`}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Button Styling</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['filled', 'outlined', 'soft', 'pill'] as const).map(s => (
                    <button key={s} type="button" onClick={() => setAppearance(p => ({ ...p, buttonStyle: s }))}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border capitalize transition-all cursor-pointer ${
                        appearance.buttonStyle === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
            </>)}

            {/* 5. BLOCKS & COMPONENTS */}
            {activeTab === 'components' && (<>
              <div className="space-y-3">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Add Custom Blocks</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { type: 'Phone', title: 'Phone Call' },
                    { type: 'WhatsApp', title: 'WhatsApp' },
                    { type: 'Email', title: 'Send Email' },
                    { type: 'Website', title: 'Website' },
                    { type: 'GoogleMap', title: 'Location Map' },
                    { type: 'GoogleReview', title: 'Google Reviews' },
                    { type: 'Image', title: 'Photo Block' },
                    { type: 'Video', title: 'Video Player' },
                  ].map(b => (
                    <button key={b.type} type="button" onClick={() => addComponent(b.type, b.title)}
                      className="py-2.5 px-3 border border-slate-200 rounded-xl text-left text-xs font-bold hover:bg-slate-50 cursor-pointer flex items-center gap-1.5 transition-all">
                      <Plus className="w-3.5 h-3.5 text-slate-400" />
                      {b.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Active Blocks</label>
                {components.length === 0 ? (
                  <p className="text-[10px] text-slate-400 text-center py-6">No custom blocks added yet</p>
                ) : (
                  <div className="space-y-2">
                    {components.map((comp, idx) => (
                      <div key={comp.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {/* Sorters */}
                            <div className="flex flex-col">
                              <button type="button" onClick={() => moveComponent(idx, 'up')} disabled={idx === 0}
                                className="p-0.5 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                              <button type="button" onClick={() => moveComponent(idx, 'down')} disabled={idx === components.length - 1}
                                className="p-0.5 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold block truncate">{comp.title}</span>
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold block">{comp.type}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            <button type="button" onClick={() => updateComponent(comp.id, { isVisible: !comp.isVisible })}
                              className="p-1 text-slate-400 hover:text-slate-700">
                              {comp.isVisible ? <Eye className="w-3.5 h-3.5 text-slate-650" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button type="button" onClick={() => deleteComponent(comp.id)}
                              className="p-1 text-slate-450 hover:text-red-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Inline input editors for title & value */}
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="Block Title (e.g. Call Me)"
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] outline-none focus:border-slate-450"
                            value={comp.title || ''}
                            onChange={e => {
                              const list = [...components];
                              list[idx].title = e.target.value;
                              setComponents(list);
                            }}
                            onBlur={e => updateComponent(comp.id, { title: e.target.value })}
                          />
                          {comp.type.toLowerCase() === 'image' ? (
                            <div className="space-y-2 pt-1">
                              {comp.value && (
                                <div className="relative w-full h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                  <img src={comp.value} alt="Preview" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const list = [...components];
                                      list[idx].value = '';
                                      setComponents(list);
                                      updateComponent(comp.id, { value: '' });
                                    }}
                                    className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-black text-white rounded-lg text-xs"
                                    title="حذف الصورة"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                              <label className="flex items-center justify-center gap-2 py-2 px-3 bg-white border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-all">
                                <Camera className="w-4 h-4 text-[#8A509E]" />
                                <span>رفع صورة من الجهاز (Upload Photo)</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      const { dataUrl, blob } = await compressImage(file, 1200, 1200, 0.85);
                                      const list = [...components];
                                      list[idx].value = dataUrl;
                                      setComponents(list);

                                      const formData = new FormData();
                                      formData.append('file', blob, file.name);
                                      formData.append('type', 'photo');

                                      const res = await fetch(`/api/profiles/${id}/upload`, {
                                        method: 'POST',
                                        body: formData,
                                      });
                                      const data = await res.json();
                                      if (res.ok && data.url) {
                                        list[idx].value = data.url;
                                        setComponents([...list]);
                                        updateComponent(comp.id, { value: data.url });
                                      }
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                />
                              </label>
                              <input
                                type="text"
                                placeholder="أو رابط ويب / Pinterest / صورة مباشرة..."
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] outline-none focus:border-slate-450"
                                value={comp.value || ''}
                                onChange={e => {
                                  const list = [...components];
                                  list[idx].value = e.target.value;
                                  setComponents(list);
                                }}
                                onBlur={e => updateComponent(comp.id, { value: e.target.value })}
                              />
                            </div>
                          ) : comp.type.toLowerCase() !== 'googlereview' && (
                            <input
                              type="text"
                              placeholder={
                                comp.type.toLowerCase() === 'googlemap' ? 'Address (e.g. London, UK)' :
                                comp.type.toLowerCase() === 'video' ? 'YouTube Video URL' :
                                'Value or Link'
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] outline-none focus:border-slate-450"
                              value={comp.value || ''}
                              onChange={e => {
                                const list = [...components];
                                list[idx].value = e.target.value;
                                setComponents(list);
                              }}
                              onBlur={e => updateComponent(comp.id, { value: e.target.value })}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>)}
          </div>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="flex-1 flex flex-col min-w-0">
          <LiveCardPreview
            profile={previewProfile}
            appearance={appearance}
            deviceView={deviceView}
            components={components}
          />
        </div>
      </div>
    </div>
  );
}
