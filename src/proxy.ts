import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from 'next/server';

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
  '/api/me(.*)',
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
  '/api/me(.*)',
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

const clerkProxy = clerkMiddleware(
  async (auth, request) => {
    if (isProtectedRoute(request) && !isJobProcessorRoute(request)) {
      await auth.protect();
    }
  },
  isDevelopment
    ? {
        frontendApiProxy: {
          enabled: true,
          path: CLERK_PROXY_PATH,
        },
      }
    : {}
);

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
  if (isClerkBackedRoute(request)) {
    const response = (await clerkProxy(request, event)) ?? NextResponse.next();

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
