const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'lib', 'registration-auth.js'),
  'utf8'
);

test('console roles come from verified allowlisted emails only', () => {
  assert.match(source, /getVerifiedUserEmails\(user\)/);
  assert.doesNotMatch(source, /user\.emailAddresses|user\?\.emailAddresses/);
});

test('Clerk metadata and CLERK_ACCESS_MODE never grant console roles', () => {
  assert.doesNotMatch(source, /\??\.(publicMetadata|unsafeMetadata)\b/);
  assert.doesNotMatch(source, /process\.env\.CLERK_ACCESS_MODE/);
});
