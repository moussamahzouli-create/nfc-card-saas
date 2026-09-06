'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Eye, Smartphone, Monitor, Tablet,
  User, Phone, Globe, Palette, Plus, Trash2, Check,
  AlertCircle, RefreshCw, Mail, MapPin, Briefcase,
  ChevronUp, ChevronDown, GripVertical, Settings,
  Camera, Layers, Search, Zap, ExternalLink
} from 'lucide-react';
import { INDUSTRY_TEMPLATES, type IndustryTemplate, templateToCssVars } from '@/lib/templates/industry-templates';

/* ═══════════════════════════════
   TYPES
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
];

/* ═══════════════════════════════
   LIVE PREVIEW COMPONENT
═══════════════════════════════ */
function LiveCardPreview({
  profile, appearance, deviceView
}: {
  profile: any;
  appearance: Partial<IndustryTemplate>;
  deviceView: DeviceView;
}) {
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

  const initials = [profile.firstName, profile.lastName]
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
  const visibleSocials = SOCIALS.filter(s =>
    socialLinks.some(l => l.platform === s.id && l.url)
  );

  return (
    <div className="flex-1 overflow-auto bg-slate-100 flex items-start justify-center p-4 sm:p-8">
      <div
        style={{ width: deviceView === 'desktop' ? '100%' : deviceWidth, maxWidth: '900px', fontFamily: `${font}, system-ui, sans-serif` }}
        className="shadow-2xl overflow-hidden"
        // Apply rounded corners for mobile frame
      >
        {/* Mobile device frame */}
        {deviceView === 'mobile' && (
          <div className="rounded-[36px] border-[6px] border-slate-800 overflow-hidden shadow-2xl"
            style={{ background: bg }}>
            {/* Notch */}
            <div className="h-6 bg-slate-800 flex items-center justify-center">
              <div className="w-16 h-1.5 bg-slate-700 rounded-full" />
            </div>
            <div style={{ background: bg }}>
              <CardContent
                headerStyle={headerStyle} primary={primary} accent={accent} bg={bg}
                surface={surface} textColor={textColor} muted={muted} border={border}
                btnBaseStyle={btnBaseStyle} avatarRadius={avatarRadius}
                initials={initials} profile={profile} font={font} headingFont={headingFont}
                visibleSocials={visibleSocials} radius={radius} />
            </div>
          </div>
        )}

        {/* Tablet frame */}
        {deviceView === 'tablet' && (
          <div className="rounded-2xl border-4 border-slate-700 overflow-hidden shadow-2xl"
            style={{ background: bg }}>
            <div className="h-4 bg-slate-700" />
            <CardContent
              headerStyle={headerStyle} primary={primary} accent={accent} bg={bg}
              surface={surface} textColor={textColor} muted={muted} border={border}
              btnBaseStyle={btnBaseStyle} avatarRadius={avatarRadius}
              initials={initials} profile={profile} font={font} headingFont={headingFont}
              visibleSocials={visibleSocials} radius={radius} />
          </div>
        )}

        {/* Desktop */}
        {deviceView === 'desktop' && (
          <div className="rounded-xl overflow-hidden" style={{ background: bg }}>
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4 px-3 py-1 bg-white rounded-lg text-[11px] font-mono text-slate-500 truncate">
                connectcard.io/c/{profile.slug || 'your-slug'}
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="max-w-2xl mx-auto px-8 py-6">
              <CardContent
                headerStyle={headerStyle} primary={primary} accent={accent} bg={bg}
                surface={surface} textColor={textColor} muted={muted} border={border}
                btnBaseStyle={btnBaseStyle} avatarRadius={avatarRadius}
                initials={initials} profile={profile} font={font} headingFont={headingFont}
                visibleSocials={visibleSocials} radius={radius} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CardContent({ headerStyle, primary, accent, bg, surface, textColor, muted, border,
  btnBaseStyle, avatarRadius, initials, profile, font, headingFont, visibleSocials, radius }: any) {

  return (
    <div style={{ background: bg, color: textColor }}>
      {/* COVER */}
      {(headerStyle === 'hero' || headerStyle === 'cover') ? (
        <div className="relative w-full h-40 flex items-end"
          style={{ background: `linear-gradient(145deg, ${primary}CC, ${accent}80)` }}>
          <div className="absolute inset-0 bg-black/20" />
          {headerStyle === 'hero' && (
            <div className="relative z-10 p-6 w-full">
              <div className="w-16 h-16 rounded-xl border-2 border-white/30 flex items-center justify-center font-black text-xl mb-3"
                style={{ background: `${primary}40`, color: 'white', borderRadius: avatarRadius }}>
                {profile.photoUrl ? <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" style={{ borderRadius: avatarRadius }} /> : initials}
              </div>
              <h1 className="text-xl font-black text-white" style={{ fontFamily: `${headingFont}, system-ui` }}>
                {[profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.name || 'Your Name'}
              </h1>
              {(profile.jobTitle || profile.company) && (
                <p className="text-white/70 text-sm mt-0.5">
                  {[profile.jobTitle, profile.company].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          )}
          {headerStyle === 'cover' && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-10">
              <div className="w-20 h-20 border-4 border-white flex items-center justify-center font-black text-2xl shadow-lg"
                style={{ background: `${primary}30`, color: primary, borderRadius: avatarRadius }}>
                {profile.photoUrl ? <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" style={{ borderRadius: avatarRadius }} /> : initials}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* BODY */}
      <div className={`px-5 pb-8 flex flex-col gap-4 ${headerStyle === 'cover' ? 'pt-12' : 'pt-5'}`}>
        {/* Centered profile (non-hero) */}
        {(headerStyle === 'centered' || headerStyle === 'minimal') && (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="relative">
              <div className="absolute -inset-1.5 rounded-full blur-sm opacity-40"
                style={{ background: primary, borderRadius: avatarRadius }} />
              <div className="relative w-20 h-20 border-2 border-white/20 flex items-center justify-center font-black text-2xl shadow-lg"
                style={{ background: `linear-gradient(135deg, ${primary}50, ${accent}30)`, color: primary, borderRadius: avatarRadius }}>
                {profile.photoUrl ? <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" style={{ borderRadius: avatarRadius }} /> : initials}
              </div>
            </div>
            <h1 className="text-xl font-black text-center mt-1" style={{ color: textColor, fontFamily: `${headingFont}, system-ui` }}>
              {[profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.name || 'Your Name'}
            </h1>
            {(profile.jobTitle || profile.company) && (
              <p className="text-sm font-semibold text-center" style={{ color: primary }}>
                {[profile.jobTitle, profile.company].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        )}

        {/* Left profile */}
        {headerStyle === 'left' && (
          <div className="flex items-center gap-4 py-2">
            <div className="w-16 h-16 flex items-center justify-center font-black text-xl shrink-0"
              style={{ background: `${primary}20`, color: primary, borderRadius: avatarRadius }}>
              {profile.photoUrl ? <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" style={{ borderRadius: avatarRadius }} /> : initials}
            </div>
            <div>
              <h1 className="text-lg font-black" style={{ color: textColor, fontFamily: `${headingFont}, system-ui` }}>
                {[profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.name || 'Your Name'}
              </h1>
              {(profile.jobTitle || profile.company) && (
                <p className="text-sm font-semibold" style={{ color: primary }}>
                  {[profile.jobTitle, profile.company].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cover bottom name (if cover style) */}
        {headerStyle === 'cover' && (
          <div className="text-center">
            <h1 className="text-xl font-black" style={{ color: textColor, fontFamily: `${headingFont}, system-ui` }}>
              {[profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.name || 'Your Name'}
            </h1>
            {(profile.jobTitle || profile.company) && (
              <p className="text-sm font-semibold mt-0.5" style={{ color: primary }}>
                {[profile.jobTitle, profile.company].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm leading-relaxed text-center max-w-sm mx-auto" style={{ color: muted }}>
            {profile.bio}
          </p>
        )}

        {/* CTA buttons */}
        <div className="grid grid-cols-2 gap-2">
          {profile.phone && (
            <div className="flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-bold cursor-pointer"
              style={btnBaseStyle}>
              <Phone className="w-3.5 h-3.5" /> Call
            </div>
          )}
          {profile.email && (
            <div className="flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-bold cursor-pointer"
              style={btnBaseStyle}>
              <Mail className="w-3.5 h-3.5" /> Email
            </div>
          )}
          {profile.whatsApp && (
            <div className="flex items-center justify-center gap-1.5 py-2.5 px-4 text-sm font-bold cursor-pointer col-span-2"
              style={{ ...btnBaseStyle, background: '#25D366', color: 'white', borderColor: '#25D366' }}>
              WhatsApp
            </div>
          )}
        </div>

        {/* Contact info */}
        <div className="space-y-2">
          {profile.phone && (
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${primary}08`, border: `1px solid ${primary}15` }}>
              <Phone className="w-4 h-4 shrink-0" style={{ color: primary }} />
              <span className="text-sm" style={{ color: textColor }}>{profile.phone}</span>
            </div>
          )}
          {profile.email && (
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${primary}08`, border: `1px solid ${primary}15` }}>
              <Mail className="w-4 h-4 shrink-0" style={{ color: primary }} />
              <span className="text-sm truncate" style={{ color: textColor }}>{profile.email}</span>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${primary}08`, border: `1px solid ${primary}15` }}>
              <Globe className="w-4 h-4 shrink-0" style={{ color: primary }} />
              <span className="text-sm truncate" style={{ color: textColor }}>{profile.website}</span>
            </div>
          )}
        </div>

        {/* Social links */}
        {visibleSocials.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center py-1">
            {visibleSocials.map((s: typeof SOCIALS[0]) => (
              <div key={s.id}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white cursor-pointer hover:scale-110 transition-transform"
                style={{ background: s.color }}>
                {s.letter}
              </div>
            ))}
          </div>
        )}

        {/* Save Contact button */}
        <div className="py-3 text-center font-extrabold text-sm text-white rounded-xl mt-2 cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${primary}, ${accent})`, borderRadius: radius }}>
          💾 Save Contact
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════
   MAIN EDITOR
═══════════════════════════════ */
export default function ProfileEditor() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [draft, setDraft] = useState<any>({});
  const [appearance, setAppearance] = useState<Partial<IndustryTemplate>>({
    background: '#FAFAFA', surface: '#FFFFFF', primary: '#1A1A1A',
    secondary: '#374151', accent: '#3B82F6', text: '#111827',
    muted: '#6B7280', border: '#E5E7EB', font: 'Inter',
    headingFont: 'Inter', buttonStyle: 'filled', cardStyle: 'flat',
    borderRadius: '12px', headerStyle: 'centered', avatarShape: 'circle',
    animation: 'subtle',
  });

  const [activeTab, setActiveTab] = useState<EditorTab>('info');
  const [deviceView, setDeviceView] = useState<DeviceView>('mobile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [enabledSocials, setEnabledSocials] = useState<string[]>([]);
  const [templateSearch, setTemplateSearch] = useState('');

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
        // Load appearance
        if (data.appearanceJson) {
          try { setAppearance(prev => ({ ...prev, ...JSON.parse(data.appearanceJson) })); } catch {}
        }
        // Load social links
        const socials: Record<string, string> = {};
        const enabled: string[] = [];
        for (const link of (data.socialLinks || [])) {
          socials[link.platform] = link.url;
          if (link.url) enabled.push(link.platform);
        }
        setSocialLinks(socials);
        setEnabledSocials(enabled);
      } catch { router.push('/dashboard/profiles'); }
      finally { setLoading(false); }
    }
    load();
  }, [id, router]);

  // Merge draft into profile for live preview
  const previewProfile = { ...profile, ...draft, socialLinks: Object.entries(socialLinks).filter(([,v]) => v).map(([k,v]) => ({ platform: k, url: v })) };

  // Apply template
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

  // Save
  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await fetch(`/api/profiles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          name: [draft.firstName, draft.lastName].filter(Boolean).join(' ') || profile?.name,
          appearanceJson: JSON.stringify(appearance),
          socialLinks: Object.entries(socialLinks)
            .filter(([, v]) => v.trim())
            .map(([platform, url]) => ({ platform, url, username: url })),
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Save failed'); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  }, [id, draft, appearance, socialLinks, profile]);

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

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col z-50 overflow-hidden"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* TOP BAR */}
      <header className="shrink-0 h-13 bg-white border-b border-slate-200 flex items-center px-4 gap-3 z-30">
        <Link href="/dashboard/profiles"
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium group shrink-0">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:block">Back</span>
        </Link>

        <div className="w-px h-5 bg-slate-200 shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">
            {[draft.firstName, draft.lastName].filter(Boolean).join(' ') || profile?.name || 'Edit Card'}
          </p>
          <p className="text-[10px] text-slate-400 font-mono truncate hidden sm:block">
            /c/{profile?.slug}
          </p>
        </div>

        {/* Device toggle */}
        <div className="hidden md:flex items-center gap-0.5 p-1 bg-slate-100 rounded-lg shrink-0">
          {([['mobile', Smartphone], ['tablet', Tablet], ['desktop', Monitor]] as const).map(([v, Icon]) => (
            <button key={v} onClick={() => setDeviceView(v)}
              className={`p-1.5 rounded-md transition-all ${deviceView === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Public preview */}
        <Link href={`/c/${profile?.slug}`} target="_blank"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-400 text-xs font-semibold transition-all shrink-0">
          <Eye className="w-3.5 h-3.5" /> Preview
        </Link>

        {/* Save */}
        {error && <p className="text-xs text-red-500 hidden md:block truncate max-w-[140px]">{error}</p>}
        <button onClick={handleSave} disabled={saving}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg disabled:opacity-50'
          }`}>
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span className="hidden sm:block">{saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}</span>
        </button>
      </header>

      {/* BODY */}
      <div className="flex-1 flex min-h-0">

        {/* ── LEFT SIDEBAR ── */}
        <div className="w-[300px] xl:w-[340px] shrink-0 flex flex-col bg-white border-r border-slate-200 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-slate-200 overflow-x-auto shrink-0">
            {([
              ['info',       'Info',      User],
              ['contact',    'Contact',   Phone],
              ['social',     'Social',    Globe],
              ['design',     'Design',    Palette],
              ['components', 'Blocks',    Layers],
            ] as [EditorTab, string, any][]).map(([t, label, Icon]) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2.5 text-[10px] font-bold border-b-2 transition-all flex-1 whitespace-nowrap ${
                  activeTab === t
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* INFO TAB */}
            {activeTab === 'info' && (<>
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Profile Photo</label>
                <div className="flex items-center gap-3 p-3 border border-dashed border-slate-200 rounded-xl hover:border-slate-400 cursor-pointer transition-colors">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Camera className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Upload photo</p>
                    <p className="text-[10px] text-slate-400">JPG, PNG · Max 2MB</p>
                  </div>
                </div>
              </div>

              {[
                { key: 'firstName', label: 'First Name', placeholder: 'Ahmed' },
                { key: 'lastName',  label: 'Last Name',  placeholder: 'Al-Rashid' },
                { key: 'jobTitle',  label: 'Job Title',  placeholder: 'CEO, Doctor…' },
                { key: 'company',   label: 'Company',    placeholder: 'Acme Corp' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                  <input
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                    placeholder={placeholder}
                    value={draft[key] || ''}
                    onChange={e => setDraft((p: any) => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bio</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all resize-none"
                  placeholder="Brief introduction about yourself or business…"
                  value={draft.bio || ''}
                  onChange={e => setDraft((p: any) => ({ ...p, bio: e.target.value }))}
                />
              </div>
            </>)}

            {/* CONTACT TAB */}
            {activeTab === 'contact' && (<>
              {[
                { key: 'phone',   label: 'Phone',     placeholder: '+1 234 567 8900',   icon: Phone },
                { key: 'email',   label: 'Email',     placeholder: 'name@example.com',  icon: Mail },
                { key: 'website', label: 'Website',   placeholder: 'https://...',        icon: Globe },
                { key: 'whatsApp',label: 'WhatsApp',  placeholder: '+1 234 567 8900',   icon: Phone },
              ].map(({ key, label, placeholder, icon: Icon }) => (
                <div key={key} className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                  <div className="flex items-center border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-slate-400 rounded-lg overflow-hidden transition-all">
                    <Icon className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
                    <input
                      className="flex-1 px-2.5 py-2.5 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
                      placeholder={placeholder}
                      value={draft[key] || ''}
                      onChange={e => setDraft((p: any) => ({ ...p, [key]: e.target.value }))}
                    />
                  </div>
                </div>
              ))}
            </>)}

            {/* SOCIAL TAB */}
            {activeTab === 'social' && (
              <div className="space-y-2">
                {SOCIALS.map(s => {
                  const enabled = enabledSocials.includes(s.id);
                  return (
                    <div key={s.id} className={`rounded-xl border transition-all overflow-hidden ${enabled ? 'border-slate-200' : 'border-slate-100'}`}>
                      <div className="flex items-center gap-2.5 px-3 py-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0"
                          style={{ background: s.color }}>
                          {s.letter}
                        </div>
                        <span className="flex-1 text-xs font-semibold text-slate-700">{s.label}</span>
                        <button type="button"
                          onClick={() => setEnabledSocials(p => p.includes(s.id) ? p.filter(x => x !== s.id) : [...p, s.id])}
                          className={`w-8 h-4 rounded-full relative transition-all duration-300 ${enabled ? 'bg-slate-900' : 'bg-slate-200'}`}>
                          <div className={`w-3.5 h-3.5 rounded-full bg-white shadow absolute top-0.5 transition-all duration-300 ${enabled ? 'left-[18px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                      {enabled && (
                        <div className="px-3 pb-2.5">
                          <input
                            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-slate-400 transition-colors"
                            placeholder={`Enter ${s.label} URL or username`}
                            value={socialLinks[s.id] || ''}
                            onChange={e => setSocialLinks(p => ({ ...p, [s.id]: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* DESIGN TAB */}
            {activeTab === 'design' && (<>
              {/* Template search */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Apply Template</label>
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-slate-400 transition-colors"
                    placeholder="Search templates…"
                    value={templateSearch}
                    onChange={e => setTemplateSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {filteredTemplates.map(tpl => (
                    <button key={tpl.id} type="button" onClick={() => applyTemplate(tpl)}
                      className={`relative rounded-xl border overflow-hidden text-left transition-all hover:-translate-y-0.5 ${
                        appearance.primary === tpl.primary && appearance.background === tpl.background
                          ? 'border-slate-900 shadow-md' : 'border-slate-200 hover:border-slate-400'
                      }`}>
                      <div className="h-12" style={{ background: tpl.background }}>
                        <div className="h-6 w-full" style={{ background: `linear-gradient(135deg, ${tpl.primary}50, ${tpl.accent}30)` }} />
                        <div className="flex items-center gap-1 px-2 mt-1">
                          <div className="w-3 h-3 rounded-full" style={{ background: tpl.primary }} />
                          <div className="w-3 h-3 rounded-full" style={{ background: tpl.accent }} />
                        </div>
                      </div>
                      <div className="px-2 py-1.5 bg-white">
                        <p className="text-[9px] font-bold text-slate-800 truncate">{tpl.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Colors</label>
                <div className="space-y-2">
                  {[
                    { key: 'background', label: 'Background' },
                    { key: 'primary',    label: 'Primary' },
                    { key: 'accent',     label: 'Accent' },
                    { key: 'text',       label: 'Text' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">{(appearance as any)[key]}</span>
                        <input type="color"
                          value={(appearance as any)[key] || '#000000'}
                          onChange={e => setAppearance(p => ({ ...p, [key]: e.target.value }))}
                          className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Header Style</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['centered', 'left', 'hero', 'cover', 'minimal'] as const).map(s => (
                    <button key={s} type="button" onClick={() => setAppearance(p => ({ ...p, headerStyle: s }))}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border capitalize transition-all ${
                        appearance.headerStyle === s
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 text-slate-500 hover:border-slate-400'
                      }`}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Button Style</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['filled', 'outlined', 'soft', 'pill', 'glass'] as const).map(s => (
                    <button key={s} type="button" onClick={() => setAppearance(p => ({ ...p, buttonStyle: s }))}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border capitalize transition-all ${
                        appearance.buttonStyle === s
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 text-slate-500 hover:border-slate-400'
                      }`}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Avatar Shape</label>
                <div className="flex gap-2">
                  {(['circle', 'rounded', 'square'] as const).map(s => (
                    <button key={s} type="button" onClick={() => setAppearance(p => ({ ...p, avatarShape: s }))}
                      className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border text-[10px] font-bold capitalize transition-all ${
                        appearance.avatarShape === s
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 text-slate-500 hover:border-slate-400'
                      }`}>
                      <div className="w-5 h-5 bg-current opacity-40"
                        style={{ borderRadius: s === 'circle' ? '9999px' : s === 'rounded' ? '4px' : '1px' }} />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>)}

            {/* COMPONENTS TAB */}
            {activeTab === 'components' && (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400">
                  Components can be added and reordered in the full editor.
                  Visit the profile page editor for drag-and-drop blocks.
                </p>
                <Link href={`/dashboard/profiles/${id}/edit`}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:text-slate-900 transition-all">
                  <Layers className="w-4 h-4" /> Open Block Editor
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PREVIEW ── */}
        <div className="flex-1 flex flex-col min-w-0">
          <LiveCardPreview
            profile={previewProfile}
            appearance={appearance}
            deviceView={deviceView}
          />
        </div>
      </div>
    </div>
  );
}
