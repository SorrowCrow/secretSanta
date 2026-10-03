import type { Metadata, Viewport } from 'next';
import Snowfall from '@/components/Snowfall';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
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
        <Providers>
          {/* Ambient solid holiday lighting (no gradients) */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-red-950/30 rounded-full blur-[120px]" />
            <div className="absolute top-1/3 -right-20 w-[450px] h-[450px] bg-emerald-950/30 rounded-full blur-[120px]" />
            <div className="absolute -bottom-20 left-1/3 w-[600px] h-[600px] bg-amber-950/20 rounded-full blur-[140px]" />
          </div>

          {/* Falling Snowflakes */}
          <Snowfall />

          {/* Festive Header / Navbar */}
          <Navbar />

          {/* Main Content Area */}
          <main className="flex-1 relative z-10">{children}</main>

          {/* Festive Footer */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
