'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AdminAlert,
  AdminSectionHeading,
  AdminStatCard,
  AdminStatusBadge,
  LoadingRows,
} from '@/components/admin/admin-ui';

function formatDate(value) {
  if (!value) return 'Not yet';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function progressWidth(progress) {
  return `${Math.max(progress?.percentComplete || 0, 4)}%`;
}

function getJobTone(job) {
  const tone = job?.progress?.tone || 'default';
  if (tone === 'success') return 'success';
  if (tone === 'warning') return 'warning';
  if (tone === 'danger') return 'danger';
  return 'default';
}

export default function DeliveryJobsPanel({ operator }) {
  const [jobsState, setJobsState] = useState({
    loading: true,
    jobs: [],
    selectedJobId: '',
    selectedDetail: null,
    error: '',
    queueUnavailable: false,
  });

  const loadJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/passes/jobs', {
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok) {
        setJobsState((current) => ({
          ...current,
          loading: false,
          error: data.error || 'Unable to load jobs.',
        }));
        return;
      }

      setJobsState((current) => ({
        ...current,
        loading: false,
        jobs: data.jobs || [],
        selectedJobId: current.selectedJobId || data.jobs?.[0]?.id || '',
        queueUnavailable: Boolean(data.queueUnavailable),
        error: '',
      }));
    } catch {
      setJobsState((current) => ({
        ...current,
        loading: false,
        error: 'Network error while loading jobs.',
      }));
    }
  }, []);

  const loadJobDetail = useCallback(async (jobId) => {
    if (!jobId) {
      setJobsState((current) => ({ ...current, selectedDetail: null }));
      return;
    }

    try {
      const response = await fetch(`/api/admin/passes/jobs/${jobId}`, {
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok) {
        setJobsState((current) => ({
          ...current,
          error: data.error || 'Unable to load job detail.',
        }));
        return;
      }

      setJobsState((current) => ({
        ...current,
        selectedDetail: { job: data.job, items: data.items || [] },
        error: '',
      }));
    } catch {
      setJobsState((current) => ({
        ...current,
        error: 'Network error while loading job detail.',
      }));
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function hydrateJobs() {
      try {
        const response = await fetch('/api/admin/passes/jobs', {
          cache: 'no-store',
        });
        const data = await response.json();
        if (!active) return;

        if (!response.ok) {
          setJobsState((current) => ({
            ...current,
            loading: false,
            error: data.error || 'Unable to load jobs.',
          }));
          return;
        }

        setJobsState((current) => ({
          ...current,
          loading: false,
          jobs: data.jobs || [],
          selectedJobId: current.selectedJobId || data.jobs?.[0]?.id || '',
          queueUnavailable: Boolean(data.queueUnavailable),
          error: '',
        }));
      } catch {
        if (active) {
          setJobsState((current) => ({
            ...current,
            loading: false,
            error: 'Network error while loading jobs.',
          }));
        }
      }
    }

    void hydrateJobs();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!jobsState.selectedJobId) return undefined;
    let active = true;

    async function hydrateJobDetail() {
      try {
        const response = await fetch(
          `/api/admin/passes/jobs/${jobsState.selectedJobId}`,
          { cache: 'no-store' }
        );
        const data = await response.json();
        if (!active) return;

        if (!response.ok) {
          setJobsState((current) => ({
            ...current,
            error: data.error || 'Unable to load job detail.',
          }));
          return;
        }

        setJobsState((current) => ({
          ...current,
          selectedDetail: { job: data.job, items: data.items || [] },
          error: '',
        }));
      } catch {
        if (active) {
          setJobsState((current) => ({
            ...current,
            error: 'Network error while loading job detail.',
          }));
        }
      }
    }

    void hydrateJobDetail();
    return () => {
      active = false;
    };
  }, [jobsState.selectedJobId]);

  useEffect(() => {
    const hasActiveJobs = jobsState.jobs.some((job) =>
      ['queued', 'processing'].includes(job.status)
    );
    if (!hasActiveJobs) return undefined;

    const timer = window.setInterval(async () => {
      try {
        await fetch('/api/admin/passes/jobs/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
      } catch {}

      void loadJobs();
      if (jobsState.selectedJobId) void loadJobDetail(jobsState.selectedJobId);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [jobsState.jobs, jobsState.selectedJobId, loadJobDetail, loadJobs]);

  const processJob = async (jobId = '') => {
    try {
      await fetch('/api/admin/passes/jobs/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      void loadJobs();
      if (jobId) void loadJobDetail(jobId);
    } catch {
      setJobsState((current) => ({
        ...current,
        error: 'Unable to process QR delivery job right now.',
      }));
    }
  };

  const retryJob = async (jobId) => {
    try {
      await fetch(`/api/admin/passes/jobs/${jobId}/retry`, { method: 'POST' });
      void loadJobs();
      void loadJobDetail(jobId);
    } catch {
      setJobsState((current) => ({
        ...current,
        error: 'Unable to retry failed QR delivery items.',
      }));
    }
  };

  const metrics = useMemo(() => {
    const queued = jobsState.jobs.reduce(
      (sum, job) => sum + Number(job.queued_items || 0),
      0
    );
    const processing = jobsState.jobs.reduce(
      (sum, job) => sum + Number(job.processing_items || 0),
      0
    );
    const failed = jobsState.jobs.reduce(
      (sum, job) => sum + Number(job.failed_items || 0),
      0
    );
    const sent = jobsState.jobs.reduce(
      (sum, job) => sum + Number(job.sent_items || 0),
      0
    );

    return { queued, processing, failed, sent };
  }, [jobsState.jobs]);

  return (
    <div className="space-y-5">
      <section className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-sm dark:border-[#1e2a45] dark:bg-[#111a2e]">
        <AdminSectionHeading
          eyebrow="Delivery Jobs"
          title="Monitor QR mailings and retry failures"
          description="This screen is dedicated to outbound QR delivery. Keep review work in the registrations queue, and use this page to watch throughput, process background chunks, and recover failed sends."
        />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Operator: {operator.displayName} · {operator.primaryEmail}
        </p>
      </section>

      {jobsState.error ? (
        <AdminAlert
          title="Delivery Error"
          description={jobsState.error}
          tone="danger"
        />
      ) : null}
      {jobsState.queueUnavailable ? (
        <AdminAlert
          title="Direct-Send Compatibility Mode"
          description="Queue tables are not deployed in this environment yet. New QR sends will still work, but they are processed immediately instead of being tracked here as background jobs."
          tone="warning"
        />
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Queued Items"
          value={metrics.queued}
          tone="warning"
          detail="Waiting for the next worker pass"
        />
        <AdminStatCard
          label="Processing"
          value={metrics.processing}
          tone="info"
          detail="Currently being issued or mailed"
        />
        <AdminStatCard
          label="Sent"
          value={metrics.sent}
          tone="success"
          detail="Successfully delivered QR messages"
        />
        <AdminStatCard
          label="Failed"
          value={metrics.failed}
          tone="danger"
          detail="Need retry or operator attention"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm dark:border-[#1e2a45] dark:bg-[#111a2e]">
          <div className="border-b border-slate-200 px-5 py-3 dark:border-[#1e2a45]">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
              Recent Jobs
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Select a job to inspect item-level failures and retry actions.
            </p>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 bg-slate-50 dark:bg-[#162040]/80">
                <tr className="border-b border-slate-200 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:border-[#1e2a45] dark:text-slate-500">
                  <th className="px-4 py-3 text-left">Job</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Progress</th>
                  <th className="px-4 py-3 text-left">Attempts</th>
                  <th className="px-4 py-3 text-left">Updated</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobsState.loading ? <LoadingRows count={5} cols={6} /> : null}
                {!jobsState.loading &&
                  jobsState.jobs.map((job) => (
                    <tr
                      key={job.id}
                      className={`cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 dark:border-[#1a2744] dark:hover:bg-[#1e2a45]/50 ${jobsState.selectedJobId === job.id ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}`}
                      onClick={() =>
                        setJobsState((current) => ({
                          ...current,
                          selectedJobId: job.id,
                        }))
                      }
                    >
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                          {job.id === 'legacy-direct-send'
                            ? 'Direct Send'
                            : `${job.id.slice(0, 8)}...`}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {job.selection_mode} · {job.total_items} items
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <AdminStatusBadge tone={getJobTone(job)}>
                          {job.status}
                        </AdminStatusBadge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-[#253a5c]">
                          <div
                            className="h-full rounded-full bg-amber-600"
                            style={{ width: progressWidth(job.progress) }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {job.progress?.completed || 0} completed ·{' '}
                          {job.progress?.remaining || 0} remaining
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">
                        {job.sent_items || 0} sent · {job.failed_items || 0}{' '}
                        failed
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(job.updated_at || job.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {['queued', 'processing'].includes(job.status) ? (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void processJob(job.id);
                              }}
                              className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                            >
                              Process
                            </button>
                          ) : null}
                          {job.failed_items > 0 ? (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void retryJob(job.id);
                              }}
                              className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300"
                            >
                              Retry Failed
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!jobsState.loading && !jobsState.jobs.length ? (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {jobsState.queueUnavailable
                ? 'Queue-backed jobs are unavailable in this environment, so there is nothing to inspect here yet.'
                : 'No QR delivery jobs yet. Queue one from the review page to see it here.'}
            </div>
          ) : null}
        </section>

        <section className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-28 xl:self-start dark:border-[#1e2a45] dark:bg-[#111a2e]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
                Selected Job
              </p>
              <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-50">
                {jobsState.selectedDetail?.job?.id
                  ? `${jobsState.selectedDetail.job.id.slice(0, 12)}…`
                  : 'Pick a job'}
              </h3>
            </div>
            {jobsState.selectedDetail?.job ? (
              <AdminStatusBadge tone={getJobTone(jobsState.selectedDetail.job)}>
                {jobsState.selectedDetail.job.status}
              </AdminStatusBadge>
            ) : null}
          </div>

          {jobsState.selectedDetail?.job ? (
            <>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3 dark:border-[#1e2a45] dark:bg-[#162040]/60">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Total
                  </p>
                  <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">
                    {jobsState.selectedDetail.job.total_items}
                  </p>
                </div>
                <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3 dark:border-[#1e2a45] dark:bg-[#162040]/60">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Sent
                  </p>
                  <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">
                    {jobsState.selectedDetail.job.sent_items}
                  </p>
                </div>
                <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3 dark:border-[#1e2a45] dark:bg-[#162040]/60">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Skipped
                  </p>
                  <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">
                    {jobsState.selectedDetail.job.skipped_items}
                  </p>
                </div>
                <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3 dark:border-[#1e2a45] dark:bg-[#162040]/60">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Failed
                  </p>
                  <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">
                    {jobsState.selectedDetail.job.failed_items}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {(jobsState.selectedDetail.items || []).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[10px] border border-slate-200 bg-slate-50 p-3 dark:border-[#1e2a45] dark:bg-[#162040]/60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                          {item.registration?.first_name}{' '}
                          {item.registration?.last_name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {item.registration?.registration_code} ·{' '}
                          {item.registration?.email}
                        </p>
                      </div>
                      <AdminStatusBadge
                        tone={
                          item.status === 'sent'
                            ? 'success'
                            : item.status === 'failed'
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        {item.status}
                      </AdminStatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {item.failure_reason ||
                        item.registration?.organization ||
                        'No failure reason recorded.'}
                    </p>
                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                      Attempts: {item.attempt_count}/{item.max_attempts} · Last
                      attempt:{' '}
                      {formatDate(item.last_attempt_at || item.updated_at)}
                    </p>
                  </div>
                ))}

                {!(jobsState.selectedDetail.items || []).length ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    This job has no item-level attempts recorded yet.
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
              Select a delivery job to inspect its item timeline and retry
              failures.
            </p>
          )}
        </section>
      </section>
    </div>
  );
}
