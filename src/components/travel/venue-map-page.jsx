import {
  MapPin,
  Navigation,
  Presentation,
  Users,
  Utensils,
} from 'lucide-react';
import {
  travelCardStyle as style,
  travelVenue,
} from '@/data/plan-your-travel-page';
import {
  venueMapArrival,
  venueMapFloors,
  venueMapZones,
} from '@/data/venue-map';
import TravelShell from './travel-shell';
import VenueMapIllustration, { ZONE_COLORS } from './venue-map-illustration';

const CARD = `rounded-[10px] border ${style.border} ${style.bg}`;

const ZONE_STYLE = {
  sessions: {
    icon: Presentation,
    card: 'border-[#350265]/20 bg-[#350265]/[0.06] dark:border-[#b388ff]/25 dark:bg-[#350265]/30',
  },
  breakouts: {
    icon: Users,
    card: 'border-[#ff6900]/25 bg-[#ff6900]/[0.08] dark:border-[#ff6900]/30 dark:bg-[#ff6900]/10',
  },
  connect: {
    icon: Utensils,
    card: 'border-[#d1ad00]/30 bg-[#ffd919]/20 dark:border-[#ffd919]/25 dark:bg-[#ffd919]/10',
  },
};

function Marker({ zone, children, className = 'h-8 w-8 text-sm' }) {
  const { pin, pinText } = ZONE_COLORS[zone];
  return (
    <span
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-black ring-2 ring-white dark:ring-stone-900 ${className}`}
      style={{ backgroundColor: pin, color: pinText }}
    >
      {children}
    </span>
  );
}

function LegendIcon({ kind }) {
  return (
    <svg viewBox="0 0 22 22" aria-hidden="true" className="h-5 w-5">
      <rect width="22" height="22" rx="5" fill="#1c1917" />
      {kind === 'lift' ? (
        <path d="M11 4.5 15 9H7z M11 17.5 7 13h8z" fill="#ffffff" />
      ) : (
        <path
          d="M5 16h4v-3.5h4V9h4"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function SiteInset() {
  return (
    <svg
      viewBox="0 0 360 250"
      role="img"
      aria-labelledby="site-inset-title"
      className="h-auto w-full font-sans"
    >
      <title id="site-inset-title">
        The Kamaladevi Complex sits beside Gate 1 of the India International
        Centre, with the Rose Garden next to it.
      </title>
      <rect x="328" y="8" width="24" height="234" rx="4" fill="#ecdfc2" />
      <path
        d="M18 160 L250 22 L318 22 L318 236 L18 236 Z"
        fill="#fbf8f3"
        stroke="#8a7a4f"
        strokeWidth="3"
      />
      <path
        d="M118 128 Q190 112 246 132 L232 156 Q182 138 126 152 Z"
        fill="#e7e1d6"
      />
      <rect x="60" y="188" width="150" height="20" rx="3" fill="#e7e1d6" />
      <path d="M150 74 L224 46 L224 108 L162 108 Z" fill="#cfe8c4" />
      <text
        x="188"
        y="92"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="#3f6b33"
      >
        Rose Garden
      </text>
      <path d="M232 40 L300 40 L300 102 L228 102 Z" fill="#350265" />
      <text
        x="265"
        y="68"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        fill="#ffffff"
      >
        Kamaladevi
      </text>
      <text
        x="265"
        y="82"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        fill="#ffffff"
      >
        Complex
      </text>
      <text x="138" y="182" textAnchor="middle" fontSize="10" fill="#78716c">
        Other IIC buildings
      </text>
      <path
        d="M312 72 L304 72"
        stroke="#ff6900"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1 5"
      />
      <circle
        cx="318"
        cy="72"
        r="11"
        fill="#ff6900"
        stroke="#ffffff"
        strokeWidth="2"
      />
      <text
        x="318"
        y="76"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        fill="#ffffff"
      >
        1
      </text>
      <text
        x="300"
        y="122"
        textAnchor="end"
        fontSize="11"
        fontWeight="700"
        fill="#c2410c"
      >
        Gate 1
      </text>
      <text
        x="340"
        y="130"
        textAnchor="middle"
        fontSize="9"
        fill="#78716c"
        transform="rotate(90 340 130)"
      >
        Road
      </text>
    </svg>
  );
}

export default function VenueMapPage() {
  return (
    <TravelShell>
      <section className="border-b border-[#350265]/10 bg-white px-4 py-8 dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[10px] ${style.iconBg}`}
            >
              <MapPin className={`h-6 w-6 ${style.iconText}`} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-stone-900 dark:text-white">
                How TASI 2026 used the venue
              </h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                Everything happens in and around the Kamaladevi Complex,{' '}
                {travelVenue.name}. Follow the colour and number.
              </p>
            </div>
          </div>
          <a
            href={travelVenue.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-none items-center gap-2 self-start rounded-full bg-[#350265] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#55089e] md:self-center"
          >
            <Navigation className="h-4 w-4" /> Directions to IIC
          </a>
        </div>
      </section>

      <div className="px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="grid gap-4 md:grid-cols-3">
            {venueMapZones.map((zone) => {
              const { icon: Icon, card } = ZONE_STYLE[zone.key];
              return (
                <div
                  key={zone.key}
                  className={`rounded-[10px] border p-5 ${card}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px]"
                      style={{
                        backgroundColor: ZONE_COLORS[zone.key].pin,
                        color: ZONE_COLORS[zone.key].pinText,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-lg font-black text-stone-900 dark:text-white">
                      {zone.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                    {zone.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <figure className={`${CARD} overflow-hidden`}>
              {/* The drawing keeps a light surface in dark mode so its colours read the same. */}
              <div className="bg-[#fdfbf7] p-3 sm:p-6">
                <VenueMapIllustration />
              </div>
              <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-stone-200 px-5 py-3 text-xs text-stone-600 dark:border-stone-700 dark:text-stone-400">
                <span className="inline-flex items-center gap-2">
                  <LegendIcon kind="lift" />
                  Lift
                </span>
                <span className="inline-flex items-center gap-2">
                  <LegendIcon kind="stairs" />
                  Stairs
                </span>
                <span className="ml-auto">Schematic, not to scale</span>
              </figcaption>
            </figure>

            <div className="space-y-6">
              {venueMapFloors.map((floor) => (
                <section key={floor.key} className={`${CARD} p-5`}>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#350265] dark:text-[#ffd919]">
                    {floor.title}
                  </p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {floor.subtitle}
                  </p>
                  <ul className="mt-4 space-y-4">
                    {floor.places.map((place) => (
                      <li key={place.marker} className="flex gap-3">
                        <Marker zone={place.zone}>{place.marker}</Marker>
                        <div>
                          <p className="font-bold text-stone-900 dark:text-white">
                            {place.name}
                            <span className="font-medium text-stone-500 dark:text-stone-400">
                              {' '}
                              · {place.room}
                            </span>
                          </p>
                          <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-400">
                            {place.note}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>

          <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className={`${CARD} overflow-hidden`}>
              <div className="bg-[#fdfbf7] p-4">
                <SiteInset />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900 dark:text-white">
                Arriving at IIC
              </h2>
              <ul className="mt-4 space-y-3">
                {venueMapArrival.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#350265] dark:bg-[#ffd919]" />
                    {line}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
                {travelVenue.address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </TravelShell>
  );
}
