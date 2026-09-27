'use client';

import { useCallback, useEffect, useState } from 'react';

function formatDate(value) {
  return value ? new Date(value).toLocaleString('en-IN') : '—';
}

export default function OutgoingEmailHistory({ showJobs = true }) {
  const [emails, setEmails] = useState([]);
  const [cursor, setCursor] = useState('');
  const [cursorStack, setCursorStack] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [emailLoading, setEmailLoading] = useState(true);
  const [type, setType] = useState('registration');
  const [status, setStatus] = useState('issues');
  const [page, setPage] = useState(1);
  const [archive, setArchive] = useState({ jobs: [], totalPages: 0, total: 0 });
  const [archiveError, setArchiveError] = useState('');
  const [selected, setSelected] = useState(null);

  const loadEmails = useCallback(async (after = '') => {
    setEmailLoading(true);
    setEmailError('');
    try {
      const res = await fetch(
        `/api/admin/email-history${after ? `?after=${encodeURIComponent(after)}` : ''}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || 'Unable to load outgoing emails.');
      setEmails(data.emails || []);
      setNextCursor(data.nextCursor || null);
    } catch (error) {
      setEmailError(error.message);
    } finally {
      setEmailLoading(false);
    }
  }, []);

  const loadArchive = useCallback(async (nextType, nextStatus, nextPage) => {
    setArchiveError('');
    try {
      const query = new URLSearchParams({
        type: nextType,
        status: nextStatus,
        page: String(nextPage),
      });
      const res = await fetch(`/api/admin/email-history/jobs?${query}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load email jobs.');
      setArchive(data);
    } catch (error) {
      setArchiveError(error.message);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on cursor change; updates complete after the request.
    void loadEmails(cursor);
  }, [cursor, loadEmails]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on filter change; updates complete after the request.
    if (showJobs) void loadArchive(type, status, page);
  }, [showJobs, type, status, page, loadArchive]);

  async function selectJob(job, itemPage = 1, itemStatus = 'all') {
    setSelected({
      loading: true,
      id: job.id,
      page: itemPage,
      status: itemStatus,
    });
    try {
      const query = new URLSearchParams({
        type,
        page: String(itemPage),
        status: itemStatus,
      });
      const res = await fetch(
        `/api/admin/email-history/jobs/${job.id}/items?${query}`,
        {
          cache: 'no-store',
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load job details.');
      setSelected({
        id: job.id,
        job: data.job,
        items: data.items || [],
        page: itemPage,
        status: itemStatus,
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (error) {
      setSelected({
        id: job.id,
        error: error.message,
        page: itemPage,
        status: itemStatus,
      });
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[10px] border border-zinc-200 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">All outgoing emails</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Resend account history for every site email accepted by the
              provider. “Sent” means accepted for delivery; “Delivered” is the
              provider delivery event.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadEmails(cursor)}
            className="rounded-[10px] border border-zinc-300 px-3 py-1.5 text-sm dark:border-white/20"
          >
            Refresh
          </button>
        </div>
        {emailError ? (
          <p className="mt-4 text-sm text-rose-700">{emailError}</p>
        ) : null}
        {emailLoading ? (
          <p className="mt-4 text-sm text-zinc-500">Loading emails…</p>
        ) : null}
        {!emailLoading && !emailError ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-white/10">
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">To</th>
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2">Provider event</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((email) => (
                  <tr
                    key={email.id}
                    className="border-b border-zinc-100 dark:border-white/[0.06]"
                  >
                    <td className="whitespace-nowrap py-3 pr-4">
                      {formatDate(email.createdAt)}
                    </td>
                    <td className="py-3 pr-4">{(email.to || []).join(', ')}</td>
                    <td className="py-3 pr-4">{email.subject || '—'}</td>
                    <td className="py-3 capitalize">
                      {(email.lastEvent || 'unknown').replaceAll('_', ' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!emails.length ? (
              <p className="py-4 text-sm text-zinc-500">
                No emails on this page.
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="mt-4 flex items-center gap-3 text-sm">
          <button
            type="button"
            disabled={!cursorStack.length || emailLoading}
            onClick={() => {
              const stack = cursorStack.slice(0, -1);
              setCursorStack(stack);
              setCursor(stack.at(-1) || '');
            }}
            className="rounded-[10px] border border-zinc-300 px-3 py-1.5 disabled:opacity-40 dark:border-white/20"
          >
            Newer
          </button>
          <span>Page {cursorStack.length + 1}</span>
          <button
            type="button"
            disabled={!nextCursor || emailLoading}
            onClick={() => {
              setCursorStack([...cursorStack, nextCursor]);
              setCursor(nextCursor);
            }}
            className="rounded-[10px] border border-zinc-300 px-3 py-1.5 disabled:opacity-40 dark:border-white/20"
          >
            Older
          </button>
        </div>
      </section>

      {showJobs ? (
        <section className="rounded-[10px] border border-zinc-200 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.03]">
          <h2 className="text-base font-semibold">Email job archive</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Read-only records of registration and QR email jobs, including
            failures that may not appear in Resend. Opening these records does
            not process or retry them.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <label className="text-sm">
              Type{' '}
              <select
                value={type}
                onChange={(event) => {
                  setType(event.target.value);
                  setPage(1);
                  setSelected(null);
                }}
                className="ml-2 rounded-[10px] border border-zinc-300 p-1.5 dark:border-white/20 dark:bg-zinc-900"
              >
                <option value="registration">Registration</option>
                <option value="pass">QR pass</option>
              </select>
            </label>
            <label className="text-sm">
              Status{' '}
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                  setSelected(null);
                }}
                className="ml-2 rounded-[10px] border border-zinc-300 p-1.5 dark:border-white/20 dark:bg-zinc-900"
              >
                <option value="issues">Failed or retrying items</option>
                <option value="all">All</option>
                <option value="queued">Queued</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="completed">Completed</option>
              </select>
            </label>
          </div>
          {archiveError ? (
            <p className="mt-4 text-sm text-rose-700">{archiveError}</p>
          ) : null}
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-white/10">
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4">Template</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Accepted</th>
                  <th className="py-2">Failed</th>
                </tr>
              </thead>
              <tbody>
                {archive.jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="cursor-pointer border-b border-zinc-100 hover:bg-zinc-50 dark:border-white/[0.06] dark:hover:bg-white/[0.04]"
                    onClick={() => void selectJob(job)}
                  >
                    <td className="whitespace-nowrap py-3 pr-4">
                      {formatDate(job.created_at)}
                    </td>
                    <td className="py-3 pr-4">
                      {job.template_type || 'QR pass'}
                    </td>
                    <td className="py-3 pr-4">{job.status}</td>
                    <td className="py-3 pr-4">{job.sent_items}</td>
                    <td className="py-3">{job.failed_items}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!archive.jobs.length && !archiveError ? (
            <p className="mt-3 text-sm text-zinc-500">
              No jobs match this filter.
            </p>
          ) : null}
          <div className="mt-4 flex items-center gap-3 text-sm">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-[10px] border border-zinc-300 px-3 py-1.5 disabled:opacity-40 dark:border-white/20"
            >
              Newer
            </button>
            <span>
              Page {page} of {Math.max(archive.totalPages, 1)} · {archive.total}{' '}
              jobs
            </span>
            <button
              type="button"
              disabled={page >= archive.totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-[10px] border border-zinc-300 px-3 py-1.5 disabled:opacity-40 dark:border-white/20"
            >
              Older
            </button>
          </div>
          {selected ? (
            <div className="mt-5 rounded-[10px] border border-zinc-200 p-4 dark:border-white/10">
              <h3 className="font-semibold">Job details</h3>
              {selected.loading ? (
                <p className="mt-2 text-sm">Loading…</p>
              ) : selected.error ? (
                <p className="mt-2 text-sm text-rose-700">{selected.error}</p>
              ) : (
                <div className="mt-2 space-y-2 text-sm">
                  <label className="block">
                    Items{' '}
                    <select
                      value={selected.status}
                      onChange={(event) =>
                        void selectJob(selected, 1, event.target.value)
                      }
                      className="ml-2 rounded-[10px] border border-zinc-300 p-1.5 dark:border-white/20 dark:bg-zinc-900"
                    >
                      <option value="all">All</option>
                      <option value="issues">Failed or retrying</option>
                      <option value="failed">Failed</option>
                      <option value="retrying">Retrying</option>
                      <option value="sent">Sent</option>
                      <option value="queued">Queued</option>
                      <option value="processing">Processing</option>
                      {type === 'pass' ? (
                        <option value="skipped">Skipped</option>
                      ) : null}
                    </select>
                  </label>
                  {selected.items.map((item) => (
                    <div
                      key={item.id}
                      className="border-b border-zinc-100 py-2 dark:border-white/10"
                    >
                      <span>
                        {item.registration?.email || item.registration_id} ·{' '}
                        {item.status} · {item.attempt_count}/{item.max_attempts}{' '}
                        attempts
                      </span>
                      {item.failure_reason ? (
                        <p className="text-rose-700">{item.failure_reason}</p>
                      ) : null}
                    </div>
                  ))}
                  {!selected.items.length ? <p>No item records.</p> : null}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={selected.page <= 1}
                      onClick={() =>
                        void selectJob(
                          selected,
                          selected.page - 1,
                          selected.status
                        )
                      }
                      className="rounded-[10px] border border-zinc-300 px-3 py-1.5 disabled:opacity-40 dark:border-white/20"
                    >
                      Newer
                    </button>
                    <span>
                      Page {selected.page} of {Math.max(selected.totalPages, 1)}{' '}
                      · {selected.total} items
                    </span>
                    <button
                      type="button"
                      disabled={selected.page >= selected.totalPages}
                      onClick={() =>
                        void selectJob(
                          selected,
                          selected.page + 1,
                          selected.status
                        )
                      }
                      className="rounded-[10px] border border-zinc-300 px-3 py-1.5 disabled:opacity-40 dark:border-white/20"
                    >
                      Older
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
