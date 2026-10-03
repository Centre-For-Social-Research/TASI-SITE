const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  itemFilterOptions,
  itemMatchesFilter,
  itemTone,
  jobCounts,
  jobResultText,
  jobStatusLabel,
  jobTone,
} = require('../src/lib/admin-job-view.cjs');

test('job rows summarise progress in plain words, leaving out zero counts', () => {
  const running = {
    status: 'processing',
    total_items: 50,
    sent_items: 31,
    queued_items: 17,
    processing_items: 1,
    retrying_items: 1,
  };
  assert.equal(jobResultText(running), '31 sent · 19 waiting');
  assert.deepEqual(jobCounts(running), {
    total: 50,
    sent: 31,
    skipped: 0,
    failed: 0,
    waiting: 19,
    done: 31,
    percent: 62,
  });
  assert.equal(jobTone(running), 'warning');
  assert.equal(jobStatusLabel(running), 'Sending');

  const withFailure = {
    status: 'failed',
    total_items: 50,
    sent_items: 48,
    skipped_items: 1,
    failed_items: 1,
  };
  assert.equal(jobResultText(withFailure), '48 sent · 1 skipped · 1 failed');
  assert.equal(jobCounts(withFailure).percent, 100);
  assert.equal(jobTone(withFailure), 'danger');
  assert.equal(jobStatusLabel(withFailure), 'Has failures');

  const done = { status: 'completed', total_items: 1, sent_items: 1 };
  assert.equal(jobResultText(done), '1 sent');
  assert.equal(jobTone(done), 'success');
  assert.equal(jobStatusLabel(done), 'Done');
});

test('recipient filters only offer statuses that exist, with counts', () => {
  const items = [
    { status: 'sent' },
    { status: 'sent' },
    { status: 'failed' },
    { status: 'retrying' },
  ];
  assert.deepEqual(
    itemFilterOptions(items).map((option) => [option.key, option.count]),
    [
      ['all', 4],
      ['sent', 2],
      ['failed', 1],
      ['waiting', 1],
    ]
  );
  assert.ok(itemMatchesFilter({ status: 'queued' }, 'waiting'));
  assert.ok(!itemMatchesFilter({ status: 'sent' }, 'failed'));
  assert.equal(itemTone('sent'), 'success');
  assert.equal(itemTone('failed'), 'danger');
  assert.equal(itemTone('retrying'), 'warning');
});

test('jobs are one list; a job opens in place to show its recipients', () => {
  const panel = fs.readFileSync(
    path.join(process.cwd(), 'src/components/admin/job-manager-panel.jsx'),
    'utf8'
  );
  assert.ok(!panel.includes('xl:grid-cols-[minmax(0,1fr)_400px]'));
  assert.ok(panel.includes('aria-expanded={open}'));
  assert.ok(
    panel.includes(
      "selectedJobId: current.selectedJobId === jobId ? '' : jobId"
    )
  );
  assert.ok(panel.includes('max-h-[420px] overflow-y-auto'));
  assert.ok(!panel.includes('Attempts: {item.attempt_count}'));
});
