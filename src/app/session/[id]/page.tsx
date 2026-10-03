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
  Euro,
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
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import { getApiPath, getBasePath } from '@/lib/api-helper';
import { useLanguage } from '@/lib/i18n';
import LanguageSwitch from '@/components/LanguageSwitch';
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
        body: JSON.stringify({ adminKey: adminKey.trim(), locale }),
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
          colors: ['#dc2626', '#16a34a', '#2563eb', '#f59e0b'],
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

  // Handle deleting a participant (host admin only)
  const handleDeleteParticipant = async (participantId: string, participantName: string) => {
    let keyToUse = adminKey.trim();
    if (!keyToUse) {
      const prompted = window.prompt(t('session.enterAdminKeyToManage'));
      if (!prompted || !prompted.trim()) return;
      keyToUse = prompted.trim();
      setAdminKey(keyToUse);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`santa_admin_${sessionId}`, keyToUse);
        } catch {
          // ignore
        }
      }
    }

    const confirmMsg = t('session.confirmRemoveParticipant', { name: participantName });
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(
        getApiPath(`/api/sessions/${sessionId}/participants/${participantId}`),
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': keyToUse,
          },
          body: JSON.stringify({ adminKey: keyToUse }),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to remove participant');
      }

      // Optimistically update session participants
      setSession((prev) =>
        prev
          ? {
              ...prev,
              participants: (prev.participants || []).filter((p) => p.id !== participantId),
            }
          : null
      );
      await fetchSession();
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to remove participant');
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
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4 text-red-600 animate-spin">
          <Gift className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{t('session.loading')}</h2>
      </div>
    );
  }

  // Not Found / Error Screen
  if (fetchError || !session) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4 text-red-600">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('session.notFound')}</h2>
        <p className="text-sm text-slate-600 mb-6">
          {fetchError || 'This Secret Santa room does not exist.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-2xl shadow-sm transition"
        >
          <span>{t('session.backHome')}</span>
        </Link>
      </div>
    );
  }

  // Password Gate Screen
  if (session.isPasswordProtected && !session.isUnlocked) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-8 sm:py-16 animate-fadeIn">
        {/* Top Language Switcher */}
        <div className="mb-4 flex justify-center">
          <LanguageSwitch />
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center w-full max-w-full overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-1 break-words break-all min-w-0 max-w-full">
            {session.title}
          </h2>

          <p className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-4">
            🔒 {t('session.passwordProtected')}
          </p>

          <p className="text-xs sm:text-sm text-slate-600 mb-6">
            {t('session.gateDesc')}
          </p>

          {unlockError && (
            <div className="mb-5 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{unlockError}</span>
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4 w-full min-w-0">
            <input
              type="password"
              required
              autoFocus
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder={t('session.gatePlaceholder')}
              className="w-full max-w-full min-w-0 h-[52px] px-4 py-3.5 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 text-center text-sm focus:outline-none focus:border-blue-600 font-medium box-border"
            />

            <button
              type="submit"
              disabled={isUnlocking}
              className="w-full h-[52px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-5 rounded-2xl shadow-sm transition active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50"
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

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link href="/" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('session.backHome')}</span>
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 sm:py-6 space-y-6">
      {/* Top Center Language Switcher */}
      <LanguageSwitch />

      {/* Return to Main Page Button */}
      <div className="flex items-center justify-start pt-1">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 px-4 py-2 rounded-full shadow-xs transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>{t('session.backHome')}</span>
        </Link>
      </div>

      {/* Session Header Card */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                  isLocked
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLocked ? 'bg-amber-600' : 'bg-emerald-600 animate-pulse'
                  }`}
                />
                <span>{isLocked ? t('session.statusLocked') : t('session.statusOpen')}</span>
              </span>

              {session.isPasswordProtected && (
                <span className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  <Lock className="w-3 h-3 text-blue-600" />
                  <span>{t('session.passwordProtected')}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight break-words break-all min-w-0 max-w-full">
              {session.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-700 pt-1">
              {session.budget && (
                <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <Euro className="w-4 h-4 text-blue-600" />
                  <span>{t('session.budget')} <strong className="text-slate-900">{session.budget}</strong></span>
                </div>
              )}
              {session.exchangeDate && (
                <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>{t('session.exchangeDate')} <strong className="text-slate-900">{session.exchangeDate}</strong></span>
                </div>
              )}
              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <Users className="w-4 h-4 text-red-600" />
                <span>
                  {participantCount === 1
                    ? t('session.oneElfJoined')
                    : t('session.elvesJoined', { count: participantCount })}
                </span>
              </div>
            </div>
          </div>

          {/* Host Controls Trigger Button */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
            <button
              onClick={() => setShowHostModal(true)}
              className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-xs"
            >
              <Key className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('session.hostControls')}</span>
            </button>
            <button
              onClick={fetchSession}
              title={t('session.refresh')}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Shareable Invite Action (no raw ID or overflowing text input) */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 min-w-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center flex-shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {t('session.shareBarLabel')}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {locale === 'ru' ? 'Скопируйте ссылку и отправьте участникам' : 'Copy link and share with participants to join'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={copyShareLink}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition active:scale-95 shadow-xs flex-shrink-0 cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{t('session.copied')}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>{t('session.copyLink')}</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Draw Complete Locked Banner (if LOCKED) */}
      {isLocked && (
        <section className="bg-red-50 rounded-3xl p-6 sm:p-8 border-2 border-red-200 shadow-sm relative overflow-hidden animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-white border border-red-200 flex items-center justify-center text-3xl flex-shrink-0 shadow-xs">
              🎄
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-black text-red-900">
                {t('session.lockedBannerTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-red-800 mt-1 leading-relaxed">
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
          <section className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t('session.joinTitle')}</h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {t('session.joinDesc')}
                </p>
              </div>
            </div>

            {joinError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{joinError}</span>
              </div>
            )}

            {joinSuccess && (
              <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{joinSuccess}</span>
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {t('session.firstName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('session.firstNamePlaceholder')}
                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {t('session.lastName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder={t('session.lastNamePlaceholder')}
                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>{t('session.email')} <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('session.emailPrivacyBadge')}</span>
                  </span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('session.emailPlaceholder')}
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-red-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {t('session.emailPrivacyHint')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>{t('session.wishlist')}</span>
                  <span className="text-[10px] text-blue-700 font-bold flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t('session.wishlistAiBadge')}</span>
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={wishlist}
                  onChange={(e) => setWishlist(e.target.value)}
                  placeholder={t('session.wishlistPlaceholder')}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-red-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('session.hobbies')}
                </label>
                <input
                  type="text"
                  value={hobbies}
                  onChange={(e) => setHobbies(e.target.value)}
                  placeholder={t('session.hobbiesPlaceholder')}
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-red-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {t('session.hobbiesHint')}
                </p>
              </div>

              <button
                type="submit"
                disabled={isJoining}
                className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition active:scale-[0.99] disabled:opacity-50 text-base"
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
          <section className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-slate-900 flex items-center space-x-2">
              <Gift className="w-5 h-5 text-red-600" />
              <span>{t('session.summaryTitle')}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('session.summaryDesc', { count: participantCount })}
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">{t('session.totalPairs')}</span>
                <span className="font-bold text-slate-900">{participantCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">{t('session.matchingMode')}</span>
                <span className="font-bold text-emerald-700">{t('session.matchingModeVal')}</span>
              </div>
              {session.exchangeDate && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">{t('session.exchangeDay')}</span>
                  <span className="font-bold text-blue-700">{session.exchangeDate}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Right Column: Safe Participant Roster */}
        <section className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-slate-900">{t('session.rosterTitle')}</h2>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {participantCount === 1 ? t('session.oneElfJoined') : t('session.elvesJoined', { count: participantCount })}
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            {t('session.rosterSubtitle')}
          </p>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {participants.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-2 text-slate-500">
                  🎅
                </div>
                <p className="text-xs text-slate-500">
                  {t('session.emptyRoster')}
                </p>
              </div>
            ) : (
              participants.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {p.name} {p.surname}
                      </p>
                      <p className="text-[10px] text-slate-500 flex items-center space-x-1">
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
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {locale === 'ru' ? 'Готов 🎁' : 'Ready 🎁'}
                    </span>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => handleDeleteParticipant(p.id, `${p.name} ${p.surname}`)}
                        title={t('session.removeParticipant')}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-center space-x-2 text-[11px] text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>{t('session.privacyFooter')}</span>
          </div>
        </section>
      </div>

      {/* Host Controls Modal */}
      {showHostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative text-slate-900">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{t('session.hostModalTitle')}</h3>
                  <p className="text-xs text-slate-500">{t('session.hostModalDesc')}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowHostModal(false);
                  setShowConfirmDraw(false);
                  setDrawError(null);
                }}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {drawError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{drawError}</span>
              </div>
            )}

            {drawSuccess && (
              <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{drawSuccess}</span>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {t('session.hostKeyLabel')}
                </label>
                <input
                  type="text"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder={t('session.hostKeyPlaceholder')}
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-900 font-mono text-xs sm:text-sm focus:outline-none focus:border-red-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {t('session.hostKeyHint')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Current Participants:</span>
                  <strong className="text-slate-900">{participantCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={isLocked ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
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
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>
                  {isLocked
                    ? t('session.drawAlreadyCompleted')
                    : participantCount < 2
                    ? t('session.needMoreElves', { count: participantCount })
                    : t('session.startDrawBtn')}
                </span>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-3">
                <p className="text-xs font-bold text-red-900">
                  ⚠️ {t('session.confirmTitle')}
                </p>
                <p className="text-[11px] text-red-800 leading-relaxed">
                  {t('session.confirmDesc', { count: participantCount })}
                </p>
                <div className="flex items-center space-x-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowConfirmDraw(false)}
                    disabled={isDrawing}
                    className="flex-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold py-2.5 px-4 rounded-xl transition"
                  >
                    {t('session.confirmCancel')}
                  </button>
                  <button
                    type="button"
                    onClick={handleDraw}
                    disabled={isDrawing}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5"
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
