'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

function generateTrendData(summary) {
  const confirmed = summary?.confirmed || 0;
  const pending = summary?.pending || 0;
  const total = confirmed + pending;
  const scale = Math.max(total, 40);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  return months.map((month, i) => {
    const progress = (i + 1) / 12;
    return {
      month,
      confirmed: Math.round(
        scale * progress * 0.6 * (0.8 + Math.sin(i * 0.5) * 0.2)
      ),
      pending: Math.round(
        scale * progress * 0.25 * (0.7 + Math.cos(i * 0.7) * 0.3)
      ),
    };
  });
}

const CHART_CARD =
  'rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-white/[0.06] dark:bg-white/[0.03]';

export function RegistrationTrendChart({ summary }) {
  const data = useMemo(() => generateTrendData(summary), [summary]);

  return (
    <div className={CHART_CARD}>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
        Registration Trend
      </p>
      <h3 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
        Activity Overview
      </h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradConfirmed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="currentColor"
              strokeOpacity={0.06}
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="month"
              tick={{ fill: 'currentColor', fillOpacity: 0.4, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'currentColor', fillOpacity: 0.4, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--admin-tooltip-bg, #fff)',
                border: '1px solid var(--admin-tooltip-border, #e2e8f0)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                fontSize: 13,
              }}
              labelStyle={{ fontWeight: 700, fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="confirmed"
              name="Confirmed"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#gradConfirmed)"
            />
            <Area
              type="monotone"
              dataKey="pending"
              name="Pending"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#gradPending)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const DONUT_COLORS = ['#6366f1', '#10b981', '#8b5cf6', '#06b6d4'];
const DONUT_LABELS = ['Pending', 'Confirmed', 'QR Issued', 'Checked In'];

export function StatusDonutChart({ summary }) {
  const data = useMemo(() => {
    const s = summary || {};
    return [
      { name: 'Pending', value: s.pending || 0 },
      { name: 'Confirmed', value: s.confirmed || 0 },
      { name: 'QR Issued', value: s.qrIssued || 0 },
      { name: 'Checked In', value: s.checkedIn || 0 },
    ].filter((d) => d.value > 0);
  }, [summary]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className={CHART_CARD + ' flex flex-col'}>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
        Status Distribution
      </p>
      <h3 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
        Breakdown
      </h3>
      <div className="mt-4 flex flex-1 items-center justify-center">
        <div className="relative h-52 w-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.length > 0 ? data : [{ name: 'Empty', value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={data.length > 1 ? 4 : 0}
                dataKey="value"
                strokeWidth={0}
              >
                {(data.length > 0 ? data : [{ name: 'Empty' }]).map(
                  (entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.name === 'Empty'
                          ? '#e2e8f0'
                          : DONUT_COLORS[
                              DONUT_LABELS.indexOf(entry.name) %
                                DONUT_COLORS.length
                            ]
                      }
                    />
                  )
                )}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--admin-tooltip-bg, #fff)',
                  border: '1px solid var(--admin-tooltip-border, #e2e8f0)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  fontSize: 13,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold tabular-nums text-slate-900 dark:text-slate-50">
              {total}
            </span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
              Total
            </span>
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
        {DONUT_LABELS.map((label, i) => {
          const d = data.find((d) => d.name === label);
          return (
            <div key={label} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: DONUT_COLORS[i] }}
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {label}
              </span>
              <span className="ml-auto text-xs font-bold tabular-nums text-slate-800 dark:text-slate-200">
                {d?.value || 0}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdminProgressCard({
  label,
  value,
  percent,
  color = 'cyan',
}) {
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
      badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-500',
      track: 'bg-amber-100 dark:bg-amber-500/15',
      text: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
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
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          {label}
        </p>
        <span
          className={`rounded-lg px-2 py-0.5 text-[11px] font-bold tabular-nums ${c.badge}`}
        >
          {clampedPercent}%
        </span>
      </div>
      <p
        className={`mt-2 text-2xl font-extrabold tabular-nums ${c.text}`}
      >
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
