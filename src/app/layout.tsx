import type { Metadata } from 'next';
import { DM_Mono, DM_Sans, Fraunces, Inter, Outfit } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import AppShell from '@/components/app-shell';
import ChatBot from '@/components/chatbot/ChatBot';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-admin-sans',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-admin-mono',
  weight: ['400', '500'],
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-admin-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TASI 2026',
  description:
    "TASI is India's first national convening focused on trust and safety, led by civil society. Convened by the Centre for Social Research (CSR) and Trust and Safety Festival, TASI creates a collaborative space for dialogue across government, industry, academia, and civil society.",
  openGraph: {
    title: 'TASI 2026',
    description:
      "TASI is India's first national convening focused on trust and safety, led by civil society. Convened by the Centre for Social Research (CSR) and Trust and Safety Festival, TASI creates a collaborative space for dialogue across government, industry, academia, and civil society.",
    url: 'https://jamsaq.in',
    siteName: 'TASI 2026',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'TASI 2026 - Trust and Safety India Festival',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TASI 2026',
    description:
      "TASI is India's first national convening focused on trust and safety, led by civil society. Convened by the Centre for Social Research (CSR) and Trust and Safety Festival, TASI creates a collaborative space for dialogue across government, industry, academia, and civil society.",
    images: ['/twitter-image'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} ${dmSans.variable} ${dmMono.variable} ${fraunces.variable}`}
    >
      <body className="antialiased">
        <AppShell>{children}</AppShell>
        <Analytics />
        <SpeedInsights />
        <ChatBot />
      </body>
    </html>
  );
}
