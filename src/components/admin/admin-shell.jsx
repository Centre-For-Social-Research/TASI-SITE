"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildAdminNavigation, buildAdminStatPills } from "@/lib/admin-shell-utils.cjs";
import { AdminStatusBadge } from "@/components/admin/admin-ui";

function TopStatPill({ label, value, tone = "default" }) {
  const toneClasses = {
    default: "border-[#343841] bg-[#17191f] text-[#d7dae2]",
    warning: "border-[#5f4b21] bg-[#2f2410] text-[#f1c36a]",
    success: "border-[#21493d] bg-[#112920] text-[#74d1b5]",
    danger: "border-[#5a2929] bg-[#281314] text-[#f29191]",
    accent: "border-[#5f5337] bg-[#211c12] text-[#d9bf84]",
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

        if (cancelled) {
          return;
        }

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
    <div className="min-h-screen bg-[#0b0c0f] text-[#edf0f6]">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#23262d] bg-[#111318] lg:flex lg:flex-col">
          <div className="border-b border-[#23262d] px-6 py-6">
            <p className="font-admin-display text-3xl leading-none text-[#f7f3e8]">TASI <span className="text-[#c8a96e]">2026</span></p>
            <p className="mt-2 text-sm text-[#8d93a5]">Admin Console</p>
          </div>

          <nav className="flex flex-1 flex-col gap-8 px-4 py-6">
            {navSections.map((section) => (
              <div key={section.key} className="space-y-2">
                <p className="px-3 font-admin-mono text-[10px] uppercase tracking-[0.22em] text-[#6f778a]">{section.label}</p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition ${
                        item.active
                          ? "border-[#4b4435] bg-[#1b1e24] text-[#f5f6f8]"
                          : "border-transparent text-[#9ca3b5] hover:border-[#2f333c] hover:bg-[#17191f] hover:text-[#f5f6f8]"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.showBadge ? <AdminStatusBadge tone={item.badgeTone}>{item.badgeCount}</AdminStatusBadge> : null}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-auto rounded-2xl border border-[#262a31] bg-[#14171d] p-4">
              <p className="font-admin-mono text-[10px] uppercase tracking-[0.18em] text-[#6f778a]">Event</p>
              <p className="mt-3 font-admin-display text-xl text-[#f4f1e8]">Trust & Safety India Festival</p>
              <p className="mt-2 text-sm text-[#8d93a5]">13-14 October 2026</p>
            </div>
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-40 border-b border-[#23262d] bg-[#0f1115]/95 backdrop-blur">
            <div className="flex flex-col gap-4 px-4 py-4 lg:px-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full border border-[#3a3020] bg-[#1f1b14] text-center font-admin-display text-lg leading-[42px] text-[#d4b57b]">
                    {getInitials(operator.displayName)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#f5f6f8]">{operator.displayName}</p>
                    <p className="text-xs text-[#8d93a5]">
                      {operator.primaryEmail} · {operator.role}
                    </p>
                  </div>
                </div>

                <div className="hidden items-center gap-2 border-l border-[#262a31] pl-4 md:flex">
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
                          ? "border-[#4b4435] bg-[#1b1e24] text-[#f5f6f8]"
                          : "border-[#262a31] bg-[#13161b] text-[#9ca3b5]"
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
