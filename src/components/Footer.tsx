'use client';

import { useLanguage } from '@/lib/i18n';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#060c18] py-8 px-4 text-center">
      <div className="max-w-4xl mx-auto flex flex-col items-center space-y-3">
        <div className="flex flex-wrap justify-center items-center gap-2 text-xs sm:text-sm text-slate-300">
          <span>{t('footer.cheer')}</span>
          <span className="text-red-400 animate-pulse">🎄</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-300 font-medium">{t('footer.free')}</span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400 font-medium">{t('footer.privacy')}</span>
        </div>
        <p className="text-xs text-slate-400 max-w-md">
          {t('footer.note')}
        </p>
      </div>
    </footer>
  );
}
