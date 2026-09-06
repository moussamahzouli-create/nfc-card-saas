'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

type Language = 'en' | 'ar';

interface LanguageContextProps {
  language: Language;
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('lang');
    if (savedLang === 'en' || savedLang === 'ar') {
      setLanguageState(savedLang as Language);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lang', lang);
    if (typeof window !== 'undefined') {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    if (mounted) {
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  const dict = language === 'ar' ? ar : en;

  const t = (keyPath: string): string => {
    const keys = keyPath.split('.');
    let current: Record<string, any> = dict;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return keyPath;
      }
    }
    return typeof current === 'string' ? current : keyPath;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  // Prevent flash of un-localized content by waiting until hydration finishes
  return (
    <LanguageContext.Provider value={{ language, t, setLanguage, dir }}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }} className="h-full">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
