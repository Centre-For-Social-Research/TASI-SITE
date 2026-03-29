"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildAdminNavigation, buildAdminStatPills } from "@/lib/admin-shell-utils.cjs";
import { AdminStatusBadge } from "@/components/admin/admin-ui";

function TopStatPill({ label, value, tone = "default" }) {
  const toneClasses = {
    default: "border-stone-200 bg-white text-slate-700",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    danger: "border-rose-200 bg-rose-50 text-rose-800",
    accent: "border-violet-200 bg-violet-50 text-violet-800",
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${toneClasses[tone] || toneClasses.default}`}>
      <span className="font-admin-mono text-[10px] uppercase tracking-[0.14em] opacity-70">{label}</span>
      <span className="font-admin-display text-sm leading-none">{value}</span>
    </div>
  );
}

function getInitials(name) {
  return String(name || "Operator")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export default function AdminShell({ operator, currentPath, children }) {
  const [shellState, setShellState] = useState({
    summary: { pending: 0, confirmed: 0, qrIssued: 0, checkedIn: 0 },
    jobs: [],
  });

  useEffect(() => {
    let cancelled = false;

    async function loadShellData() {
      try {
        const [registrationsResponse, jobsResponse] = await Promise.all([
          fetch("/api/admin/registrations?pageSize=1", { cache: "no-store" }),
          fetch("/api/admin/passes/jobs", { cache: "no-store" }),
        ]);

        const [registrationsData, jobsData] = await Promise.all([
          registrationsResponse.json().catch(() => ({})),
          jobsResponse.json().catch(() => ({})),
        ]);

        if (cancelled) return;

        setShellState({
          summary: registrationsResponse.ok
            ? registrationsData.summary || { pending: 0, confirmed: 0, qrIssued: 0, checkedIn: 0 }
            : { pending: 0, confirmed: 0, qrIssued: 0, checkedIn: 0 },
          jobs: jobsResponse.ok ? jobsData.jobs || [] : [],
        });
      } catch {
        if (!cancelled) {
          setShellState({
            summary: { pending: 0, confirmed: 0, qrIssued: 0, checkedIn: 0 },
            jobs: [],
          });
        }
      }
    }

    void loadShellData();
    const timer = window.setInterval(() => {
      void loadShellData();
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const navSections = useMemo(
    () =>
      buildAdminNavigation({
        pathname: currentPath,
        summary: shellState.summary,
        jobs: shellState.jobs,
      }),
    [currentPath, shellState.jobs, shellState.summary],
  );

  const statPills = useMemo(
    () =>
      buildAdminStatPills({
        summary: shellState.summary,
        jobs: shellState.jobs,
      }),
    [shellState.jobs, shellState.summary],
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ef_0%,#fffdf9_100%)] text-slate-900">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden border-r border-stone-200 bg-[#fcfaf6] lg:flex lg:flex-col">
          <div className="border-b border-stone-200 px-6 py-6">
            <p className="font-admin-display text-3xl leading-none text-slate-900">
              TASI <span className="text-amber-600">2026</span>
            </p>
            <p className="mt-2 text-sm text-slate-500">Admin Console</p>
          </div>

          <nav className="flex flex-1 flex-col gap-8 px-4 py-6">
            {navSections.map((section) => (
              <div key={section.key} className="space-y-2">
                <p className="px-3 font-admin-mono text-[10px] uppercase tracking-[0.22em] text-stone-500">{section.label}</p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 text-sm transition ${
                        item.active
                          ? "border-amber-200 bg-amber-50 text-slate-900 shadow-sm"
                          : "border-transparent text-slate-600 hover:border-stone-200 hover:bg-white hover:text-slate-900"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.showBadge ? <AdminStatusBadge tone={item.badgeTone}>{item.badgeCount}</AdminStatusBadge> : null}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-auto rounded-[24px] border border-stone-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <p className="font-admin-mono text-[10px] uppercase tracking-[0.18em] text-stone-500">Event</p>
              <p className="mt-3 font-admin-display text-xl text-slate-900">Trust & Safety India Festival</p>
              <p className="mt-2 text-sm text-slate-500">13-14 October 2026</p>
            </div>
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-40 border-b border-stone-200 bg-[rgba(255,253,249,0.94)] backdrop-blur">
            <div className="flex flex-col gap-4 px-4 py-4 lg:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full border border-amber-200 bg-amber-50 text-center font-admin-display text-lg leading-[42px] text-amber-700">
                    {getInitials(operator.displayName)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{operator.displayName}</p>
                    <p className="text-xs text-slate-500">
                      {operator.primaryEmail} · {operator.role}
                    </p>
                  </div>
                </div>

                <div className="hidden items-center gap-2 border-l border-stone-200 pl-4 md:flex">
                  {statPills.map((pill) => (
                    <TopStatPill key={pill.key} label={pill.label} value={pill.value} tone={pill.tone} />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
                {navSections.flatMap((section) =>
                  section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm whitespace-nowrap ${
                        item.active
                          ? "border-amber-200 bg-amber-50 text-slate-900"
                          : "border-stone-200 bg-white text-slate-600"
                      }`}
                    >
                      {item.label}
                      {item.showBadge ? <AdminStatusBadge tone={item.badgeTone}>{item.badgeCount}</AdminStatusBadge> : null}
                    </Link>
                  )),
                )}
              </div>
            </div>
          </header>

          <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
