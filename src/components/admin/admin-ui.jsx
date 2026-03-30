'use client';

import { useEffect } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';

const toneMap = {
  default: {
    badge:
      'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
    dot: 'bg-slate-400',
    panel:
      'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200',
    card: 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900',
  },
  warning: {
    badge:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    dot: 'bg-amber-500',
    panel:
      'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200',
    card: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30',
  },
  success: {
    badge:
      'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    panel:
      'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
    card: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30',
  },
  danger: {
    badge:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
    dot: 'bg-rose-500',
    panel:
      'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200',
    card: 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30',
  },
  accent: {
    badge:
      'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-300',
    dot: 'bg-violet-500',
    panel:
      'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200',
    card: 'border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30',
  },
  info: {
    badge:
      'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
    dot: 'bg-sky-500',
    panel:
      'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200',
    card: 'border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/30',
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
    <div className={clsx('rounded-[10px] border p-4 shadow-sm', classes.card)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <span className={clsx('h-2 w-2 rounded-full', classes.dot)} />
      </div>
      <p className="mt-2.5 text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
        {value}
      </p>
      {detail ? (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {detail}
        </p>
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
          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-600">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
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

/** Slide-over drawer that opens from the right */
export function SlideOverDrawer({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className="relative flex h-full w-full max-w-lg flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            {title}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
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
          className="border-b border-slate-100 dark:border-slate-800"
        >
          {Array.from({ length: cols }, (_, colIndex) => (
            <td key={colIndex} className="px-4 py-4">
              <div
                className="h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
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
