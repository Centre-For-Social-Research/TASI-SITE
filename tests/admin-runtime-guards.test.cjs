const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

const {
  buildAdminNotificationStorageKey,
  resolveAdminShellRuntimeState,
} = require('../src/lib/admin-runtime-guards.cjs');

test('buildAdminNotificationStorageKey scopes dismissed alerts to the active operator', () => {
  assert.equal(
    buildAdminNotificationStorageKey({
      userId: 'user_123',
      primaryEmail: 'Admin@CSRIndia.org',
    }),
    'tasi-admin-read-notifications:user_123'
  );

  assert.equal(
    buildAdminNotificationStorageKey({
      primaryEmail: 'Reviewer@CSRIndia.org',
    }),
    'tasi-admin-read-notifications:reviewer-csrindia-org'
  );
});

test('resolveAdminShellRuntimeState requests re-auth instead of masking protected fetch failures as zero state', () => {
  const previousState = {
    summary: { pending: 9, confirmed: 4, qrIssued: 3, checkedIn: 1 },
    jobs: [{ failed_items: 2 }],
  };

  assert.deepEqual(
    resolveAdminShellRuntimeState({
      currentPath: '/admin/registrations',
      previousState,
      registrations: { ok: false, status: 401, data: {} },
      jobs: { ok: true, status: 200, data: { jobs: [] } },
    }),
    {
      nextState: previousState,
      runtimeIssue: {
        kind: 'reauth',
        redirectTo: '/sign-in?redirect_url=%2Fadmin%2Fregistrations',
      },
    }
  );
});

test('resolveAdminShellRuntimeState preserves the previous live state for non-auth fetch failures', () => {
  const previousState = {
    summary: { pending: 7, confirmed: 8, qrIssued: 5, checkedIn: 2 },
    jobs: [{ failed_items: 1 }],
  };

  assert.deepEqual(
    resolveAdminShellRuntimeState({
      currentPath: '/admin/check-in',
      previousState,
      registrations: { ok: false, status: 500, data: {} },
      jobs: { ok: false, status: 502, data: {} },
    }),
    {
      nextState: previousState,
      runtimeIssue: {
        kind: 'degraded',
        message: 'Live admin stats are temporarily unavailable.',
      },
    }
  );
});

test('admin layout owns the exit guard instead of mounting Clerk from the public shell', () => {
  const appShell = readFile('src/components/app-shell.jsx');
  const adminLayout = readFile('src/app/admin/layout.jsx');

  assert.doesNotMatch(appShell, /AdminRouteExitWatcher/);
  assert.doesNotMatch(appShell, /useClerk/);
  assert.match(
    adminLayout,
    /import AdminExitGuard from '@\/components\/admin\/admin-exit-guard'/
  );
  assert.match(adminLayout, /<AdminExitGuard>\{children\}<\/AdminExitGuard>/);
});
