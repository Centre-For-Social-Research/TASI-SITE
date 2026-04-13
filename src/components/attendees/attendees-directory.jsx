'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import {
  Building2,
  Filter,
  Search,
  Tag,
  UserRound,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  getAttendeeBucket,
  getAttendeeCategoryLabel,
  getAttendeeInitials,
  getBucketClasses,
  matchesAttendeeSearch,
} from '@/lib/attendees';

const EXCLUDED_CATEGORY_FILTERS = new Set([
  'Panelist (7th Oct)',
  'Industry / Online Registration',
  'Uncategorised',
  'Panelist',
  'Online Registration',
  'Panelist / Non-Profit',
  'Sponsor/Industry',
  'Industry',
  'GoI',
  'ACTS',
  'Panelist / Industry',
  'NGO',
  'Online Registrations',
  'VIP/GoI',
]);

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

export default function AttendeesDirectory({ attendees }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [eventFilter, setEventFilter] = useState('All events');
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const pageSize = 16;

  const categories = useMemo(() => {
    const values = attendees
      .map((attendee) => getAttendeeCategoryLabel(attendee.category))
      .filter(Boolean)
      .filter((category) => !EXCLUDED_CATEGORY_FILTERS.has(category));

    return ['All categories', ...new Set(values)];
  }, [attendees]);

  const events = useMemo(() => {
    const values = attendees.flatMap((attendee) => attendee.events ?? []);
    return ['All events', ...new Set(values)];
  }, [attendees]);

  const filteredAttendees = useMemo(() => {
    return attendees
      .filter((attendee) => matchesAttendeeSearch(attendee, deferredSearchQuery))
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

  const totalPages = Math.max(1, Math.ceil(filteredAttendees.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedAttendees = filteredAttendees.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize
  );

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fffdf7_0%,#f4ecdf_35%,#f7f4ef_100%)] py-12 dark:bg-[linear-gradient(180deg,#0b1220_0%,#111827_45%,#0f172a_100%)]">
      <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(255,210,79,0.28),transparent_70%)]" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 md:px-6">
        <Card className="overflow-hidden border-stone-200/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/75">
          <CardContent className="px-5 py-5 md:px-8 md:py-7">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-3xl space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
                    Public Attendees
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-stone-950 dark:text-white md:text-3xl">
                    Browse the festival community in one place
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-stone-600 dark:text-slate-300 md:text-base">
                    Search across the consolidated TASI attendee list, explore by
                    category and event, and open each profile for the full set of
                    public details captured in the master guest workbook.
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
                    placeholder="Search attendees by name, organisation, event, or note..."
                    className="h-12 rounded-full border-stone-200 bg-white pl-11 pr-4 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>

                <label className="flex items-center gap-3 rounded-full border border-stone-200 bg-white px-4 shadow-sm dark:border-slate-700 dark:bg-slate-950">
                  <Filter className="h-4 w-4 text-stone-400 dark:text-slate-500" />
                  <select
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
            {paginatedAttendees.map((attendee, index) => {
              const bucket = getAttendeeBucket(
                attendee.category,
                attendee.events ?? []
              );

              return (
                <motion.div
                  key={attendee.id}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.01, 0.18) }}
                >
                  <Card className="h-full border-stone-200/80 bg-white/90 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-950/85">
                    <CardHeader className="gap-3 px-4">
                      <div className="flex items-start justify-between gap-3">
                        <Avatar className="h-11 w-11 border border-stone-200 bg-[linear-gradient(135deg,#fff2ce_0%,#f6d6ff_100%)] dark:border-slate-700 dark:bg-[linear-gradient(135deg,#311338_0%,#18243d_100%)]">
                          <AvatarFallback className="bg-transparent text-sm font-black text-stone-900 dark:text-white">
                            {getAttendeeInitials(attendee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <Badge
                          variant="outline"
                          className={cn(
                            'rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em]',
                            getBucketClasses(bucket)
                          )}
                        >
                          {bucket}
                        </Badge>
                      </div>
                      <div className="space-y-1.5">
                        <CardTitle className="line-clamp-2 text-lg font-black leading-tight text-stone-950 dark:text-white">
                          {attendee.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-xs leading-5 text-stone-600 dark:text-slate-300">
                          {getAttendeeCategoryLabel(attendee.category)}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="flex h-full flex-col gap-4 px-4">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-stone-400 dark:text-slate-500" />
                          <div className="min-w-0">
                            <div className="line-clamp-2 text-sm font-semibold text-stone-900 dark:text-white">
                              {attendee.organisation || 'Organisation not listed'}
                            </div>
                            <div className="line-clamp-2 text-xs text-stone-500 dark:text-slate-400">
                              {attendee.designation || 'Designation not listed'}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(attendee.events ?? []).slice(0, 3).map((eventName) => (
                            <Badge
                              key={eventName}
                              variant="secondary"
                              className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-bold text-stone-700 dark:bg-slate-800 dark:text-slate-200"
                            >
                              {eventName}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-auto flex gap-2 pt-2">
                        <Button
                          variant="default"
                          className="h-9 flex-1 rounded-full bg-rc-primary px-3 text-[11px] font-black uppercase tracking-[0.12em] text-white hover:bg-rc-primary/90 dark:bg-amber-300 dark:text-stone-900"
                          onClick={() => setSelectedAttendee(attendee)}
                        >
                          <UserRound className="mr-1.5 h-3.5 w-3.5" />
                          View profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredAttendees.length === 0 ? (
          <Card className="border-dashed border-stone-300 bg-white/70 dark:border-slate-700 dark:bg-slate-950/70">
            <CardContent className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-center">
              <div className="text-lg font-black text-stone-900 dark:text-white">
                No attendees found
              </div>
              <p className="max-w-lg text-sm text-stone-600 dark:text-slate-300">
                Try a different name, organisation, or event filter to explore
                the public attendee directory.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {filteredAttendees.length > 0 ? (
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
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .slice(
                  Math.max(0, activePage - 3),
                  Math.min(totalPages, Math.max(5, activePage + 2))
                )
                .map((page) => (
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
        ) : null}

        <AnimatePresence>
          {selectedAttendee ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
              onClick={() => setSelectedAttendee(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <Card className="border-stone-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.3)] dark:border-slate-800 dark:bg-slate-950">
                  <CardHeader className="gap-5 border-b border-stone-200/80 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border border-stone-200 bg-[linear-gradient(135deg,#ffe7b8_0%,#e7c4ff_100%)] dark:border-slate-700 dark:bg-[linear-gradient(135deg,#362045_0%,#18283c_100%)]">
                          <AvatarFallback className="bg-transparent text-lg font-black text-stone-950 dark:text-white">
                            {getAttendeeInitials(selectedAttendee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <CardTitle className="text-2xl font-black text-stone-950 dark:text-white">
                            {selectedAttendee.name}
                          </CardTitle>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                'rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em]',
                                getBucketClasses(
                                  getAttendeeBucket(
                                    selectedAttendee.category,
                                    selectedAttendee.events ?? []
                                  )
                                )
                              )}
                            >
                              {getAttendeeBucket(
                                selectedAttendee.category,
                                selectedAttendee.events ?? []
                              )}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-bold text-stone-700 dark:bg-slate-800 dark:text-slate-200"
                            >
                              {getAttendeeCategoryLabel(selectedAttendee.category)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={() => setSelectedAttendee(null)}
                        aria-label="Close attendee profile"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="grid gap-6 py-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
                    <div className="space-y-5">
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
                          Organisation
                        </div>
                        <div className="mt-2 text-base font-semibold text-stone-900 dark:text-white">
                          {selectedAttendee.organisation || 'Not listed'}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
                          Designation
                        </div>
                        <div className="mt-2 text-sm leading-6 text-stone-700 dark:text-slate-200">
                          {selectedAttendee.designation || 'Not listed'}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500 dark:text-slate-400">
                          Notes
                        </div>
                        <div className="mt-2 text-sm leading-6 text-stone-700 dark:text-slate-200">
                          {selectedAttendee.notes || 'No notes available'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5 rounded-[1.5rem] border border-stone-200 bg-stone-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/70">
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500 dark:text-slate-400">
                          Events
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(selectedAttendee.events ?? []).map((eventName) => (
                            <Badge
                              key={eventName}
                              variant="secondary"
                              className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-stone-700 dark:bg-slate-800 dark:text-slate-200"
                            >
                              {eventName}
                            </Badge>
                          ))}
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
