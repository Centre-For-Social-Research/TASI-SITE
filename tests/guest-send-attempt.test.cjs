const test = require('node:test');
const assert = require('node:assert/strict');
const {
  RETRY_AFTER_MS,
  RETRY_BEFORE_MS,
  guestSendIdempotencyKey,
  hashGuestEmailRequest,
  canRetryGuestSend,
} = require('../src/lib/guest-send-attempt.cjs');

test('one attempt keeps one provider idempotency key', () => {
  assert.equal(
    guestSendIdempotencyKey('attempt-123'),
    'guest-invitation/attempt-123'
  );
});

test('retry fingerprint covers recipient, content, and attachment bytes', () => {
  const request = {
    from: 'TASI <team@example.org>',
    to: 'guest@example.org',
    subject: 'Invitation',
    text: 'Hello',
    html: '<p>Hello</p>',
    replyTo: 'team@example.org',
    attachments: [
      { filename: 'poster.jpg', content: Buffer.from('first poster') },
    ],
  };
  const original = hashGuestEmailRequest(request);
  assert.equal(hashGuestEmailRequest({ ...request }), original);
  assert.notEqual(
    hashGuestEmailRequest({ ...request, to: 'other@example.org' }),
    original
  );
  assert.notEqual(
    hashGuestEmailRequest({ ...request, html: '<p>Changed</p>' }),
    original
  );
  assert.notEqual(
    hashGuestEmailRequest({
      ...request,
      attachments: [
        { filename: 'poster.jpg', content: Buffer.from('changed poster') },
      ],
    }),
    original
  );
});

test('safe retry is available only for a hashed unresolved attempt inside provider window', () => {
  const now = Date.parse('2026-09-23T20:00:00Z');
  const attempt = {
    delivery_status: 'sending',
    request_sha256: 'abc',
    created_at: new Date(now - RETRY_AFTER_MS).toISOString(),
  };
  assert.equal(canRetryGuestSend(attempt, now), true);
  assert.equal(
    canRetryGuestSend({ ...attempt, request_sha256: null }, now),
    false
  );
  assert.equal(
    canRetryGuestSend({ ...attempt, delivery_status: 'accepted' }, now),
    false
  );
  assert.equal(
    canRetryGuestSend(
      { ...attempt, created_at: new Date(now - RETRY_BEFORE_MS).toISOString() },
      now
    ),
    false
  );
  assert.equal(
    canRetryGuestSend(
      {
        ...attempt,
        created_at: new Date(now - RETRY_AFTER_MS + 1).toISOString(),
      },
      now
    ),
    false
  );
});

test('migration records attempts before sending and resolves invitation and history together', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const migration = fs.readFileSync(
    path.join(
      process.cwd(),
      'supabase/migrations/20260923192841_guest_invitation_send_attempt_state.sql'
    ),
    'utf8'
  );
  assert.match(
    migration,
    /insert into public\.guest_invitation_deliveries[\s\S]*'sending'/
  );
  assert.match(
    migration,
    /create unique index if not exists idx_guest_invitation_one_active_send/
  );
  assert.match(
    migration,
    /create or replace function public\.finish_guest_invitation_send/
  );
  assert.match(
    migration,
    /revoke all on function public\.finish_guest_invitation_send/
  );
  assert.doesNotMatch(
    migration,
    /event_registrations|entry_passes|registration_daily_check_ins/
  );
});
