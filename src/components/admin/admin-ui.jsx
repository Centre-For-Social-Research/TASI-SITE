'use client';

import clsx from 'clsx';
import { X } from 'lucide-react';
import { Drawer } from 'vaul';

/* ── Tone map: light + dark for every variant ──────────────────────────────── */
const toneMap = {
  default: {
    badge:
      'border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300',
    dot: 'bg-slate-400',
    panel:
      'border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200',
    card: 'border-slate-200/70 bg-white dark:border-white/[0.06] dark:bg-white/[0.03]',
    iconBg: 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400',
  },
  warning: {
    badge:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
    dot: 'bg-amber-500',
    panel:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/[0.08] dark:text-amber-200',
    card: 'border-slate-200/70 bg-white dark:border-white/[0.06] dark:bg-white/[0.03]',
    iconBg:
      'bg-amber-50 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400',
  },
  success: {
    badge:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    panel:
      'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/[0.08] dark:text-emerald-200',
    card: 'border-slate-200/70 bg-white dark:border-white/[0.06] dark:bg-white/[0.03]',
    iconBg:
      'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400',
  },
  danger: {
    badge:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
    dot: 'bg-rose-500',
    panel:
      'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/[0.08] dark:text-rose-200',
    card: 'border-slate-200/70 bg-white dark:border-white/[0.06] dark:bg-white/[0.03]',
    iconBg: 'bg-rose-50 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400',
  },
  accent: {
    badge:
      'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300',
    dot: 'bg-violet-500',
    panel:
      'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/[0.08] dark:text-violet-200',
    card: 'border-slate-200/70 bg-white dark:border-white/[0.06] dark:bg-white/[0.03]',
    iconBg:
      'bg-violet-50 text-violet-500 dark:bg-violet-500/15 dark:text-violet-400',
  },
  info: {
    badge:
      'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300',
    dot: 'bg-sky-500',
    panel:
      'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/[0.08] dark:text-sky-200',
    card: 'border-slate-200/70 bg-white dark:border-white/[0.06] dark:bg-white/[0.03]',
    iconBg: 'bg-sky-50 text-sky-500 dark:bg-sky-500/15 dark:text-sky-400',
  },
};

export function getToneClasses(tone = 'default') {
  return toneMap[tone] || toneMap.default;
}

export function AdminStatusBadge({
  children,
  tone = 'default',
  className = '',
}) {
  const classes = getToneClasses(tone);

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-[10px] border px-2.5 py-0.5 text-[11px] font-medium shadow-sm',
        classes.badge,
        className
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', classes.dot)} />
      {children}
    </span>
  );
}

export function AdminStatCard({
  label,
  value,
  tone = 'default',
  detail,
  icon: Icon,
}) {
  const classes = getToneClasses(tone);

  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-[10px] border p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-lg',
        classes.card
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-black/[0.02] dark:to-white/[0.02]" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-extrabold tabular-nums text-slate-900 dark:text-slate-50">
            {value}
          </p>
          {detail ? (
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              {detail}
            </p>
          ) : null}
        </div>
        <div
          className={clsx(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            classes.iconBg
          )}
        >
          {Icon ? (
            <Icon className="h-5 w-5" />
          ) : (
            <span className={clsx('h-2.5 w-2.5 rounded-full', classes.dot)} />
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminAlert({
  title,
  description,
  tone = 'default',
  actions = null,
  className = '',
}) {
  const classes = getToneClasses(tone);

  return (
    <div
      className={clsx(
        'rounded-[10px] border px-5 py-4 shadow-sm backdrop-blur-sm',
        classes.panel,
        className
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.1em]">
            {title}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed opacity-90">
            {description}
          </p>
        </div>
        {actions}
      </div>
    </div>
  );
}

export function AdminSectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-500 dark:text-indigo-400">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Slide-over drawer that opens from the right (powered by vaul for touch gesture support) */
export function SlideOverDrawer({ open, onClose, title, children }) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(v) => !v && onClose()}
      direction="right"
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm dark:bg-black/60" />
        <Drawer.Content className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl focus:outline-none dark:border-white/[0.06] dark:bg-[#0d1526]">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/[0.06]">
            <Drawer.Title className="text-sm font-bold text-slate-800 dark:text-slate-50">
              {title}
            </Drawer.Title>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/** Dismissible in-page toast for transient status / error feedback */
export function AdminToast({ message, tone = 'default', onDismiss }) {
  const classes = getToneClasses(tone);

  if (!message) return null;

  return (
    <div
      className={clsx(
        'flex items-start justify-between gap-3 rounded-[10px] border px-4 py-3 shadow-sm',
        classes.panel
      )}
    >
      <p className="text-sm leading-relaxed">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-0.5 shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

/** Animated shimmer skeleton rows for table loading states */
export function LoadingRows({ count = 6, cols = 7 }) {
  return (
    <>
      {Array.from({ length: count }, (_, rowIndex) => (
        <tr
          key={rowIndex}
          className="border-b border-slate-100 dark:border-white/[0.04]"
        >
          {Array.from({ length: cols }, (_, colIndex) => (
            <td key={colIndex} className="px-4 py-4">
              <div
                className="h-4 animate-pulse rounded-lg bg-slate-100 dark:bg-white/[0.06]"
                style={{
                  width: `${55 + ((rowIndex * 3 + colIndex * 7) % 35)}%`,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
