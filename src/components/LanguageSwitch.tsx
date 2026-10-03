'use client';

import { useLanguage } from '@/lib/i18n';

export default function LanguageSwitch() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="w-full flex justify-center items-center pt-6 pb-2 relative z-30">
      <div className="inline-flex items-center p-1 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold">
        <button
          type="button"
          onClick={() => setLocale('en')}
          className={`px-4 py-1.5 rounded-full transition-all ${
            locale === 'en'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLocale('ru')}
          className={`px-4 py-1.5 rounded-full transition-all ${
            locale === 'ru'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Русский
        </button>
      </div>
    </div>
  );
}
