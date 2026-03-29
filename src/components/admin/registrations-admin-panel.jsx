"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { ATTENDEE_CATEGORIES, PRIORITY_TIERS } from "@/lib/registration-constants";
import dashboardUtils from "@/lib/admin-dashboard-utils.cjs";
import {
  AdminAlert,
  AdminSectionHeading,
  AdminStatCard,
  AdminStatusBadge,
  AdminToast,
  LoadingRows,
  SlideOverDrawer,
} from "@/components/admin/admin-ui";

const { buildDashboardQueryString, getBatchStatusTone, getQuickActionOptions, isSupabaseAdminConfigError, prioritizeRegistrationQueue, summarizeSelection } = dashboardUtils;

function formatDate(value) {
  if (!value) return "Not yet";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function getStatusTone(status) {
  if (status === "confirmed") return "success";
  if (status === "pending" || status === "waitlisted") return "warning";
  if (status === "rejected") return "danger";
  return "default";
}

function getDeliveryTone(status) {
  if (status === "sent" || status === "delivered") return "success";
  if (status === "failed" || status === "bounced") return "danger";
  if (status === "queued" || status === "processing") return "warning";
  return "default";
}

function getPriorityTone(priorityTier) {
  if (/purple/i.test(priorityTier || "")) return "accent";
  if (/gold/i.test(priorityTier || "")) return "warning";
  if (/blue/i.test(priorityTier || "")) return "info";
  return "default";
}

function statusHint(status) {
  if (status === "confirmed") return "Confirmation email is sent on save. QR pass stays available from row actions.";
  if (status === "waitlisted") return "Waitlisted registrants are held out of the QR queue until re-confirmed.";
  if (status === "rejected") return "Rejected registrants are blocked from entry and removed from QR delivery.";
  return "Pending keeps the record open for operator review without sending a decision email.";
}

function ReviewSummary({ summary }) {
  if (!summary) return null;
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard label="Pending Review" value={summary.pending} tone="warning" detail="Needs operator decision" />
      <AdminStatCard label="Confirmed" value={summary.confirmed} tone="success" detail="Eligible for QR issuance" />
      <AdminStatCard label="QR Issued" value={summary.qrIssued} tone="accent" detail="Already mailed or queued" />
      <AdminStatCard label="Checked In" value={summary.checkedIn} tone="info" detail="Validated on-site" />
    </section>
  );
}

function QuickActionButton({ action, onClick, disabled = false }) {
  const toneClasses = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
    warning: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
    danger: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
    info: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${toneClasses[action.kind] || toneClasses.info} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {action.label}
    </button>
  );
}

function RowActions({ registration, onQuickAction, disabled = false }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {getQuickActionOptions(registration).map((action) => (
        <QuickActionButton key={action.key} action={action} onClick={() => onQuickAction(registration, action.key)} disabled={disabled} />
      ))}
    </div>
  );
}

