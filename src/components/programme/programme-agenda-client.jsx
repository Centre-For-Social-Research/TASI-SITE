'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  BookmarkCheck,
  BookmarkPlus,
  CalendarPlus,
  Clock,
  Search,
} from 'lucide-react';
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { useFestivalClock } from '@/components/live/use-festival-clock';
import agendaBuilderUtils from '@/lib/agenda-builder-utils.cjs';
import liveProgramme from '@/lib/live-programme.cjs';
import programmeAgendaUtils from '@/lib/programme-agenda-utils.cjs';
import speakerDirectoryUtils from '@/lib/speaker-directory-utils.cjs';
import BuildMyAgenda from './build-my-agenda';
import styles from './programme-agenda.module.css';
import SessionShareButton from './session-share-button';

const {
  buildProgrammeSessionViewModels,
  getProgrammeSessionPath,
  sortProgrammeSessionsForAgenda,
  timeSortValue,
} = programmeAgendaUtils;
const { getSpeakerProfilePath } = speakerDirectoryUtils;
const { getEditionYear } = agendaBuilderUtils;
const { getSessionLiveStatus } = liveProgramme;

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
const DEFAULT_DAY_DATE_MAP = {
  oct6: '20251006',
  oct7: '20251007',
  oct8: '20251008',
};
const DEFAULT_DAY_LABELS = {
  oct6: 'Oct 6 - Opening Reception',
  oct7: 'Oct 7 - Day 1',
  oct8: 'Oct 8 - Day 2',
};
const EVENT_LOCATION = 'New Delhi, India';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function parseTimeAt(time, index) {
  const normalized = String(time || '')
    .replace(/[\u2013\u2014]/g, '-')
    .trim();
  const part = normalized.split('-')[index]?.trim();
  const match = part?.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  return { hours, minutes };
}

function parseTimeParts(time) {
  return parseTimeAt(time, 0);
}

// Sessions may declare an explicit range ("10:00-10:15"). When they do, that
// end time is authoritative for calendar links; otherwise we fall back to the
// next session in the same room, then to a per-format default.
function parseEndTimeParts(time) {
  return parseTimeAt(time, 1);
}

