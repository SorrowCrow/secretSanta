import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Gift, Sparkles, Heart } from 'lucide-react';
import Snowfall from '@/components/Snowfall';
import './globals.css';

export const metadata: Metadata = {
  title: '🎅 Secret Santa • Free, Private & AI-Powered Gift Exchange',
  description:
    'Host the easiest holiday gift exchange. 100% free, zero-cost, email privacy guaranteed, fair cyclic matching, and Santa AI gift suggestions.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#081121',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#081121] text-slate-100 flex flex-col selection:bg-red-600 selection:text-white relative">
        {/* Ambient festive holiday glow */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 -right-20 w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-20 left-1/3 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px]" />
        </div>

        {/* Falling Snowflakes */}
        <Snowfall />

        {/* Festive Header / Navbar */}
        <header className="relative z-20 border-b border-white/10 bg-[#081121]/80 backdrop-blur-md sticky top-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2.5 group transition-transform active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/30 group-hover:rotate-6 transition-transform">
                <Gift className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-red-400 via-amber-200 to-emerald-400 bg-clip-text text-transparent">
                    Secret Santa
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800/60 font-medium">
                    🎅 2026
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium -mt-0.5">
                  Holiday Gift Exchange
                </span>
              </div>
            </Link>

            <nav className="flex items-center space-x-3">
              <Link
                href="/"
                className="text-xs sm:text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition font-medium"
              >
                Home
              </Link>
              <Link
                href="/#create"
                className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-3.5 py-1.5 rounded-lg shadow-md shadow-red-950/50 transition-all hover:scale-105 active:scale-95 border border-red-500/30"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>New Exchange</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 relative z-10">{children}</main>

        {/* Festive Footer */}
        <footer className="relative z-10 border-t border-white/10 bg-[#060c18]/90 py-8 px-4 text-center">
          <div className="max-w-4xl mx-auto flex flex-col items-center space-y-3">
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <span>Made with festive cheer</span>
              <span className="text-red-400 animate-pulse">🎄</span>
              <span className="text-slate-400">•</span>
              <span className="text-amber-300 font-medium">Free & Zero-Cost</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-400 font-medium">100% Privacy</span>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              No participant emails are ever made public or sold. Santa’s elves only deliver matches straight to individual inboxes!
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
