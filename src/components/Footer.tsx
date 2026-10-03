'use client';

import { useLanguage } from '@/lib/i18n';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative z-10 border-t border-slate-200 bg-white py-8 px-4 text-center mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col items-center space-y-2">
        <div className="flex flex-wrap justify-center items-center gap-2 text-xs sm:text-sm text-slate-600">
          <span>{t('footer.cheer')}</span>
          <span className="text-red-600">🎄</span>
          <span className="text-slate-300">•</span>
          <span className="text-blue-600 font-semibold">{t('footer.free')}</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-600 font-semibold">{t('footer.privacy')}</span>
        </div>
        <p className="text-xs text-slate-400 max-w-md">
          {t('footer.note')}
        </p>
      </div>
    </footer>
  );
}
