'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { Filter, Search, Tag } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AttendeeCard from '@/components/attendees/attendee-card';
import AttendeeProfileDialog from '@/components/attendees/attendee-profile-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  attendeesDirectoryCopy,
  attendeeDirectoryConfig,
} from '@/data/attendees-page';
import { cn } from '@/lib/utils';
import {
  getAttendeeCategoryLabel,
  matchesAttendeeSearch,
} from '@/lib/attendees';

const hiddenCategoryFilters = new Set(
  attendeeDirectoryConfig.hiddenCategoryFilters
);

function StatPill({ label, value }) {
  return (
    <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-left backdrop-blur">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65">
        {label}
      </div>
      <div className="mt-1 text-lg font-black text-white">{value}</div>
    </div>
  );
}

function DirectoryPagination({ activePage, setCurrentPage, totalPages }) {
  if (totalPages <= 0) {
    return null;
  }

  const visiblePages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  ).slice(
    Math.max(0, activePage - 3),
    Math.min(totalPages, Math.max(5, activePage + 2))
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4 pt-2">
      <div className="text-sm font-medium text-stone-600 dark:text-slate-300">
        Page {activePage} of {totalPages}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={activePage === 1}
        >
          Previous
        </Button>
        {visiblePages.map((page) => (
          <Button
            key={page}
            variant={activePage === page ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'min-w-9 rounded-full',
              activePage === page &&
                'bg-rc-primary text-white hover:bg-rc-primary/90 dark:bg-amber-300 dark:text-stone-900'
            )}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() =>
            setCurrentPage((page) => Math.min(totalPages, page + 1))
          }
          disabled={activePage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default function AttendeesDirectory({ attendees }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [eventFilter, setEventFilter] = useState('All events');
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const pageSize = attendeeDirectoryConfig.pageSize;

  const categories = useMemo(() => {
    const values = attendees
      .map((attendee) => getAttendeeCategoryLabel(attendee.category))
      .filter(Boolean)
      .filter((category) => !hiddenCategoryFilters.has(category));

    return ['All categories', ...new Set(values)];
  }, [attendees]);

  const events = useMemo(() => {
    const values = attendees.flatMap((attendee) => attendee.events ?? []);
    return ['All events', ...new Set(values)];
  }, [attendees]);

  const filteredAttendees = useMemo(() => {
    return attendees
      .filter((attendee) =>
        matchesAttendeeSearch(attendee, deferredSearchQuery)
      )
      .filter((attendee) => {
        if (categoryFilter === 'All categories') {
          return true;
        }

        return getAttendeeCategoryLabel(attendee.category) === categoryFilter;
      })
      .filter((attendee) => {
        if (eventFilter === 'All events') {
          return true;
        }

        return attendee.events?.includes(eventFilter);
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [attendees, categoryFilter, deferredSearchQuery, eventFilter]);

  const visibleEvents = new Set(
    filteredAttendees.flatMap((attendee) => attendee.events ?? [])
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAttendees.length / pageSize)
  );
  const activePage = Math.min(currentPage, totalPages);
  const paginatedAttendees = filteredAttendees.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize
  );

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fffdf7_0%,#f4ecdf_35%,#f7f4ef_100%)] py-12 dark:bg-[linear-gradient(180deg,#0b1220_0%,#111827_45%,#0f172a_100%)]">
      <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(255,210,79,0.28),transparent_70%)]" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 md:px-6">
        <Card className="overflow-hidden rounded-[10px] border-stone-200/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/75">
          <CardContent className="px-5 py-5 md:px-8 md:py-7">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
                    {attendeesDirectoryCopy.eyebrow}
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-stone-950 dark:text-white md:text-3xl">
                    {attendeesDirectoryCopy.title}
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-stone-600 dark:text-slate-300 md:text-base">
                    {attendeesDirectoryCopy.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatPill label="Attendees" value={attendees.length} />
                  <StatPill label="Visible" value={filteredAttendees.length} />
                  <StatPill label="Categories" value={categories.length - 1} />
                  <StatPill label="Events" value={visibleEvents.size} />
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,.9fr)_minmax(0,.9fr)]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-slate-500" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder={attendeesDirectoryCopy.searchPlaceholder}
                    className="h-12 rounded-full border-stone-200 bg-white pl-11 pr-4 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>

                <label className="flex items-center gap-3 rounded-full border border-stone-200 bg-white px-4 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                  <Filter className="h-4 w-4 text-stone-400 dark:text-slate-500" />
                  <select
                    aria-label="Filter attendees by category"
                    value={categoryFilter}
                    onChange={(event) => {
                      setCategoryFilter(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-12 w-full bg-transparent text-sm text-stone-700 outline-none dark:text-slate-100"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-3 rounded-full border border-stone-200 bg-white px-4 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                  <Tag className="h-4 w-4 text-stone-400 dark:text-slate-500" />
                  <select
                    aria-label="Filter attendees by event"
                    value={eventFilter}
                    onChange={(event) => {
                      setEventFilter(event.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-12 w-full bg-transparent text-sm text-stone-700 outline-none dark:text-slate-100"
                  >
                    {events.map((eventName) => (
                      <option key={eventName} value={eventName}>
                        {eventName}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {paginatedAttendees.map((attendee, index) => (
              <motion.div
                key={attendee.id}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{
                  duration: 0.2,
                  delay: Math.min(index * 0.01, 0.18),
                }}
              >
                <AttendeeCard
                  attendee={attendee}
                  onViewProfile={setSelectedAttendee}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredAttendees.length === 0 ? (
          <Card className="rounded-[10px] border-dashed border-stone-300 bg-white/70 dark:border-slate-700 dark:bg-slate-950/70">
            <CardContent className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-center">
              <div className="text-lg font-black text-stone-900 dark:text-white">
                {attendeesDirectoryCopy.emptyTitle}
              </div>
              <p className="max-w-lg text-sm text-stone-600 dark:text-slate-300">
                {attendeesDirectoryCopy.emptyDescription}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {filteredAttendees.length > 0 ? (
          <DirectoryPagination
            activePage={activePage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        ) : null}

        <AnimatePresence>
          {selectedAttendee ? (
            <AttendeeProfileDialog
              key={selectedAttendee.id}
              attendee={selectedAttendee}
              onClose={() => setSelectedAttendee(null)}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
