'use client';

import Link from 'next/link';
import { Gift, Sparkles, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function Navbar() {
  const { locale, toggleLocale, t } = useLanguage();

  return (
    <header className="relative z-20 border-b border-white/10 bg-[#081121] sticky top-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center space-x-2.5 group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-red-700 flex items-center justify-center shadow-lg shadow-red-950/40 group-hover:rotate-6 transition-transform">
            <Gift className="w-5 h-5 text-amber-300" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">
                {t('nav.brand')}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 font-medium">
                {t('nav.year')}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium -mt-0.5">
              {t('nav.subtitle')}
            </span>
          </div>
        </Link>

        <nav className="flex items-center space-x-2 sm:space-x-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLocale}
            className="flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition active:scale-95"
            title={locale === 'en' ? 'Переключить на русский' : 'Switch to English'}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{locale === 'en' ? '🇷🇺 RU' : '🇬🇧 EN'}</span>
          </button>

          <Link
            href="/"
            className="hidden sm:inline-block text-xs sm:text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition font-medium"
          >
            {t('nav.home')}
          </Link>

          <Link
            href="/#create"
            className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold bg-red-600 hover:bg-red-500 text-white px-3.5 py-1.5 rounded-lg shadow-md shadow-red-950/50 transition-all hover:scale-105 active:scale-95 border border-red-500"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('nav.newExchange')}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
