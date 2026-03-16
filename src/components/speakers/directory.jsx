"use client";

import { useMemo, useState } from "react";
import { speakers } from "@/data/speakers";

function initials(name) {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "SP";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export default function SpeakersDirectory() {
  const categories = useMemo(() => {
    const set = new Set(speakers.map((s) => s.category).filter(Boolean));
    return ["All Speakers", ...Array.from(set)];
  }, []);

  const [active, setActive] = useState("All Speakers");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return speakers.filter((s) => {
      const matchesCategory = active === "All Speakers" || s.category === active;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        s.name?.toLowerCase().includes(q) ||
        s.designation?.toLowerCase().includes(q) ||
        s.bio?.toLowerCase().includes(q)
      );
    });
  }, [active, query]);

  return (
    <section className="bg-stone-100 py-12 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        {/* Search box */}
        <div className="mb-5 relative">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-stone-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search speakers by name, role, or bio…"
            className="w-full rounded-full border border-stone-300 bg-white py-3 pl-11 pr-5 text-sm text-stone-800 shadow-sm placeholder:text-stone-400 focus:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute inset-y-0 right-4 flex items-center text-stone-400 hover:text-stone-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
              onClick={() => setActive(category)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active === category
                  ? "border-orange-700 bg-orange-700 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-stone-500">
            <p className="text-lg font-semibold">No speakers found</p>
            <p className="mt-1 text-sm">Try adjusting your search or selecting a different category.</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((speaker) => (
            <article key={`${speaker.name}-${speaker.designation}`} className="flex h-[26rem] flex-col rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex justify-center">
                {speaker.photo ? (
                  <img
                    src={`/img/speakers/${speaker.photo}`}
                    alt={speaker.name}
                    className="h-28 w-28 rounded-full border border-stone-300 object-cover"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border border-stone-300 bg-stone-100 text-2xl font-black text-stone-500">
                    {initials(speaker.name)}
                  </div>
                )}
              </div>
              <h3 className="mb-1 text-center text-lg font-bold text-stone-900">{speaker.name}</h3>
              <p className="mb-2 text-center text-sm text-stone-600">{speaker.designation}</p>
              <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.1em] text-orange-700">{speaker.category}</p>
              <div className="flex-1 overflow-y-auto">
                <p className="text-center text-sm text-stone-700">{speaker.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
