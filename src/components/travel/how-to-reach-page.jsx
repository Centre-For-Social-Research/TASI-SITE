import { Car, MapPin, Plane, Train, TramFront } from 'lucide-react';
import {
  airports,
  localTransport,
  metroStations,
  nearbyPlaces,
  railwayStations,
  travelCardStyle as style,
  travelVenue,
} from '@/data/plan-your-travel-page';
import TravelShell from './travel-shell';

const CARD = `rounded-[10px] border p-5 ${style.border} ${style.bg}`;

export default function HowToReachPage() {
  return (
    <TravelShell>
      <section className="border-b border-[#350265]/10 bg-white px-4 py-8 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[10px] ${style.iconBg}`}
            >
              <MapPin className={`h-6 w-6 ${style.iconText}`} />
            </div>
            <div>
              <p className="font-bold text-stone-900 dark:text-white">
                {travelVenue.name}
              </p>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {travelVenue.address}
              </p>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                {travelVenue.taxiTip}
              </p>
            </div>
          </div>
          <a
            href={travelVenue.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-none items-center gap-2 self-start rounded-full bg-[#350265] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#55089e] md:self-center"
          >
            Open in Maps
          </a>
        </div>
      </section>

      <div className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl space-y-14">
          <div>
            <SectionHeading icon={Plane} title="From the airport" />
            <div className="grid gap-4 sm:grid-cols-2">
              {airports.map((airport) => (
                <div key={airport.terminal} className={CARD}>
                  <p className="font-bold text-stone-900 dark:text-white">
                    {airport.name} ({airport.code})
                  </p>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                    {airport.terminal}
                  </p>
                  <p className={`mt-2 text-sm font-semibold ${style.iconText}`}>
                    {airport.distance}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading icon={Train} title="From the railway stations" />
            <div className="grid gap-4 sm:grid-cols-3">
              {railwayStations.map((station) => (
                <div key={station.name} className={CARD}>
                  <p className="font-bold text-stone-900 dark:text-white">
                    {station.name}
                  </p>
                  <p className={`mt-1 text-sm font-semibold ${style.iconText}`}>
                    {station.distance}
                  </p>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                    {station.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading icon={TramFront} title="By metro" />
            <div className="grid gap-4 sm:grid-cols-2">
              {metroStations.map((station) => (
                <div key={station.name} className={CARD}>
                  <p className="font-bold text-stone-900 dark:text-white">
                    {station.name}
                  </p>
                  <p className={`mt-1 text-sm font-semibold ${style.iconText}`}>
                    {station.line}
                  </p>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                    {station.note}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading icon={Car} title="Taxis and autos" />
            <ul className={`space-y-2.5 ${CARD}`}>
              {localTransport.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-300"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#350265] dark:bg-[#ffd919]" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHeading icon={MapPin} title="Close to IIC" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nearbyPlaces.map((place) => (
                <div key={place.name} className={CARD}>
                  <p className="font-bold text-stone-900 dark:text-white">
                    {place.name}
                  </p>
                  <p className={`mt-1 text-sm font-semibold ${style.iconText}`}>
                    {place.distance}
                  </p>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                    {place.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TravelShell>
  );
}

function SectionHeading({ icon: Icon, title }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${style.iconBg}`}
      >
        <Icon className={`h-5 w-5 ${style.iconText}`} />
      </span>
      <h2 className="text-xl font-black text-stone-900 dark:text-white">
        {title}
      </h2>
    </div>
  );
}