function RegistrantDrawer({ detailState, detailDraft, setDetailDraft, saveDetailStatus, resendDetailEmail, savingDetail, open, onClose }) {
  const activeRegistration = detailState.data?.registration;
  return (
    <SlideOverDrawer
      open={open}
      onClose={onClose}
      title={activeRegistration ? `${activeRegistration.first_name} ${activeRegistration.last_name}` : "Registrant Detail"}
    >
      {!activeRegistration ? (
        <p className="text-sm text-slate-500">Select a registrant row to see their details here.</p>
      ) : (
        <div className="space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <AdminStatusBadge tone="default">{activeRegistration.registration_code}</AdminStatusBadge>
            <AdminStatusBadge tone={getStatusTone(activeRegistration.status)}>{activeRegistration.status}</AdminStatusBadge>
            {activeRegistration.qr_pass_issued_at ? <AdminStatusBadge tone="info">QR issued</AdminStatusBadge> : null}
          </div>

          {/* Core info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Contact</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{activeRegistration.first_name} {activeRegistration.last_name}</p>
            <p className="mt-0.5 text-sm text-slate-500">{activeRegistration.organization || "Independent attendee"}</p>
            <p className="mt-0.5 text-xs text-slate-400">{activeRegistration.email}</p>
          </div>

          {/* Key dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Category</p>
              <p className="mt-1 text-sm text-slate-800">{activeRegistration.attendee_category || "Unspecified"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Priority</p>
              <p className="mt-1 text-sm text-slate-800">{activeRegistration.priority_tier || "Standard"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">QR Issued</p>
              <p className="mt-1 text-sm text-slate-800">{formatDate(activeRegistration.qr_pass_issued_at)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Checked In</p>
              <p className="mt-1 text-sm text-slate-800">{formatDate(activeRegistration.checked_in_at)}</p>
            </div>
          </div>

          {/* Status + notes */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Status + Notes</p>
              <button
                type="button"
                onClick={resendDetailEmail}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
              >
                Resend Update
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">{statusHint(detailDraft.status)}</p>
            <div className="mt-3 space-y-3">
              <select
                value={detailDraft.status}
                onChange={(event) => setDetailDraft((current) => ({ ...current, status: event.target.value }))}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  <input type="checkbox" checked={detailDraft.speakerFlag} onChange={(event) => setDetailDraft((current) => ({ ...current, speakerFlag: event.target.checked }))} />
                  Speaker
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  <input type="checkbox" checked={detailDraft.vipFlag} onChange={(event) => setDetailDraft((current) => ({ ...current, vipFlag: event.target.checked }))} />
                  VIP
                </label>
              </div>
              <textarea
                value={detailDraft.reviewNotes}
                onChange={(event) => setDetailDraft((current) => ({ ...current, reviewNotes: event.target.value }))}
                className="min-h-24 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                placeholder="Operator notes for context, exceptions, or follow-up"
              />
              <button
                type="button"
                onClick={saveDetailStatus}
                disabled={savingDetail}
                className="flex h-9 items-center gap-2 rounded-full bg-amber-600 px-4 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
              >
                {savingDetail ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {savingDetail ? "Savingâ€¦" : "Save Notes + Status"}
              </button>
            </div>
          </div>

          {/* Status history */}
          {(detailState.data?.history || []).length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Status History</p>
              <div className="mt-2 space-y-2">
                {detailState.data.history.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-slate-700">{item.action_type}</p>
                      <AdminStatusBadge tone={getStatusTone(item.next_status)}>{item.next_status || "update"}</AdminStatusBadge>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">{item.notes || "No notes captured."}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{formatDate(item.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email timeline */}
          {(detailState.data?.notifications || []).length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Email Timeline</p>
              <div className="mt-2 space-y-2">
                {detailState.data.notifications.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-slate-700">{item.template_type}</p>
                      <AdminStatusBadge tone={getDeliveryTone(item.delivery_status)}>{item.delivery_status || "pending"}</AdminStatusBadge>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">{item.failure_reason || item.recipient_email || "Awaiting delivery update."}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{formatDate(item.updated_at || item.created_at)}</p>
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
  const [filters, setFilters] = useState({ search: "", status: "all", category: "all", priorityTier: "all", country: "", organization: "", page: 1, pageSize: 50 });
  const [state, setState] = useState({ loading: true, registrations: [], summary: null, pagination: null, count: 0, error: "" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeRegistrationId, setActiveRegistrationId] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailState, setDetailState] = useState({ loading: false, data: null, error: "" });
  const [detailDraft, setDetailDraft] = useState({ status: "pending", speakerFlag: false, vipFlag: false, reviewNotes: "" });
  const [toast, setToast] = useState({ message: "", tone: "default" });
  const [savingDetail, setSavingDetail] = useState(false);
  const [exportLoading, setExportLoading] = useState({ csv: false, xlsx: false, pdf: false });
  const deferredSearch = useDeferredValue(filters.search);
  const queryString = useMemo(() => buildDashboardQueryString({ ...filters, search: deferredSearch }), [deferredSearch, filters]);
  const hasConfigError = isSupabaseAdminConfigError(state.error);
  const selectionSummary = summarizeSelection({ selectedCount: selectedIds.length, matchedCount: state.count });
  const orderedRegistrations = useMemo(() => prioritizeRegistrationQueue(state.registrations || []), [state.registrations]);

  const showToast = (message, tone = "default") => setToast({ message, tone });
  const clearToast = () => setToast({ message: "", tone: "default" });

  const loadRegistrations = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await fetch(`/api/admin/registrations?${queryString}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) return setState({ loading: false, registrations: [], summary: null, pagination: null, count: 0, error: data.error || "Unable to load registrations." });
      setState({ loading: false, registrations: data.registrations || [], summary: data.summary, pagination: data.pagination, count: data.count || 0, error: "" });
      setSelectedIds((current) => current.filter((id) => (data.registrations || []).some((registration) => registration.id === id)));
    } catch {
      setState({ loading: false, registrations: [], summary: null, pagination: null, count: 0, error: "Network error." });
    }
  }, [queryString]);

  const loadDetail = useCallback(async (registrationId) => {
    if (!registrationId) return;
    setDetailState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await fetch(`/api/admin/registrations/${registrationId}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) return setDetailState({ loading: false, data: null, error: data.error || "Unable to load registration detail." });
      setDetailState({ loading: false, data, error: "" });
      setDetailDraft({ status: data.registration.status, speakerFlag: Boolean(data.registration.speaker_flag), vipFlag: Boolean(data.registration.vip_flag), reviewNotes: data.registration.review_notes || "" });
    } catch {
      setDetailState({ loading: false, data: null, error: "Network error while loading registration detail." });
    }
  }, []);

  useEffect(() => { void loadRegistrations(); }, [loadRegistrations]);
  useEffect(() => { if (activeRegistrationId) void loadDetail(activeRegistrationId); }, [activeRegistrationId, loadDetail]);

  const setFilterValue = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  const toggleSelection = (registrationId) => setSelectedIds((current) => (current.includes(registrationId) ? current.filter((id) => id !== registrationId) : [...current, registrationId]));
  const toggleVisibleSelection = () => {
    const visibleIds = orderedRegistrations.map((registration) => registration.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((current) => (allSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])]));
  };

  const openDrawerFor = (registrationId) => {
    setActiveRegistrationId(registrationId);
    setDrawerOpen(true);
  };

  const handleExport = async (format) => {
    setExportLoading((prev) => ({ ...prev, [format]: true }));
    clearToast();
    try {
      const response = await fetch(`/api/admin/badges/export?format=${format}`, { cache: "no-store" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        showToast(errorData.error || `Export failed (${response.status}). Check your Supabase configuration.`, "danger");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tasi-2026-registrations.${format === "xlsx" ? "xlsx" : format === "pdf" ? "pdf" : "csv"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`${format.toUpperCase()} export downloaded successfully.`, "success");
    } catch {
      showToast("Network error during export. Please try again.", "danger");
    } finally {
      setExportLoading((prev) => ({ ...prev, [format]: false }));
    }
  };

  const updateRegistrationStatus = async ({ registrationId, status, speakerFlag = false, vipFlag = false, reviewNotes = "" }) => {
    const response = await fetch("/api/admin/registrations/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationId, status, speakerFlag, vipFlag, reviewNotes }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to update registration.");
    return data;
  };

  const queueQrJob = async ({ resendExisting = false, registrationIds = [] } = {}) => {
    clearToast();
    try {
      const response = await fetch("/api/admin/passes/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filters, registrationIds, resendExisting }) });
      const data = await response.json();
      if (!response.ok) return showToast(data.error || "Unable to queue QR email job.", "danger");
      showToast(data.message || "QR email job queued.", "success");
      void loadRegistrations();
      if (activeRegistrationId) void loadDetail(activeRegistrationId);
    } catch {
      showToast("Network error while queueing QR email job.", "danger");
    }
  };

  const bulkUpdateStatus = async (nextStatus) => {
    if (!selectedIds.length) return showToast("Select at least one registrant before running a bulk status update.", "warning");
    try {
      await Promise.all(selectedIds.map((registrationId) => updateRegistrationStatus({ registrationId, status: nextStatus })));
      showToast(`Updated ${selectedIds.length} registrants to ${nextStatus}.`, "success");
      void loadRegistrations();
      if (activeRegistrationId) void loadDetail(activeRegistrationId);
    } catch {
      showToast("Network error during bulk status update.", "danger");
    }
  };

  const handleQuickAction = async (registration, actionKey) => {
    try {
      if (actionKey === "sendQr") {
        if (registration.status !== "confirmed") await updateRegistrationStatus({ registrationId: registration.id, status: "confirmed" });
        await queueQrJob({ registrationIds: [registration.id] });
        return;
      }
      if (actionKey === "resendQr") return void (await queueQrJob({ registrationIds: [registration.id], resendExisting: true }));
      if (actionKey === "confirm") await updateRegistrationStatus({ registrationId: registration.id, status: "confirmed" });
      if (actionKey === "waitlist") await updateRegistrationStatus({ registrationId: registration.id, status: "waitlisted" });
      if (actionKey === "reject") await updateRegistrationStatus({ registrationId: registration.id, status: "rejected" });
      showToast(`${actionKey} completed for ${registration.first_name} ${registration.last_name}.`, "success");
      void loadRegistrations();
      if (activeRegistrationId === registration.id) void loadDetail(registration.id);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to complete the quick action.", "danger");
    }
  };

  const saveDetailStatus = async () => {
    const registrationId = detailState.data?.registration?.id;
    if (!registrationId) return;
    setSavingDetail(true);
    try {
      const data = await updateRegistrationStatus({ registrationId, status: detailDraft.status, speakerFlag: detailDraft.speakerFlag, vipFlag: detailDraft.vipFlag, reviewNotes: detailDraft.reviewNotes });
      showToast(data.emailResult?.sent ? "Notes saved and attendee email sent." : "Notes saved.", "success");
      void loadRegistrations();
      void loadDetail(registrationId);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to save registration review.", "danger");
    } finally {
      setSavingDetail(false);
    }
  };

  const resendDetailEmail = async () => {
    const registrationId = detailState.data?.registration?.id;
    if (!registrationId) return;
    try {
      const templateType = detailState.data.registration.qr_pass_issued_at ? "qr_pass_issued" : detailDraft.status;
      const response = await fetch("/api/admin/registrations/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationId, templateType }) });
      const data = await response.json();
      if (!response.ok) return showToast(data.error || "Unable to resend attendee email.", "danger");
      showToast(data.result?.queued ? "QR resend queued in the background." : data.result?.sent ? "Attendee email resent." : "Attendee email action completed.", "success");
      void loadDetail(registrationId);
    } catch {
      showToast("Network error while resending attendee email.", "danger");
    }
  };

  const allVisibleSelected = orderedRegistrations.length > 0 && orderedRegistrations.every((r) => selectedIds.includes(r.id));

  return (
    <div className="space-y-5">
      {/* Page header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <AdminSectionHeading
          eyebrow="Registrations"
          title="Review Queue"
          description="Sort the most urgent records to the top, act inline for speed, and click a row to open the detail drawer."
          action={
            <div className="flex flex-wrap gap-2">
              {(["csv", "xlsx", "pdf"] ).map((format) => (
                <button
                  key={format}
                  type="button"
                  disabled={exportLoading[format] || hasConfigError}
                  onClick={() => handleExport(format)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {exportLoading[format] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                  {format === "csv" ? "Export CSV" : format === "xlsx" ? "Export Excel" : "Export PDF"}
                </button>
              ))}
            </div>
          }
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => queueQrJob({ registrationIds: selectedIds })}
            disabled={state.loading || hasConfigError}
            className="h-8 rounded-full bg-amber-600 px-4 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
          >
            {selectedIds.length ? "Send QR To Selected" : "Send QR To Filtered"}
          </button>
          <button
            type="button"
            onClick={() => queueQrJob({ registrationIds: selectedIds, resendExisting: true })}
            disabled={state.loading || hasConfigError}
            className="h-8 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 transition hover:border-slate-300 disabled:opacity-50"
          >
            Resend Issued QR
          </button>
          <a href="/admin/delivery" className="inline-flex h-8 items-center rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 transition hover:border-slate-300">
            Delivery Jobs
          </a>
          <a href="/admin/check-in" className="inline-flex h-8 items-center rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 transition hover:border-slate-300">
            Check-In Console
          </a>
        </div>
      </section>

      {/* Toast */}
      {toast.message ? <AdminToast message={toast.message} tone={getBatchStatusTone(toast.message) !== "default" ? getBatchStatusTone(toast.message) : toast.tone} onDismiss={clearToast} /> : null}
      {hasConfigError ? <AdminAlert title="Supabase Configuration Required" description="This dashboard cannot load registrants or issue QR passes until SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured." tone="danger" /> : null}

      {/* Summary stats */}
      <ReviewSummary summary={state.summary} />

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-700">Filters</p>
          <div className="flex gap-3 text-xs text-slate-400">
            <span>{selectionSummary.selectedLabel}</span>
            <span>{selectionSummary.matchedLabel}</span>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <input
            value={filters.search}
            onChange={(event) => setFilterValue("search", event.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 xl:col-span-2"
            placeholder="Search name, email, code, orgâ€¦"
          />
          <select value={filters.status} onChange={(event) => setFilterValue("status", event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={filters.category} onChange={(event) => setFilterValue("category", event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900">
            <option value="all">All categories</option>
            {ATTENDEE_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <select value={filters.priorityTier} onChange={(event) => setFilterValue("priorityTier", event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900">
            <option value="all">All tiers</option>
            {PRIORITY_TIERS.map((tier) => <option key={tier} value={tier}>{tier}</option>)}
          </select>
          <button type="button" onClick={toggleVisibleSelection} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:border-slate-300">
            {allVisibleSelected ? "Clear Visible" : "Select Visible"}
          </button>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input value={filters.country} onChange={(event) => setFilterValue("country", event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900" placeholder="Filter by country" />
          <input value={filters.organization} onChange={(event) => setFilterValue("organization", event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900" placeholder="Filter by organization" />
        </div>
      </section>

      {/* Error state */}
      {state.error && !hasConfigError ? <AdminAlert title="Dashboard Error" description={state.error} tone="danger" /> : null}

      {/* Review queue table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-3">
          <p className="text-sm font-semibold text-slate-700">
            Review Queue
            {!state.loading && state.count > 0 ? <span className="ml-2 text-xs font-normal text-slate-400">{state.count} registrants</span> : null}
          </p>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="border-b border-slate-200 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleSelection} />
                </th>
                <th className="px-4 py-3 text-left">Registrant</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">QR</th>
                <th className="px-4 py-3 text-left">Check-In</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.loading ? (
                <LoadingRows count={8} cols={7} />
              ) : (
                orderedRegistrations.map((registration) => {
                  const selected = selectedIds.includes(registration.id);
                  return (
                    <tr
                      key={registration.id}
                      className={`cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 ${selected ? "bg-amber-50/40" : ""}`}
                      onClick={() => openDrawerFor(registration.id)}
                    >
                      <td className="px-4 py-3.5" onClick={(event) => event.stopPropagation()}>
                        <input type="checkbox" checked={selected} onChange={() => toggleSelection(registration.id)} />
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-slate-900">{registration.first_name} {registration.last_name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{registration.registration_code}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{registration.organization || "Independent"} Â· {registration.attendee_category || "Unspecified"}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <AdminStatusBadge tone={getStatusTone(registration.status)}>{registration.status}</AdminStatusBadge>
                      </td>
                      <td className="px-4 py-3.5">
                        <AdminStatusBadge tone={getPriorityTone(registration.priority_tier)}>{registration.priority_tier || "Standard"}</AdminStatusBadge>
                      </td>
                      <td className="px-4 py-3.5">
                        <AdminStatusBadge tone={registration.qr_pass_issued_at ? "info" : "default"}>
                          {registration.qr_pass_issued_at ? "Issued" : "Pending"}
                        </AdminStatusBadge>
                      </td>
                      <td className="px-4 py-3.5">
                        <AdminStatusBadge tone={registration.checked_in_at ? "success" : "default"}>
                          {registration.checked_in_at ? "Checked In" : "Pending"}
                        </AdminStatusBadge>
                      </td>
                      <td className="px-4 py-3.5" onClick={(event) => event.stopPropagation()}>
                        <RowActions registration={registration} onQuickAction={handleQuickAction} disabled={state.loading || hasConfigError} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!state.loading && !state.error && orderedRegistrations.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">No registrations match the current filters.</div>
        ) : null}
        {state.pagination ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3">
            <p className="text-xs text-slate-400">Page {state.pagination.page} of {state.pagination.totalPages}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setFilters((current) => ({ ...current, page: Math.max(current.page - 1, 1) }))} disabled={state.pagination.page <= 1} className="h-8 rounded-full border border-slate-200 bg-white px-3 text-xs text-slate-700 disabled:opacity-40">
                Previous
              </button>
              <button type="button" onClick={() => setFilters((current) => ({ ...current, page: Math.min(current.page + 1, state.pagination.totalPages) }))} disabled={state.pagination.page >= state.pagination.totalPages} className="h-8 rounded-full border border-slate-200 bg-white px-3 text-xs text-slate-700 disabled:opacity-40">
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
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Sticky bulk actions bar */}
      {selectedIds.length > 0 ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur shadow-lg">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">{selectedIds.length} selected</span>
            <div className="flex flex-wrap gap-2">
              <QuickActionButton action={{ key: "confirm", label: "Mark Confirmed", kind: "success" }} onClick={() => bulkUpdateStatus("confirmed")} />
              <QuickActionButton action={{ key: "waitlist", label: "Mark Waitlisted", kind: "warning" }} onClick={() => bulkUpdateStatus("waitlisted")} />
              <QuickActionButton action={{ key: "reject", label: "Mark Rejected", kind: "danger" }} onClick={() => bulkUpdateStatus("rejected")} />
              <QuickActionButton action={{ key: "sendQr", label: "Send QR", kind: "info" }} onClick={() => queueQrJob({ registrationIds: selectedIds })} disabled={state.loading || hasConfigError} />
            </div>
            <button type="button" onClick={() => setSelectedIds([])} className="ml-auto text-xs text-slate-400 transition hover:text-slate-600">
              Clear selection
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
