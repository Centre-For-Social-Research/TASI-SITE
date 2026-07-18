'use client';

export function AdminProgressCard({ label, value, percent, color = 'cyan' }) {
  const colorMap = {
    cyan: {
      bg: 'bg-cyan-500',
      track: 'bg-cyan-100 dark:bg-cyan-500/15',
      text: 'text-cyan-600 dark:text-cyan-400',
      badge: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400',
    },
    emerald: {
      bg: 'bg-emerald-500',
      track: 'bg-emerald-100 dark:bg-emerald-500/15',
      text: 'text-emerald-600 dark:text-emerald-400',
      badge:
        'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-500',
      track: 'bg-amber-100 dark:bg-amber-500/15',
      text: 'text-amber-600 dark:text-amber-400',
      badge:
        'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
    },
    rose: {
      bg: 'bg-rose-500',
      track: 'bg-rose-100 dark:bg-rose-500/15',
      text: 'text-rose-600 dark:text-rose-400',
      badge: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
    },
  };

  const c = colorMap[color] || colorMap.cyan;
  const clampedPercent = Math.min(Math.max(percent || 0, 0), 100);

  return (
    <div className="rounded-[10px] border border-zinc-200/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-white/[0.06] dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          {label}
        </p>
        <span
          className={`rounded-[10px] px-2 py-0.5 text-[11px] font-bold tabular-nums ${c.badge}`}
        >
          {clampedPercent}%
        </span>
      </div>
      <p className={`mt-2 text-2xl font-extrabold tabular-nums ${c.text}`}>
        {value}
      </p>
      <div className={`mt-3 h-2 overflow-hidden rounded-full ${c.track}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${c.bg}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  );
}
