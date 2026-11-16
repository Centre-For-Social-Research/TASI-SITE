import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import TeamLanyardRail from '@/components/ui/team-lanyard-rail';
import speakers2026 from '@/data/speakers-2026.json';
import { tasi2026FeaturedSpeakers } from '@/data/tasi-2026-edition';
import speakerDirectoryUtils from '@/lib/speaker-directory-utils.cjs';

const { buildSpeakerSlug, getSpeakerPhotoSrc, getSpeakerProfilePath } =
  speakerDirectoryUtils;

const BIO_LIMIT = 170;

// The back of a badge fits about four short lines, so keep whole sentences
// up to the limit and only cut mid-sentence when the first one is too long.
function shortBio(bio = '') {
  // Split only where a full stop is followed by a capital, so "Ph.D., is"
  // stays inside its sentence.
  const sentences = bio.trim().split(/(?<=[.!?])\s+(?=[A-Z])/);
  let text = '';
  for (const sentence of sentences) {
    const next = text ? `${text} ${sentence}` : sentence;
    if (next.length > BIO_LIMIT) break;
    text = next;
  }
  if (text.trim()) return text.trim();
  return `${bio.slice(0, BIO_LIMIT - 1).trimEnd()}…`;
}

function toLanyardMember(speaker) {
  const links = [{ label: 'Profile', href: getSpeakerProfilePath(speaker) }];
  if (speaker.linkedinUrl) {
    links.push({ label: 'LinkedIn', href: speaker.linkedinUrl });
  }

  return {
    id: buildSpeakerSlug(speaker.name),
    name: speaker.name,
    role: speaker.designation,
    team: speaker.organisation,
    image: getSpeakerPhotoSrc(speaker),
    bio: shortBio(speaker.bio),
    tags: [speaker.category, speaker.country].filter(Boolean),
    links,
  };
}

// The TASI 2026 speakers picked in tasi-2026-edition.js, hung as festival
// lanyards on two rails. Light theme only, whatever the site theme is.
export default function Tasi2026SpeakersWall({
  id = 'speakers',
  eyebrow = 'Voices in the Room',
  title = '110+ Speakers, Across Sectors',
  className = 'lanyard-light scroll-mt-24 bg-background py-section-sm text-foreground md:py-section-lg',
  containerClassName = 'mx-auto w-full max-w-6xl px-6 sm:px-8',
}) {
  const byName = new Map(
    speakers2026.map((speaker) => [speaker.name, speaker])
  );
  const featured = tasi2026FeaturedSpeakers
    .map((name) => byName.get(name))
    .filter(Boolean)
    .map(toLanyardMember);

  const split = Math.ceil(featured.length / 2);
  const rails = [featured.slice(0, split), featured.slice(split)].filter(
    (rail) => rail.length > 0
  );

  return (
    <section id={id} className={className}>
      <div className={containerClassName}>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Brush along the rail to meet a speaker, pull a badge down to swing
              it, and click to flip it for their story.
            </p>
          </div>
          <Link
            href="/speakers"
            className="inline-flex items-center gap-2 text-sm font-bold text-rc-primary underline decoration-[1.5px] underline-offset-4"
          >
            All speakers <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-6 w-full max-w-7xl">
        {rails.map((items, index) => (
          <TeamLanyardRail
            key={items[0].id}
            items={items}
            railLabel={`${title}, rail ${index + 1} of ${rails.length}`}
            caption={
              index === 0
                ? 'Hover or tap a badge to bring it forward.'
                : 'Every badge has a story on the back.'
            }
            autoplay={index === 0}
          />
        ))}
      </div>
    </section>
  );
}
