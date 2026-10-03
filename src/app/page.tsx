'use client';

import { useState, useRef } from 'react';
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
  Euro,
  Key,
  Info,
} from 'lucide-react';
import { getApiPath, getBasePath } from '@/lib/api-helper';
import { useLanguage } from '@/lib/i18n';
import LanguageSwitch from '@/components/LanguageSwitch';

export default function HomePage() {
  const router = useRouter();
  const { t, locale } = useLanguage();

  // Create exchange form state
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [exchangeDate, setExchangeDate] = useState('');
  const dateInputRef = useRef<HTMLInputElement>(null);
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

  const scrollToCenter = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.history.pushState(null, '', `#${targetId}`);
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

        {/* Main Hero: Big Christmas Present Button with writing underneath */}
        <div className="my-auto py-8 sm:py-10 w-full flex justify-center px-4">
          <a
            href="#create"
            onClick={(e) => scrollToCenter(e, 'create')}
            className="group relative inline-flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
          >
            {/* Big Christmas Gift Box with Bottom, Lid, Ribbon and Lines */}
            <div className="group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-300 filter drop-shadow-xl group-hover:drop-shadow-2xl">
              <svg
                viewBox="0 0 320 300"
                className="w-64 sm:w-80 md:w-96 h-auto select-none pointer-events-none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* --- Bottom Box Body --- */}
                <g>
                  {/* Bottom Box Container (Red with yellow border on hover) */}
                  <rect
                    x="36"
                    y="110"
                    width="248"
                    height="170"
                    rx="14"
                    fill="#DC2626"
                    className="stroke-red-600 group-hover:stroke-yellow-400 transition-colors duration-200"
                    strokeWidth="4"
                  />

                  {/* Vertical Ribbon line running down the bottom box */}
                  <rect x="142" y="110" width="36" height="170" fill="#FACC15" />
                  <line x1="142" y1="110" x2="142" y2="280" stroke="#CA8A04" strokeWidth="1.5" />
                  <line x1="178" y1="110" x2="178" y2="280" stroke="#CA8A04" strokeWidth="1.5" />

                  {/* Horizontal Ribbon line running across the bottom box */}
                  <rect x="36" y="177" width="248" height="36" fill="#FACC15" />
                  <line x1="36" y1="177" x2="284" y2="177" stroke="#CA8A04" strokeWidth="1.5" />
                  <line x1="36" y1="213" x2="284" y2="213" stroke="#CA8A04" strokeWidth="1.5" />

                  {/* Center Ribbon Intersection on Bottom */}
                  <rect x="142" y="177" width="36" height="36" fill="#FDE047" />

                  {/* Lid Overhang Shadow on Bottom Box */}
                  <rect x="36" y="110" width="248" height="14" fill="#991B1B" opacity="0.35" />

                  {/* Bottom Rim Depth Shadow */}
                  <rect x="36" y="268" width="248" height="12" rx="6" fill="#7F1D1D" opacity="0.25" />
                </g>

                {/* --- Box Lid (Slightly wider with overhanging edges) --- */}
                <g>
                  {/* Lid Container (Red with yellow border on hover) */}
                  <rect
                    x="20"
                    y="60"
                    width="280"
                    height="52"
                    rx="12"
                    fill="#DC2626"
                    className="stroke-red-600 group-hover:stroke-yellow-400 transition-colors duration-200"
                    strokeWidth="4"
                  />

                  {/* Vertical Ribbon line running across the lid */}
                  <rect x="142" y="60" width="36" height="52" fill="#FACC15" />
                  <line x1="142" y1="60" x2="142" y2="112" stroke="#CA8A04" strokeWidth="1.5" />
                  <line x1="178" y1="60" x2="178" y2="112" stroke="#CA8A04" strokeWidth="1.5" />

                  {/* Lid Horizontal Lip Line */}
                  <line x1="20" y1="104" x2="300" y2="104" stroke="#991B1B" strokeWidth="2" opacity="0.5" />
                </g>

                {/* --- Ribbon Bow on Top of the Lid --- */}
                <g className="group-hover:scale-105 group-hover:-translate-y-1 transition-transform duration-200 origin-bottom">
                  {/* Left Ribbon Tail */}
                  <path
                    d="M148 50 C136 66, 122 84, 108 102 L124 98 L132 106 C140 88, 146 70, 152 52 Z"
                    fill="#FACC15"
                    stroke="#CA8A04"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* Right Ribbon Tail */}
                  <path
                    d="M172 50 C184 66, 198 84, 212 102 L196 98 L188 106 C180 88, 174 70, 168 52 Z"
                    fill="#FACC15"
                    stroke="#CA8A04"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />

                  {/* Left Outer Loop */}
                  <path
                    d="M160 46 C128 10, 80 14, 86 42 C92 64, 136 56, 158 50 Z"
                    fill="#FACC15"
                    stroke="#CA8A04"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  {/* Left Inner Fold */}
                  <path
                    d="M148 44 C126 24, 98 28, 104 44 C110 54, 134 50, 148 46 Z"
                    fill="#EAB308"
                    opacity="0.5"
                  />

                  {/* Right Outer Loop */}
                  <path
                    d="M160 46 C192 10, 240 14, 234 42 C228 64, 184 56, 162 50 Z"
                    fill="#FACC15"
                    stroke="#CA8A04"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  {/* Right Inner Fold */}
                  <path
                    d="M172 44 C194 24, 222 28, 216 44 C210 54, 186 50, 172 46 Z"
                    fill="#EAB308"
                    opacity="0.5"
                  />

                  {/* Center Knot */}
                  <ellipse cx="160" cy="48" rx="14" ry="12" fill="#FDE047" stroke="#CA8A04" strokeWidth="2.5" />
                  <path d="M154 44 C154 48, 155 52, 157 55" stroke="#CA8A04" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M166 43 C167 47, 167 51, 165 55" stroke="#CA8A04" strokeWidth="1.5" strokeLinecap="round" />
                </g>
              </svg>
            </div>

            {/* Writing strictly UNDER the box */}
            <h1 className="mt-6 sm:mt-8 text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-black text-center select-none group-hover:text-red-600 transition-colors">
              {t('hero.word1')} {t('hero.word2')} {t('hero.word3')}
            </h1>
          </a>
        </div>

        {/* Small join room button at the bottom of first block */}
        <div className="pb-8 sm:pb-12">
          <a
            href="#join"
            onClick={(e) => scrollToCenter(e, 'join')}
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
          className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-10 border border-slate-200 shadow-sm relative overflow-hidden"
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

          <form onSubmit={handleCreate} className="space-y-5 w-full min-w-0">
            <div className="w-full min-w-0">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t('create.titleLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('create.titlePlaceholder')}
                className="w-full max-w-full min-w-0 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 text-base sm:text-sm transition box-border"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full min-w-0">
              <div className="w-full min-w-0">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center space-x-1">
                  <Euro className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="truncate">{t('create.budgetLabel')}</span>
                </label>
                <div className="relative flex items-center w-full min-w-0">
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder={t('create.budgetPlaceholder')}
                    className="w-full max-w-full min-w-0 pr-12 pl-3.5 sm:pl-4 py-3 sm:py-3.5 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 text-base sm:text-sm transition box-border"
                  />
                  <button
                    type="button"
                    title="Insert €"
                    onClick={() => {
                      setBudget((prev) => {
                        const trimmed = prev.trim();
                        if (!trimmed) return '€ ';
                        if (trimmed.includes('€')) return trimmed;
                        return `${trimmed} €`;
                      });
                    }}
                    className="absolute right-2 px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition active:scale-95 border border-slate-200 select-none cursor-pointer"
                  >
                    + €
                  </button>
                </div>
                {/* Quick Euro preset chips */}
                <div className="flex items-center flex-wrap gap-1.5 mt-2">
                  {['15 €', '25 €', '50 €', '100 €'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBudget(preset)}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 border border-slate-200 transition active:scale-95 cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full min-w-0">
                <label
                  htmlFor="exchange-date-input"
                  onClick={() => {
                    try {
                      dateInputRef.current?.showPicker();
                    } catch {
                      dateInputRef.current?.focus();
                    }
                  }}
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center space-x-1 cursor-pointer select-none"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">{t('create.dateLabel')}</span>
                </label>
                <div
                  onClick={() => {
                    try {
                      dateInputRef.current?.showPicker();
                    } catch {
                      dateInputRef.current?.focus();
                    }
                  }}
                  className="relative w-full max-w-full min-w-0 cursor-pointer overflow-hidden rounded-xl border-2 border-slate-200 focus-within:border-red-600 transition bg-white"
                >
                  <input
                    ref={dateInputRef}
                    id="exchange-date-input"
                    type="date"
                    value={exchangeDate}
                    onChange={(e) => setExchangeDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker();
                      } catch {}
                    }}
                    className="w-full max-w-full min-w-0 block pr-10 pl-3.5 sm:pl-4 py-3 sm:py-3.5 bg-transparent border-0 text-slate-900 placeholder-slate-400 focus:outline-none text-base sm:text-sm transition cursor-pointer box-border appearance-none [-webkit-appearance:none] [color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-date-and-time-value]:text-left [&::-webkit-date-and-time-value]:m-0"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
                {/* Quick Date preset chips */}
                <div className="flex items-center flex-wrap gap-1.5 mt-2">
                  {[
                    { label: locale === 'ru' ? '24 дек' : 'Dec 24', val: `${new Date().getFullYear()}-12-24` },
                    { label: locale === 'ru' ? '25 дек' : 'Dec 25', val: `${new Date().getFullYear()}-12-25` },
                    { label: locale === 'ru' ? '31 дек' : 'Dec 31', val: `${new Date().getFullYear()}-12-31` },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setExchangeDate(preset.val)}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-600 border border-slate-200 transition active:scale-95 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white max-w-lg w-full max-w-[calc(100vw-1.5rem)] rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-200 relative text-slate-900 overflow-hidden my-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-3xl mx-auto mb-3 text-white shadow-sm">
                🎅
              </div>
              <h3 className="text-2xl font-black text-slate-900">{t('createdModal.title')}</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                &ldquo;{createdSession.title}&rdquo; {t('createdModal.desc')}
              </p>
            </div>

            <div className="space-y-4 mb-6 min-w-0">
              {/* Shareable Link Box */}
              <div className="min-w-0">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  {t('createdModal.step1')}
                </label>
                <div className="flex items-center space-x-2 min-w-0">
                  <input
                    type="text"
                    readOnly
                    value={getSessionShareUrl(createdSession.id)}
                    className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-800 font-mono truncate"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(getSessionShareUrl(createdSession.id), 'link')
                    }
                    className="flex-shrink-0 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
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
              <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200 min-w-0">
                <div className="flex items-start space-x-2.5 min-w-0">
                  <Key className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                      ⚠️ {t('createdModal.adminWarningTitle')}
                    </p>
                    <p className="text-[11px] text-amber-800 mt-1 mb-2 leading-relaxed">
                      {t('createdModal.adminWarningDesc')}
                    </p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2 w-full min-w-0">
                      <code className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-mono font-bold select-all truncate border border-amber-300 block text-center sm:text-left">
                        {createdSession.adminKey}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(createdSession.adminKey, 'key')}
                        className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition flex items-center justify-center space-x-1 active:scale-95 cursor-pointer"
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
