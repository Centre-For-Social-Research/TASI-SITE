import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const siteSecurityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' blob: 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com https://checkout.razorpay.com https://static.cloudflareinsights.com",
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://image.mux.com https://*.clerk.com https://*.clerk.accounts.dev https://d19ob9sqegt2wc.cloudfront.net https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co https://api.resend.com https://clerk.com https://*.clerk.accounts.dev https://*.sanity.io wss://*.sanity.io https://*.mux.com wss://*.mux.com https://api.razorpay.com https://checkout.razorpay.com",
      'frame-src https://challenges.cloudflare.com https://clerk.com https://*.clerk.accounts.dev https://player.mux.com https://api.razorpay.com https://checkout.razorpay.com',
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; '),
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const studioSecurityHeaders = [
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const cacheHeaders = [
  {
    source: '/img/(.*)',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
    ],
  },
];

const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  serverExternalPackages: ['@react-pdf/renderer'],
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'image.mux.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'd19ob9sqegt2wc.cloudfront.net',
      },
    ],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: '/studio/:path*',
        headers: studioSecurityHeaders,
      },
      {
        source: '/((?!studio).*)',
        headers: siteSecurityHeaders,
      },
      ...cacheHeaders,
    ];
  },
  compress: true,
  productionBrowserSourceMaps: false,
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
    automaticVercelMonitors: true,
  },
});
