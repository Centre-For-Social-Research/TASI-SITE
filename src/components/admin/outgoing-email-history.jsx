'use client';

import { useCallback, useEffect, useState } from 'react';

function formatDate(value) {
  return value ? new Date(value).toLocaleString('en-IN') : '—';
}

export default function OutgoingEmailHistory() {
  const [emails, setEmails] = useState([]);
  const [cursor, setCursor] = useState('');
  const [cursorStack, setCursorStack] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [emailError, setEmailError] = useState('');
  const [emailLoading, setEmailLoading] = useState(true);
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on cursor change; updates complete after the request.
    void loadEmails(cursor);
  }, [cursor, loadEmails]);

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
    </div>
  );
}
