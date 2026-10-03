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
      setUnlockError('Please enter the password');
      return;
    }

    try {
      setIsUnlocking(true);
      const res = await fetch(
        getApiPath(`/api/sessions/${sessionId}/verify-password`),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: passwordInput.trim() }),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Incorrect password');
      }

      // Password verified! Refresh session
      await fetchSession();
    } catch (err: unknown) {
      setUnlockError((err as Error).message || 'Verification failed');
    } finally {
      setIsUnlocking(false);
    }
  };

  // Handle participant join
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    setJoinSuccess(null);

    if (!name.trim() || !surname.trim() || !email.trim()) {
      setJoinError('First name, last name, and email are required');
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
          email: email.trim(),
          wishlist: wishlist.trim() || undefined,
          hobbies: hobbies.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to join exchange');
      }

      // Confetti burst! 🎉
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#c41e3a', '#165b33', '#f8b229', '#ffffff'],
        });
      } catch {
        // confetti fallback
      }

      setJoinSuccess(
        `Welcome to the workshop, ${data.name}! You're registered. Santa will email your match when the host initiates the draw.`
      );

      // Reset form
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
      setDrawError('Please enter your host admin key');
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

      // Massive holiday celebration confetti!
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
        `Ho ho ho! Successfully matched ${data.matchesDrawn} participants and dispatched all Secret Santa emails!`
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
        <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4 animate-spin">
          <Gift className="w-8 h-8 text-amber-300" />
        </div>
        <h2 className="text-xl font-bold text-white">Loading Santa&apos;s Workshop...</h2>
        <p className="text-xs text-slate-400 mt-1">Preparing exchange room</p>
      </div>
    );
  }

  // Not Found / Error Screen
  if (fetchError || !session) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-red-950/70 border border-red-700/60 flex items-center justify-center mx-auto mb-4 text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Exchange Not Found</h2>
        <p className="text-sm text-slate-300 mb-6">
          {fetchError || 'This Secret Santa room does not exist or has expired.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow transition hover:scale-105"
        >
          <span>Return to Home</span>
        </Link>
      </div>
    );
  }

  // Password Gate Screen
  if (session.isPasswordProtected && !session.isUnlocked) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-fadeIn">
        <div className="glass-panel-gold rounded-2xl p-6 sm:p-8 shadow-2xl border border-amber-500/30 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-4 text-amber-300">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white mb-1">{session.title}</h2>
          <p className="text-xs text-amber-300 font-medium uppercase tracking-wider mb-6">
            🔒 Password Protected Exchange
          </p>

          <p className="text-xs sm:text-sm text-slate-300 mb-6">
            The organizer has set a holiday password for this exchange. Please enter it below to join the workshop.
          </p>

          {unlockError && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center justify-center space-x-2">
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
              placeholder="Enter room password"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-center text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium"
            />

            <button
              type="submit"
              disabled={isUnlocking}
              className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold py-3 px-5 rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isUnlocking ? (
                <span>Checking Key...</span>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Exchange</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition">
              ← Back to Secret Santa Home
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
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLocked ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                  }`}
                />
                <span>{isLocked ? 'Draw Complete • Locked' : 'Accepting Participants'}</span>
              </span>

              {session.isPasswordProtected && (
                <span className="inline-flex items-center space-x-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Password Protected</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {session.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 pt-1">
              {session.budget && (
                <div className="flex items-center space-x-1.5 bg-slate-900/60 px-3 py-1 rounded-lg border border-white/5">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>Budget: <strong className="text-white">{session.budget}</strong></span>
                </div>
              )}
              {session.exchangeDate && (
                <div className="flex items-center space-x-1.5 bg-slate-900/60 px-3 py-1 rounded-lg border border-white/5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Exchange: <strong className="text-white">{session.exchangeDate}</strong></span>
                </div>
              )}
              <div className="flex items-center space-x-1.5 bg-slate-900/60 px-3 py-1 rounded-lg border border-white/5">
                <Users className="w-4 h-4 text-blue-400" />
                <span>
                  <strong className="text-white">{participantCount}</strong> {participantCount === 1 ? 'Elf' : 'Elves'} Joined
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
              <span>Host Controls</span>
            </button>
            <button
              onClick={fetchSession}
              title="Refresh Roster"
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Shareable Link Bar */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Share this link with your friends & family:
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 overflow-hidden">
              <span className="text-xs sm:text-sm font-mono text-slate-300 truncate select-all">
                {typeof window !== 'undefined'
                  ? `${window.location.origin}${getBasePath()}/session/${sessionId}`
                  : `/session/${sessionId}`}
              </span>
            </div>
            <button
              onClick={copyShareLink}
              className="bg-red-700 hover:bg-red-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow transition flex items-center space-x-1.5 flex-shrink-0"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Draw Complete Locked Banner (if LOCKED) */}
      {isLocked && (
        <section className="glass-panel-gold rounded-2xl p-6 sm:p-8 border border-amber-500/40 shadow-xl relative overflow-hidden animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl flex-shrink-0">
              🎄
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Submissions have ended! The Secret Santa draw has taken place 🎅
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/90 mt-1 leading-relaxed">
                Santa&apos;s workshop has paired everyone into a secret gift circle. Check your inbox for your recipient, personal rhyming poem, and AI gift ideas!
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
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Join This Secret Santa</h2>
                <p className="text-xs text-slate-400">
                  Fill in your details below to participate in the draw
                </p>
              </div>
            </div>

            {joinError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{joinError}</span>
              </div>
            )}

            {joinSuccess && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs sm:text-sm flex items-start space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{joinSuccess}</span>
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alice"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="e.g. Smith"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Email Address <span className="text-red-400">*</span></span>
                  <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Never displayed publicly</span>
                  </span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alice@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Your email will only be used to send your secret match reveal.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Wishlist / Gift Preferences (Optional)</span>
                  <span className="text-[10px] text-amber-300 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Santa AI will use this</span>
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={wishlist}
                  onChange={(e) => setWishlist(e.target.value)}
                  placeholder="e.g. Warm wool socks, dark roast coffee beans, fantasy books..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Hobbies & Interests (Optional)
                </label>
                <input
                  type="text"
                  value={hobbies}
                  onChange={(e) => setHobbies(e.target.value)}
                  placeholder="e.g. Baking sourdough, photography, hiking, board games"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={isJoining}
                className="w-full mt-2 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-red-950/50 border border-red-500/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isJoining ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Registering with Santa...</span>
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>🎁 Join Secret Santa Exchange</span>
                  </>
                )}
              </button>
            </form>
          </section>
        ) : (
          <section className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-7 border border-white/10 shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-white flex items-center space-x-2">
              <Gift className="w-5 h-5 text-amber-400" />
              <span>Exchange Summary</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              This exchange has locked with <strong>{participantCount}</strong> participating elves. Each participant has been emailed their secret recipient.
            </p>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Total Matched Pairs:</span>
                <span className="font-bold text-white">{participantCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Matching Mode:</span>
                <span className="font-medium text-emerald-400">Cyclic Derangement (Zero Self-Matches)</span>
              </div>
              {session.exchangeDate && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Exchange Day:</span>
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
              <h2 className="text-xl font-bold text-white">Workshop Roster</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
              {participantCount} {participantCount === 1 ? 'Elf' : 'Elves'}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {participants.length === 0 ? (
              <div className="text-center py-10 px-4 border border-dashed border-slate-700 rounded-xl">
                <p className="text-3xl mb-2">🧝</p>
                <p className="text-sm font-semibold text-slate-300">No elves signed up yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Be the first to join using the form!
                </p>
              </div>
            ) : (
              participants.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-900/40 border border-emerald-700/40 text-emerald-300 flex items-center justify-center font-bold text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {p.name} {p.surname}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>
                          Joined {new Date(p.joinedAt).toLocaleDateString(undefined, {
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

          <div className="mt-5 p-3 rounded-xl bg-slate-900/40 border border-white/5 flex items-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Emails and wishlists are strictly concealed for privacy.</span>
          </div>
        </section>
      </div>

      {/* Host Controls Modal */}
      {showHostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-red max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-2xl border border-red-500/40 relative">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/40 flex items-center justify-center text-amber-300">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Host Controls</h3>
                  <p className="text-xs text-red-200">Manage Santa draw & session lock</p>
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
              <div className="mb-4 p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{drawError}</span>
              </div>
            )}

            {drawSuccess && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{drawSuccess}</span>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Host Admin Key
                </label>
                <input
                  type="text"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Paste your 32-character admin key"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-red-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Only the host with this key can initiate the draw.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Current Participants:</span>
                  <strong className="text-white">{participantCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Minimum Required:</span>
                  <span className="text-amber-300">2 participants</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={isLocked ? 'text-amber-400' : 'text-emerald-400'}>
                    {isLocked ? 'Locked (Draw finished)' : 'Open for registrations'}
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
                className="w-full bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg border border-red-500/40 flex items-center justify-center space-x-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {isLocked
                    ? 'Draw Already Completed'
                    : participantCount < 2
                    ? 'Need At Least 2 Elves to Draw'
                    : '🎅 Start Secret Santa Draw!'}
                </span>
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-red-950/80 border border-red-600 space-y-3">
                <p className="text-xs font-bold text-white">
                  ⚠️ Are you sure you want to start the draw now?
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  This action cannot be undone. Registration will be closed permanently, and emails with secret matches, custom poems, and AI gift ideas will be dispatched immediately.
                </p>
                <div className="flex items-center space-x-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowConfirmDraw(false)}
                    disabled={isDrawing}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-lg transition"
                  >
                    Cancel
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
                        <span>Matching Elves...</span>
                      </>
                    ) : (
                      <>
                        <span>Yes, Draw Names!</span>
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
