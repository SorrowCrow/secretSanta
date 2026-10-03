import type { Metadata, Viewport } from 'next';
import Snowfall from '@/components/Snowfall';
import ChristmasTrees from '@/components/ChristmasTrees';
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
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-red-600 selection:text-white relative antialiased">
        <Providers>
          {/* Subtle Falling Snowflakes */}
          <Snowfall />

          {/* Vecteezy side Christmas trees (low transparency) */}
          <ChristmasTrees />

          {/* Main Content Area */}
          <main className="flex-1 relative z-10">{children}</main>

          {/* Minimalist Festive Footer */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
