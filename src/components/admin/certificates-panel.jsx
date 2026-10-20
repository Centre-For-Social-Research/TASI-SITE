'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Ban,
  Eye,
  FileText,
  FlaskConical,
  Pencil,
  Plus,
  RotateCcw,
  Send,
  Square,
  Stamp,
  X,
} from 'lucide-react';
import {
  AdminAlert,
  AdminStatCard,
  AdminStatusBadge,
  AdminToast,
  SlideOverDrawer,
} from '@/components/admin/admin-ui';

// Resend allows a few requests per second; a short gap keeps bulk sends safe.
const BULK_SEND_GAP_MS = 700;

const FILTERS = [
  { value: 'all', label: 'All certificates' },
  { value: 'not_emailed', label: 'Not emailed yet' },
  { value: 'emailed', label: 'Emailed' },
  { value: 'not_downloaded', label: 'Emailed, not downloaded' },
  { value: 'failed', label: 'Email failed' },
  { value: 'revoked', label: 'Revoked' },
];

const EVENT_LABELS = {
  issued: 'Issued',
  emailed: 'Emailed',
  email_failed: 'Email failed',
  link_reissued: 'New link requested',
  name_changed: 'Name or email changed',
  name_confirmed: 'Name confirmed and locked',
  code_sent: 'Email code sent',
  code_verified: 'Email code verified',
  code_failed: 'Wrong email code',
  downloaded: 'Downloaded',
  revoked: 'Revoked',
  reinstated: 'Reinstated',
};

function matches(c, filter) {
  if (filter === 'not_emailed')
    return c.status === 'active' && c.emailStatus === 'draft';
  if (filter === 'emailed') return c.emailStatus === 'sent';
  if (filter === 'not_downloaded')
    return c.emailStatus === 'sent' && !c.downloadCount;
  if (filter === 'failed') return c.emailStatus === 'failed';
  if (filter === 'revoked') return c.status === 'revoked';
  return true;
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value));
}

