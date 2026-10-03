'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Gift,
  Sparkles,
  ShieldCheck,
  Zap,
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

export default function HomePage() {
  const router = useRouter();

  // Create exchange form state
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('$25');
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
      setCreateError('Please enter an exchange title');
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
      setLookupError('Please enter a session ID or link');
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
      setLookupError('Invalid exchange link or code');
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Hero Section */}
      <section className="text-center mb-16 relative">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-950/70 border border-red-700/50 text-red-200 text-xs sm:text-sm font-medium mb-6 shadow-inner">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>The easiest Secret Santa gift exchange on the web</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
          Secret Santa Gift Exchange{' '}
          <span className="block sm:inline bg-gradient-to-r from-red-500 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
            🎅🎁
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Create a private exchange room, invite family, friends, or coworkers with a simple link, and let Santa’s AI elves craft custom rhyming poems and tailored gift ideas for each match!
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#create"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-base px-6 py-3.5 rounded-xl shadow-xl shadow-red-950/60 border border-red-500/40 transition-all hover:scale-105 active:scale-95"
          >
            <Gift className="w-5 h-5 text-amber-300" />
            <span>Create Free Exchange</span>
          </a>
          <a
            href="#join"
            className="inline-flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-base px-6 py-3.5 rounded-xl border border-white/10 transition-all hover:text-white"
          >
            <span>Join with Code / Link</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </a>
        </div>
      </section>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
        {/* Create Exchange Card */}
        <section
          id="create"
          className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl -mr-8 -mt-8" />
          
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Create an Exchange</h2>
              <p className="text-xs text-slate-400">Set up in 30 seconds • No account needed</p>
            </div>
          </div>

          {createError && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-sm flex items-start space-x-2">
              <Info className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Exchange Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Smith Family Christmas 2026 or Design Team Secret Santa"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>Suggested Budget</span>
                </label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. $25, £20, Under $30"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exchange Date</span>
                </label>
                <input
                  type="text"
                  value={exchangeDate}
                  onChange={(e) => setExchangeDate(e.target.value)}
                  placeholder="e.g. Dec 24, 2026"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition"
                />
              </div>
            </div>

            {/* Optional / Advanced Settings */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-semibold text-slate-400 hover:text-amber-300 flex items-center space-x-1.5 transition"
              >
                <span>{showAdvanced ? '− Hide' : '+ Show'} Optional Security Settings</span>
                <span className="text-[10px] text-slate-500">(Password & Custom Host Key)</span>
              </button>

              {showAdvanced && (
                <div className="mt-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Room Access Password (Optional)</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank for public room"
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      If set, participants must enter this password to view the room and sign up.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center space-x-1">
                      <Key className="w-3.5 h-3.5 text-red-400" />
                      <span>Custom Host Admin Key (Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={customAdminKey}
                      onChange={(e) => setCustomAdminKey(e.target.value)}
                      placeholder="Auto-generated if left blank"
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      The secret key used exclusively by you to trigger the Santa match draw.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-red-950/50 border border-red-500/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Preparing Exchange Room...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>🎅 Create Secret Santa Exchange</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Join Existing Exchange & Quick Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Lookup Card */}
          <section
            id="join"
            className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/10 shadow-xl relative"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Join an Exchange</h3>
                <p className="text-xs text-slate-400">Have an invite link or room ID?</p>
              </div>
            </div>

            {lookupError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs">
                {lookupError}
              </div>
            )}

            <form onSubmit={handleLookup} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Exchange Code or Link
                </label>
                <input
                  type="text"
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value)}
                  placeholder="Paste URL or Session ID"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-5 rounded-xl border border-emerald-400/30 shadow-md shadow-emerald-950/40 flex items-center justify-center space-x-2 transition hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Enter Exchange Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </section>

          {/* Quick Santa Promise Card */}
          <div className="glass-panel-gold rounded-2xl p-6 border shadow-xl">
            <h4 className="font-bold text-amber-300 text-sm uppercase tracking-wider flex items-center space-x-1.5 mb-2">
              <span>🎁</span>
              <span>The Santa Promise</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every participant draws exactly one lucky elf and receives a gift from exactly one Secret Santa. No self-matches, no duplicates, no spoil-sport leaks.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <section className="mt-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Why Festive Organizers Love Us
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Engineered with privacy, mathematical fairness, and holiday delight in mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-red-500/30 transition group">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Cyclic Fair Matching</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Durstenfeld Fisher-Yates single Hamiltonian cycle. Mathematically guarantees zero self-matches and balanced 1:1 secret circles.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-amber-500/30 transition group">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Santa AI Assistant</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates a personalized, festive 4-line rhyming poem and curated gift suggestions based on wishlist, hobbies, and budget limit.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">100% Email Privacy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Participant emails are never rendered publicly or shared with peers. Only your secret Santa receives the dispatch notification.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-blue-500/30 transition group">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <Gift className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Zero Cost & Effort</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No credit card, no app download, no sign up required. Create a room, share the link via WhatsApp or Slack, and draw!
            </p>
          </div>
        </div>
      </section>

      {/* Post-Creation Modal / Overlay */}
      {createdSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-gold max-w-lg w-full rounded-2xl p-6 sm:p-8 shadow-2xl border border-amber-500/40 relative">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg shadow-amber-900/40">
                🎅
              </div>
              <h3 className="text-2xl font-black text-white">Exchange Created!</h3>
              <p className="text-xs sm:text-sm text-amber-200 mt-1">
                Your room &ldquo;{createdSession.title}&rdquo; is ready for participants.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Shareable Link Box */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  1. Share This Link With Participants:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={getSessionShareUrl(createdSession.id)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-slate-200 font-mono truncate"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(getSessionShareUrl(createdSession.id), 'link')
                    }
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-white/10 flex items-center space-x-1 transition"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-300" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Admin Key Warning Box */}
              <div className="p-4 rounded-xl bg-red-950/70 border border-red-600/50">
                <div className="flex items-start space-x-2.5">
                  <Key className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                      ⚠️ Save Your Host Admin Key!
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1 mb-2">
                      You will need this secret key to start the Santa match draw later. Do NOT share it with participants!
                    </p>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-2.5 py-1.5 rounded-lg bg-black/60 text-amber-200 text-xs font-mono font-bold select-all truncate border border-amber-500/20">
                        {createdSession.adminKey}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(createdSession.adminKey, 'key')}
                        className="px-2.5 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs font-semibold transition flex items-center space-x-1"
                      >
                        {copiedKey ? (
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedKey ? 'Saved!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href={`/session/${createdSession.id}`}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-3 px-5 rounded-xl text-center shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 transition"
              >
                <span>Go to Exchange Room</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
