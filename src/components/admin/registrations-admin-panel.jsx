"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { ATTENDEE_CATEGORIES, PRIORITY_TIERS } from "@/lib/registration-constants";
import dashboardUtils from "@/lib/admin-dashboard-utils.cjs";
import { AdminAlert, AdminSectionHeading, AdminStatCard, AdminStatusBadge } from "@/components/admin/admin-ui";

const { buildDashboardQueryString, getBatchStatusTone, isSupabaseAdminConfigError, summarizeSelection } = dashboardUtils;

const STATUS_HINTS = {
  pending: "No attendee email will be sent until you move this record into a decision state.",
  confirmed: "Saving now will send the confirmation email and keep the record eligible for QR issuance.",
  waitlisted: "Saving now will send the waitlisted update and keep the attendee out of the QR queue.",
  rejected: "Saving now will send the rejection email and remove this attendee from entry operations.",
};

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
  return "default";
}

function SummaryStrip({ summary }) {
  if (!summary) return null;

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard label="Pending Review" value={summary.pending} tone="warning" detail="Registrants waiting for an operator decision" />
      <AdminStatCard label="Confirmed" value={summary.confirmed} tone="success" detail="Ready for QR issuance once approved" />
      <AdminStatCard label="QR Issued" value={summary.qrIssued} tone="accent" detail="Pass email already delivered or queued" />
      <AdminStatCard label="Checked In" value={summary.checkedIn} tone="info" detail="Attendees already validated on-site" />
    </section>
  );
}

