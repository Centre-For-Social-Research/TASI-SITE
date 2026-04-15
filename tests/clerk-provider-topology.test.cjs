const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('root layout owns the single ClerkProvider boundary', () => {
  const rootLayout = readFile('src/app/layout.tsx');

  assert.match(rootLayout, /import \{ ClerkProvider \} from '@clerk\/nextjs'/);
  assert.match(rootLayout, /<ClerkProvider>/);
  assert.match(rootLayout, /<\/ClerkProvider>/);
});

test('sign-in page does not create a nested ClerkProvider', () => {
  const signInPage = readFile('src/app/sign-in/[[...sign-in]]/page.jsx');

  assert.doesNotMatch(signInPage, /<ClerkProvider>/);
  assert.doesNotMatch(signInPage, /import \{ ClerkProvider, SignIn \} from '@clerk\/nextjs'/);
  assert.match(signInPage, /import \{ SignIn \} from '@clerk\/nextjs'/);
});

test('admin and not-authorized wrappers do not add extra ClerkProvider instances', () => {
  const adminExitGuard = readFile('src/components/admin/admin-exit-guard.jsx');
  const adminRouteExitWatcher = readFile(
    'src/components/admin/admin-route-exit-watcher.jsx'
  );
  const notAuthorizedLayout = readFile('src/app/not-authorized/layout.tsx');

  assert.doesNotMatch(adminExitGuard, /<ClerkProvider>/);
  assert.doesNotMatch(adminRouteExitWatcher, /<ClerkProvider>/);
  assert.doesNotMatch(notAuthorizedLayout, /<ClerkProvider>/);
});
