/**
 * QR Code Stress Tests
 *
 * Covers four layers of the QR pipeline at volume:
 *   1. Payload generation throughput (buildFestivalQrPayload)
 *   2. Payload verification throughput — valid payloads
 *   3. Tampered-payload rejection throughput
 *   4. Uniqueness guarantee across large ticket-ID sets
 *   5. Scan-session throttle accuracy under rapid-fire frames
 *   6. Duplicate-token suppression under rapid-fire scanner latch
 *   7. Mixed valid/tampered traffic — no cross-contamination
 *   8. Edge-case payloads at volume (null, empty, truncated)
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { performance } = require('node:perf_hooks');
const { createScanSession } = require('../src/lib/check-in-scan-session.cjs');

async function importQr() {
  process.env.QR_HMAC_SECRET = 'stress-test-secret-32chars-padding!';
  const moduleUrl = pathToFileURL(
    path.join(process.cwd(), 'src/lib/festival-ticketing-qr.js')
  ).href;
  return import(moduleUrl);
}

// ─── 1. Generation throughput ────────────────────────────────────────────────

test('generates 10,000 QR payloads within 2 seconds', async () => {
  const { buildFestivalQrPayload } = await importQr();
  const N = 10_000;
  const start = performance.now();
  for (let i = 0; i < N; i++) {
    buildFestivalQrPayload(`ticket-${i}`);
  }
  const elapsed = performance.now() - start;
  assert.ok(
    elapsed < 2000,
    `generation took ${elapsed.toFixed(0)} ms — exceeded 2 s budget`
  );
});

// ─── 2. Verification throughput — valid payloads ─────────────────────────────

test('verifies 10,000 valid QR payloads within 2 seconds', async () => {
  const { buildFestivalQrPayload, verifyFestivalQrPayload } = await importQr();
  const N = 10_000;
  const payloads = Array.from({ length: N }, (_, i) =>
    buildFestivalQrPayload(`ticket-${i}`)
  );

  const start = performance.now();
  for (const payload of payloads) {
    const result = verifyFestivalQrPayload(payload);
    assert.ok(result !== null, `valid payload was rejected: ${payload}`);
  }
  const elapsed = performance.now() - start;
  assert.ok(
    elapsed < 2000,
    `verification took ${elapsed.toFixed(0)} ms — exceeded 2 s budget`
  );
});

// ─── 3. Tampered-payload rejection throughput ────────────────────────────────

test('rejects 10,000 tampered payloads within 2 seconds', async () => {
  const { buildFestivalQrPayload, verifyFestivalQrPayload } = await importQr();
  const N = 10_000;

  // Build valid payloads then corrupt the signature byte
  const tampered = Array.from({ length: N }, (_, i) => {
    const raw = buildFestivalQrPayload(`ticket-${i}`);
    // flip one char in the signature (last segment)
    return raw.slice(0, -1) + (raw.endsWith('a') ? 'b' : 'a');
  });

  const start = performance.now();
  for (const payload of tampered) {
    assert.equal(
      verifyFestivalQrPayload(payload),
      null,
      `tampered payload was not rejected: ${payload}`
    );
  }
  const elapsed = performance.now() - start;
  assert.ok(
    elapsed < 2000,
    `rejection took ${elapsed.toFixed(0)} ms — exceeded 2 s budget`
  );
});

// ─── 4. Uniqueness across large ticket-ID sets ───────────────────────────────

test('produces unique payloads for 5,000 distinct ticket IDs', async () => {
  const { buildFestivalQrPayload } = await importQr();
  const N = 5_000;
  const seen = new Set();
  for (let i = 0; i < N; i++) {
    const payload = buildFestivalQrPayload(`ticket-${i}`);
    assert.ok(
      !seen.has(payload),
      `duplicate payload at index ${i}: ${payload}`
    );
    seen.add(payload);
  }
  assert.equal(seen.size, N);
});

// ─── 5. Scan-session throttle under rapid-fire frames ───────────────────────

test('scan session allows exactly one decode per interval across 1,000 synthetic frames', () => {
  const INTERVAL = 100; // ms
  const session = createScanSession({
    decodeIntervalMs: INTERVAL,
    duplicateCooldownMs: 5000,
  });

  const TOTAL_MS = 10_000;
  const FRAME_STEP = 20; // synthetic frame every 20 ms → 500 frames
  let decodes = 0;

  for (let t = 0; t <= TOTAL_MS; t += FRAME_STEP) {
    if (session.shouldDecode(t)) decodes++;
  }

  // Expected: one decode at t=0, then one per INTERVAL → ceil(TOTAL_MS / INTERVAL) + 1
  const expected = Math.floor(TOTAL_MS / INTERVAL) + 1;
  assert.equal(
    decodes,
    expected,
    `expected ${expected} decodes, got ${decodes}`
  );
});

test('scan session never decodes more often than the interval', () => {
  const INTERVAL = 200;
  const session = createScanSession({ decodeIntervalMs: INTERVAL });
  let lastDecodeTime = -Infinity;

  for (let t = 0; t <= 5000; t += 17) {
    if (session.shouldDecode(t)) {
      assert.ok(
        t - lastDecodeTime >= INTERVAL,
        `decoded too soon: gap was ${t - lastDecodeTime} ms (min ${INTERVAL} ms)`
      );
      lastDecodeTime = t;
    }
  }
});

// ─── 6. Duplicate-token suppression under scanner latch ─────────────────────

test('scan session suppresses 500 rapid re-submissions of the same token', () => {
  const COOLDOWN = 1500;
  const session = createScanSession({
    decodeIntervalMs: 50,
    duplicateCooldownMs: COOLDOWN,
  });

  // First submission must be accepted
  assert.equal(session.shouldSubmitToken('TOKEN-A', 0), true);

  // All subsequent rapid re-submissions within cooldown must be rejected
  let spurious = 0;
  for (let t = 10; t < COOLDOWN; t += 10) {
    if (session.shouldSubmitToken('TOKEN-A', t)) spurious++;
  }
  assert.equal(spurious, 0, `${spurious} spurious submissions leaked through`);

  // After cooldown, same token must be accepted again
  assert.equal(session.shouldSubmitToken('TOKEN-A', COOLDOWN + 1), true);
});

test('scan session handles 1,000 distinct tokens within a single second without leaking cooldowns', () => {
  const session = createScanSession({
    decodeIntervalMs: 0,
    duplicateCooldownMs: 60_000, // very long cooldown per token
  });

  let accepted = 0;
  for (let i = 0; i < 1000; i++) {
    if (session.shouldSubmitToken(`token-${i}`, i)) accepted++;
  }
  // Every distinct token should be accepted exactly once
  assert.equal(accepted, 1000);
});

// ─── 7. Mixed valid/tampered traffic — no cross-contamination ───────────────

test('verifier correctly classifies 2,000 interleaved valid and tampered payloads', async () => {
  const { buildFestivalQrPayload, verifyFestivalQrPayload } = await importQr();
  const N = 1_000; // 1,000 valid + 1,000 tampered = 2,000 total

  const valid = Array.from({ length: N }, (_, i) =>
    buildFestivalQrPayload(`ticket-interleaved-${i}`)
  );
  const tampered = valid.map(
    (p) => p.slice(0, -1) + (p.endsWith('x') ? 'y' : 'x')
  );

  let truePositives = 0;
  let trueNegatives = 0;

  for (let i = 0; i < N; i++) {
    const v = verifyFestivalQrPayload(valid[i]);
    assert.ok(v !== null, `valid payload at ${i} unfairly rejected`);
    truePositives++;

    const t = verifyFestivalQrPayload(tampered[i]);
    assert.equal(t, null, `tampered payload at ${i} was NOT rejected`);
    trueNegatives++;
  }

  assert.equal(truePositives, N);
  assert.equal(trueNegatives, N);
});

// ─── 8. Edge-case payloads at volume ────────────────────────────────────────

test('verifier safely rejects 500 malformed edge-case payloads', async () => {
  const { verifyFestivalQrPayload } = await importQr();

  const edgeCases = [
    null,
    undefined,
    '',
    'TASI2026',
    'TASI2026:',
    'TASI2026::',
    'WRONGPREFIX:ticket-1:abc',
    ':ticket-1:abc',
    'TASI2026:ticket-1',
    'A'.repeat(256), // very long garbage
    '0'.repeat(64), // looks like a hash but no prefix
    '\x00\x01\x02', // binary-ish input
    'TASI2026:\n:\t', // whitespace injection
  ];

  // Run each edge case 38+ times to reach ~500 total iterations
  const repeats = Math.ceil(500 / edgeCases.length);
  let total = 0;
  for (let r = 0; r < repeats; r++) {
    for (const input of edgeCases) {
      assert.equal(
        verifyFestivalQrPayload(input),
        null,
        `edge case was not rejected: ${JSON.stringify(input)}`
      );
      total++;
    }
  }
  assert.ok(total >= 500);
});

test('buildFestivalQrPayload handles numeric and UUID-style ticket IDs consistently', async () => {
  const { buildFestivalQrPayload, verifyFestivalQrPayload } = await importQr();

  const uuids = Array.from(
    { length: 500 },
    () =>
      `${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
  );

  for (const id of uuids) {
    const payload = buildFestivalQrPayload(id);
    assert.match(payload, /^TASI2026:/);
    assert.equal(verifyFestivalQrPayload(payload), id);
  }
});
