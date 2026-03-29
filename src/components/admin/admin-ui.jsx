"use client";

import clsx from "clsx";

const toneMap = {
  default: {
    badge: "border-[#343841] bg-[#17191f] text-[#d7dae2]",
    dot: "bg-[#7f8698]",
    panel: "border-[#2a2d35] bg-[#14161b] text-[#dfe2ea]",
    card: "border-[#2a2d35] bg-[#16181c]",
  },
  warning: {
    badge: "border-[#5f4b21] bg-[#2f2410] text-[#f1c36a]",
    dot: "bg-[#e8a94a]",
    panel: "border-[#6b5224] bg-[#221a0b] text-[#f4d191]",
    card: "border-[#5f4b21] bg-[#1d1810]",
  },
  success: {
    badge: "border-[#21493d] bg-[#112920] text-[#74d1b5]",
    dot: "bg-[#4db899]",
    panel: "border-[#285646] bg-[#0e211a] text-[#9fdec9]",
    card: "border-[#21493d] bg-[#101d19]",
  },
  danger: {
    badge: "border-[#5a2929] bg-[#281314] text-[#f29191]",
    dot: "bg-[#e05a5a]",
    panel: "border-[#6b2f2f] bg-[#231011] text-[#f4b0b0]",
    card: "border-[#5a2929] bg-[#1c1011]",
  },
  accent: {
    badge: "border-[#5f5337] bg-[#211c12] text-[#d9bf84]",
    dot: "bg-[#c8a96e]",
    panel: "border-[#6e6041] bg-[#241e12] text-[#e4cc98]",
    card: "border-[#5f5337] bg-[#1f1b14]",
  },
  info: {
    badge: "border-[#29445f] bg-[#111e2d] text-[#92c5ea]",
    dot: "bg-[#8bb4d4]",
    panel: "border-[#35526e] bg-[#0f1a27] text-[#b4d7f1]",
    card: "border-[#29445f] bg-[#101820]",
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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
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
    <div className={clsx("rounded-2xl border p-4 shadow-[0_20px_50px_rgba(0,0,0,0.18)]", classes.card)}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-admin-mono text-[10px] uppercase tracking-[0.22em] text-[#7f8698]">{label}</p>
        <span className={clsx("h-2.5 w-2.5 rounded-full", classes.dot)} />
      </div>
      <p className="mt-3 font-admin-display text-3xl text-[#f3f4f7]">{value}</p>
      {detail ? <p className="mt-2 text-xs text-[#8d93a5]">{detail}</p> : null}
    </div>
  );
}

export function AdminAlert({ title, description, tone = "default", actions = null, className = "" }) {
  const classes = getToneClasses(tone);

  return (
    <div className={clsx("rounded-2xl border px-4 py-3", classes.panel, className)}>
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
        {eyebrow ? <p className="font-admin-mono text-[10px] uppercase tracking-[0.24em] text-[#8d93a5]">{eyebrow}</p> : null}
        <h2 className="mt-2 font-admin-display text-3xl leading-none text-[#f5f6f8]">{title}</h2>
        {description ? <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#9ca3b5]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

