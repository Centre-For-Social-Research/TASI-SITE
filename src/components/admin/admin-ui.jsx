'use client';

import clsx from 'clsx';
import { X } from 'lucide-react';
import { Drawer } from 'vaul';

const toneMap = {
  default: {
    badge: 'border-[#253a5c] bg-[#162040] text-slate-300',
    dot: 'bg-slate-400',
    panel: 'border-[#1e2a45] bg-[#0f1729] text-slate-200',
    card: 'border-[#1e2a45] bg-[#111a2e]',
    leftBorder: 'border-l-slate-500',
  },
  warning: {
    badge: 'border-amber-700/50 bg-amber-950/40 text-amber-300',
    dot: 'bg-amber-500',
    panel: 'border-amber-700/40 bg-amber-950/30 text-amber-200',
    card: 'border-[#1e2a45] bg-[#111a2e]',
    leftBorder: 'border-l-amber-500',
  },
  success: {
    badge: 'border-emerald-700/50 bg-emerald-950/40 text-emerald-300',
    dot: 'bg-emerald-500',
    panel: 'border-emerald-700/40 bg-emerald-950/30 text-emerald-200',
    card: 'border-[#1e2a45] bg-[#111a2e]',
    leftBorder: 'border-l-emerald-500',
  },
  danger: {
    badge: 'border-rose-700/50 bg-rose-950/40 text-rose-300',
    dot: 'bg-rose-500',
    panel: 'border-rose-700/40 bg-rose-950/30 text-rose-200',
    card: 'border-[#1e2a45] bg-[#111a2e]',
    leftBorder: 'border-l-rose-500',
  },
  accent: {
    badge: 'border-violet-700/50 bg-violet-950/40 text-violet-300',
    dot: 'bg-violet-500',
    panel: 'border-violet-700/40 bg-violet-950/30 text-violet-200',
    card: 'border-[#1e2a45] bg-[#111a2e]',
    leftBorder: 'border-l-violet-500',
  },
  info: {
    badge: 'border-sky-700/50 bg-sky-950/40 text-sky-300',
    dot: 'bg-sky-500',
    panel: 'border-sky-700/40 bg-sky-950/30 text-sky-200',
    card: 'border-[#1e2a45] bg-[#111a2e]',
    leftBorder: 'border-l-sky-500',
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
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
        classes.badge,
        className
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', classes.dot)} />
      {children}
    </span>
  );
}

export function AdminStatCard({ label, value, tone = 'default', detail }) {
  const classes = getToneClasses(tone);

  return (
    <div
      className={clsx(
        'rounded-xl border border-l-4 p-4 shadow-sm',
        classes.card,
        classes.leftBorder
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <span className={clsx('h-2 w-2 rounded-full', classes.dot)} />
      </div>
      <p className="mt-2.5 text-3xl font-bold tabular-nums text-slate-50">
        {value}
      </p>
      {detail ? (
        <p className="mt-1.5 text-xs text-[#5a6b8a]">{detail}</p>
      ) : null}
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
        'rounded-[10px] border px-4 py-3 shadow-sm',
        classes.panel,
        className
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide">
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
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-500">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-2xl font-bold text-slate-50">{title}</h2>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-400">
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
        <Drawer.Overlay className="fixed inset-0 z-50 bg-[#0b1120]/60 backdrop-blur-sm" />
        <Drawer.Content className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col overflow-hidden bg-[#0d1526] shadow-2xl shadow-black/50 focus:outline-none">
          <div className="flex shrink-0 items-center justify-between border-b border-[#1e2a45] px-5 py-4">
            <Drawer.Title className="text-sm font-semibold text-slate-50">
              {title}
            </Drawer.Title>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-[#1e2a45] hover:text-slate-200"
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
          className="border-b border-[#1a2744]"
        >
          {Array.from({ length: cols }, (_, colIndex) => (
            <td key={colIndex} className="px-4 py-4">
              <div
                className="h-4 animate-pulse rounded bg-[#1e2a45]"
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
