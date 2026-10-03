'use client';

import { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  Gift,
  Lock,
  Unlock,
  Key,
  Calendar,
  DollarSign,
  Users,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Send,
  ShieldCheck,
  Clock,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { getApiPath, getBasePath } from '@/lib/api-helper';
import { useLanguage } from '@/lib/i18n';
import type { PublicSession, PublicParticipant } from '@/lib/privacy';

interface SessionData extends Partial<PublicSession> {
  id: string;
  title: string;
  isPasswordProtected: boolean;
  isUnlocked: boolean;
  status: string;
  budget?: string | null;
  exchangeDate?: string | null;
  participantCount?: number;
  participants?: PublicParticipant[];
}

export default function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;
  const { t, locale } = useLanguage();

  // Session state
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Password gate state
  const [passwordInput, setPasswordInput] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Join form state
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [wishlist, setWishlist] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  // Host Controls state
  const [showHostModal, setShowHostModal] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [drawSuccess, setDrawSuccess] = useState<string | null>(null);
  const [showConfirmDraw, setShowConfirmDraw] = useState(false);

  // UI state
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch session data
  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const res = await fetch(getApiPath(`/api/sessions/${sessionId}`), {
        cache: 'no-store',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load exchange');
      }

      setSession(data);
    } catch (err: unknown) {
      setFetchError((err as Error).message || 'Failed to load exchange');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();

    // Check localStorage for saved admin key
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem(`santa_admin_${sessionId}`);
      if (savedKey) {
        setAdminKey(savedKey);
      }
    }
  }, [sessionId, fetchSession]);

  // Handle password unlock
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);

    if (!passwordInput.trim()) {
      setUnlockError(t('quickJoin.errorEmpty'));
      return;
    }

    try {
      setIsUnlocking(true);
      const res = await fetch(getApiPath(`/api/sessions/${sessionId}/verify-password`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Incorrect password');
      }

      // Re-fetch full session data now unlocked
      await fetchSession();
    } catch (err: unknown) {
      setUnlockError((err as Error).message || 'Incorrect password');
    } finally {
      setIsUnlocking(false);
    }
  };

  // Handle joining exchange
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    setJoinSuccess(null);

    if (!name.trim() || !surname.trim() || !email.trim()) {
      setJoinError('Name, surname, and email are required');
      return;
    }

    try {
      setIsJoining(true);
      const res = await fetch(getApiPath(`/api/sessions/${sessionId}/join`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          surname: surname.trim(),
          email: email.trim().toLowerCase(),
          wishlist: wishlist.trim() || undefined,
          hobbies: hobbies.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to join exchange');
      }

      setJoinSuccess(t('session.joinSuccess'));

      // Clear input fields
      setName('');
      setSurname('');
      setEmail('');
      setWishlist('');
      setHobbies('');

      // Refresh participant list
      await fetchSession();
    } catch (err: unknown) {
      setJoinError((err as Error).message || 'Could not join');
    } finally {
      setIsJoining(false);
    }
  };

  // Handle Secret Santa draw
  const handleDraw = async () => {
    setDrawError(null);
    setDrawSuccess(null);

    if (!adminKey.trim()) {
      setDrawError(t('session.hostKeyPlaceholder'));
      return;
    }

    try {
      setIsDrawing(true);
      setShowConfirmDraw(false);

      const res = await fetch(getApiPath(`/api/sessions/${sessionId}/draw`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey: adminKey.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete draw');
      }

      // Celebration confetti!
      try {
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#ef4444', '#10b981', '#fbbf24', '#f8fafc'],
        });
      } catch {
        // fallback
      }

      setDrawSuccess(
        `🎅 ${data.matchesDrawn} pairs matched! Secret emails dispatched.`
      );

      // Refresh session state to show locked banner
      await fetchSession();
    } catch (err: unknown) {
      setDrawError((err as Error).message || 'Could not trigger draw');
    } finally {
      setIsDrawing(false);
    }
  };

  const copyShareLink = async () => {
    if (typeof window === 'undefined') return;
    const base = getBasePath();
    const url = `${window.location.origin}${base}/session/${sessionId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  // Loading Screen
  if (loading && !session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-red-950 border border-red-800 flex items-center justify-center mx-auto mb-4 animate-spin">
          <Gift className="w-8 h-8 text-amber-300" />
        </div>
        <h2 className="text-xl font-bold text-white">{t('session.loading')}</h2>
      </div>
    );
  }

  // Not Found / Error Screen
  if (fetchError || !session) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-red-950 border border-red-700 flex items-center justify-center mx-auto mb-4 text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{t('session.notFound')}</h2>
        <p className="text-sm text-slate-300 mb-6">
          {fetchError || 'This Secret Santa room does not exist.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow transition hover:scale-105"
        >
          <span>{t('session.backHome')}</span>
        </Link>
      </div>
    );
  }

  // Password Gate Screen
  if (session.isPasswordProtected && !session.isUnlocked) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-fadeIn">
        <div className="glass-panel-gold rounded-2xl p-6 sm:p-8 shadow-2xl border border-amber-500/30 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-950 border border-amber-700 flex items-center justify-center mx-auto mb-4 text-amber-300">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white mb-1">{session.title}</h2>
          <p className="text-xs text-amber-300 font-medium uppercase tracking-wider mb-6">
            🔒 {t('session.passwordProtected')}
          </p>

          <p className="text-xs sm:text-sm text-slate-300 mb-6">
            {t('session.gateDesc')}
          </p>

          {unlockError && (
            <div className="mb-5 p-3 rounded-xl bg-red-950 border border-red-800 text-red-200 text-xs flex items-center justify-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{unlockError}</span>
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="password"
              required
              autoFocus
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder={t('session.gatePlaceholder')}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-center text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium"
            />

            <button
              type="submit"
              disabled={isUnlocking}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-5 rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isUnlocking ? (
                <span>{t('session.gateCheckingBtn')}</span>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>{t('session.gateUnlockBtn')}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition">
              {t('session.backHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLocked = session.status === 'LOCKED';
  const participants = session.participants || [];
  const participantCount = session.participantCount ?? participants.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Session Header Card */}
      <section className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isLocked
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLocked ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                  }`}
                />
                <span>{isLocked ? t('session.statusLocked') : t('session.statusOpen')}</span>
              </span>

              {session.isPasswordProtected && (
                <span className="inline-flex items-center space-x-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>{t('session.passwordProtected')}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {session.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 pt-1">
              {session.budget && (
                <div className="flex items-center space-x-1.5 bg-slate-900 px-3 py-1 rounded-lg border border-white/5">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>{t('session.budget')} <strong className="text-white">{session.budget}</strong></span>
                </div>
              )}
              {session.exchangeDate && (
                <div className="flex items-center space-x-1.5 bg-slate-900 px-3 py-1 rounded-lg border border-white/5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>{t('session.exchangeDate')} <strong className="text-white">{session.exchangeDate}</strong></span>
                </div>
              )}
              <div className="flex items-center space-x-1.5 bg-slate-900 px-3 py-1 rounded-lg border border-white/5">
                <Users className="w-4 h-4 text-blue-400" />
                <span>
                  {participantCount === 1
                    ? t('session.oneElfJoined')
                    : t('session.elvesJoined', { count: participantCount })}
                </span>
              </div>
            </div>
          </div>

          {/* Host Controls Trigger Button */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2">
            <button
              onClick={() => setShowHostModal(true)}
              className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl border border-white/10 transition shadow-sm"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('session.hostControls')}</span>
            </button>
            <button
              onClick={fetchSession}
              title={t('session.refresh')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Shareable Link Bar */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1 flex-shrink-0">
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('session.shareBarLabel')}</span>
            </span>
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={
                  typeof window !== 'undefined'
                    ? `${window.location.origin}${getBasePath()}/session/${sessionId}`
                    : `/session/${sessionId}`
                }
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-300 font-mono truncate"
              />
              <button
                type="button"
                onClick={copyShareLink}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-white/10 flex items-center space-x-1.5 transition flex-shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">{t('session.copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-300" />
                    <span>{t('session.copyLink')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Draw Complete Locked Banner (if LOCKED) */}
      {isLocked && (
        <section className="glass-panel-gold rounded-2xl p-6 sm:p-8 border border-amber-500/40 shadow-xl relative overflow-hidden animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-amber-950 border border-amber-700 flex items-center justify-center text-3xl flex-shrink-0">
              🎄
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {t('session.lockedBannerTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-amber-200 mt-1 leading-relaxed">
                {t('session.lockedBannerDesc')}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Main Two-Column Layout (Form + Roster) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sign-up Form (If OPEN) */}
        {!isLocked ? (
          <section className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-7 border border-white/10 shadow-xl">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{t('session.joinTitle')}</h2>
                <p className="text-xs text-slate-400">
                  {t('session.joinDesc')}
                </p>
              </div>
            </div>

            {joinError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-950 border border-red-800 text-red-200 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{joinError}</span>
              </div>
            )}

            {joinSuccess && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-200 text-xs sm:text-sm flex items-start space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{joinSuccess}</span>
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    {t('session.firstName')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('session.firstNamePlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    {t('session.lastName')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder={t('session.lastNamePlaceholder')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>{t('session.email')} <span className="text-red-400">*</span></span>
                  <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{t('session.emailPrivacyBadge')}</span>
                  </span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('session.emailPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {t('session.emailPrivacyHint')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>{t('session.wishlist')}</span>
                  <span className="text-[10px] text-amber-300 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{t('session.wishlistAiBadge')}</span>
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={wishlist}
                  onChange={(e) => setWishlist(e.target.value)}
                  placeholder={t('session.wishlistPlaceholder')}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  {t('session.hobbies')}
                </label>
                <input
                  type="text"
                  value={hobbies}
                  onChange={(e) => setHobbies(e.target.value)}
                  placeholder={t('session.hobbiesPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {t('session.hobbiesHint')}
                </p>
              </div>

              <button
                type="submit"
                disabled={isJoining}
                className="w-full mt-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-red-950/50 border border-red-500 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isJoining ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('session.joiningBtn')}</span>
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('session.joinBtn')}</span>
                  </>
                )}
              </button>
            </form>
          </section>
        ) : (
          <section className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-7 border border-white/10 shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-white flex items-center space-x-2">
              <Gift className="w-5 h-5 text-amber-400" />
              <span>{t('session.summaryTitle')}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t('session.summaryDesc', { count: participantCount })}
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">{t('session.totalPairs')}</span>
                <span className="font-bold text-white">{participantCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">{t('session.matchingMode')}</span>
                <span className="font-medium text-emerald-400">{t('session.matchingModeVal')}</span>
              </div>
              {session.exchangeDate && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">{t('session.exchangeDay')}</span>
                  <span className="font-bold text-amber-300">{session.exchangeDate}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Right Column: Safe Participant Roster */}
        <section className="lg:col-span-5 glass-panel rounded-2xl p-6 sm:p-7 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">{t('session.rosterTitle')}</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              {participantCount === 1 ? t('session.oneElfJoined') : t('session.elvesJoined', { count: participantCount })}
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            {t('session.rosterSubtitle')}
          </p>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {participants.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl bg-slate-900/60 border border-dashed border-slate-800">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                  🎅
                </div>
                <p className="text-xs text-slate-300">
                  {t('session.emptyRoster')}
                </p>
              </div>
            ) : (
              participants.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-white/5 hover:border-white/10 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {p.name} {p.surname}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          {new Date(p.joinedAt).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400">Ready 🎁</span>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 p-3 rounded-xl bg-slate-900 border border-white/5 flex items-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{t('session.privacyFooter')}</span>
          </div>
        </section>
      </div>

      {/* Host Controls Modal */}
      {showHostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-red max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-2xl border border-red-500/40 relative">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-700 flex items-center justify-center text-amber-300">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{t('session.hostModalTitle')}</h3>
                  <p className="text-xs text-red-200">{t('session.hostModalDesc')}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowHostModal(false);
                  setShowConfirmDraw(false);
                  setDrawError(null);
                }}
                className="text-slate-400 hover:text-white text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {drawError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-950 border border-red-800 text-red-200 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{drawError}</span>
              </div>
            )}

            {drawSuccess && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-200 text-xs flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{drawSuccess}</span>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  {t('session.hostKeyLabel')}
                </label>
                <input
                  type="text"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder={t('session.hostKeyPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-red-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {t('session.hostKeyHint')}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Current Participants:</span>
                  <strong className="text-white">{participantCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={isLocked ? 'text-amber-400' : 'text-emerald-400'}>
                    {isLocked ? t('session.statusLocked') : t('session.statusOpen')}
                  </span>
                </div>
              </div>
            </div>

            {/* Draw Action Buttons */}
            {!showConfirmDraw ? (
              <button
                type="button"
                disabled={isLocked || participantCount < 2 || isDrawing}
                onClick={() => setShowConfirmDraw(true)}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg border border-red-500 flex items-center justify-center space-x-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {isLocked
                    ? t('session.drawAlreadyCompleted')
                    : participantCount < 2
                    ? t('session.needMoreElves', { count: participantCount })
                    : t('session.startDrawBtn')}
                </span>
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-red-950 border border-red-600 space-y-3">
                <p className="text-xs font-bold text-white">
                  ⚠️ {t('session.confirmTitle')}
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {t('session.confirmDesc', { count: participantCount })}
                </p>
                <div className="flex items-center space-x-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowConfirmDraw(false)}
                    disabled={isDrawing}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-lg transition"
                  >
                    {t('session.confirmCancel')}
                  </button>
                  <button
                    type="button"
                    onClick={handleDraw}
                    disabled={isDrawing}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-md transition flex items-center justify-center space-x-1.5"
                  >
                    {isDrawing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{t('session.drawingBtn')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('session.confirmYes')}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
