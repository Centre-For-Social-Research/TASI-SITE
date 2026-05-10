const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('public root layout does not mount Clerk', () => {
  const rootLayout = readFile('src/app/layout.tsx');
  const appShell = readFile('src/components/app-shell.jsx');

  assert.doesNotMatch(rootLayout, /ClerkProvider/);
  assert.doesNotMatch(rootLayout, /TasiClerkProvider/);
  assert.doesNotMatch(appShell, /AdminRouteExitWatcher/);
  assert.doesNotMatch(appShell, /useClerk/);
});

test('root event structured data includes Google recommended fields', () => {
  const rootLayout = readFile('src/app/layout.tsx');

  assert.match(rootLayout, /'@type': 'Event'/);
  assert.match(rootLayout, /performer: \{/);
  assert.match(rootLayout, /name: 'TASI 2026 speakers and panelists'/);
  assert.match(rootLayout, /offers: \{/);
  assert.match(rootLayout, /'@type': 'Offer'/);
  assert.match(rootLayout, /priceCurrency: 'INR'/);
  assert.match(rootLayout, /url: `\$\{siteUrl\}\/register`/);
});

test('shared auth provider proxies Clerk runtime through the app', () => {
  const authProvider = readFile('src/components/auth/clerk-provider.jsx');

  assert.match(
    authProvider,
    /import \{ ClerkProvider \} from '@clerk\/nextjs'/
  );
  assert.match(authProvider, /const CLERK_PROXY_PATH = '\/__clerk';/);
  assert.match(authProvider, /NEXT_PUBLIC_CLERK_JS_VERSION/);
  assert.match(authProvider, /NEXT_PUBLIC_CLERK_UI_VERSION/);
  assert.match(authProvider, /process\.env\.NODE_ENV === 'development'/);
  assert.match(authProvider, /proxyUrl: CLERK_PROXY_PATH/);
  assert.match(authProvider, /__internal_clerkJSUrl/);
  assert.match(authProvider, /__internal_clerkUIUrl/);
  assert.match(authProvider, /<ClerkProvider \{\.\.\.localClerkRuntimeProps\}/);
  assert.doesNotMatch(authProvider, /prefetchUI/);
});

test('auth-only layouts mount the shared Clerk provider', () => {
  const adminLayout = readFile('src/app/admin/layout.jsx');
  const signInLayout = readFile('src/app/sign-in/layout.jsx');
  const notAuthorizedLayout = readFile('src/app/not-authorized/layout.tsx');

  assert.match(adminLayout, /import TasiClerkProvider/);
  assert.match(adminLayout, /<TasiClerkProvider>/);
  assert.match(adminLayout, /<AdminExitGuard>\{children\}<\/AdminExitGuard>/);
  assert.match(signInLayout, /import TasiClerkProvider/);
  assert.match(
    signInLayout,
    /<TasiClerkProvider>\{children\}<\/TasiClerkProvider>/
  );
  assert.match(notAuthorizedLayout, /import TasiClerkProvider/);
  assert.match(
    notAuthorizedLayout,
    /<TasiClerkProvider>\{children\}<\/TasiClerkProvider>/
  );
  assert.doesNotMatch(adminLayout, /<ClerkProvider>/);
  assert.doesNotMatch(signInLayout, /<ClerkProvider>/);
  assert.doesNotMatch(notAuthorizedLayout, /<ClerkProvider>/);
});

test('sign-in page does not create a nested ClerkProvider', () => {
  const signInPage = readFile('src/app/sign-in/[[...sign-in]]/page.jsx');

  assert.doesNotMatch(signInPage, /<ClerkProvider>/);
  assert.doesNotMatch(
    signInPage,
    /import \{ ClerkProvider, SignIn \} from '@clerk\/nextjs'/
  );
  assert.match(signInPage, /import \{ SignIn \} from '@clerk\/nextjs'/);
});

test('global proxy runs Clerk middleware only for auth-backed routing', () => {
  const proxy = readFile('src/proxy.ts');

  assert.match(
    proxy,
    /import \{ clerkMiddleware, createRouteMatcher \} from '@clerk\/nextjs\/server'/
  );
  assert.match(proxy, /createRouteMatcher\(\[/);
  assert.match(proxy, /'\/__clerk\(\.\*\)'/);
  assert.match(proxy, /'\/admin\(\.\*\)'/);
  assert.match(proxy, /'\/sign-in\(\.\*\)'/);
  assert.match(proxy, /'\/api\/admin\(\.\*\)'/);
  assert.match(proxy, /'\/api\/me\(\.\*\)'/);
  assert.match(proxy, /const CLERK_PROXY_PATH = '\/__clerk';/);
  assert.match(proxy, /const clerkProxy = clerkMiddleware\(\{/);
  assert.match(proxy, /frontendApiProxy/);
  assert.match(proxy, /path: CLERK_PROXY_PATH/);
  assert.match(proxy, /function normalizeSameRouteClerkRewrite/);
  assert.match(proxy, /x-middleware-rewrite/);
  assert.match(proxy, /x-middleware-next/);
  assert.match(proxy, /if \(isClerkBackedRoute\(request\)\) \{/);
  assert.match(
    proxy,
    /const response = \(await clerkProxy\(request, event\)\) \?\? NextResponse\.next\(\);/
  );
  assert.match(
    proxy,
    /return normalizeSameRouteClerkRewrite\(response, request\);/
  );
  assert.match(proxy, /'\/__clerk\/\(\.\*\)'/);
  assert.match(proxy, /NextResponse\.next\(\)/);
});

test('removed global Clerk artifacts stay deleted', () => {
  const oldClerkLayout = path.join(process.cwd(), 'src/app/clerk-layout.jsx');
  const oldAdminRouteWatcher = path.join(
    process.cwd(),
    'src/components/admin/admin-route-exit-watcher.jsx'
  );
  const adminExitGuard = readFile('src/components/admin/admin-exit-guard.jsx');

  assert.equal(fs.existsSync(oldClerkLayout), false);
  assert.equal(fs.existsSync(oldAdminRouteWatcher), false);
  assert.doesNotMatch(adminExitGuard, /<ClerkProvider>/);
});
