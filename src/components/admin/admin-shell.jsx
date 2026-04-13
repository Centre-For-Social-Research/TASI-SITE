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
  Moon,
  Sun,
  LayoutDashboard,
} from 'lucide-react';
import { useTheme } from 'next-themes';
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

const PAGE_TITLES = {
  '/admin/registrations': 'Review Queue',
  '/admin': 'Review Queue',
  '/admin/delivery': 'Delivery Jobs',
  '/admin/check-in': 'Check-In Console',
  '/admin/tickets': 'Ticketing',
};

function TopStatPill({ label, value, tone = 'default' }) {
  const toneClasses = {
    default:
      'border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300',
    warning:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
    danger:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
    accent:
      'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs backdrop-blur-sm ${toneClasses[tone] || toneClasses.default}`}
    >
      <span className="font-medium opacity-70">{label}</span>
      <span className="font-bold tabular-nums">{value}</span>
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-8 w-8" />;

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
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

  const pageTitle = PAGE_TITLES[currentPath] || 'Admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 text-slate-900 dark:from-[#060c1a] dark:via-[#0a1128] dark:to-[#0d1526] dark:text-slate-100">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[272px_minmax(0,1fr)]">
        {/* ─── Sidebar ─── */}
        <aside className="hidden lg:flex lg:flex-col border-r border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-white/[0.06] dark:bg-white/[0.02]">
          {/* Logo */}
          <div className="px-6 py-5">
            <Link href="/" className="inline-block">
              <Image
                src="/img/tasi-csr-logo.png"
                alt="TASI"
                width={120}
                height={36}
                className="object-contain dark:brightness-90"
              />
            </Link>
          </div>

          {/* Search */}
          <div className="px-4">
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-200/40 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-indigo-500/40 dark:focus-within:ring-indigo-500/20">
              <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              <span className="text-sm text-slate-400 dark:text-slate-500">Search…</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-1 flex-col gap-5 px-3 pt-5 pb-4">
            {navSections.map((section) => (
              <div key={section.key}>
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = NAV_ICONS[item.href];
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all ${
                          item.active
                            ? 'bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent font-semibold text-indigo-600 dark:from-indigo-500/15 dark:text-indigo-400'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-slate-100'
                        }`}
                      >
                        {item.active && (
                          <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-indigo-500" />
                        )}
                        <span className="flex items-center gap-2.5">
                          {Icon ? (
                            <Icon
                              className={`h-[18px] w-[18px] shrink-0 ${item.active ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`}
                            />
                          ) : null}
                          {item.label}
                        </span>
                        {item.showBadge ? (
                          <AdminStatusBadge tone={item.badgeTone}>
                            {item.badgeCount}
                          </AdminStatusBadge>
                        ) : item.active ? (
                          <ChevronRight className="h-3.5 w-3.5 text-indigo-400/60" />
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Event card */}
            <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4 dark:border-white/[0.06] dark:from-indigo-500/[0.06] dark:via-transparent dark:to-violet-500/[0.04]">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-500/80 dark:text-indigo-400/70">
                Event
              </p>
              <p className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                Trust &amp; Safety India Festival
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                13–14 October 2026
              </p>
            </div>

            {/* Operator info */}
            <div className="flex items-center gap-3 border-t border-slate-200/70 pt-4 dark:border-white/[0.06]">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white shadow-md shadow-indigo-500/20">
                  {getInitials(operator.displayName)}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[#0d1526]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                  {operator.displayName}
                </p>
                <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
                  {operator.primaryEmail}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:text-slate-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </nav>
        </aside>

        {/* ─── Main area ─── */}
        <div className="min-w-0 flex flex-col">
          {/* Sticky header */}
          <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0a1128]/80">
            <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
              {/* Breadcrumb + page title */}
              <div className="flex items-center gap-2 text-sm">
                <LayoutDashboard className="hidden h-4 w-4 text-slate-400 dark:text-slate-500 sm:block" />
                <span className="hidden text-slate-400 dark:text-slate-500 sm:inline">Admin</span>
                <ChevronRight className="hidden h-3 w-3 text-slate-300 dark:text-slate-600 sm:block" />
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {pageTitle}
                </span>
              </div>

              {/* Stat pills + actions */}
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
                <div className="flex items-center gap-1 border-l border-slate-200 pl-2 dark:border-white/10">
                  <ThemeToggle />
                  <button
                    type="button"
                    className="relative flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200"
                    aria-label="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0a1128]" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-500 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 lg:hidden"
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mobile nav tabs */}
            <div className="flex gap-1.5 overflow-x-auto px-3 pb-2.5 lg:hidden">
              {navSections.flatMap((section) =>
                section.items.map((item) => {
                  const Icon = NAV_ICONS[item.href];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm whitespace-nowrap transition ${
                        item.active
                          ? 'border-indigo-200 bg-indigo-50 font-semibold text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400'
                          : 'border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
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

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
