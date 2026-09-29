'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Eye,
  FlaskConical,
  ImageUp,
  Mail,
  Pencil,
  Send,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import guestSendAttempt from '@/lib/guest-send-attempt.cjs';
import {
  AdminAlert,
  AdminStatCard,
  AdminStatusBadge,
  AdminToast,
  SlideOverDrawer,
} from '@/components/admin/admin-ui';

const { canRetryGuestSend } = guestSendAttempt;

// Resend's documented rate limit is a few requests per second; a short gap
// between bulk sends keeps every request well inside it.
const BULK_SEND_GAP_MS = 700;

const STATE_LABELS = {
  ready: 'Ready',
  sent: 'Sent',
  needs_email: 'Needs email',
  needs_badge: 'Needs badge',
  badge_updated: 'Badge updated',
  failed: 'Needs retry',
  sending: 'Sending',
};

const STATE_FILTERS = [
  { value: 'all', label: 'All speakers' },
  { value: 'ready', label: 'Ready to send' },
  { value: 'needs_email', label: 'Needs email' },
  { value: 'sent', label: 'Sent' },
  { value: 'attention', label: 'Needs attention' },
];

const EMPTY_FORM = { name: '', emails: '', designation: '', organization: '' };

function stateTone(state) {
  if (state === 'sent') return 'success';
  if (state === 'ready') return 'info';
  if (state === 'failed') return 'danger';
  if (state === 'sending' || state === 'badge_updated') return 'warning';
  return 'default';
}

function matchesFilter(speaker, filter) {
  if (filter === 'all') return true;
  if (filter === 'attention') {
    return ['failed', 'sending', 'badge_updated', 'needs_badge'].includes(
      speaker.state
    );
  }
  return speaker.state === filter;
}

function canSendState(state) {
  return ['ready', 'failed', 'badge_updated'].includes(state);
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value));
}

function buttonStyle(primary = false, danger = false) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 10,
    padding: '9px 13px',
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: 'var(--adm-mono)',
    letterSpacing: '.04em',
    border: `1px solid ${
      danger
        ? 'var(--adm-bad)'
        : primary
          ? 'var(--adm-accent)'
          : 'var(--adm-line-strong)'
    }`,
    background: danger
      ? 'var(--adm-bad-soft)'
      : primary
        ? 'var(--adm-accent)'
        : 'var(--adm-panel)',
    color: danger
      ? 'var(--adm-bad)'
      : primary
        ? 'var(--adm-accent-ink)'
        : 'var(--adm-ink)',
  };
}

function inputStyle() {
  return {
    width: '100%',
    border: '1px solid var(--adm-line-strong)',
    borderRadius: 10,
    background: 'var(--adm-panel)',
    color: 'var(--adm-ink)',
    padding: '10px 12px',
    fontSize: 13,
    outline: 'none',
    minHeight: 40,
  };
}

// The preview iframe is sandboxed and sends no session cookie, so the
// private badge is embedded as a data URL rather than linked.
function emailPreviewHtml(html, badgeDataUrl) {
  if (!html || typeof window === 'undefined') return '';
  const origin = window.location.origin;
  return html
    .replaceAll('cid:speaker-badge', badgeDataUrl || '')
    .replace(/cid:social-([a-z]+)/g, `${origin}/img/email/social/$1.png`)
    .replaceAll('cid:tasi-logo', `${origin}/img/email/tasi-festival-logo.png`)
    .replaceAll(
      'cid:tasi-delhi-footer',
      `${origin}/img/email/tasi-2026-delhi-footer.jpeg`
    );
}

