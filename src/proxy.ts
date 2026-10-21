import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from 'next/server';
import crossSiteRequest from '@/lib/cross-site-request.cjs';

const { isCrossSiteStateChange } = crossSiteRequest;

const isClerkBackedRoute = createRouteMatcher([
  '/__clerk(.*)',
  '/admin(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/not-authorized(.*)',
  '/api/admin(.*)',
  '/api/check-in(.*)',
  '/api/events(.*)',
  '/api/health',
  '/api/me',
  '/api/me/(.*)',
  '/api/operator(.*)',
  '/api/resend/test(.*)',
]);

// Edge-level auth boundary: these routes require a signed-in Clerk session
// before any handler runs. Per-route role checks (admin vs reviewer) remain
// the authorization layer. Webhooks and /api/internal are excluded — they
// authenticate via signatures/secrets, not Clerk sessions.
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
  '/api/check-in(.*)',
  '/api/me',
  '/api/me/(.*)',
  '/api/operator(.*)',
]);

// Job-processor endpoints are also called by cron/system with a shared
// secret header (no Clerk session); their handlers enforce the secret or
// an admin session via authorizeJobProcessorRequest().
const isJobProcessorRoute = createRouteMatcher([
  '/api/admin/email-jobs/process',
  '/api/admin/passes/jobs/process',
]);

const CLERK_PROXY_PATH = '/__clerk';

// The production Clerk instance uses a custom Frontend API domain
// (clerk.trustandsafetyindia.org, encoded in the publishable key), so the
// browser and the handshake talk to Clerk directly. The first-party
// /__clerk proxy is only used in development, matching TasiClerkProvider.
// Enabling frontendApiProxy in production routes the sign-in handshake
// through /__clerk, which Clerk cannot attribute to the instance and
// rejects with `host_invalid`.
const isDevelopment = process.env.NODE_ENV === 'development';

const clerkOptions = isDevelopment
  ? {
      frontendApiProxy: {
        enabled: true,
        path: CLERK_PROXY_PATH,
      },
    }
  : {};

const protectRoute = async (
  auth: { protect: () => Promise<unknown> },
  request: NextRequest
) => {
  if (isProtectedRoute(request) && !isJobProcessorRoute(request)) {
    await auth.protect();
  }
};

const clerkProxy = clerkMiddleware(protectRoute, clerkOptions);

// Admin pages get a strict, per-request nonce CSP from Clerk on top of the
// site-wide policy in next.config.mjs. Browsers enforce both, so an injected
// inline script without the nonce is blocked even though the site-wide
// policy allows 'unsafe-inline'. Admin pages render dynamically, so Next.js
// picks the nonce up from the request headers for its own scripts.
const isAdminPage = createRouteMatcher(['/admin(.*)']);
const clerkAdminPageProxy = clerkMiddleware(protectRoute, {
  ...clerkOptions,
  contentSecurityPolicy: {
    strict: true,
    directives: {
      'img-src': [
        'data:',
        'blob:',
        'https://*.supabase.co',
        'https://*.clerk.com',
        'https://cdn.sanity.io',
      ],
      'connect-src': [
        'https://*.supabase.co',
        'https://*.clerk.com',
        'https://*.ingest.sentry.io',
        'https://*.ingest.us.sentry.io',
      ],
      'font-src': ['self', 'data:', 'https://fonts.gstatic.com'],
      'style-src': ['https://fonts.googleapis.com'],
      'object-src': ['none'],
      'base-uri': ['self'],
      'frame-ancestors': ['self'],
    },
  },
});

function normalizeSameRouteClerkRewrite(
  response: Response,
  request: NextRequest
) {
  const rewriteHeader = response.headers.get('x-middleware-rewrite');

  if (!rewriteHeader) {
    return response;
  }

  const requestUrl = new URL(request.url);
  const rewriteUrl = new URL(rewriteHeader);
  const isSameRouteRewrite =
    rewriteUrl.origin === requestUrl.origin &&
    rewriteUrl.pathname === requestUrl.pathname &&
    rewriteUrl.search === requestUrl.search;

  if (isSameRouteRewrite) {
    response.headers.delete('x-middleware-rewrite');
    response.headers.set('x-middleware-next', '1');
  }

  return response;
}

export default async function proxy(
  request: NextRequest,
  event: NextFetchEvent
) {
  if (
    isProtectedRoute(request) &&
    isCrossSiteStateChange({
      method: request.method,
      url: request.url,
      origin: request.headers.get('origin'),
      secFetchSite: request.headers.get('sec-fetch-site'),
    })
  ) {
    return NextResponse.json(
      { error: 'Cross-site requests are not allowed.' },
      { status: 403 }
    );
  }

  if (isClerkBackedRoute(request)) {
    const handler = isAdminPage(request) ? clerkAdminPageProxy : clerkProxy;
    const response = (await handler(request, event)) ?? NextResponse.next();

    return normalizeSameRouteClerkRewrite(response, request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Always run for Clerk proxied runtime assets
    '/__clerk/(.*)',
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
