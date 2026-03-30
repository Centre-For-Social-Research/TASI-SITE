import TravelShell from "@/components/travel/travel-shell";
import Image from "next/image";
import { Plane, Train, Bus, MapPin, AlertTriangle, Car, Navigation } from "lucide-react";

export const metadata = {
  title: "How to Reach – Plan Your Travel · TASI 2026",
  description:
    "Airports, railway stations, metro, and taxi options for reaching the TASI 2026 venue in New Delhi, India.",
};

// ─── Data ────────────────────────────────────────────────────────────────────

const airports = [
  {
    terminal: "Domestic, Terminal 1",
    name: "Indira Gandhi International Airport",
    distance: "Approx. 15 km",
    code: "DEL",
  },
  {
    terminal: "Domestic, Terminal 2",
    name: "Indira Gandhi International Airport",
    distance: "Approx. 14 km",
    code: "DEL",
  },
  {
    terminal: "International, Terminal 3",
    name: "Indira Gandhi International Airport",
    distance: "Approx. 16 km",
    code: "DEL",
  },
  {
    terminal: "Domestic",
    name: "Hindon Airport, Ghaziabad (Delhi NCR)",
    distance: "Approx. 35 km",
    code: "HDO",
  },
];

const railwayStations = [
  { name: "New Delhi Railway Station", distance: "~5 km", note: "Rajdhani & major rail routes" },
  { name: "Hazrat Nizamuddin Railway Station", distance: "~6 km", note: "Duronto, Gatimaan & Shatabdi routes" },
  { name: "Old Delhi Railway Station", distance: "~8 km", note: "Heritage terminus" },
];

const nearbyAttractions = [
  {
    name: "Akshardham Temple",
    distance: "0.5 km",
    note: "Right next to venue",
    image: "/img/travel/attractions/akshardham.webp",
  },
  {
    name: "Dilli Haat",
    distance: "1 km",
    note: "3-5 mins by car",
    image: "/img/travel/attractions/dilli-haat.webp",
  },
  {
    name: "Red Fort",
    distance: "1 km",
    note: "3-5 mins by car",
    image: "/img/travel/attractions/red-fort.webp",
  },
  {
    name: "India Gate",
    distance: "1.5 km",
    note: "5 mins by car",
    image: "/img/travel/attractions/india-gate.webp",
  },
  {
    name: "Rashtrapati Bhavan",
    distance: "4.5 km",
    note: "12-15 mins by car",
    image: "/img/travel/attractions/rashtrapati-bhavan.webp",
  },
];

const immigrationPoints = [
  "Immigration clearance will be completed at the first port of entry into India. A dedicated lane for accredited delegates will be available at IGI Airport.",
  "No weapons are permitted to be brought into India by delegation members or accompanying security personnel.",
  "Delegates may carry medicines strictly for personal use with a prescription or physician's letter.",
  "Amounts exceeding USD 10,000 (or equivalent) in cash must be declared to Customs authorities upon arrival.",
  "Items not permitted in personal baggage on flights within India: cigarette lighters, e-cigarettes/vapes, satellite phones, drones.",
  "Duty-free allowances per adult: 2 litres of alcohol, 100 cigarettes or 25 cigars, personal goods within reasonable limits.",
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HowToReachPage() {
  return (
    <TravelShell>
      {/* Intro banner */}
      <section className="border-b border-stone-200 bg-amber-50 px-4 py-8 dark:border-stone-800 dark:bg-amber-950/20">
        <div className="mx-auto max-w-5xl flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[10px] bg-amber-100 dark:bg-amber-900/40">
            <Navigation className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-bold text-stone-900 dark:text-white">Getting to the Summit Venue</p>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              New Delhi is one of the world&apos;s best-connected cities. TASI 2026 will be held at a premier venue in central Delhi, easily accessible by air, rail, and road.
            </p>
          </div>
        </div>
      </section>

      <div className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl space-y-16">

          {/* ── Airports ── */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-sky-100 dark:bg-sky-900/40">
                <Plane className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">By Air</p>
                <h2 className="text-xl font-black text-stone-900 dark:text-white">Nearest Airports</h2>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {airports.map((a) => (
                <div
                  key={a.terminal}
                  className="rounded-[10px] border border-sky-200 bg-sky-50 p-5 dark:border-sky-800 dark:bg-sky-950/20"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                      {a.code}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                      <MapPin className="h-3 w-3" /> {a.distance} to venue
                    </span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    {a.terminal}
                  </p>
                  <p className="mt-1 font-semibold text-stone-900 dark:text-white">{a.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Railway ── */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-amber-100 dark:bg-amber-900/40">
                <Train className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">By Rail</p>
                <h2 className="text-xl font-black text-stone-900 dark:text-white">Nearest Railway Stations</h2>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {railwayStations.map((s) => (
                <div
                  key={s.name}
                  className="rounded-[10px] border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/20"
                >
                  <p className="font-bold text-stone-900 dark:text-white">{s.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-amber-700 dark:text-amber-300">
                    <MapPin className="h-3 w-3" /> {s.distance} from venue
                  </p>
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{s.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Local Transport ── */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-100 dark:bg-emerald-900/40">
                <Bus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
                  Local Transport
                </p>
                <h2 className="text-xl font-black text-stone-900 dark:text-white">Metro & Taxis</h2>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-950/20">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-emerald-100 dark:bg-emerald-900/40">
                    <Navigation className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </span>
                  <p className="font-bold text-stone-900 dark:text-white">Nearest Metro Station</p>
                </div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Supreme Court Metro Station
                </p>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                  Blue Line, direct connectivity from major city hubs and IGI Airport (via Airport Express + Blue Line interchange).
                </p>
              </div>
              <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-950/20">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-emerald-100 dark:bg-emerald-900/40">
                    <Car className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </span>
                  <p className="font-bold text-stone-900 dark:text-white">Taxi Services</p>
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Taxi counters are available at the arrival terminal of IGI Airport. App-based operators{" "}
                  <strong className="text-stone-800 dark:text-stone-200">Ola</strong> and{" "}
                  <strong className="text-stone-800 dark:text-stone-200">Uber</strong> are widely available across Delhi NCR.
                </p>
              </div>
            </div>
          </div>

          {/* ── Nearby Attractions ── */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-violet-100 dark:bg-violet-900/40">
                <MapPin className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 dark:text-stone-400">
                  Explore the Area
                </p>
                <h2 className="text-xl font-black text-stone-900 dark:text-white">Nearby Attractions</h2>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nearbyAttractions.map((a) => (
                <div
                  key={a.name}
                  className="overflow-hidden rounded-[10px] border border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/20"
                >
                  <div className="relative h-36 w-full">
                    <Image
                      src={a.image}
                      alt={a.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="px-4 py-3">
                    <p className="font-semibold text-stone-900 dark:text-white">{a.name}</p>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                      {a.distance}, {a.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Immigration ── */}
          <div className="rounded-[10px] border border-amber-300 bg-amber-50 p-6 dark:border-amber-800/60 dark:bg-amber-950/20">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-amber-200 dark:bg-amber-900/60">
                <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-300" />
              </span>
              <h3 className="font-bold text-amber-900 dark:text-amber-200">Important: Immigration & Customs</h3>
            </div>
            <ul className="space-y-2.5">
              {immigrationPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-100">
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
