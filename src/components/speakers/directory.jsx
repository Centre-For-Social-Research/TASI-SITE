'use client';

import React, { useMemo, useState } from 'react';
import { Linkedin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { speakers } from '@/data/speakers';

const VIP_SPEAKERS = new Set([
  'Dr. Subrahmanyam Jaishankar',
  'Shri Ashwini Vaishnaw',
  'Smt. Annapurna Devi',
  'Abhishek Singh',
]);

const VIP_LABEL = 'Keynote Speaker';
const SPEAKERS_PER_PAGE = 9;

function initials(name) {
  const words = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return 'SP';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function linkedInUrlForSpeaker(speaker) {
  if (speaker.linkedinUrl) return speaker.linkedinUrl;
  const query = encodeURIComponent(
    `${speaker.name || ''} ${speaker.designation || ''}`.trim()
  );
  return `https://www.linkedin.com/search/results/all/?keywords=${query}`;
}

const SpeakerProfileCard = React.forwardRef(function SpeakerProfileCard(
  { speaker, className, ...props },
  ref
) {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const avatarInitials = initials(speaker.name);
  const linkedInUrl = linkedInUrlForSpeaker(speaker);
  const isVipSpeaker = VIP_SPEAKERS.has(speaker.name);

  return (
    <div
      ref={ref}
      className={cn(
        'tasi-flip-perspective h-96 w-full max-w-[20rem]',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'tasi-flip-card relative h-full w-full cursor-pointer transition-transform duration-700',
          isFlipped ? 'tasi-flip-card-rotated' : 'tasi-flip-card-front'
        )}
      >
        <Card
          className={cn(
            'tasi-flip-face absolute h-full w-full rounded-[10px] p-6 shadow-lg',
            isVipSpeaker
              ? 'border-[#9c3c46] bg-[#801b26]'
              : 'border-stone-200 bg-white'
          )}
        >
          <div className="flex h-full w-full flex-col items-center justify-center space-y-4 text-center">
            <button
              type="button"
              onClick={() => setIsFlipped(true)}
              className="rounded-full transition-opacity hover:opacity-90"
              aria-label={`View bio of ${speaker.name}`}
            >
              <Avatar
                className={cn(
                  'h-32 w-32 ring-4',
                  isVipSpeaker ? 'ring-[#d4af37]' : 'ring-orange-500/10'
                )}
              >
                <AvatarImage
                  src={`/img/speakers/${speaker.photo}`}
                  alt={speaker.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl">
                  {avatarInitials}
                </AvatarFallback>
              </Avatar>
            </button>

            <div className="space-y-2">
              <h3
                className={cn(
                  'text-xl font-bold',
                  isVipSpeaker ? 'text-stone-50' : 'text-stone-900'
                )}
              >
                {speaker.name}
              </h3>
              <p
                className={cn(
                  'text-sm',
                  isVipSpeaker ? 'text-stone-200' : 'text-stone-600'
                )}
              >
                {speaker.designation}
              </p>
              <p
                className={cn(
                  'text-xs font-semibold uppercase tracking-[0.1em]',
                  isVipSpeaker ? 'text-amber-300' : 'text-orange-700'
                )}
              >
                {isVipSpeaker ? VIP_LABEL : speaker.category}
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <a
                  href={linkedInUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${speaker.name} LinkedIn`}
                  className={cn(
                    'rounded-full border p-1.5 transition-colors',
                    isVipSpeaker
                      ? 'border-stone-300/60 text-stone-200 hover:border-stone-200 hover:text-stone-100'
                      : 'border-stone-300 text-stone-600 hover:border-orange-300 hover:text-orange-700'
                  )}
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>

            <p
              className={cn(
                'mt-2 text-xs',
                isVipSpeaker ? 'text-stone-300' : 'text-stone-500'
              )}
            >
              Click photo to view bio
            </p>
          </div>
        </Card>

        <Card
          className={cn(
            'tasi-flip-face tasi-flip-face-back absolute h-full w-full rounded-[10px] p-6 shadow-lg',
            isVipSpeaker
              ? 'border-[#9c3c46] bg-[#801b26]'
              : 'border-stone-200 bg-white'
          )}
        >
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3
                className={cn(
                  'text-xl font-bold',
                  isVipSpeaker ? 'text-stone-50' : 'text-stone-900'
                )}
              >
                Bio
              </h3>
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className={cn(
                  'text-sm transition-colors',
                  isVipSpeaker
                    ? 'text-stone-300 hover:text-stone-100'
                    : 'text-stone-600 hover:text-stone-900'
                )}
              >
                Back
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <p
                className={cn(
                  'text-sm leading-relaxed',
                  isVipSpeaker ? 'text-stone-200' : 'text-stone-700'
                )}
              >
                {speaker.bio}
              </p>
            </div>

            <div
              className={cn(
                'mt-4 border-t pt-4',
                isVipSpeaker ? 'border-[#9c3c46]' : 'border-stone-200'
              )}
            >
              <div className="flex items-center space-x-3">
                <Avatar
                  className={cn(
                    'h-10 w-10 ring-2',
                    isVipSpeaker ? 'ring-[#d4af37]' : 'ring-transparent'
                  )}
                >
                  <AvatarImage
                    src={`/img/speakers/${speaker.photo}`}
                    alt={speaker.name}
                    className="object-cover"
                  />
                  <AvatarFallback>{avatarInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isVipSpeaker ? 'text-stone-50' : 'text-stone-900'
                    )}
                  >
                    {speaker.name}
                  </p>
                  <p
                    className={cn(
                      'text-xs',
                      isVipSpeaker ? 'text-stone-300' : 'text-stone-600'
                    )}
                  >
                    {isVipSpeaker
                      ? `${VIP_LABEL} · ${speaker.designation}`
                      : speaker.designation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
});

SpeakerProfileCard.displayName = 'SpeakerProfileCard';

export default function SpeakersDirectory() {
  const categories = useMemo(() => {
    const set = new Set(speakers.map((s) => s.category).filter(Boolean));
    return ['All Speakers', ...Array.from(set)];
  }, []);

  const [active, setActive] = useState('All Speakers');
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return speakers.filter((s) => {
      const matchesCategory =
        active === 'All Speakers' || s.category === active;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        s.name?.toLowerCase().includes(q) ||
        s.designation?.toLowerCase().includes(q) ||
        s.bio?.toLowerCase().includes(q)
      );
    });
  }, [active, query]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / SPEAKERS_PER_PAGE)
  );
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedSpeakers = useMemo(() => {
    const startIndex = (currentPageSafe - 1) * SPEAKERS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + SPEAKERS_PER_PAGE);
  }, [currentPageSafe, filtered]);

  return (
    <section className="bg-stone-100 py-12 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        {/* Search box */}
        <div className="mb-5 relative">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-stone-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search speakers by name, role, or bio…"
            className="w-full rounded-[10px] border border-stone-300 bg-white py-3 pl-11 pr-5 text-sm text-stone-800 shadow-sm placeholder:text-stone-400 focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute inset-y-0 right-4 flex items-center text-stone-400 hover:text-stone-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setActive(category);
                setCurrentPage(1);
              }}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active === category
                  ? 'border-orange-700 bg-orange-700 text-white'
                  : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-stone-500">
            <p className="text-lg font-semibold">No speakers found</p>
            <p className="mt-1 text-sm">
              Try adjusting your search or selecting a different category.
            </p>
          </div>
        )}

        <div className="grid justify-items-center gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
          {paginatedSpeakers.map((speaker) => (
            <SpeakerProfileCard
              key={`${speaker.name}-${speaker.designation}`}
              speaker={speaker}
            />
          ))}
        </div>

        {filtered.length > 0 && totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPageSafe === 1}
              className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-orange-500 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    currentPageSafe === page
                      ? 'border-orange-700 bg-orange-700 text-white'
                      : 'border-stone-300 bg-white text-stone-700 hover:border-orange-500 hover:text-orange-700'
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPageSafe === totalPages}
              className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-orange-500 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
