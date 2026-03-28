"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ATTENDEE_CATEGORIES, PRIORITY_TIERS } from "@/lib/registration-constants";
import dashboardUtils from "@/lib/admin-dashboard-utils.cjs";

const { isSupabaseAdminConfigError, getBatchStatusTone } = dashboardUtils;

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
  };

  return (
    <div className={`rounded-[10px] border p-4 shadow-sm ${toneMap[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em]">{title}</p>
      <p className="mt-2 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function RegistrationRow({ registration, onRefresh }) {
  const [status, setStatus] = useState(registration.status);
  const [speakerFlag, setSpeakerFlag] = useState(Boolean(registration.speaker_flag));
  const [vipFlag, setVipFlag] = useState(Boolean(registration.vip_flag));
  const [reviewNotes, setReviewNotes] = useState(registration.review_notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [resendType, setResendType] = useState(registration.qr_pass_issued_at ? "qr_pass_issued" : registration.status);

  async function saveStatus() {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/registrations/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: registration.id,
          status,
          speakerFlag,
          vipFlag,
          reviewNotes,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Unable to save.");
        return;
      }

      setMessage(data.emailResult?.sent ? "Saved and email sent." : "Saved. Email can be resent if needed.");
      setResendType(data.registration.qr_pass_issued_at ? "qr_pass_issued" : data.registration.status);
      onRefresh();
    } catch {
      setMessage("Network error.");
    } finally {
      setIsSaving(false);
    }
  }

  async function resendEmail() {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/registrations/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: registration.id,
          templateType: resendType,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Unable to resend email.");
        return;
      }

      setMessage(data.result?.sent ? "Email resent." : data.result?.error || "Email resend attempted.");
      onRefresh();
    } catch {
      setMessage("Network error.");
    } finally {
      setIsSaving(false);
    }
  }

  async function generateAndSendQr() {
    if (status !== "confirmed") {
      setMessage("Save a confirmed status before generating and sending a QR pass.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/registrations/issue-pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: registration.id,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Unable to generate and send the QR pass.");
        return;
      }

      setResendType("qr_pass_issued");
      setMessage(
        data.emailResult?.sent
          ? data.created
            ? "QR pass generated and emailed."
            : "Existing QR pass emailed again."
          : data.emailResult?.error || "QR pass was prepared, but the email could not be sent.",
      );
      onRefresh();
    } catch {
      setMessage("Network error.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:bg-amber-500/15 dark:text-amber-200">
              {registration.registration_code}
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {registration.status}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {registration.first_name} {registration.last_name}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {registration.organization} | {registration.designation}
            </p>
          </div>
          <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-400 md:grid-cols-2">
            <p>{registration.email}</p>
            <p>{registration.phone}</p>
            <p>{registration.attendee_category}</p>
            <p>
              {registration.priority_tier} | {registration.city}, {registration.country}
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-500">
            Badge colour: {registration.badge_color_label}
            {registration.exception_badge_required ? " | Exception badge desk" : ""}
            {registration.checked_in_at ? " | Checked in" : ""}
          </p>
        </div>

        <div className="grid gap-4 xl:w-[410px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Status
              <select
                className="h-11 rounded-[10px] border border-slate-200 bg-slate-50 px-3 text-sm font-medium dark:border-slate-700 dark:bg-slate-950"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Resend template
              <select
                className="h-11 rounded-[10px] border border-slate-200 bg-slate-50 px-3 text-sm font-medium dark:border-slate-700 dark:bg-slate-950"
                value={resendType}
                onChange={(event) => setResendType(event.target.value)}
              >
                <option value="submission_received">Submission received</option>
                <option value="confirmed">Confirmed</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="rejected">Rejected</option>
                <option value="qr_pass_issued">QR pass issued</option>
              </select>
            </label>
          </div>

          <div className="grid gap-2 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-950/70">
              <input type="checkbox" checked={speakerFlag} onChange={(event) => setSpeakerFlag(event.target.checked)} />
              Mark as Speaker
            </label>
            <label className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-950/70">
              <input type="checkbox" checked={vipFlag} onChange={(event) => setVipFlag(event.target.checked)} />
              Mark as VIP
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Review notes
            <textarea
              value={reviewNotes}
              onChange={(event) => setReviewNotes(event.target.value)}
              className="min-h-28 rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={saveStatus}
              disabled={isSaving}
              className="h-11 rounded-full bg-[#4c1d95] px-5 text-sm font-semibold text-white transition hover:bg-[#5b21b6] disabled:opacity-70"
            >
              {isSaving ? "Saving..." : "Save Review"}
            </button>
            <button
              type="button"
              onClick={generateAndSendQr}
              disabled={isSaving}
              className="h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200"
            >
              Generate + Send QR
            </button>
            <button
              type="button"
              onClick={resendEmail}
              disabled={isSaving}
              className="h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200"
            >
              Resend Email
            </button>
          </div>

          {message ? <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p> : null}
        </div>
      </div>
    </article>
  );
}

export default function RegistrationsAdminPanel({ operator }) {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    category: "all",
    priorityTier: "all",
  });
  const [state, setState] = useState({
    loading: true,
    registrations: [],
    summary: null,
    error: "",
  });
  const [batchMessage, setBatchMessage] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    return params.toString();
  }, [filters]);

  const hasConfigError = isSupabaseAdminConfigError(state.error) || isSupabaseAdminConfigError(batchMessage);

  const loadRegistrations = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));

    try {
      const response = await fetch(`/api/admin/registrations?${queryString}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setState({ loading: false, registrations: [], summary: null, error: data.error || "Unable to load registrations." });
        return;
      }

      setState({
        loading: false,
        registrations: data.registrations || [],
        summary: data.summary,
        error: "",
      });
    } catch {
      setState({ loading: false, registrations: [], summary: null, error: "Network error." });
    }
  }, [queryString]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRegistrations();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadRegistrations]);

  async function issueBatch() {
    setBatchMessage("");
    try {
      const response = await fetch("/api/admin/passes/issue-batch", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        setBatchMessage(data.error || "Unable to issue QR passes.");
        return;
      }

      setBatchMessage(`Processed ${data.total} confirmed attendees for QR issuance.`);
      loadRegistrations();
    } catch {
      setBatchMessage("Network error while issuing QR passes.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.1)] dark:border-slate-800 dark:bg-slate-900/75">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Operator Session</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              TASI 2026 Registration Review
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Signed in as {operator.displayName} ({operator.primaryEmail}) | Role: {operator.role}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={issueBatch}
              disabled={state.loading || hasConfigError}
              className="h-11 rounded-full bg-[#4c1d95] px-5 text-sm font-semibold text-white transition hover:bg-[#5b21b6] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Issue QR Pass Batch
            </button>
            <a
              href="/admin/check-in"
              className="inline-flex h-11 items-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200"
            >
              Open Check-In Console
            </a>
            <a
              href="/api/admin/badges/export?format=csv"
              className="inline-flex h-11 items-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200"
            >
              Export CSV
            </a>
            <a
              href="/api/admin/badges/export?format=xlsx"
              className="inline-flex h-11 items-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200"
            >
              Export Excel
            </a>
            <a
              href="/api/admin/badges/export?format=pdf"
              className="inline-flex h-11 items-center rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-200"
            >
              Export PDF Merge
            </a>
          </div>
        </div>
      </section>

      {batchMessage ? (
        <AlertPanel
          title={getBatchStatusTone(batchMessage) === "danger" ? "QR Pass Batch Issue" : "QR Pass Batch Status"}
          description={batchMessage}
          tone={getBatchStatusTone(batchMessage)}
        />
      ) : null}

      {hasConfigError ? (
        <AlertPanel
          title="Supabase Admin Configuration Required"
          description="This dashboard cannot load registrants or issue QR passes until SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured in the deployment environment."
          tone="danger"
        />
      ) : null}

      {state.summary ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Pending Review" value={state.summary.pending} accent="bg-amber-500" />
          <SummaryCard label="Confirmed" value={state.summary.confirmed} accent="bg-emerald-500" />
          <SummaryCard label="QR Issued" value={state.summary.qrIssued} accent="bg-violet-500" />
          <SummaryCard label="Exception Badges" value={state.summary.exceptionBadges} accent="bg-rose-500" />
        </section>
      ) : null}

      <section className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900/70">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Find and Filter</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">Focus the review queue</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Search
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              className="h-11 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-950"
              placeholder="Name, email, code, organization"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Status
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              className="h-11 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Category
            <select
              value={filters.category}
              onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
              className="h-11 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="all">All categories</option>
              {ATTENDEE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Priority Tier
            <select
              value={filters.priorityTier}
              onChange={(event) => setFilters((current) => ({ ...current, priorityTier: event.target.value }))}
              className="h-11 rounded-[10px] border border-slate-200 bg-slate-50 px-4 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="all">All tiers</option>
              {PRIORITY_TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {state.error && !hasConfigError ? (
        <AlertPanel title="Dashboard Error" description={state.error} tone="danger" />
      ) : null}

      {state.loading ? (
        <AlertPanel
          title="Loading Dashboard"
          description="Fetching registrations and preparing the latest review summary."
        />
      ) : null}

      <section className="space-y-4">
        {state.registrations.map((registration) => (
          <RegistrationRow key={registration.id} registration={registration} onRefresh={loadRegistrations} />
        ))}
        {!state.loading && !state.error && !hasConfigError && state.registrations.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
            No registrations match the current filters.
          </div>
        ) : null}
      </section>
    </div>
  );
}
