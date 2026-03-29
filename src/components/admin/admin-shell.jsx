"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Users, Send, ScanLine, ChevronRight } from "lucide-react";
import { buildAdminNavigation, buildAdminStatPills } from "@/lib/admin-shell-utils.cjs";
import { AdminStatusBadge } from "@/components/admin/admin-ui";

const NAV_ICONS = {
  "/admin/registrations": Users,
  "/admin/delivery": Send,
  "/admin/check-in": ScanLine,
};

function TopStatPill({ label, value, tone = "default" }) {
  const toneClasses = {
    default: "border-slate-200 bg-white text-slate-600",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    danger: "border-rose-200 bg-rose-50 text-rose-700",
    accent: "border-violet-200 bg-violet-50 text-violet-800",
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${toneClasses[tone] || toneClasses.default}`}>
      <span className="font-medium opacity-70">{label}</span>
      <span className="font-bold tabular-nums">{value}</span>
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
      if (document.hidden) return;
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
    }, 30000);

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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="hidden border-r border-slate-200 bg-white lg:flex lg:flex-col">
          {/* Logo */}
          <div className="border-b border-slate-200 px-5 py-5">
            <Image src="/img/tasi-csr-logo.png" alt="TASI" width={120} height={36} className="object-contain" />
          </div>

          {/* Nav */}
          <nav className="flex flex-1 flex-col gap-6 px-3 py-4">
            {navSections.map((section) => (
              <div key={section.key}>
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{section.label}</p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = NAV_ICONS[item.href];
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                          item.active
                            ? "bg-amber-50 font-semibold text-amber-700"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          {Icon ? <Icon className={`h-4 w-4 shrink-0 ${item.active ? "text-amber-600" : "text-slate-400"}`} /> : null}
                          {item.label}
                        </span>
                        {item.showBadge ? (
                          <AdminStatusBadge tone={item.badgeTone}>{item.badgeCount}</AdminStatusBadge>
                        ) : item.active ? (
                          <ChevronRight className="h-3.5 w-3.5 text-amber-500" />
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Event info */}
            <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Event</p>
              <p className="mt-1.5 text-sm font-semibold text-slate-800">Trust & Safety India Festival</p>
              <p className="mt-0.5 text-xs text-slate-500">13–14 October 2026</p>
            </div>

            {/* Operator info */}
            <div className="flex items-center gap-3 border-t border-slate-200 pt-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                {getInitials(operator.displayName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{operator.displayName}</p>
                <p className="truncate text-[11px] text-slate-400">{operator.primaryEmail}</p>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main area */}
        <div className="min-w-0">
          {/* Sticky header */}
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
              {/* Page title derived from currentPath */}
              <p className="text-sm font-semibold text-slate-700">
                {currentPath === "/admin/registrations" || currentPath === "/admin"
                  ? "Review Queue"
                  : currentPath === "/admin/delivery"
                    ? "Delivery Jobs"
                    : currentPath === "/admin/check-in"
                      ? "Check-In Console"
                      : "Admin"}
              </p>

              {/* Stat pills */}
              <div className="hidden items-center gap-2 md:flex">
                {statPills.map((pill) => (
                  <TopStatPill key={pill.key} label={pill.label} value={pill.value} tone={pill.tone} />
                ))}
              </div>
            </div>

            {/* Mobile nav tabs */}
            <div className="flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden">
              {navSections.flatMap((section) =>
                section.items.map((item) => {
                  const Icon = NAV_ICONS[item.href];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm whitespace-nowrap ${
                        item.active
                          ? "border-amber-200 bg-amber-50 font-semibold text-amber-700"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
                      {item.label}
                      {item.showBadge ? (
                        <AdminStatusBadge tone={item.badgeTone}>{item.badgeCount}</AdminStatusBadge>
                      ) : null}
                    </Link>
                  );
                }),
              )}
            </div>
          </header>

          <main className="px-4 py-6 lg:px-6 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
