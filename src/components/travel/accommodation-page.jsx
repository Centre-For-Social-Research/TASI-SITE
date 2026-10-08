import Image from 'next/image';
import { ExternalLink, MapPin } from 'lucide-react';
import { hotels, travelCardStyle as style } from '@/data/plan-your-travel-page';
import TravelShell from './travel-shell';

export default function AccommodationPage() {
  return (
    <TravelShell>
      <section className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <h2 className="text-3xl font-black tracking-tight text-stone-900 dark:text-white md:text-4xl">
              Hotels near IIC
            </h2>
            <p className="mt-3 max-w-2xl text-stone-600 dark:text-stone-400">
              These hotels are in central Delhi, roughly 5 to 25 minutes from
              IIC by car depending on traffic. Please book directly with the
              hotel. TASI does not arrange stays and has no partnership with any
              of these hotels.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel) => (
              <a
                key={hotel.name}
                href={hotel.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group overflow-hidden rounded-[10px] border transition hover:shadow-md ${style.border} ${style.bg}`}
              >
                <div className="relative h-44 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <Image
                    src={hotel.photo}
                    alt={hotel.name}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="flex items-start justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <p className="font-bold text-stone-900 transition group-hover:text-[#350265] dark:text-white dark:group-hover:text-[#ffd919]">
                      {hotel.name}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      {hotel.area}
                    </p>
                  </div>
                  <ExternalLink className="mt-1 h-4 w-4 flex-shrink-0 text-stone-300 transition group-hover:text-[#350265] dark:text-stone-600 dark:group-hover:text-[#ffd919]" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </TravelShell>
  );
}
