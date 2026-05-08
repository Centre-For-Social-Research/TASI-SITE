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

test('shared auth provider centralizes Clerk script loading', () => {
  const authProvider = readFile('src/components/auth/clerk-provider.jsx');

  assert.match(
    authProvider,
    /import \{ ClerkProvider \} from '@clerk\/nextjs'/
  );
  assert.match(authProvider, /NEXT_PUBLIC_CLERK_JS_URL/);
  assert.match(
    authProvider,
    /https:\/\/cdn\.jsdelivr\.net\/npm\/@clerk\/clerk-js@6\/dist\/clerk\.browser\.js/
  );
  assert.match(authProvider, /__internal_clerkJSUrl=\{clerkJsUrl\}/);
  assert.match(authProvider, /prefetchUI=\{false\}/);
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

test('global proxy does not load Clerk middleware for public routing', () => {
  const proxy = readFile('src/proxy.ts');

  assert.doesNotMatch(
    proxy,
    /import \{ clerkMiddleware, createRouteMatcher \} from '@clerk\/nextjs\/server'/
  );
  assert.doesNotMatch(proxy, /@clerk\/nextjs\/server/);
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
