'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Link2,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
  QrCode,
  Smartphone,
  Sparkles,
  TrendingUp,
  Search,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Power,
  Download,
  X,
  RefreshCw,
} from 'lucide-react';
import QRCodeLib from 'qrcode';

interface ShortLinkItem {
  id: string;
  code: string;
  originalUrl: string;
  title: string | null;
  clicks: number;
  lastScannedAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ShortLinksPage() {
  const [links, setLinks] = useState<ShortLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createUrl, setCreateUrl] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [createCustomCode, setCreateCustomCode] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit Modal state
  const [editingLink, setEditingLink] = useState<ShortLinkItem | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // QR Modal state
  const [qrModalLink, setQrModalLink] = useState<ShortLinkItem | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Delete Modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Domain origin for short URLs
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
    fetchLinks();
  }, []);

  async function fetchLinks() {
    try {
      setLoading(true);
      const res = await fetch('/api/short-links');
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links || []);
      }
    } catch (err) {
      console.error('Failed to load short links:', err);
    } finally {
      setLoading(false);
    }
  }

  // Generate QR when opening QR modal
  useEffect(() => {
    if (qrModalLink && origin) {
      const fullUrl = `${origin}/${qrModalLink.code}`;
      QRCodeLib.toDataURL(fullUrl, {
        width: 380,
        margin: 2,
        color: {
          dark: '#170d24',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to render QR:', err));
    } else {
      setQrDataUrl(null);
    }
  }, [qrModalLink, origin]);

  const handleCopy = (code: string, id: string) => {
    const fullUrl = `${origin}/${code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);

    try {
      const res = await fetch('/api/short-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalUrl: createUrl,
          title: createTitle,
          customCode: createCustomCode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Failed to create short link');
      } else {
        setIsCreateOpen(false);
        setCreateUrl('');
        setCreateTitle('');
        setCreateCustomCode('');
        fetchLinks();
      }
    } catch (err) {
      setCreateError('Connection error. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;
    setEditError(null);
    setEditLoading(true);

    try {
      const res = await fetch(`/api/short-links/${editingLink.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalUrl: editUrl,
          title: editTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || 'Failed to update short link');
      } else {
        setEditingLink(null);
        fetchLinks();
      }
    } catch (err) {
      setEditError('Connection error. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleActive = async (link: ShortLinkItem) => {
    try {
      const res = await fetch(`/api/short-links/${link.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !link.isActive }),
      });
      if (res.ok) {
        setLinks((prev) =>
          prev.map((item) => (item.id === link.id ? { ...item, isActive: !item.isActive } : item))
        );
      }
    } catch (err) {
      console.error('Failed to toggle link active state:', err);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/short-links/${deletingId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLinks((prev) => prev.filter((item) => item.id !== deletingId));
        setDeletingId(null);
      }
    } catch (err) {
      console.error('Failed to delete short link:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Metrics
  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const activeLinks = links.filter((l) => l.isActive).length;

  const filteredLinks = useMemo(() => {
    if (!search.trim()) return links;
    const q = search.toLowerCase();
    return links.filter(
      (l) =>
        l.code.toLowerCase().includes(q) ||
        (l.title && l.title.toLowerCase().includes(q)) ||
        l.originalUrl.toLowerCase().includes(q)
    );
  }, [links, search]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HEADER SECTION                                              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#844D98]/10 text-[#844D98] border border-[#844D98]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>خاص ببطاقات NFC وأكواد QR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            مختصر الروابط الذكية (NFC & QR Link Shortener)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            أنشئ روابط فائقة القصر ومخصصة لبرمجة بطاقات NFC وأكواد QR. يمكنك تغيير وجهة الرابط في أي وقت لاحقاً مع الحفاظ على نفس الرابط في البطاقة دون إعادة برمجتها!
          </p>
        </div>

        <button
          onClick={() => {
            setCreateError(null);
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#844D98] via-[#602773] to-[#7C3AED] hover:from-[#9355a8] hover:to-[#8b5cf6] text-white font-bold text-sm shadow-lg shadow-[#844D98]/25 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>إنشاء رابط قصير جديد</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* METRICS TILES                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">إجمالي الروابط</span>
            <Link2 className="w-4 h-4 text-[#844D98]" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalLinks}</div>
          <div className="text-[11px] text-slate-400 mt-1">روابط ديناميكية مسجلة</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">إجمالي المسحات / النقرات</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalClicks}</div>
          <div className="text-[11px] text-slate-400 mt-1">مرات التحويل المباشر</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">الروابط النشطة</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{activeLinks}</div>
          <div className="text-[11px] text-slate-400 mt-1">جاهزة للعمل فوراً</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">توفير ذاكرة NFC</span>
            <Smartphone className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-[#844D98] dark:text-purple-400">~24 بايت</div>
          <div className="text-[11px] text-slate-400 mt-1">متوافق مع كل شرائح NTAG</div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* SEARCH AND FILTERS                                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالكود، العنوان أو الرابط الأصلي..."
            className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#844D98] transition-all"
          />
        </div>

        <button
          onClick={fetchLinks}
          title="تحديث القائمة"
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#844D98] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* LINKS LIST                                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-[#844D98] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400">جاري تحميل الروابط...</span>
        </div>
      ) : filteredLinks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#844D98]/10 text-[#844D98] flex items-center justify-center mx-auto">
            <Link2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">لا توجد روابط قصيرة حالياً</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            ابدأ باختصار رابطك الطويل الأول لاستخدامه في بطاقة NFC أو كود QR، واستمتع بإمكانية تحديث الوجهة في أي وقت!
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#844D98] hover:bg-[#6F2E82] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء أول رابط قصير</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredLinks.map((link) => {
            const shortUrl = `${origin}/${link.code}`;
            const isCopied = copiedId === link.id;

            return (
              <div
                key={link.id}
                className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#844D98]/40 transition-all space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {link.title || 'رابط بدون عنوان'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          link.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200'
                        }`}
                      >
                        {link.isActive ? 'نشط ويعمل' : 'معطل مؤقتاً'}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(link.createdAt).toLocaleDateString('ar-MA')}</span>
                      </span>
                    </div>

                    {/* Short Link Badge & Copy Box */}
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold text-[#844D98] dark:text-purple-300">
                        <Link2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="select-all">{shortUrl}</span>
                      </div>

                      <button
                        onClick={() => handleCopy(link.code, link.id)}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200'
                        }`}
                        title="نسخ الرابط"
                      >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isCopied ? 'تم النسخ!' : 'نسخ'}</span>
                      </button>

                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition-all"
                        title="تجربة الرابط (فتح في تبويب جديد)"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden sm:inline">تجربة</span>
                      </a>
                    </div>

                    {/* Destination URL */}
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate max-w-xl">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">الوجهة الأصلية:</span>
                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate hover:underline text-blue-600 dark:text-blue-400 font-mono"
                      >
                        {link.originalUrl}
                      </a>
                    </div>
                  </div>

                  {/* Right Actions & Stats */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    {/* Clicks count */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 px-3.5 py-1.5 rounded-xl text-center">
                      <div className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        <span>الزيارات</span>
                      </div>
                      <div className="text-base font-black text-slate-900 dark:text-white">{link.clicks}</div>
                    </div>

                    {/* QR Code Modal Button */}
                    <button
                      onClick={() => setQrModalLink(link)}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 hover:text-[#844D98] transition-colors cursor-pointer"
                      title="عرض وتحميل QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    {/* NFC Write helper button */}
                    <Link
                      href={`/dashboard/nfc-tool?url=${encodeURIComponent(shortUrl)}`}
                      className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-[#844D98] dark:text-purple-300 hover:bg-purple-100 transition-colors"
                      title="برمجة الرابط على بطاقة NFC"
                    >
                      <Smartphone className="w-4 h-4" />
                    </Link>

                    {/* Edit Destination */}
                    <button
                      onClick={() => {
                        setEditingLink(link);
                        setEditUrl(link.originalUrl);
                        setEditTitle(link.title || '');
                        setEditError(null);
                      }}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 hover:text-blue-600 transition-colors cursor-pointer"
                      title="تعديل الرابط الأصلي"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Toggle Active */}
                    <button
                      onClick={() => handleToggleActive(link)}
                      className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                        link.isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 hover:bg-amber-100'
                      }`}
                      title={link.isActive ? 'تعطيل الرابط' : 'تفعيل الرابط'}
                    >
                      <Power className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeletingId(link.id)}
                      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                      title="حذف الرابط"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Last scan info footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>
                      {link.lastScannedAt
                        ? `آخر مسح: ${new Date(link.lastScannedAt).toLocaleString('ar-MA')}`
                        : 'لم يتم المسح بعد'}
                    </span>
                  </div>

                  <span className="text-slate-400 font-mono">
                    حجم NDEF: ~{shortUrl.length + 5} بايت
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* CREATE MODAL                                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-6 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#844D98]/10 text-[#844D98] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">إنشاء رابط قصير جديد</h3>
                  <p className="text-xs text-slate-500">جاهز ومخصص لبطاقات NFC وأكواد QR</p>
                </div>
              </div>

              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  الرابط الأصلي الطويل (Destination URL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createUrl}
                  onChange={(e) => setCreateUrl(e.target.value)}
                  placeholder="https://instagram.com/my-store/?igsh=very-long-link..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#844D98]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  عنوان أو وصف الرابط (اختياري)
                </label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="مثال: حساب انستغرام المتجر، قائمة الطعام الرقمية، Google Review"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#844D98]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  كود مخصص اختياري (Custom Code)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0 select-none">
                    {origin}/
                  </span>
                  <input
                    type="text"
                    value={createCustomCode}
                    onChange={(e) => setCreateCustomCode(e.target.value)}
                    placeholder="مثال: a8K3 أو vip (فارغ للتوليد التلقائي)"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#844D98]"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  إذا تركته فارغاً، سيقوم النظام تلقائياً بتوليد كود قصير جداً ومميز (5 أحرف).
                </p>
              </div>

              {/* NFC optimization tip box */}
              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs text-[#844D98] dark:text-purple-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>ميزة الروابط الديناميكية لـ NFC:</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  الرابط المخزن داخل بطاقة NFC سيكون قصيراً وسريع القراءة. في المستقبل، يمكنك تغيير رابط الوجهة بنقرة واحدة من لوحة التحكم دون الحاجة للمس البطاقة الفيزيائية مجدداً!
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#844D98] hover:bg-[#6F2E82] text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                >
                  {createLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري الإنشاء...</span>
                    </>
                  ) : (
                    <span>إنشاء الرابط القصير</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* EDIT MODAL (DYNAMIC DESTINATION UPDATE)                     */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {editingLink && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-6 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">تعديل وجهة الرابط (Dynamic Update)</h3>
                  <p className="text-xs text-slate-500 font-mono font-bold text-[#844D98]">
                    الكود القصير: {origin}/{editingLink.code}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingLink(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Crucial Note */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
              <span className="font-bold">⚠️ ملاحظة هامة لبطاقات NFC وأكواد QR:</span>
              <p className="text-[11px] mt-1 text-slate-600 dark:text-slate-300">
                الرابط القصير الموجود داخل بطاقتك الفيزيائية لن يتغير أبداً. بمجرد حفظ التعديل، سيتم تحويل الزائر مباشرة للرابط الجديد فور مسح البطاقة!
              </p>
            </div>

            {editError && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  الرابط الأصلي الجديد (New Destination URL) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#844D98]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  العنوان / الوصف
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#844D98]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                >
                  {editLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>حفظ التعديل فوراً</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* QR CODE MODAL                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {qrModalLink && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm p-6 sm:p-8 space-y-6 text-center animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                كود QR للرابط المختصر
              </span>
              <button
                onClick={() => setQrModalLink(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Image */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 inline-block shadow-inner mx-auto">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${qrModalLink.code}`}
                  className="w-56 h-56 object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-xs text-slate-400">
                  جاري توليد الكود...
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-[#844D98] font-mono select-all">
                {origin}/{qrModalLink.code}
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-xs mx-auto">
                {qrModalLink.title || qrModalLink.originalUrl}
              </div>
            </div>

            {/* Download QR Button */}
            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download={`qr-${qrModalLink.code}.png`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#844D98] hover:bg-[#6F2E82] text-white font-bold text-xs shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>تحميل الصورة عالية الدقة (PNG)</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* DELETE CONFIRMATION MODAL                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm p-6 space-y-4 text-center animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">هل أنت متأكد من حذف هذا الرابط؟</h3>
            <p className="text-xs text-slate-500">
              سيتم إيقاف عمل الرابط القصير فوراً، ولن يتمكن أي شخص من الوصول للوجهة عبر بطاقة NFC أو كود QR الخاصة به.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                {deleteLoading ? 'جاري الحذف...' : 'نعم، حذف الرابط'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
