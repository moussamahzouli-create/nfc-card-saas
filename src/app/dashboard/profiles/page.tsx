'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, Edit, Copy, Trash, ToggleLeft, ToggleRight, Share2, 
  AlertCircle, FileSpreadsheet, QrCode, ExternalLink, X, Check 
} from 'lucide-react';

export default function ProfilesListPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Share dialog state
  const [shareProfile, setShareProfile] = useState<any | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/profiles');
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      } else {
        setError('Failed to load profiles');
      }
    } catch (err) {
      setError('An error occurred while loading profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handlePublishToggle = async (profileId: string, currentStatus: boolean) => {
    const endpoint = currentStatus ? 'unpublish' : 'publish';
    setActionLoading(profileId);
    try {
      const res = await fetch(`/api/profiles/${profileId}/${endpoint}`, { method: 'POST' });
      if (res.ok) {
        showToast(currentStatus ? 'Profile unpublished successfully.' : 'Profile published successfully.');
        fetchProfiles();
      } else {
        setError('Failed to toggle visibility.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (profileId: string) => {
    setActionLoading(profileId);
    try {
      const res = await fetch(`/api/profiles/${profileId}/duplicate`, { method: 'POST' });
      if (res.ok) {
        showToast('Profile duplicated successfully.');
        fetchProfiles();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to duplicate profile');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile? This action cannot be undone.')) return;
    setActionLoading(profileId);
    setError('');
    try {
      const res = await fetch(`/api/profiles/${profileId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Profile deleted successfully.');
        fetchProfiles();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete profile');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/c/${slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setCopiedSlug(slug);
          showToast('Link copied successfully.');
          setTimeout(() => setCopiedSlug(null), 2000);
        })
        .catch(() => {
          fallbackCopyText(url);
        });
    } else {
      fallbackCopyText(url);
    }
  };

  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Link copied successfully.');
    } catch (err) {
      setError('Unable to copy. Please manually copy the URL.');
    }
    document.body.removeChild(textArea);
  };

  const handleShare = async (profile: any) => {
    const publicUrl = `${window.location.origin}/c/${profile.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile.name,
          text: `Connect with ${profile.name} via their digital business card.`,
          url: publicUrl,
        });
      } catch (err) {
        console.log('Share API canceled or failed', err);
      }
    } else {
      setShareProfile(profile);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-bold text-slate-500">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Toast Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl border flex items-center gap-2 text-xs font-bold shadow-md bg-green-50 border-green-200 text-green-700 absolute bottom-4 right-4 z-50 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('dashboard.myProfiles')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create and customize your business/personal digital cards.
          </p>
        </div>
        <Link
          href="/dashboard/profiles/new"
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Profile</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl flex items-center gap-2 text-red-600 text-xs font-semibold">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
          <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold">No profiles found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
            You don&apos;t have any digital business card profiles yet. Click below to create your first one.
          </p>
          <Link
            href="/dashboard/profiles/new"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer"
          >
            Create Profile
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => {
            const canonicalUrl = `${window.location.origin}/c/${profile.slug}`;
            return (
              <div
                key={profile.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{profile.type}</span>
                      <h3 className="text-lg font-extrabold tracking-tight mt-0.5">{profile.name}</h3>
                      <span className="text-xs text-slate-500 font-medium truncate block">/c/{profile.slug}</span>
                    </div>

                    <button
                      onClick={() => handlePublishToggle(profile.id, profile.isPublic)}
                      disabled={actionLoading === profile.id}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                      title="Toggle Visibility"
                    >
                      {profile.isPublic ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-900">
                          <ToggleRight className="w-4 h-4" />
                          <span>PUBLIC</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                          <ToggleLeft className="w-4 h-4" />
                          <span>PRIVATE</span>
                        </div>
                      )}
                    </button>
                  </div>

                  {profile.bio && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-3 leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/profiles/${profile.id}/edit`}
                    className="flex-grow inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-950 rounded-xl font-bold text-xs cursor-pointer transition-all"
                    title="Edit Profile Settings"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <a
                    href={canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-slate-500 transition-all"
                    title="Preview Public Page"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <Link
                    href={`/dashboard/qr?profileId=${profile.id}`}
                    className="p-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-slate-500 transition-all"
                    title="QR Code Generator"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleDuplicate(profile.id)}
                    disabled={actionLoading === profile.id}
                    className="p-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-slate-500 transition-all disabled:opacity-40"
                    title="Duplicate Card"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleCopyLink(profile.slug)}
                    className="p-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-slate-500 transition-all"
                    title="Copy Public Link"
                  >
                    <Check className={`w-3.5 h-3.5 text-green-600 ${copiedSlug === profile.slug ? 'scale-100' : 'scale-0 absolute'}`} />
                    <Copy className={`w-3.5 h-3.5 ${copiedSlug === profile.slug ? 'scale-0 absolute' : 'scale-100'}`} />
                  </button>

                  <button
                    onClick={() => handleShare(profile)}
                    className="p-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer text-slate-500 transition-all"
                    title="Share Profile Card"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(profile.id)}
                    disabled={actionLoading === profile.id}
                    className="p-2 border border-red-200 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/20 text-red-500 rounded-xl cursor-pointer transition-all disabled:opacity-40"
                    title="Delete Profile"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share dialog modal (Fallback for desktops without Web Share API) */}
      {shareProfile && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-xl animate-scale-in">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
              <h3 className="text-sm font-black">Share Profile: {shareProfile.name}</h3>
              <button onClick={() => setShareProfile(null)} className="p-1 hover:bg-slate-50 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Public Share URL</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/c/${shareProfile.slug}`}
                  className="flex-grow px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-xs font-semibold select-all"
                />
                <button
                  onClick={() => handleCopyLink(shareProfile.slug)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3 text-center">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareProfile.name + ' - ' + window.location.origin + '/c/' + shareProfile.slug)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border rounded-xl hover:bg-slate-50 text-xs font-bold block text-emerald-600"
              >
                WA
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + '/c/' + shareProfile.slug)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border rounded-xl hover:bg-slate-50 text-xs font-bold block text-blue-650"
              >
                FB
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin + '/c/' + shareProfile.slug)}&text=${encodeURIComponent(shareProfile.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border rounded-xl hover:bg-slate-50 text-xs font-bold block text-slate-900 dark:text-white"
              >
                X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/c/' + shareProfile.slug)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border rounded-xl hover:bg-slate-50 text-xs font-bold block text-blue-800"
              >
                LN
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(shareProfile.name)}&body=${encodeURIComponent(window.location.origin + '/c/' + shareProfile.slug)}`}
                className="p-2 border rounded-xl hover:bg-slate-50 text-xs font-bold block text-slate-500"
              >
                Mail
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
