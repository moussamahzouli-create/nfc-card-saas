'use client';

import React, { useState, useEffect } from 'react';
import { Star, Send, User, RefreshCw, MessageSquarePlus, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface Review {
  id: string;
  authorName: string;
  rating: number;
  text: string | null;
  createdAt: string;
}

interface ReviewsWidgetProps {
  profileId: string;
  isArabic?: boolean;
  profileName?: string;
  primaryColor?: string;
  accentColor?: string;
  surfaceColor?: string;
  borderColor?: string;
  textColor?: string;
  mutedColor?: string;
}

export default function ReviewsWidget({
  profileId,
  isArabic = false,
  profileName = '',
  primaryColor = '#8A509E',
  accentColor = '#A855F7',
  surfaceColor = 'rgba(255, 255, 255, 0.03)',
  borderColor = 'rgba(255, 255, 255, 0.08)',
  textColor = '#FFFFFF',
  mutedColor = '#94A3B8',
}: ReviewsWidgetProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/profiles/${profileId}/reviews`);
      if (res.ok) {
        setReviews(await res.json());
      }
    } catch (e) {
      console.error('Failed to load reviews', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [profileId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      setError(isArabic ? 'الرجاء إدخال اسمك الكريم' : 'Please enter your name');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/profiles/${profileId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName: authorName.trim(), rating, text: text.trim() || null }),
      });

      if (res.ok) {
        const newReview = await res.json();
        setReviews(prev => [newReview, ...prev]);
        setAuthorName('');
        setText('');
        setRating(5);
        setSubmitted(true);
        setShowForm(false);
        setTimeout(() => setSubmitted(false), 4000);
      } else {
        const data = await res.json();
        setError(data.error || (isArabic ? 'فشل إرسال التقييم' : 'Failed to submit review'));
      }
    } catch {
      setError(isArabic ? 'حدث خطأ في الاتصال بالخادم' : 'Server connection error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalCount = reviews.length;
  const avgRating = totalCount > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1)
    : '5.0';

  const renderStars = (num: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((val) => {
          const isFilled = interactive ? val <= (hoverRating || rating) : val <= num;
          return (
            <button
              key={val}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && setRating(val)}
              onMouseEnter={() => interactive && setHoverRating(val)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`${interactive ? 'cursor-pointer hover:scale-125 transition-transform p-0.5' : 'cursor-default'}`}
              title={`${val} Stars`}
            >
              <Star
                className={`w-4 h-4 transition-colors ${
                  isFilled ? 'text-amber-400 fill-amber-400 drop-shadow-sm' : 'text-slate-500/40'
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="w-full rounded-3xl overflow-hidden border p-4 sm:p-5 space-y-4 transition-all duration-300 shadow-lg text-left rtl:text-right relative"
      style={{
        backgroundColor: surfaceColor,
        borderColor: borderColor,
      }}
    >
      {/* Header with Google Logo & Rating summary */}
      <div className="flex items-center justify-between gap-3 border-b pb-3.5" style={{ borderColor }}>
        <div className="flex items-center gap-2.5">
          {/* Authentic Google Multi-Color G Icon */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-md border border-slate-100">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black tracking-wide uppercase" style={{ color: textColor }}>
                {isArabic ? 'تقييمات العملاء' : 'Google Reviews'}
              </h3>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold opacity-75" style={{ color: mutedColor }}>
              <span>{avgRating}</span>
              <span>•</span>
              <span>
                {totalCount} {isArabic ? (totalCount === 1 ? 'تقييم' : 'تقييمات') : totalCount === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          </div>
        </div>

        {/* Aggregate stars badge */}
        <div className="flex flex-col items-end rtl:items-start shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black" style={{ color: textColor }}>{avgRating}</span>
            {renderStars(Math.round(parseFloat(avgRating)))}
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {submitted && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{isArabic ? 'شكراً لك! تم نشر تقييمك بنجاح.' : 'Thank you! Your review has been published.'}</span>
        </div>
      )}

      {/* Review Submission Toggle Button */}
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full py-2.5 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all hover:bg-white/5 active:scale-98 cursor-pointer"
          style={{ borderColor, color: textColor }}
        >
          <MessageSquarePlus className="w-4 h-4 text-amber-400" />
          <span>{isArabic ? 'أضف تقييمك وتجربتك' : 'Leave a Review'}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        </button>
      ) : (
        /* Review Form */
        <form onSubmit={handleSubmit} className="space-y-3 p-4 rounded-2xl bg-black/20 border border-white/10 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold" style={{ color: textColor }}>
              {isArabic ? 'كتابة تقييم جديد' : 'Write a Review'}
            </span>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-[10px] font-semibold opacity-60 hover:opacity-100 p-1"
              style={{ color: mutedColor }}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </button>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-bold rounded-xl">
              {error}
            </div>
          )}

          {/* Star selector */}
          <div className="flex items-center justify-between py-1 px-1">
            <span className="text-[11px] font-bold" style={{ color: mutedColor }}>
              {isArabic ? 'حدد التقييم:' : 'Your Rating:'}
            </span>
            {renderStars(rating, true)}
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: mutedColor }}>
              {isArabic ? 'اسمك الكريم' : 'Your Name'} *
            </label>
            <input
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={isArabic ? 'مثال: كريم العلمي' : 'e.g. John Doe'}
              className="w-full px-3 py-2 bg-black/30 border border-white/15 text-xs rounded-xl focus:outline-none focus:border-amber-400 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: mutedColor }}>
              {isArabic ? 'رأيك أو تعليقك (اختياري)' : 'Comment (Optional)'}
            </label>
            <textarea
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isArabic ? 'ما رأيك في الخدمة والتعامل؟...' : 'Share details of your experience...'}
              className="w-full px-3 py-2 bg-black/30 border border-white/15 text-xs rounded-xl focus:outline-none focus:border-amber-400 text-white placeholder:text-slate-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white shadow-md transition-all hover:opacity-95 active:scale-98 cursor-pointer disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            }}
          >
            {submitting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{isArabic ? 'إرسال التقييم الآن' : 'Submit Review'}</span>
          </button>
        </form>
      )}

      {/* Reviews Feed */}
      {reviews.length > 0 ? (
        <div className="space-y-2.5 pt-1 max-h-56 overflow-y-auto pr-1">
          {reviews.map((rev) => {
            const initials = rev.authorName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || '★';

            return (
              <div
                key={rev.id}
                className="p-3 rounded-2xl border space-y-1.5 transition-all"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderColor: borderColor,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
                    >
                      {initials}
                    </div>
                    <div>
                      <span className="text-xs font-bold block truncate" style={{ color: textColor }}>
                        {rev.authorName}
                      </span>
                      <span className="text-[9px] font-semibold text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>{isArabic ? 'عميل موثق' : 'Verified Review'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">{renderStars(rev.rating)}</div>
                </div>

                {rev.text && (
                  <p className="text-xs leading-relaxed pt-1 opacity-80" style={{ color: textColor }}>
                    {rev.text}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-2xl border text-center space-y-1 bg-white/2" style={{ borderColor }}>
          <p className="text-xs font-bold" style={{ color: textColor }}>
            {isArabic ? `كن أول من يقيّم ${profileName || 'هذا البروفايل'}!` : `Be the first to review ${profileName || 'this profile'}!`}
          </p>
          <p className="text-[10px] opacity-60" style={{ color: mutedColor }}>
            {isArabic ? 'انقر على "أضف تقييمك" لمشاركة تجربتك وتقييم الخدمة' : 'Click "Leave a Review" above to share your rating'}
          </p>
        </div>
      )}
    </div>
  );
}
