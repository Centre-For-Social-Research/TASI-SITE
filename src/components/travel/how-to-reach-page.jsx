import Image from 'next/image';
import { AlertTriangle, Car, MapPin, Navigation } from 'lucide-react';
import {
  airports,
  immigrationPoints,
  nearbyAttractions,
  railwayStations,
} from '@/data/plan-your-travel-page';
import TravelShell from './travel-shell';
import { travelIcons } from './travel-icons';

export default function HowToReachPage() {
  const Plane = travelIcons.Plane;
  const Train = travelIcons.Train;
  const Bus = travelIcons.Bus;

  return (
    <TravelShell>
      <section className="border-b border-stone-200 bg-amber-50 px-4 py-8 dark:border-stone-800 dark:bg-amber-950/20">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[10px] bg-amber-100 dark:bg-amber-900/40">
            <Navigation className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-bold text-stone-900 dark:text-white">
              Getting to the Summit Venue
            </p>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              New Delhi is one of the world&apos;s best-connected cities. TASI
              2026 will be held at a premier venue in central Delhi, easily
              accessible by air, rail, and road.
            </p>
          </div>
        </div>
      </section>

      <div className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl space-y-16">
          <div>
            <TravelSectionHeading
              icon={Plane}
              eyebrow="By Air"
              title="Nearest Airports"
              theme="sky"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {airports.map((airport) => (
                <div
                  key={airport.terminal}
                  className="rounded-[10px] border border-sky-200 bg-sky-50 p-5 dark:border-sky-800 dark:bg-sky-950/20"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                      {airport.code}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                      <MapPin className="h-3 w-3" /> {airport.distance} to venue
                    </span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    {airport.terminal}
                  </p>
                  <p className="mt-1 font-semibold text-stone-900 dark:text-white">
                    {airport.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <TravelSectionHeading
              icon={Train}
              eyebrow="By Rail"
              title="Nearest Railway Stations"
              theme="amber"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {railwayStations.map((station) => (
                <div
                  key={station.name}
                  className="rounded-[10px] border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/20"
                >
                  <p className="font-bold text-stone-900 dark:text-white">
                    {station.name}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-amber-700 dark:text-amber-300">
                    <MapPin className="h-3 w-3" /> {station.distance} from venue
                  </p>
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                    {station.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <TravelSectionHeading
              icon={Bus}
              eyebrow="Local Transport"
              title="Metro & Taxis"
              theme="emerald"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-950/20">
                <TransportCardHeader
                  icon={Navigation}
                  title="Nearest Metro Station"
                />
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Supreme Court Metro Station
                </p>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                  Blue Line, direct connectivity from major city hubs and IGI
                  Airport via Airport Express and Blue Line interchange.
                </p>
              </div>
              <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-950/20">
                <TransportCardHeader icon={Car} title="Taxi Services" />
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Taxi counters are available at the arrival terminal of IGI
                  Airport. App-based operators{' '}
                  <strong className="text-stone-800 dark:text-stone-200">
                    Ola
                  </strong>{' '}
                  and{' '}
                  <strong className="text-stone-800 dark:text-stone-200">
                    Uber
                  </strong>{' '}
                  are widely available across Delhi NCR.
                </p>
              </div>
            </div>
          </div>

          <div>
            <TravelSectionHeading
              icon={MapPin}
              eyebrow="Explore the Area"
              title="Nearby Attractions"
              theme="violet"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nearbyAttractions.map((attraction) => (
                <div
                  key={attraction.name}
                  className="overflow-hidden rounded-[10px] border border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/20"
                >
                  <div className="relative h-36 w-full">
                    <Image
                      src={attraction.image}
                      alt={attraction.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="px-4 py-3">
                    <p className="font-semibold text-stone-900 dark:text-white">
                      {attraction.name}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                      {attraction.distance}, {attraction.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[10px] border border-amber-300 bg-amber-50 p-6 dark:border-amber-800/60 dark:bg-amber-950/20">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-amber-200 dark:bg-amber-900/60">
                <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-300" />
              </span>
              <h3 className="font-bold text-amber-900 dark:text-amber-200">
                Important: Immigration & Customs
              </h3>
            </div>
            <ul className="space-y-2.5">
              {immigrationPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-100"
                >
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </TravelShell>
  );
}

function TravelSectionHeading({ icon: Icon, eyebrow, title, theme }) {
  const colors = {
    sky: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
    amber:
      'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    emerald:
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    violet:
      'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
  };

  return (
    <div className="mb-6 flex items-center gap-3">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${colors[theme]}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
          {eyebrow}
        </p>
        <h2 className="text-xl font-black text-stone-900 dark:text-white">
          {title}
        </h2>
      </div>
    </div>
  );
}

function TransportCardHeader({ icon: Icon, title }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-emerald-100 dark:bg-emerald-900/40">
        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      </span>
      <p className="font-bold text-stone-900 dark:text-white">{title}</p>
    </div>
  );
}
