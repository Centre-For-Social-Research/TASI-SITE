'use client';

import { useState, useMemo } from 'react';

const FORMAT_LABELS = {
  opening: 'Opening',
  panel: 'Panel',
  keynote: 'Keynote',
  spotlight: 'Spotlight',
  fireside: 'Fireside',
  workshop: 'Workshop',
  roundtable: 'Roundtable',
  special: 'Special',
};

const DAY_NAMES = {
  oct6: 'October 6',
  oct7: 'October 7',
  oct8: 'October 8',
};

const DAY_ORDER = { oct6: 0, oct7: 1, oct8: 2 };

function normalizePersonName(value) {
  return value
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/\b(dr|mr|mrs|ms|smt|shri|professor|prof)\.?\b/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveDesignation(name, designationMap) {
  const normalized = normalizePersonName(name);
  if (designationMap[normalized]) return designationMap[normalized];
  const compressed = normalized.replace(/\s+/g, '');
  const fallbackKey = Object.keys(designationMap).find((key) => key.replace(/\s+/g, '') === compressed);
  if (fallbackKey) return designationMap[fallbackKey];
  return '';
}

function timeSortValue(time) {
  const normalized = String(time).replace(/–/g, '-').trim();
  const firstPart = normalized.split('-')[0].trim();
  const parts = firstPart.split(':');
  if (parts.length !== 2) return 0;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

export default function ProgrammeAgendaClient({ sessions, dayLabels, speakerDesignationMap }) {
  const [activeDay, setActiveDay] = useState('all');
  const [query, setQuery] = useState('');
  const [format, setFormat] = useState('');
  const [track, setTrack] = useState('');

  const normalizedSessions = useMemo(
    () =>
      sessions.map((session) => ({
        ...session,
        topic: session.description || '',
        speakersDetailed: session.speakers.map((speakerName) => ({
          name: speakerName,
          title: resolveDesignation(speakerName, speakerDesignationMap || {}),
          mod: false,
        })),
      })),
    [sessions, speakerDesignationMap],
  );

  const formats = useMemo(() => [...new Set(normalizedSessions.map((s) => s.format))], [normalizedSessions]);
  const tracks = useMemo(() => [...new Set(normalizedSessions.map((s) => s.track))].sort(), [normalizedSessions]);

  const filteredSessions = useMemo(() => {
    const q = query.trim().toLowerCase();

    return normalizedSessions
      .filter((session) => {
        if (activeDay !== 'all' && session.day !== activeDay) return false;
        if (format && session.format !== format) return false;
        if (track && session.track !== track) return false;
        if (!q) return true;

        const searchText = [
          session.title,
          session.topic,
          session.track,
          session.venue,
          ...session.speakersDetailed.map((speaker) => `${speaker.name} ${speaker.title}`),
        ]
          .join(' ')
          .toLowerCase();

        return searchText.includes(q);
      })
      .sort((a, b) => (DAY_ORDER[a.day] || 0) - (DAY_ORDER[b.day] || 0) || timeSortValue(a.time) - timeSortValue(b.time));
  }, [activeDay, format, normalizedSessions, query, track]);

  return (
    <section>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --coral: #d4572a;
          --coral-deep: #b84020;
          --coral-pale: #fff0ec;
          --peach: #fdf6ef;
          --peach-mid: #f5e4d0;
          --olive: #5c7a3e;
          --olive-dark: #3a5228;
          --olive-pale: #f0f5eb;
          --gold: #c8992a;
          --gold-pale: #fff8e6;
          --brown: #2d1f0e;
          --taupe: #7a6248;
          --sand: #f0e2cc;
          --border: #ede5d8;
          --white: #ffffff;
        }

        body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; background: var(--peach); color: var(--brown); }

        .page-header {
          background: linear-gradient(158deg, #fdf0e6 0%, #fdf6ef 50%, #f5e4d0 100%);
          border-bottom: 1px solid var(--sand);
          padding: 2.5rem 4rem;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .header-left .pretitle {
          font-family: 'DM Mono', monospace;
          font-size: 0.64rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--olive);
          display: flex;
          align-items: center;
          gap: 0.7rem;
          margin-bottom: 0.8rem;
        }
        .header-left .pretitle::before {
          content: ''; display: block; width: 1.6rem; height: 1px; background: var(--olive); opacity: 0.5;
        }
        .header-left h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.7rem, 3.5vw, 2.5rem);
          font-weight: 900;
          color: var(--brown);
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-bottom: 0.4rem;
        }
        .header-left h1 em { font-style: italic; color: var(--coral); }
        .header-left .sub { font-size: 0.9rem; color: var(--taupe); font-weight: 300; }

        .controls-bar {
          background: var(--white);
          border-bottom: 1px solid var(--border);
          padding: 1rem 4rem;
          display: flex;
          gap: 0.8rem;
          flex-wrap: wrap;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 60;
        }

        .search-wrap { flex: 1; min-width: 180px; position: relative; }
        .search-wrap svg { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--taupe); pointer-events: none; }
        .search-input {
          width: 100%; padding: 0.58rem 0.9rem 0.58rem 2.4rem;
          border: 1px solid var(--border); border-radius: 0;
          font-family: 'DM Sans', sans-serif; font-size: 0.85rem; color: var(--brown);
          background: var(--peach); outline: none; transition: border-color 0.2s;
        }
        .search-input::placeholder { color: var(--taupe); opacity: 0.55; }
        .search-input:focus { border-color: var(--coral); }

        .filter-select {
          padding: 0.58rem 2rem 0.58rem 0.85rem;
          border: 1px solid var(--border); border-radius: 0;
          font-family: 'DM Sans', sans-serif; font-size: 0.82rem; color: var(--brown);
          background: var(--peach); outline: none; cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a6248' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 0.65rem center; min-width: 130px;
          transition: border-color 0.2s;
        }
        .filter-select:focus { border-color: var(--coral); }

        .results-info {
          font-family: 'DM Mono', monospace; font-size: 0.68rem; color: var(--taupe);
          letter-spacing: 0.07em; white-space: nowrap; margin-left: auto;
        }

        .day-tabs {
          background: var(--white); border-bottom: 1px solid var(--border);
          padding: 0 4rem; display: flex; gap: 0; overflow-x: auto;
        }
        .day-tab {
          padding: 0.82rem 1.4rem; font-family: 'DM Sans', sans-serif; font-size: 0.82rem;
          font-weight: 500; color: var(--taupe); cursor: pointer; border: none;
          background: none; border-bottom: 2.5px solid transparent;
          transition: color 0.2s, border-color 0.2s; white-space: nowrap;
        }
        .day-tab:hover { color: var(--brown); }
        .day-tab.active { color: var(--coral); border-bottom-color: var(--coral); font-weight: 600; }

        .sessions-wrap { padding: 1.5rem 4rem 4rem; }
        .sessions-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .no-results {
          text-align: center; padding: 4rem 2rem; color: var(--taupe); font-size: 0.92rem;
        }

        .session-card {
          background: var(--white);
          border: 1.5px solid var(--border);
          border-left: 5px solid var(--coral);
          transition: box-shadow 0.2s, border-color 0.15s;
        }
        .session-card.format-workshop { border-left-color: var(--olive); }
        .session-card.format-fireside { border-left-color: var(--gold); }
        .session-card.format-keynote { border-left-color: var(--brown); }
        .session-card.format-spotlight { border-left-color: #b94a8a; }
        .session-card.format-roundtable { border-left-color: #6b5ea8; }
        .session-card.format-opening { border-left-color: #1a3fa3; }
        .session-card:hover { box-shadow: 0 3px 18px rgba(45,31,14,0.08); }

        .card-content { padding: 1.1rem 1.3rem; }

        .card-top {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; margin-bottom: 0.55rem; flex-wrap: wrap;
        }

        .card-meta {
          display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;
        }
        .meta-item {
          display: flex; align-items: center; gap: 0.3rem;
          font-family: 'DM Mono', monospace; font-size: 0.65rem;
          color: var(--taupe); letter-spacing: 0.05em;
        }
        .meta-item svg { flex-shrink: 0; opacity: 0.65; }
        .meta-sep { color: var(--border); font-size: 0.7rem; }

        .format-badge {
          font-family: 'DM Mono', monospace; font-size: 0.58rem;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 0.2rem 0.65rem; font-weight: 500; border-radius: 2px;
        }
        .badge-panel { background: var(--coral-pale); color: var(--coral-deep); }
        .badge-workshop { background: var(--olive-pale); color: var(--olive-dark); }
        .badge-fireside { background: var(--gold-pale); color: #8a6010; }
        .badge-keynote { background: #f0eee8; color: var(--brown); }
        .badge-spotlight { background: #fceef7; color: #9a2070; }
        .badge-roundtable { background: #f0eef8; color: #4a3a88; }
        .badge-opening { background: #e8f0ff; color: #1a3fa3; }
        .badge-special { background: #f0eee8; color: var(--brown); }

        .session-title {
          font-family: 'Playfair Display', serif;
          font-size: 1rem; font-weight: 700; color: var(--brown);
          line-height: 1.3; margin-bottom: 0.3rem;
        }
        .session-topic {
          font-size: 0.8rem; line-height: 1.65; color: var(--taupe);
          font-weight: 300; margin-bottom: 0.6rem;
        }

        .speakers-section {
          margin-top: 0.6rem; padding-top: 0.6rem; border-top: 1px solid var(--border);
        }

        .speakers-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.62rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--coral); margin-bottom: 0.5rem; font-weight: 500;
        }

        .speakers-list { display: flex; flex-direction: column; gap: 0.4rem; }

        .speaker-row {
          display: flex; align-items: flex-start; gap: 0.6rem; font-size: 0.75rem;
        }

        .speaker-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--coral); margin-top: 3px; flex-shrink: 0;
        }

        .speaker-info { flex: 1; }
        .speaker-name { font-weight: 600; color: var(--brown); }
        .speaker-title { color: var(--taupe); font-size: 0.7rem; font-weight: 300; }

        @media (max-width: 768px) {
          .page-header, .controls-bar, .day-tabs, .sessions-wrap { padding-left: 1.2rem; padding-right: 1.2rem; }
        }
      `}</style>

      <div className="page-header">
        <div className="header-left">
          <div className="pretitle">Trust & Safety India Festival 2025</div>
          <h1>
            Festival <em>Agenda</em>
          </h1>
          <p className="sub">Browse all programme sessions across the three days</p>
        </div>
      </div>

      <div className="controls-bar">
        <div className="search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sessions, speakers, topics…"
          />
        </div>

        <select className="filter-select" value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="">All Formats</option>
          {formats.map((fmt) => (
            <option key={fmt} value={fmt}>
              {FORMAT_LABELS[fmt] || fmt}
            </option>
          ))}
        </select>

        <select className="filter-select" value={track} onChange={(e) => setTrack(e.target.value)}>
          <option value="">All Tracks</option>
          {tracks.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <span className="results-info">{filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="day-tabs">
        <button
          className={`day-tab ${activeDay === 'all' ? 'active' : ''}`}
          onClick={() => setActiveDay('all')}
        >
          All Days
        </button>
        <button
          className={`day-tab ${activeDay === 'oct6' ? 'active' : ''}`}
          onClick={() => setActiveDay('oct6')}
        >
          Oct 6 — Opening Reception
        </button>
        <button
          className={`day-tab ${activeDay === 'oct7' ? 'active' : ''}`}
          onClick={() => setActiveDay('oct7')}
        >
          Oct 7 — Day 1
        </button>
        <button
          className={`day-tab ${activeDay === 'oct8' ? 'active' : ''}`}
          onClick={() => setActiveDay('oct8')}
        >
          Oct 8 — Day 2
        </button>
      </div>

      <div className="sessions-wrap">
        {filteredSessions.length === 0 ? (
          <div className="no-results">No sessions match your filters.</div>
        ) : (
          <div className="sessions-list">
            {filteredSessions.map((session) => (
              <div key={session.id} className={`session-card format-${session.format}`}>
                <div className="card-content">
                  <div className="card-top">
                    <div className="card-meta">
                      <div className="meta-item">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{session.time}</span>
                      </div>
                      <span className="meta-sep">·</span>
                      <div className="meta-item">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{session.venue}</span>
                      </div>
                      <span className="meta-sep">·</span>
                      <span className={`format-badge badge-${session.format}`}>{FORMAT_LABELS[session.format]}</span>
                    </div>
                  </div>

                  <div className="session-title">{session.title}</div>

                  {session.topic && <div className="session-topic">{session.topic}</div>}

                  {session.speakersDetailed && session.speakersDetailed.length > 0 && (
                    <div className="speakers-section">
                      <div className="speakers-label">Speakers & Panelists</div>
                      <div className="speakers-list">
                        {session.speakersDetailed.map((speaker, idx) => (
                          <div key={idx} className="speaker-row">
                            <div className="speaker-dot" />
                            <div className="speaker-info">
                              <div className="speaker-name">{speaker.name}</div>
                              {speaker.title && <div className="speaker-title">{speaker.title}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
