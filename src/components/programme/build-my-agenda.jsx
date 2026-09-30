'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CalendarPlus,
  Check,
  Download,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import programmeAgendaUtils from '@/lib/programme-agenda-utils.cjs';
import agendaBuilderUtils from '@/lib/agenda-builder-utils.cjs';

const { sortProgrammeSessionsForAgenda } = programmeAgendaUtils;
const {
  buildAgendaIcs,
  findAgendaClashes,
  formatClock,
  formatDayHeading,
  getDaySubtitle,
  getSessionSpeakerNames,
  parseTimeRange,
} = agendaBuilderUtils;

const SELECTED_TAB = 'selected';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function shortDayLabel(label = '') {
  return String(label).split(' - ')[0].replace('October', 'Oct').trim();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

async function loadLogoDataUrl() {
  try {
    const resp = await fetch('/img/tasi-csr-logo.png');
    const blob = await resp.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function SessionRow({
  session,
  isSelected,
  clashesWith,
  formatLabel,
  onToggle,
}) {
  const range = parseTimeRange(session.time);
  const speakers = getSessionSpeakerNames(session);

  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={isSelected}
        onClick={() => onToggle(session.id)}
        className={cx(
          'group flex w-full items-start gap-4 rounded-[10px] border px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
          isSelected
            ? 'border-orange-300 bg-orange-50/70 dark:border-orange-800 dark:bg-orange-950/30'
            : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-950 dark:hover:border-stone-700 dark:hover:bg-stone-900'
        )}
      >
        <div className="w-14 shrink-0 pt-0.5 tabular-nums">
          <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
            {range ? formatClock(range.start) : session.time || 'TBD'}
          </div>
          {range?.hasExplicitEnd && (
            <div className="text-xs text-stone-400">
              {formatClock(range.end)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-stone-900 dark:text-stone-100">
            {session.title}
          </p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            {[session.venue || session.track, formatLabel]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {speakers.length > 0 && (
            <p className="mt-1 line-clamp-1 text-xs text-stone-600 dark:text-stone-300">
              {speakers.join(', ')}
            </p>
          )}
          {isSelected && clashesWith.length > 0 && (
            <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
              <span>
                Overlaps with {clashesWith.map((s) => s.title).join(', ')}
              </span>
            </p>
          )}
        </div>

        <span
          aria-hidden="true"
          className={cx(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
            isSelected
              ? 'border-orange-600 bg-orange-600 text-white'
              : 'border-stone-300 text-transparent group-hover:border-stone-400 dark:border-stone-600'
          )}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      </button>
    </li>
  );
}

export default function BuildMyAgenda({
  sessions,
  isOpen,
  onClose,
  dayLabels,
  dayDateMap = {},
  editionYear = '',
  formatLabels = {},
  selectedIds,
  onToggle,
  onSetMany,
  onClear,
}) {
  const dayKeys = useMemo(() => Object.keys(dayLabels || {}), [dayLabels]);
  const [activeTab, setActiveTab] = useState(dayKeys[0] || SELECTED_TAB);
  const [query, setQuery] = useState('');
  const [attendeeName, setAttendeeName] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const panelRef = useRef(null);

  const sortedSessions = useMemo(
    () => sortProgrammeSessionsForAgenda(sessions),
    [sessions]
  );
  const selectedSessions = useMemo(
    () => sortedSessions.filter((s) => selectedIds.has(s.id)),
    [selectedIds, sortedSessions]
  );
  const clashes = useMemo(
    () => findAgendaClashes(selectedSessions),
    [selectedSessions]
  );
  const countsByDay = useMemo(() => {
    const counts = {};
    for (const s of selectedSessions) counts[s.day] = (counts[s.day] || 0) + 1;
    return counts;
  }, [selectedSessions]);

  const visibleSessions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base =
      activeTab === SELECTED_TAB
        ? selectedSessions
        : sortedSessions.filter((s) => s.day === activeTab);
    if (!q) return base;
    return base.filter((s) =>
      [s.title, s.venue, s.track, s.description, ...getSessionSpeakerNames(s)]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [activeTab, query, selectedSessions, sortedSessions]);

  const visibleGroups = useMemo(() => {
    const groups = [];
    for (const session of visibleSessions) {
      const last = groups[groups.length - 1];
      if (last && last.dayKey === session.day) last.items.push(session);
      else groups.push({ dayKey: session.day, items: [session] });
    }
    return groups;
  }, [visibleSessions]);

  // Escape closes; the page behind stays put while the dialog is open.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fileBase = `TASI-${editionYear || 'Festival'}-My-Agenda`;
  const eventName = `TASI ${editionYear}`.trim();
  const allVisibleSelected =
    visibleSessions.length > 0 &&
    visibleSessions.every((s) => selectedIds.has(s.id));

  const handleDownloadPdf = async () => {
    if (selectedSessions.length === 0 || busy) return;
    setBusy('pdf');
    setError('');
    try {
      const [{ pdf }, { default: AgendaPdfDocument }, logoDataUrl] =
        await Promise.all([
          import('@react-pdf/renderer'),
          import('./agenda-pdf-document'),
          loadLogoDataUrl(),
        ]);
      const blob = await pdf(
        <AgendaPdfDocument
          attendeeName={attendeeName.trim()}
          sessions={selectedSessions}
          dayLabels={dayLabels}
          dayDateMap={dayDateMap}
          editionYear={editionYear}
          formatLabels={formatLabels}
          logoDataUrl={logoDataUrl}
        />
      ).toBlob();
      downloadBlob(blob, `${fileBase}.pdf`);
    } catch {
      setError('Could not create the PDF. Please try again.');
    } finally {
      setBusy('');
    }
  };

  const handleDownloadIcs = () => {
    if (selectedSessions.length === 0) return;
    const ics = buildAgendaIcs({
      sessions: selectedSessions,
      dayDateMap,
      eventName,
    });
    downloadBlob(
      new Blob([ics], { type: 'text/calendar;charset=utf-8' }),
      `${fileBase}.ics`
    );
  };

  const tabs = [
    ...dayKeys.map((key) => ({
      key,
      title: shortDayLabel(dayLabels[key]),
      subtitle: getDaySubtitle(dayLabels[key]),
      count: countsByDay[key] || 0,
    })),
    {
      key: SELECTED_TAB,
      title: 'My picks',
      subtitle: 'Review',
      count: selectedSessions.length,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-stone-950/60 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="build-agenda-title"
        tabIndex={-1}
        className="flex h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[10px] bg-white text-stone-900 shadow-2xl focus:outline-none sm:h-[85vh] sm:rounded-[10px] dark:bg-stone-950 dark:text-stone-100"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-6">
          <div>
            <h2
              id="build-agenda-title"
              className="text-lg font-bold tracking-tight"
            >
              Build my agenda
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Pick the sessions you want to attend. Your picks are saved on this
              device.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Day tabs + search */}
        <div className="border-b border-stone-200 px-5 sm:px-6 dark:border-stone-800">
          <div
            role="tablist"
            className="-mx-1 flex gap-1 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {tabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tab.key)}
                  className={cx(
                    'flex shrink-0 flex-col items-start rounded-[10px] px-3 py-2 text-left transition-colors',
                    active
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                      : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                  )}
                >
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    {tab.title}
                    {tab.count > 0 && (
                      <span
                        className={cx(
                          'rounded-full px-1.5 text-[11px] font-bold leading-4',
                          active
                            ? 'bg-orange-500 text-white'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                        )}
                      >
                        {tab.count}
                      </span>
                    )}
                  </span>
                  <span
                    className={cx(
                      'text-[11px]',
                      active
                        ? 'text-white/70 dark:text-stone-600'
                        : 'text-stone-400'
                    )}
                  >
                    {tab.subtitle}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pb-3">
            <label className="relative flex-1">
              <span className="sr-only">Search sessions</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search this list"
                className="w-full rounded-[10px] border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-sm placeholder:text-stone-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-stone-800 dark:bg-stone-900 dark:focus:bg-stone-900"
              />
            </label>
            {activeTab !== SELECTED_TAB && visibleSessions.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  onSetMany(
                    visibleSessions.map((s) => s.id),
                    !allVisibleSelected
                  )
                }
                className="shrink-0 text-sm font-semibold text-orange-700 hover:text-orange-800 dark:text-orange-400"
              >
                {allVisibleSelected ? 'Clear these' : 'Select all'}
              </button>
            )}
          </div>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto bg-stone-50/60 px-5 py-4 sm:px-6 dark:bg-stone-900/40">
          {visibleSessions.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <CalendarPlus className="h-8 w-8 text-stone-300" />
              <p className="mt-3 text-sm font-semibold text-stone-700 dark:text-stone-200">
                {activeTab === SELECTED_TAB && !query
                  ? 'No sessions picked yet'
                  : 'No sessions match your search'}
              </p>
              {activeTab === SELECTED_TAB && !query && (
                <p className="mt-1 text-sm text-stone-500">
                  Open a day and tap the sessions you want to attend.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {visibleGroups.map(({ dayKey, items }) => (
                <section key={dayKey}>
                  {activeTab === SELECTED_TAB && (
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">
                      {formatDayHeading(dayKey, dayDateMap) ||
                        dayLabels[dayKey]}
                    </h3>
                  )}
                  <ul className="flex flex-col gap-2">
                    {items.map((session) => (
                      <SessionRow
                        key={session.id}
                        session={session}
                        isSelected={selectedIds.has(session.id)}
                        clashesWith={clashes.get(session.id) || []}
                        formatLabel={formatLabels[session.format]}
                        onToggle={onToggle}
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 px-5 py-4 sm:px-6 dark:border-stone-800">
          {error && (
            <p className="mb-3 text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3">
              <input
                type="text"
                value={attendeeName}
                onChange={(event) => setAttendeeName(event.target.value)}
                placeholder="Name on PDF (optional)"
                aria-label="Name on PDF (optional)"
                className="w-full min-w-0 rounded-[10px] border border-stone-200 bg-white px-3 py-2 text-sm placeholder:text-stone-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:max-w-[240px] dark:border-stone-800 dark:bg-stone-900"
              />
              <span className="shrink-0 text-sm text-stone-500">
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  {selectedSessions.length}
                </span>{' '}
                selected
                {selectedSessions.length > 0 && (
                  <>
                    {' · '}
                    <button
                      type="button"
                      onClick={onClear}
                      className="font-medium text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline dark:hover:text-stone-200"
                    >
                      Clear
                    </button>
                  </>
                )}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownloadIcs}
                disabled={selectedSessions.length === 0}
                className="inline-flex flex-1 whitespace-nowrap items-center justify-center gap-2 rounded-[10px] border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-900"
              >
                <CalendarPlus className="h-4 w-4" />
                <span className="sm:hidden">Calendar</span>
                <span className="hidden sm:inline">Add to calendar</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={selectedSessions.length === 0 || busy === 'pdf'}
                className="inline-flex flex-1 whitespace-nowrap items-center justify-center gap-2 rounded-[10px] bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
              >
                {busy === 'pdf' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {busy === 'pdf' ? 'Preparing…' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
