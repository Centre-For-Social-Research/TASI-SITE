'use client';

import '@1771technologies/lytenyte-core/light-dark.css';
import Image from 'next/image';
import {
  useCallback,
  createContext,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Grid, useClientDataSource } from '@1771technologies/lytenyte-core';
import {
  Clock,
  Download,
  ExternalLink,
  Loader2,
  CheckCircle2,
  QrCode,
  RefreshCw,
  UserCheck,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { ATTENDEE_CATEGORIES } from '@/lib/registration-constants';
import dashboardUtils from '@/lib/admin-dashboard-utils.cjs';
import {
  AdminAlert,
  AdminSectionHeading,
  AdminStatCard,
  AdminStatusBadge,
  LoadingRows,
  SlideOverDrawer,
} from '@/components/admin/admin-ui';
import AdminPageIntro from '@/components/admin/admin-page-intro';
import {
  RegistrationTrendChart,
  StatusDonutChart,
  AdminProgressCard,
} from '@/components/admin/admin-charts';
import registrationCache from '@/lib/admin-registration-cache.cjs';

const {
  buildDashboardQueryString,
  getBatchStatusTone,
  getQuickActionOptions,
  isSupabaseAdminConfigError,
  prioritizeRegistrationQueue,
  summarizeSelection,
} = dashboardUtils;

const {
  DEFAULT_LIST_TTL_MS,
  DEFAULT_DETAIL_TTL_MS,
  createMemoryCache,
  applyRegistrationListCache,
  readRegistrationListCache,
  applyRegistrationDetailCache,
  readRegistrationDetailCache,
  invalidateRegistrationCaches,
} = registrationCache;

function formatDate(value) {
  if (!value) return 'Not yet';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getStatusTone(status) {
  if (status === 'confirmed') return 'success';
  if (status === 'pending' || status === 'waitlisted') return 'warning';
  if (status === 'rejected') return 'danger';
  return 'default';
}

function getDeliveryTone(status) {
  if (status === 'sent' || status === 'delivered') return 'success';
  if (status === 'failed' || status === 'bounced') return 'danger';
  if (status === 'queued' || status === 'processing') return 'warning';
  return 'default';
}

function getPriorityTone(priorityTier) {
  if (/purple/i.test(priorityTier || '')) return 'accent';
  if (/gold/i.test(priorityTier || '')) return 'warning';
  if (/blue/i.test(priorityTier || '')) return 'info';
  return 'default';
}

function statusHint(status) {
  if (status === 'confirmed')
    return 'Confirmation email is sent on save. QR pass stays available from row actions.';
  if (status === 'waitlisted')
    return 'Waitlisted registrants are held out of the QR queue until re-confirmed.';
  if (status === 'rejected')
    return 'Rejected registrants are blocked from entry and removed from QR delivery.';
  return 'Pending keeps the record open for operator review without sending a decision email.';
}

// ── LyteNyte Grid ─ shared context, cell renderers, and column definitions ───
const RegistrationGridCtx = createContext(null);

function SelectAllHeader() {
  const ctx = useContext(RegistrationGridCtx);
  if (!ctx) return null;
  return (
    <div className="flex h-full items-center justify-center">
      <input
        type="checkbox"
        checked={ctx.allVisibleSelected}
        onChange={ctx.toggleVisibleSelection}
        className="rounded border-zinc-300 dark:border-white/10"
      />
    </div>
  );
}

function CheckboxCell({ row }) {
  const ctx = useContext(RegistrationGridCtx);
  if (!row.data || !ctx) return null;
  const selected = ctx.selectedIds.includes(row.data.id);
  return (
    <div
      className="flex h-full items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={() => ctx.toggleSelection(row.data.id)}
        className="rounded border-zinc-300 dark:border-white/10"
      />
    </div>
  );
}

function RegistrantCell({ row }) {
  const ctx = useContext(RegistrationGridCtx);
  if (!row.data || !ctx) return null;
  const r = row.data;
  return (
    <div
      className="flex h-full cursor-pointer flex-col justify-center py-1"
      onClick={() => ctx.openDrawerFor(r.id)}
    >
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
        {r.first_name} {r.last_name}
      </p>
      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
        {r.registration_code}
      </p>
      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
        {r.organization || 'Independent'} …{' '}
        {r.attendee_category || 'Unspecified'}
      </p>
    </div>
  );
}

function EmailCell({ row }) {
  const ctx = useContext(RegistrationGridCtx);
  if (!row.data || !ctx) return null;
  return (
    <div
      className="flex h-full cursor-pointer items-center"
      onClick={() => ctx.openDrawerFor(row.data.id)}
    >
      <p className="text-xs text-zinc-700 dark:text-zinc-300">
        {row.data.email}
      </p>
    </div>
  );
}

function RegStatusCell({ row }) {
  const ctx = useContext(RegistrationGridCtx);
  if (!row.data || !ctx) return null;
  return (
    <div
      className="flex h-full cursor-pointer items-center"
      onClick={() => ctx.openDrawerFor(row.data.id)}
    >
      <AdminStatusBadge tone={getStatusTone(row.data.status)}>
        {row.data.status}
      </AdminStatusBadge>
    </div>
  );
}

function LocationCell({ row }) {
  const ctx = useContext(RegistrationGridCtx);
  if (!row.data || !ctx) return null;
  const loc =
    [row.data.city, row.data.country].filter(Boolean).join(', ') || '…';
  return (
    <div
      className="flex h-full cursor-pointer items-center"
      onClick={() => ctx.openDrawerFor(row.data.id)}
    >
      <p className="text-xs text-zinc-600 dark:text-zinc-400">{loc}</p>
    </div>
  );
}

function QRStatusCell({ row }) {
  const ctx = useContext(RegistrationGridCtx);
  if (!row.data || !ctx) return null;
  return (
    <div
      className="flex h-full cursor-pointer items-center"
      onClick={() => ctx.openDrawerFor(row.data.id)}
    >
      <AdminStatusBadge tone={row.data.qr_pass_issued_at ? 'info' : 'default'}>
        {row.data.qr_pass_issued_at ? 'Issued' : 'Pending'}
      </AdminStatusBadge>
    </div>
  );
}

function CheckInCell({ row }) {
  const ctx = useContext(RegistrationGridCtx);
  if (!row.data || !ctx) return null;
  return (
    <div
      className="flex h-full cursor-pointer items-center"
      onClick={() => ctx.openDrawerFor(row.data.id)}
    >
      <AdminStatusBadge tone={row.data.checked_in_at ? 'success' : 'default'}>
        {row.data.checked_in_at ? 'Checked In' : 'Pending'}
      </AdminStatusBadge>
    </div>
  );
}

function ActionsCell({ row }) {
  const ctx = useContext(RegistrationGridCtx);
  if (!row.data || !ctx) return null;
  return (
    <div
      className="flex h-full items-center"
      onClick={(e) => e.stopPropagation()}
    >
      <RowActions
        registration={row.data}
        onQuickAction={ctx.handleQuickAction}
        pendingActions={ctx.pendingActions}
        disabled={ctx.disabled}
      />
    </div>
  );
}

const REGISTRATION_COLUMNS = [
  {
    id: 'select',
    name: '',
    width: 52,
    cellRenderer: CheckboxCell,
    headerRenderer: SelectAllHeader,
  },
  {
    id: 'registrant',
    name: 'Registrant',
    width: 260,
    cellRenderer: RegistrantCell,
  },
  { id: 'email', name: 'Email', width: 220, cellRenderer: EmailCell },
  { id: 'status', name: 'Status', width: 130, cellRenderer: RegStatusCell },
  { id: 'location', name: 'Location', width: 160, cellRenderer: LocationCell },
  { id: 'qr', name: 'QR', width: 110, cellRenderer: QRStatusCell },
  { id: 'checkin', name: 'Check-In', width: 130, cellRenderer: CheckInCell },
  { id: 'actions', name: 'Actions', width: 320, cellRenderer: ActionsCell },
];
// ─────────────────────────────────────────────────────────────────────────────

function ReviewSummary({ summary }) {
  if (!summary) return null;
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard
        label="Pending Review"
        value={summary.pending}
        tone="warning"
        detail="Needs operator decision"
        icon={Clock}
      />
      <AdminStatCard
        label="Confirmed"
        value={summary.confirmed}
        tone="success"
        detail="Eligible for QR issuance"
        icon={CheckCircle2}
      />
      <AdminStatCard
        label="QR Issued"
        value={summary.qrIssued}
        tone="accent"
        detail="Already mailed or queued"
        icon={QrCode}
      />
      <AdminStatCard
        label="Checked In"
        value={summary.checkedIn}
        tone="info"
        detail="Validated on-site"
        icon={UserCheck}
      />
    </section>
  );
}

function QuickActionButton({
  action,
  onClick,
  disabled = false,
  loading = false,
}) {
  const toneClasses = {
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-950',
    warning:
      'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-950',
    danger:
      'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-950',
    info: 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300 dark:hover:bg-sky-950',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${toneClasses[action.kind] || toneClasses.info} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
      {action.label}
    </button>
  );
}

function RowActions({
  registration,
  onQuickAction,
  pendingActions,
  disabled = false,
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {getQuickActionOptions(registration).map((action) => {
        const isLoading = pendingActions?.has(
          `${registration.id}:${action.key}`
        );
        return (
          <QuickActionButton
            key={action.key}
            action={action}
            onClick={() => onQuickAction(registration, action.key)}
            disabled={disabled}
            loading={isLoading}
          />
        );
      })}
    </div>
  );
}

function RegistrantDrawer({
  detailState,
  detailDraft,
  setDetailDraft,
  saveDetailStatus,
  resendDetailEmail,
  savingDetail,
  onDelete,
  open,
  onClose,
}) {
  const activeRegistration = detailState.data?.registration;
  const [photoLoaded, setPhotoLoaded] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhotoLoaded(false);
  }, [activeRegistration?.id]);
  return (
    <SlideOverDrawer
      open={open}
      onClose={onClose}
      title={
        activeRegistration
          ? `${activeRegistration.first_name} ${activeRegistration.last_name}`
          : 'Registrant Detail'
      }
    >
      {detailState.loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Loading details…
          </p>
        </div>
      ) : !activeRegistration ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Select a registrant row to see their details here.
        </p>
      ) : (
        <div className="space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <AdminStatusBadge tone="default">
              {activeRegistration.registration_code}
            </AdminStatusBadge>
            <AdminStatusBadge tone={getStatusTone(activeRegistration.status)}>
              {activeRegistration.status}
            </AdminStatusBadge>
            {activeRegistration.qr_pass_issued_at ? (
              <AdminStatusBadge tone="info">QR issued</AdminStatusBadge>
            ) : null}
          </div>

          {/* Core info */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_132px] sm:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
                Contact
              </p>
              <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {activeRegistration.first_name} {activeRegistration.last_name}
              </p>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                {activeRegistration.organization || 'Independent attendee'}
              </p>
              <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                {activeRegistration.email}
              </p>
              {activeRegistration.linkedin_url ? (
                <a
                  href={activeRegistration.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-sky-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  View LinkedIn Profile
                </a>
              ) : null}
            </div>
            <div className="relative h-[132px] w-full overflow-hidden rounded-[10px] border border-zinc-200 bg-zinc-100 dark:border-white/[0.06] dark:bg-white/[0.06] sm:w-[132px]">
              {activeRegistration.profilePhotoUrl ? (
                <div className="relative h-full w-full">
                  {!photoLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                    </div>
                  )}
                  <Image
                    src={activeRegistration.profilePhotoUrl}
                    alt={`${activeRegistration.first_name} ${activeRegistration.last_name}`}
                    fill
                    className={`object-cover transition-opacity duration-300 ${photoLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setPhotoLoaded(true)}
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-center text-xs text-zinc-500 dark:text-zinc-400">
                  No photo
                </div>
              )}
            </div>
          </div>

          {/* Key dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[10px] border border-zinc-200 bg-zinc-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.04]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Category
              </p>
              <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
                {activeRegistration.attendee_category || 'Unspecified'}
              </p>
            </div>
            <div className="rounded-[10px] border border-zinc-200 bg-zinc-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.04]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Priority
              </p>
              <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
                {activeRegistration.priority_tier || 'Standard'}
              </p>
            </div>
            <div className="rounded-[10px] border border-zinc-200 bg-zinc-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.04]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                QR Issued
              </p>
              <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
                {formatDate(activeRegistration.qr_pass_issued_at)}
              </p>
            </div>
            <div className="rounded-[10px] border border-zinc-200 bg-zinc-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.04]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Checked In
              </p>
              <p className="mt-1 text-sm text-zinc-800 dark:text-zinc-200">
                {formatDate(activeRegistration.checked_in_at)}
              </p>
            </div>
          </div>

          {/* Status + notes */}
          <div className="rounded-[10px] border border-zinc-200 bg-white p-4 dark:border-white/[0.06] dark:bg-white/[0.04]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
                Status + Notes
              </p>
              <button
                type="button"
                onClick={resendDetailEmail}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-800 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/10 dark:hover:text-zinc-100"
              >
                Resend Update
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {statusHint(detailDraft.status)}
            </p>
            <div className="mt-3 space-y-3">
              <select
                value={detailDraft.status}
                onChange={(event) =>
                  setDetailDraft((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
                className="h-9 w-full rounded-[10px] border border-zinc-200 bg-white px-3 text-sm text-zinc-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={detailDraft.speakerFlag}
                    onChange={(event) =>
                      setDetailDraft((current) => ({
                        ...current,
                        speakerFlag: event.target.checked,
                      }))
                    }
                  />
                  Speaker
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={detailDraft.vipFlag}
                    onChange={(event) =>
                      setDetailDraft((current) => ({
                        ...current,
                        vipFlag: event.target.checked,
                      }))
                    }
                  />
                  VIP
                </label>
              </div>
              <textarea
                id="reviewNotes"
                name="reviewNotes"
                value={detailDraft.reviewNotes}
                onChange={(event) =>
                  setDetailDraft((current) => ({
                    ...current,
                    reviewNotes: event.target.value,
                  }))
                }
                className="min-h-24 w-full resize-none rounded-[10px] border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100"
                placeholder="Operator notes for context, exceptions, or follow-up"
              />
              <button
                type="button"
                onClick={saveDetailStatus}
                disabled={savingDetail}
                className="flex h-9 items-center gap-2 rounded-full bg-amber-600 px-4 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
              >
                {savingDetail ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                {savingDetail ? 'Saving…' : 'Save Notes + Status'}
              </button>{' '}
              {onDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex h-9 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Registration
                </button>
              ) : null}{' '}
            </div>
          </div>

          {/* Status history */}
          {(detailState.data?.history || []).length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
                Status History
              </p>
              <div className="mt-2 space-y-2">
                {detailState.data.history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[10px] border border-zinc-200 bg-zinc-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.04]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                        {item.action_type}
                      </p>
                      <AdminStatusBadge tone={getStatusTone(item.next_status)}>
                        {item.next_status || 'update'}
                      </AdminStatusBadge>
                    </div>
                    <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {item.notes || 'No notes captured.'}
                    </p>
                    <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email timeline */}
          {(detailState.data?.notifications || []).length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
                Email Timeline
              </p>
              <div className="mt-2 space-y-2">
                {detailState.data.notifications.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[10px] border border-zinc-200 bg-zinc-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.04]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                        {item.template_type}
                      </p>
                      <AdminStatusBadge
                        tone={getDeliveryTone(item.delivery_status)}
                      >
                        {item.delivery_status || 'pending'}
                      </AdminStatusBadge>
                    </div>
                    <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {item.failure_reason ||
                        item.recipient_email ||
                        'Awaiting delivery update.'}
                    </p>
                    <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                      {formatDate(item.updated_at || item.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </SlideOverDrawer>
  );
}

export default function RegistrationsAdminPanel({ operator }) {
  const listCacheRef = useRef(
    createMemoryCache({ ttlMs: DEFAULT_LIST_TTL_MS })
  );
  const detailCacheRef = useRef(
    createMemoryCache({ ttlMs: DEFAULT_DETAIL_TTL_MS })
  );
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    category: 'all',
    city: '',
    country: '',
    organization: '',
    page: 1,
    pageSize: 50,
  });
  const [state, setState] = useState({
    loading: true,
    registrations: [],
    summary: null,
    pagination: null,
    count: 0,
    error: '',
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeRegistrationId, setActiveRegistrationId] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailState, setDetailState] = useState({
    loading: false,
    data: null,
    error: '',
  });
  const [detailDraft, setDetailDraft] = useState({
    status: 'pending',
    speakerFlag: false,
    vipFlag: false,
    reviewNotes: '',
  });
  const [savingDetail, setSavingDetail] = useState(false);
  const [exportLoading, setExportLoading] = useState({
    csv: false,
    xlsx: false,
    pdf: false,
  });
  const [pendingActions, setPendingActions] = useState(new Set());
  const [pendingBulk, setPendingBulk] = useState({
    confirm: false,
    waitlist: false,
    reject: false,
    sendQr: false,
  });
  const [qrLoading, setQrLoading] = useState({ send: false, resend: false });
  const deferredSearch = useDeferredValue(filters.search);
  const queryString = useMemo(
    () => buildDashboardQueryString({ ...filters, search: deferredSearch }),
    [deferredSearch, filters]
  );
  const hasConfigError = isSupabaseAdminConfigError(state.error);
  const selectionSummary = summarizeSelection({
    selectedCount: selectedIds.length,
    matchedCount: state.count,
  });
  const orderedRegistrations = useMemo(
    () => prioritizeRegistrationQueue(state.registrations || []),
    [state.registrations]
  );
  const ds = useClientDataSource({ data: orderedRegistrations });

  const showToast = (message, tone = 'default') => {
    if (tone === 'success') toast.success(message);
    else if (tone === 'danger') toast.error(message);
    else if (tone === 'warning') toast.warning(message);
    else toast(message);
  };
  const clearToast = () => {};
  const invalidateAdminCaches = (registrationIds = []) => {
    invalidateRegistrationCaches({
      listCache: listCacheRef.current,
      detailCache: detailCacheRef.current,
      registrationIds,
    });
  };

  const loadRegistrations = useCallback(
    async ({ background = false, force = false } = {}) => {
      const cached = force
        ? null
        : readRegistrationListCache(listCacheRef.current, queryString);
      if (cached) {
        setState(cached);
        return;
      }

      if (!background)
        setState((current) => ({ ...current, loading: true, error: '' }));
      try {
        const response = await fetch(
          `/api/admin/registrations?${queryString}`,
          {
            cache: 'no-store',
          }
        );
        const data = await response.json();
        if (!response.ok)
          return setState({
            loading: false,
            registrations: [],
            summary: null,
            pagination: null,
            count: 0,
            error: data.error || 'Unable to load registrations.',
          });
        const nextState = {
          loading: false,
          registrations: data.registrations || [],
          summary: data.summary,
          pagination: data.pagination,
          count: data.count || 0,
          error: '',
        };
        applyRegistrationListCache(
          listCacheRef.current,
          queryString,
          nextState
        );
        setState(nextState);
        setSelectedIds((current) =>
          current.filter((id) =>
            (data.registrations || []).some(
              (registration) => registration.id === id
            )
          )
        );
      } catch {
        setState({
          loading: false,
          registrations: [],
          summary: null,
          pagination: null,
          count: 0,
          error: 'Network error.',
        });
      }
    },
    [queryString]
  );

  const loadDetail = useCallback(
    async (registrationId, { force = false } = {}) => {
      if (!registrationId) return;
      const cached = force
        ? null
        : readRegistrationDetailCache(detailCacheRef.current, registrationId);
      if (cached) {
        setDetailState({ loading: false, data: cached, error: '' });
        setDetailDraft({
          status: cached.registration.status,
          speakerFlag: Boolean(cached.registration.speaker_flag),
          vipFlag: Boolean(cached.registration.vip_flag),
          reviewNotes: cached.registration.review_notes || '',
        });
        return;
      }

      setDetailState((current) => ({ ...current, loading: true, error: '' }));
      try {
        const response = await fetch(
          `/api/admin/registrations/${registrationId}`,
          { cache: 'no-store' }
        );
        const data = await response.json();
        if (!response.ok)
          return setDetailState({
            loading: false,
            data: null,
            error: data.error || 'Unable to load registration detail.',
          });
        applyRegistrationDetailCache(
          detailCacheRef.current,
          registrationId,
          data
        );
        setDetailState({ loading: false, data, error: '' });
        setDetailDraft({
          status: data.registration.status,
          speakerFlag: Boolean(data.registration.speaker_flag),
          vipFlag: Boolean(data.registration.vip_flag),
          reviewNotes: data.registration.review_notes || '',
        });
      } catch {
        setDetailState({
          loading: false,
          data: null,
          error: 'Network error while loading registration detail.',
        });
      }
    },
    []
  );

  useEffect(() => {
    void loadRegistrations();
  }, [loadRegistrations]);
  useEffect(() => {
    if (activeRegistrationId) void loadDetail(activeRegistrationId);
  }, [activeRegistrationId, loadDetail]);

  const setFilterValue = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  const toggleSelection = (registrationId) =>
    setSelectedIds((current) =>
      current.includes(registrationId)
        ? current.filter((id) => id !== registrationId)
        : [...current, registrationId]
    );
  const toggleVisibleSelection = () => {
    const visibleIds = orderedRegistrations.map(
      (registration) => registration.id
    );
    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((current) =>
      allSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])]
    );
  };

  const openDrawerFor = (registrationId) => {
    if (registrationId === activeRegistrationId) {
      void loadDetail(registrationId);
    }
    setActiveRegistrationId(registrationId);
    setDrawerOpen(true);
  };

  const handleExport = async (format) => {
    setExportLoading((prev) => ({ ...prev, [format]: true }));
    clearToast();
    try {
      const response = await fetch(
        `/api/admin/badges/export?format=${format}`,
        { cache: 'no-store' }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        showToast(
          errorData.error ||
            `Export failed (${response.status}). Check your Supabase configuration.`,
          'danger'
        );
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasi-2026-registrations.${format === 'xlsx' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(
        `${format.toUpperCase()} export downloaded successfully.`,
        'success'
      );
    } catch {
      showToast('Network error during export. Please try again.', 'danger');
    } finally {
      setExportLoading((prev) => ({ ...prev, [format]: false }));
    }
  };

  const updateRegistrationStatus = async ({
    registrationId,
    status,
    speakerFlag,
    vipFlag,
    reviewNotes = '',
    expectedUpdatedAt = '',
  }) => {
    const response = await fetch('/api/admin/registrations/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationId,
        status,
        speakerFlag,
        vipFlag,
        reviewNotes,
        expectedUpdatedAt,
      }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || 'Unable to update registration.');
    return data;
  };

  const queueQrJob = async ({
    resendExisting = false,
    registrationIds = [],
  } = {}) => {
    clearToast();
    try {
      const response = await fetch('/api/admin/passes/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters, registrationIds, resendExisting }),
      });
      const data = await response.json();
      if (!response.ok)
        return showToast(
          data.error || 'Unable to queue QR email job.',
          'danger'
        );
      showToast(data.message || 'QR email job queued.', 'success');
      invalidateAdminCaches(registrationIds);
      void loadRegistrations({ background: true, force: true });
      if (activeRegistrationId) {
        void loadDetail(activeRegistrationId, { force: true });
      }
    } catch {
      showToast('Network error while queueing QR email job.', 'danger');
    }
  };

  const bulkUpdateStatus = async (nextStatus) => {
    if (!selectedIds.length)
      return showToast(
        'Select at least one registrant before running a bulk status update.',
        'warning'
      );
    const bulkKey =
      nextStatus === 'confirmed'
        ? 'confirm'
        : nextStatus === 'waitlisted'
          ? 'waitlist'
          : 'reject';
    setPendingBulk((p) => ({ ...p, [bulkKey]: true }));
    try {
      const response = await fetch('/api/admin/registrations/status/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          updates: selectedIds.map((registrationId) => {
            const registration = state.registrations.find(
              (item) => item.id === registrationId
            );
            return {
              registrationId,
              expectedUpdatedAt: registration?.updated_at || '',
            };
          }),
        }),
      });
      const data = await response.json();
      if (!response.ok && response.status !== 207)
        throw new Error(data.error || 'Unable to update registrations.');
      const updatedCount = data.updatedIds?.length || 0;
      const conflictCount = data.conflictIds?.length || 0;
      showToast(
        conflictCount
          ? `Updated ${updatedCount}; ${conflictCount} changed elsewhere and need refresh.`
          : `Updated ${updatedCount} registrants to ${nextStatus}.`,
        conflictCount ? 'warning' : 'success'
      );
      invalidateAdminCaches(selectedIds);
      void loadRegistrations({ background: true, force: true });
      if (activeRegistrationId) {
        void loadDetail(activeRegistrationId, { force: true });
      }
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Network error during bulk status update.',
        'danger'
      );
    } finally {
      setPendingBulk((p) => ({ ...p, [bulkKey]: false }));
    }
  };

  const handleSendQr = async () => {
    setQrLoading((p) => ({ ...p, send: true }));
    await queueQrJob({ registrationIds: selectedIds });
    setQrLoading((p) => ({ ...p, send: false }));
  };

  const handleResendQr = async () => {
    setQrLoading((p) => ({ ...p, resend: true }));
    await queueQrJob({ registrationIds: selectedIds, resendExisting: true });
    setQrLoading((p) => ({ ...p, resend: false }));
  };

  const bulkSendQrQueue = async () => {
    setPendingBulk((p) => ({ ...p, sendQr: true }));
    await queueQrJob({ registrationIds: selectedIds });
    setPendingBulk((p) => ({ ...p, sendQr: false }));
  };

  const handleQuickAction = async (registration, actionKey) => {
    const pendingKey = `${registration.id}:${actionKey}`;
    setPendingActions((current) => new Set([...current, pendingKey]));
    try {
      if (actionKey === 'sendQr') {
        if (registration.status !== 'confirmed')
          await updateRegistrationStatus({
            registrationId: registration.id,
            status: 'confirmed',
            expectedUpdatedAt: registration.updated_at || '',
          });
        await queueQrJob({ registrationIds: [registration.id] });
        return;
      }
      if (actionKey === 'resendQr')
        return void (await queueQrJob({
          registrationIds: [registration.id],
          resendExisting: true,
        }));
      if (actionKey === 'confirm')
        await updateRegistrationStatus({
          registrationId: registration.id,
          status: 'confirmed',
          expectedUpdatedAt: registration.updated_at || '',
        });
      if (actionKey === 'waitlist')
        await updateRegistrationStatus({
          registrationId: registration.id,
          status: 'waitlisted',
          expectedUpdatedAt: registration.updated_at || '',
        });
      if (actionKey === 'reject')
        await updateRegistrationStatus({
          registrationId: registration.id,
          status: 'rejected',
          expectedUpdatedAt: registration.updated_at || '',
        });
      showToast(
        `${actionKey} completed for ${registration.first_name} ${registration.last_name}.`,
        'success'
      );
      invalidateAdminCaches([registration.id]);
      void loadRegistrations({ background: true, force: true });
      if (activeRegistrationId === registration.id)
        void loadDetail(registration.id, { force: true });
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Unable to complete the quick action.',
        'danger'
      );
    } finally {
      setPendingActions((current) => {
        const next = new Set(current);
        next.delete(pendingKey);
        return next;
      });
    }
  };

  const saveDetailStatus = async () => {
    const registrationId = detailState.data?.registration?.id;
    if (!registrationId) return;
    setSavingDetail(true);
    try {
      const data = await updateRegistrationStatus({
        registrationId,
        status: detailDraft.status,
        speakerFlag: detailDraft.speakerFlag,
        vipFlag: detailDraft.vipFlag,
        reviewNotes: detailDraft.reviewNotes,
        expectedUpdatedAt: detailState.data?.registration?.updated_at || '',
      });
      showToast(
        data.emailResult?.queued
          ? 'Notes saved; email queued for delivery.'
          : 'Notes saved.',
        'success'
      );
      invalidateAdminCaches([registrationId]);
      void loadRegistrations({ background: true, force: true });
      void loadDetail(registrationId, { force: true });
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Unable to save registration review.',
        'danger'
      );
    } finally {
      setSavingDetail(false);
    }
  };

  const resendDetailEmail = async () => {
    const registrationId = detailState.data?.registration?.id;
    if (!registrationId) return;
    try {
      const templateType = detailState.data.registration.qr_pass_issued_at
        ? 'qr_pass_issued'
        : detailDraft.status;
      const response = await fetch('/api/admin/registrations/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, templateType }),
      });
      const data = await response.json();
      if (!response.ok)
        return showToast(
          data.error || 'Unable to resend attendee email.',
          'danger'
        );
      showToast(
        data.result?.queued
          ? 'QR resend queued in the background.'
          : data.result?.sent
            ? 'Attendee email resent.'
            : 'Attendee email action completed.',
        'success'
      );
      invalidateAdminCaches([registrationId]);
      void loadDetail(registrationId, { force: true });
    } catch {
      showToast('Network error while resending attendee email.', 'danger');
    }
  };

  const handleDelete = async () => {
    const registrationId = detailState.data?.registration?.id;
    if (!registrationId) return;
    if (!window.confirm('Delete this registration? This cannot be undone.'))
      return;
    try {
      const response = await fetch(
        `/api/admin/registrations/${registrationId}`,
        { method: 'DELETE' }
      );
      const data = await response.json();
      if (!response.ok)
        return showToast(
          data.error || 'Unable to delete registration.',
          'danger'
        );
      setDrawerOpen(false);
      setActiveRegistrationId('');
      showToast('Registration deleted.', 'success');
      invalidateAdminCaches([registrationId]);
      void loadRegistrations({ force: true });
    } catch {
      showToast('Network error while deleting registration.', 'danger');
    }
  };

  const allVisibleSelected =
    orderedRegistrations.length > 0 &&
    orderedRegistrations.every((r) => selectedIds.includes(r.id));

  const gridCtxValue = {
    selectedIds,
    toggleSelection,
    toggleVisibleSelection,
    allVisibleSelected,
    openDrawerFor,
    handleQuickAction,
    pendingActions,
    disabled: state.loading || hasConfigError,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <AdminPageIntro
        eyebrow="Registrations"
        title="Review Queue"
        description="Sort the most urgent records to the top, act inline for speed, and open richer registrant detail from the review drawer."
        chips={['Review decisions', 'Bulk status updates', 'QR pass delivery']}
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={state.loading || hasConfigError}
              onClick={() => {
                invalidateAdminCaches();
                void loadRegistrations({ force: true });
                if (activeRegistrationId) {
                  detailCacheRef.current.delete(activeRegistrationId);
                  void loadDetail(activeRegistrationId, { force: true });
                }
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:border-white/10 dark:hover:bg-white/10"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
            {['csv', 'xlsx', 'pdf'].map((format) => (
              <button
                key={format}
                type="button"
                disabled={exportLoading[format] || hasConfigError}
                onClick={() => handleExport(format)}
                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:border-white/10 dark:hover:bg-white/10"
              >
                {exportLoading[format] ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Download className="h-3 w-3" />
                )}
                {format === 'csv'
                  ? 'Export CSV'
                  : format === 'xlsx'
                    ? 'Export Excel'
                    : 'Export PDF'}
              </button>
            ))}
          </div>
        }
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSendQr}
          disabled={state.loading || hasConfigError || qrLoading.send}
          className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-amber-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-50"
        >
          {qrLoading.send ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : null}
          {selectedIds.length ? 'Send QR To Selected' : 'Send QR To Filtered'}
        </button>
        <button
          type="button"
          onClick={handleResendQr}
          disabled={state.loading || hasConfigError || qrLoading.resend}
          className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-zinc-200 bg-white px-4 text-sm text-zinc-700 shadow-sm transition hover:border-zinc-300 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:border-white/10"
        >
          {qrLoading.resend ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : null}
          Resend Issued QR
        </button>
        <a
          href="/admin/delivery"
          className="inline-flex h-9 items-center rounded-[10px] border border-zinc-200 bg-white px-4 text-sm text-zinc-700 shadow-sm transition hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:border-white/10"
        >
          Delivery Jobs
        </a>
        <a
          href="/admin/check-in"
          className="inline-flex h-9 items-center rounded-[10px] border border-zinc-200 bg-white px-4 text-sm text-zinc-700 shadow-sm transition hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:border-white/10"
        >
          Check-In Console
        </a>
      </div>

      {hasConfigError ? (
        <AdminAlert
          title="Supabase Configuration Required"
          description="This dashboard cannot load registrants or issue QR passes until SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured."
          tone="danger"
        />
      ) : null}

      {/* Summary stats */}
      <ReviewSummary summary={state.summary} />

      {/* Registration trend chart + donut */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <RegistrationTrendChart summary={state.summary} />
        <StatusDonutChart summary={state.summary} />
      </section>

      {/* Progress cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminProgressCard
          label="Confirmation Rate"
          value={state.summary?.confirmed || 0}
          percent={
            state.summary &&
            (state.summary.confirmed || 0) + (state.summary.pending || 0) > 0
              ? Math.round(
                  ((state.summary.confirmed || 0) /
                    ((state.summary.confirmed || 0) +
                      (state.summary.pending || 0))) *
                    100
                )
              : 0
          }
          color="cyan"
        />
        <AdminProgressCard
          label="QR Coverage"
          value={state.summary?.qrIssued || 0}
          percent={
            (state.summary?.confirmed || 0) > 0
              ? Math.round(
                  ((state.summary.qrIssued || 0) / state.summary.confirmed) *
                    100
                )
              : 0
          }
          color="emerald"
        />
        <AdminProgressCard
          label="Check-in Progress"
          value={state.summary?.checkedIn || 0}
          percent={
            (state.summary?.qrIssued || 0) > 0
              ? Math.round(
                  ((state.summary.checkedIn || 0) / state.summary.qrIssued) *
                    100
                )
              : 0
          }
          color="amber"
        />
        <AdminProgressCard
          label="Pending Decisions"
          value={state.summary?.pending || 0}
          percent={
            state.summary &&
            (state.summary.confirmed || 0) + (state.summary.pending || 0) > 0
              ? Math.round(
                  ((state.summary.pending || 0) /
                    ((state.summary.confirmed || 0) +
                      (state.summary.pending || 0))) *
                    100
                )
              : 0
          }
          color="rose"
        />
      </section>

      {/* Filters */}
      <section className="rounded-[10px] border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Filters
          </p>
          <div className="flex gap-3 text-xs text-zinc-400 dark:text-zinc-500">
            <span>{selectionSummary.selectedLabel}</span>
            <span>{selectionSummary.matchedLabel}</span>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <input
            value={filters.search}
            onChange={(event) => setFilterValue('search', event.target.value)}
            className="h-9 rounded-[10px] border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 xl:col-span-2 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100"
            placeholder="Search name, email, code, org…"
          />
          <select
            value={filters.status}
            onChange={(event) => setFilterValue('status', event.target.value)}
            className="h-9 rounded-[10px] border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filters.category}
            onChange={(event) => setFilterValue('category', event.target.value)}
            className="h-9 rounded-[10px] border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100"
          >
            <option value="all">All categories</option>
            {ATTENDEE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            value={filters.city}
            onChange={(event) => setFilterValue('city', event.target.value)}
            className="h-9 rounded-[10px] border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100"
            placeholder="Filter by city"
          />
          <button
            type="button"
            onClick={toggleVisibleSelection}
            className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 transition hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:border-white/10"
          >
            {allVisibleSelected ? 'Clear Visible' : 'Select Visible'}
          </button>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input
            value={filters.country}
            onChange={(event) => setFilterValue('country', event.target.value)}
            className="h-9 rounded-[10px] border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100"
            placeholder="Filter by country"
          />
          <input
            value={filters.organization}
            onChange={(event) =>
              setFilterValue('organization', event.target.value)
            }
            className="h-9 rounded-[10px] border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100"
            placeholder="Filter by organization"
          />
        </div>
      </section>

      {/* Error state */}
      {state.error && !hasConfigError ? (
        <AdminAlert
          title="Dashboard Error"
          description={state.error}
          tone="danger"
        />
      ) : null}

      {/* Review queue table */}
      <section className="overflow-hidden rounded-[10px] border border-zinc-200 bg-white shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
        <div className="border-b border-zinc-200 px-5 py-3 dark:border-white/[0.06]">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Review Queue
            {!state.loading && state.count > 0 ? (
              <span className="ml-2 text-xs font-normal text-zinc-400 dark:text-zinc-500">
                {state.count} registrants
              </span>
            ) : null}
          </p>
        </div>
        <RegistrationGridCtx.Provider value={gridCtxValue}>
          {state.loading ? (
            <div className="overflow-auto">
              <table className="min-w-full">
                <tbody>
                  <LoadingRows count={8} cols={8} />
                </tbody>
              </table>
            </div>
          ) : (
            <div
              className="admin-grid-navy ln-grid"
              style={{ height: '560px' }}
            >
              <Grid
                columns={REGISTRATION_COLUMNS}
                rowSource={ds}
                rowHeight={72}
              />
            </div>
          )}
        </RegistrationGridCtx.Provider>
        {!state.loading && !state.error && orderedRegistrations.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
            No registrations match the current filters.
          </div>
        ) : null}
        {state.pagination ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-5 py-3 dark:border-white/[0.06]">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Page {state.pagination.page} of {state.pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: Math.max(current.page - 1, 1),
                  }))
                }
                disabled={state.pagination.page <= 1}
                className="h-8 rounded-full border border-zinc-200 bg-white px-3 text-xs text-zinc-700 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    page: Math.min(
                      current.page + 1,
                      state.pagination.totalPages
                    ),
                  }))
                }
                disabled={state.pagination.page >= state.pagination.totalPages}
                className="h-8 rounded-full border border-zinc-200 bg-white px-3 text-xs text-zinc-700 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-200"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* Registrant detail drawer */}
      <RegistrantDrawer
        detailState={detailState}
        detailDraft={detailDraft}
        setDetailDraft={setDetailDraft}
        saveDetailStatus={saveDetailStatus}
        resendDetailEmail={resendDetailEmail}
        savingDetail={savingDetail}
        onDelete={handleDelete}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Sticky bulk actions bar */}
      {selectedIds.length > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur shadow-lg dark:border-white/[0.06] dark:bg-white/[0.03]/95">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              {selectedIds.length} selected
            </span>
            <div className="flex flex-wrap gap-2">
              <QuickActionButton
                action={{
                  key: 'confirm',
                  label: 'Mark Confirmed',
                  kind: 'success',
                }}
                onClick={() => bulkUpdateStatus('confirmed')}
                loading={pendingBulk.confirm}
              />
              <QuickActionButton
                action={{
                  key: 'waitlist',
                  label: 'Mark Waitlisted',
                  kind: 'warning',
                }}
                onClick={() => bulkUpdateStatus('waitlisted')}
                loading={pendingBulk.waitlist}
              />
              <QuickActionButton
                action={{
                  key: 'reject',
                  label: 'Mark Rejected',
                  kind: 'danger',
                }}
                onClick={() => bulkUpdateStatus('rejected')}
                loading={pendingBulk.reject}
              />
              <QuickActionButton
                action={{ key: 'sendQr', label: 'Send QR', kind: 'info' }}
                onClick={bulkSendQrQueue}
                disabled={state.loading || hasConfigError}
                loading={pendingBulk.sendQr}
              />
            </div>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="ml-auto text-xs text-zinc-400 transition hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              Clear selection
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
