// Display helpers for the admin email job pages (QR Pass Emails and the
// registration email queue): what a job's row says, its colour, and how the
// recipient list is filtered.

function count(value) {
  return Number(value || 0);
}

function jobCounts(job = {}) {
  const total = count(job.total_items);
  const sent = count(job.sent_items);
  const skipped = count(job.skipped_items);
  const failed = count(job.failed_items);
  const waiting =
    count(job.queued_items) +
    count(job.processing_items) +
    count(job.retrying_items);
  const done = Math.min(sent + skipped + failed, total);
  return {
    total,
    sent,
    skipped,
    failed,
    waiting,
    done,
    percent: total ? Math.round((done / total) * 100) : 0,
  };
}

// "48 sent · 1 skipped · 1 failed · 2 waiting", leaving out zero counts
// other than sent.
function jobResultText(job) {
  const counts = jobCounts(job);
  const parts = [`${counts.sent} sent`];
  if (counts.skipped) parts.push(`${counts.skipped} skipped`);
  if (counts.failed) parts.push(`${counts.failed} failed`);
  if (counts.waiting) parts.push(`${counts.waiting} waiting`);
  return parts.join(' · ');
}

function jobTone(job = {}) {
  const counts = jobCounts(job);
  if (counts.waiting > 0 || job.status === 'processing') return 'warning';
  if (counts.failed > 0 || job.status === 'failed') return 'danger';
  if (job.status === 'completed') return 'success';
  return 'default';
}

const STATUS_LABELS = {
  queued: 'Queued',
  processing: 'Sending',
  completed: 'Done',
  failed: 'Has failures',
};

function jobStatusLabel(job = {}) {
  if (job.status === 'failed') return STATUS_LABELS.failed;
  return STATUS_LABELS[job.status] || job.status || 'Unknown';
}

function itemTone(status) {
  if (status === 'sent') return 'success';
  if (status === 'failed') return 'danger';
  if (status === 'skipped') return 'default';
  return 'warning';
}

const ITEM_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'sent', label: 'Sent' },
  { key: 'failed', label: 'Failed' },
  { key: 'skipped', label: 'Skipped' },
  { key: 'waiting', label: 'Waiting' },
];

function itemMatchesFilter(item, filter) {
  if (filter === 'all') return true;
  if (filter === 'waiting') {
    return ['queued', 'processing', 'retrying'].includes(item.status);
  }
  return item.status === filter;
}

// Filter chips that have at least one recipient, with counts. "All" is
// always present.
function itemFilterOptions(items = []) {
  return ITEM_FILTERS.map((option) => ({
    ...option,
    count: items.filter((item) => itemMatchesFilter(item, option.key)).length,
  })).filter((option) => option.key === 'all' || option.count > 0);
}

module.exports = {
  itemFilterOptions,
  itemMatchesFilter,
  itemTone,
  jobCounts,
  jobResultText,
  jobStatusLabel,
  jobTone,
};
