import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import AppShell from '@/components/app-shell';
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
