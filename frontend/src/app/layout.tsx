import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import { ThemeProvider } from '../lib/theme';

export const metadata: Metadata = {
  title: 'TradeSphere AI — India-First Stock Market Research & Paper Trading SaaS',
  description: '100% free financial research, simulated execution, and paper-trading terminal with pre-trade risk gatekeeper, 24/7 GBM simulation, 20-level DOM ladders, and Black-Scholes Greeks.',
  keywords: ['paper trading', 'stock market india', 'nse simulation', 'options greeks', 'pre-trade risk management', 'tradesphere ai', 'financial education'],
  authors: [{ name: 'TradeSphere AI Team' }],
  metadataBase: new URL('https://tradesphere.ai'),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'TradeSphere AI — Institutional Stock & Options Research Terminal',
    description: 'Master market structure and pre-trade risk with ₹10,00,000 simulated capital. 24/7 dual-market simulation with zero API keys required.',
    url: 'https://tradesphere.ai',
    siteName: 'TradeSphere AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TradeSphere AI Institutional Trading Terminal'
      }
    ],
    locale: 'en_IN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TradeSphere AI — India-First Paper Trading & Risk Engine',
    description: 'Zero subscription fees, synchronous 1% risk gatekeeper, and 24/7 realistic market simulation.',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

export const viewport: Viewport = {
  themeColor: '#070b14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          src="https://accounts.google.com/gsi/client"
          async
          defer
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e && e.message && (
                  e.message.indexOf('Loading chunk') !== -1 ||
                  e.message.indexOf('ChunkLoadError') !== -1 ||
                  e.message.indexOf('Failed to fetch dynamically imported module') !== -1
                )) {
                  console.warn('[Deployment Sync] Stale asset chunk detected from new deployment. Reloading...');
                  window.location.reload();
                }
              });
            `
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#000000] text-[#F0F3F6] selection:bg-[#2979FF] selection:text-white font-sans antialiased">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