function addMinutes(timeParts, minutesToAdd) {
  const totalMinutes = timeParts.hours * 60 + timeParts.minutes + minutesToAdd;
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

function formatCalendarDateTime(day, timeParts, dayDateMap) {
  const date = dayDateMap[day];
  if (!date || !timeParts) return '';

  return `${date}T${String(timeParts.hours).padStart(2, '0')}${String(timeParts.minutes).padStart(2, '0')}00`;
}

function formatMicrosoftCalendarDateTime(day, timeParts, dayDateMap) {
  const date = dayDateMap[day];
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

function buildCalendarMetadata(session, allSessions, labels, dayDateMap) {
  const startParts = parseTimeParts(session.time);
  if (!startParts || !dayDateMap[session.day]) return null;

  const nextSession = allSessions
    .filter(
      (item) =>
        item.id !== session.id &&
        item.day === session.day &&
        (item.venue || item.track) === (session.venue || session.track) &&
        timeSortValue(item.time) > timeSortValue(session.time)
    )
    .sort((a, b) => timeSortValue(a.time) - timeSortValue(b.time))[0];

  const explicitEndParts = parseEndTimeParts(session.time);
  const nextStartParts = nextSession ? parseTimeParts(nextSession.time) : null;
  const endParts =
    explicitEndParts ||
    nextStartParts ||
    addMinutes(startParts, fallbackDurationMinutes(session));
  const startDateTime = formatCalendarDateTime(
    session.day,
    startParts,
    dayDateMap
  );
  const endDateTime = formatCalendarDateTime(session.day, endParts, dayDateMap);
  const microsoftStartDateTime = formatMicrosoftCalendarDateTime(
    session.day,
    startParts,
    dayDateMap
  );
  const microsoftEndDateTime = formatMicrosoftCalendarDateTime(
    session.day,
    endParts,
    dayDateMap
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

// Agenda picks persist per edition in this browser only. localStorage is the
// store; memoryAgenda covers browsers where storage is blocked.
const AGENDA_CHANGE_EVENT = 'tasi-agenda-change';
const memoryAgenda = new Map();

function readAgenda(storageKey) {
  try {
    return localStorage.getItem(storageKey) || '[]';
  } catch {
    return memoryAgenda.get(storageKey) || '[]';
  }
}

function parseAgenda(raw) {
  try {
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeAgenda(storageKey, value) {
  memoryAgenda.set(storageKey, value);
  try {
    localStorage.setItem(storageKey, value);
  } catch {
    // storage blocked; the in-memory copy keeps this visit working
  }
  window.dispatchEvent(new Event(AGENDA_CHANGE_EVENT));
}

function subscribeAgenda(callback) {
  window.addEventListener('storage', callback);
  window.addEventListener(AGENDA_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(AGENDA_CHANGE_EVENT, callback);
  };
}

function useSavedAgenda(storageKey) {
  const raw = useSyncExternalStore(
    subscribeAgenda,
    () => readAgenda(storageKey),
    () => '[]'
  );
  const selectedIds = useMemo(() => parseAgenda(raw), [raw]);

  // Read the store rather than the render snapshot so rapid clicks compose.
  const update = useCallback(
    (updater) => {
      const next = updater(parseAgenda(readAgenda(storageKey)));
      writeAgenda(storageKey, JSON.stringify([...next]));
    },
    [storageKey]
  );

  const toggle = useCallback(
    (id) =>
      update((next) => {
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    [update]
  );
  const setMany = useCallback(
    (ids, selected) =>
      update((next) => {
        for (const id of ids) {
          if (selected) next.add(id);
          else next.delete(id);
        }
        return next;
      }),
    [update]
  );
  const clear = useCallback(() => update(() => new Set()), [update]);

  return { selectedIds, toggle, setMany, clear };
}

export default function ProgrammeAgendaClient({
  sessions,
  dayLabels,
  speakerDesignationMap,
  speakerPhotoMap = {},
  receptionNotes = [],
  dayDateMap = DEFAULT_DAY_DATE_MAP,
  showLiveStatus = false,
  speakerEdition,
}) {
  const clock = useFestivalClock();
  const liveClock = showLiveStatus ? clock : null;
  const [showAgendaBuilder, setShowAgendaBuilder] = useState(false);
  const [activeDay, setActiveDay] = useState('all');
  const [query, setQuery] = useState('');
  const [format, setFormat] = useState('');
  const [venue, setVenue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const editionYear = getEditionYear(dayDateMap);
  const agenda = useSavedAgenda(`tasi-my-agenda-${editionYear || 'default'}`);
  const closeAgendaBuilder = useCallback(() => setShowAgendaBuilder(false), []);

  const normalizedSessions = useMemo(
    () =>
      buildProgrammeSessionViewModels({
        sessions,
        speakerDesignationMap,
        speakerPhotoMap,
        speakerEdition,
      }),
    [sessions, speakerDesignationMap, speakerPhotoMap, speakerEdition]
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
    () =>
      dayLabels && Object.keys(dayLabels).length > 0
        ? dayLabels
        : DEFAULT_DAY_LABELS,
    [dayLabels]
  );
  const dayKeys = useMemo(() => Object.keys(labels), [labels]);

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
        calendar: buildCalendarMetadata(
          session,
          normalizedSessions,
          labels,
          dayDateMap
        ),
      })),
    [dayDateMap, filteredSessions, labels, normalizedSessions]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(sessionsWithCalendar.length / SESSIONS_PER_PAGE)
  );
  const currentPageSafe = Math.min(currentPage, totalPages);

  const liveDayKey =
    liveClock === null
      ? null
      : (normalizedSessions.find(
          (session) => getSessionLiveStatus(session, liveClock) === 'live'
        )?.day ?? null);

  // Clears filters, opens today's tab and pages to the session on now.
  const jumpToNow = () => {
    const todays = sortProgrammeSessionsForAgenda(
      normalizedSessions.filter((session) => session.day === liveDayKey)
    );
    const index = todays.findIndex(
      (session) => getSessionLiveStatus(session, liveClock) === 'live'
    );
    setQuery('');
    setFormat('');
    setVenue('');
    setActiveDay(liveDayKey);
    setCurrentPage(Math.floor(Math.max(index, 0) / SESSIONS_PER_PAGE) + 1);
    window.setTimeout(() => {
      document
        .querySelector('[data-live-status="live"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };
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
                  {item.note && (
                    <p className={styles['reception-note']}>{item.note}</p>
                  )}
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
            {agenda.selectedIds.size > 0 && (
              <span className={styles['build-agenda-count']}>
                {agenda.selectedIds.size}
              </span>
            )}
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
          {dayKeys.map((dayKey) => (
            <button
              key={dayKey}
              className={cx(
                styles['day-tab'],
                activeDay === dayKey && styles.active
              )}
              onClick={() => {
                setActiveDay(dayKey);
                setCurrentPage(1);
              }}
            >
              {labels[dayKey]}
            </button>
          ))}
          {liveDayKey ? (
            <button
              type="button"
              className={styles['jump-to-now']}
              onClick={jumpToNow}
            >
              <span className={styles['live-dot']} aria-hidden="true" />
              Jump to now
            </button>
          ) : null}
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
                {paginatedSessions.map((session) => {
                  const liveStatus =
                    liveClock === null
                      ? null
                      : getSessionLiveStatus(session, liveClock);
                  return (
                    <div
                      key={session.id}
                      data-live-status={liveStatus || undefined}
                      className={cx(
                        styles['session-card'],
                        styles[`format-${session.format}`],
                        liveStatus === 'live' && styles['session-live'],
                        liveStatus === 'past' && styles['session-past']
                      )}
                    >
                      <div className={styles['card-content']}>
                        <div className={styles['card-top']}>
                          <div className={styles['venue-badge']}>
                            {session.venue || session.track}
                          </div>
                          {liveStatus === 'live' ? (
                            <span className={styles['live-badge']}>
                              <span
                                className={styles['live-dot']}
                                aria-hidden="true"
                              />
                              Live
                            </span>
                          ) : null}
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

                        <div className={styles['session-actions']}>
                          <button
                            type="button"
                            aria-pressed={agenda.selectedIds.has(session.id)}
                            onClick={() => agenda.toggle(session.id)}
                            className={cx(
                              styles['agenda-toggle'],
                              agenda.selectedIds.has(session.id) &&
                                styles['agenda-toggle-on']
                            )}
                          >
                            {agenda.selectedIds.has(session.id) ? (
                              <BookmarkCheck aria-hidden="true" />
                            ) : (
                              <BookmarkPlus aria-hidden="true" />
                            )}
                            <span>
                              {agenda.selectedIds.has(session.id)
                                ? 'In my agenda'
                                : 'Add to my agenda'}
                            </span>
                          </button>
                          {session.calendar && (
                            <>
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
                            </>
                          )}
                          <SessionShareButton
                            path={getProgrammeSessionPath(session)}
                            title={session.title}
                            className={styles['agenda-toggle']}
                          />
                        </div>

                        {session.speakersDetailed &&
                          session.speakersDetailed.length > 0 && (
                            <div className={styles['speakers-section']}>
                              <div className={styles['speakers-label']}>
                                Speakers
                              </div>
                              <div className={styles['speakers-list']}>
                                {session.speakersDetailed.map(
                                  (speaker, idx) => (
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
                                        {speaker.hasProfile === false ? (
                                          <span
                                            className={styles['speaker-name']}
                                          >
                                            {speaker.name}
                                          </span>
                                        ) : (
                                          <Link
                                            className={styles['speaker-name']}
                                            href={getSpeakerProfilePath(
                                              speaker
                                            )}
                                          >
                                            {speaker.name}
                                          </Link>
                                        )}
                                        {speaker.title && (
                                          <div
                                            className={styles['speaker-title']}
                                          >
                                            {speaker.title}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
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
        onClose={closeAgendaBuilder}
        dayLabels={labels}
        dayDateMap={dayDateMap}
        editionYear={editionYear}
        formatLabels={FORMAT_LABELS}
        selectedIds={agenda.selectedIds}
        onToggle={agenda.toggle}
        onSetMany={agenda.setMany}
        onClear={agenda.clear}
      />
    </section>
  );
}
