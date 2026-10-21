import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import speakers2026 from '@/data/speakers-2026.json';
import { tasi2026FeaturedSpeakers } from '@/data/tasi-2026-edition';
import speakerDirectoryUtils from '@/lib/speaker-directory-utils.cjs';

const { getSpeakerPhotoSrc, getSpeakerProfilePath } = speakerDirectoryUtils;

// Photos shot wide get a crop in on the face so every card reads the same.
const photoZoom = {
  'Yoel Roth': { transform: 'scale(1.75)', transformOrigin: '47% 30%' },
};

// The speaker cards for the TASI 2026 speakers picked in tasi-2026-edition.js,
// in the same card design as the speaker application page.
export default function Tasi2026SpeakersWall({
  id = 'speakers',
  eyebrow = 'Voices in the Room',
  title = '110+ Speakers, Across Sectors',
  className = 'scroll-mt-24 bg-[#fdf6ef] py-section-sm dark:bg-stone-950 md:py-section-lg',
  containerClassName = 'mx-auto w-full max-w-6xl px-6 sm:px-8',
}) {
  const byName = new Map(
    speakers2026.map((speaker) => [speaker.name, speaker])
  );
  const featured = tasi2026FeaturedSpeakers
    .map((name) => byName.get(name))
    .filter(Boolean);

  return (
    <section id={id} className={className}>
      <div className={containerClassName}>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-950 dark:text-white sm:text-4xl">
              {title}
            </h2>
          </div>
          <Link
            href="/speakers"
            className="inline-flex items-center gap-2 text-sm font-bold text-rc-primary underline decoration-[1.5px] underline-offset-4 dark:text-white"
          >
            All speakers <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {featured.map((speaker) => (
            <Link
              key={speaker.name}
              href={getSpeakerProfilePath(speaker)}
              className="block"
            >
              <article className="h-full overflow-hidden rounded-[10px] border border-stone-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900">
                <div className="relative aspect-[3/4] overflow-hidden bg-stone-200">
                  <Image
                    src={getSpeakerPhotoSrc(speaker)}
                    alt={speaker.name}
                    fill
                    className="object-cover object-top"
                    style={photoZoom[speaker.name]}
                    sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                <div className="p-3.5">
                  <h3 className="text-base font-black tracking-tight text-stone-950 dark:text-white">
                    {speaker.name}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-slate-300">
                    {speaker.designation}, {speaker.organisation}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
