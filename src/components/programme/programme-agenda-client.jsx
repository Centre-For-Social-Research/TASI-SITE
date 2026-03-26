'use client';

import Image from 'next/image';
import { CalendarPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import BuildMyAgenda from './build-my-agenda';

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

const DAY_ORDER = { oct6: 0, oct7: 1, oct8: 2 };
const SESSIONS_PER_PAGE = 8;
const DAY_DATE_MAP = {
  oct6: '20251006',
  oct7: '20251007',
  oct8: '20251008',
};
const EVENT_TIMEZONE = 'Asia/Kolkata';
const EVENT_LOCATION = 'New Delhi, India';

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

function resolveSpeakerPhoto(name, photoMap) {
  const normalized = normalizePersonName(name);
  if (photoMap[normalized]) return photoMap[normalized];
  const compressed = normalized.replace(/\s+/g, '');
  const fallbackKey = Object.keys(photoMap).find((key) => key.replace(/\s+/g, '') === compressed);
  if (fallbackKey) return photoMap[fallbackKey];
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

function parseTimeParts(time) {
  const normalized = String(time || '').replace(/â€“/g, '-').trim();
  const firstPart = normalized.split('-')[0].trim();
  const match = firstPart.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  return { hours, minutes };
}

function addMinutes(timeParts, minutesToAdd) {
  const totalMinutes = timeParts.hours * 60 + timeParts.minutes + minutesToAdd;
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

function formatCalendarDateTime(day, timeParts) {
  const date = DAY_DATE_MAP[day];
  if (!date || !timeParts) return '';

  return `${date}T${String(timeParts.hours).padStart(2, '0')}${String(timeParts.minutes).padStart(2, '0')}00`;
}

function fallbackDurationMinutes(session) {
  const title = String(session.title || '').toLowerCase();
  if (title.includes('lunch')) return 60;
  if (title.includes('coffee')) return 30;
  if (session.format === 'opening' || session.format === 'spotlight' || session.format === 'keynote') return 30;
  if (session.format === 'fireside') return 45;
  return 60;
}

function slugifyFileName(value) {
  const slug = String(value || 'session')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'session';
}

function buildCalendarMetadata(session, allSessions, labels) {
  const startParts = parseTimeParts(session.time);
  if (!startParts || !DAY_DATE_MAP[session.day]) return null;

  const nextSession = allSessions
    .filter(
      (item) =>
        item.id !== session.id &&
        item.day === session.day &&
        (item.venue || item.track) === (session.venue || session.track) &&
        timeSortValue(item.time) > timeSortValue(session.time),
    )
    .sort((a, b) => timeSortValue(a.time) - timeSortValue(b.time))[0];

  const nextStartParts = nextSession ? parseTimeParts(nextSession.time) : null;
  const endParts = nextStartParts || addMinutes(startParts, fallbackDurationMinutes(session));
  const startDateTime = formatCalendarDateTime(session.day, startParts);
  const endDateTime = formatCalendarDateTime(session.day, endParts);
  const speakersLine = session.speakersDetailed?.length
    ? `Speakers: ${session.speakersDetailed.map((speaker) => speaker.name).join(', ')}`
    : '';
  const description = [session.topic, speakersLine, `Day: ${labels[session.day] || session.day}`]
    .filter(Boolean)
    .join('\\n\\n');
  const location = `${session.venue || session.track}, ${EVENT_LOCATION}`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TASI//Programme//EN',
    'CALSCALE:GREGORIAN',
    `X-WR-TIMEZONE:${EVENT_TIMEZONE}`,
    'BEGIN:VEVENT',
    `UID:${session.id}@tasi-2025`,
    `SUMMARY:${String(session.title || '').replace(/\n/g, ' ')}`,
    `DTSTART;TZID=${EVENT_TIMEZONE}:${startDateTime}`,
    `DTEND;TZID=${EVENT_TIMEZONE}:${endDateTime}`,
    `LOCATION:${location.replace(/\n/g, ' ')}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return {
    downloadName: `${slugifyFileName(session.title)}.ics`,
    href: `data:text/calendar;charset=utf-8,${encodeURIComponent(icsLines.join('\r\n'))}`,
    googleHref:
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent(session.title || '')}` +
      `&dates=${encodeURIComponent(`${startDateTime}/${endDateTime}`)}` +
      `&details=${encodeURIComponent(description.replace(/\\n\\n/g, '\n\n'))}` +
      `&location=${encodeURIComponent(location)}`,
  };
}

export default function ProgrammeAgendaClient({
  sessions,
  dayLabels,
  speakerDesignationMap,
  speakerPhotoMap = {},
  receptionNotes = [],
}) {
  const [showAgendaBuilder, setShowAgendaBuilder] = useState(false);
  const [activeDay, setActiveDay] = useState('all');
  const [query, setQuery] = useState('');
  const [format, setFormat] = useState('');
  const [venue, setVenue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedSessions = useMemo(
    () =>
      sessions
        .filter((session) => {
          const title = String(session.title || '').trim().toLowerCase();
          return title !== 'emcee' && title !== 'registration + tea/coffee';
        })
        .map((session) => ({
          ...session,
          topic: session.description || '',
          speakersDetailed: session.speakers.map((speakerName) => ({
            name: speakerName,
            title: resolveDesignation(speakerName, speakerDesignationMap || {}),
            photo: resolveSpeakerPhoto(speakerName, speakerPhotoMap || {}),
            mod: false,
          })),
        })),
    [sessions, speakerDesignationMap, speakerPhotoMap],
  );

  const formats = useMemo(() => [...new Set(normalizedSessions.map((s) => s.format))], [normalizedSessions]);
  const venues = useMemo(() => [...new Set(normalizedSessions.map((s) => s.venue || s.track))].sort(), [normalizedSessions]);
  const labels = useMemo(
    () => ({
      oct6: dayLabels?.oct6 || 'Oct 6 - Opening Reception',
      oct7: dayLabels?.oct7 || 'Oct 7 - Day 1',
      oct8: dayLabels?.oct8 || 'Oct 8 - Day 2',
    }),
    [dayLabels],
  );

  const filteredSessions = useMemo(() => {
    const q = query.trim().toLowerCase();

    return normalizedSessions
      .filter((session) => {
        if (activeDay !== 'all' && session.day !== activeDay) return false;
        if (format && session.format !== format) return false;
        if (venue && (session.venue || session.track) !== venue) return false;
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
  }, [activeDay, format, normalizedSessions, query, venue]);

  const sessionsWithCalendar = useMemo(
    () =>
      filteredSessions.map((session) => ({
        ...session,
        calendar: buildCalendarMetadata(session, normalizedSessions, labels),
      })),
    [filteredSessions, labels, normalizedSessions],
  );

  const totalPages = Math.max(1, Math.ceil(sessionsWithCalendar.length / SESSIONS_PER_PAGE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPageSafe - 1) * SESSIONS_PER_PAGE;
    return sessionsWithCalendar.slice(startIndex, startIndex + SESSIONS_PER_PAGE);
  }, [currentPageSafe, sessionsWithCalendar]);

  return (
    <section className="agenda-root">
      <style>{`
        .agenda-root {
          --coral: #c2410c;
          --coral-deep: #9a3412;
          --coral-pale: #ffedd5;
          --peach: #fafaf9;
          --peach-mid: #f5f5f4;
          --olive: #57534e;
          --olive-dark: #44403c;
          --olive-pale: #f5f5f4;
          --gold: #a16207;
          --gold-pale: #fef3c7;
          --brown: #1c1917;
          --taupe: #57534e;
          --sand: #e7e5e4;
          --border: #e7e5e4;
          --white: #ffffff;
          background: var(--peach);
          color: var(--brown);
        }

        .dark .agenda-root {
          --coral: #fb923c;
          --coral-deep: #fdba74;
          --coral-pale: rgba(251, 146, 60, 0.16);
          --peach: #0c0a09;
          --peach-mid: #1c1917;
          --olive: #a8a29e;
          --olive-dark: #d6d3d1;
          --olive-pale: rgba(168, 162, 158, 0.12);
          --gold: #fbbf24;
          --gold-pale: rgba(251, 191, 36, 0.16);
          --brown: #f5f5f4;
          --taupe: #d6d3d1;
          --sand: #292524;
          --border: #292524;
          --white: #1c1917;
        }

        .shell {
          width: 100%;
          max-width: 80rem;
          margin: 0 auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }

        .controls-bar {
          background: var(--white);
          border-bottom: 1px solid var(--border);
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 60;
        }

        .controls-inner {
          display: flex;
          gap: 0.8rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-wrap { flex: 1; min-width: 180px; position: relative; }
        .search-wrap svg { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--taupe); pointer-events: none; }
        .search-input {
          width: 100%; padding: 0.58rem 0.9rem 0.58rem 2.4rem;
          border: 1px solid var(--border); border-radius: 10px;
          font-family: inherit; font-size: 0.85rem; color: var(--brown);
          background: var(--peach); outline: none; transition: border-color 0.2s;
        }
        .search-input::placeholder { color: var(--taupe); opacity: 0.55; }
        .search-input:focus { border-color: var(--coral); }

        .filter-select {
          padding: 0.58rem 2rem 0.58rem 0.85rem;
          border: 1px solid var(--border); border-radius: 10px;
          font-family: inherit; font-size: 0.82rem; color: var(--brown);
          background: var(--peach); outline: none; cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a6248' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 0.65rem center; min-width: 130px;
          transition: border-color 0.2s;
        }
        .filter-select:focus { border-color: var(--coral); }

.build-agenda-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.58rem 1rem;
            background-color: var(--coral);
            color: var(--white);
            border: none;
            border-radius: 10px;
            font-family: inherit;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
            margin-left: auto;
          }
          .build-agenda-btn:hover { background-color: var(--coral-deep); }
          .build-agenda-btn svg { margin-right: 0.5rem; }

          .results-info {
            font-family: inherit; font-size: 0.72rem; color: var(--taupe);
            letter-spacing: 0.07em; white-space: nowrap; margin-left: 0.5rem;
          font-weight: 600;
        }

        .day-tabs {
          background: var(--white); border-bottom: 1px solid var(--border);
        }

        .day-tabs-inner {
          display: flex;
          gap: 0;
          overflow-x: auto;
        }
        .day-tab {
          padding: 0.82rem 1.4rem; font-family: inherit; font-size: 0.82rem;
          font-weight: 500; color: var(--taupe); cursor: pointer; border: none;
          background: none; border-bottom: 2.5px solid transparent;
          transition: color 0.2s, border-color 0.2s; white-space: nowrap;
        }
        .day-tab:hover { color: var(--brown); }
        .day-tab.active { color: var(--coral); border-bottom-color: var(--coral); font-weight: 600; }

        .reception-wrap {
          padding: 1.25rem 0;
          border-bottom: 1px solid var(--border);
          background: var(--peach);
        }
        .reception-head {
          font-size: 0.74rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--coral);
          font-weight: 700;
          margin-bottom: 0.8rem;
        }
        .reception-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.75rem;
        }
        .reception-card {
          border: 1px solid var(--border);
          background: var(--white);
          border-radius: 10px;
          padding: 0.9rem 0.95rem;
        }
        .reception-day {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--brown);
          margin-bottom: 0.2rem;
        }
        .reception-venue {
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--coral);
          margin-bottom: 0.35rem;
        }
        .reception-access {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--brown);
          margin-bottom: 0.45rem;
        }
        .reception-copy {
          font-size: 0.78rem;
          color: var(--taupe);
          line-height: 1.5;
        }

        .sessions-wrap { padding: 1.5rem 0 4rem; }
        .sessions-list { display: flex; flex-direction: column; gap: 1rem; }
        .no-results {
          text-align: center; padding: 4rem 2rem; color: var(--taupe); font-size: 0.92rem;
        }

        .session-card {
          background: var(--white);
          border: 1px solid #ddd6cf;
          border-radius: 0.5rem;
          transition: box-shadow 0.2s, border-color 0.15s, transform 0.15s;
        }
        .session-card.format-workshop { box-shadow: inset 0 0 0 1px rgba(87, 83, 78, 0.08); }
        .session-card.format-fireside { box-shadow: inset 0 0 0 1px rgba(161, 98, 7, 0.08); }
        .session-card.format-keynote { box-shadow: inset 0 0 0 1px rgba(28, 25, 23, 0.08); }
        .session-card.format-spotlight { box-shadow: inset 0 0 0 1px rgba(185, 74, 138, 0.08); }
        .session-card.format-roundtable { box-shadow: inset 0 0 0 1px rgba(107, 94, 168, 0.08); }
        .session-card.format-opening { box-shadow: inset 0 0 0 1px rgba(26, 63, 163, 0.08); }
        .session-card:hover { box-shadow: 0 10px 28px rgba(28, 25, 23, 0.07); transform: translateY(-1px); }

        .card-content { padding: 1.6rem 1.6rem 1.45rem; }

        .card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.9rem;
          flex-wrap: wrap;
        }

        .venue-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.35rem 0.72rem;
          border-radius: 10px;
          background: #0f8b8d;
          color: #fff;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          line-height: 1;
        }

        .card-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          align-items: center;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-family: inherit;
          font-size: 0.78rem;
          color: var(--brown);
          font-weight: 500;
        }
        .meta-item svg { flex-shrink: 0; opacity: 0.7; width: 0.8rem; height: 0.8rem; }
        .meta-sep { color: #a8a29e; font-size: 0.9rem; }

        .format-badge {
          font-family: inherit;
          font-size: 0.62rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.34rem 0.62rem;
          font-weight: 700;
          border-radius: 10px;
          border: 1px solid transparent;
        }
        .badge-panel { background: var(--coral-pale); color: var(--coral-deep); border-color: rgba(194, 65, 12, 0.15); }
        .badge-workshop { background: var(--olive-pale); color: var(--olive-dark); border-color: rgba(87, 83, 78, 0.12); }
        .badge-fireside { background: var(--gold-pale); color: #8a6010; border-color: rgba(161, 98, 7, 0.14); }
        .badge-keynote { background: #f0eee8; color: var(--brown); border-color: rgba(28, 25, 23, 0.1); }
        .badge-spotlight { background: #fceef7; color: #9a2070; border-color: rgba(154, 32, 112, 0.12); }
        .badge-roundtable { background: #f0eef8; color: #4a3a88; border-color: rgba(74, 58, 136, 0.12); }
        .badge-opening { background: #e8f0ff; color: #1a3fa3; border-color: rgba(26, 63, 163, 0.12); }
        .badge-special { background: #f0eee8; color: var(--brown); border-color: rgba(28, 25, 23, 0.1); }

        .session-title {
          font-family: inherit;
          font-size: 1.65rem;
          font-weight: 800;
          color: var(--brown);
          line-height: 1.2;
          margin-bottom: 0.7rem;
        }
        .session-topic {
          font-size: 0.92rem;
          line-height: 1.7;
          color: var(--taupe);
          font-weight: 400;
          margin-bottom: 0.8rem;
          max-width: 70rem;
        }

        .session-venue-line {
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--brown);
          margin-bottom: 0.9rem;
        }

        .session-actions {
          display: flex;
          gap: 0.65rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .calendar-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          border-radius: 999px;
          border: 1px solid rgba(194, 65, 12, 0.18);
          background: var(--coral-pale);
          color: var(--coral-deep);
          padding: 0.55rem 0.9rem;
          font-size: 0.78rem;
          font-weight: 700;
          line-height: 1;
          text-decoration: none;
          transition: transform 0.15s, border-color 0.2s, background 0.2s;
        }

        .calendar-btn:hover {
          border-color: var(--coral);
          transform: translateY(-1px);
        }

        .calendar-btn svg {
          width: 0.9rem;
          height: 0.9rem;
        }

        .speakers-section {
          margin-top: 0.35rem;
          padding-top: 0.35rem;
        }

        .speakers-label {
          display: none;
        }

        .speakers-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem 1.2rem;
        }

        .speaker-row {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          min-width: 0;
        }

        .speaker-avatar {
          width: 3.6rem;
          height: 3.6rem;
          border-radius: 999px;
          border: 1px solid #d6d3d1;
          background: linear-gradient(135deg, var(--coral-pale), var(--olive-pale));
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--coral-deep);
          font-size: 1.05rem;
          font-weight: 700;
          box-shadow: 0 4px 16px rgba(28, 25, 23, 0.08);
        }

        .speaker-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .speaker-info { flex: 1; min-width: 0; }
        .speaker-name {
          font-weight: 800;
          color: var(--brown);
          font-size: 0.8rem;
          line-height: 1.35;
        }
        .speaker-title {
          color: var(--taupe);
          font-size: 0.72rem;
          font-weight: 400;
          line-height: 1.45;
          white-space: pre-line;
        }

        .pagination-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.55rem;
          flex-wrap: wrap;
          margin-top: 1.5rem;
        }

        .pagination-btn {
          border: 1px solid var(--border);
          background: var(--white);
          color: var(--brown);
          border-radius: 999px;
          padding: 0.58rem 0.9rem;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, color 0.2s;
        }

        .pagination-btn:hover:not(:disabled) {
          border-color: var(--coral);
          color: var(--coral-deep);
        }

        .pagination-btn.active {
          background: var(--coral);
          border-color: var(--coral);
          color: white;
        }

        .pagination-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        @media (min-width: 768px) {
          .shell {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
        }

        @media (max-width: 767px) {
          .card-content { padding: 1.15rem 1rem 1.05rem; }
          .session-title { font-size: 1.2rem; }
          .speakers-list { grid-template-columns: 1fr; }
        }
      `}</style>

      {receptionNotes.length > 0 && (
        <div className="reception-wrap">
          <div className="shell">
            <div className="reception-head">About Our Receptions</div>
            <div className="reception-grid">
              {receptionNotes.map((item) => (
                <article key={item.day} className="reception-card">
                  <p className="reception-day">{item.day}</p>
                  <p className="reception-venue">{item.venue}</p>
                  <p className="reception-access">{item.access}</p>
                  <p className="reception-copy">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="controls-bar">
        <div className="shell controls-inner">
          <div className="search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="search-input"
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search sessions, speakers, topics..."
            />
          </div>

          <select className="filter-select" value={format} onChange={(e) => {
            setFormat(e.target.value);
            setCurrentPage(1);
          }}>
            <option value="">All Formats</option>
            {formats.map((fmt) => (
              <option key={fmt} value={fmt}>
                {FORMAT_LABELS[fmt] || fmt}
              </option>
            ))}
          </select>

          <select className="filter-select" value={venue} onChange={(e) => {
            setVenue(e.target.value);
            setCurrentPage(1);
          }}>
            <option value="">All Venues</option>
            {venues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

            <button 
              className="build-agenda-btn"
              onClick={() => setShowAgendaBuilder(true)}
            >
              <CalendarPlus className="h-4 w-4" />
              Build My Agenda
            </button>

            <span className="results-info hidden md:inline-block">{sessionsWithCalendar.length} session{sessionsWithCalendar.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="day-tabs">
          <div className="shell day-tabs-inner">
            <button
              className={`day-tab ${activeDay === 'all' ? 'active' : ''}`}
              onClick={() => {
                setActiveDay('all');
                setCurrentPage(1);
              }}
            >
              All Days
          </button>
          <button
            className={`day-tab ${activeDay === 'oct6' ? 'active' : ''}`}
            onClick={() => {
              setActiveDay('oct6');
              setCurrentPage(1);
            }}
          >
            {labels.oct6}
          </button>
          <button
            className={`day-tab ${activeDay === 'oct7' ? 'active' : ''}`}
            onClick={() => {
              setActiveDay('oct7');
              setCurrentPage(1);
            }}
          >
            {labels.oct7}
          </button>
          <button
            className={`day-tab ${activeDay === 'oct8' ? 'active' : ''}`}
            onClick={() => {
              setActiveDay('oct8');
              setCurrentPage(1);
            }}
          >
            {labels.oct8}
          </button>
        </div>
      </div>

      <div className="sessions-wrap">
        <div className="shell">
          {sessionsWithCalendar.length === 0 ? (
            <div className="no-results">No sessions match your filters.</div>
          ) : (
            <>
              <div className="sessions-list">
                {paginatedSessions.map((session) => (
                  <div key={session.id} className={`session-card format-${session.format}`}>
                    <div className="card-content">
                      <div className="card-top">
                        <div className="venue-badge">{session.venue || session.track}</div>
                        <span className={`format-badge badge-${session.format}`}>{FORMAT_LABELS[session.format]}</span>
                      </div>

                      <div className="card-meta">
                        <div className="meta-item">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>{session.time}</span>
                        </div>
                        <span className="meta-sep">•</span>
                        <div className="meta-item">
                          <span>{labels[session.day] || session.day}</span>
                        </div>
                      </div>

                      <div className="session-title">{session.title}</div>

                      {session.topic && <div className="session-topic">{session.topic}</div>}

                      <div className="session-venue-line">{session.venue || session.track}</div>

                      {session.calendar && (
                        <div className="session-actions">
                          <a className="calendar-btn" href={session.calendar.href} download={session.calendar.downloadName}>
                            <CalendarPlus />
                            <span>Add to Calendar</span>
                          </a>
                          <a
                            className="calendar-btn"
                            href={session.calendar.googleHref}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <CalendarPlus />
                            <span>Google Calendar</span>
                          </a>
                        </div>
                      )}

                      {session.speakersDetailed && session.speakersDetailed.length > 0 && (
                        <div className="speakers-section">
                          <div className="speakers-label">Speakers</div>
                          <div className="speakers-list">
                            {session.speakersDetailed.map((speaker, idx) => (
                              <div key={idx} className="speaker-row">
                                <div className="speaker-avatar relative" aria-hidden="true">
                                  {speaker.photo ? (
                                    <Image src={speaker.photo} alt={speaker.name} fill sizes="58px" />
                                  ) : (
                                    <span>{speaker.name.charAt(0)}</span>
                                  )}
                                </div>
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
              {totalPages > 1 && (
                <div className="pagination-wrap">
                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPageSafe === 1}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={`pagination-btn ${currentPageSafe === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="pagination-btn"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPageSafe === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BuildMyAgenda 
        sessions={normalizedSessions} 
        isOpen={showAgendaBuilder} 
        onClose={() => setShowAgendaBuilder(false)} 
      />
    </section>
  );
}
