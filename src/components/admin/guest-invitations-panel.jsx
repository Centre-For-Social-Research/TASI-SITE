'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Mail, Pencil, Plus, Send, X } from 'lucide-react';
import guestSendAttempt from '@/lib/guest-send-attempt.cjs';
import {
  AdminAlert,
  AdminStatusBadge,
  AdminToast,
  SlideOverDrawer,
} from '@/components/admin/admin-ui';

const EMPTY_FORM = {
  name: '',
  email: '',
  designation: '',
  organization: '',
};
const { canRetryGuestSend } = guestSendAttempt;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All invitations' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Needs retry' },
  { value: 'sending', label: 'Sending' },
];

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value));
}

function statusTone(status) {
  if (status === 'sent') return 'success';
  if (status === 'failed') return 'danger';
  if (status === 'sending') return 'warning';
  return 'default';
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

function emailPreviewHtml(html) {
  if (!html || typeof window === 'undefined') return '';
  const origin = window.location.origin;
  return html
    .replaceAll('cid:tasi-logo', `${origin}/img/email/tasi-festival-logo.png`)
    .replaceAll(
      'cid:tasi-delhi-footer',
      `${origin}/img/email/tasi-2026-delhi-footer.jpeg`
    );
}

function InvitationForm({ form, onChange, onSubmit, saving, submitLabel }) {
  const fields = [
    { key: 'name', label: 'Guest name', required: true, autoComplete: 'name' },
    {
      key: 'email',
      label: 'Email address',
      required: true,
      type: 'email',
      autoComplete: 'email',
    },
    {
      key: 'designation',
      label: 'Designation',
      autoComplete: 'organization-title',
    },
    {
      key: 'organization',
      label: 'Organisation',
      autoComplete: 'organization',
    },
  ];

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: 'grid', gap: 12, marginTop: 14 }}
    >
      {fields.map((field) => (
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
            {field.required ? ' · required' : ' · optional'}
          </span>
          <input
            type={field.type || 'text'}
            required={field.required}
            autoComplete={field.autoComplete}
            value={form[field.key]}
            onChange={(event) => onChange(field.key, event.target.value)}
            style={inputStyle()}
          />
        </label>
      ))}
      <button type="submit" disabled={saving} style={buttonStyle(true)}>
        <Plus size={14} /> {saving ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}

