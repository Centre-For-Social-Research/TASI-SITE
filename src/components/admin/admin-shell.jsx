'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  ShieldCheck,
  Mail,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useClerk } from '@clerk/nextjs';
import {
  buildAdminNavigation,
  buildAdminNotificationId,
  buildAdminNotifications,
  buildAdminStatPills,
  filterUnreadAdminNotifications,
} from '@/lib/admin-shell-utils.cjs';
import {
  buildAdminNotificationStorageKey,
  resolveAdminShellRuntimeState,
} from '@/lib/admin-runtime-guards.cjs';
import { AdminStatusBadge, SlideOverDrawer } from '@/components/admin/admin-ui';
import AdminCommandPalette from '@/components/admin/admin-command-palette';
import { useRouter } from 'next/navigation';

const NAV_ICONS = {
  '/admin/registrations': Users,
  '/admin/delivery': Send,
  '/admin/check-in': ScanLine,
  '/admin/tickets': Ticket,
  '/admin/email-jobs': Mail,
};

const PAGE_TITLES = {
  '/admin/registrations': 'Review Queue',
  '/admin': 'Review Queue',
  '/admin/delivery': 'Delivery Jobs',
  '/admin/check-in': 'Check-In Console',
  '/admin/tickets': 'Ticketing',
  '/admin/email-jobs': 'Registration Emails',
};

