import Link from 'next/link';
import { notFound } from 'next/navigation';
import HomeNavbar from '@/components/home/navbar';
import BreadcrumbJsonLd from '@/components/seo/breadcrumb-json-ld';
import JsonLdScript from '@/components/seo/json-ld-script';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import speakers2026 from '@/data/speakers-2026.json';
import speakerDirectoryUtils from '@/lib/speaker-directory-utils.cjs';
import { getSpeakerPhotoPosition } from '@/lib/speaker-photo-position-2026';

const { buildSpeakerSlug, findSpeakerBySlug, getSpeakerPhotoSrc } =
  speakerDirectoryUtils;

const siteUrl = 'https://trustandsafetyindia.org';

function getSpeakerOrNotFound(slug) {
  const speaker = findSpeakerBySlug(speakers2026, slug);
  if (!speaker) notFound();
  return speaker;
}

function buildSpeakerDescription(speaker) {
  const role = speaker.designation ? `${speaker.designation}. ` : '';
  const bio = speaker.bio || '';
  return `${speaker.name} is a TASI 2026 speaker. ${role}${bio}`
    .replace(/\s+/g, ' ')
    .slice(0, 300);
}

export function generateStaticParams() {
  return speakers2026
    .map((speaker) => ({ slug: buildSpeakerSlug(speaker.name) }))
    .filter(({ slug }) => Boolean(slug));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const speaker = getSpeakerOrNotFound(slug);
  const title = `${speaker.name} | TASI 2026 Speaker`;
  const description = buildSpeakerDescription(speaker);
  const path = `/speakers/2026/${buildSpeakerSlug(speaker.name)}`;
  const image = getSpeakerPhotoSrc(speaker);

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      type: 'profile',
      images: image
        ? [
            {
              url: image,
              alt: `${speaker.name}, TASI 2026 speaker`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function SpeakerProfilePage({ params }) {
  const { slug } = await params;
  const speaker = getSpeakerOrNotFound(slug);
  const photoSrc = getSpeakerPhotoSrc(speaker);
  const profileUrl = `${siteUrl}/speakers/2026/${buildSpeakerSlug(speaker.name)}`;
  const personStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${profileUrl}#person`,
    name: speaker.name,
    jobTitle: speaker.designation,
    worksFor: speaker.organisation
      ? { '@type': 'Organization', name: speaker.organisation }
      : undefined,
    description: speaker.bio,
    image: photoSrc ? `${siteUrl}${photoSrc}` : undefined,
    url: profileUrl,
    sameAs: [speaker.linkedinUrl, speaker.xUrl, speaker.instagramUrl].filter(
      Boolean
    ),
    performerIn: {
      '@type': 'Event',
      '@id': `${siteUrl}/#event`,
      name: 'Trust and Safety India Festival 2026',
    },
  };

  return (
    <>
      <JsonLdScript data={personStructuredData} />
      <BreadcrumbJsonLd
        items={[
          { name: 'TASI 2026 Speakers', url: '/speakers?year=2026' },
          {
            name: speaker.name,
            url: `/speakers/2026/${buildSpeakerSlug(speaker.name)}`,
          },
        ]}
      />
      <HomeNavbar />
      <main>
        <BrandedPageHero className="py-14 md:py-20">
          <div
            className={`relative z-10 mx-auto grid w-full max-w-5xl gap-8 px-4 md:items-center md:px-6 ${photoSrc ? 'md:grid-cols-[224px_1fr]' : ''}`}
          >
            {photoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoSrc}
                alt={`${speaker.name}, ${speaker.designation}`}
                className="mx-auto aspect-square w-44 rounded-[10px] object-cover ring-4 ring-white/25 md:mx-0 md:w-56"
                style={{
                  objectPosition: getSpeakerPhotoPosition(
                    buildSpeakerSlug(speaker.name)
                  ),
                }}
              />
            ) : null}
            <div
              className={photoSrc ? 'text-center md:text-left' : 'text-center'}
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
                TASI 2026 Speaker
              </p>
              <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                {speaker.name}
              </h1>
              <p className="mt-4 max-w-3xl text-lg font-semibold text-white/90">
                {speaker.designation}
              </p>
              {speaker.organisation && (
                <p className="mt-2 text-base text-white/85">
                  {speaker.organisation}
                </p>
              )}
            </div>
          </div>
        </BrandedPageHero>

        <section className="bg-stone-100 py-12 md:py-16">
          <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 md:grid-cols-[1fr_260px] md:px-6">
            <article className="rounded-[10px] bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-black text-stone-950">
                About {speaker.name}
              </h2>
              <p className="mt-5 whitespace-pre-line text-base leading-8 text-stone-700">
                {speaker.bio}
              </p>
            </article>

            <aside className="rounded-[10px] bg-white p-6 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-[0.14em] text-stone-500">
                Speaker Details
              </h2>
              <dl className="mt-5 space-y-5 text-sm">
                <div>
                  <dt className="font-semibold text-stone-500">Category</dt>
                  <dd className="mt-1 text-stone-900">{speaker.category}</dd>
                </div>
                {speaker.country && (
                  <div>
                    <dt className="font-semibold text-stone-500">Country</dt>
                    <dd className="mt-1 text-stone-900">{speaker.country}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/speakers?year=2026"
                  className="rounded-[10px] border border-stone-300 px-4 py-2 text-center text-sm font-semibold text-stone-700 hover:border-orange-400 hover:text-orange-700"
                >
                  All TASI 2026 speakers
                </Link>
                {[
                  ['LinkedIn', speaker.linkedinUrl],
                  ['X profile', speaker.xUrl],
                  ['Instagram profile', speaker.instagramUrl],
                ]
                  .filter(([, url]) => Boolean(url))
                  .map(([label, url]) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-[10px] border border-stone-300 px-4 py-2 text-center text-sm font-semibold text-stone-700 hover:border-orange-400 hover:text-orange-700"
                    >
                      {label}
                    </a>
                  ))}
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
