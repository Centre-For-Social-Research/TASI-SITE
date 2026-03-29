"use client";

import clsx from "clsx";

const toneMap = {
  default: {
    badge: "border-stone-200 bg-white text-slate-700",
    dot: "bg-slate-400",
    panel: "border-stone-200 bg-white text-slate-700",
    card: "border-stone-200 bg-white",
  },
  warning: {
    badge: "border-amber-200 bg-amber-50 text-amber-900",
    dot: "bg-amber-500",
    panel: "border-amber-200 bg-amber-50 text-amber-900",
    card: "border-amber-200 bg-[#fff8eb]",
  },
  success: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dot: "bg-emerald-500",
    panel: "border-emerald-200 bg-emerald-50 text-emerald-900",
    card: "border-emerald-200 bg-[#f3fcf8]",
  },
  danger: {
    badge: "border-rose-200 bg-rose-50 text-rose-800",
    dot: "bg-rose-500",
    panel: "border-rose-200 bg-rose-50 text-rose-900",
    card: "border-rose-200 bg-[#fff5f5]",
  },
  accent: {
    badge: "border-violet-200 bg-violet-50 text-violet-800",
    dot: "bg-violet-500",
    panel: "border-violet-200 bg-violet-50 text-violet-900",
    card: "border-violet-200 bg-[#faf5ff]",
  },
  info: {
    badge: "border-sky-200 bg-sky-50 text-sky-800",
    dot: "bg-sky-500",
    panel: "border-sky-200 bg-sky-50 text-sky-900",
    card: "border-sky-200 bg-[#f4fbff]",
  },
};

export function getToneClasses(tone = "default") {
  return toneMap[tone] || toneMap.default;
}

export function AdminStatusBadge({ children, tone = "default", className = "" }) {
  const classes = getToneClasses(tone);

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-admin-mono text-[10px] uppercase tracking-[0.12em]",
        classes.badge,
        className,
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", classes.dot)} />
      {children}
    </span>
  );
}

export function AdminStatCard({ label, value, tone = "default", detail }) {
  const classes = getToneClasses(tone);

  return (
    <div className={clsx("rounded-[24px] border p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)]", classes.card)}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-admin-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
        <span className={clsx("h-2.5 w-2.5 rounded-full", classes.dot)} />
      </div>
      <p className="mt-3 font-admin-display text-3xl text-slate-900">{value}</p>
      {detail ? <p className="mt-2 text-xs text-slate-500">{detail}</p> : null}
    </div>
  );
}

export function AdminAlert({ title, description, tone = "default", actions = null, className = "" }) {
  const classes = getToneClasses(tone);

  return (
    <div className={clsx("rounded-[20px] border px-4 py-3 shadow-sm", classes.panel, className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-admin-mono text-[10px] uppercase tracking-[0.18em]">{title}</p>
          <p className="mt-2 text-sm leading-relaxed opacity-90">{description}</p>
        </div>
        {actions}
      </div>
    </div>
  );
}

export function AdminSectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <p className="font-admin-mono text-[10px] uppercase tracking-[0.24em] text-amber-700">{eyebrow}</p> : null}
        <h2 className="mt-2 font-admin-display text-3xl leading-none text-slate-900">{title}</h2>
        {description ? <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
