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
  const fallbackKey = Object.keys(designationMap).find(
    (key) => key.replace(/\s+/g, '') === compressed
  );
  if (fallbackKey) return designationMap[fallbackKey];
  return '';
}

function resolveSpeakerPhoto(name, photoMap) {
  const normalized = normalizePersonName(name);
  if (photoMap[normalized]) return photoMap[normalized];
  const compressed = normalized.replace(/\s+/g, '');
  const fallbackKey = Object.keys(photoMap).find(
    (key) => key.replace(/\s+/g, '') === compressed
  );
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
  const normalized = String(time || '')
    .replace(/â€“/g, '-')
    .trim();
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
  if (
    session.format === 'opening' ||
    session.format === 'spotlight' ||
    session.format === 'keynote'
  )
    return 30;
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
        timeSortValue(item.time) > timeSortValue(session.time)
    )
    .sort((a, b) => timeSortValue(a.time) - timeSortValue(b.time))[0];

  const nextStartParts = nextSession ? parseTimeParts(nextSession.time) : null;
  const endParts =
    nextStartParts || addMinutes(startParts, fallbackDurationMinutes(session));
  const startDateTime = formatCalendarDateTime(session.day, startParts);
  const endDateTime = formatCalendarDateTime(session.day, endParts);
  const speakersLine = session.speakersDetailed?.length
    ? `Speakers: ${session.speakersDetailed.map((speaker) => speaker.name).join(', ')}`
    : '';
  const description = [
    session.topic,
    speakersLine,
    `Day: ${labels[session.day] || session.day}`,
  ]
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
          const title = String(session.title || '')
            .trim()
            .toLowerCase();
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
    [sessions, speakerDesignationMap, speakerPhotoMap]
  );

  const formats = useMemo(
    () => [...new Set(normalizedSessions.map((s) => s.format))],
    [normalizedSessions]
  );
  const venues = useMemo(
    () =>
      [...new Set(normalizedSessions.map((s) => s.venue || s.track))].sort(),
    [normalizedSessions]
  );
  const labels = useMemo(
    () => ({
      oct6: dayLabels?.oct6 || 'Oct 6 - Opening Reception',
      oct7: dayLabels?.oct7 || 'Oct 7 - Day 1',
      oct8: dayLabels?.oct8 || 'Oct 8 - Day 2',
    }),
    [dayLabels]
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
          ...session.speakersDetailed.map(
            (speaker) => `${speaker.name} ${speaker.title}`
          ),
        ]
          .join(' ')
          .toLowerCase();

        return searchText.includes(q);
      })
      .sort(
        (a, b) =>
          (DAY_ORDER[a.day] || 0) - (DAY_ORDER[b.day] || 0) ||
          timeSortValue(a.time) - timeSortValue(b.time)
      );
  }, [activeDay, format, normalizedSessions, query, venue]);

  const sessionsWithCalendar = useMemo(
    () =>
      filteredSessions.map((session) => ({
        ...session,
        calendar: buildCalendarMetadata(session, normalizedSessions, labels),
      })),
    [filteredSessions, labels, normalizedSessions]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(sessionsWithCalendar.length / SESSIONS_PER_PAGE)
  );
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPageSafe - 1) * SESSIONS_PER_PAGE;
    return sessionsWithCalendar.slice(
      startIndex,
      startIndex + SESSIONS_PER_PAGE
    );
  }, [currentPageSafe, sessionsWithCalendar]);

  return (
    <section className="agenda-root">
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
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
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

          <select
            className="filter-select"
            value={format}
            onChange={(e) => {
              setFormat(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Formats</option>
            {formats.map((fmt) => (
              <option key={fmt} value={fmt}>
                {FORMAT_LABELS[fmt] || fmt}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={venue}
            onChange={(e) => {
              setVenue(e.target.value);
              setCurrentPage(1);
            }}
          >
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

          <span className="results-info hidden md:inline-block">
            {sessionsWithCalendar.length} session
            {sessionsWithCalendar.length !== 1 ? 's' : ''}
          </span>
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
                  <div
                    key={session.id}
                    className={`session-card format-${session.format}`}
                  >
                    <div className="card-content">
                      <div className="card-top">
                        <div className="venue-badge">
                          {session.venue || session.track}
                        </div>
                        <span
                          className={`format-badge badge-${session.format}`}
                        >
                          {FORMAT_LABELS[session.format]}
                        </span>
                      </div>

                      <div className="card-meta">
                        <div className="meta-item">
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
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

                      {session.topic && (
                        <div className="session-topic">{session.topic}</div>
                      )}

                      <div className="session-venue-line">
                        {session.venue || session.track}
                      </div>

                      {session.calendar && (
                        <div className="session-actions">
                          <a
                            className="calendar-btn"
                            href={session.calendar.href}
                            download={session.calendar.downloadName}
                          >
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

                      {session.speakersDetailed &&
                        session.speakersDetailed.length > 0 && (
                          <div className="speakers-section">
                            <div className="speakers-label">Speakers</div>
                            <div className="speakers-list">
                              {session.speakersDetailed.map((speaker, idx) => (
                                <div key={idx} className="speaker-row">
                                  <div
                                    className="speaker-avatar relative"
                                    aria-hidden="true"
                                  >
                                    {speaker.photo ? (
                                      <Image
                                        src={speaker.photo}
                                        alt={speaker.name}
                                        fill
                                        sizes="58px"
                                      />
                                    ) : (
                                      <span>{speaker.name.charAt(0)}</span>
                                    )}
                                  </div>
                                  <div className="speaker-info">
                                    <div className="speaker-name">
                                      {speaker.name}
                                    </div>
                                    {speaker.title && (
                                      <div className="speaker-title">
                                        {speaker.title}
                                      </div>
                                    )}
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
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPageSafe === 1}
                  >
                    Previous
                  </button>
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
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
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
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
