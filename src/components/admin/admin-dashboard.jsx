'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/* ── Seeded mini-sparkline generator (deterministic for hydration) ─────── */
function makeSpark(seed, points = 48, base = 8, amp = 6) {
  let s = seed >>> 0;
  const rng = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
  return Array.from({ length: points }, (_, i) => {
    const t = i / points;
    return Math.max(0, Math.floor(base + Math.sin(t * Math.PI * 2) * amp * 0.4 + (rng() - 0.5) * amp));
  });
}

const SPARK_PENDING  = makeSpark(1013, 48, 10, 6);
const SPARK_CHECKINS = makeSpark(2026, 60, 5, 4);
const SPARK_QUEUE    = makeSpark(3141, 40, 12, 8);

/* ── Sparkline SVG ──────────────────────────────────────────────────────── */
function Sparkline({ data, width = 200, height = 36, stroke = 'var(--adm-accent)', fill = 'var(--adm-accent-soft)', live = false }) {
  const path = useMemo(() => {
    if (!data?.length) return { d: '', area: '', last: [0, 0] };
    const min = Math.min(...data); const max = Math.max(...data);
    const span = max - min || 1;
    const step = width / (data.length - 1);
    const pts = data.map((v, i) => [i * step, height - ((v - min) / span) * (height - 4) - 2]);
    const d = pts.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' ');
    return { d, area: d + ` L ${width} ${height} L 0 ${height} Z`, last: pts[pts.length - 1] };
  }, [data, width, height]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ display: 'block' }}>
      <path d={path.area} fill={fill} />
      <path d={path.d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {live && path.last && (
        <g transform={`translate(${path.last[0]} ${path.last[1]})`}>
          <circle r="6" fill={stroke} opacity="0.18">
            <animate attributeName="r" values="3;8;3" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle r="2.2" fill={stroke} />
        </g>
      )}
    </svg>
  );
}

/* ── Rolling counter ────────────────────────────────────────────────────── */
function Counter({ value, duration = 800 }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const from = fromRef.current; const to = value; const start = performance.now();
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (k < 1) raf = requestAnimationFrame(tick); else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{display.toLocaleString()}</>;
}

