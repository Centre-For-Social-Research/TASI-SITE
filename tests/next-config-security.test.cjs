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

  assert.match(contentSecurityPolicy, /script-src[^;]*https:\/\/\*\.clerk\.com/);
  assert.match(contentSecurityPolicy, /connect-src[^;]*https:\/\/\*\.clerk\.com/);
  assert.match(contentSecurityPolicy, /img-src[^;]*https:\/\/\*\.clerk\.com/);
  assert.match(contentSecurityPolicy, /frame-src[^;]*https:\/\/\*\.clerk\.com/);
  assert.match(contentSecurityPolicy, /form-action 'self'/);
});
