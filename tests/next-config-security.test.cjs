const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function getSiteHeaderValue(key) {
  const configUrl = pathToFileURL(
    path.join(process.cwd(), 'next.config.mjs')
  ).href;
  const { default: nextConfig } = await import(configUrl);
  const headers = await nextConfig.headers();
  const siteHeaders = headers.find(
    (entry) => entry.source === '/((?!studio).*)'
  );

  return siteHeaders.headers.find((header) => header.key === key)?.value;
}

test('site permissions policy allows the app to request camera access', async () => {
  const permissionsPolicy = await getSiteHeaderValue('Permissions-Policy');

  assert.equal(
    permissionsPolicy,
    'camera=(self), microphone=(), geolocation=()'
  );
});

test('site CSP allows Clerk production frontend assets and API hosts', async () => {
  const contentSecurityPolicy = await getSiteHeaderValue(
    'Content-Security-Policy'
  );

  assert.match(
    contentSecurityPolicy,
    /script-src[^;]*https:\/\/\*\.clerk\.com/
  );
  assert.match(
    contentSecurityPolicy,
    /script-src[^;]*https:\/\/cdn\.jsdelivr\.net/
  );
  assert.match(
    contentSecurityPolicy,
    /connect-src[^;]*https:\/\/\*\.clerk\.com/
  );
  assert.match(contentSecurityPolicy, /img-src[^;]*https:\/\/\*\.clerk\.com/);
  assert.match(contentSecurityPolicy, /frame-src[^;]*https:\/\/\*\.clerk\.com/);
  assert.match(contentSecurityPolicy, /form-action 'self'/);
});

test('Next config pins tracing and Turbopack roots to the repo workspace', async () => {
  const configUrl = pathToFileURL(
    path.join(process.cwd(), 'next.config.mjs')
  ).href;
  const { default: nextConfig } = await import(configUrl);

  assert.equal(nextConfig.outputFileTracingRoot, process.cwd());
  assert.equal(nextConfig.turbopack.root, process.cwd());
});

test('instrumentation avoids loading Sentry during local development startup', () => {
  const instrumentation = require('node:fs').readFileSync(
    path.join(process.cwd(), 'src', 'instrumentation.ts'),
    'utf8'
  );

  assert.doesNotMatch(instrumentation, /import \* as Sentry/);
  assert.match(instrumentation, /NODE_ENV !== 'production'/);
  assert.match(instrumentation, /import\('@sentry\/nextjs'\)/);
  assert.match(instrumentation, /export async function register\(\)/);
  assert.match(instrumentation, /export async function onRequestError/);
});

test('Sentry Next wrapper only runs for production builds', () => {
  const nextConfig = require('node:fs').readFileSync(
    path.join(process.cwd(), 'next.config.mjs'),
    'utf8'
  );

  assert.match(nextConfig, /NODE_ENV === 'production'/);
  assert.match(nextConfig, /withSentryConfig\(nextConfig, sentryConfig\)/);
  assert.match(nextConfig, /: nextConfig/);
});

test('error boundaries avoid eager Sentry imports during local page compiles', () => {
  const errorBoundary = require('node:fs').readFileSync(
    path.join(process.cwd(), 'src', 'app', 'error.tsx'),
    'utf8'
  );
  const globalErrorBoundary = require('node:fs').readFileSync(
    path.join(process.cwd(), 'src', 'app', 'global-error.tsx'),
    'utf8'
  );

  for (const source of [errorBoundary, globalErrorBoundary]) {
    assert.doesNotMatch(source, /import \* as Sentry/);
    assert.doesNotMatch(source, /@sentry\/nextjs/);
    assert.match(source, /NODE_ENV === 'development'/);
  }
});