function TopStatPill({ label, value, tone = 'default' }) {
  const toneClasses = {
    default:
      'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300',
    warning:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
    danger:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
    accent:
      'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-[10px] border px-3 py-1.5 text-xs shadow-sm backdrop-blur-sm ${
        toneClasses[tone] || toneClasses.default
      }`}
    >
      <span className="font-medium opacity-70">{label}</span>
      <span className="font-bold tabular-nums">{value}</span>
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const currentTheme = theme === 'dark' ? 'dark' : 'light';

  return (
    <button
      type="button"
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      className="flex h-8 w-8 items-center justify-center rounded-[10px] text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-200"
      aria-label="Toggle theme"
      title={
        currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      }
    >
      {currentTheme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}

function NotificationCard({ item, onMarkRead }) {
  return (
    <div className="rounded-[10px] border border-zinc-200 bg-zinc-50 p-4 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {item.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {item.detail}
          </p>
        </div>
        <AdminStatusBadge tone={item.tone}>{item.tone}</AdminStatusBadge>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => onMarkRead(item)}
          className="rounded-[10px] border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm transition hover:border-zinc-300 hover:text-zinc-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300 dark:hover:border-white/15 dark:hover:text-zinc-100"
        >
          Mark as read
        </button>
      </div>
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
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const storageKey = useMemo(
    () => buildAdminNotificationStorageKey(operator),
    [operator]
  );
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const [storageReady, setStorageReady] = useState(false);
  const [runtimeIssue, setRuntimeIssue] = useState(null);

  async function handleSignOut() {
    await signOut({ redirectUrl: '/' });
  }

  const [shellState, setShellState] = useState({
    summary: { pending: 0, confirmed: 0, qrIssued: 0, checkedIn: 0 },
    jobs: [],
  });
  const shellStateRef = useRef(shellState);

  useEffect(() => {
    shellStateRef.current = shellState;
  }, [shellState]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setStorageReady(false);
    try {
      const stored = window.localStorage.getItem(storageKey);
      const parsed = stored ? JSON.parse(stored) : [];
      setReadNotificationIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setReadNotificationIds([]);
    } finally {
      setStorageReady(true);
    }
  }, [storageKey]);

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

        const { nextState, runtimeIssue: nextRuntimeIssue } =
          resolveAdminShellRuntimeState({
            currentPath,
            previousState: shellStateRef.current,
            registrations: {
              ok: registrationsResponse.ok,
              status: registrationsResponse.status,
              data: registrationsData,
            },
            jobs: {
              ok: jobsResponse.ok,
              status: jobsResponse.status,
              data: jobsData,
            },
          });

        setShellState(nextState);
        setRuntimeIssue(nextRuntimeIssue);
      } catch {
        if (!cancelled) {
          setRuntimeIssue({
            kind: 'degraded',
            message: 'Live admin stats are temporarily unavailable.',
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
  }, [currentPath]);

  useEffect(() => {
    if (!runtimeIssue || typeof window === 'undefined') return;

    if (runtimeIssue.kind === 'reauth') {
      void signOut({ redirectUrl: runtimeIssue.redirectTo }).catch(() => {
        window.location.assign(runtimeIssue.redirectTo);
      });
      return;
    }

    if (runtimeIssue.kind === 'forbidden') {
      window.location.assign(runtimeIssue.redirectTo);
    }
  }, [runtimeIssue, signOut]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const leaderMap = {
      r: '/admin/registrations',
      c: '/admin/check-in',
      d: '/admin/delivery',
      e: '/admin/email-jobs',
      t: '/admin/tickets',
    };
    let leaderArmed = false;
    let leaderTimer = null;

    const isTypingTarget = (target) => {
      if (!target) return false;
      const tag = target.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target.isContentEditable
      );
    };

    const onKey = (event) => {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (isTypingTarget(event.target)) return;
      if (event.key === 'g' && !meta && !event.altKey) {
        leaderArmed = true;
        window.clearTimeout(leaderTimer);
        leaderTimer = window.setTimeout(() => {
          leaderArmed = false;
        }, 1200);
        return;
      }
      if (leaderArmed) {
        const dest = leaderMap[event.key.toLowerCase()];
        leaderArmed = false;
        window.clearTimeout(leaderTimer);
        if (dest) {
          event.preventDefault();
          router.push(dest);
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(leaderTimer);
    };
  }, [router]);

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

  const notifications = useMemo(
    () =>
      buildAdminNotifications({
        summary: shellState.summary,
        jobs: shellState.jobs,
      }),
    [shellState.jobs, shellState.summary]
  );
  const unreadNotifications = useMemo(
    () =>
      filterUnreadAdminNotifications(
        notifications,
        new Set(readNotificationIds)
      ),
    [notifications, readNotificationIds]
  );

  const pageTitle = PAGE_TITLES[currentPath] || 'Admin';
  const attentionCount = unreadNotifications.filter((item) =>
    ['warning', 'danger', 'accent'].includes(item.tone)
  ).length;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!storageReady) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(readNotificationIds)
    );
  }, [readNotificationIds, storageKey, storageReady]);

  function markNotificationRead(notification) {
    const id = buildAdminNotificationId(notification);
    setReadNotificationIds((current) =>
      current.includes(id) ? current : [...current, id]
    );
  }

  function markAllNotificationsRead() {
    setReadNotificationIds(notifications.map(buildAdminNotificationId));
  }

  return (
    <div className="admin-console admin-console--saas min-h-screen bg-[radial-gradient(circle_at_top,#eef4ff_0%,#f8fafc_36%,#eef2ff_100%)] text-zinc-900 dark:bg-[radial-gradient(circle_at_top,#12203f_0%,#08101f_36%,#050913_100%)] dark:text-zinc-100">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[272px_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/70 bg-white/72 shadow-[0_24px_80px_rgba(99,102,241,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-950/30 lg:flex lg:flex-col">
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

          <div className="px-4">
            <div className="flex items-center gap-2.5 rounded-[10px] border border-white/80 bg-white/90 px-3 py-2 shadow-sm transition focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-200/40 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-purple-500/40 dark:focus-within:ring-purple-500/20">
              <Search className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
              <span className="text-sm text-zinc-400 dark:text-zinc-500">
                Search...
              </span>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-5 px-3 pb-4 pt-5">
            {navSections.map((section) => (
              <div key={section.key}>
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = NAV_ICONS[item.href];
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group relative flex items-center justify-between rounded-[10px] px-3 py-2.5 text-sm transition-all ${
                          item.active
                            ? 'bg-[linear-gradient(90deg,rgba(79,70,229,0.14),rgba(56,189,248,0.08),transparent)] font-semibold text-purple-700 shadow-sm dark:text-purple-300'
                            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100'
                        }`}
                      >
                        {item.active ? (
                          <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-purple-500" />
                        ) : null}
                        <span className="flex items-center gap-2.5">
                          {Icon ? (
                            <Icon
                              className={`h-[18px] w-[18px] shrink-0 ${
                                item.active
                                  ? 'text-purple-500'
                                  : 'text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300'
                              }`}
                            />
                          ) : null}
                          {item.label}
                        </span>
                        {item.showBadge ? (
                          <AdminStatusBadge tone={item.badgeTone}>
                            {item.badgeCount}
                          </AdminStatusBadge>
                        ) : item.active ? (
                          <ChevronRight className="h-3.5 w-3.5 text-purple-400/60" />
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex-1" />

            <div className="rounded-[10px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(238,242,255,0.92))] p-4 shadow-[0_18px_40px_rgba(99,102,241,0.10)] dark:border-white/[0.06] dark:bg-[linear-gradient(145deg,rgba(15,23,42,0.88),rgba(30,41,59,0.54))]">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-purple-500/80 dark:text-purple-400/70">
                Event
              </p>
              <p className="mt-1.5 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                Trust &amp; Safety India Festival
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                13-14 October 2026
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Final SaaS dashboard enabled
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-zinc-200/70 pt-4 dark:border-white/[0.06]">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-500 text-xs font-bold text-white shadow-md shadow-purple-500/20">
                  {getInitials(operator.displayName)}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[#0d1526]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  {operator.displayName}
                </p>
                <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">
                  {operator.primaryEmail}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-zinc-400 transition hover:bg-rose-50 hover:text-rose-500 dark:text-zinc-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </nav>
        </aside>

        <div className="min-w-0 flex flex-col">
          <header className="sticky top-0 z-40 border-b border-white/70 bg-white/72 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-zinc-950/42">
            <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
              <div className="flex items-center gap-2 text-sm">
                <LayoutDashboard className="hidden h-4 w-4 text-zinc-400 dark:text-zinc-500 sm:block" />
                <span className="hidden text-zinc-400 dark:text-zinc-500 sm:inline">
                  Admin
                </span>
                <ChevronRight className="hidden h-3 w-3 text-zinc-300 dark:text-zinc-600 sm:block" />
                <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                  {pageTitle}
                </span>
              </div>

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
                <div className="flex items-center gap-1 border-l border-zinc-200 pl-2 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setPaletteOpen(true)}
                    className="hidden items-center gap-2 rounded-[10px] border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-500 shadow-sm transition hover:border-zinc-300 hover:text-zinc-700 md:flex dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:border-white/20 dark:hover:text-zinc-200"
                    aria-label="Open command palette"
                    title="Command palette"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>Search</span>
                    <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 text-[10px] font-semibold dark:border-white/10 dark:bg-white/[0.06]">
                      ⌘K
                    </kbd>
                  </button>
                  <ThemeToggle />
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(true)}
                    className="relative flex h-8 w-8 items-center justify-center rounded-[10px] text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-200"
                    aria-label="Notifications"
                    title="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                    {attentionCount > 0 ? (
                      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0a1128]" />
                    ) : null}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex h-8 w-8 items-center justify-center rounded-[10px] text-zinc-500 transition hover:bg-rose-50 hover:text-rose-500 dark:text-zinc-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 lg:hidden"
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-1.5 overflow-x-auto px-3 pb-2.5 lg:hidden">
              {navSections.flatMap((section) =>
                section.items.map((item) => {
                  const Icon = NAV_ICONS[item.href];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-[10px] border px-3 py-1.5 text-sm whitespace-nowrap transition ${
                        item.active
                          ? 'border-purple-200 bg-purple-50 font-semibold text-purple-600 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400'
                          : 'border-zinc-200 bg-white text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400'
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
            {runtimeIssue?.kind === 'degraded' ? (
              <div className="mb-4 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                {runtimeIssue.message}
              </div>
            ) : null}
            <section className="mb-6 border-l-[3px] border-purple-900 pl-5 py-1 dark:border-purple-500">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-purple-900 dark:text-purple-400">
                Operations Overview
              </p>
              <h1 className="mt-1.5 font-heading text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                {pageTitle}
              </h1>
            </section>
            {children}
          </main>
        </div>
      </div>

      <SlideOverDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        title="Notifications"
      >
        <div className="space-y-4">
          <div className="rounded-[10px] border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.04]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
                Live Summary
              </p>
              <button
                type="button"
                onClick={markAllNotificationsRead}
                disabled={!unreadNotifications.length}
                className="rounded-[10px] border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm transition hover:border-zinc-300 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300 dark:hover:border-white/15 dark:hover:text-zinc-100"
              >
                Mark all as read
              </button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {statPills.map((pill) => (
                <TopStatPill
                  key={pill.key}
                  label={pill.label}
                  value={pill.value}
                  tone={pill.tone}
                />
              ))}
            </div>
          </div>
          {unreadNotifications.length ? (
            unreadNotifications.map((item) => (
              <NotificationCard
                key={buildAdminNotificationId(item)}
                item={item}
                onMarkRead={markNotificationRead}
              />
            ))
          ) : (
            <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                No active notifications
              </p>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                You have read or dismissed the current admin alerts. New issues
                will appear here automatically when the underlying status
                changes.
              </p>
            </div>
          )}
        </div>
      </SlideOverDrawer>
      <AdminCommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
    </div>
  );
}