/* ── Big number tile ─────────────────────────────────────────────────────── */
function BigNumber({ label, value, spark, sparkLive = false, accent = false, delta, deltaDir = 'up', last = false }) {
  return (
    <div style={{
      padding: '22px', borderRight: last ? 'none' : '1px solid var(--adm-line)',
      display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="adm-eyebrow">{label}</div>
        {delta && (
          <span className="adm-mono" style={{ fontSize: 10, color: deltaDir === 'up' ? 'var(--adm-ok)' : 'var(--adm-bad)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            {deltaDir === 'up' ? '↑' : '↓'} {delta}
          </span>
        )}
      </div>
      <div className="adm-mono" style={{
        fontSize: 52, fontWeight: 500, lineHeight: 0.95,
        letterSpacing: '-0.04em',
        color: accent ? 'var(--adm-accent)' : 'var(--adm-ink)',
        fontFeatureSettings: '"zero","ss01","tnum"',
      }}>
        <Counter value={value} />
      </div>
      <div style={{ marginTop: 'auto' }}>
        <Sparkline
          data={spark}
          width={200}
          height={36}
          live={sparkLive}
          stroke={accent ? 'var(--adm-accent)' : 'var(--adm-ink-2)'}
          fill={accent ? 'var(--adm-accent-soft)' : 'rgba(255,255,255,0.04)'}
        />
      </div>
    </div>
  );
}

/* ── Live pulse hero ─────────────────────────────────────────────────────── */
function LivePulseHero({ summary }) {
  const pending  = summary.pending  || 0;
  const checkins = summary.checkedIn || 0;
  const qrQueue  = Math.max((summary.confirmed || 0) - (summary.qrIssued || 0), 0);

  return (
    <div style={{ border: '1px solid var(--adm-line)', borderRadius: 10, background: 'var(--adm-panel)', overflow: 'hidden' }}>
      {/* Strip header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        padding: '10px 22px', borderBottom: '1px solid var(--adm-line)',
        background: 'linear-gradient(90deg, var(--adm-accent-soft), transparent 40%)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="adm-pulse-dot" />
          <span className="adm-eyebrow" style={{ color: 'var(--adm-accent)', letterSpacing: '0.2em' }}>
            LIVE · OPERATIONS PULSE
          </span>
          <span className="adm-mono" style={{ fontSize: 11, color: 'var(--adm-ink-3)' }}>
            STREAM OK · 30s AUTO-REFRESH
          </span>
        </span>
        <div className="adm-dash-range-btns" style={{ display: 'flex', gap: 6 }}>
          {['Last 24h', 'Last 7d', 'T-178 → T-0'].map((label) => (
            <button key={label} style={{
              padding: '5px 10px', borderRadius: 10,
              border: '1px solid var(--adm-line)', background: 'var(--adm-panel-2)',
              color: 'var(--adm-ink-2)', fontFamily: 'var(--adm-mono)',
              fontSize: 10, letterSpacing: '0.06em', cursor: 'pointer',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* 3 big numbers */}
      <div className="adm-dash-big-numbers" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
        <BigNumber label="PENDING · REVIEW QUEUE"  value={pending}  delta="-3 · 1h" deltaDir="up" spark={SPARK_PENDING}  accent sparkLive />
        <BigNumber label="LIVE · CHECK-INS TODAY"  value={checkins} delta="+27 · 5m" deltaDir="up" spark={SPARK_CHECKINS} sparkLive />
        <BigNumber label="PASSES · DELIVERY QUEUE" value={qrQueue}  delta="-6 · 1h" deltaDir="up" spark={SPARK_QUEUE} last />
      </div>

      {/* Scrolling ticker */}
      <div style={{
        padding: '8px 0', borderTop: '1px solid var(--adm-line)',
        fontFamily: 'var(--adm-mono)', fontSize: 11, color: 'var(--adm-ink-3)',
        overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative',
        maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
      }}>
        <div className="adm-live-ticker" style={{ display: 'inline-block', paddingLeft: '100%' }}>
          {[
            { type: 'speaker', name: 'Abhishek Singh',   role: 'Additional Secretary, MeitY, Govt. of India' },
            { type: 'theme',   label: 'Theme 01',        desc: 'Responsible AI governance and regulation' },
            { type: 'speaker', name: 'Akash Pugalia',    role: 'Global Executive, TP' },
            { type: 'partner', name: 'Booking.com',      desc: 'Corporate Partner · Netherlands' },
            { type: 'speaker', name: 'Amelia Wierda',    role: 'Legal Counsel for Human Rights, Booking.com' },
            { type: 'theme',   label: 'Theme 02',        desc: 'Platform accountability and safety-by-design' },
            { type: 'speaker', name: 'Abby Roberts',     role: 'Project Manager, INHOPE' },
            { type: 'partner', name: 'Meta',             desc: 'Corporate Partner · Technology Platform' },
            { type: 'speaker', name: 'Andras Molnar',    role: 'Senior Digital Policy Manager, TUM Think Tank' },
            { type: 'theme',   label: 'Theme 03',        desc: 'Online fraud, scams, and financial exploitation' },
            { type: 'speaker', name: 'Anne Collier',     role: 'Founder & Executive Director, Net Safety Collaborative' },
            { type: 'partner', name: 'Teleperformance',  desc: 'Corporate Partner · Digital Business Services' },
            { type: 'speaker', name: 'Akansha Kasera',   role: 'Senior Market Engagement Manager, GSMA' },
            { type: 'theme',   label: 'Theme 04',        desc: 'Gender-based violence and digital safety' },
            { type: 'speaker', name: 'Anshul Tewari',    role: 'Founder & CEO, Youth Ki Awaaz' },
            { type: 'partner', name: 'Snapchat',         desc: 'Corporate Partner · United States' },
          ].concat([
            { type: 'speaker', name: 'Abhishek Singh',   role: 'Additional Secretary, MeitY, Govt. of India' },
            { type: 'theme',   label: 'Theme 01',        desc: 'Responsible AI governance and regulation' },
          ]).map((item, i) => (
            <span key={i} style={{ marginRight: 40, color: 'var(--adm-ink-2)' }}>
              <span style={{ color: 'var(--adm-accent)', fontWeight: 600 }}>
                {item.type === 'speaker' ? 'SPEAKER' : item.type === 'theme' ? item.label : 'PARTNER'}
              </span>
              {'  '}
              <span style={{ color: 'var(--adm-ink)' }}>{item.name || item.desc?.split(' · ')[0]}</span>
              {' · '}
              <span style={{ color: 'var(--adm-ink-3)' }}>{item.role || item.desc}</span>
              {'  ·  '}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Horizontal progress bar ─────────────────────────────────────────────── */
function Bar({ value, max, color = 'var(--adm-accent)', height = 5 }) {
  const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  return (
    <div style={{ height, background: 'var(--adm-line)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 10, transition: 'width .6s cubic-bezier(.4,.2,.2,1)' }} />
    </div>
  );
}

/* ── Action feed ─────────────────────────────────────────────────────────── */
function ActionFeed({ summary, jobs }) {
  const items = useMemo(() => {
    const out = [];
    const failedJobs = jobs.filter((j) => j?.status === 'needs_retry' || j?.failed_items > 0);
    failedJobs.slice(0, 2).forEach((j) => {
      out.push({
        kind: 'attention',
        title: `${j.failed_items} passes failed to deliver on ${j.job_id || 'job'}`,
        detail: `Batch "${j.job_kind || 'email batch'}". Bounced emails — resend required.`,
        time: '2d ago',
      });
    });
    if ((summary.confirmed || 0) > (summary.qrIssued || 0)) {
      const gap = summary.confirmed - (summary.qrIssued || 0);
      out.push({
        kind: 'attention',
        title: `${gap} confirmed registration${gap > 1 ? 's' : ''} still without QR passes`,
        detail: 'Pass generator may be stalled. Check delivery worker.',
        time: 'now',
      });
    }
    if ((summary.pending || 0) > 5) {
      out.push({
        kind: 'info',
        title: `${summary.pending} applications awaiting review`,
        detail: 'Oldest application may be overdue. Review pending queue.',
        time: 'ongoing',
      });
    }
    const running = jobs.filter((j) => j?.status === 'running');
    if (running.length) {
      out.push({
        kind: 'info',
        title: `${running.length} email job${running.length > 1 ? 's' : ''} currently running`,
        detail: running.map((j) => j.job_kind || j.job_id).join(', '),
        time: 'live',
      });
    }
    if (out.length === 0) {
      out.push({ kind: 'info', title: 'All systems clear', detail: 'No pending decisions or failed deliveries.', time: 'now' });
    }
    return out.slice(0, 6);
  }, [summary, jobs]);

  const attention = items.filter((i) => i.kind === 'attention').length;

  return (
    <div style={{ border: '1px solid var(--adm-line)', borderRadius: 10, background: 'var(--adm-panel)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--adm-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="adm-eyebrow" style={{ color: 'var(--adm-accent)', marginBottom: 4 }}>NEEDS YOU NOW</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--adm-ink)' }}>
            {attention > 0 ? `${attention} item${attention > 1 ? 's' : ''} need attention` : 'Operations normal'}
          </div>
        </div>
      </div>
      <div>
        {items.map((item, i) => (
          <div key={i} className="adm-row" style={{
            display: 'grid', gridTemplateColumns: '8px 1fr auto',
            gap: 14, padding: '14px 18px',
            borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--adm-line)',
            alignItems: 'flex-start',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: 999, marginTop: 7,
              background: item.kind === 'attention' ? 'var(--adm-accent)' : 'var(--adm-ink-3)',
            }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--adm-ink)', marginBottom: 3 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: 'var(--adm-ink-3)', lineHeight: 1.5 }}>{item.detail}</div>
            </div>
            <div className="adm-mono" style={{ fontSize: 10, color: 'var(--adm-ink-4)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
              {item.time.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Registration funnel ─────────────────────────────────────────────────── */
function Funnel({ summary }) {
  const total = (summary.confirmed || 0) + (summary.pending || 0) + (summary.waitlisted || 0) + (summary.rejected || 0);
  const stages = [
    { label: 'Submitted',    value: total || 0,                 color: 'var(--adm-ink-2)' },
    { label: 'Under review', value: summary.pending || 0,       color: 'var(--adm-warn)' },
    { label: 'Confirmed',    value: summary.confirmed || 0,     color: 'var(--adm-accent)' },
    { label: 'Pass issued',  value: summary.qrIssued || 0,      color: 'var(--adm-ok)' },
    { label: 'Checked in',   value: summary.checkedIn || 0,     color: 'var(--adm-info)' },
  ];
  const max = Math.max(...stages.map((s) => s.value), 1);
  const conversion = total > 0 ? ((summary.checkedIn || 0) / total * 100).toFixed(1) : '0.0';

  return (
    <div style={{ border: '1px solid var(--adm-line)', borderRadius: 10, background: 'var(--adm-panel)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--adm-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="adm-eyebrow" style={{ marginBottom: 4 }}>FUNNEL</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--adm-ink)' }}>Registration → Check-in</div>
        </div>
        <span className="adm-mono" style={{ fontSize: 11, color: 'var(--adm-ink-3)' }}>{conversion}% CONVERSION</span>
      </div>
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {stages.map((s) => (
          <div key={s.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--adm-ink-2)' }}>{s.label}</span>
              <span className="adm-mono" style={{ fontSize: 12, color: 'var(--adm-ink)' }}>{s.value}</span>
            </div>
            <Bar value={s.value} max={max} color={s.color} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Status grid ─────────────────────────────────────────────────────────── */
function StatusGrid({ summary }) {
  const items = [
    { label: 'Total registered', value: (summary.confirmed || 0) + (summary.pending || 0) + (summary.waitlisted || 0) + (summary.rejected || 0), color: 'var(--adm-ink-2)' },
    { label: 'Confirmed',        value: summary.confirmed  || 0, color: 'var(--adm-accent)' },
    { label: 'Pending review',   value: summary.pending    || 0, color: 'var(--adm-warn)' },
    { label: 'Waitlisted',       value: summary.waitlisted || 0, color: 'var(--adm-info)' },
    { label: 'Passes issued',    value: summary.qrIssued   || 0, color: 'var(--adm-ok)' },
    { label: 'Checked in',       value: summary.checkedIn  || 0, color: 'var(--adm-ok)' },
  ];
  return (
    <div className="adm-dash-status-grid" style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
    }}>
      {items.map((item) => (
        <div key={item.label} style={{
          padding: '16px 18px', borderRadius: 10,
          border: '1px solid var(--adm-line)', background: 'var(--adm-panel)',
        }}>
          <div className="adm-eyebrow" style={{ marginBottom: 8 }}>{item.label}</div>
          <div className="adm-mono" style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.03em', color: item.color }}>
            {(item.value || 0).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Email jobs summary ──────────────────────────────────────────────────── */
function JobsPanel({ jobs }) {
  if (!jobs.length) return null;

  const statusColor = { done: 'var(--adm-ok)', running: 'var(--adm-accent)', queued: 'var(--adm-info)', needs_retry: 'var(--adm-bad)' };
  const statusLabel = { done: 'DONE', running: 'RUNNING', queued: 'QUEUED', needs_retry: 'RETRY' };

  return (
    <div style={{ border: '1px solid var(--adm-line)', borderRadius: 10, background: 'var(--adm-panel)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--adm-line)' }}>
        <div className="adm-eyebrow" style={{ marginBottom: 4 }}>EMAIL JOBS</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--adm-ink)' }}>
          {jobs.filter((j) => j?.status === 'running').length} running · {jobs.length} total
        </div>
      </div>
      <div style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <tbody>
            {jobs.slice(0, 6).map((job, i) => {
              const color = statusColor[job.status] || 'var(--adm-ink-3)';
              const pct = job.total > 0 ? Math.round((job.sent / job.total) * 100) : 0;
              return (
                <tr key={job.id || i} className="adm-row" style={{ borderBottom: i === Math.min(jobs.length, 6) - 1 ? 'none' : '1px solid var(--adm-line)' }}>
                  <td style={{ padding: '10px 18px' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--adm-ink)' }}>{job.job_kind || job.id}</div>
                    <div className="adm-mono" style={{ fontSize: 10, color: 'var(--adm-ink-3)', marginTop: 2 }}>{job.id}</div>
                  </td>
                  <td style={{ padding: '10px 14px', width: 120 }}>
                    <Bar value={job.sent || 0} max={job.total || 1} color={color} />
                    <div className="adm-mono" style={{ fontSize: 10, color: 'var(--adm-ink-3)', marginTop: 4 }}>
                      {job.sent || 0}/{job.total || 0}
                    </div>
                  </td>
                  <td style={{ padding: '10px 18px', textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 8px', borderRadius: 10,
                      background: color + '22', color, border: '1px solid ' + color + '44',
                      fontFamily: 'var(--adm-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: 999, background: 'currentColor' }} />
                      {statusLabel[job.status] || job.status?.toUpperCase() || '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Main dashboard ──────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [data, setData] = useState({
    summary: { pending: 0, confirmed: 0, qrIssued: 0, checkedIn: 0, waitlisted: 0, rejected: 0 },
    jobs: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [regRes, jobsRes] = await Promise.all([
          fetch('/api/admin/registrations?pageSize=1', { cache: 'no-store' }),
          fetch('/api/admin/passes/jobs', { cache: 'no-store' }),
        ]);
        const [regJson, jobsJson] = await Promise.all([
          regRes.json().catch(() => ({})),
          jobsRes.json().catch(() => ({})),
        ]);
        if (cancelled) return;
        setData({
          summary: regJson?.summary || regJson?.data?.summary || regJson?.meta?.summary || {},
          jobs: Array.isArray(jobsJson?.data) ? jobsJson.data : [],
          loading: false,
          error: null,
        });
      } catch (e) {
        if (!cancelled) setData((d) => ({ ...d, loading: false, error: e.message }));
      }
    }
    void load();
    const timer = setInterval(() => void load(), 30000);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);

  const { summary, jobs, loading } = data;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {[280, 200, 160].map((h, i) => (
          <div key={i} style={{ height: h, borderRadius: 10, background: 'var(--adm-panel)', border: '1px solid var(--adm-line)', animation: 'adm-fade-up 0.4s ease-out forwards', opacity: 0, animationDelay: i * 60 + 'ms' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <LivePulseHero summary={summary} />
      <div className="adm-dash-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 22 }}>
        <ActionFeed summary={summary} jobs={jobs} />
        <Funnel summary={summary} />
      </div>
      <StatusGrid summary={summary} />
      {jobs.length > 0 && <JobsPanel jobs={jobs} />}
    </div>
  );
}
