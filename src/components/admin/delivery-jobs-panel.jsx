'use client';

import JobManagerPanel from '@/components/admin/job-manager-panel';

const DELIVERY_JOBS_CONFIG = {
  endpoints: {
    list: '/api/admin/passes/jobs',
    detail: (jobId) => `/api/admin/passes/jobs/${jobId}`,
    process: '/api/admin/passes/jobs/process',
    retry: (jobId) => `/api/admin/passes/jobs/${jobId}/retry`,
  },
  messages: {
    loadJobs: 'Unable to load jobs.',
    networkLoadJobs: 'Network error while loading jobs.',
    loadDetail: 'Unable to load job detail.',
    networkLoadDetail: 'Network error while loading job detail.',
    process: 'Unable to process QR delivery job right now.',
    retry: 'Unable to retry failed QR delivery items.',
  },
  intro: {
    eyebrow: 'Email delivery',
    title: 'QR Pass Emails',
    description:
      'Track QR pass emails and their v2 PDF entry passes. Open a job to inspect recipients or retry failed delivery.',
    chips: () => [],
  },
  alertTitle: 'Delivery Error',
  trackQueueUnavailable: true,
  queueUnavailableAlert: {
    title: 'Direct-Send Compatibility Mode',
    description:
      'Queue tables are not deployed in this environment yet. New QR sends will still work, but they are processed immediately instead of being tracked here as background jobs.',
  },
  statCards: [
    {
      key: 'queued',
      label: 'Queued Passes',
      tone: 'warning',
      detail: 'Waiting for the next worker pass',
    },
    {
      key: 'processing',
      label: 'Processing',
      tone: 'info',
      detail: 'Generating PDF or uploading QR',
    },
    {
      key: 'sent',
      label: 'Dispatched',
      tone: 'success',
      detail: 'PDF badge delivered to inbox',
    },
    {
      key: 'failed',
      label: 'Failed',
      tone: 'danger',
      detail: 'Need retry or operator attention',
    },
  ],
  listHeader: {
    eyebrow: 'Recent Pass Dispatch Jobs',
    description: 'Select a job to inspect recipients, failures, and retries.',
  },
  accent: {
    eyebrow: 'text-amber-600',
    processButton:
      'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
    rowProcessButton:
      'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
    selectedRow: 'bg-amber-50/40 dark:bg-amber-950/20',
    progressBar: 'bg-amber-600',
  },
  renderJobTitle: (job) =>
    job.id === 'legacy-direct-send'
      ? 'Direct Send'
      : `${job.id.slice(0, 8)}...`,
  renderJobSubtitle: (job) =>
    `${job.selection_mode} · ${job.total_items} items`,
  emptyState: (state) =>
    state.queueUnavailable
      ? 'Queue-backed jobs are unavailable in this environment, so there is nothing to inspect here yet.'
      : 'No QR delivery jobs yet. Queue one from the review page to see it here.',
  detail: {
    eyebrow: 'Selected Dispatch Job',
    stats: [
      { label: 'Total', field: 'total_items' },
      { label: 'Sent', field: 'sent_items' },
      { label: 'Skipped', field: 'skipped_items' },
      { label: 'Failed', field: 'failed_items' },
    ],
    emptyHint:
      'Select a delivery job to inspect its item timeline and retry failures.',
  },
};

export default function DeliveryJobsPanel({ operator }) {
  return <JobManagerPanel operator={operator} config={DELIVERY_JOBS_CONFIG} />;
}
