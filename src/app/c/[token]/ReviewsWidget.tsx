'use client';

import React, { useState, useEffect } from 'react';
import { Star, StarOff, Send, MessageSquare, User, RefreshCw } from 'lucide-react';

interface Review {
  id: string;
  authorName: string;
  rating: number;
  text: string | null;
  createdAt: string;
}

interface ReviewsWidgetProps {
  profileId: string;
  isArabic: boolean;
}

export default function ReviewsWidget({ profileId, isArabic }: ReviewsWidgetProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/profiles/${profileId}/reviews`);
      if (res.ok) {
        setReviews(await res.json());
      }
    } catch (e) {
      console.error(e);
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
      setError(isArabic ? 'الرجاء إدخال الاسم' : 'Please enter your name');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/profiles/${profileId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName, rating, text: text.trim() || null }),
      });

      if (res.ok) {
        const newReview = await res.json();
        setReviews(prev => [newReview, ...prev]);
        setAuthorName('');
        setText('');
        setRating(5);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit review');
      }
    } catch {
      setError(isArabic ? 'فشل الاتصال بالخادم' : 'Server connection failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations
  const totalCount = reviews.length;
  const avgRating = totalCount > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1)
    : '0.0';

  const renderStars = (num: number, onClick?: (val: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(val => (
          <Star
            key={val}
            onClick={() => onClick && onClick(val)}
            className={`w-4 h-4 ${onClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${
              val <= num ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-700'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4 bg-[var(--theme-surface)] border border-[var(--theme-border)] p-5 rounded-2xl shadow-sm text-left rtl:text-right">
      
      {/* Aggregate Score Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[var(--theme-border)] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center font-bold">
            ★
          </div>
          <div>
            <h3 className="text-xs font-black tracking-wide uppercase opacity-75">
              {isArabic ? 'تقييمات العملاء' : 'Google Reviews'}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold">
              {totalCount} {isArabic ? 'تقييمات' : 'Reviews'}
            </p>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xl font-black">{avgRating}</span>
            {renderStars(Math.round(parseFloat(avgRating)))}
          </div>
        )}
      </div>

      {/* Review Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-1">
        {submitted && (
          <div className="p-3 bg-green-50 text-green-700 text-[10px] font-bold rounded-xl border border-green-200">
            {isArabic ? '✓ تم إرسال تقييمك بنجاح!' : '✓ Review submitted successfully!'}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-[10px] font-bold rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-[9px] uppercase font-bold text-slate-400">
            {isArabic ? 'الاسم' : 'Your Name'}
          </label>
          <input
            type="text"
            required
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            placeholder={isArabic ? 'أدخل اسمك هنا' : 'Enter your name'}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-[var(--theme-border)] text-xs rounded-xl focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between text-xs py-1">
          <span className="font-bold text-slate-500 dark:text-slate-400 text-[10px]">
            {isArabic ? 'حدد التقييم بالنجوم' : 'Select Star Rating'}
          </span>
          {renderStars(rating, setRating)}
        </div>

        <div className="space-y-1">
          <label className="block text-[9px] uppercase font-bold text-slate-400">
            {isArabic ? 'التعليق' : 'Comment (Optional)'}
          </label>
          <textarea
            rows={2}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={isArabic ? 'اكتب رأيك بالخدمة هنا...' : 'Write your feedback here...'}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-[var(--theme-border)] text-xs rounded-xl focus:outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all disabled:opacity-40"
        >
          {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>{isArabic ? 'إرسال التقييم' : 'Submit Review'}</span>
        </button>
      </form>

      {/* Reviews feed */}
      {reviews.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[var(--theme-border)] max-h-48 overflow-y-auto pr-1">
          {reviews.map(rev => (
            <div key={rev.id} className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-[var(--theme-border)] rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <User className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-black">{rev.authorName}</span>
                </div>
                {renderStars(rev.rating)}
              </div>
              {rev.text && (
                <p className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed pl-4 rtl:pr-4">
                  {rev.text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