export default function GuestInvitationsPanel({ canManage }) {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({
    invitations: [],
    meta: { page: 1, pageSize: 50, total: 0, totalPages: 1 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [savingEdit, setSavingEdit] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [clockNow, setClockNow] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: '50',
      status,
    });
    if (search) params.set('search', search);
    return params.toString();
  }, [page, search, status]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `/api/admin/guest-invitations?${queryString}`,
        { cache: 'no-store' }
      );
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Unable to load guest invitations.');
      }
      setResult({
        invitations: json.invitations || [],
        meta: json.meta || { page: 1, pageSize: 50, total: 0, totalPages: 1 },
      });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-change updates after an awaited request
    load();
  }, [load]);

  function updateForm(setter, key, value) {
    setter((current) => ({ ...current, [key]: value }));
  }

  async function openDetail(invitation) {
    setSelected(invitation);
    setDetail(null);
    setDetailLoading(true);
    setPreview(null);
    try {
      const response = await fetch(
        `/api/admin/guest-invitations/${invitation.id}`,
        {
          cache: 'no-store',
        }
      );
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Unable to load guest invitation.');
      }
      setDetail(json);
      setEditForm({
        name: json.invitation.name || '',
        email: json.invitation.email || '',
        designation: json.invitation.designation || '',
        organization: json.invitation.organization || '',
      });
    } catch (detailError) {
      setToast({ tone: 'danger', message: detailError.message });
      setSelected(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function createInvitation(event) {
    event.preventDefault();
    setCreating(true);
    try {
      const response = await fetch('/api/admin/guest-invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Unable to save guest invitation.');
      }
      setCreateForm(EMPTY_FORM);
      setCreateOpen(false);
      setToast({
        tone: 'success',
        message: 'Draft invitation created. Preview it before sending.',
      });
      await load();
      await openDetail(json.invitation);
    } catch (createError) {
      setToast({ tone: 'danger', message: createError.message });
    } finally {
      setCreating(false);
    }
  }

  async function saveInvitation(event) {
    event.preventDefault();
    if (!selected) return;
    setSavingEdit(true);
    try {
      const response = await fetch(
        `/api/admin/guest-invitations/${selected.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm),
        }
      );
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Unable to update guest invitation.');
      }
      setSelected(json.invitation);
      setDetail((current) =>
        current ? { ...current, invitation: json.invitation } : current
      );
      setToast({ tone: 'success', message: 'Guest details updated.' });
      await load();
    } catch (saveError) {
      setToast({ tone: 'danger', message: saveError.message });
    } finally {
      setSavingEdit(false);
    }
  }

  async function showPreview() {
    if (!selected) return;
    setPreviewLoading(true);
    try {
      const response = await fetch(
        `/api/admin/guest-invitations/${selected.id}/preview`,
        { cache: 'no-store' }
      );
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Unable to preview guest invitation.');
      }
      setPreview(json.email);
    } catch (previewError) {
      setToast({ tone: 'danger', message: previewError.message });
    } finally {
      setPreviewLoading(false);
    }
  }

  async function sendInvitation(invitation) {
    const isResend = invitation.status === 'sent';
    const confirmed = window.confirm(
      `${isResend ? 'Resend' : 'Send'} the fixed invitation to ${invitation.email}?\n\nThis does not create a registration, QR pass, or check-in credential.`
    );
    if (!confirmed) return;

    setSendingId(invitation.id);
    try {
      const response = await fetch(
        `/api/admin/guest-invitations/${invitation.id}/send`,
        { method: 'POST' }
      );
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Unable to send guest invitation.');
      }
      setToast({
        tone: 'success',
        message: `Invitation accepted for delivery to ${json.invitation.email}.`,
      });
      setSelected(json.invitation);
      setDetail((current) =>
        current ? { ...current, invitation: json.invitation } : current
      );
      await load();
      await openDetail(json.invitation);
    } catch (sendError) {
      setToast({ tone: 'danger', message: sendError.message });
      await load();
      await openDetail(invitation);
    } finally {
      setSendingId(null);
    }
  }

  async function retryInvitation(invitation) {
    if (
      !window.confirm(
        `Retry the same invitation attempt for ${invitation.email}? Resend will use the original attempt ID to prevent a duplicate.`
      )
    )
      return;
    setSendingId(invitation.id);
    try {
      const response = await fetch(
        `/api/admin/guest-invitations/${invitation.id}/retry`,
        { method: 'POST' }
      );
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(
          json.error || 'Unable to retry this invitation safely.'
        );
      }
      setToast({
        tone: 'success',
        message: 'The original invitation attempt was confirmed by Resend.',
      });
      await load();
      await openDetail(json.invitation);
    } catch (retryError) {
      setToast({ tone: 'danger', message: retryError.message });
      await load();
      await openDetail(invitation);
    } finally {
      setSendingId(null);
    }
  }

  const currentInvitation = detail?.invitation || selected;
  useEffect(() => {
    if (currentInvitation?.status !== 'sending') return undefined;
    const timer = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [currentInvitation?.id, currentInvitation?.status]);
  const retryReady = canRetryGuestSend(detail?.activeAttempt, clockNow);
  const firstRow = (result.meta.page - 1) * (result.meta.pageSize || 50) + 1;
  const lastRow = Math.min(
    result.meta.total || 0,
    firstRow + result.invitations.length - 1
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <section
        style={{
          border: '1px solid var(--adm-line)',
          borderRadius: 10,
          background: 'var(--adm-panel)',
          padding: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div className="adm-eyebrow">Invitation-only list</div>
            <h2
              style={{
                margin: '5px 0 0',
                color: 'var(--adm-ink)',
                fontSize: 22,
              }}
            >
              Guest Invitations
            </h2>
            <p
              style={{
                margin: '6px 0 0',
                maxWidth: 650,
                color: 'var(--adm-ink-3)',
                fontSize: 13,
                lineHeight: 1.55,
              }}
            >
              A separate, manual invitation list for special guests. It does not
              create a registration, QR pass, or check-in credential.
            </p>
          </div>
          {canManage ? (
            <button
              type="button"
              style={buttonStyle(true)}
              onClick={() => setCreateOpen((open) => !open)}
            >
              {createOpen ? <X size={14} /> : <Plus size={14} />}
              {createOpen ? 'Close form' : 'Add guest'}
            </button>
          ) : null}
        </div>

        {!canManage ? (
          <div style={{ marginTop: 16 }}>
            <AdminAlert
              tone="info"
              title="Read-only access"
              description="Reviewer accounts can view this list, but only an admin can add, edit, send, or resend a guest invitation."
            />
          </div>
        ) : null}

        {createOpen && canManage ? (
          <div
            style={{
              marginTop: 18,
              paddingTop: 18,
              borderTop: '1px solid var(--adm-line)',
            }}
          >
            <div
              style={{
                color: 'var(--adm-ink)',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Add a guest draft
            </div>
            <p
              style={{
                margin: '5px 0 0',
                color: 'var(--adm-ink-3)',
                fontSize: 12,
              }}
            >
              The email uses one fixed, approved template. Add the guest,
              preview it, then choose a deliberate single send.
            </p>
            <InvitationForm
              form={createForm}
              onChange={(key, value) => updateForm(setCreateForm, key, value)}
              onSubmit={createInvitation}
              saving={creating}
              submitLabel="Save draft"
            />
          </div>
        ) : null}
      </section>

      {error ? (
        <AdminAlert
          tone="danger"
          title="Could not load guest invitations"
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
          className="adm-guest-invitation-filters"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(220px, 1fr) 180px auto',
            gap: 10,
            padding: 18,
            borderBottom: '1px solid var(--adm-line)',
          }}
        >
          <label>
            <input
              aria-label="Search guest invitations"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name, email, organisation…"
              style={inputStyle()}
            />
          </label>
          <select
            aria-label="Filter guest invitations by status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            style={inputStyle()}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            style={buttonStyle()}
            onClick={() => {
              setSearchInput('');
              setSearch('');
              setStatus('all');
              setPage(1);
            }}
          >
            <X size={14} /> Clear
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{ width: '100%', borderCollapse: 'collapse', minWidth: 880 }}
          >
            <thead>
              <tr>
                {[
                  'Guest',
                  'Email',
                  'Organisation',
                  'Status',
                  'Last send',
                  '',
                ].map((heading) => (
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
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      <td
                        colSpan={6}
                        style={{
                          padding: 14,
                          borderBottom: '1px solid var(--adm-line)',
                        }}
                      >
                        <div
                          style={{
                            height: 15,
                            width: `${74 - index * 4}%`,
                            borderRadius: 10,
                            background: 'var(--adm-panel-2)',
                            animation:
                              'adm-skeleton-pulse 1.4s ease-in-out infinite',
                          }}
                        />
                      </td>
                    </tr>
                  ))
                : null}
              {!loading && !result.invitations.length ? (
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
                    <div>No guest invitations found.</div>
                  </td>
                </tr>
              ) : null}
              {!loading &&
                result.invitations.map((invitation) => (
                  <tr
                    key={invitation.id}
                    style={{ borderBottom: '1px solid var(--adm-line)' }}
                  >
                    <td
                      style={{
                        padding: '13px 16px',
                        color: 'var(--adm-ink)',
                        fontWeight: 500,
                      }}
                    >
                      {invitation.name}
                      {invitation.designation ? (
                        <div
                          style={{
                            marginTop: 3,
                            color: 'var(--adm-ink-3)',
                            fontSize: 12,
                            fontWeight: 400,
                          }}
                        >
                          {invitation.designation}
                        </div>
                      ) : null}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <a
                        href={`mailto:${invitation.email}`}
                        style={{
                          color: 'var(--adm-info)',
                          textDecoration: 'none',
                        }}
                      >
                        {invitation.email}
                      </a>
                    </td>
                    <td
                      style={{
                        padding: '13px 16px',
                        color: 'var(--adm-ink-2)',
                      }}
                    >
                      {invitation.organization || '—'}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <AdminStatusBadge tone={statusTone(invitation.status)}>
                        {invitation.status}
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
                      {invitation.lastSentAt
                        ? `${formatDate(invitation.lastSentAt)} · ${invitation.sendCount} sent`
                        : 'Not sent'}
                    </td>
                    <td style={{ padding: '9px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        style={buttonStyle()}
                        onClick={() => openDetail(invitation)}
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div
          style={{
            padding: '13px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            color: 'var(--adm-ink-3)',
            fontSize: 12,
          }}
        >
          <span>
            {result.meta.total
              ? `${firstRow}–${lastRow} of ${result.meta.total}`
              : '0 invitations'}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              style={buttonStyle()}
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              style={buttonStyle()}
              disabled={page >= result.meta.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <SlideOverDrawer
        open={Boolean(selected)}
        onClose={() => {
          setSelected(null);
          setDetail(null);
          setPreview(null);
        }}
        title="Guest invitation"
      >
        {detailLoading || !currentInvitation ? (
          <p style={{ color: 'var(--adm-ink-3)', fontSize: 13 }}>
            Loading invitation…
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div className="adm-eyebrow">Fixed template</div>
                  <h3
                    style={{
                      margin: '5px 0 0',
                      color: 'var(--adm-ink)',
                      fontSize: 18,
                    }}
                  >
                    {currentInvitation.name}
                  </h3>
                </div>
                <AdminStatusBadge tone={statusTone(currentInvitation.status)}>
                  {currentInvitation.status}
                </AdminStatusBadge>
              </div>
              <p
                style={{
                  margin: '8px 0 0',
                  color: 'var(--adm-ink-3)',
                  fontSize: 12,
                  lineHeight: 1.55,
                }}
              >
                This workflow never creates a public registration, entry pass,
                QR token, or check-in record.
              </p>
            </div>

            {canManage && currentInvitation.status !== 'sending' ? (
              <form
                className="adm-guest-detail-section"
                onSubmit={saveInvitation}
                style={{ display: 'grid', gap: 14 }}
              >
                <div
                  style={{
                    color: 'var(--adm-ink)',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Guest details
                </div>
                <div className="adm-guest-detail-fields">
                  {[
                    { key: 'name', label: 'Guest name', required: true },
                    {
                      key: 'email',
                      label: 'Email address',
                      required: true,
                      type: 'email',
                    },
                    { key: 'designation', label: 'Designation' },
                    { key: 'organization', label: 'Organisation' },
                  ].map((field) => (
                    <label
                      key={field.key}
                      className={
                        field.required
                          ? 'adm-guest-detail-field-wide'
                          : undefined
                      }
                      style={{ display: 'grid', gap: 6 }}
                    >
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
                        type={field.type || 'text'}
                        required={field.required}
                        value={editForm[field.key]}
                        onChange={(event) =>
                          updateForm(setEditForm, field.key, event.target.value)
                        }
                        style={inputStyle()}
                      />
                    </label>
                  ))}
                </div>
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
              className="adm-guest-history-section"
              style={{
                display: 'grid',
                gap: 9,
              }}
            >
              <div
                style={{
                  color: 'var(--adm-ink)',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Send history
              </div>
              <div style={{ color: 'var(--adm-ink-3)', fontSize: 12 }}>
                Accepted sends: {currentInvitation.sendCount} · Last accepted:{' '}
                {formatDate(currentInvitation.lastSentAt)}
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
                      Attempt ID: {delivery.id}
                    </div>
                    <div style={{ marginTop: 2 }}>
                      To: {delivery.recipientEmail}
                    </div>
                    {delivery.providerMessageId ? (
                      <div style={{ marginTop: 2 }}>
                        Provider ID: {delivery.providerMessageId}
                      </div>
                    ) : null}
                    {delivery.failureReason ? (
                      <div style={{ marginTop: 2, color: 'var(--adm-bad)' }}>
                        {delivery.failureReason}
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--adm-ink-3)', fontSize: 12 }}>
                  No delivery attempts yet.
                </div>
              )}
            </div>

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
                onClick={showPreview}
                disabled={previewLoading}
                style={buttonStyle()}
              >
                <Eye size={14} />{' '}
                {previewLoading ? 'Loading…' : 'Preview email'}
              </button>
              {canManage ? (
                <button
                  type="button"
                  disabled={
                    currentInvitation.status === 'sending' ||
                    sendingId === currentInvitation.id
                  }
                  onClick={() => sendInvitation(currentInvitation)}
                  style={buttonStyle(true)}
                >
                  <Send size={14} />
                  {sendingId === currentInvitation.id
                    ? 'Sending…'
                    : currentInvitation.status === 'sent'
                      ? 'Resend invitation'
                      : 'Send invitation'}
                </button>
              ) : null}
            </div>

            {currentInvitation.status === 'sending' ? (
              <AdminAlert
                tone="warning"
                title="Delivery needs confirmation"
                description={
                  detail?.activeAttempt
                    ? retryReady
                      ? 'The send has been pending for 10 minutes. Retry the same attempt below. Resend will use its original ID to avoid a duplicate.'
                      : 'This send is locked while its outcome is uncertain. A safe retry becomes available after 10 minutes and expires before Resend’s 24-hour protection window. If it is older, check Resend manually.'
                    : 'This is an older send without an attempt ID. Check its outcome in Resend before making any change.'
                }
              />
            ) : null}

            {canManage && retryReady ? (
              <button
                type="button"
                disabled={sendingId === currentInvitation.id}
                onClick={() => retryInvitation(currentInvitation)}
                style={buttonStyle()}
              >
                {sendingId === currentInvitation.id
                  ? 'Retrying…'
                  : 'Retry same invitation safely'}
              </button>
            ) : null}

            {currentInvitation.lastError ? (
              <AdminAlert
                tone="danger"
                title="Last delivery error"
                description={currentInvitation.lastError}
              />
            ) : null}

            {preview ? (
              <div
                style={{
                  display: 'grid',
                  gap: 8,
                  paddingTop: 18,
                  borderTop: '1px solid var(--adm-line)',
                }}
              >
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
                  title="Guest invitation email preview"
                  srcDoc={emailPreviewHtml(preview.html)}
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
          .adm-guest-invitation-filters {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
