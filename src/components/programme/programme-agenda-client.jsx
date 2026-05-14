'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CalendarPlus, Clock, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import programmeAgendaUtils from '@/lib/programme-agenda-utils.cjs';
import speakerDirectoryUtils from '@/lib/speaker-directory-utils.cjs';
import BuildMyAgenda from './build-my-agenda';
import styles from './programme-agenda.module.css';

const {
  buildProgrammeSessionViewModels,
  getProgrammeSessionPath,
  sortProgrammeSessionsForAgenda,
  timeSortValue,
} = programmeAgendaUtils;
const { getSpeakerProfilePath } = speakerDirectoryUtils;

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

const SESSIONS_PER_PAGE = 8;
const DAY_DATE_MAP = {
  oct6: '20251006',
  oct7: '20251007',
  oct8: '20251008',
};
const EVENT_LOCATION = 'New Delhi, India';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function parseTimeParts(time) {
  const normalized = String(time || '')
    .replace(/[\u2013\u2014]/g, '-')
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

function formatMicrosoftCalendarDateTime(day, timeParts) {
  const date = DAY_DATE_MAP[day];
  if (!date || !timeParts) return '';

  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${String(timeParts.hours).padStart(2, '0')}:${String(timeParts.minutes).padStart(2, '0')}:00`;
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
  const microsoftStartDateTime = formatMicrosoftCalendarDateTime(
    session.day,
    startParts
  );
  const microsoftEndDateTime = formatMicrosoftCalendarDateTime(
    session.day,
    endParts
  );
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

  return {
    microsoftHref:
      `https://outlook.office.com/calendar/0/deeplink/compose?path=%2Fcalendar%2Faction%2Fcompose&rru=addevent` +
      `&subject=${encodeURIComponent(session.title || '')}` +
      `&startdt=${encodeURIComponent(microsoftStartDateTime)}` +
      `&enddt=${encodeURIComponent(microsoftEndDateTime)}` +
      `&body=${encodeURIComponent(description.replace(/\\n\\n/g, '\n\n'))}` +
      `&location=${encodeURIComponent(location)}`,
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
      buildProgrammeSessionViewModels({
        sessions,
        speakerDesignationMap,
        speakerPhotoMap,
      }),
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

    return sortProgrammeSessionsForAgenda(
      normalizedSessions.filter((session) => {
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
    <section className={styles['agenda-root']}>
      {receptionNotes.length > 0 && (
        <div className={styles['reception-wrap']}>
          <div className={styles.shell}>
            <div className={styles['reception-head']}>About Our Receptions</div>
            <div className={styles['reception-grid']}>
              {receptionNotes.map((item) => (
                <article key={item.day} className={styles['reception-card']}>
                  <p className={styles['reception-day']}>{item.day}</p>
                  <p className={styles['reception-venue']}>{item.venue}</p>
                  <p className={styles['reception-access']}>{item.access}</p>
                  <p className={styles['reception-copy']}>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={styles['controls-bar']}>
        <div className={cx(styles.shell, styles['controls-inner'])}>
          <div className={styles['search-wrap']}>
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <input
              className={styles['search-input']}
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
            className={styles['filter-select']}
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
            className={styles['filter-select']}
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
            className={styles['build-agenda-btn']}
            onClick={() => setShowAgendaBuilder(true)}
          >
            <CalendarPlus className="h-4 w-4" />
            Build My Agenda
          </button>

          <span
            className={cx(styles['results-info'], 'hidden md:inline-block')}
          >
            {sessionsWithCalendar.length} session
            {sessionsWithCalendar.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className={styles['day-tabs']}>
        <div className={cx(styles.shell, styles['day-tabs-inner'])}>
          <button
            className={cx(
              styles['day-tab'],
              activeDay === 'all' && styles.active
            )}
            onClick={() => {
              setActiveDay('all');
              setCurrentPage(1);
            }}
          >
            All Days
          </button>
          <button
            className={cx(
              styles['day-tab'],
              activeDay === 'oct6' && styles.active
            )}
            onClick={() => {
              setActiveDay('oct6');
              setCurrentPage(1);
            }}
          >
            {labels.oct6}
          </button>
          <button
            className={cx(
              styles['day-tab'],
              activeDay === 'oct7' && styles.active
            )}
            onClick={() => {
              setActiveDay('oct7');
              setCurrentPage(1);
            }}
          >
            {labels.oct7}
          </button>
          <button
            className={cx(
              styles['day-tab'],
              activeDay === 'oct8' && styles.active
            )}
            onClick={() => {
              setActiveDay('oct8');
              setCurrentPage(1);
            }}
          >
            {labels.oct8}
          </button>
        </div>
      </div>

      <div className={styles['sessions-wrap']}>
        <div className={styles.shell}>
          {sessionsWithCalendar.length === 0 ? (
            <div className={styles['no-results']}>
              No sessions match your filters.
            </div>
          ) : (
            <>
              <div className={styles['sessions-list']}>
                {paginatedSessions.map((session) => (
                  <div
                    key={session.id}
                    className={cx(
                      styles['session-card'],
                      styles[`format-${session.format}`]
                    )}
                  >
                    <div className={styles['card-content']}>
                      <div className={styles['card-top']}>
                        <div className={styles['venue-badge']}>
                          {session.venue || session.track}
                        </div>
                        <span
                          className={cx(
                            styles['format-badge'],
                            styles[`badge-${session.format}`]
                          )}
                        >
                          {FORMAT_LABELS[session.format]}
                        </span>
                      </div>

                      <div className={styles['card-meta']}>
                        <div className={styles['meta-item']}>
                          <Clock aria-hidden="true" />
                          <span>{session.time}</span>
                        </div>
                        <span className={styles['meta-sep']}>•</span>
                        <div className={styles['meta-item']}>
                          <span>{labels[session.day] || session.day}</span>
                        </div>
                      </div>

                      <Link
                        className={styles['session-title']}
                        href={getProgrammeSessionPath(session)}
                      >
                        {session.title}
                      </Link>

                      {session.topic && (
                        <div className={styles['session-topic']}>
                          {session.topic}
                        </div>
                      )}

                      <div className={styles['session-venue-line']}>
                        {session.venue || session.track}
                      </div>

                      {session.calendar && (
                        <div className={styles['session-actions']}>
                          <a
                            className={styles['calendar-btn']}
                            href={session.calendar.microsoftHref}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <CalendarPlus />
                            <span>Add to Calendar</span>
                          </a>
                          <a
                            className={styles['calendar-btn']}
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
                          <div className={styles['speakers-section']}>
                            <div className={styles['speakers-label']}>
                              Speakers
                            </div>
                            <div className={styles['speakers-list']}>
                              {session.speakersDetailed.map((speaker, idx) => (
                                <div
                                  key={idx}
                                  className={styles['speaker-row']}
                                >
                                  <div
                                    className={cx(
                                      styles['speaker-avatar'],
                                      'relative'
                                    )}
                                    aria-hidden="true"
                                  >
                                    {speaker.photo ? (
                                      <Image
                                        src={speaker.photo}
                                        alt=""
                                        fill
                                        sizes="58px"
                                      />
                                    ) : (
                                      <span>{speaker.name.charAt(0)}</span>
                                    )}
                                  </div>
                                  <div className={styles['speaker-info']}>
                                    <Link
                                      className={styles['speaker-name']}
                                      href={getSpeakerProfilePath(speaker)}
                                    >
                                      {speaker.name}
                                    </Link>
                                    {speaker.title && (
                                      <div className={styles['speaker-title']}>
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
                <div className={styles['pagination-wrap']}>
                  <button
                    type="button"
                    className={styles['pagination-btn']}
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
                      className={cx(
                        styles['pagination-btn'],
                        currentPageSafe === page && styles.active
                      )}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={styles['pagination-btn']}
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
        dayLabels={labels}
      />
    </section>
  );
}
