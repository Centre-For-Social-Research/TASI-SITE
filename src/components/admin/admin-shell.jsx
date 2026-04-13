'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Users,
  Send,
  ScanLine,
  Ticket,
  ChevronRight,
  LogOut,
  Bell,
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import {
  buildAdminNavigation,
  buildAdminStatPills,
} from '@/lib/admin-shell-utils.cjs';
import { AdminStatusBadge } from '@/components/admin/admin-ui';

const NAV_ICONS = {
  '/admin/registrations': Users,
  '/admin/delivery': Send,
  '/admin/check-in': ScanLine,
  '/admin/tickets': Ticket,
};

function TopStatPill({ label, value, tone = 'default' }) {
  const toneClasses = {
    default: 'border-[#253a5c] bg-[#162040] text-slate-300',
    warning: 'border-amber-700/40 bg-amber-950/30 text-amber-300',
    success: 'border-emerald-700/40 bg-emerald-950/30 text-emerald-300',
    danger: 'border-rose-700/40 bg-rose-950/30 text-rose-300',
    accent: 'border-violet-700/40 bg-violet-950/30 text-violet-300',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${toneClasses[tone] || toneClasses.default}`}
    >
      <span className="font-medium opacity-70">{label}</span>
      <span className="font-bold tabular-nums">{value}</span>
    </div>
  );
}

function getInitials(name) {
  return String(name || 'Operator')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export default function AdminShell({ operator, currentPath, children }) {
  const { signOut } = useClerk();

  async function handleSignOut() {
    await signOut({ redirectUrl: '/' });
  }

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
          fetch('/api/admin/registrations?pageSize=1', { cache: 'no-store' }),
          fetch('/api/admin/passes/jobs', { cache: 'no-store' }),
        ]);

        const [registrationsData, jobsData] = await Promise.all([
          registrationsResponse.json().catch(() => ({})),
          jobsResponse.json().catch(() => ({})),
        ]);

        if (cancelled) return;

        setShellState({
          summary: registrationsResponse.ok
            ? registrationsData.summary || {
                pending: 0,
                confirmed: 0,
                qrIssued: 0,
                checkedIn: 0,
              }
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
    [currentPath, shellState.jobs, shellState.summary]
  );

  const statPills = useMemo(
    () =>
      buildAdminStatPills({
        summary: shellState.summary,
        jobs: shellState.jobs,
      }),
    [shellState.jobs, shellState.summary]
  );

  return (
    <div className="dark min-h-screen bg-[#0b1120] text-slate-100">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="hidden border-r border-[#1a2744] bg-[#0d1526] lg:flex lg:flex-col">
          {/* Logo */}
          <div className="border-b border-[#1a2744] px-5 py-5">
            <Link href="/">
              <Image
                src="/img/tasi-csr-logo.png"
                alt="TASI"
                width={120}
                height={36}
                className="object-contain brightness-90"
              />
            </Link>
          </div>

          {/* Search */}
          <div className="px-4 pt-4">
            <div className="flex items-center gap-2 rounded-lg border border-[#253a5c] bg-[#162040] px-3 py-2">
              <Search className="h-4 w-4 text-[#5a6b8a]" />
              <span className="text-sm text-[#5a6b8a]">Search</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-1 flex-col gap-6 px-3 py-4">
            {navSections.map((section) => (
              <div key={section.key}>
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#5a6b8a]">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = NAV_ICONS[item.href];
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                          item.active
                            ? 'bg-gradient-to-r from-amber-500/15 to-transparent font-semibold text-amber-400'
                            : 'text-slate-400 hover:bg-[#1a2744]/60 hover:text-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          {Icon ? (
                            <Icon
                              className={`h-4 w-4 shrink-0 ${item.active ? 'text-amber-500' : 'text-[#5a6b8a]'}`}
                            />
                          ) : null}
                          {item.label}
                        </span>
                        {item.showBadge ? (
                          <AdminStatusBadge tone={item.badgeTone}>
                            {item.badgeCount}
                          </AdminStatusBadge>
                        ) : item.active ? (
                          <ChevronRight className="h-3.5 w-3.5 text-amber-500/60" />
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
            <div className="rounded-xl border border-[#1e2a45] bg-[#111a2e] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5a6b8a]">
                Event
              </p>
              <p className="mt-1.5 text-sm font-semibold text-slate-100">
                Trust &amp; Safety India Festival
              </p>
              <p className="mt-0.5 text-xs text-[#5a6b8a]">
                13–14 October 2026
              </p>
            </div>

            {/* Operator info */}
            <div className="flex items-center gap-3 border-t border-[#1a2744] pt-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-xs font-bold text-amber-400">
                {getInitials(operator.displayName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-100">
                  {operator.displayName}
                </p>
                <p className="truncate text-[11px] text-[#5a6b8a]">
                  {operator.primaryEmail}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#5a6b8a] transition hover:bg-rose-500/10 hover:text-rose-400"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </nav>
        </aside>

        {/* Main area */}
        <div className="min-w-0">
          {/* Sticky header */}
          <header className="sticky top-0 z-40 border-b border-[#1a2744] bg-[#0d1526]/95 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
              {/* Page title derived from currentPath */}
              <p className="text-sm font-semibold text-slate-200">
                {currentPath === '/admin/registrations' ||
                currentPath === '/admin'
                  ? 'Review Queue'
                  : currentPath === '/admin/delivery'
                    ? 'Delivery Jobs'
                    : currentPath === '/admin/check-in'
                      ? 'Check-In Console'
                      : currentPath === '/admin/tickets'
                        ? 'Ticketing'
                        : 'Admin'}
              </p>

              {/* Stat pills + notification + logout */}
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 md:flex">
                  {statPills.map((pill) => (
                    <TopStatPill
                      key={pill.key}
                      label={pill.label}
                      value={pill.value}
                      tone={pill.tone}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[#5a6b8a] transition hover:bg-[#1a2744] hover:text-slate-200"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5a6b8a] transition hover:bg-rose-500/10 hover:text-rose-400 lg:hidden"
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
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
                          ? 'border-amber-700/40 bg-amber-500/10 font-semibold text-amber-400'
                          : 'border-[#253a5c] bg-[#162040] text-slate-400'
                      }`}
                    >
                      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
                      {item.label}
                      {item.showBadge ? (
                        <AdminStatusBadge tone={item.badgeTone}>
                          {item.badgeCount}
                        </AdminStatusBadge>
                      ) : null}
                    </Link>
                  );
                })
              )}
            </div>
          </header>

          <main className="px-4 py-6 lg:px-6 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