function FilterToolbar({ filters, setFilterValue, selectedIds, selectionSummary, bulkUpdateStatus, queueQrJob, toggleVisibleSelection, registrations, hasConfigError, stateLoading }) {
  return (
    <section className="rounded-[28px] border border-[#23262d] bg-[#111318] p-5">
      <div className="flex flex-col gap-3 border-b border-[#23262d] pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-admin-mono text-[10px] uppercase tracking-[0.22em] text-[#798093]">Queue Controls</p>
          <h3 className="mt-2 font-admin-display text-2xl text-[#f5f6f8]">Dense review table with bulk actions</h3>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-[#8d93a5]">
          <span>{selectionSummary.selectedLabel}</span>
          <span>{selectionSummary.matchedLabel}</span>
          <span>{selectionSummary.actionScopeLabel}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-6">
        <input value={filters.search} onChange={(event) => setFilterValue("search", event.target.value)} className="h-11 rounded-xl border border-[#2c3038] bg-[#181b21] px-4 text-sm text-[#f5f6f8] placeholder:text-[#646c80] lg:col-span-2" placeholder="Search name, email, code, organization" />
        <select value={filters.status} onChange={(event) => setFilterValue("status", event.target.value)} className="h-11 rounded-xl border border-[#2c3038] bg-[#181b21] px-3 text-sm text-[#f5f6f8]">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="waitlisted">Waitlisted</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={filters.category} onChange={(event) => setFilterValue("category", event.target.value)} className="h-11 rounded-xl border border-[#2c3038] bg-[#181b21] px-3 text-sm text-[#f5f6f8]">
          <option value="all">All categories</option>
          {ATTENDEE_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <select value={filters.priorityTier} onChange={(event) => setFilterValue("priorityTier", event.target.value)} className="h-11 rounded-xl border border-[#2c3038] bg-[#181b21] px-3 text-sm text-[#f5f6f8]">
          <option value="all">All tiers</option>
          {PRIORITY_TIERS.map((tier) => <option key={tier} value={tier}>{tier}</option>)}
        </select>
        <button type="button" onClick={toggleVisibleSelection} className="h-11 rounded-xl border border-[#30343d] bg-[#17191f] px-4 text-sm text-[#dfe2ea] transition hover:border-[#4a4f5a]">
          {registrations.length > 0 && registrations.every((registration) => selectedIds.includes(registration.id)) ? "Clear Visible" : "Select Visible"}
        </button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input value={filters.country} onChange={(event) => setFilterValue("country", event.target.value)} className="h-11 rounded-xl border border-[#2c3038] bg-[#181b21] px-4 text-sm text-[#f5f6f8] placeholder:text-[#646c80]" placeholder="Filter by country" />
        <input value={filters.organization} onChange={(event) => setFilterValue("organization", event.target.value)} className="h-11 rounded-xl border border-[#2c3038] bg-[#181b21] px-4 text-sm text-[#f5f6f8] placeholder:text-[#646c80]" placeholder="Filter by organization" />
      </div>

      {selectedIds.length ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[#5f5337] bg-[linear-gradient(90deg,rgba(200,169,110,0.15),rgba(200,169,110,0.06))] px-4 py-3">
          <span className="font-admin-mono text-[11px] uppercase tracking-[0.16em] text-[#e4cc98]">{selectedIds.length} selected</span>
          <button type="button" onClick={() => bulkUpdateStatus("confirmed")} className="rounded-full border border-[#255446] bg-[#0f211b] px-3 py-1.5 text-xs text-[#86d8bf]">Mark Confirmed</button>
          <button type="button" onClick={() => bulkUpdateStatus("waitlisted")} className="rounded-full border border-[#5f4b21] bg-[#251c0e] px-3 py-1.5 text-xs text-[#f1c36a]">Mark Waitlisted</button>
          <button type="button" onClick={() => bulkUpdateStatus("rejected")} className="rounded-full border border-[#5a2929] bg-[#221213] px-3 py-1.5 text-xs text-[#f29191]">Mark Rejected</button>
          <button type="button" onClick={() => queueQrJob({ registrationIds: selectedIds })} disabled={stateLoading || hasConfigError} className="rounded-full border border-[#29445f] bg-[#111e2d] px-3 py-1.5 text-xs text-[#92c5ea] disabled:opacity-40">Send QR</button>
        </div>
      ) : null}
    </section>
  );
}

function QueueTable({ state, selectedIds, toggleSelection, toggleVisibleSelection, activeRegistrationId, setActiveRegistrationId, filters, setFilters }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[#23262d] bg-[#111318]">
      <div className="border-b border-[#23262d] px-5 py-4">
        <p className="font-admin-mono text-[10px] uppercase tracking-[0.22em] text-[#798093]">Review Queue</p>
        <p className="mt-2 text-sm text-[#8d93a5]">Use the table for throughput and the right drawer for the actual operator decision.</p>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full">
          <thead className="sticky top-0 z-10 bg-[#15181d]">
            <tr className="border-b border-[#23262d] font-admin-mono text-[10px] uppercase tracking-[0.18em] text-[#6f778a]">
              <th className="px-4 py-3 text-left"><input type="checkbox" checked={state.registrations.length > 0 && state.registrations.every((registration) => selectedIds.includes(registration.id))} onChange={toggleVisibleSelection} /></th>
              <th className="px-4 py-3 text-left">Registrant</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Tier</th>
              <th className="px-4 py-3 text-left">QR</th>
              <th className="px-4 py-3 text-left">Check-In</th>
              <th className="px-4 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {state.registrations.map((registration) => {
              const selected = selectedIds.includes(registration.id);
              const active = activeRegistrationId === registration.id;

              return (
                <tr key={registration.id} className={`border-b border-[#1f232a] transition ${active ? "bg-[#1a1e24]" : selected ? "bg-[#151920]" : "hover:bg-[#161a20]"}`} onClick={() => setActiveRegistrationId(registration.id)}>
                  <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={selected} onChange={() => toggleSelection(registration.id)} /></td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-[#f5f6f8]">{registration.first_name} {registration.last_name}</p>
                    <p className="mt-1 font-admin-mono text-[10px] uppercase tracking-[0.12em] text-[#788093]">{registration.registration_code}</p>
                    <p className="mt-1 text-xs text-[#8d93a5]">{registration.organization || "Independent attendee"}</p>
                  </td>
                  <td className="px-4 py-4"><AdminStatusBadge tone={getStatusTone(registration.status)}>{registration.status}</AdminStatusBadge></td>
                  <td className="px-4 py-4 text-sm text-[#c9ced9]">{registration.attendee_category || "Unspecified"}</td>
                  <td className="px-4 py-4"><AdminStatusBadge tone={getPriorityTone(registration.priority_tier)}>{registration.priority_tier || "Standard"}</AdminStatusBadge></td>
                  <td className="px-4 py-4"><AdminStatusBadge tone={registration.qr_pass_issued_at ? "info" : "default"}>{registration.qr_pass_issued_at ? "Issued" : "Pending"}</AdminStatusBadge></td>
                  <td className="px-4 py-4"><AdminStatusBadge tone={registration.checked_in_at ? "success" : "default"}>{registration.checked_in_at ? "Checked In" : "Pending"}</AdminStatusBadge></td>
                  <td className="px-4 py-4 text-sm text-[#8d93a5]">{formatDate(registration.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!state.loading && !state.error && state.registrations.length === 0 ? <div className="p-8 text-center text-sm text-[#8d93a5]">No registrations match the current filters.</div> : null}

      {state.pagination ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#23262d] px-5 py-4 text-sm text-[#8d93a5]">
          <p>Page {state.pagination.page} of {state.pagination.totalPages}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setFilters((current) => ({ ...current, page: Math.max(current.page - 1, 1) }))} disabled={state.pagination.page <= 1} className="rounded-full border border-[#30343d] bg-[#17191f] px-4 py-2 text-sm text-[#dfe2ea] disabled:opacity-40">Previous</button>
            <button type="button" onClick={() => setFilters((current) => ({ ...current, page: Math.min(current.page + 1, state.pagination.totalPages) }))} disabled={state.pagination.page >= state.pagination.totalPages} className="rounded-full border border-[#30343d] bg-[#17191f] px-4 py-2 text-sm text-[#dfe2ea] disabled:opacity-40">Next</button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function DetailDrawer({ detailState, detailDraft, setDetailDraft, saveDetailStatus, queueQrJob, resendDetailEmail, savingDetail }) {
  const activeRegistration = detailState.data?.registration;

  return (
    <section className="rounded-[28px] border border-[#23262d] bg-[#111318] p-5">
      {!activeRegistration ? (
        <div className="py-12 text-center">
          <p className="font-admin-display text-2xl text-[#f5f6f8]">Select a registrant</p>
          <p className="mt-3 text-sm text-[#8d93a5]">The detail drawer shows decision controls, notes, and email history for the active row.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <AdminStatusBadge tone="default">{activeRegistration.registration_code}</AdminStatusBadge>
            <AdminStatusBadge tone={getStatusTone(activeRegistration.status)}>{activeRegistration.status}</AdminStatusBadge>
            {activeRegistration.qr_pass_issued_at ? <AdminStatusBadge tone="info">QR Issued</AdminStatusBadge> : null}
          </div>
          <div className="mt-5">
            <p className="font-admin-mono text-[10px] uppercase tracking-[0.18em] text-[#798093]">Registrant Detail</p>
            <h3 className="mt-2 font-admin-display text-[30px] leading-none text-[#f5f6f8]">{activeRegistration.first_name} {activeRegistration.last_name}</h3>
            <p className="mt-3 text-sm text-[#a5abb9]">{activeRegistration.organization || "Independent attendee"}</p>
            <p className="mt-1 font-admin-mono text-[12px] text-[#9ac8e6]">{activeRegistration.email}</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#23262d] bg-[#17191f] p-3"><p className="text-[11px] uppercase tracking-[0.12em] text-[#6f778a]">Category</p><p className="mt-1 text-sm text-[#f0f2f6]">{activeRegistration.attendee_category || "Unspecified"}</p></div>
            <div className="rounded-2xl border border-[#23262d] bg-[#17191f] p-3"><p className="text-[11px] uppercase tracking-[0.12em] text-[#6f778a]">Priority</p><p className="mt-1 text-sm text-[#f0f2f6]">{activeRegistration.priority_tier || "Standard"}</p></div>
            <div className="rounded-2xl border border-[#23262d] bg-[#17191f] p-3"><p className="text-[11px] uppercase tracking-[0.12em] text-[#6f778a]">QR Issued</p><p className="mt-1 text-sm text-[#f0f2f6]">{formatDate(activeRegistration.qr_pass_issued_at)}</p></div>
            <div className="rounded-2xl border border-[#23262d] bg-[#17191f] p-3"><p className="text-[11px] uppercase tracking-[0.12em] text-[#6f778a]">Checked In</p><p className="mt-1 text-sm text-[#f0f2f6]">{formatDate(activeRegistration.checked_in_at)}</p></div>
          </div>
          <div className="mt-5 space-y-4 border-t border-[#23262d] pt-5">
            <div>
              <p className="font-admin-mono text-[10px] uppercase tracking-[0.18em] text-[#798093]">Decision</p>
              <p className="mt-2 text-sm text-[#8d93a5]">{STATUS_HINTS[detailDraft.status] || STATUS_HINTS.pending}</p>
            </div>
            <select value={detailDraft.status} onChange={(event) => setDetailDraft((current) => ({ ...current, status: event.target.value }))} className="h-11 w-full rounded-xl border border-[#2c3038] bg-[#181b21] px-3 text-sm text-[#f5f6f8]"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="waitlisted">Waitlisted</option><option value="rejected">Rejected</option></select>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-xl border border-[#2c3038] bg-[#17191f] px-3 py-3 text-sm text-[#dfe2ea]"><input type="checkbox" checked={detailDraft.speakerFlag} onChange={(event) => setDetailDraft((current) => ({ ...current, speakerFlag: event.target.checked }))} />Speaker</label>
              <label className="flex items-center gap-2 rounded-xl border border-[#2c3038] bg-[#17191f] px-3 py-3 text-sm text-[#dfe2ea]"><input type="checkbox" checked={detailDraft.vipFlag} onChange={(event) => setDetailDraft((current) => ({ ...current, vipFlag: event.target.checked }))} />VIP</label>
            </div>
            <textarea value={detailDraft.reviewNotes} onChange={(event) => setDetailDraft((current) => ({ ...current, reviewNotes: event.target.value }))} className="min-h-28 w-full rounded-2xl border border-[#2c3038] bg-[#181b21] px-4 py-3 text-sm text-[#f5f6f8] placeholder:text-[#646c80]" placeholder="Operator notes for this registrant" />
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={saveDetailStatus} disabled={savingDetail} className="rounded-full bg-[#c8a96e] px-4 py-2 text-sm font-medium text-[#171107] transition hover:opacity-90 disabled:opacity-50">{savingDetail ? "Saving..." : "Save Review"}</button>
              <button type="button" onClick={() => queueQrJob({ registrationIds: [activeRegistration.id] })} className="rounded-full border border-[#30343d] bg-[#17191f] px-4 py-2 text-sm text-[#dfe2ea] transition hover:border-[#4a4f5a]">Queue QR Email</button>
              <button type="button" onClick={resendDetailEmail} className="rounded-full border border-[#30343d] bg-[#17191f] px-4 py-2 text-sm text-[#dfe2ea] transition hover:border-[#4a4f5a]">Resend Update</button>
            </div>
          </div>
          <div className="mt-6 space-y-5 border-t border-[#23262d] pt-5">
            <div>
              <p className="font-admin-mono text-[10px] uppercase tracking-[0.18em] text-[#798093]">Status History</p>
              <div className="mt-3 space-y-3">
                {(detailState.data?.history || []).map((item) => <div key={item.id} className="rounded-2xl border border-[#23262d] bg-[#17191f] p-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-[#f5f6f8]">{item.action_type}</p><AdminStatusBadge tone={getStatusTone(item.next_status)}>{item.next_status || "update"}</AdminStatusBadge></div><p className="mt-2 text-sm text-[#9ca3b5]">{item.notes || "No notes captured for this update."}</p><p className="mt-2 text-xs text-[#6f778a]">{formatDate(item.created_at)}</p></div>)}
                {!(detailState.data?.history || []).length ? <p className="text-sm text-[#8d93a5]">Status changes will appear here after the first review action.</p> : null}
              </div>
            </div>
            <div>
              <p className="font-admin-mono text-[10px] uppercase tracking-[0.18em] text-[#798093]">Email Timeline</p>
              <div className="mt-3 space-y-3">
                {(detailState.data?.notifications || []).map((item) => <div key={item.id} className="rounded-2xl border border-[#23262d] bg-[#17191f] p-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-[#f5f6f8]">{item.template_type}</p><AdminStatusBadge tone={getDeliveryTone(item.delivery_status)}>{item.delivery_status || "pending"}</AdminStatusBadge></div><p className="mt-2 text-sm text-[#9ca3b5]">{item.failure_reason || item.recipient_email || "Awaiting delivery update."}</p><p className="mt-2 text-xs text-[#6f778a]">{formatDate(item.updated_at || item.created_at)}</p></div>)}
                {!(detailState.data?.notifications || []).length ? <p className="text-sm text-[#8d93a5]">Decision emails and QR delivery updates will appear here.</p> : null}
              </div>
            </div>
          </div>
        </>
      )}
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

  const loadRegistrations = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await fetch(`/api/admin/registrations?${queryString}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) return setState({ loading: false, registrations: [], summary: null, pagination: null, count: 0, error: data.error || "Unable to load registrations." });
      setState({ loading: false, registrations: data.registrations || [], summary: data.summary, pagination: data.pagination, count: data.count || 0, error: "" });
      setSelectedIds((current) => current.filter((id) => (data.registrations || []).some((registration) => registration.id === id)));
      if (!activeRegistrationId && data.registrations?.[0]?.id) setActiveRegistrationId(data.registrations[0].id);
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
    const visibleIds = state.registrations.map((registration) => registration.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((current) => (allSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])]));
  };

  const queueQrJob = async ({ resendExisting = false, registrationIds = [] } = {}) => {
    setActionMessage("");
    try {
      const response = await fetch("/api/admin/passes/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filters, registrationIds, resendExisting }) });
      const data = await response.json();
      if (!response.ok) return setActionMessage(data.error || "Unable to queue QR email job.");
      setActionMessage(data.message || "QR email job queued.");
      void loadRegistrations();
    } catch {
      setActionMessage("Network error while queueing QR email job.");
    }
  };

  const bulkUpdateStatus = async (nextStatus) => {
    if (!selectedIds.length) return setActionMessage("Select at least one registrant before running a bulk status update.");
    try {
      await Promise.all(selectedIds.map((registrationId) => fetch("/api/admin/registrations/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationId, status: nextStatus, reviewNotes: "", speakerFlag: false, vipFlag: false }) })));
      setActionMessage(`Updated ${selectedIds.length} registrants to ${nextStatus}.`);
      void loadRegistrations();
      if (activeRegistrationId) void loadDetail(activeRegistrationId);
    } catch {
      setActionMessage("Network error during bulk status update.");
    }
  };

  const saveDetailStatus = async () => {
    const registrationId = detailState.data?.registration?.id;
    if (!registrationId) return;
    setSavingDetail(true);
    try {
      const response = await fetch("/api/admin/registrations/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationId, status: detailDraft.status, speakerFlag: detailDraft.speakerFlag, vipFlag: detailDraft.vipFlag, reviewNotes: detailDraft.reviewNotes }) });
      const data = await response.json();
      if (!response.ok) return setActionMessage(data.error || "Unable to save registration review.");
      setActionMessage(data.emailResult?.sent ? "Review saved and attendee email sent." : "Review saved.");
      void loadRegistrations();
      void loadDetail(registrationId);
    } catch {
      setActionMessage("Network error while saving registration review.");
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
      <section className="rounded-[28px] border border-[#23262d] bg-[#111318] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
        <AdminSectionHeading eyebrow="Registrations Review" title="Queue-first approvals for peak-hour ops" description="Search, review, export, and push confirmation decisions without losing track of who still needs QR access or operator attention." action={<div className="flex flex-wrap gap-3"><a href="/api/admin/badges/export?format=csv" className="rounded-full border border-[#30343d] bg-[#17191f] px-4 py-2 text-sm text-[#dfe2ea] transition hover:border-[#4a4f5a]">Export CSV</a><a href="/api/admin/badges/export?format=xlsx" className="rounded-full border border-[#30343d] bg-[#17191f] px-4 py-2 text-sm text-[#dfe2ea] transition hover:border-[#4a4f5a]">Export Excel</a><a href="/api/admin/badges/export?format=pdf" className="rounded-full border border-[#30343d] bg-[#17191f] px-4 py-2 text-sm text-[#dfe2ea] transition hover:border-[#4a4f5a]">Export PDF Merge</a></div>} />
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => queueQrJob({ registrationIds: selectedIds })} disabled={state.loading || hasConfigError} className="rounded-full bg-[#c8a96e] px-4 py-2 text-sm font-medium text-[#171107] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">{selectedIds.length ? "Send QR To Selected" : "Send QR To Filtered"}</button>
          <button type="button" onClick={() => queueQrJob({ registrationIds: selectedIds, resendExisting: true })} disabled={state.loading || hasConfigError} className="rounded-full border border-[#30343d] bg-[#17191f] px-4 py-2 text-sm text-[#dfe2ea] transition hover:border-[#4a4f5a] disabled:opacity-50">Resend Issued QR</button>
          <a href="/admin/delivery" className="rounded-full border border-[#30343d] bg-[#17191f] px-4 py-2 text-sm text-[#dfe2ea] transition hover:border-[#4a4f5a]">Open Delivery Jobs</a>
          <a href="/admin/check-in" className="rounded-full border border-[#30343d] bg-[#17191f] px-4 py-2 text-sm text-[#dfe2ea] transition hover:border-[#4a4f5a]">Open Check-In Console</a>
        </div>
        <p className="mt-4 text-sm text-[#8d93a5]">Signed in as {operator.displayName} · {operator.primaryEmail}</p>
      </section>

      {actionMessage ? <AdminAlert title="Admin Queue Status" description={actionMessage} tone={getBatchStatusTone(actionMessage)} /> : null}
      {hasConfigError ? <AdminAlert title="Supabase Admin Configuration Required" description="This dashboard cannot load registrants or issue QR passes until SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured." tone="danger" /> : null}

      <SummaryStrip summary={state.summary} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <FilterToolbar filters={filters} setFilterValue={setFilterValue} selectedIds={selectedIds} selectionSummary={selectionSummary} bulkUpdateStatus={bulkUpdateStatus} queueQrJob={queueQrJob} toggleVisibleSelection={toggleVisibleSelection} registrations={state.registrations} hasConfigError={hasConfigError} stateLoading={state.loading} />
          {state.error && !hasConfigError ? <AdminAlert title="Dashboard Error" description={state.error} tone="danger" /> : null}
          {state.loading ? <AdminAlert title="Loading Queue" description="Fetching the latest registration queue and summary counts." /> : null}
          <QueueTable state={state} selectedIds={selectedIds} toggleSelection={toggleSelection} toggleVisibleSelection={toggleVisibleSelection} activeRegistrationId={activeRegistrationId} setActiveRegistrationId={setActiveRegistrationId} filters={filters} setFilters={setFilters} />
        </div>
        <div className="space-y-4 xl:sticky xl:top-28 xl:self-start">
          {detailState.error ? <AdminAlert title="Registrant Detail Error" description={detailState.error} tone="danger" /> : null}
          {detailState.loading ? <AdminAlert title="Loading Registrant" description="Fetching notes, status history, and delivery timeline." /> : null}
          <DetailDrawer detailState={detailState} detailDraft={detailDraft} setDetailDraft={setDetailDraft} saveDetailStatus={saveDetailStatus} queueQrJob={queueQrJob} resendDetailEmail={resendDetailEmail} savingDetail={savingDetail} />
        </div>
      </section>
    </div>
  );
}
