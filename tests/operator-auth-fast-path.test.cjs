const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { transformSync } = require('esbuild');

const clerkVerifiedEmails = require('../src/lib/clerk-verified-emails.cjs');
const operatorSession = require('../src/lib/operator-session.cjs');
const operatorAuthUi = require('../src/lib/operator-auth-ui.cjs');

const { getSessionClaimIdentity } = clerkVerifiedEmails;

function loadModule(relativePath, dependencies, env = {}) {
  const source = fs.readFileSync(relativePath, 'utf8');
  const { code } = transformSync(source, { format: 'cjs' });
  const testModule = { exports: {} };
  vm.runInNewContext(code, {
    module: testModule,
    exports: testModule.exports,
    require: (specifier) => {
      if (!(specifier in dependencies)) {
        throw new Error(`Unexpected import ${specifier}`);
      }
      return dependencies[specifier];
    },
    process: { env },
    console: { info() {}, error() {} },
    Date,
  });
  return testModule.exports;
}

test('session claim identity needs a real primary_email', () => {
  assert.deepEqual(
    getSessionClaimIdentity({
      primary_email: ' Saquib@CSRIndia.org ',
      full_name: 'Saquib',
    }),
    {
      emails: ['saquib@csrindia.org'],
      primaryEmail: 'saquib@csrindia.org',
      fullName: 'Saquib',
    }
  );
  assert.equal(getSessionClaimIdentity({}), null);
  assert.equal(
    getSessionClaimIdentity({ primary_email: 'not-an-email' }),
    null
  );
  assert.equal(getSessionClaimIdentity(null), null);
});

function loadAuth({ session, user, stored, env }) {
  const calls = { currentUser: 0, stored: 0 };
  const auth = loadModule(
    'src/lib/registration-auth.js',
    {
      react: { cache: (fn) => fn },
      '@clerk/nextjs/server': {
        auth: async () => session,
        currentUser: async () => {
          calls.currentUser += 1;
          return user;
        },
      },
      '@/lib/clerk-config': {
        getClerkConfigDiagnostics: () => ({ fullyConfigured: true }),
      },
      '@/lib/operator-auth-ui.cjs': operatorAuthUi,
      '@/lib/operator-session.cjs': operatorSession,
      '@/lib/clerk-verified-emails.cjs': clerkVerifiedEmails,
      '@/lib/admin-email-store': {
        getStoredAdminEmails: async () => {
          calls.stored += 1;
          return stored || { adminEmails: [], reviewerEmails: [] };
        },
      },
    },
    env
  );
  return { auth, calls };
}

test('a session token with primary_email skips the Clerk API call', async () => {
  const { auth, calls } = loadAuth({
    session: {
      userId: 'user_1',
      sessionClaims: { primary_email: 'boss@example.com', full_name: 'Boss' },
    },
    env: { CLERK_ADMIN_EMAILS: 'boss@example.com' },
  });

  const operator = await auth.getAuthorizedOperator({ route: 'test' });
  assert.equal(operator.authorized, true);
  assert.equal(operator.role, 'admin');
  assert.equal(operator.displayName, 'Boss');
  assert.equal(operator.identitySource, 'session_claims');
  assert.equal(calls.currentUser, 0);
  assert.equal(calls.stored, 1);
});

test('without the claim it falls back to verified Clerk emails', async () => {
  const { auth, calls } = loadAuth({
    session: { userId: 'user_2', sessionClaims: {} },
    user: {
      id: 'user_2',
      fullName: 'Reviewer',
      primaryEmailAddressId: 'a',
      emailAddresses: [
        {
          id: 'a',
          emailAddress: 'person@example.com',
          verification: { status: 'verified' },
        },
        {
          id: 'b',
          emailAddress: 'boss@example.com',
          verification: { status: 'unverified' },
        },
      ],
    },
    stored: { adminEmails: [], reviewerEmails: ['person@example.com'] },
    env: { CLERK_ADMIN_EMAILS: 'boss@example.com' },
  });

  const operator = await auth.getAuthorizedOperator({ route: 'test' });
  assert.equal(operator.role, 'reviewer');
  assert.equal(operator.primaryEmail, 'person@example.com');
  assert.equal(operator.identitySource, 'current_user');
  assert.equal(calls.currentUser, 1);
});

test('Clerk metadata roles do not open the console', async () => {
  const { auth } = loadAuth({
    session: {
      userId: 'user_3',
      sessionClaims: { primary_email: 'app-admin@example.com' },
    },
    user: { id: 'user_3', publicMetadata: { role: 'admin' } },
    env: { CLERK_ADMIN_EMAILS: 'boss@example.com' },
  });

  const operator = await auth.getAuthorizedOperator({ route: 'test' });
  assert.equal(operator.authorized, false);
  assert.equal(operator.reason, 'unauthorized');
});

function fakeOverrides(rows, { fail = false } = {}) {
  const counter = { selects: 0 };
  const client = {
    from() {
      return {
        select() {
          return {
            order: async () => {
              counter.selects += 1;
              return fail
                ? { data: null, error: { message: 'down' } }
                : { data: rows, error: null };
            },
          };
        },
        upsert: async () => ({ error: null }),
        delete() {
          return { eq: async () => ({ error: null }) };
        },
      };
    },
  };
  return { client, counter };
}

test('stored operator emails are cached and cleared on change', async () => {
  const { client, counter } = fakeOverrides([
    { email: 'a@example.com', role: 'admin' },
    { email: 'r@example.com', role: 'reviewer' },
  ]);
  const store = loadModule('src/lib/admin-email-store.js', {
    '@/lib/supabase-admin': { getSupabaseAdmin: () => client },
  });

  const [first, second] = await Promise.all([
    store.getStoredAdminEmails(),
    store.getStoredAdminEmails(),
  ]);
  assert.deepEqual(first.adminEmails, ['a@example.com']);
  assert.deepEqual(second.reviewerEmails, ['r@example.com']);
  assert.equal(counter.selects, 1);

  await store.getStoredAdminEmails();
  assert.equal(counter.selects, 1);

  await store.removeStoredEmail('r@example.com');
  await store.getStoredAdminEmails();
  assert.equal(counter.selects, 2);
});

test('a failed lookup falls back to empty lists and is not cached', async () => {
  const { client, counter } = fakeOverrides([], { fail: true });
  const store = loadModule('src/lib/admin-email-store.js', {
    '@/lib/supabase-admin': { getSupabaseAdmin: () => client },
  });

  assert.equal(
    JSON.stringify(await store.getStoredAdminEmails()),
    JSON.stringify({ adminEmails: [], reviewerEmails: [] })
  );
  await store.getStoredAdminEmails();
  assert.equal(counter.selects, 2);
});