function btn(primary = false, danger = false) {
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
    border: `1px solid ${danger ? 'var(--adm-bad)' : primary ? 'var(--adm-accent)' : 'var(--adm-line-strong)'}`,
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

const INPUT = {
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
const LABEL = {
  color: 'var(--adm-ink-2)',
  fontFamily: 'var(--adm-mono)',
  fontSize: 10,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
};

async function readJson(response, fallback) {
  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json.success) throw new Error(json.error || fallback);
  return json;
}

function previewHtml(html) {
  if (!html || typeof window === 'undefined') return '';
  return html.replaceAll(
    'cid:tasi-logo',
    `${window.location.origin}/img/email/tasi-festival-logo.png`
  );
}

function statusBadge(c) {
  if (c.status === 'revoked')
    return <AdminStatusBadge tone="danger">Revoked</AdminStatusBadge>;
  if (c.emailStatus === 'sent')
    return <AdminStatusBadge tone="success">Emailed</AdminStatusBadge>;
  if (c.emailStatus === 'failed')
    return <AdminStatusBadge tone="danger">Email failed</AdminStatusBadge>;
  if (c.emailStatus === 'sending')
    return <AdminStatusBadge tone="warning">Sending</AdminStatusBadge>;
  return <AdminStatusBadge tone="info">Not emailed</AdminStatusBadge>;
}

export default function CertificatesPanel({ canManage, operatorEmail }) {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState('');
  const [bulk, setBulk] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [preview, setPreview] = useState(null);
  const [testTo, setTestTo] = useState(operatorEmail || '');
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '' });
  const stopRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const json = await readJson(
        await fetch('/api/admin/certificates', { cache: 'no-store' }),
        'Unable to load certificates.'
      );
      setRows(json.certificates || []);
      setSummary(json.summary || null);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount updates after an awaited request
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 8000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const working = Boolean(bulk?.running);
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(
      (c) =>
        matches(c, filter) &&
        (!term ||
          c.name.toLowerCase().includes(term) ||
          c.email.includes(term) ||
          c.code.toLowerCase().includes(term))
    );
  }, [rows, search, filter]);
  const unsent = useMemo(
    () =>
      rows.filter((c) => c.status === 'active' && c.emailStatus === 'draft'),
    [rows]
  );

  async function issueEligible() {
    if (
      !window.confirm(
        `Issue certificates for ${summary?.pendingEligible || 0} checked-in attendees who don't have one yet?\n\nNothing is emailed at this step.`
      )
    )
      return;
    setBusy('issue');
    try {
      const json = await readJson(
        await fetch('/api/admin/certificates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'issue-eligible' }),
        }),
        'Unable to issue certificates.'
      );
      const skipped = json.skipped?.length
        ? ` ${json.skipped.length} need their name checked: ${json.skipped.map((s) => s.email).join(', ')}.`
        : '';
      setToast({
        tone: json.skipped?.length ? 'warning' : 'success',
        message: `${json.issued} certificate${json.issued === 1 ? '' : 's'} issued.${skipped}`,
      });
      await load();
    } catch (issueError) {
      setToast({ tone: 'danger', message: issueError.message });
    } finally {
      setBusy('');
    }
  }

  async function addManual(event) {
    event.preventDefault();
    setBusy('add');
    try {
      const json = await readJson(
        await fetch('/api/admin/certificates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add', ...addForm }),
        }),
        'Unable to add attendee.'
      );
      setToast({
        tone: 'success',
        message: `Certificate ${json.certificate.code} issued to ${json.certificate.name}.`,
      });
      setAddOpen(false);
      setAddForm({ name: '', email: '' });
      await load();
    } catch (addError) {
      setToast({ tone: 'danger', message: addError.message });
    } finally {
      setBusy('');
    }
  }

  async function openDetail(c) {
    setSelected(c);
    setDetail(null);
    setPreview(null);
    try {
      const json = await readJson(
        await fetch(`/api/admin/certificates/${c.id}`, { cache: 'no-store' }),
        'Unable to load certificate.'
      );
      setDetail(json);
      setSelected(json.certificate);
      setForm({ name: json.certificate.name, email: json.certificate.email });
    } catch (detailError) {
      setToast({ tone: 'danger', message: detailError.message });
      setSelected(null);
    }
  }

  async function postSend(c, resend) {
    return readJson(
      await fetch(`/api/admin/certificates/${c.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resend }),
      }),
      'Unable to send certificate.'
    );
  }

  async function sendOne(c) {
    const resend = c.emailStatus === 'sent';
    if (
      !window.confirm(
        resend
          ? `Send ${c.name} a new certificate link at ${c.email}?\n\nTheir earlier link will stop working.`
          : `Email ${c.name}'s certificate to ${c.email}?`
      )
    )
      return;
    setBusy('send');
    try {
      await postSend(c, resend);
      setToast({
        tone: 'success',
        message: `Certificate email accepted for ${c.email}.`,
      });
      await load();
      if (selected?.id === c.id) await openDetail(c);
    } catch (sendError) {
      setToast({ tone: 'danger', message: sendError.message });
      await load();
    } finally {
      setBusy('');
    }
  }

  async function sendAll() {
    const queue = [...unsent];
    if (
      !queue.length ||
      !window.confirm(
        `Email certificates to ${queue.length} attendee${queue.length === 1 ? '' : 's'} who haven't been emailed yet?\n\nEach person gets only their own link.`
      )
    )
      return;
    stopRef.current = false;
    const failures = [];
    let sent = 0;
    setBulk({ running: true, done: 0, total: queue.length, sent, failures });
    for (const [index, c] of queue.entries()) {
      if (stopRef.current) break;
      try {
        await postSend(c, false);
        sent += 1;
      } catch (sendError) {
        failures.push({ name: c.name, message: sendError.message });
      }
      setBulk({
        running: true,
        done: index + 1,
        total: queue.length,
        sent,
        failures: [...failures],
      });
      if (index < queue.length - 1)
        await new Promise((r) => window.setTimeout(r, BULK_SEND_GAP_MS));
    }
    setBulk((current) => ({
      ...current,
      running: false,
      stopped: stopRef.current,
    }));
    await load();
  }

  async function saveDetails(event) {
    event.preventDefault();
    setBusy('save');
    try {
      const json = await readJson(
        await fetch(`/api/admin/certificates/${selected.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }),
        'Unable to save.'
      );
      setToast({
        tone: 'success',
        message: `${json.certificate.name} updated.`,
      });
      await load();
      await openDetail(json.certificate);
    } catch (saveError) {
      setToast({ tone: 'danger', message: saveError.message });
    } finally {
      setBusy('');
    }
  }

  async function toggleRevoke(c) {
    const revoking = c.status === 'active';
    let reason = '';
    if (revoking) {
      reason =
        window.prompt(
          `Revoke ${c.name}'s certificate ${c.code}?\n\nThe verification page will show it as revoked and the download link will stop working. Reason:`
        ) || '';
      if (!reason.trim()) return;
    } else if (!window.confirm(`Reinstate ${c.name}'s certificate?`)) return;
    setBusy('revoke');
    try {
      await readJson(
        await fetch(`/api/admin/certificates/${c.id}/revoke`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ revoked: revoking, reason }),
        }),
        'Unable to update.'
      );
      setToast({
        tone: 'success',
        message: revoking ? 'Certificate revoked.' : 'Certificate reinstated.',
      });
      await load();
      await openDetail(c);
    } catch (revokeError) {
      setToast({ tone: 'danger', message: revokeError.message });
    } finally {
      setBusy('');
    }
  }

  async function showPreview(c) {
    setBusy('preview');
    try {
      setPreview(
        (
          await readJson(
            await fetch(`/api/admin/certificates/${c.id}/preview`, {
              cache: 'no-store',
            }),
            'Unable to preview.'
          )
        ).email
      );
    } catch (previewError) {
      setToast({ tone: 'danger', message: previewError.message });
    } finally {
      setBusy('');
    }
  }

  async function sendTest(c) {
    setBusy('test');
    try {
      const json = await readJson(
        await fetch(`/api/admin/certificates/${c.id}/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: testTo.trim() }),
        }),
        'Unable to send test.'
      );
      setToast({
        tone: 'success',
        message: `Test sent to ${json.recipient}. Its link is a placeholder and does not open the certificate.`,
      });
    } catch (testError) {
      setToast({ tone: 'danger', message: testError.message });
    } finally {
      setBusy('');
    }
  }

  const current = detail?.certificate || selected;

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
            maxWidth: 640,
            color: 'var(--adm-ink-3)',
            fontSize: 14,
            lineHeight: 1.55,
          }}
        >
          Certificates of participation for attendees who checked in. Speakers
          and walk-ins are not included. Each attendee gets a private link to
          check their name and download the PDF; anyone can verify a certificate
          by its ID.
        </p>
        {canManage ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              style={btn()}
              disabled={working || Boolean(busy)}
              onClick={() => setAddOpen(true)}
            >
              <Plus size={14} /> Add attendee
            </button>
            <button
              type="button"
              style={btn()}
              disabled={working || Boolean(busy) || !summary?.pendingEligible}
              onClick={issueEligible}
            >
              <Stamp size={14} />{' '}
              {busy === 'issue'
                ? 'Issuing…'
                : `Issue for checked-in (${summary?.pendingEligible || 0})`}
            </button>
            <button
              type="button"
              style={{
                ...btn(true),
                opacity: working || !unsent.length ? 0.55 : 1,
              }}
              disabled={working || !unsent.length}
              onClick={sendAll}
            >
              <Send size={14} /> Email all not yet emailed ({unsent.length})
            </button>
          </div>
        ) : null}
      </section>

      {!canManage ? (
        <AdminAlert
          tone="info"
          title="Read-only access"
          description="Reviewers can view certificates. Only an admin can issue, edit, send or revoke them."
        />
      ) : null}

      {summary ? (
        <div
          className="adm-cert-stats"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 12,
          }}
        >
          <AdminStatCard
            label="Issued"
            value={summary.active}
            detail={summary.revoked ? `${summary.revoked} revoked` : undefined}
          />
          <AdminStatCard
            label="Not emailed"
            value={summary.notEmailed}
            tone="info"
          />
          <AdminStatCard
            label="Emailed"
            value={summary.emailed}
            tone="success"
            detail={summary.failed ? `${summary.failed} failed` : undefined}
          />
          <AdminStatCard
            label="Downloaded"
            value={summary.downloaded}
            tone="success"
          />
        </div>
      ) : null}

      {bulk ? (
        <AdminAlert
          tone={
            bulk.running ? 'info' : bulk.failures.length ? 'warning' : 'success'
          }
          title={
            bulk.running
              ? `Sending certificates… ${bulk.done} of ${bulk.total}`
              : `${bulk.stopped ? 'Stopped. ' : ''}${bulk.sent} certificate email${bulk.sent === 1 ? '' : 's'} accepted`
          }
          description={
            bulk.failures.length ? (
              <span style={{ display: 'grid', gap: 3 }}>
                {bulk.failures.map((f) => (
                  <span key={f.name} style={{ color: 'var(--adm-bad)' }}>
                    {f.name}: {f.message}
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
                style={btn(false, true)}
                onClick={() => {
                  stopRef.current = true;
                }}
              >
                <Square size={14} /> Stop after this one
              </button>
            ) : (
              <button type="button" style={btn()} onClick={() => setBulk(null)}>
                <X size={14} /> Dismiss
              </button>
            )
          }
        />
      ) : null}

      {error ? (
        <AdminAlert
          tone="danger"
          title="Could not load certificates"
          description={error}
          actions={
            <button type="button" style={btn()} onClick={load}>
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
          className="adm-cert-filters"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(220px, 1fr) 230px',
            gap: 10,
            padding: 18,
            borderBottom: '1px solid var(--adm-line)',
          }}
        >
          <input
            aria-label="Search certificates"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email or certificate ID…"
            style={INPUT}
          />
          <select
            aria-label="Filter certificates"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={INPUT}
          >
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
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
                {['Attendee', 'Certificate ID', 'Status', 'Downloads', ''].map(
                  (h) => (
                    <th
                      key={h}
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
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ padding: 18, color: 'var(--adm-ink-3)' }}
                  >
                    Loading certificates…
                  </td>
                </tr>
              ) : null}
              {!loading && !visible.length ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: '54px 20px',
                      textAlign: 'center',
                      color: 'var(--adm-ink-3)',
                    }}
                  >
                    <FileText size={28} style={{ margin: '0 auto 10px' }} />
                    <div>
                      {rows.length
                        ? 'No certificates match this filter.'
                        : 'No certificates yet. Use “Issue for checked-in” to create them.'}
                    </div>
                  </td>
                </tr>
              ) : null}
              {!loading &&
                visible.map((c) => (
                  <tr
                    key={c.id}
                    style={{ borderBottom: '1px solid var(--adm-line)' }}
                  >
                    <td
                      style={{
                        padding: '13px 16px',
                        color: 'var(--adm-ink)',
                        fontWeight: 500,
                      }}
                    >
                      {c.name}
                      <div
                        style={{
                          marginTop: 3,
                          color: 'var(--adm-ink-3)',
                          fontSize: 12,
                          fontWeight: 400,
                        }}
                      >
                        {c.email}
                        {c.source === 'manual' ? ' · added by hand' : ''}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: '13px 16px',
                        fontFamily: 'var(--adm-mono)',
                        fontSize: 12,
                        color: 'var(--adm-ink-2)',
                      }}
                    >
                      {c.code}
                    </td>
                    <td style={{ padding: '13px 16px' }}>{statusBadge(c)}</td>
                    <td
                      style={{
                        padding: '13px 16px',
                        color: 'var(--adm-ink-3)',
                        fontSize: 12,
                      }}
                    >
                      {c.downloadCount || '—'}
                    </td>
                    <td
                      style={{
                        padding: '9px 16px',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        {canManage &&
                        c.status === 'active' &&
                        ['draft', 'failed'].includes(c.emailStatus) ? (
                          <button
                            type="button"
                            style={btn(true)}
                            disabled={working || Boolean(busy)}
                            onClick={() => sendOne(c)}
                          >
                            <Send size={14} /> Send
                          </button>
                        ) : null}
                        <button
                          type="button"
                          style={btn()}
                          onClick={() => openDetail(c)}
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
          Showing {visible.length} of {rows.length} certificates
        </div>
      </section>

      <SlideOverDrawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add attendee"
      >
        <form onSubmit={addManual} style={{ display: 'grid', gap: 12 }}>
          <p
            style={{
              margin: 0,
              color: 'var(--adm-ink-3)',
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            For someone who attended but wasn&apos;t scanned in. Only add people
            you know were there. Speakers get a separate certificate.
          </p>
          {[
            { key: 'name', label: 'Name as it should appear' },
            { key: 'email', label: 'Email' },
          ].map((f) => (
            <label key={f.key} style={{ display: 'grid', gap: 6 }}>
              <span style={LABEL}>{f.label}</span>
              <input
                required
                value={addForm[f.key]}
                onChange={(e) =>
                  setAddForm((v) => ({ ...v, [f.key]: e.target.value }))
                }
                style={INPUT}
              />
            </label>
          ))}
          <button type="submit" style={btn(true)} disabled={busy === 'add'}>
            <Stamp size={14} />{' '}
            {busy === 'add' ? 'Issuing…' : 'Issue certificate'}
          </button>
        </form>
      </SlideOverDrawer>

      <SlideOverDrawer
        open={Boolean(selected)}
        onClose={() => {
          setSelected(null);
          setDetail(null);
          setPreview(null);
        }}
        title="Certificate"
      >
        {!current ? null : (
          <div style={{ display: 'grid', gap: 18 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  className="adm-eyebrow"
                  style={{ fontFamily: 'var(--adm-mono)' }}
                >
                  {current.code}
                </div>
                <h3
                  style={{
                    margin: '5px 0 0',
                    color: 'var(--adm-ink)',
                    fontSize: 18,
                  }}
                >
                  {current.name}
                </h3>
                {current.name !== current.originalName ? (
                  <div
                    style={{
                      color: 'var(--adm-ink-3)',
                      fontSize: 12,
                      marginTop: 3,
                    }}
                  >
                    Originally {current.originalName}
                  </div>
                ) : null}
              </div>
              {statusBadge(current)}
            </div>
            {current.status === 'revoked' ? (
              <AdminAlert
                tone="danger"
                title="Revoked"
                description={current.revokedReason}
              />
            ) : null}
            {current.lastError ? (
              <AdminAlert
                tone="danger"
                title="Last email error"
                description={current.lastError}
              />
            ) : null}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a
                href={`/api/admin/certificates/${current.id}/pdf`}
                target="_blank"
                rel="noreferrer"
                style={btn()}
              >
                <FileText size={14} /> View PDF (sample)
              </a>
              <button
                type="button"
                style={btn()}
                disabled={Boolean(busy)}
                onClick={() => showPreview(current)}
              >
                <Eye size={14} />{' '}
                {busy === 'preview' ? 'Loading…' : 'Preview email'}
              </button>
              {canManage && current.status === 'active' ? (
                <button
                  type="button"
                  style={btn(true)}
                  disabled={
                    Boolean(busy) ||
                    working ||
                    current.emailStatus === 'sending'
                  }
                  onClick={() => sendOne(current)}
                >
                  <Send size={14} />{' '}
                  {current.emailStatus === 'sent'
                    ? 'Send new link'
                    : 'Send certificate'}
                </button>
              ) : null}
            </div>

            {canManage && current.emailStatus !== 'sending' ? (
              <form onSubmit={saveDetails} style={{ display: 'grid', gap: 12 }}>
                {[
                  { key: 'name', label: 'Name on certificate' },
                  { key: 'email', label: 'Email' },
                ].map((f) => (
                  <label key={f.key} style={{ display: 'grid', gap: 6 }}>
                    <span style={LABEL}>{f.label}</span>
                    <input
                      value={form[f.key]}
                      onChange={(e) =>
                        setForm((v) => ({ ...v, [f.key]: e.target.value }))
                      }
                      style={INPUT}
                    />
                  </label>
                ))}
                <button type="submit" style={btn()} disabled={busy === 'save'}>
                  <Pencil size={14} />{' '}
                  {busy === 'save' ? 'Saving…' : 'Save details'}
                </button>
              </form>
            ) : null}

            {canManage ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendTest(current);
                }}
                style={{ display: 'grid', gap: 8 }}
              >
                <span style={LABEL}>Send a test to</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="email"
                    required
                    value={testTo}
                    onChange={(e) => setTestTo(e.target.value)}
                    style={{ ...INPUT, flex: 1 }}
                  />
                  <button type="submit" style={btn()} disabled={Boolean(busy)}>
                    <FlaskConical size={14} />{' '}
                    {busy === 'test' ? 'Sending…' : 'Send test'}
                  </button>
                </div>
                <p
                  style={{ margin: 0, color: 'var(--adm-ink-3)', fontSize: 12 }}
                >
                  The test is marked [TEST], its link is a placeholder, and it
                  does not count as sent.
                </p>
              </form>
            ) : null}

            <div
              style={{
                display: 'grid',
                gap: 6,
                color: 'var(--adm-ink-3)',
                fontSize: 12,
              }}
            >
              <div>
                Issued {formatDate(current.issuedAt)} · Downloads{' '}
                {current.downloadCount} · Last emailed{' '}
                {formatDate(current.lastSentAt)}
              </div>
              <div>
                Name{' '}
                {current.nameConfirmedAt
                  ? `confirmed and locked ${formatDate(current.nameConfirmedAt)}`
                  : 'not confirmed yet'}{' '}
                · Link expires {formatDate(current.tokenExpiresAt)}
              </div>
              {current.pdfSha256 ? (
                <div
                  style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
                >
                  PDF fingerprint {current.pdfSha256}
                </div>
              ) : null}
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              <div
                style={{
                  color: 'var(--adm-ink)',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                History
              </div>
              {(detail?.events || []).map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    border: '1px solid var(--adm-line)',
                    borderRadius: 10,
                    padding: '9px 12px',
                    fontSize: 12,
                    color: 'var(--adm-ink-2)',
                  }}
                >
                  <strong>
                    {EVENT_LABELS[ev.event_type] || ev.event_type}
                  </strong>{' '}
                  · {formatDate(ev.created_at)}
                  {ev.actor_email ? ` · ${ev.actor_email}` : ''}
                  {ev.detail?.from || ev.detail?.name ? (
                    <div style={{ marginTop: 3 }}>
                      {ev.detail.from
                        ? `${ev.detail.from} → ${ev.detail.to}`
                        : `${ev.detail.name.from} → ${ev.detail.name.to}`}
                    </div>
                  ) : null}
                  {ev.detail?.reason ? (
                    <div style={{ marginTop: 3 }}>{ev.detail.reason}</div>
                  ) : null}
                </div>
              ))}
            </div>

            {preview ? (
              <div style={{ display: 'grid', gap: 8 }}>
                <div
                  style={{
                    color: 'var(--adm-ink)',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {preview.subject}
                </div>
                <iframe
                  title="Certificate email preview"
                  srcDoc={previewHtml(preview.html)}
                  sandbox=""
                  style={{
                    width: '100%',
                    height: 620,
                    border: '1px solid var(--adm-line-strong)',
                    borderRadius: 10,
                    background: '#fff',
                  }}
                />
              </div>
            ) : null}

            {canManage ? (
              <button
                type="button"
                style={{
                  ...btn(false, current.status === 'active'),
                  justifySelf: 'start',
                }}
                disabled={Boolean(busy)}
                onClick={() => toggleRevoke(current)}
              >
                {current.status === 'active' ? (
                  <>
                    <Ban size={14} /> Revoke certificate
                  </>
                ) : (
                  <>
                    <RotateCcw size={14} /> Reinstate
                  </>
                )}
              </button>
            ) : null}
          </div>
        )}
      </SlideOverDrawer>

      {toast?.message ? (
        <div
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            zIndex: 60,
            width: 'min(420px, calc(100vw - 40px))',
            boxShadow: '0 12px 32px rgba(17,17,17,.12)',
            borderRadius: 10,
            background: 'var(--adm-panel)',
          }}
        >
          <AdminToast
            message={toast.message}
            tone={toast.tone}
            onDismiss={() => setToast(null)}
          />
        </div>
      ) : null}

      <style jsx>{`
        @media (max-width: 760px) {
          .adm-cert-filters,
          .adm-cert-stats {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
