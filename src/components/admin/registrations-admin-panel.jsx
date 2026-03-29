"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { ATTENDEE_CATEGORIES, PRIORITY_TIERS } from "@/lib/registration-constants";
import dashboardUtils from "@/lib/admin-dashboard-utils.cjs";
import { AdminAlert, AdminSectionHeading, AdminStatCard, AdminStatusBadge } from "@/components/admin/admin-ui";

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
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
    warning: "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100",
    danger: "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100",
    info: "border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100",
  };

  return <button type="button" onClick={onClick} disabled={disabled} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${toneClasses[action.kind] || toneClasses.info} disabled:cursor-not-allowed disabled:opacity-50`}>{action.label}</button>;
}

function RowActions({ registration, onQuickAction, disabled = false }) {
  return <div className="flex flex-wrap gap-2">{getQuickActionOptions(registration).map((action) => <QuickActionButton key={action.key} action={action} onClick={() => onQuickAction(registration, action.key)} disabled={disabled} />)}</div>;
}

function DetailPanel({ detailState, detailDraft, setDetailDraft, saveDetailStatus, resendDetailEmail, savingDetail }) {
  const activeRegistration = detailState.data?.registration;

  if (!activeRegistration) {
    return <section className="rounded-[24px] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"><p className="font-admin-display text-2xl text-slate-900">Select a registrant</p><p className="mt-3 text-sm text-slate-600">This panel is intentionally lighter now. Use row actions for fast decisions, then use this drawer for context, notes, and email history.</p></section>;
  }

  return (
    <section className="rounded-[24px] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-center gap-2">
        <AdminStatusBadge tone="default">{activeRegistration.registration_code}</AdminStatusBadge>
        <AdminStatusBadge tone={getStatusTone(activeRegistration.status)}>{activeRegistration.status}</AdminStatusBadge>
        {activeRegistration.qr_pass_issued_at ? <AdminStatusBadge tone="info">QR issued</AdminStatusBadge> : null}
      </div>
      <div className="mt-4">
        <p className="font-admin-mono text-[10px] uppercase tracking-[0.18em] text-amber-700">Registrant Context</p>
        <h3 className="mt-2 font-admin-display text-[34px] leading-none text-slate-900">{activeRegistration.first_name} {activeRegistration.last_name}</h3>
        <p className="mt-3 text-sm text-slate-600">{activeRegistration.organization || "Independent attendee"}</p>
        <p className="mt-1 font-admin-mono text-[12px] text-slate-500">{activeRegistration.email}</p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[18px] border border-stone-200 bg-[#faf7f2] p-3"><p className="text-[11px] uppercase tracking-[0.12em] text-stone-500">Category</p><p className="mt-1 text-sm text-slate-900">{activeRegistration.attendee_category || "Unspecified"}</p></div>
        <div className="rounded-[18px] border border-stone-200 bg-[#faf7f2] p-3"><p className="text-[11px] uppercase tracking-[0.12em] text-stone-500">Priority</p><p className="mt-1 text-sm text-slate-900">{activeRegistration.priority_tier || "Standard"}</p></div>
        <div className="rounded-[18px] border border-stone-200 bg-[#faf7f2] p-3"><p className="text-[11px] uppercase tracking-[0.12em] text-stone-500">QR Issued</p><p className="mt-1 text-sm text-slate-900">{formatDate(activeRegistration.qr_pass_issued_at)}</p></div>
        <div className="rounded-[18px] border border-stone-200 bg-[#faf7f2] p-3"><p className="text-[11px] uppercase tracking-[0.12em] text-stone-500">Checked In</p><p className="mt-1 text-sm text-slate-900">{formatDate(activeRegistration.checked_in_at)}</p></div>
      </div>
      <div className="mt-6 border-t border-stone-200 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div><p className="font-admin-mono text-[10px] uppercase tracking-[0.18em] text-amber-700">Status + Notes</p><p className="mt-2 text-sm text-slate-600">{statusHint(detailDraft.status)}</p></div>
          <button type="button" onClick={resendDetailEmail} className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-stone-300">Resend Update</button>
        </div>
        <div className="mt-4 space-y-4">
          <select value={detailDraft.status} onChange={(event) => setDetailDraft((current) => ({ ...current, status: event.target.value }))} className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-slate-900"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="waitlisted">Waitlisted</option><option value="rejected">Rejected</option></select>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-xl border border-stone-200 bg-[#faf7f2] px-3 py-3 text-sm text-slate-700"><input type="checkbox" checked={detailDraft.speakerFlag} onChange={(event) => setDetailDraft((current) => ({ ...current, speakerFlag: event.target.checked }))} />Speaker</label>
            <label className="flex items-center gap-2 rounded-xl border border-stone-200 bg-[#faf7f2] px-3 py-3 text-sm text-slate-700"><input type="checkbox" checked={detailDraft.vipFlag} onChange={(event) => setDetailDraft((current) => ({ ...current, vipFlag: event.target.checked }))} />VIP</label>
          </div>
          <textarea value={detailDraft.reviewNotes} onChange={(event) => setDetailDraft((current) => ({ ...current, reviewNotes: event.target.value }))} className="min-h-28 w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm text-slate-900" placeholder="Operator notes for context, exceptions, or follow-up" />
          <button type="button" onClick={saveDetailStatus} disabled={savingDetail} className="rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-50">{savingDetail ? "Saving..." : "Save Notes + Status"}</button>
        </div>
      </div>
      <div className="mt-6 space-y-5 border-t border-stone-200 pt-5">
        <div>
          <p className="font-admin-mono text-[10px] uppercase tracking-[0.18em] text-amber-700">Status History</p>
          <div className="mt-3 space-y-3">
            {(detailState.data?.history || []).map((item) => <div key={item.id} className="rounded-[18px] border border-stone-200 bg-[#faf7f2] p-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-slate-900">{item.action_type}</p><AdminStatusBadge tone={getStatusTone(item.next_status)}>{item.next_status || "update"}</AdminStatusBadge></div><p className="mt-2 text-sm text-slate-600">{item.notes || "No notes captured for this update."}</p><p className="mt-2 text-xs text-stone-500">{formatDate(item.created_at)}</p></div>)}
          </div>
        </div>
        <div>
          <p className="font-admin-mono text-[10px] uppercase tracking-[0.18em] text-amber-700">Email Timeline</p>
          <div className="mt-3 space-y-3">
            {(detailState.data?.notifications || []).map((item) => <div key={item.id} className="rounded-[18px] border border-stone-200 bg-[#faf7f2] p-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-slate-900">{item.template_type}</p><AdminStatusBadge tone={getDeliveryTone(item.delivery_status)}>{item.delivery_status || "pending"}</AdminStatusBadge></div><p className="mt-2 text-sm text-slate-600">{item.failure_reason || item.recipient_email || "Awaiting delivery update."}</p><p className="mt-2 text-xs text-stone-500">{formatDate(item.updated_at || item.created_at)}</p></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function RegistrationsAdminPanel({ operator }) {
  const [filters, setFilters] = useState({ search: "", status: "all", category: "all", priorityTier: "all", country: "", organization: "", page: 1, pageSize: 50 });
  const [state, setState] = useState({ loading: true, registrations: [], summary: null, pagination: null, count: 0, error: "" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeRegistrationId, setActiveRegistrationId] = useState("");
  const [detailState, setDetailState] = useState({ loading: false, data: null, error: "" });
  const [detailDraft, setDetailDraft] = useState({ status: "pending", speakerFlag: false, vipFlag: false, reviewNotes: "" });
  const [actionMessage, setActionMessage] = useState("");
  const [savingDetail, setSavingDetail] = useState(false);
  const deferredSearch = useDeferredValue(filters.search);
  const queryString = useMemo(() => buildDashboardQueryString({ ...filters, search: deferredSearch }), [deferredSearch, filters]);
  const hasConfigError = isSupabaseAdminConfigError(state.error) || isSupabaseAdminConfigError(actionMessage);
  const selectionSummary = summarizeSelection({ selectedCount: selectedIds.length, matchedCount: state.count });
  const orderedRegistrations = useMemo(() => prioritizeRegistrationQueue(state.registrations || []), [state.registrations]);

  const loadRegistrations = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await fetch(`/api/admin/registrations?${queryString}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) return setState({ loading: false, registrations: [], summary: null, pagination: null, count: 0, error: data.error || "Unable to load registrations." });
      setState({ loading: false, registrations: data.registrations || [], summary: data.summary, pagination: data.pagination, count: data.count || 0, error: "" });
      if (!activeRegistrationId && data.registrations?.[0]?.id) setActiveRegistrationId(data.registrations[0].id);
      setSelectedIds((current) => current.filter((id) => (data.registrations || []).some((registration) => registration.id === id)));
    } catch {
      setState({ loading: false, registrations: [], summary: null, pagination: null, count: 0, error: "Network error." });
    }
  }, [activeRegistrationId, queryString]);

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

  const updateRegistrationStatus = async ({ registrationId, status, speakerFlag = false, vipFlag = false, reviewNotes = "" }) => {
    const response = await fetch("/api/admin/registrations/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationId, status, speakerFlag, vipFlag, reviewNotes }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to update registration.");
    return data;
  };

  const queueQrJob = async ({ resendExisting = false, registrationIds = [] } = {}) => {
    setActionMessage("");
    try {
      const response = await fetch("/api/admin/passes/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filters, registrationIds, resendExisting }) });
      const data = await response.json();
      if (!response.ok) return setActionMessage(data.error || "Unable to queue QR email job.");
      setActionMessage(data.message || "QR email job queued.");
      void loadRegistrations();
      if (activeRegistrationId) void loadDetail(activeRegistrationId);
    } catch {
      setActionMessage("Network error while queueing QR email job.");
    }
  };

  const bulkUpdateStatus = async (nextStatus) => {
    if (!selectedIds.length) return setActionMessage("Select at least one registrant before running a bulk status update.");
    try {
      await Promise.all(selectedIds.map((registrationId) => updateRegistrationStatus({ registrationId, status: nextStatus })));
      setActionMessage(`Updated ${selectedIds.length} registrants to ${nextStatus}.`);
      void loadRegistrations();
      if (activeRegistrationId) void loadDetail(activeRegistrationId);
    } catch {
      setActionMessage("Network error during bulk status update.");
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
      setActionMessage(`${actionKey} completed for ${registration.first_name} ${registration.last_name}.`);
      void loadRegistrations();
      if (activeRegistrationId === registration.id) void loadDetail(registration.id);
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "Unable to complete the quick action.");
    }
  };

  const saveDetailStatus = async () => {
    const registrationId = detailState.data?.registration?.id;
    if (!registrationId) return;
    setSavingDetail(true);
    try {
      const data = await updateRegistrationStatus({ registrationId, status: detailDraft.status, speakerFlag: detailDraft.speakerFlag, vipFlag: detailDraft.vipFlag, reviewNotes: detailDraft.reviewNotes });
      setActionMessage(data.emailResult?.sent ? "Notes saved and attendee email sent." : "Notes saved.");
      void loadRegistrations();
      void loadDetail(registrationId);
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "Unable to save registration review.");
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
      if (!response.ok) return setActionMessage(data.error || "Unable to resend attendee email.");
      setActionMessage(data.result?.queued ? "QR resend queued in the background." : data.result?.sent ? "Attendee email resent." : "Attendee email action completed.");
      void loadDetail(registrationId);
    } catch {
      setActionMessage("Network error while resending attendee email.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-stone-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <AdminSectionHeading eyebrow="Registrations Review" title="Fast operator queue with row-level decisions" description="The queue is now the primary workspace. Sort the most urgent records to the top, act inline for speed, and use the right drawer only for context, notes, and history." action={<div className="flex flex-wrap gap-3"><a href="/api/admin/badges/export?format=csv" className="rounded-full border border-stone-200 bg-[#faf7f2] px-4 py-2 text-sm text-slate-700 transition hover:border-stone-300">Export CSV</a><a href="/api/admin/badges/export?format=xlsx" className="rounded-full border border-stone-200 bg-[#faf7f2] px-4 py-2 text-sm text-slate-700 transition hover:border-stone-300">Export Excel</a><a href="/api/admin/badges/export?format=pdf" className="rounded-full border border-stone-200 bg-[#faf7f2] px-4 py-2 text-sm text-slate-700 transition hover:border-stone-300">Export PDF Merge</a></div>} />
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => queueQrJob({ registrationIds: selectedIds })} disabled={state.loading || hasConfigError} className="rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-50">{selectedIds.length ? "Send QR To Selected" : "Send QR To Filtered"}</button>
          <button type="button" onClick={() => queueQrJob({ registrationIds: selectedIds, resendExisting: true })} disabled={state.loading || hasConfigError} className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-stone-300 disabled:opacity-50">Resend Issued QR</button>
          <a href="/admin/delivery" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-stone-300">Open Delivery Jobs</a>
          <a href="/admin/check-in" className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-stone-300">Open Check-In Console</a>
        </div>
        <p className="mt-4 text-sm text-slate-600">Signed in as {operator.displayName} · {operator.primaryEmail}</p>
      </section>

      {actionMessage ? <AdminAlert title="Admin Queue Status" description={actionMessage} tone={getBatchStatusTone(actionMessage)} /> : null}
      {hasConfigError ? <AdminAlert title="Supabase Admin Configuration Required" description="This dashboard cannot load registrants or issue QR passes until SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured." tone="danger" /> : null}
      <ReviewSummary summary={state.summary} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="font-admin-mono text-[10px] uppercase tracking-[0.22em] text-amber-700">Command Bar</p><h3 className="mt-2 font-admin-display text-2xl text-slate-900">Filter first, then act inline</h3></div><div className="flex flex-wrap gap-2 text-xs text-slate-500"><span>{selectionSummary.selectedLabel}</span><span>{selectionSummary.matchedLabel}</span><span>{selectionSummary.actionScopeLabel}</span></div></div>
            <div className="mt-4 grid gap-3 lg:grid-cols-6">
              <input value={filters.search} onChange={(event) => setFilterValue("search", event.target.value)} className="h-11 rounded-xl border border-stone-200 bg-[#faf7f2] px-4 text-sm text-slate-900 lg:col-span-2" placeholder="Search name, email, code, organization" />
              <select value={filters.status} onChange={(event) => setFilterValue("status", event.target.value)} className="h-11 rounded-xl border border-stone-200 bg-[#faf7f2] px-3 text-sm text-slate-900"><option value="all">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="waitlisted">Waitlisted</option><option value="rejected">Rejected</option></select>
              <select value={filters.category} onChange={(event) => setFilterValue("category", event.target.value)} className="h-11 rounded-xl border border-stone-200 bg-[#faf7f2] px-3 text-sm text-slate-900"><option value="all">All categories</option>{ATTENDEE_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select>
              <select value={filters.priorityTier} onChange={(event) => setFilterValue("priorityTier", event.target.value)} className="h-11 rounded-xl border border-stone-200 bg-[#faf7f2] px-3 text-sm text-slate-900"><option value="all">All tiers</option>{PRIORITY_TIERS.map((tier) => <option key={tier} value={tier}>{tier}</option>)}</select>
              <button type="button" onClick={toggleVisibleSelection} className="h-11 rounded-xl border border-stone-200 bg-white px-4 text-sm text-slate-700 transition hover:border-stone-300">{orderedRegistrations.length > 0 && orderedRegistrations.every((registration) => selectedIds.includes(registration.id)) ? "Clear Visible" : "Select Visible"}</button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input value={filters.country} onChange={(event) => setFilterValue("country", event.target.value)} className="h-11 rounded-xl border border-stone-200 bg-[#faf7f2] px-4 text-sm text-slate-900" placeholder="Filter by country" />
              <input value={filters.organization} onChange={(event) => setFilterValue("organization", event.target.value)} className="h-11 rounded-xl border border-stone-200 bg-[#faf7f2] px-4 text-sm text-slate-900" placeholder="Filter by organization" />
            </div>
            {selectedIds.length ? <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3"><span className="font-admin-mono text-[11px] uppercase tracking-[0.16em] text-amber-900">{selectedIds.length} selected</span><QuickActionButton action={{ key: "confirm", label: "Mark Confirmed", kind: "success" }} onClick={() => bulkUpdateStatus("confirmed")} /><QuickActionButton action={{ key: "waitlist", label: "Mark Waitlisted", kind: "warning" }} onClick={() => bulkUpdateStatus("waitlisted")} /><QuickActionButton action={{ key: "reject", label: "Mark Rejected", kind: "danger" }} onClick={() => bulkUpdateStatus("rejected")} /><QuickActionButton action={{ key: "sendQr", label: "Send QR", kind: "info" }} onClick={() => queueQrJob({ registrationIds: selectedIds })} disabled={state.loading || hasConfigError} /></div> : null}
          </section>

          {state.error && !hasConfigError ? <AdminAlert title="Dashboard Error" description={state.error} tone="danger" /> : null}
          {state.loading ? <AdminAlert title="Loading Queue" description="Fetching the latest registration queue and summary counts." /> : null}

          <section className="overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="border-b border-stone-200 px-5 py-4"><p className="font-admin-mono text-[10px] uppercase tracking-[0.22em] text-amber-700">Review Queue</p><p className="mt-2 text-sm text-slate-600">Pending and higher-priority attendees are surfaced first. Most operator actions now happen directly from the row.</p></div>
            <div className="overflow-auto">
              <table className="min-w-full">
                <thead className="bg-[#faf7f2]"><tr className="border-b border-stone-200 font-admin-mono text-[10px] uppercase tracking-[0.18em] text-stone-500"><th className="px-4 py-3 text-left"><input type="checkbox" checked={orderedRegistrations.length > 0 && orderedRegistrations.every((registration) => selectedIds.includes(registration.id))} onChange={toggleVisibleSelection} /></th><th className="px-4 py-3 text-left">Registrant</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Priority</th><th className="px-4 py-3 text-left">QR</th><th className="px-4 py-3 text-left">Check-In</th><th className="px-4 py-3 text-left">Quick Actions</th></tr></thead>
                <tbody>
                  {orderedRegistrations.map((registration) => {
                    const selected = selectedIds.includes(registration.id);
                    const active = activeRegistrationId === registration.id;
                    return <tr key={registration.id} className={`border-b border-stone-100 transition ${active ? "bg-amber-50/80" : selected ? "bg-stone-50" : "hover:bg-stone-50/70"}`} onClick={() => setActiveRegistrationId(registration.id)}><td className="px-4 py-4" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={selected} onChange={() => toggleSelection(registration.id)} /></td><td className="px-4 py-4"><p className="text-sm font-medium text-slate-900">{registration.first_name} {registration.last_name}</p><p className="mt-1 font-admin-mono text-[10px] uppercase tracking-[0.12em] text-stone-500">{registration.registration_code}</p><p className="mt-1 text-xs text-slate-600">{registration.organization || "Independent attendee"} · {registration.attendee_category || "Unspecified"}</p></td><td className="px-4 py-4"><AdminStatusBadge tone={getStatusTone(registration.status)}>{registration.status}</AdminStatusBadge></td><td className="px-4 py-4"><AdminStatusBadge tone={getPriorityTone(registration.priority_tier)}>{registration.priority_tier || "Standard"}</AdminStatusBadge></td><td className="px-4 py-4"><AdminStatusBadge tone={registration.qr_pass_issued_at ? "info" : "default"}>{registration.qr_pass_issued_at ? "Issued" : "Pending"}</AdminStatusBadge></td><td className="px-4 py-4"><AdminStatusBadge tone={registration.checked_in_at ? "success" : "default"}>{registration.checked_in_at ? "Checked In" : "Pending"}</AdminStatusBadge></td><td className="px-4 py-4" onClick={(event) => event.stopPropagation()}><RowActions registration={registration} onQuickAction={handleQuickAction} disabled={state.loading || hasConfigError} /></td></tr>;
                  })}
                </tbody>
              </table>
            </div>
            {!state.loading && !state.error && orderedRegistrations.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">No registrations match the current filters.</div> : null}
            {state.pagination ? <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 px-5 py-4 text-sm text-slate-500"><p>Page {state.pagination.page} of {state.pagination.totalPages}</p><div className="flex gap-2"><button type="button" onClick={() => setFilters((current) => ({ ...current, page: Math.max(current.page - 1, 1) }))} disabled={state.pagination.page <= 1} className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-slate-700 disabled:opacity-40">Previous</button><button type="button" onClick={() => setFilters((current) => ({ ...current, page: Math.min(current.page + 1, state.pagination.totalPages) }))} disabled={state.pagination.page >= state.pagination.totalPages} className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-slate-700 disabled:opacity-40">Next</button></div></div> : null}
          </section>
        </div>

        <div className="space-y-4 xl:sticky xl:top-28 xl:self-start">
          {detailState.error ? <AdminAlert title="Registrant Detail Error" description={detailState.error} tone="danger" /> : null}
          {detailState.loading ? <AdminAlert title="Loading Registrant" description="Fetching notes, status history, and delivery timeline." /> : null}
          <DetailPanel detailState={detailState} detailDraft={detailDraft} setDetailDraft={setDetailDraft} saveDetailStatus={saveDetailStatus} resendDetailEmail={resendDetailEmail} savingDetail={savingDetail} />
        </div>
      </section>
    </div>
  );
}
