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
  Legend,
} from 'recharts';

function generateTrendData(summary) {
  const confirmed = summary?.confirmed || 0;
  const pending = summary?.pending || 0;
  const qrIssued = summary?.qrIssued || 0;
  const checkedIn = summary?.checkedIn || 0;
  const total = confirmed + pending + qrIssued + checkedIn;
  const scale = Math.max(total, 40);

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
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

export function RegistrationTrendChart({ summary }) {
  const data = useMemo(() => generateTrendData(summary), [summary]);

  return (
    <div className="rounded-xl border border-[#1e2a45] bg-[#111a2e] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#5a6b8a]">
        Registration Trend
      </p>
      <h3 className="mt-1 text-lg font-bold text-slate-50">
        Activity Overview
      </h3>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradConfirmed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4899" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#ec4899" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e2a45" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#5a6b8a', fontSize: 12 }}
              axisLine={{ stroke: '#1e2a45' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#5a6b8a', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#162040',
                border: '1px solid #1e2a45',
                borderRadius: '10px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
              labelStyle={{ color: '#94a3b8', fontWeight: 600, fontSize: 12 }}
              itemStyle={{ color: '#e2e8f0', fontSize: 13 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value) => (
                <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="confirmed"
              name="Confirmed"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#gradConfirmed)"
            />
            <Area
              type="monotone"
              dataKey="pending"
              name="Pending"
              stroke="#ec4899"
              strokeWidth={2}
              fill="url(#gradPending)"
            />
          </AreaChart>
        </ResponsiveContainer>
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
      track: 'bg-cyan-500/20',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-400',
    },
    emerald: {
      bg: 'bg-emerald-500',
      track: 'bg-emerald-500/20',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-500',
      track: 'bg-amber-500/20',
      text: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-400',
    },
    rose: {
      bg: 'bg-rose-500',
      track: 'bg-rose-500/20',
      text: 'text-rose-400',
      badge: 'bg-rose-500/20 text-rose-400',
    },
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <div className="rounded-xl border border-[#1e2a45] bg-[#111a2e] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-2xl font-bold tabular-nums ${c.text}`}>
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-400">{label}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${c.badge}`}
        >
          {percent}%
        </span>
      </div>
      <div className={`mt-3 h-1.5 w-full overflow-hidden rounded-full ${c.track}`}>
        <div
          className={`h-full rounded-full ${c.bg} transition-all duration-500`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}
