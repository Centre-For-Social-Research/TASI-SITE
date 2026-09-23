const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const {
  CLAIM_SCOPE,
  reserveVolunteerApplication,
  releaseVolunteerApplicationClaim,
} = require('../src/lib/volunteer-application-dedupe.cjs');

function database({
  lookups = [[]],
  lookupError,
  deleteError,
  claimError,
} = {}) {
  const calls = [];
  let lookupIndex = 0;
  const supabase = {
    from(table) {
      const query = { table, filters: [] };
      calls.push(query);
      const builder = {
        select() {
          query.operation = 'select';
          return builder;
        },
        delete() {
          query.operation = 'delete';
          return builder;
        },
        eq(column, value) {
          query.filters.push([column, value]);
          return builder;
        },
        lt(column, value) {
          query.filters.push([column, value]);
          return builder;
        },
        limit() {
          return Promise.resolve({
            data: lookups[lookupIndex++] ?? [],
            error: lookupError ?? null,
          });
        },
        insert(value) {
          query.operation = 'insert';
          query.value = value;
          return Promise.resolve({ error: claimError ?? null });
        },
        then(resolve) {
          resolve({ error: deleteError ?? null });
        },
      };
      return builder;
    },
  };
  return { supabase, calls };
}

test('an existing volunteer email is accepted without creating another claim', async () => {
  const { supabase, calls } = database({ lookups: [[{ id: 42 }]] });
  assert.deepEqual(
    await reserveVolunteerApplication(supabase, 'person@example.org'),
    { state: 'existing' }
  );
  assert.equal(calls.length, 1);
});

test('a new volunteer email gets a scoped, time-limited claim', async () => {
  const { supabase, calls } = database();
  const now = new Date('2026-09-23T10:00:00.000Z');
  const result = await reserveVolunteerApplication(
    supabase,
    'person@example.org',
    now
  );
  const key = createHash('sha256').update('person@example.org').digest('hex');
  assert.deepEqual(result, { state: 'claimed', key });
  assert.deepEqual(calls[1].filters, [
    ['scope', CLAIM_SCOPE],
    ['idempotency_key', key],
    ['expires_at', now.toISOString()],
  ]);
  assert.deepEqual(calls[2].value, {
    scope: CLAIM_SCOPE,
    idempotency_key: key,
    status: 'processing',
    expires_at: '2026-09-23T10:05:00.000Z',
    updated_at: now.toISOString(),
  });
});

test('a concurrent claim reports processing until the saved submission is visible', async () => {
  const { supabase } = database({
    claimError: { code: '23505' },
    lookups: [[], []],
  });
  assert.deepEqual(
    await reserveVolunteerApplication(supabase, 'person@example.org'),
    { state: 'processing' }
  );
});

test('a concurrent claim reports existing after the other request saves', async () => {
  const { supabase } = database({
    claimError: { code: '23505' },
    lookups: [[], [{ id: 42 }]],
  });
  assert.deepEqual(
    await reserveVolunteerApplication(supabase, 'person@example.org'),
    { state: 'existing' }
  );
});

test('database failures fail closed before another submission or email', async () => {
  const lookup = database({ lookupError: { message: 'offline' } });
  await assert.rejects(
    reserveVolunteerApplication(lookup.supabase, 'person@example.org')
  );
  assert.equal(lookup.calls.length, 1);

  const expiredCleanup = database({ deleteError: { message: 'offline' } });
  await assert.rejects(
    reserveVolunteerApplication(expiredCleanup.supabase, 'person@example.org')
  );
  assert.equal(expiredCleanup.calls.length, 2);

  const claim = database({ claimError: { code: '500' } });
  await assert.rejects(
    reserveVolunteerApplication(claim.supabase, 'person@example.org')
  );
});

test('a failed message insert can release only its own claim', async () => {
  const { supabase, calls } = database();
  await releaseVolunteerApplicationClaim(supabase, 'claim-key');
  assert.equal(calls[0].table, 'app_idempotency_keys');
  assert.deepEqual(calls[0].filters, [
    ['scope', CLAIM_SCOPE],
    ['idempotency_key', 'claim-key'],
  ]);
});
