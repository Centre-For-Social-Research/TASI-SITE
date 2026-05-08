import Image from 'next/image';
import { ExternalLink, Hotel, MapPin } from 'lucide-react';
import { hotels } from '@/data/plan-your-travel-page';
import TravelShell from './travel-shell';

export default function AccommodationPage() {
  return (
    <TravelShell>
      <section className="border-b border-stone-200 bg-stone-50 px-4 py-8 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[10px] bg-violet-100 dark:bg-violet-900/40">
              <Hotel className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="font-bold text-stone-900 dark:text-white">
                Recommended Hotels - New Delhi
              </p>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Accommodation is to be arranged and booked independently by
                delegates.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-800/60 dark:bg-amber-950/20">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {hotels.length}
            </span>
            <span className="text-xs text-stone-600 dark:text-stone-400">
              hotels
              <br />
              listed
            </span>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              Where to Stay
            </p>
            <h2 className="text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-4xl">
              Recommended Hotels
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <a
                key={hotel.name}
                href={hotel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-sm transition hover:shadow-md dark:border-stone-700 dark:bg-stone-900"
              >
                <div className="relative h-44 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                  {hotel.photo ? (
                    <Image
                      src={hotel.photo}
                      alt={hotel.name}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Hotel className="h-10 w-10 text-stone-300 dark:text-stone-600" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-stone-900 transition group-hover:text-violet-700 dark:text-white dark:group-hover:text-violet-400">
                        {hotel.name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{hotel.area}</span>
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 flex-shrink-0 text-stone-300 transition group-hover:text-violet-500 dark:text-stone-600" />
                  </div>
                </div>
              </a>
            ))}
          </div>

          <p className="mt-10 text-center text-xs text-stone-400 dark:text-stone-500">
            Hotel listings are provided for convenience. Rates, availability,
            and booking terms are subject to each property&apos;s policies. TASI
            has no affiliation with any of the hotels listed.
          </p>
        </div>
      </section>
    </TravelShell>
  );
}
