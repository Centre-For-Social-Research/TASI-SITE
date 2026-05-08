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

const CLERK_PROXY_PATH = '/__clerk';

const clerkProxy = clerkMiddleware({
  frontendApiProxy: {
    enabled: true,
    path: CLERK_PROXY_PATH,
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
