'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, Search, ExternalLink, Edit3, Trash2, CheckCircle2, 
  XCircle, Loader2, CreditCard, Shield, User, Globe, Copy, Check,
  Sparkles, Eye, AlertCircle, RefreshCw
} from 'lucide-react';

interface ProfileData {
  id: string;
  name: string;
  slug: string;
  jobTitle?: string;
  company?: string;
  photoUrl?: string;
  isPublic: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  cardAssignments?: Array<{
    card: {
      cardNumber: string;
      nfcUid: string | null;
      status: string;
    };
  }>;
  _count?: {
    components: number;
    reviews: number;
  };
}

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profiles?all=true');
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      } else {
        setMsg({ text: 'فشل في تحميل البروفايلات', type: 'error' });
      }
    } catch (e) {
      setMsg({ text: 'خطأ في الاتصال بالسيرفر', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف بروفايل "${name}" نهائياً من النظام؟`)) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProfiles(prev => prev.filter(p => p.id !== id));
        setMsg({ text: `تم حذف بروفايل "${name}" بنجاح`, type: 'success' });
      } else {
        const data = await res.json();
        setMsg({ text: data.error || 'فشل في حذف البروفايل', type: 'error' });
      }
    } catch {
      setMsg({ text: 'خطأ في الشبكة', type: 'error' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMsg(null), 4000);
    }
  };

  const filtered = profiles.filter(p => {
    const term = search.toLowerCase().trim();
    const matchSearch = 
      p.name?.toLowerCase().includes(term) ||
      p.slug?.toLowerCase().includes(term) ||
      p.company?.toLowerCase().includes(term) ||
      p.user?.name?.toLowerCase().includes(term) ||
      p.user?.email?.toLowerCase().includes(term);

    const matchRole = roleFilter === 'ALL' || p.user?.role === roleFilter;

    return matchSearch && matchRole;
  });

  const totalCards = profiles.reduce((acc, p) => acc + (p.cardAssignments?.length || 0), 0);

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-white">إدارة كافة البروفايلات والبطاقات</h1>
            <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold">
              صلاحيات Super Admin
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            مشاهدة جميع بطاقات وبروفايلات العملاء والتعديل المباشر عليها وإدارتها مركزياً.
          </p>
        </div>

        <button
          onClick={fetchProfiles}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-850 hover:text-white transition-all text-xs font-bold cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          <span>تحديث البيانات</span>
        </button>
      </div>

      {/* Notifications */}
      {msg && (
        <div className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between ${
          msg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <span>{msg.text}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <span className="text-xs font-bold text-slate-400 block mb-1">إجمالي البروفايلات بالمنصة</span>
          <div className="text-2xl font-black text-white">{profiles.length}</div>
        </div>
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <span className="text-xs font-bold text-slate-400 block mb-1">البروفايلات النشطة والمفعلة</span>
          <div className="text-2xl font-black text-emerald-400">{profiles.filter(p => p.isPublic).length}</div>
        </div>
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
          <span className="text-xs font-bold text-slate-400 block mb-1">مرتبطة ببطاقات NFC فيزيائية</span>
          <div className="text-2xl font-black text-purple-400">{totalCards}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          <input
            type="text"
            placeholder="بحث باسم البروفايل، الرابط (slug)، اسم العميل أو بريده..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {['ALL', 'CUSTOMER', 'ADMIN', 'SUPER_ADMIN'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                roleFilter === role
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {role === 'ALL' ? 'كل الأدوار' : role === 'CUSTOMER' ? 'العملاء' : role === 'ADMIN' ? 'الوكلاء' : 'المدراء'}
            </button>
          ))}
        </div>
      </div>

      {/* Profiles Table */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <span className="text-xs font-bold">جاري تحميل بروفايلات العملاء...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs font-bold">
            لا توجد بروفايلات مطابقة لعملية البحث
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-4 px-5">البروفايل / الهوية</th>
                  <th className="py-4 px-5">العميل المالك</th>
                  <th className="py-4 px-5">بطاقة NFC المربوطة</th>
                  <th className="py-4 px-5">البلوكات / المكونات</th>
                  <th className="py-4 px-5">الحالة</th>
                  <th className="py-4 px-5 text-center">الإجراءات والتحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filtered.map(p => {
                  const card = p.cardAssignments?.[0]?.card;
                  const publicUrl = typeof window !== 'undefined' 
                    ? `${window.location.origin}/c/${p.slug}` 
                    : `https://www.brandxpere.com/c/${p.slug}`;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Profile info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shrink-0 shadow-md">
                            {p.photoUrl ? (
                              <img src={p.photoUrl} alt="" className="w-full h-full object-cover rounded-[14px]" />
                            ) : (
                              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-white text-xs">
                                {p.name[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm block">{p.name}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-purple-400 font-mono">/c/{p.slug}</span>
                              {p.company && (
                                <span className="text-[10px] text-slate-400 font-normal">({p.company})</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* User Owner */}
                      <td className="py-4 px-5">
                        {p.user ? (
                          <div>
                            <span className="font-bold text-slate-200 block">{p.user.name}</span>
                            <span className="text-[10px] text-slate-400 block">{p.user.email}</span>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {p.user.role}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[10px]">غير محدد</span>
                        )}
                      </td>

                      {/* NFC Card */}
                      <td className="py-4 px-5">
                        {card ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-[11px]">
                            <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                            <span>{card.cardNumber}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">لا توجد بطاقة فيزيائية</span>
                        )}
                      </td>

                      {/* Stats */}
                      <td className="py-4 px-5">
                        <span className="text-slate-300 text-xs font-bold">
                          {p._count?.components ?? 0} بلوك
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        {p.isPublic ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>منشور</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold">
                            <XCircle className="w-3 h-3" />
                            <span>مسودة</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-2">
                          {/* EDIT LINK: Takes Super Admin directly to builder editor */}
                          <Link
                            href={`/dashboard/profiles/${p.id}/edit`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                            title="تعديل هذا البروفايل بصلاحيات Super Admin"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </Link>

                          {/* Live view */}
                          <a
                            href={`/c/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="معاينة البطاقة العامة"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* Copy Link */}
                          <button
                            onClick={() => handleCopy(publicUrl, p.id)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="نسخ رابط البطاقة"
                          >
                            {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={actionLoading === p.id}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer"
                            title="حذف البروفايل"
                          >
                            {actionLoading === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
