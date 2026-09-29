import { notFound } from 'next/navigation';
import HomeNavbar from '@/components/home/navbar';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import SpeakerBadgeShare from '@/components/speakers/speaker-badge-share';
import { getSpeakerBadgeByDownloadToken } from '@/lib/speaker-communications-db';
import speakerCommunicationsUtils from '@/lib/speaker-communications-utils.cjs';
import speakerBadgeShare from '@/lib/speaker-badge-share.cjs';
import speakerBadgeEmail from '@/lib/speaker-badge-email.cjs';

const { getSpeakerEdition, isValidDownloadToken } = speakerCommunicationsUtils;
const {
  COLLAB_NOTE,
  SOCIAL_PROFILES,
  buildSpeakerShareCaptions,
  buildSpeakerShareLinks,
} = speakerBadgeShare;
const { buildSpeakerBadgeDownloadUrl, buildSpeakerBadgePageUrl } =
  speakerBadgeEmail;

export const dynamic = 'force-dynamic';

function getSiteUrl() {
  return (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://trustandsafetyindia.org'
  );
}

async function getBadgeOrNotFound(token) {
  if (!isValidDownloadToken(token)) notFound();
  const badge = await getSpeakerBadgeByDownloadToken(token);
  const edition = getSpeakerEdition(badge?.edition);
  if (!badge?.badge_path || !edition) notFound();
  return { badge, edition };
}

export async function generateMetadata({ params }) {
  const { token } = await params;
  const { badge, edition } = await getBadgeOrNotFound(token);
  const title = `${badge.speaker_name} is speaking at ${edition.name}`;
  const description = `${edition.festivalName}, ${edition.dates}, ${edition.venue}.`;
  const image = `/badge/${token}/image`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: `/badge/${token}`,
      type: 'website',
      images: [
        {
          url: image,
          alt: `${badge.speaker_name}, speaker at ${edition.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function SpeakerBadgePage({ params, searchParams }) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  const { badge, edition } = await getBadgeOrNotFound(token);
  const siteUrl = getSiteUrl();
  const pageUrl = buildSpeakerBadgePageUrl({ siteUrl, token });
  const captions = buildSpeakerShareCaptions({
    edition: edition.edition,
    badgePageUrl: pageUrl,
  });

  return (
    <>
      <HomeNavbar />
      <main>
        <BrandedPageHero className="py-12 md:py-16">
          <div className="relative z-10 mx-auto w-full max-w-3xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              {edition.name} Speaker
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
              {badge.speaker_name}
            </h1>
            <p className="mt-3 text-base text-white/85">
              {edition.dates} · {edition.venue}
            </p>
          </div>
        </BrandedPageHero>
        <SpeakerBadgeShare
          name={badge.speaker_name}
          editionName={edition.name}
          imageUrl={`/badge/${token}/image`}
          downloadUrl={buildSpeakerBadgeDownloadUrl({ siteUrl, token })}
          captions={captions}
          links={buildSpeakerShareLinks({ captions, badgePageUrl: pageUrl })}
          profiles={SOCIAL_PROFILES}
          collabNote={COLLAB_NOTE}
          highlight={query?.share === 'instagram' ? 'instagram' : null}
        />
      </main>
    </>
  );
}
