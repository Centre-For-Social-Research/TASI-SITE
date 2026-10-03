const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('vercel cron is configured to drain registration ops queues through a dedicated route', () => {
  const config = JSON.parse(readSource('vercel.json'));

  assert.ok(Array.isArray(config.crons));
  assert.ok(
    config.crons.some(
      (cron) =>
        cron.path === '/api/internal/registration-ops/drain' &&
        cron.schedule === '0 0 * * *'
    )
  );
});

test('registration ops drain route secures cron execution with CRON_SECRET and processes both queues', () => {
  const source = readSource(
    'src/app/api/internal/registration-ops/drain/route.js'
  );

  assert.match(source, /processNextAvailablePassIssueEmailJob/);
  assert.match(source, /processNextAvailableRegistrationEmailJob/);
  assert.match(source, /authorization/);
  assert.match(source, /CRON_SECRET/);
});

test('drains keep QR chunks small and stop before their time limit', () => {
  const daily = readSource(
    'src/app/api/internal/registration-ops/drain/route.js'
  );
  const passWeek = readSource(
    'src/app/api/internal/registration-ops/drain-passes/route.js'
  );

  for (const source of [daily, passWeek]) {
    assert.match(source, /export const maxDuration = 300;/);
    assert.match(source, /QR_CHUNK_SIZE = 5/);
    assert.match(source, /chunkSize: QR_CHUNK_SIZE/);
    assert.match(source, /TIME_BUDGET_MS/);
    assert.match(source, /CRON_SECRET/);
  }

  // The pass-week drain only finishes QR pass jobs; it never creates one or
  // touches the confirmation email queue.
  assert.match(passWeek, /processNextAvailablePassIssueEmailJob/);
  assert.doesNotMatch(passWeek, /createPassIssueEmailJob|RegistrationEmail/);
});

test('QR process route caps the chunk size and allows enough time', () => {
  const source = readSource('src/app/api/admin/passes/jobs/process/route.js');

  assert.match(source, /export const maxDuration = 300;/);
  assert.match(
    source,
    /Math\.min\(Math\.floor\(requestedChunk\), MAX_CHUNK_SIZE\)/
  );
});

test('starting a QR job kicks off sending in small chunks within a time budget', () => {
  const source = readSource('src/app/api/admin/passes/jobs/route.js');

  assert.match(source, /export const maxDuration = 300;/);
  assert.match(source, /const AFTER_CHUNK_SIZE = 5;/);
  assert.match(source, /const AFTER_TIME_BUDGET_MS = 120 \* 1000;/);
  assert.match(source, /chunkSize: AFTER_CHUNK_SIZE/);
  assert.doesNotMatch(source, /for \(let i = 0; i < 6; i\+\+\)/);
});

test('claiming QR pass items first recovers items stuck by an interrupted send', () => {
  const source = readSource('src/lib/registration-ops-db.js');
  const claimStart = source.indexOf(
    'export async function claimPassIssueEmailJobItems'
  );
  const claimBody = source.slice(claimStart, claimStart + 300);

  assert.match(claimBody, /await releaseStalePassIssueEmailJobItems\(jobId\)/);
  // Recovery only moves an item if it is still exactly as read.
  assert.match(
    source,
    /\.eq\('status', 'processing'\)\s*\.eq\('last_attempt_at', item\.last_attempt_at\)/
  );
});

test('stuck processing items are retried, or failed when out of attempts, only after 10 minutes', () => {
  const {
    STALE_PROCESSING_MS,
    planStaleJobItemRecovery,
  } = require('../src/lib/registration-job-utils.cjs');
  const now = Date.parse('2026-10-03T12:00:00Z');
  const minutesAgo = (minutes) =>
    new Date(now - minutes * 60 * 1000).toISOString();

  assert.equal(STALE_PROCESSING_MS, 10 * 60 * 1000);

  const { retry, fail } = planStaleJobItemRecovery(
    [
      {
        id: 'fresh',
        status: 'processing',
        attempt_count: 1,
        max_attempts: 3,
        last_attempt_at: minutesAgo(2),
      },
      {
        id: 'stuck',
        status: 'processing',
        attempt_count: 1,
        max_attempts: 3,
        last_attempt_at: minutesAgo(11),
      },
      {
        id: 'spent',
        status: 'processing',
        attempt_count: 3,
        max_attempts: 3,
        last_attempt_at: minutesAgo(30),
      },
      {
        id: 'sent',
        status: 'sent',
        attempt_count: 1,
        max_attempts: 3,
        last_attempt_at: minutesAgo(60),
      },
      {
        id: 'no-time',
        status: 'processing',
        attempt_count: 1,
        max_attempts: 3,
        last_attempt_at: null,
      },
    ],
    now
  );

  assert.deepEqual(
    retry.map((item) => item.id),
    ['stuck']
  );
  assert.deepEqual(
    fail.map((item) => item.id),
    ['spent']
  );
});
