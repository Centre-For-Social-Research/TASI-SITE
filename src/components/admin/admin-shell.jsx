'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Toaster } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import AdminCommandPalette from '@/components/admin/admin-command-palette';

/* ── Inline SVG icons (thin stroke, 18×18) ───────────────────────────────── */
const Ico = {
  gauge:   (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 14l4-4"/><path d="M4 14a8 8 0 0 1 16 0"/><path d="M4 14v2M20 14v2"/></svg>,
  users:   (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="8" r="3.2"/><path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M15 19c0-2.6 1.8-4.8 4.2-5.3"/></svg>,
  mail:    (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>,
  truck:   (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>,
  qr:      (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v3M14 20h7"/></svg>,
  ticket:  (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" {...p}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M13 6v12" strokeDasharray="2 2"/></svg>,
  search:  (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="6"/><path d="M20 20l-3.5-3.5"/></svg>,
  bell:    (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>,
  sun:     (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg>,
  moon:    (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>,
  logout:  (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  sliders: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 7h10M4 12h6M4 17h14"/><circle cx="17" cy="7" r="1.5"/><circle cx="13" cy="12" r="1.5"/><circle cx="19" cy="17" r="1.5"/></svg>,
  x:       (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>,
  check:   (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12l5 5L20 7"/></svg>,
  audit:   (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7M9 8h3"/></svg>,
  gear:    (p) => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.5a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.5a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/></svg>,
};

const NAV_ICONS = {
  '/admin':               Ico.gauge,
  '/admin/registrations': Ico.users,
  '/admin/email-jobs':    Ico.mail,
  '/admin/delivery':      Ico.truck,
  '/admin/check-in':      Ico.qr,
  '/admin/tickets':       Ico.ticket,
  '/admin/audit':         Ico.audit,
  '/admin/settings':      Ico.gear,
};

const PAGE_TITLES = {
  '/admin':               { kicker: 'OPERATIONS · LIVE',          title: 'Dashboard',     meta: 'Auto-refresh · 30s' },
  '/admin/registrations': { kicker: 'REGISTRATIONS · REVIEW',     title: 'Review Queue',  meta: 'Pending decisions' },
  '/admin/email-jobs':    { kicker: 'EMAILS · CONFIRMATION',       title: 'Confirmation Emails', meta: 'Text-only · No attachment' },
  '/admin/delivery':      { kicker: 'PASSES · DISPATCH',          title: 'Entry Pass Dispatch', meta: 'PDF badge + QR delivery' },
  '/admin/check-in':      { kicker: 'DAY-OF · LIVE',              title: 'Check-in',      meta: 'QR scanner ready' },
  '/admin/tickets':       { kicker: 'FESTIVAL · TICKETS',         title: 'Orders',        meta: 'Razorpay · live' },
  '/admin/audit':         { kicker: 'SYSTEM · AUDIT',             title: 'Audit Trail',   meta: 'Last 30 days' },
  '/admin/settings':      { kicker: 'SYSTEM · CONFIG',            title: 'Settings',      meta: '' },
};

const ADM_NAV_GROUPS = [
  {
    group: 'Overview',
    keys: ['/admin'],
  },
  {
    group: 'Registrations',
    keys: ['/admin/registrations', '/admin/email-jobs', '/admin/delivery'],
  },
  {
    group: 'Day-of',
    keys: ['/admin/check-in', '/admin/tickets'],
  },
  {
    group: 'System',
    keys: ['/admin/audit', '/admin/settings'],
  },
];

function daysToEvent() {
  const event = new Date('2026-10-13T00:00:00+05:30');
  const diff = Math.ceil((event.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function getInitials(name) {
  return String(name || 'OP')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}

/* ── Live clock ─────────────────────────────────────────────────────────── */
function useClock() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/* ── Sidebar ────────────────────────────────────────────────────────────── */
function Sidebar({ currentPath, navigate, navSections, operator, onSignOut }) {
  const isActive = (href) =>
    href === '/admin' ? currentPath === '/admin' : currentPath.startsWith(href);

  const navLabels = {};
  navSections.forEach((s) => s.items.forEach((item) => { navLabels[item.href] = item; }));

  return (
    <aside
      className="adm-sidebar"
      style={{
        width: 248,
        flexShrink: 0,
        borderRight: '1px solid var(--adm-line)',
        background: 'var(--adm-canvas-2)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Brand */}
      <div style={{ padding: '18px 20px 16px', borderBottom: '1px solid var(--adm-line)' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          background: '#fff', borderRadius: 0,
          padding: '5px 10px',
        }}>
          <Image
            src="/img/tasi-csr-logo.png"
            alt="TASI 2026 — The Centre for Social Research"
            width={148}
            height={40}
            style={{ objectFit: 'contain', objectPosition: 'left', display: 'block' }}
            priority
          />
        </div>
        <div className="adm-mono" style={{ fontSize: 10, color: 'var(--adm-ink-3)', letterSpacing: '0.1em', marginTop: 8 }}>
          OPERATIONS CONSOLE · OCT 2026
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflow: 'auto', padding: '14px 10px' }}>
        {ADM_NAV_GROUPS.map((group) => (
          <div key={group.group} style={{ marginBottom: 18 }}>
            <div className="adm-eyebrow" style={{ padding: '0 12px', marginBottom: 6 }}>
              {group.group}
            </div>
            {group.keys.map((href) => {
              const Icon = NAV_ICONS[href];
              const meta = navLabels[href];
              const active = isActive(href);
              const label = PAGE_TITLES[href]?.title || href;
              return (
                <button
                  key={href}
                  className="adm-nav-btn"
                  onClick={() => navigate(href)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    marginBottom: 2,
                    background: active ? 'var(--adm-panel-2)' : 'transparent',
                    border: '1px solid ' + (active ? 'var(--adm-line)' : 'transparent'),
                    borderRadius: 10,
                    color: active ? 'var(--adm-ink)' : 'var(--adm-ink-2)',
                    fontSize: 13,
                    fontWeight: active ? 500 : 400,
                    cursor: 'pointer',
                    position: 'relative',
                    fontFamily: 'var(--adm-sans)',
                  }}
                >
                  {active && (
                    <span style={{
                      position: 'absolute', left: -1, top: 10, bottom: 10,
                      width: 2, background: 'var(--adm-accent)', borderRadius: 10,
                    }} />
                  )}
                  {Icon && <Icon style={{ color: active ? 'var(--adm-accent)' : 'var(--adm-ink-3)' }} />}
                  <span style={{ flex: 1 }}>{label}</span>
                  {meta?.showBadge && (
                    <span className="adm-mono" style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 10,
                      background: 'var(--adm-accent-soft)', color: 'var(--adm-accent)',
                      border: '1px solid var(--adm-accent-line)',
                    }}>
                      {meta.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Event panel */}
      <div style={{ padding: 12, borderTop: '1px solid var(--adm-line)' }}>
        <div style={{
          padding: 14, borderRadius: 10,
          background: 'var(--adm-panel)', border: '1px solid var(--adm-line)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: 120,
            background: 'radial-gradient(circle at 100% 0%, var(--adm-accent-soft), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div className="adm-eyebrow" style={{ color: 'var(--adm-accent)', marginBottom: 6 }}>
            EVENT · T-{daysToEvent()}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, color: 'var(--adm-ink)' }}>
            Trust &amp; Safety India Festival
          </div>
          <div className="adm-mono" style={{ fontSize: 10.5, color: 'var(--adm-ink-3)', marginTop: 4, letterSpacing: '0.04em' }}>
            13–14 OCT 2026
          </div>
          <div className="adm-mono" style={{ fontSize: 10.5, color: 'var(--adm-ink-3)', letterSpacing: '0.04em' }}>
            INDIA HABITAT CENTRE
          </div>
        </div>

        {/* Operator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 4px 2px' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 999,
            background: 'linear-gradient(135deg, var(--adm-accent), rgba(240,168,50,0.4))',
            color: 'var(--adm-accent-ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--adm-mono)', fontSize: 11, fontWeight: 600,
            border: '1px solid var(--adm-line)',
          }}>
            {getInitials(operator?.displayName)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--adm-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {operator?.displayName || 'Operator'}
            </div>
            <div className="adm-mono" style={{ fontSize: 10, color: 'var(--adm-ink-3)' }}>
              ADMIN · ONLINE
            </div>
          </div>
          <span className="adm-pulse-dot" style={{ background: 'var(--adm-ok)' }} />
          <button
            onClick={onSignOut}
            title="Sign out"
            style={{
              width: 28, height: 28, borderRadius: 10,
              border: '1px solid var(--adm-line)', background: 'transparent',
              color: 'var(--adm-ink-3)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ico.logout />
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ── TopBar ──────────────────────────────────────────────────────────────── */
function TopBar({ currentPath, shellState, theme, setTheme, attentionCount, onNotifications, onPalette, operator }) {
  const now = useClock();
  const titleDef = PAGE_TITLES[currentPath] || PAGE_TITLES['/admin/registrations'];
  const { summary, jobs } = shellState;

  const fmtTime = now ? now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '--:--:--';
  const fmtDate = now ? now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase() : '---';

  const runningJobs = jobs.filter((j) => j?.status === 'running').length;
  const failedJobs  = jobs.reduce((t, j) => t + Number(j?.failed_items || 0), 0);
  const qrQueue     = Math.max((summary.confirmed || 0) - (summary.qrIssued || 0), 0);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: 'color-mix(in srgb, var(--adm-canvas) 92%, transparent)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--adm-line)',
    }}>
      {/* Ticker strip */}
      <div className="adm-ticker-strip" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 22px', borderBottom: '1px solid var(--adm-line)',
        fontFamily: 'var(--adm-mono)', fontSize: 10.5, letterSpacing: '0.06em',
        color: 'var(--adm-ink-3)',
      }}>
        <div className="adm-ticker-left" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--adm-accent)' }}>
            <span className="adm-pulse-dot" />LIVE
          </span>
          <span style={{ color: 'var(--adm-ink-2)' }}>IST {fmtTime}</span>
          <span>·</span>
          <span>{fmtDate}</span>
        </div>
        <div className="adm-ticker-right" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span>PENDING <span style={{ color: 'var(--adm-warn)' }}>{summary.pending || 0}</span></span>
          <span>·</span>
          <span>CONFIRMED {summary.confirmed || 0}</span>
          <span style={{ opacity: 0.35 }}>|</span>
          <span>CHECK-IN {summary.checkedIn || 0}</span>
          <span>·</span>
          <span>QR QUEUE <span style={{ color: qrQueue > 0 ? 'var(--adm-warn)' : 'var(--adm-ink-3)' }}>{qrQueue}</span></span>
          {runningJobs > 0 && (<><span style={{ opacity: 0.35 }}>|</span><span style={{ color: 'var(--adm-accent)' }}>{runningJobs} JOB{runningJobs > 1 ? 'S' : ''} RUNNING</span></>)}
          {failedJobs  > 0 && (<><span style={{ opacity: 0.35 }}>|</span><span style={{ color: 'var(--adm-bad)' }}>{failedJobs} FAILED</span></>)}
        </div>
      </div>

      {/* Title row */}
      <div className="adm-topbar-title-row" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 22px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="adm-eyebrow adm-topbar-kicker" style={{ marginBottom: 4, color: 'var(--adm-accent)' }}>
            {titleDef.kicker}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <h1 className="adm-topbar-h1" style={{
              fontFamily: 'var(--adm-sans)',
              fontSize: 32, fontWeight: 600, margin: 0,
              letterSpacing: '-0.02em', lineHeight: 1.05, color: 'var(--adm-ink)',
            }}>
              {titleDef.title}
            </h1>
            {titleDef.meta && (
              <span className="adm-mono adm-topbar-meta" style={{ fontSize: 11, color: 'var(--adm-ink-3)', letterSpacing: '0.06em' }}>
                {titleDef.meta.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Search */}
        <button
          className="adm-topbar-search"
          onClick={onPalette}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 10,
            background: 'var(--adm-panel)', border: '1px solid var(--adm-line)',
            width: 260, cursor: 'pointer', color: 'var(--adm-ink-3)',
            fontFamily: 'var(--adm-sans)', fontSize: 13,
          }}
        >
          <Ico.search />
          <span style={{ flex: 1, textAlign: 'left' }}>Search or jump to…</span>
          <kbd className="adm-mono" style={{ fontSize: 10, padding: '2px 6px', border: '1px solid var(--adm-line)', borderRadius: 10 }}>
            ⌘K
          </kbd>
        </button>

        {/* Actions */}
        <button
          onClick={onPalette}
          className="adm-topbar-search-icon"
          title="Search (⌘K)"
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: '1px solid var(--adm-line)', background: 'var(--adm-panel)',
            color: 'var(--adm-ink-2)', cursor: 'pointer',
            display: 'none', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ico.search />
        </button>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle theme"
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: '1px solid var(--adm-line)', background: 'var(--adm-panel)',
            color: 'var(--adm-ink-2)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {theme === 'dark' ? <Ico.sun /> : <Ico.moon />}
        </button>
        <button
          onClick={onNotifications}
          title="Notifications"
          style={{
            position: 'relative', width: 36, height: 36, borderRadius: 10,
            border: '1px solid var(--adm-line)', background: 'var(--adm-panel)',
            color: 'var(--adm-ink-2)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ico.bell />
          {attentionCount > 0 && (
            <span style={{
              position: 'absolute', top: 7, right: 8,
              width: 7, height: 7, borderRadius: 999,
              background: 'var(--adm-bad)', border: '2px solid var(--adm-panel)',
            }} />
          )}
        </button>

        {/* Current user */}
        <div className="adm-topbar-operator" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 10px', borderRadius: 10,
          border: '1px solid var(--adm-line)', background: 'var(--adm-panel)',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: 999, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--adm-accent), rgba(240,168,50,0.4))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--adm-mono)', fontSize: 10, fontWeight: 700,
            color: 'var(--adm-accent-ink)', border: '1px solid var(--adm-line)',
          }}>
            {getInitials(operator?.displayName)}
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--adm-ink)', whiteSpace: 'nowrap' }}>
              {operator?.displayName || 'Operator'}
            </div>
            <div className="adm-mono" style={{ fontSize: 9.5, color: 'var(--adm-ink-3)', letterSpacing: '0.06em' }}>
              ADMIN · ONLINE
            </div>
          </div>
          <span className="adm-pulse-dot" style={{ background: 'var(--adm-ok)', flexShrink: 0 }} />
        </div>
      </div>

      {/* Mobile nav tabs */}
      <div
        className="adm-mobile-nav"
        style={{
          gap: 6, overflowX: 'auto', padding: '0 12px 10px',
          fontFamily: 'var(--adm-sans)',
        }}
      >
        {Object.entries(PAGE_TITLES).map(([href, def]) => {
          const Icon = NAV_ICONS[href];
          const active = href === '/admin' ? currentPath === '/admin' : currentPath.startsWith(href);
          return (
            <Link key={href} href={href} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
              padding: '7px 12px', borderRadius: 10, fontSize: 12, whiteSpace: 'nowrap',
              border: '1px solid ' + (active ? 'var(--adm-accent-line)' : 'var(--adm-line)'),
              background: active ? 'var(--adm-accent-soft)' : 'var(--adm-panel)',
              color: active ? 'var(--adm-accent)' : 'var(--adm-ink-2)',
              fontWeight: active ? 600 : 400, textDecoration: 'none',
            }}>
              {Icon && <Icon style={{ width: 14, height: 14 }} />}
              {def.title}
            </Link>
          );
        })}
      </div>
    </header>
  );
}

/* ── Notifications panel ─────────────────────────────────────────────────── */
function NotificationsPanel({ open, onClose, notifications, unread, onMarkRead, onMarkAll, statPills }) {
  if (!open) return null;
  const toneColor = { warning: 'var(--adm-warn)', danger: 'var(--adm-bad)', success: 'var(--adm-ok)', accent: 'var(--adm-accent)', default: 'var(--adm-ink-3)', info: 'var(--adm-info)' };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
      />
      <div className="adm-notif-panel" style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 420,
        background: 'var(--adm-panel)', borderLeft: '1px solid var(--adm-line-strong)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '-40px 0 80px rgba(0,0,0,0.35)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--adm-line)',
        }}>
          <div className="adm-eyebrow" style={{ color: 'var(--adm-accent)' }}>
            NOTIFICATIONS
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {unread.length > 0 && (
              <button onClick={onMarkAll} style={{
                fontSize: 11, fontFamily: 'var(--adm-mono)', padding: '4px 10px',
                borderRadius: 10, border: '1px solid var(--adm-line)',
                background: 'transparent', color: 'var(--adm-ink-3)', cursor: 'pointer',
              }}>
                MARK ALL READ
              </button>
            )}
            <button onClick={onClose} style={{
              width: 30, height: 30, borderRadius: 10,
              border: '1px solid var(--adm-line)', background: 'var(--adm-panel-2)',
              color: 'var(--adm-ink-2)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Ico.x />
            </button>
          </div>
        </div>

        {/* Live summary pills */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--adm-line)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {statPills.map((pill) => (
            <span key={pill.key} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 10,
              background: 'var(--adm-panel-2)', border: '1px solid var(--adm-line)',
              fontFamily: 'var(--adm-mono)', fontSize: 10.5,
            }}>
              <span style={{ color: toneColor[pill.tone] || 'var(--adm-ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {pill.label}
              </span>
              <span style={{ color: 'var(--adm-ink)', fontWeight: 600 }}>{pill.value}</span>
            </span>
          ))}
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {unread.length === 0 ? (
            <div style={{
              padding: '20px', borderRadius: 10,
              border: '1px solid var(--adm-ok-soft)', background: 'var(--adm-ok-soft)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--adm-ok)', marginBottom: 4 }}>
                All clear
              </div>
              <div style={{ fontSize: 12, color: 'var(--adm-ink-3)', lineHeight: 1.5 }}>
                No active alerts. New issues will surface here automatically.
              </div>
            </div>
          ) : unread.map((item) => (
            <div key={buildAdminNotificationId(item)} style={{
              padding: 16, borderRadius: 10,
              background: 'var(--adm-panel-2)', border: '1px solid var(--adm-line)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--adm-ink)', marginBottom: 4 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--adm-ink-3)', lineHeight: 1.5 }}>
                    {item.detail}
                  </div>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 8px', borderRadius: 10,
                  background: (toneColor[item.tone] || 'var(--adm-ink-3)') + '22',
                  color: toneColor[item.tone] || 'var(--adm-ink-3)',
                  fontFamily: 'var(--adm-mono)', fontSize: 10, textTransform: 'uppercase',
                  letterSpacing: '0.08em', whiteSpace: 'nowrap',
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: 'currentColor' }} />
                  {item.tone}
                </span>
              </div>
              <div style={{ marginTop: 12, textAlign: 'right' }}>
                <button onClick={() => onMarkRead(item)} style={{
                  fontSize: 11, fontFamily: 'var(--adm-mono)', padding: '4px 10px',
                  borderRadius: 10, border: '1px solid var(--adm-line)',
                  background: 'var(--adm-panel)', color: 'var(--adm-ink-3)', cursor: 'pointer',
                }}>
                  DISMISS
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main shell ──────────────────────────────────────────────────────────── */
export default function AdminShell({ operator, currentPath, children }) {
  const { signOut } = useClerk();
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [runtimeIssue, setRuntimeIssue] = useState(null);
  const [shellState, setShellState] = useState({
    summary: { pending: 0, confirmed: 0, qrIssued: 0, checkedIn: 0 },
    jobs: [],
  });
  const shellStateRef = useRef(shellState);

  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    const stored = localStorage.getItem('adm-theme');
    if (stored && stored !== 'dark') setTheme(stored);
  }, []);
  useEffect(() => {
    localStorage.setItem('adm-theme', theme);
  }, [theme]);

  const storageKey = useMemo(() => buildAdminNotificationStorageKey(operator), [operator]);
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => { shellStateRef.current = shellState; }, [shellState]);

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
        const [regRes, jobsRes] = await Promise.all([
          fetch('/api/admin/registrations?pageSize=1', { cache: 'no-store' }),
          fetch('/api/admin/passes/jobs', { cache: 'no-store' }),
        ]);
        const [regData, jobsData] = await Promise.all([
          regRes.json().catch(() => ({})),
          jobsRes.json().catch(() => ({})),
        ]);
        if (cancelled) return;
        const { nextState, runtimeIssue: nextIssue } = resolveAdminShellRuntimeState({
          currentPath,
          previousState: shellStateRef.current,
          registrations: { ok: regRes.ok, status: regRes.status, data: regData },
          jobs: { ok: jobsRes.ok, status: jobsRes.status, data: jobsData },
        });
        setShellState(nextState);
        setRuntimeIssue(nextIssue);
      } catch {
        if (!cancelled) setRuntimeIssue({ kind: 'degraded', message: 'Live admin stats temporarily unavailable.' });
      }
    }
    void loadShellData();
    const timer = window.setInterval(() => void loadShellData(), 30000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [currentPath]);

  useEffect(() => {
    if (!runtimeIssue || typeof window === 'undefined') return;
    if (runtimeIssue.kind === 'reauth') {
      void signOut({ redirectUrl: runtimeIssue.redirectTo }).catch(() => window.location.assign(runtimeIssue.redirectTo));
      return;
    }
    if (runtimeIssue.kind === 'forbidden') window.location.assign(runtimeIssue.redirectTo);
  }, [runtimeIssue, signOut]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const leaderMap = { r: '/admin/registrations', c: '/admin/check-in', d: '/admin/delivery', e: '/admin/email-jobs', t: '/admin/tickets', g: '/admin' };
    let armed = false; let timer = null;
    const isInput = (t) => t && ['INPUT','TEXTAREA','SELECT'].includes(t.tagName) || t?.isContentEditable;
    const onKey = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen((o) => !o); return; }
      if (isInput(e.target)) return;
      if (e.key === 'g' && !meta) { armed = true; window.clearTimeout(timer); timer = window.setTimeout(() => { armed = false; }, 1200); return; }
      if (armed) {
        const dest = leaderMap[e.key.toLowerCase()];
        armed = false; window.clearTimeout(timer);
        if (dest) { e.preventDefault(); router.push(dest); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); window.clearTimeout(timer); };
  }, [router]);

  useEffect(() => {
    if (!storageReady || typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify(readNotificationIds));
  }, [readNotificationIds, storageKey, storageReady]);

  const navSections = useMemo(() => buildAdminNavigation({ pathname: currentPath, summary: shellState.summary, jobs: shellState.jobs }), [currentPath, shellState]);
  const statPills   = useMemo(() => buildAdminStatPills({ summary: shellState.summary, jobs: shellState.jobs }), [shellState]);
  const notifications = useMemo(() => buildAdminNotifications({ summary: shellState.summary, jobs: shellState.jobs }), [shellState]);
  const unreadNotifications = useMemo(() => filterUnreadAdminNotifications(notifications, new Set(readNotificationIds)), [notifications, readNotificationIds]);
  const attentionCount = unreadNotifications.filter((item) => ['warning','danger','accent'].includes(item.tone)).length;

  async function handleSignOut() { await signOut({ redirectUrl: '/' }); }

  function markRead(n) {
    const id = buildAdminNotificationId(n);
    setReadNotificationIds((cur) => cur.includes(id) ? cur : [...cur, id]);
  }
  function markAll() { setReadNotificationIds(notifications.map(buildAdminNotificationId)); }

  return (
    <div
      className="admin-v2"
      data-adm-theme={theme}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row', fontFamily: 'var(--adm-sans)' }}
    >
      <Sidebar
        currentPath={currentPath}
        navigate={router.push}
        navSections={navSections}
        operator={operator}
        onSignOut={handleSignOut}
      />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar
          currentPath={currentPath}
          shellState={shellState}
          theme={theme}
          setTheme={setTheme}
          attentionCount={attentionCount}
          onNotifications={() => setNotificationsOpen(true)}
          onPalette={() => setPaletteOpen(true)}
          operator={operator}
        />
        <main
          className="adm-page-content"
          key={currentPath}
          style={{ flex: 1, padding: '24px 28px 48px 28px' }}
        >
          {runtimeIssue?.kind === 'degraded' && (
            <div style={{
              marginBottom: 18, padding: '10px 16px', borderRadius: 10,
              border: '1px solid var(--adm-warn-soft)', background: 'var(--adm-warn-soft)',
              fontFamily: 'var(--adm-mono)', fontSize: 11, color: 'var(--adm-warn)',
              letterSpacing: '0.04em',
            }}>
              ⚠ {runtimeIssue.message}
            </div>
          )}
          {children}
        </main>
      </div>

      <NotificationsPanel
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        unread={unreadNotifications}
        onMarkRead={markRead}
        onMarkAll={markAll}
        statPills={statPills}
      />
      <AdminCommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <Toaster richColors closeButton position="bottom-right" />
    </div>
  );
}
