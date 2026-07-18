'use client';

import JobManagerPanel from '@/components/admin/job-manager-panel';

const EMAIL_JOBS_CONFIG = {
  endpoints: {
    list: '/api/admin/email-jobs',
    detail: (jobId) => `/api/admin/email-jobs/${jobId}`,
    process: '/api/admin/email-jobs/process',
    retry: (jobId) => `/api/admin/email-jobs/${jobId}/retry`,
  },
  messages: {
    loadJobs: 'Unable to load registration email jobs.',
    networkLoadJobs: 'Network error while loading registration email jobs.',
    loadDetail: 'Unable to load email job detail.',
    networkLoadDetail: 'Network error while loading email job detail.',
    process: 'Unable to process registration email job right now.',
    retry: 'Unable to retry failed registration email items.',
  },
  intro: {
    eyebrow: 'Confirmation Emails',
    title: 'Send plain-text acknowledgments after registration approval',
    description:
      'Sends a text-only confirmation email when a registration is approved. No attachments, no pass — just a notification to the attendee that their spot is confirmed.',
    chips: (operator) => [
      `Handled by ${operator.displayName}`,
      'Text email · No attachment',
      'Retry failed confirmation emails',
    ],
  },
  alertTitle: 'Email Queue Error',
  statCards: [
    {
      key: 'queued',
      label: 'Queued Emails',
      tone: 'warning',
      detail: 'Waiting for background worker',
    },
    {
      key: 'processing',
      label: 'Processing',
      tone: 'info',
      detail: 'Currently sending',
    },
    {
      key: 'sent',
      label: 'Sent',
      tone: 'success',
      detail: 'Confirmation delivered to inbox',
    },
    {
      key: 'failed',
      label: 'Failed',
      tone: 'danger',
      detail: 'Need operator attention',
    },
  ],
  listHeader: {
    eyebrow: 'Confirmation Email Jobs',
    description:
      'Text-only notification emails · Select a job to inspect failures and retry.',
  },
  accent: {
    eyebrow: 'text-purple-600',
    processButton:
      'border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300',
    rowProcessButton:
      'border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300',
    selectedRow: 'bg-purple-50/40 dark:bg-purple-950/20',
    progressBar: 'bg-purple-600',
  },
  renderJobTitle: (job) => job.template_type,
  renderJobSubtitle: (job) =>
    `ID: ${job.id.slice(0, 8)}... · ${job.total_items} items`,
  emptyState: () => 'No registration email jobs yet.',
  detail: {
    eyebrow: 'Selected Job',
    stats: [
      { label: 'Total', field: 'total_items' },
      { label: 'Sent', field: 'sent_items' },
      { label: 'Failed', field: 'failed_items' },
    ],
    emptyHint:
      'Select an email job to inspect its timeline and retry failures.',
  },
};

export default function EmailJobsPanel({ operator }) {
  return <JobManagerPanel operator={operator} config={EMAIL_JOBS_CONFIG} />;
}
