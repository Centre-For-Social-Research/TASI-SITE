"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { ATTENDEE_CATEGORIES, PRIORITY_TIERS } from "@/lib/registration-constants";
import dashboardUtils from "@/lib/admin-dashboard-utils.cjs";

const { buildDashboardQueryString, getBatchStatusTone, isSupabaseAdminConfigError, summarizeSelection } = dashboardUtils;

function SummaryCard({ label, value, accent }) {
  return (
    <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
        <span className={`h-2.5 w-2.5 rounded-full ${accent}`} />
      </div>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

function AlertPanel({ title, description, tone = "default" }) {
  const toneMap = {
    default: "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300",
    danger: "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200",
    warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100",
  };

  return (
    <div className={`rounded-[10px] border p-4 shadow-sm ${toneMap[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em]">{title}</p>
      <p className="mt-2 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StatusBadge({ children, tone = "default" }) {
  const toneMap = {
    default: "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100",
    warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100",
    danger: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-100",
    accent: "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-100",
  };

  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${toneMap[tone]}`}>{children}</span>;
}

function formatDate(value) {
  if (!value) return "Not yet";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function progressWidth(progress) {
  return `${Math.max(progress?.percentComplete || 0, 4)}%`;
}

function jobTone(job) {
  const tone = job?.progress?.tone || "default";
  if (tone === "success") return "success";
  if (tone === "warning") return "warning";
  if (tone === "danger") return "danger";
  return "default";
}

export default function RegistrationsAdminPanel({ operator }) {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    priorityTier: "all",
    country: "",
    organization: "",
    page: 1,
    pageSize: 50,
  });
  const [state, setState] = useState({ loading: true, registrations: [], summary: null, pagination: null, count: 0, error: "" });
  const [jobsState, setJobsState] = useState({ loading: true, jobs: [], selectedJobId: "", selectedDetail: null, error: "" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeRegistrationId, setActiveRegistrationId] = useState("");
  const [detailState, setDetailState] = useState({ loading: false, data: null, error: "" });
  const [detailDraft, setDetailDraft] = useState({ status: "pending", speakerFlag: false, vipFlag: false, reviewNotes: "" });
  const [actionMessage, setActionMessage] = useState("");
  const [savingDetail, setSavingDetail] = useState(false);
  const deferredSearch = useDeferredValue(filters.search);

  const queryString = useMemo(
    () =>
      buildDashboardQueryString({
        ...filters,
        search: deferredSearch,
      }),
    [deferredSearch, filters],
  );

  const hasConfigError = isSupabaseAdminConfigError(state.error) || isSupabaseAdminConfigError(actionMessage);
  const selectionSummary = summarizeSelection({ selectedCount: selectedIds.length, matchedCount: state.count });

  const loadRegistrations = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await fetch(`/api/admin/registrations?${queryString}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setState({ loading: false, registrations: [], summary: null, pagination: null, count: 0, error: data.error || "Unable to load registrations." });
        return;
      }

      setState({
        loading: false,
        registrations: data.registrations || [],
        summary: data.summary,
        pagination: data.pagination,
        count: data.count || 0,
        error: "",
      });
      setSelectedIds((current) => current.filter((id) => (data.registrations || []).some((registration) => registration.id === id)));
      if (!activeRegistrationId && data.registrations?.[0]?.id) {
        setActiveRegistrationId(data.registrations[0].id);
      }
    } catch {
      setState({ loading: false, registrations: [], summary: null, pagination: null, count: 0, error: "Network error." });
    }
  }, [activeRegistrationId, queryString]);

  const loadJobs = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/passes/jobs", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setJobsState((current) => ({ ...current, loading: false, error: data.error || "Unable to load jobs." }));
        return;
      }

      setJobsState((current) => ({
        ...current,
        loading: false,
        jobs: data.jobs || [],
        selectedJobId: current.selectedJobId || data.jobs?.[0]?.id || "",
        error: "",
      }));
    } catch {
      setJobsState((current) => ({ ...current, loading: false, error: "Network error while loading jobs." }));
    }
  }, []);

  const loadJobDetail = useCallback(async (jobId) => {
    if (!jobId) {
      setJobsState((current) => ({ ...current, selectedDetail: null }));
      return;
    }

    try {
      const response = await fetch(`/api/admin/passes/jobs/${jobId}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setJobsState((current) => ({ ...current, error: data.error || "Unable to load job detail." }));
        return;
      }

      setJobsState((current) => ({ ...current, selectedDetail: { job: data.job, items: data.items || [] }, error: "" }));
    } catch {
      setJobsState((current) => ({ ...current, error: "Network error while loading job detail." }));
    }
  }, []);

  const loadDetail = useCallback(async (registrationId) => {
    if (!registrationId) return;
    setDetailState((current) => ({ ...current, loading: true, error: "" }));

    try {
      const response = await fetch(`/api/admin/registrations/${registrationId}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setDetailState({ loading: false, data: null, error: data.error || "Unable to load registration detail." });
        return;
      }

      setDetailState({ loading: false, data, error: "" });
      setDetailDraft({
        status: data.registration.status,
        speakerFlag: Boolean(data.registration.speaker_flag),
        vipFlag: Boolean(data.registration.vip_flag),
        reviewNotes: data.registration.review_notes || "",
      });
    } catch {
      setDetailState({ loading: false, data: null, error: "Network error while loading registration detail." });
    }
  }, []);

  useEffect(() => {
    void loadRegistrations();
  }, [loadRegistrations]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (activeRegistrationId) void loadDetail(activeRegistrationId);
  }, [activeRegistrationId, loadDetail]);

  useEffect(() => {
    if (jobsState.selectedJobId) void loadJobDetail(jobsState.selectedJobId);
  }, [jobsState.selectedJobId, loadJobDetail]);

  useEffect(() => {
    const hasActiveJobs = jobsState.jobs.some((job) => ["queued", "processing"].includes(job.status));
    if (!hasActiveJobs) return undefined;

    const timer = window.setInterval(async () => {
      try {
        await fetch("/api/admin/passes/jobs/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
      } catch {
        // Leave polling resilient during peak operations.
      }

      void loadJobs();
      if (jobsState.selectedJobId) void loadJobDetail(jobsState.selectedJobId);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [jobsState.jobs, jobsState.selectedJobId, loadJobDetail, loadJobs]);

  const setFilterValue = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  const toggleSelection = (registrationId) => {
    setSelectedIds((current) => (current.includes(registrationId) ? current.filter((id) => id !== registrationId) : [...current, registrationId]));
  };
  const toggleVisibleSelection = () => {
    const visibleIds = state.registrations.map((registration) => registration.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) => {
      if (allSelected) return current.filter((id) => !visibleIds.includes(id));
      return [...new Set([...current, ...visibleIds])];
    });
  };

  const queueQrJob = async ({ resendExisting = false, registrationIds = [] } = {}) => {
    setActionMessage("");
    try {
      const response = await fetch("/api/admin/passes/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters, registrationIds, resendExisting }),
      });
      const data = await response.json();
      if (!response.ok) {
        setActionMessage(data.error || "Unable to queue QR email job.");
        return;
      }

      setActionMessage(data.message || "QR email job queued.");
      void loadJobs();
      void loadRegistrations();
    } catch {
      setActionMessage("Network error while queueing QR email job.");
    }
  };

  const bulkUpdateStatus = async (nextStatus) => {
    if (!selectedIds.length) {
      setActionMessage("Select at least one registrant before running a bulk status update.");
      return;
    }

    try {
      await Promise.all(
        selectedIds.map((registrationId) =>
          fetch("/api/admin/registrations/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ registrationId, status: nextStatus, reviewNotes: "", speakerFlag: false, vipFlag: false }),
          }),
        ),
      );
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
      const response = await fetch("/api/admin/registrations/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId,
          status: detailDraft.status,
          speakerFlag: detailDraft.speakerFlag,
          vipFlag: detailDraft.vipFlag,
          reviewNotes: detailDraft.reviewNotes,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setActionMessage(data.error || "Unable to save registration review.");
        return;
      }

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
      const response = await fetch("/api/admin/registrations/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, templateType }),
      });
      const data = await response.json();
      if (!response.ok) {
        setActionMessage(data.error || "Unable to resend attendee email.");
        return;
      }

      setActionMessage(data.result?.queued ? "QR resend queued in the background." : data.result?.sent ? "Attendee email resent." : "Attendee email action completed.");
      void loadJobs();
      void loadDetail(registrationId);
    } catch {
      setActionMessage("Network error while resending attendee email.");
    }
  };

  const processJob = async (jobId = "") => {
    try {
      await fetch("/api/admin/passes/jobs/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      void loadJobs();
      if (jobId) void loadJobDetail(jobId);
    } catch {
      setActionMessage("Unable to process QR delivery job right now.");
    }
  };

  const retryJob = async (jobId) => {
    try {
      await fetch(`/api/admin/passes/jobs/${jobId}/retry`, { method: "POST" });
      void loadJobs();
      void loadJobDetail(jobId);
    } catch {
      setActionMessage("Unable to retry failed QR delivery items.");
    }
  };
  const activeRegistration = detailState.data?.registration;

  return (
    <div className="space-y-6">
      <section className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.1)] dark:border-slate-800 dark:bg-slate-900/75">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Operator Session</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Peak-Hour Registration Console</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Signed in as {operator.displayName} ({operator.primaryEmail}) | Role: {operator.role}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => queueQrJob({ registrationIds: selectedIds })} disabled={state.loading || hasConfigError} className="h-11 rounded-full bg-[#4c1d95] px-5 text-sm font-semibold text-white transition hover:bg-[#5b21b6] disabled:cursor-not-allowed disabled:opacity-70">
              Queue QR Email
            </button>
            <button type="button" onClick={() => queueQrJob({ registrationIds: selectedIds, resendExisting: true })} disabled={state.loading || hasConfigError} className="h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200">
              Resend Issued QR
            </button>
            <a href="/admin/check-in" className="inline-flex h-11 items-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200">
              Open Check-In Console
            </a>
            <a href="/api/admin/badges/export?format=csv" className="inline-flex h-11 items-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200">
              Export CSV
            </a>
          </div>
        </div>
      </section>

      {actionMessage ? <AlertPanel title="Admin Queue Status" description={actionMessage} tone={getBatchStatusTone(actionMessage)} /> : null}
      {hasConfigError ? <AlertPanel title="Supabase Admin Configuration Required" description="This dashboard cannot load registrants or issue QR passes until SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured." tone="danger" /> : null}

      {state.summary ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Pending Review" value={state.summary.pending} accent="bg-amber-500" />
          <SummaryCard label="Confirmed" value={state.summary.confirmed} accent="bg-emerald-500" />
          <SummaryCard label="QR Issued" value={state.summary.qrIssued} accent="bg-violet-500" />
          <SummaryCard label="Checked In" value={state.summary.checkedIn} accent="bg-sky-500" />
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <section className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Bulk Operations</p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Queue-first review workflow</h3>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>{selectionSummary.selectedLabel}</span>
                <span>{selectionSummary.matchedLabel}</span>
                <span>{selectionSummary.actionScopeLabel}</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Search
                <input value={filters.search} onChange={(event) => setFilterValue("search", event.target.value)} className="h-11 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-950" placeholder="Name, email, code, organization" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Status
                <select value={filters.status} onChange={(event) => setFilterValue("status", event.target.value)} className="h-11 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-950">
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="waitlisted">Waitlisted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Category
                <select value={filters.category} onChange={(event) => setFilterValue("category", event.target.value)} className="h-11 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-950">
                  <option value="all">All categories</option>
                  {ATTENDEE_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Priority Tier
                <select value={filters.priorityTier} onChange={(event) => setFilterValue("priorityTier", event.target.value)} className="h-11 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-950">
                  <option value="all">All tiers</option>
                  {PRIORITY_TIERS.map((tier) => <option key={tier} value={tier}>{tier}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Country
                <input value={filters.country} onChange={(event) => setFilterValue("country", event.target.value)} className="h-11 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-950" placeholder="Country" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Organization
                <input value={filters.organization} onChange={(event) => setFilterValue("organization", event.target.value)} className="h-11 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-950" placeholder="Organization" />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => bulkUpdateStatus("confirmed")} className="h-10 rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200">Mark Confirmed</button>
              <button type="button" onClick={() => bulkUpdateStatus("waitlisted")} className="h-10 rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200">Mark Waitlisted</button>
              <button type="button" onClick={() => bulkUpdateStatus("rejected")} className="h-10 rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200">Mark Rejected</button>
            </div>
          </section>

          <section className="rounded-[10px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/70">
            <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900/95">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Review Queue</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Rapid approvals, QR scheduling, and check-in readiness.</p>
              </div>
              <button type="button" onClick={toggleVisibleSelection} className="h-10 rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200">
                {state.registrations.length > 0 && state.registrations.every((registration) => selectedIds.includes(registration.id)) ? "Clear visible" : "Select visible"}
              </button>
            </div>

            {state.error && !hasConfigError ? <AlertPanel title="Dashboard Error" description={state.error} tone="danger" /> : null}
            {state.loading ? <AlertPanel title="Loading Queue" description="Fetching the latest registration queue and summary counts." /> : null}

            <div className="overflow-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-950/70">
                  <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    <th className="px-4 py-3"><input type="checkbox" checked={state.registrations.length > 0 && state.registrations.every((registration) => selectedIds.includes(registration.id))} onChange={toggleVisibleSelection} /></th>
                    <th className="px-4 py-3">Registrant</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">QR</th>
                    <th className="px-4 py-3">Check-In</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {state.registrations.map((registration) => (
                    <tr key={registration.id} className={`cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-950/40 ${activeRegistrationId === registration.id ? "bg-violet-50/50 dark:bg-violet-950/10" : ""}`} onClick={() => setActiveRegistrationId(registration.id)}>
                      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.includes(registration.id)} onChange={() => toggleSelection(registration.id)} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{registration.first_name} {registration.last_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{registration.registration_code} | {registration.organization}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge tone={registration.status === "confirmed" ? "success" : registration.status === "pending" ? "warning" : "danger"}>{registration.status}</StatusBadge></td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{registration.attendee_category}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{registration.priority_tier}</td>
                      <td className="px-4 py-3">{registration.qr_pass_issued_at ? <StatusBadge tone="accent">Issued</StatusBadge> : <StatusBadge tone="default">Pending</StatusBadge>}</td>
                      <td className="px-4 py-3">{registration.checked_in_at ? <StatusBadge tone="success">Checked in</StatusBadge> : <StatusBadge tone="default">Pending</StatusBadge>}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(registration.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!state.loading && !state.error && !hasConfigError && state.registrations.length === 0 ? <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No registrations match the current filters.</div> : null}

            {state.pagination ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
                <p>Page {state.pagination.page} of {state.pagination.totalPages}</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setFilters((current) => ({ ...current, page: Math.max(current.page - 1, 1) }))} disabled={state.pagination.page <= 1} className="h-10 rounded-full border border-slate-300 px-4 font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200">Previous</button>
                  <button type="button" onClick={() => setFilters((current) => ({ ...current, page: Math.min(current.page + 1, state.pagination.totalPages) }))} disabled={state.pagination.page >= state.pagination.totalPages} className="h-10 rounded-full border border-slate-300 px-4 font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200">Next</button>
                </div>
              </div>
            ) : null}
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Delivery Jobs</p>
                <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">Background QR mailings</h3>
              </div>
              {jobsState.jobs.map((job) => (
                <button key={job.id} type="button" onClick={() => setJobsState((current) => ({ ...current, selectedJobId: job.id }))} className={`w-full rounded-[10px] border p-4 text-left shadow-sm transition ${jobsState.selectedJobId === job.id ? "border-violet-300 bg-violet-50/70 dark:border-violet-700 dark:bg-violet-950/20" : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/70"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">QR Delivery Job</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{job.id.slice(0, 8)}...</p>
                    </div>
                    <StatusBadge tone={jobTone(job)}>{job.status}</StatusBadge>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-[#4c1d95]" style={{ width: progressWidth(job.progress) }} /></div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-600 dark:text-slate-400 sm:grid-cols-2">
                    <p>{job.progress?.completed || 0} completed</p>
                    <p>{job.progress?.remaining || 0} remaining</p>
                    <p>{job.failed_items || 0} failed</p>
                    <p>{job.retrying_items || 0} retrying</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["queued", "processing"].includes(job.status) ? <span onClick={(event) => { event.stopPropagation(); void processJob(job.id); }} className="inline-flex h-9 cursor-pointer items-center rounded-full bg-[#4c1d95] px-4 text-xs font-semibold text-white">Process Now</span> : null}
                    {job.failed_items > 0 ? <span onClick={(event) => { event.stopPropagation(); void retryJob(job.id); }} className="inline-flex h-9 cursor-pointer items-center rounded-full border border-slate-300 px-4 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Retry Failed</span> : null}
                  </div>
                </button>
              ))}
              {!jobsState.loading && jobsState.jobs.length === 0 ? <div className="rounded-[10px] border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">No QR delivery jobs yet. Queue one from the selected attendees or current filters.</div> : null}
            </div>

            <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Selected Job</p>
                  <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">{jobsState.selectedDetail?.job?.id || "Pick a job"}</h3>
                </div>
                {jobsState.selectedDetail?.job ? <StatusBadge tone={jobTone(jobsState.selectedDetail.job)}>{jobsState.selectedDetail.job.status}</StatusBadge> : null}
              </div>
              {jobsState.selectedDetail?.job ? (
                <>
                  <div className="mt-4 grid gap-4 text-sm text-slate-600 dark:text-slate-400 md:grid-cols-4">
                    <p>Total: {jobsState.selectedDetail.job.total_items}</p>
                    <p>Sent: {jobsState.selectedDetail.job.sent_items}</p>
                    <p>Skipped: {jobsState.selectedDetail.job.skipped_items}</p>
                    <p>Failed: {jobsState.selectedDetail.job.failed_items}</p>
                  </div>
                  <div className="mt-4 max-h-72 overflow-auto rounded-[10px] border border-slate-200 dark:border-slate-800">
                    <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                      <thead className="bg-slate-50 dark:bg-slate-950/70">
                        <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                          <th className="px-4 py-3">Registrant</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Attempts</th>
                          <th className="px-4 py-3">Issue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {(jobsState.selectedDetail.items || []).map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                              <p className="font-semibold">{item.registration?.first_name} {item.registration?.last_name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{item.registration?.registration_code} | {item.registration?.organization}</p>
                            </td>
                            <td className="px-4 py-3"><StatusBadge tone={item.status === "sent" ? "success" : item.status === "failed" ? "danger" : "warning"}>{item.status}</StatusBadge></td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.attempt_count}/{item.max_attempts}</td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.failure_reason || "None"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Select a job to inspect recent delivery attempts.</p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          {detailState.error ? <AlertPanel title="Registrant Detail Error" description={detailState.error} tone="danger" /> : null}
          {detailState.loading ? <AlertPanel title="Loading Registrant" description="Fetching notes, email history, and QR status." /> : null}
          <aside className="sticky top-28 rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/70">
            {activeRegistration ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone="accent">{activeRegistration.registration_code}</StatusBadge>
                  <StatusBadge tone={activeRegistration.status === "confirmed" ? "success" : activeRegistration.status === "pending" ? "warning" : "danger"}>{activeRegistration.status}</StatusBadge>
                  {activeRegistration.qr_pass_issued_at ? <StatusBadge tone="accent">QR issued</StatusBadge> : null}
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">{activeRegistration.first_name} {activeRegistration.last_name}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{activeRegistration.organization} | {activeRegistration.designation}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{activeRegistration.email}</p>
                </div>
                <div className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <p>Category: {activeRegistration.attendee_category}</p>
                  <p>Priority: {activeRegistration.priority_tier}</p>
                  <p>Checked in: {formatDate(activeRegistration.checked_in_at)}</p>
                  <p>QR issued: {formatDate(activeRegistration.qr_pass_issued_at)}</p>
                </div>
                <div className="mt-6 grid gap-4">
                  <label className="flex flex-col gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Status
                    <select value={detailDraft.status} onChange={(event) => setDetailDraft((current) => ({ ...current, status: event.target.value }))} className="h-11 rounded-[10px] border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-950">
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="waitlisted">Waitlisted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                      <input type="checkbox" checked={detailDraft.speakerFlag} onChange={(event) => setDetailDraft((current) => ({ ...current, speakerFlag: event.target.checked }))} />
                      Speaker
                    </label>
                    <label className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                      <input type="checkbox" checked={detailDraft.vipFlag} onChange={(event) => setDetailDraft((current) => ({ ...current, vipFlag: event.target.checked }))} />
                      VIP
                    </label>
                  </div>
                  <label className="flex flex-col gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Review notes
                    <textarea value={detailDraft.reviewNotes} onChange={(event) => setDetailDraft((current) => ({ ...current, reviewNotes: event.target.value }))} className="min-h-28 rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={saveDetailStatus} disabled={savingDetail} className="h-11 rounded-full bg-[#4c1d95] px-5 text-sm font-semibold text-white transition hover:bg-[#5b21b6] disabled:opacity-70">{savingDetail ? "Saving..." : "Save Review"}</button>
                    <button type="button" onClick={() => queueQrJob({ registrationIds: [activeRegistration.id] })} className="h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200">Queue QR Email</button>
                    <button type="button" onClick={resendDetailEmail} className="h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200">Resend Update</button>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Status History</p>
                    <div className="mt-3 space-y-3">
                      {(detailState.data?.history || []).map((item) => (
                        <div key={item.id} className="rounded-[10px] border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/60">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{item.action_type}</p>
                          <p className="mt-1 text-slate-600 dark:text-slate-400">{item.notes || "No notes"}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">{formatDate(item.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Email Timeline</p>
                    <div className="mt-3 space-y-3">
                      {(detailState.data?.notifications || []).map((item) => (
                        <div key={item.id} className="rounded-[10px] border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/60">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold capitalize text-slate-900 dark:text-slate-100">{item.template_type.replaceAll("_", " ")}</p>
                            <StatusBadge tone={item.delivery_status === "failed" ? "danger" : item.delivery_status === "sent" || item.delivery_status === "resent" ? "success" : "warning"}>{item.delivery_status}</StatusBadge>
                          </div>
                          <p className="mt-1 text-slate-600 dark:text-slate-400">{item.failure_reason || item.recipient_email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Select a registrant from the queue to review notes, email activity, and QR delivery actions.</p>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
