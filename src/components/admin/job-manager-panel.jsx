'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AdminAlert,
  AdminStatCard,
  AdminStatusBadge,
  LoadingRows,
} from '@/components/admin/admin-ui';
import { ChevronRight } from 'lucide-react';
import AdminPageIntro from '@/components/admin/admin-page-intro';
import jobView from '@/lib/admin-job-view.cjs';

const {
  itemFilterOptions,
  itemMatchesFilter,
  itemTone,
  jobCounts,
  jobResultText,
  jobStatusLabel,
  jobTone,
} = jobView;

function formatDate(value) {
  if (!value) return 'Not yet';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

// Queue processing runs like the speaker bulk send: one request at a time,
// a few items per request, and a short pause before the next one. Requests
// never overlap, so sends stay steady instead of arriving in bursts.
const PROCESS_CHUNK_SIZE = 5;
const PROCESS_GAP_MS = 700;

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  const sameDay = date.toDateString() === new Date().toDateString();
  return new Intl.DateTimeFormat('en-IN', {
    ...(sameDay ? {} : { day: 'numeric', month: 'short' }),
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

const TONE_COLORS = {
  success: 'var(--adm-ok)',
  warning: 'var(--adm-warn)',
  danger: 'var(--adm-bad)',
  default: 'var(--adm-ink-3)',
};

const panelStyle = {
  borderRadius: 10,
  border: '1px solid var(--adm-line)',
  background: 'var(--adm-panel)',
};

const eyebrowStyle = {
  fontFamily: 'var(--adm-mono)',
  fontSize: 10,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  fontWeight: 600,
  color: 'var(--adm-ink-3)',
};

function pillButtonStyle(tone = 'default') {
  const danger = tone === 'danger';
  return {
    borderRadius: 999,
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    border: `1px solid ${danger ? 'var(--adm-bad)' : 'var(--adm-line-strong)'}`,
    background: danger ? 'var(--adm-bad-soft)' : 'var(--adm-panel)',
    color: danger ? 'var(--adm-bad)' : 'var(--adm-ink)',
  };
}

function chipStyle(active) {
  return {
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 600,
    border: `1px solid ${active ? 'var(--adm-ink)' : 'var(--adm-line-strong)'}`,
    background: active ? 'var(--adm-ink)' : 'var(--adm-panel)',
    color: active ? 'var(--adm-accent-ink)' : 'var(--adm-ink-2)',
  };
}

function ProgressBar({ percent, tone }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      style={{
        height: 6,
        borderRadius: 999,
        background: 'var(--adm-line-strong)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${percent}%`,
          borderRadius: 999,
          background: TONE_COLORS[tone] || TONE_COLORS.default,
          transition: 'width 300ms ease',
        }}
      />
    </div>
  );
}

/**
 * Generic admin job-queue panel.
 *
 * Renders the shared job list → job detail → process/retry workflow used by
 * both the confirmation-email queue and the QR pass delivery queue. All
 * endpoint URLs, labels, accent styling, and panel-specific rendering are
 * provided through the `config` prop so each queue stays a thin wrapper.
 */
export default function JobManagerPanel({ config }) {
  const {
    endpoints, // { list, detail(jobId), process, retry(jobId) }
    messages, // { loadJobs, networkLoadJobs, loadDetail, networkLoadDetail, process, retry }
    intro,
    alertTitle,
    statCards, // [{ key: 'queued'|'processing'|'sent'|'failed', label, tone, detail }]
    listHeader, // { eyebrow, description }
    accent, // { eyebrow, processButton, rowProcessButton, selectedRow, progressBar }
    renderJobTitle, // (job, detailItems?) => ReactNode
    renderJobSubtitle, // (job) => ReactNode
    emptyState, // (state) => string
    detail, // { eyebrow, stats: [{ label, field }], emptyHint }
    trackQueueUnavailable = false,
    queueUnavailableAlert, // { title, description } when trackQueueUnavailable
  } = config;

  const [jobsState, setJobsState] = useState({
    loading: true,
    jobs: [],
    selectedJobId: '',
    selectedDetail: null,
    error: '',
    queueUnavailable: false,
  });
  const [itemFilter, setItemFilter] = useState('all');

  // One job open at a time; clicking the open job closes it.
  const toggleJob = (jobId) => {
    setItemFilter('all');
    setJobsState((current) => ({
      ...current,
      selectedJobId: current.selectedJobId === jobId ? '' : jobId,
    }));
  };

  const loadJobs = useCallback(async () => {
    try {
      const response = await fetch(endpoints.list, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) {
        setJobsState((current) => ({
          ...current,
          loading: false,
          error: data.error || messages.loadJobs,
        }));
        return;
      }

      setJobsState((current) => ({
        ...current,
        loading: false,
        jobs: data.jobs || [],
        selectedJobId: current.selectedJobId,
        ...(trackQueueUnavailable
          ? { queueUnavailable: Boolean(data.queueUnavailable) }
          : {}),
        error: '',
      }));
    } catch {
      setJobsState((current) => ({
        ...current,
        loading: false,
        error: messages.networkLoadJobs,
      }));
    }
  }, [endpoints.list, messages, trackQueueUnavailable]);

  const loadJobDetail = useCallback(
    async (jobId) => {
      if (!jobId) {
        setJobsState((current) => ({ ...current, selectedDetail: null }));
        return;
      }

      try {
        const response = await fetch(endpoints.detail(jobId), {
          cache: 'no-store',
        });
        const data = await response.json();
        if (!response.ok) {
          setJobsState((current) => ({
            ...current,
            error: data.error || messages.loadDetail,
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
          error: messages.networkLoadDetail,
        }));
      }
    },
    [endpoints, messages]
  );

  useEffect(() => {
    let active = true;

    async function hydrateJobs() {
      try {
        const response = await fetch(endpoints.list, { cache: 'no-store' });
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
          selectedJobId: current.selectedJobId,
          ...(trackQueueUnavailable
            ? { queueUnavailable: Boolean(data.queueUnavailable) }
            : {}),
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
  }, [endpoints.list, trackQueueUnavailable]);

  useEffect(() => {
    if (!jobsState.selectedJobId) return undefined;
    let active = true;

    async function hydrateJobDetail() {
      try {
        const response = await fetch(
          endpoints.detail(jobsState.selectedJobId),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobsState.selectedJobId]);

  const hasActiveJobs = useMemo(
    () =>
      jobsState.jobs.some((job) =>
        ['queued', 'processing'].includes(job.status)
      ),
    [jobsState.jobs]
  );

  // Latest refresh callbacks for the processing loop, which outlives renders.
  const refreshRef = useRef({ loadJobs, loadJobDetail, selectedJobId: '' });
  useEffect(() => {
    refreshRef.current = {
      loadJobs,
      loadJobDetail,
      selectedJobId: jobsState.selectedJobId,
    };
  }, [jobsState.selectedJobId, loadJobDetail, loadJobs]);

  // True while a process request is in flight, shared across loop restarts
  // so two requests are never sent at once.
  const processingRef = useRef(false);

  useEffect(() => {
    if (!hasActiveJobs) return undefined;
    let cancelled = false;

    const run = async () => {
      while (!cancelled) {
        if (!processingRef.current) {
          processingRef.current = true;
          try {
            await fetch(endpoints.process, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chunkSize: PROCESS_CHUNK_SIZE }),
            });
          } catch {
            // The next round retries; the queue keeps the item.
          } finally {
            processingRef.current = false;
          }
        }
        if (cancelled) break;

        const { selectedJobId, ...refresh } = refreshRef.current;
        void refresh.loadJobs();
        if (selectedJobId) void refresh.loadJobDetail(selectedJobId);
        await new Promise((resolve) =>
          window.setTimeout(resolve, PROCESS_GAP_MS)
        );
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [endpoints.process, hasActiveJobs]);

  const processJob = async (jobId = '') => {
    try {
      await fetch(endpoints.process, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, chunkSize: PROCESS_CHUNK_SIZE }),
      });
      void loadJobs();
      if (jobId) void loadJobDetail(jobId);
    } catch {
      setJobsState((current) => ({
        ...current,
        error: messages.process,
      }));
    }
  };

  const retryJob = async (jobId) => {
    try {
      await fetch(endpoints.retry(jobId), { method: 'POST' });
      void loadJobs();
      void loadJobDetail(jobId);
    } catch {
      setJobsState((current) => ({
        ...current,
        error: messages.retry,
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

  // Recipients of the open job, shown under its row.
  const openDetail =
    jobsState.selectedDetail?.job?.id === jobsState.selectedJobId
      ? jobsState.selectedDetail
      : null;
  const openItems = useMemo(() => openDetail?.items || [], [openDetail]);
  const filterOptions = useMemo(
    () => itemFilterOptions(openItems),
    [openItems]
  );
  const activeFilter = filterOptions.some((option) => option.key === itemFilter)
    ? itemFilter
    : 'all';
  const visibleItems = openItems.filter((item) =>
    itemMatchesFilter(item, activeFilter)
  );

  return (
    <div className="space-y-5">
      <AdminPageIntro description={intro.description} />

      {jobsState.error ? (
        <AdminAlert
          title={alertTitle}
          description={jobsState.error}
          tone="danger"
        />
      ) : null}
      {trackQueueUnavailable && jobsState.queueUnavailable ? (
        <AdminAlert
          title={queueUnavailableAlert.title}
          description={queueUnavailableAlert.description}
          tone="warning"
        />
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <AdminStatCard
            key={card.key}
            label={card.label}
            value={metrics[card.key]}
            tone={card.tone}
            detail={card.detail}
          />
        ))}
      </section>

      <section style={panelStyle} className="overflow-hidden">
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid var(--adm-line)' }}
        >
          <div>
            <p style={eyebrowStyle}>{listHeader.eyebrow}</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--adm-ink-3)' }}>
              {listHeader.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void processJob()}
            disabled={!hasActiveJobs}
            style={pillButtonStyle()}
            className="shrink-0 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Process All
          </button>
        </div>

        {jobsState.loading ? (
          <table className="min-w-full">
            <tbody>
              <LoadingRows count={5} cols={4} />
            </tbody>
          </table>
        ) : null}

        {!jobsState.loading && jobsState.jobs.length ? (
          <ul>
            {jobsState.jobs.map((job) => {
              const counts = jobCounts(job);
              const tone = jobTone(job);
              const open = jobsState.selectedJobId === job.id;
              return (
                <li
                  key={job.id}
                  style={{
                    borderBottom: '1px solid var(--adm-line)',
                    background: open ? 'var(--adm-panel-2)' : 'transparent',
                  }}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={open}
                    onClick={() => toggleJob(job.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleJob(job.id);
                      }
                    }}
                    className="grid cursor-pointer items-center gap-x-5 gap-y-3 px-5 py-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_250px]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <ChevronRight
                        size={16}
                        aria-hidden="true"
                        style={{
                          flexShrink: 0,
                          color: 'var(--adm-ink-3)',
                          transform: open ? 'rotate(90deg)' : 'none',
                          transition: 'transform 150ms ease',
                        }}
                      />
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-semibold"
                          style={{ color: 'var(--adm-ink)' }}
                        >
                          {renderJobTitle(job)}
                        </p>
                        <p
                          className="mt-1 truncate text-xs"
                          style={{ color: 'var(--adm-ink-3)' }}
                        >
                          {renderJobSubtitle(job)} ·{' '}
                          {formatDate(job.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <ProgressBar percent={counts.percent} tone={tone} />
                      <p
                        className="mt-1.5 text-xs"
                        style={{ color: 'var(--adm-ink-2)' }}
                      >
                        {jobResultText(job)}
                      </p>
                    </div>

                    <div className="flex items-center justify-start gap-2 md:justify-end">
                      {['queued', 'processing'].includes(job.status) ? (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void processJob(job.id);
                          }}
                          style={pillButtonStyle()}
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
                          style={pillButtonStyle('danger')}
                        >
                          Retry Failed
                        </button>
                      ) : null}
                      <AdminStatusBadge tone={tone}>
                        {jobStatusLabel(job)}
                      </AdminStatusBadge>
                    </div>
                  </div>

                  {open ? (
                    <div className="px-5 pb-5 md:pl-12">
                      {!openDetail ? (
                        <p
                          className="text-sm"
                          style={{ color: 'var(--adm-ink-3)' }}
                        >
                          Loading recipients…
                        </p>
                      ) : (
                        <>
                          {openItems.length > 1 ? (
                            <div className="mb-3 flex flex-wrap gap-1.5">
                              {filterOptions.map((option) => (
                                <button
                                  key={option.key}
                                  type="button"
                                  onClick={() => setItemFilter(option.key)}
                                  aria-pressed={activeFilter === option.key}
                                  style={chipStyle(activeFilter === option.key)}
                                >
                                  {option.label} {option.count}
                                </button>
                              ))}
                            </div>
                          ) : null}

                          {/* Long lists scroll inside the job, so the page
                              stays short and the next job is close by. */}
                          <ul
                            className="max-h-[420px] overflow-y-auto"
                            style={panelStyle}
                          >
                            {visibleItems.map((item) => {
                              const name =
                                [
                                  item.registration?.first_name,
                                  item.registration?.last_name,
                                ]
                                  .filter(Boolean)
                                  .join(' ') || 'Unknown recipient';
                              const showReason =
                                item.failure_reason && item.status !== 'sent';
                              return (
                                <li
                                  key={item.id}
                                  className="px-4 py-2.5"
                                  style={{
                                    borderBottom: '1px solid var(--adm-line)',
                                  }}
                                >
                                  <div className="grid items-center gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto_80px]">
                                    <p
                                      className="truncate text-sm font-medium"
                                      style={{ color: 'var(--adm-ink)' }}
                                    >
                                      {name}
                                    </p>
                                    <p
                                      className="truncate text-xs"
                                      style={{ color: 'var(--adm-ink-3)' }}
                                    >
                                      {item.registration?.email}
                                    </p>
                                    <span>
                                      <AdminStatusBadge
                                        tone={itemTone(item.status)}
                                      >
                                        {item.status}
                                      </AdminStatusBadge>
                                    </span>
                                    <p
                                      className="text-xs tabular-nums sm:text-right"
                                      style={{ color: 'var(--adm-ink-3)' }}
                                    >
                                      {formatTime(
                                        item.sent_at ||
                                          item.last_attempt_at ||
                                          item.updated_at
                                      )}
                                    </p>
                                  </div>
                                  {showReason ? (
                                    <p
                                      className="mt-1 text-xs"
                                      style={{
                                        color:
                                          item.status === 'skipped'
                                            ? 'var(--adm-ink-3)'
                                            : 'var(--adm-bad)',
                                      }}
                                    >
                                      {item.failure_reason}
                                      {item.status === 'failed' &&
                                      item.attempt_count
                                        ? ` (${item.attempt_count} attempt${item.attempt_count === 1 ? '' : 's'})`
                                        : ''}
                                    </p>
                                  ) : null}
                                </li>
                              );
                            })}
                            {!openItems.length ? (
                              <li
                                className="px-4 py-3 text-sm"
                                style={{ color: 'var(--adm-ink-3)' }}
                              >
                                This job has no recipients recorded yet.
                              </li>
                            ) : null}
                          </ul>

                          {openItems.length > 0 &&
                          Number(job.total_items || 0) > openItems.length ? (
                            <p
                              className="mt-2 text-xs"
                              style={{ color: 'var(--adm-ink-3)' }}
                            >
                              Showing the first {openItems.length} of{' '}
                              {job.total_items} recipients.
                            </p>
                          ) : null}
                        </>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}

        {!jobsState.loading && !jobsState.jobs.length ? (
          <div
            className="p-8 text-center text-sm"
            style={{ color: 'var(--adm-ink-3)' }}
          >
            {emptyState(jobsState)}
          </div>
        ) : null}
      </section>
    </div>
  );
}
