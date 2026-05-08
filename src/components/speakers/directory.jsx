'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { speakers } from '@/data/speakers';
import speakerDirectoryUtils from '@/lib/speaker-directory-utils.cjs';
import SpeakerProfileCard from './speaker-profile-card';

const {
  ALL_SPEAKERS_LABEL,
  SPEAKERS_PER_PAGE,
  buildSpeakerCategories,
  filterSpeakers,
  paginateSpeakers,
} = speakerDirectoryUtils;

export default function SpeakersDirectory() {
  const categories = useMemo(() => buildSpeakerCategories(speakers), []);

  const [active, setActive] = useState(ALL_SPEAKERS_LABEL);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(
    () => filterSpeakers(speakers, { activeCategory: active, query }),
    [active, query]
  );
  const {
    currentPageSafe,
    pageItems: paginatedSpeakers,
    totalPages,
  } = useMemo(
    () => paginateSpeakers(filtered, currentPage, SPEAKERS_PER_PAGE),
    [currentPage, filtered]
  );

  return (
    <section className="bg-stone-100 py-12 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="relative mb-5">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-stone-400">
            <Search className="h-5 w-5" aria-hidden="true" />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search speakers by name, role, or bio..."
            className="w-full rounded-[10px] border border-stone-300 bg-white py-3 pl-11 pr-5 text-sm text-stone-800 shadow-sm placeholder:text-stone-400 focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute inset-y-0 right-4 flex items-center text-stone-400 hover:text-stone-600"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

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
