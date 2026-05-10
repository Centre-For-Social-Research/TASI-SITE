import type { Metadata } from 'next';
import { DM_Mono, DM_Sans, Fraunces, Inter, Outfit } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import AppShell from '@/components/app-shell';
import ChatBot from '@/components/chatbot/ChatBot';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const siteUrl = 'https://trustandsafetyindia.org';
const siteName = 'Trust and Safety India Festival';
const siteTitle = 'TASI 2026 | Trust and Safety India Festival';
const siteDescription =
  "TASI is India's first national convening focused on trust and safety, led by civil society. Convened by the Centre for Social Research (CSR) and Trust and Safety Festival, TASI creates a collaborative space for dialogue across government, industry, academia, and civil society.";

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      alternateName: 'TASI 2026',
      description: siteDescription,
      inLanguage: 'en-IN',
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Centre for Social Research',
      alternateName: 'CSR India',
      url: 'https://www.csrindia.org',
      logo: `${siteUrl}/img/tasi-csr-logo.png`,
      email: 'info1@csrindia.org',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'New Delhi',
        addressCountry: 'IN',
      },
      sameAs: [
        'https://www.facebook.com/csrindia.org',
        'https://x.com/CSR_India',
        'https://www.instagram.com/csr_india/',
        'https://www.linkedin.com/company/centre-for-social-research-india/',
      ],
    },
    {
      '@type': 'Event',
      '@id': `${siteUrl}/#event`,
      name: 'TASI 2026 - Trust and Safety India Festival',
      description: siteDescription,
      startDate: '2026-10-13',
      endDate: '2026-10-14',
      eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      image: [`${siteUrl}/opengraph-image`],
      url: siteUrl,
      organizer: {
        '@id': `${siteUrl}/#organization`,
      },
      performer: {
        '@type': 'Organization',
        name: 'TASI 2026 speakers and panelists',
        url: `${siteUrl}/speakers`,
      },
      offers: {
        '@type': 'Offer',
        name: 'General access registration',
        url: `${siteUrl}/register`,
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        validFrom: '2026-05-01T00:00:00+05:30',
      },
      location: {
        '@type': 'Place',
        name: 'India Habitat Centre',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'New Delhi',
          addressCountry: 'IN',
        },
      },
    },
  ],
};

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
  metadataBase: new URL(siteUrl),
  applicationName: 'TASI 2026',
  title: siteTitle,
  description: siteDescription,
  keywords: [
    'TASI 2026',
    'Trust and Safety India Festival',
    'trust and safety',
    'online safety',
    'digital safety',
    'responsible AI',
    'Centre for Social Research',
  ],
  authors: [
    { name: 'Centre for Social Research', url: 'https://www.csrindia.org' },
  ],
  creator: 'Centre for Social Research',
  publisher: 'Centre for Social Research',
  category: 'event',
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName,
    type: 'website',
    locale: 'en_IN',
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
    title: siteTitle,
    description: siteDescription,
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
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${outfit.variable} ${dmSans.variable} ${dmMono.variable} ${fraunces.variable}`}
    >
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
          }}
        />
        <ThemeProvider defaultTheme="system" enableSystem>
          <AppShell>{children}</AppShell>
          <Analytics />
          <SpeedInsights />
          <ChatBot />
        </ThemeProvider>
      </body>
    </html>
  );
}
