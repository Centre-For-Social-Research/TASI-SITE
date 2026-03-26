import { NextRequest, NextResponse } from 'next/server';

function buildSiteCsp(nonce: string, isDev: boolean) {
  return [
    "default-src 'none'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' https://docs.google.com",
    "img-src 'self' data: blob: https://docs.google.com https://cdn.sanity.io https://image.mux.com https://images.unsplash.com",
    "font-src 'self' data:",
    "connect-src 'self' https://docs.google.com",
    "media-src 'self' blob: https://stream.mux.com https://player.mux.com https://storage.googleapis.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://docs.google.com",
    'frame-src https://docs.google.com https://player.mux.com',
    'child-src https://docs.google.com https://player.mux.com',
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

function buildStudioCsp(nonce: string, isDev: boolean) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${
      isDev ? " 'unsafe-eval'" : ''
    }`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io https://*.sanity.studio",
    "font-src 'self' data:",
    "connect-src 'self' https://cdn.sanity.io https://*.sanity.io https://*.apicdn.sanity.io https://*.api.sanity.io wss://*.sanity.io",
    "media-src 'self' blob: https://cdn.sanity.io https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https:",
    "frame-src 'self' https://*.sanity.io https://*.sanity.studio",
    "child-src 'self' https://*.sanity.io https://*.sanity.studio",
    "frame-ancestors 'self' https://sanity.io https://www.sanity.io https://*.sanity.io https://*.sanity.studio",
    'upgrade-insecure-requests',
  ].join('; ');
}

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV !== 'production';
  const isStudioRoute = request.nextUrl.pathname.startsWith('/studio');

  const contentSecurityPolicy = (
    isStudioRoute ? buildStudioCsp(nonce, isDev) : buildSiteCsp(nonce, isDev)
  ).replace(/\s{2,}/g, ' ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', contentSecurityPolicy);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