async function fetchBadgeDataUrl(speakerId) {
  try {
    const response = await fetch(
      `/api/admin/speaker-communications/${speakerId}/badge`,
      { cache: 'no-store' }
    );
    if (!response.ok) return '';
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function readJson(response, fallback) {
  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json.success) throw new Error(json.error || fallback);
  return json;
}

function SectionTitle({ children }) {
  return (
    <div style={{ color: 'var(--adm-ink)', fontSize: 14, fontWeight: 600 }}>
      {children}
    </div>
  );
}

export default function SpeakerCommunicationsPanel({
  canManage,
  operatorEmail,
}) {
  const [edition, setEdition] = useState('2026');
  const [editions, setEditions] = useState(['2026']);
  const [speakers, setSpeakers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [upload, setUpload] = useState(null);
  const [bulk, setBulk] = useState(null);
  const [testSent, setTestSent] = useState(false);
  const [testTo, setTestTo] = useState(operatorEmail || '');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [savingEdit, setSavingEdit] = useState(false);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState('');
  const [clockNow, setClockNow] = useState(0);
  const [badgeVersion, setBadgeVersion] = useState(0);
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const stopBulkRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `/api/admin/speaker-communications?edition=${encodeURIComponent(edition)}`,
        { cache: 'no-store' }
      );
      const json = await readJson(response, 'Unable to load speakers.');
      setSpeakers(json.speakers || []);
      setSummary(json.summary || null);
      if (json.editions?.length) setEditions(json.editions);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [edition]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-change updates after an awaited request
    load();
  }, [load]);

  const working = Boolean(upload?.running || bulk?.running);
  useEffect(() => {
    if (!working) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [working]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return speakers.filter(
      (speaker) =>
        matchesFilter(speaker, filter) &&
        (!term ||
          speaker.name.toLowerCase().includes(term) ||
          speaker.emails.some((email) => email.includes(term)) ||
          speaker.organization.toLowerCase().includes(term))
    );
  }, [speakers, search, filter]);

  const readyIds = useMemo(
    () =>
      speakers
        .filter((speaker) => speaker.state === 'ready')
        .map((speaker) => speaker.id),
    [speakers]
  );

  async function openDetail(speaker) {
    setSelected(speaker);
    setDetail(null);
    setPreview(null);
    setDetailLoading(true);
    try {
      const response = await fetch(
        `/api/admin/speaker-communications/${speaker.id}`,
        { cache: 'no-store' }
      );
      const json = await readJson(response, 'Unable to load speaker.');
      setDetail(json);
      setSelected(json.speaker);
      setEditForm({
        name: json.speaker.name || '',
        emails: (json.speaker.emails || []).join(', '),
        designation: json.speaker.designation || '',
        organization: json.speaker.organization || '',
      });
    } catch (detailError) {
      setToast({ tone: 'danger', message: detailError.message });
      setSelected(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setSelected(null);
    setDetail(null);
    setPreview(null);
  }

  async function uploadFiles(fileList, speakerId = null) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const results = [];
    setUpload({ running: true, done: 0, total: files.length, results });

    for (const file of files) {
      const body = new FormData();
      body.set('edition', edition);
      body.set('file', file);
      if (speakerId) body.set('speakerId', speakerId);
      try {
        const response = await fetch(
          '/api/admin/speaker-communications/badges',
          { method: 'POST', body }
        );
        const json = await readJson(response, 'Upload failed.');
        results.push({
          file: file.name,
          ok: true,
          message: json.created
            ? `Added ${json.speaker.name}`
            : json.replaced
              ? `Replaced ${json.speaker.name}'s badge`
              : `Matched ${json.speaker.name}`,
        });
      } catch (uploadError) {
        results.push({
          file: file.name,
          ok: false,
          message: uploadError.message,
        });
      }
      setUpload({
        running: true,
        done: results.length,
        total: files.length,
        results: [...results],
      });
    }

    setUpload({
      running: false,
      done: results.length,
      total: files.length,
      results,
    });
    setBadgeVersion((version) => version + 1);
    await load();
    if (speakerId && selected?.id === speakerId) await openDetail(selected);
  }

  async function saveSpeaker(event) {
    event.preventDefault();
    if (!selected) return;
    setSavingEdit(true);
    try {
      const response = await fetch(
        `/api/admin/speaker-communications/${selected.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm),
        }
      );
      const json = await readJson(response, 'Unable to update speaker.');
      setToast({ tone: 'success', message: `${json.speaker.name} updated.` });
      await load();
      await openDetail(json.speaker);
    } catch (saveError) {
      setToast({ tone: 'danger', message: saveError.message });
    } finally {
      setSavingEdit(false);
    }
  }

  async function removeSpeaker(speaker) {
    if (
      !window.confirm(
        `Remove ${speaker.name} and their badge from ${edition}? This cannot be undone.`
      )
    )
      return;
    setBusy('remove');
    try {
      const response = await fetch(
        `/api/admin/speaker-communications/${speaker.id}`,
        { method: 'DELETE' }
      );
      await readJson(response, 'Unable to remove speaker.');
      setToast({ tone: 'success', message: `${speaker.name} removed.` });
      closeDetail();
      await load();
    } catch (removeError) {
      setToast({ tone: 'danger', message: removeError.message });
    } finally {
      setBusy('');
    }
  }

  async function showPreview(speaker) {
    setBusy('preview');
    try {
      const response = await fetch(
        `/api/admin/speaker-communications/${speaker.id}/preview`,
        { cache: 'no-store' }
      );
      const json = await readJson(response, 'Unable to preview email.');
      const badgeDataUrl = speaker.hasBadge
        ? await fetchBadgeDataUrl(speaker.id)
        : '';
      setPreview({ ...json.email, badgeDataUrl });
    } catch (previewError) {
      setToast({ tone: 'danger', message: previewError.message });
    } finally {
      setBusy('');
    }
  }

  async function sendTest(speaker) {
    setBusy('test');
    try {
      const response = await fetch(
        `/api/admin/speaker-communications/${speaker.id}/test`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: testTo.trim() }),
        }
      );
      const json = await readJson(response, 'Unable to send test email.');
      setTestSent(true);
      setToast({
        tone: 'success',
        message: `Test email with ${speaker.name}'s badge sent to ${json.recipient}.`,
      });
    } catch (testError) {
      setToast({ tone: 'danger', message: testError.message });
    } finally {
      setBusy('');
    }
  }

  async function postSend(speaker, { resend = false } = {}) {
    const response = await fetch(
      `/api/admin/speaker-communications/${speaker.id}/send`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resend }),
      }
    );
    return readJson(response, 'Unable to send badge.');
  }

  async function sendOne(speaker) {
    const isResend = speaker.state === 'sent';
    const recipients = speaker.emails.join(', ');
    const confirmed = window.confirm(
      isResend
        ? `${speaker.name} has already been sent this badge.\n\nSend it again to ${recipients}?`
        : `Send ${speaker.name}'s badge to ${recipients}?`
    );
    if (!confirmed) return;

    setBusy('send');
    try {
      const json = await postSend(speaker, { resend: isResend });
      setToast({
        tone: 'success',
        message: `Badge accepted for delivery to ${json.speaker.emails.join(', ')}.`,
      });
      await load();
      if (selected?.id === speaker.id) await openDetail(json.speaker);
    } catch (sendError) {
      setToast({ tone: 'danger', message: sendError.message });
      await load();
      if (selected?.id === speaker.id) await openDetail(speaker);
    } finally {
      setBusy('');
    }
  }

  async function retrySend(speaker) {
    if (
      !window.confirm(
        `Retry the same send for ${speaker.name}? Resend uses the original attempt ID, so the speaker cannot get a duplicate.`
      )
    )
      return;
    setBusy('retry');
    try {
      const response = await fetch(
        `/api/admin/speaker-communications/${speaker.id}/retry`,
        { method: 'POST' }
      );
      await readJson(response, 'Unable to retry this send safely.');
      setToast({ tone: 'success', message: 'The original send is confirmed.' });
      await load();
      await openDetail(speaker);
    } catch (retryError) {
      setToast({ tone: 'danger', message: retryError.message });
    } finally {
      setBusy('');
    }
  }

  async function sendAllReady() {
    const queue = speakers.filter((speaker) => readyIds.includes(speaker.id));
    if (!queue.length) return;
    if (
      !window.confirm(
        `Send badges to ${queue.length} speaker${queue.length === 1 ? '' : 's'} who have not been sent one yet?\n\nEach speaker gets only their own badge. Speakers already sent are skipped.`
      )
    )
      return;

    stopBulkRef.current = false;
    const failures = [];
    let sent = 0;
    setBulk({ running: true, done: 0, total: queue.length, sent, failures });

    for (const [index, speaker] of queue.entries()) {
      if (stopBulkRef.current) break;
      try {
        await postSend(speaker);
        sent += 1;
      } catch (sendError) {
        failures.push({ name: speaker.name, message: sendError.message });
      }
      setBulk({
        running: true,
        done: index + 1,
        total: queue.length,
        sent,
        failures: [...failures],
      });
      if (index < queue.length - 1) await sleep(BULK_SEND_GAP_MS);
    }

    setBulk((current) => ({
      ...current,
      running: false,
      stopped: stopBulkRef.current,
    }));
    await load();
  }

  const current = detail?.speaker || selected;
  useEffect(() => {
    if (current?.status !== 'sending') return undefined;
    const timer = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [current?.id, current?.status]);
  const retryReady = canRetryGuestSend(detail?.activeAttempt, clockNow);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <section
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <p
          style={{
            margin: 0,
            maxWidth: 650,
            color: 'var(--adm-ink-3)',
            fontSize: 14,
            lineHeight: 1.55,
          }}
        >
          Send each speaker their badge with a fixed email. Upload badges named
          after the speaker (for example <code>Yoel Roth.png</code>) and they
          are matched automatically. Replies go to tasi.comms@csrindia.org.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {editions.length > 1 ? (
            <select
              aria-label="Edition"
              value={edition}
              disabled={working}
              onChange={(event) => setEdition(event.target.value)}
              style={{ ...inputStyle(), width: 'auto' }}
            >
              {editions.map((value) => (
                <option key={value} value={value}>
                  TASI {value}
                </option>
              ))}
            </select>
          ) : null}
          {canManage ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                multiple
                hidden
                onChange={(event) => {
                  uploadFiles(event.target.files);
                  event.target.value = '';
                }}
              />
              <button
                type="button"
                disabled={working}
                style={buttonStyle()}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageUp size={14} /> Upload badges
              </button>
              <button
                type="button"
                disabled={working || !readyIds.length || !testSent}
                title={
                  testSent
                    ? undefined
                    : 'Send a test from any speaker’s details first.'
                }
                style={{
                  ...buttonStyle(true),
                  fontFamily: 'var(--adm-sans)',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: 0,
                  opacity: working || !readyIds.length || !testSent ? 0.55 : 1,
                }}
                onClick={sendAllReady}
              >
                <Send size={14} /> Send to all ready ({readyIds.length})
              </button>
            </>
          ) : null}
        </div>
      </section>

      {!canManage ? (
        <AdminAlert
          tone="info"
          title="Read-only access"
          description="Reviewer accounts can view speakers and badges, but only an admin can upload, edit or send."
        />
      ) : null}

      {summary ? (
        <div
          className="adm-speaker-stats"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 12,
          }}
        >
          <AdminStatCard label="Speakers" value={summary.total} />
          <AdminStatCard
            label="Ready to send"
            value={summary.ready}
            tone="info"
          />
          <AdminStatCard label="Sent" value={summary.sent} tone="success" />
          <AdminStatCard
            label="Needs email"
            value={summary.needsEmail}
            tone={summary.needsEmail ? 'warning' : 'default'}
          />
        </div>
      ) : null}

      {upload ? (
        <AdminAlert
          tone={
            upload.running
              ? 'info'
              : upload.results.some((result) => !result.ok)
                ? 'warning'
                : 'success'
          }
          title={
            upload.running
              ? `Uploading badges… ${upload.done} of ${upload.total}`
              : `Uploaded ${upload.results.filter((result) => result.ok).length} of ${upload.total} badges`
          }
          description={
            <span style={{ display: 'grid', gap: 3, marginTop: 4 }}>
              {upload.results
                .filter((result) => !result.ok)
                .map((result) => (
                  <span
                    key={result.file}
                    style={{ display: 'block', color: 'var(--adm-bad)' }}
                  >
                    {result.file}: {result.message}
                  </span>
                ))}
              {!upload.running
                ? upload.results
                    .filter(
                      (result) => result.ok && /^Added/.test(result.message)
                    )
                    .map((result) => (
                      <span key={result.file} style={{ display: 'block' }}>
                        {result.message} as a new speaker. Add their email to
                        send.
                      </span>
                    ))
                : null}
            </span>
          }
          actions={
            upload.running ? null : (
              <button
                type="button"
                style={buttonStyle()}
                onClick={() => setUpload(null)}
              >
                <X size={14} /> Dismiss
              </button>
            )
          }
        />
      ) : null}

      {bulk ? (
        <AdminAlert
          tone={
            bulk.running ? 'info' : bulk.failures.length ? 'warning' : 'success'
          }
          title={
            bulk.running
              ? `Sending badges… ${bulk.done} of ${bulk.total}`
              : `${bulk.stopped ? 'Stopped. ' : ''}${bulk.sent} badge${bulk.sent === 1 ? '' : 's'} accepted for delivery`
          }
          description={
            bulk.failures.length ? (
              <span style={{ display: 'grid', gap: 3, marginTop: 4 }}>
                {bulk.failures.map((failure) => (
                  <span
                    key={failure.name}
                    style={{ display: 'block', color: 'var(--adm-bad)' }}
                  >
                    {failure.name}: {failure.message}
                  </span>
                ))}
              </span>
            ) : bulk.running ? (
              'Keep this page open until sending finishes.'
            ) : null
          }
          actions={
            bulk.running ? (
              <button
                type="button"
                style={buttonStyle(false, true)}
                onClick={() => {
                  stopBulkRef.current = true;
                }}
              >
                <Square size={14} /> Stop after this one
              </button>
            ) : (
              <button
                type="button"
                style={buttonStyle()}
                onClick={() => setBulk(null)}
              >
                <X size={14} /> Dismiss
              </button>
            )
          }
        />
      ) : null}

      {error ? (
        <AdminAlert
          tone="danger"
          title="Could not load speakers"
          description={error}
          actions={
            <button type="button" style={buttonStyle()} onClick={load}>
              Try again
            </button>
          }
        />
      ) : null}

      <section
        style={{
          border: '1px solid var(--adm-line)',
          borderRadius: 10,
          background: 'var(--adm-panel)',
          overflow: 'hidden',
        }}
      >
        <div
          className="adm-speaker-filters"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(220px, 1fr) 200px',
            gap: 10,
            padding: 18,
            borderBottom: '1px solid var(--adm-line)',
          }}
        >
          <input
            aria-label="Search speakers"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, organisation…"
            style={inputStyle()}
          />
          <select
            aria-label="Filter speakers by status"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            style={inputStyle()}
          >
            {STATE_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}
          >
            <thead>
              <tr>
                {['Speaker', 'Email', 'Badge', 'Status', 'Last sent', ''].map(
                  (heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: '11px 16px',
                        textAlign: 'left',
                        borderBottom: '1px solid var(--adm-line)',
                        color: 'var(--adm-ink-3)',
                        fontFamily: 'var(--adm-mono)',
                        fontSize: 10,
                        letterSpacing: '.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: 18, color: 'var(--adm-ink-3)' }}
                  >
                    Loading speakers…
                  </td>
                </tr>
              ) : null}
              {!loading && !visible.length ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: '54px 20px',
                      textAlign: 'center',
                      color: 'var(--adm-ink-3)',
                    }}
                  >
                    <Mail size={28} style={{ margin: '0 auto 10px' }} />
                    <div>
                      {speakers.length
                        ? 'No speakers match this filter.'
                        : 'No speakers yet. Upload badges to add them.'}
                    </div>
                  </td>
                </tr>
              ) : null}
              {!loading &&
                visible.map((speaker) => (
                  <tr
                    key={speaker.id}
                    style={{ borderBottom: '1px solid var(--adm-line)' }}
                  >
                    <td
                      style={{
                        padding: '13px 16px',
                        color: 'var(--adm-ink)',
                        fontWeight: 500,
                      }}
                    >
                      {speaker.name}
                      {speaker.organization ? (
                        <div
                          style={{
                            marginTop: 3,
                            color: 'var(--adm-ink-3)',
                            fontSize: 12,
                            fontWeight: 400,
                          }}
                        >
                          {speaker.organization}
                        </div>
                      ) : null}
                    </td>
                    <td
                      style={{
                        padding: '13px 16px',
                        color: speaker.emails.length
                          ? 'var(--adm-ink-2)'
                          : 'var(--adm-ink-3)',
                        fontSize: 13,
                      }}
                    >
                      {speaker.emails.length
                        ? speaker.emails.join(', ')
                        : 'No email yet'}
                    </td>
                    <td
                      style={{
                        padding: '13px 16px',
                        color: 'var(--adm-ink-3)',
                        fontSize: 12,
                      }}
                    >
                      {speaker.hasBadge ? 'Uploaded' : 'Missing'}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <AdminStatusBadge tone={stateTone(speaker.state)}>
                        {STATE_LABELS[speaker.state] || speaker.state}
                      </AdminStatusBadge>
                    </td>
                    <td
                      style={{
                        padding: '13px 16px',
                        color: 'var(--adm-ink-3)',
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {speaker.lastSentAt
                        ? formatDate(speaker.lastSentAt)
                        : 'Not sent'}
                    </td>
                    <td
                      style={{
                        padding: '9px 16px',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          gap: 8,
                          justifyContent: 'flex-end',
                        }}
                      >
                        {canManage && canSendState(speaker.state) ? (
                          <button
                            type="button"
                            disabled={working || Boolean(busy)}
                            style={buttonStyle(true)}
                            onClick={() => sendOne(speaker)}
                          >
                            <Send size={14} /> Send
                          </button>
                        ) : null}
                        <button
                          type="button"
                          style={buttonStyle()}
                          onClick={() => openDetail(speaker)}
                        >
                          <Eye size={14} /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div
          style={{
            padding: '13px 18px',
            color: 'var(--adm-ink-3)',
            fontSize: 12,
          }}
        >
          Showing {visible.length} of {speakers.length} speakers
        </div>
      </section>

      <SlideOverDrawer
        open={Boolean(selected)}
        onClose={closeDetail}
        title="Speaker badge"
      >
        {detailLoading || !current ? (
          <p style={{ color: 'var(--adm-ink-3)', fontSize: 13 }}>
            Loading speaker…
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 18 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div className="adm-eyebrow">TASI {current.edition}</div>
                <h3
                  style={{
                    margin: '5px 0 0',
                    color: 'var(--adm-ink)',
                    fontSize: 18,
                  }}
                >
                  {current.name}
                </h3>
              </div>
              <AdminStatusBadge tone={stateTone(current.state)}>
                {STATE_LABELS[current.state] || current.state}
              </AdminStatusBadge>
            </div>

            {current.hasBadge ? (
              // eslint-disable-next-line @next/next/no-img-element -- private, auth-gated image served by an admin route
              <img
                src={`/api/admin/speaker-communications/${current.id}/badge?v=${badgeVersion}-${current.badgeSha256 || ''}`}
                alt={`${current.name} speaker badge`}
                style={{
                  width: '100%',
                  maxWidth: 360,
                  justifySelf: 'center',
                  borderRadius: 10,
                  border: '1px solid var(--adm-line)',
                }}
              />
            ) : (
              <AdminAlert
                tone="warning"
                title="No badge yet"
                description="Upload this speaker's badge before sending."
              />
            )}

            {canManage && current.status !== 'sending' ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  ref={replaceInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  hidden
                  onChange={(event) => {
                    uploadFiles(event.target.files, current.id);
                    event.target.value = '';
                  }}
                />
                <button
                  type="button"
                  disabled={working}
                  style={buttonStyle()}
                  onClick={() => replaceInputRef.current?.click()}
                >
                  <ImageUp size={14} />{' '}
                  {current.hasBadge ? 'Replace badge' : 'Upload badge'}
                </button>
              </div>
            ) : null}

            {canManage && current.status !== 'sending' ? (
              <form onSubmit={saveSpeaker} style={{ display: 'grid', gap: 12 }}>
                <SectionTitle>Speaker details</SectionTitle>
                {[
                  { key: 'name', label: 'Name (as on badge)', required: true },
                  {
                    key: 'emails',
                    label: 'Email (up to 3, separated by commas)',
                  },
                  { key: 'designation', label: 'Designation' },
                  { key: 'organization', label: 'Organisation' },
                ].map((field) => (
                  <label key={field.key} style={{ display: 'grid', gap: 6 }}>
                    <span
                      style={{
                        color: 'var(--adm-ink-2)',
                        fontFamily: 'var(--adm-mono)',
                        fontSize: 10,
                        letterSpacing: '.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {field.label}
                    </span>
                    <input
                      required={field.required}
                      value={editForm[field.key]}
                      onChange={(event) =>
                        setEditForm((form) => ({
                          ...form,
                          [field.key]: event.target.value,
                        }))
                      }
                      style={inputStyle()}
                    />
                  </label>
                ))}
                <button
                  type="submit"
                  disabled={savingEdit}
                  style={buttonStyle()}
                >
                  <Pencil size={14} /> {savingEdit ? 'Saving…' : 'Save details'}
                </button>
              </form>
            ) : null}

            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                paddingTop: 18,
                borderTop: '1px solid var(--adm-line)',
              }}
            >
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => showPreview(current)}
                style={buttonStyle()}
              >
                <Eye size={14} />{' '}
                {busy === 'preview' ? 'Loading…' : 'Preview email'}
              </button>
              {canManage &&
              (canSendState(current.state) || current.state === 'sent') ? (
                <button
                  type="button"
                  disabled={Boolean(busy) || working}
                  onClick={() => sendOne(current)}
                  style={buttonStyle(true)}
                >
                  <Send size={14} />
                  {busy === 'send'
                    ? 'Sending…'
                    : current.state === 'sent'
                      ? 'Resend badge'
                      : current.state === 'badge_updated'
                        ? 'Send updated badge'
                        : 'Send badge'}
                </button>
              ) : null}
            </div>
            {canManage && current.hasBadge ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  sendTest(current);
                }}
                style={{ display: 'grid', gap: 8 }}
              >
                <label
                  htmlFor="speaker-test-email"
                  style={{
                    color: 'var(--adm-ink-2)',
                    fontFamily: 'var(--adm-mono)',
                    fontSize: 10,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Send a test to
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    id="speaker-test-email"
                    type="email"
                    required
                    value={testTo}
                    onChange={(event) => setTestTo(event.target.value)}
                    placeholder="name@example.org"
                    style={{ ...inputStyle(), flex: 1 }}
                  />
                  <button
                    type="submit"
                    disabled={Boolean(busy)}
                    style={buttonStyle()}
                  >
                    <FlaskConical size={14} />{' '}
                    {busy === 'test' ? 'Sending…' : 'Send test'}
                  </button>
                </div>
                <p
                  style={{ margin: 0, color: 'var(--adm-ink-3)', fontSize: 12 }}
                >
                  The test uses this speaker’s badge, is marked [TEST], and does
                  not count as sent. One test unlocks “Send to all ready”.
                </p>
              </form>
            ) : null}

            {current.status === 'sending' ? (
              <AdminAlert
                tone="warning"
                title="Delivery needs confirmation"
                description={
                  retryReady
                    ? 'The send has been pending for 10 minutes. Retry the same attempt below. Resend uses its original ID, so the speaker cannot get a duplicate.'
                    : 'This send is locked while its outcome is uncertain. A safe retry becomes available after 10 minutes.'
                }
              />
            ) : null}
            {canManage && retryReady ? (
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => retrySend(current)}
                style={buttonStyle()}
              >
                {busy === 'retry' ? 'Retrying…' : 'Retry same send safely'}
              </button>
            ) : null}
            {current.lastError ? (
              <AdminAlert
                tone="danger"
                title="Last delivery error"
                description={current.lastError}
              />
            ) : null}

            <div style={{ display: 'grid', gap: 9 }}>
              <SectionTitle>Send history</SectionTitle>
              <div style={{ color: 'var(--adm-ink-3)', fontSize: 12 }}>
                Accepted sends: {current.sendCount} · Last:{' '}
                {formatDate(current.lastSentAt)}
                {detail?.lastEvent
                  ? ` · Resend status: ${detail.lastEvent}`
                  : ''}
              </div>
              {detail?.deliveries?.length ? (
                detail.deliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    style={{
                      border: '1px solid var(--adm-line)',
                      borderRadius: 10,
                      padding: '10px 12px',
                      color: 'var(--adm-ink-2)',
                      fontSize: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    <AdminStatusBadge
                      tone={
                        delivery.status === 'accepted'
                          ? 'success'
                          : delivery.status === 'sending'
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {delivery.status}
                    </AdminStatusBadge>
                    <div style={{ marginTop: 7 }}>
                      {formatDate(delivery.createdAt)}
                      {delivery.actorEmail ? ` · ${delivery.actorEmail}` : ''}
                    </div>
                    <div style={{ marginTop: 2 }}>
                      To: {delivery.recipientEmails.join(', ')}
                    </div>
                    {delivery.failureReason ? (
                      <div style={{ marginTop: 2, color: 'var(--adm-bad)' }}>
                        {delivery.failureReason}
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--adm-ink-3)', fontSize: 12 }}>
                  No sends yet.
                </div>
              )}
            </div>

            {preview ? (
              <div
                style={{
                  display: 'grid',
                  gap: 8,
                  paddingTop: 18,
                  borderTop: '1px solid var(--adm-line)',
                }}
              >
                <SectionTitle>{preview.subject}</SectionTitle>
                <div style={{ color: 'var(--adm-ink-3)', fontSize: 12 }}>
                  To:{' '}
                  {preview.to?.length ? preview.to.join(', ') : 'No email yet'}{' '}
                  · Badge attached
                </div>
                <iframe
                  title="Speaker badge email preview"
                  srcDoc={emailPreviewHtml(preview.html, preview.badgeDataUrl)}
                  sandbox=""
                  style={{
                    width: '100%',
                    height: 620,
                    border: '1px solid var(--adm-line-strong)',
                    borderRadius: 10,
                    background: '#ffffff',
                  }}
                />
              </div>
            ) : null}

            {canManage &&
            current.sendCount === 0 &&
            current.status !== 'sending' ? (
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => removeSpeaker(current)}
                style={{ ...buttonStyle(false, true), justifySelf: 'start' }}
              >
                <Trash2 size={14} /> Remove speaker
              </button>
            ) : null}
          </div>
        )}
      </SlideOverDrawer>

      <AdminToast
        message={toast?.message}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
      />

      <style jsx>{`
        @media (max-width: 760px) {
          .adm-speaker-filters,
          .adm-speaker-stats {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
