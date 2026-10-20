const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getVerifiedUserEmails,
} = require('../src/lib/clerk-verified-emails.cjs');

function address(id, emailAddress, status) {
  return { id, emailAddress, verification: status ? { status } : null };
}

test('ignores unverified addresses so they cannot grant access', () => {
  const result = getVerifiedUserEmails({
    primaryEmailAddressId: 'a',
    emailAddresses: [
      address('a', 'someone@example.com', 'verified'),
      address('b', 'Admin@CSRIndia.org', 'unverified'),
      address('c', 'reviewer@csrindia.org', null),
    ],
  });

  assert.deepEqual(result.emails, ['someone@example.com']);
  assert.equal(result.primaryEmail, 'someone@example.com');
});

test('uses the primary address id rather than list order', () => {
  const result = getVerifiedUserEmails({
    primaryEmailAddressId: 'b',
    emailAddresses: [
      address('a', 'old@example.com', 'verified'),
      address('b', 'Main@Example.com', 'verified'),
    ],
  });

  assert.deepEqual(result.emails, ['old@example.com', 'main@example.com']);
  assert.equal(result.primaryEmail, 'main@example.com');
});

test('returns no primary when the primary address is unverified', () => {
  const result = getVerifiedUserEmails({
    primaryEmailAddressId: 'a',
    emailAddresses: [address('a', 'new@example.com', 'unverified')],
  });

  assert.deepEqual(result.emails, []);
  assert.equal(result.primaryEmail, '');
});

test('handles a missing user', () => {
  assert.deepEqual(getVerifiedUserEmails(null), {
    emails: [],
    primaryEmail: '',
  });
});
