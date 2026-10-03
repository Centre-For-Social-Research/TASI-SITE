const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('delivery jobs panel still surfaces queue-unavailable state and drives paced, non-overlapping processing', () => {
  const wrapper = readSource('src/components/admin/delivery-jobs-panel.jsx');
  const generic = readSource('src/components/admin/job-manager-panel.jsx');

  // Wrapper keeps the delivery-specific behavior via config.
  assert.match(wrapper, /trackQueueUnavailable: true/);
  assert.match(wrapper, /Unable to process QR delivery job right now/);
  assert.match(wrapper, /\/api\/admin\/passes\/jobs/);
  assert.match(wrapper, /JobManagerPanel/);

  // Generic panel processes one small chunk at a time, like the speaker bulk
  // send: never a new request while one is in flight, with a pause between.
  assert.match(generic, /queueUnavailable/);
  assert.match(generic, /const PROCESS_CHUNK_SIZE = 5;/);
  assert.match(generic, /const PROCESS_GAP_MS = 700;/);
  assert.match(generic, /processingRef\.current/);
  assert.match(generic, /chunkSize: PROCESS_CHUNK_SIZE/);
  assert.doesNotMatch(generic, /setInterval\(async/);
});

test('email jobs panel is a thin config wrapper around the generic job manager', () => {
  const wrapper = readSource('src/components/admin/email-jobs-panel.jsx');

  assert.match(wrapper, /JobManagerPanel/);
  assert.match(wrapper, /\/api\/admin\/email-jobs/);
  assert.match(wrapper, /Unable to process registration email job right now/);
  // Email queue has no queue-unavailable compatibility mode.
  assert.doesNotMatch(wrapper, /trackQueueUnavailable/);
});

test('generic job manager preserves shared queue behaviors', () => {
  const generic = readSource('src/components/admin/job-manager-panel.jsx');

  assert.match(generic, /cache: 'no-store'/);
  assert.match(generic, /Retry Failed/);
  assert.match(generic, /Process All/);
  assert.match(generic, /'queued', 'processing'/);
});
