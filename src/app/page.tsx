'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Gift,
  Users,
  Copy,
  Check,
  ArrowRight,
  Lock,
  Calendar,
  DollarSign,
  Key,
  Info,
} from 'lucide-react';
import { getApiPath, getBasePath } from '@/lib/api-helper';
import { useLanguage } from '@/lib/i18n';
import LanguageSwitch from '@/components/LanguageSwitch';

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();

  // Create exchange form state
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [exchangeDate, setExchangeDate] = useState('');
  const [password, setPassword] = useState('');
  const [customAdminKey, setCustomAdminKey] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Post creation modal state
  const [createdSession, setCreatedSession] = useState<{
    id: string;
    title: string;
    adminKey: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Quick join exchange state
  const [lookupInput, setLookupInput] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!title.trim()) {
      setCreateError(t('create.titleRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(getApiPath('/api/sessions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          budget: budget.trim() || undefined,
          exchangeDate: exchangeDate.trim() || undefined,
          password: password.trim() || undefined,
          adminKey: customAdminKey.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create exchange');
      }

      // Persist host adminKey locally for quick access
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`santa_admin_${data.session.id}`, data.adminKey);
        } catch {
          // ignore localStorage errors in private mode
        }
      }

      setCreatedSession({
        id: data.session.id,
        title: data.session.title,
        adminKey: data.adminKey,
      });
    } catch (err: unknown) {
      setCreateError((err as Error).message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);

    const raw = lookupInput.trim();
    if (!raw) {
      setLookupError(t('quickJoin.errorEmpty'));
      return;
    }

    // Extract ID if full URL is pasted
    let id = raw;
    if (raw.includes('/session/')) {
      id = raw.split('/session/')[1].split(/[?#/]/)[0];
    } else if (raw.startsWith('http://') || raw.startsWith('https://')) {
      const parts = raw.split('/');
      id = parts[parts.length - 1];
    }

    if (!id) {
      setLookupError(t('quickJoin.errorEmpty'));
      return;
    }

    router.push(`/session/${id}`);
  };

  const getSessionShareUrl = (id: string) => {
    if (typeof window === 'undefined') return `/session/${id}`;
    const base = getBasePath();
    return `${window.location.origin}${base}/session/${id}`;
  };

  const copyToClipboard = async (text: string, type: 'link' | 'key') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } else {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div>
      {/* First Block: Covers whole screen (min-h-screen) */}
      <section className="min-h-screen flex flex-col justify-between items-center text-center px-4 py-6 sm:py-10 relative z-10">
        {/* Language on top */}
        <div className="w-full flex justify-center pt-2 sm:pt-4">
          <LanguageSwitch />
        </div>

        {/* Big button in the middle: Styled as a festive Christmas Present! */}
        <div className="my-auto py-10 w-full flex justify-center px-4">
          <a
            href="#create"
            className="group relative inline-block p-8 sm:p-12 md:p-14 rounded-3xl bg-white hover:bg-red-50/20 border-4 border-red-600 hover:border-red-700 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer max-w-3xl w-full"
          >
            {/* Christmas Ribbon Bow Knot on Top */}
            <div className="absolute -top-7 sm:-top-9 left-1/2 -translate-x-1/2 text-4xl sm:text-6xl select-none pointer-events-none group-hover:scale-110 transition-transform filter drop-shadow-sm">
              🎀
            </div>

            {/* Vertical Ribbon Band */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 sm:w-12 bg-red-600/10 border-x-2 border-red-600/25 pointer-events-none"
            />

            {/* Horizontal Ribbon Band */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 sm:h-12 bg-red-600/10 border-y-2 border-red-600/25 pointer-events-none"
            />

            {/* Gift Tag in top corner */}
            <div className="absolute -top-3 right-6 sm:right-10 bg-amber-400 text-amber-950 text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs border border-amber-500">
              🏷️ {t('hero.word3')}
            </div>

            {/* Content inside the present: Single-line title with smaller font */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-center select-none flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                <span className="text-blue-600 group-hover:text-blue-700 transition-colors">{t('hero.word1')}</span>{' '}
                <span className="text-red-600 group-hover:text-red-700 transition-colors">{t('hero.word2')}</span>{' '}
                <span className="text-emerald-600 group-hover:text-emerald-700 transition-colors">{t('hero.word3')}</span>
              </h1>

              <span className="inline-flex items-center space-x-1.5 mt-4 text-xs sm:text-sm font-bold text-red-600 group-hover:text-red-700 transition-colors">
                <span>{t('hero.unwrapHint')}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </a>
        </div>

        {/* Small join room button at the bottom of first block */}
        <div className="pb-8 sm:pb-12">
          <a
            href="#join"
            className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 px-5 py-2.5 rounded-full shadow-xs transition active:scale-95"
          >
            <span>{t('hero.joinCta')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </section>

      {/* Main Interactive Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        {/* Create Exchange Card */}
        <section
          id="create"
          className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center space-x-3.5 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {t('create.cardTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {t('create.cardDesc')}
              </p>
            </div>
          </div>

          {createError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-2">
              <Info className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t('create.titleLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('create.titlePlaceholder')}
                className="w-full px-4 py-3.5 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 text-sm transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center space-x-1">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('create.budgetLabel')}</span>
                </label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder={t('create.budgetPlaceholder')}
                  className="w-full px-4 py-3.5 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('create.dateLabel')}</span>
                </label>
                <input
                  type="text"
                  value={exchangeDate}
                  onChange={(e) => setExchangeDate(e.target.value)}
                  placeholder="e.g. Dec 24, 2026 / 31.12.2026"
                  className="w-full px-4 py-3.5 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 text-sm transition"
                />
              </div>
            </div>

            {/* Optional / Advanced Settings */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-bold text-slate-600 hover:text-red-600 flex items-center space-x-1.5 transition"
              >
                <span>{showAdvanced ? t('create.hideAdvanced') : t('create.showAdvanced')}</span>
              </button>

              {showAdvanced && (
                <div className="mt-3 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center space-x-1">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t('create.passwordLabel')}</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('create.passwordPlaceholder')}
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      {t('create.passwordHint')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center space-x-1">
                      <Key className="w-3.5 h-3.5 text-red-600" />
                      <span>{t('create.adminKeyLabel')}</span>
                    </label>
                    <input
                      type="text"
                      value={customAdminKey}
                      onChange={(e) => setCustomAdminKey(e.target.value)}
                      placeholder={t('create.adminKeyPlaceholder')}
                      className="w-full px-4 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 text-sm font-mono"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      {t('create.adminKeyHint')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-2xl shadow-sm border border-red-600 flex items-center justify-center space-x-2 transition-all active:scale-[0.99] disabled:opacity-50 text-base"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('create.submittingBtn')}</span>
                </div>
              ) : (
                <span>{t('create.submitBtn')}</span>
              )}
            </button>
          </form>
        </section>

        {/* Join Existing Exchange & Quick Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Lookup Card */}
          <section
            id="join"
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative"
          >
            <div className="flex items-center space-x-3.5 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{t('quickJoin.title')}</h3>
                <p className="text-xs text-slate-500">{t('quickJoin.subtitle')}</p>
              </div>
            </div>

            {lookupError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {lookupError}
              </div>
            )}

            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value)}
                  placeholder={t('quickJoin.placeholder')}
                  className="w-full px-4 py-3.5 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 text-sm transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-5 rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition active:scale-[0.99]"
              >
                <span>{t('quickJoin.button')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </section>

          {/* Quick Santa Promise Card */}
          <div className="bg-emerald-50 rounded-3xl p-6 sm:p-7 border border-emerald-200 shadow-sm">
            <h4 className="font-bold text-emerald-800 text-sm uppercase tracking-wider flex items-center space-x-2 mb-2">
              <span>🎁</span>
              <span>100% Fair & Private</span>
            </h4>
            <p className="text-xs sm:text-sm text-emerald-900/80 leading-relaxed">
              Every participant draws exactly one secret elf and receives a gift from exactly one Secret Santa. No self-matches, no leaks, zero cost.
            </p>
          </div>
        </div>
      </div>
    </div>

      {/* Post-Creation Modal / Overlay */}
      {createdSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative text-slate-900">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-3xl mx-auto mb-3 text-white shadow-sm">
                🎅
              </div>
              <h3 className="text-2xl font-black text-slate-900">{t('createdModal.title')}</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                &ldquo;{createdSession.title}&rdquo; {t('createdModal.desc')}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Shareable Link Box */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {t('createdModal.step1')}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={getSessionShareUrl(createdSession.id)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-800 font-mono truncate"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(getSessionShareUrl(createdSession.id), 'link')
                    }
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400 inline mr-1" />
                        <span>{t('createdModal.copied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 inline mr-1" />
                        <span>{t('createdModal.copy')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Admin Key Warning Box */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-start space-x-2.5">
                  <Key className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                      ⚠️ {t('createdModal.adminWarningTitle')}
                    </p>
                    <p className="text-[11px] text-amber-800 mt-1 mb-2">
                      {t('createdModal.adminWarningDesc')}
                    </p>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-mono font-bold select-all truncate border border-amber-300">
                        {createdSession.adminKey}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(createdSession.adminKey, 'key')}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition flex items-center space-x-1"
                      >
                        {copiedKey ? (
                          <Check className="w-3.5 h-3.5 inline mr-1" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 inline mr-1" />
                        )}
                        <span>{copiedKey ? t('createdModal.saved') : t('createdModal.copy')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href={`/session/${createdSession.id}`}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-5 rounded-2xl text-center shadow-sm flex items-center justify-center space-x-2 transition"
              >
                <span>{t('createdModal.enterRoom')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
