import Link from 'next/link';
import { notFound } from 'next/navigation';
import HomeNavbar from '@/components/home/navbar';
import BreadcrumbJsonLd from '@/components/seo/breadcrumb-json-ld';
import JsonLdScript from '@/components/seo/json-ld-script';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import { speakers } from '@/data/speakers';
import speakerDirectoryUtils from '@/lib/speaker-directory-utils.cjs';

const {
  buildSpeakerSlug,
  findSpeakerBySlug,
  getSpeakerLinkedInUrl,
  getSpeakerPhotoSrc,
} = speakerDirectoryUtils;

const siteUrl = 'https://trustandsafetyindia.org';

function getSpeakerOrNotFound(slug) {
  const speaker = findSpeakerBySlug(speakers, slug);
  if (!speaker) notFound();
  return speaker;
}

function buildSpeakerDescription(speaker) {
  const role = speaker.designation ? `${speaker.designation}. ` : '';
  const bio = speaker.bio || '';
  return `${speaker.name} is a Trust and Safety India Festival speaker. ${role}${bio}`
    .replace(/\s+/g, ' ')
    .slice(0, 300);
}

export function generateStaticParams() {
  return speakers
    .map((speaker) => ({ slug: buildSpeakerSlug(speaker.name) }))
    .filter(({ slug }) => Boolean(slug));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const speaker = getSpeakerOrNotFound(slug);
  const title = `${speaker.name} | Trust and Safety India Festival Speaker`;
  const description = buildSpeakerDescription(speaker);
  const path = `/speakers/${buildSpeakerSlug(speaker.name)}`;
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
              alt: `${speaker.name}, Trust and Safety India Festival speaker`,
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
  const linkedInUrl = getSpeakerLinkedInUrl(speaker);
  const profileUrl = `${siteUrl}/speakers/${buildSpeakerSlug(speaker.name)}`;
  const personStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${profileUrl}#person`,
    name: speaker.name,
    jobTitle: speaker.designation,
    description: speaker.bio,
    image: photoSrc ? `${siteUrl}${photoSrc}` : undefined,
    url: profileUrl,
    sameAs: speaker.linkedinUrl ? [speaker.linkedinUrl] : undefined,
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
          { name: 'Speakers', url: '/speakers' },
          {
            name: speaker.name,
            url: `/speakers/${buildSpeakerSlug(speaker.name)}`,
          },
        ]}
      />
      <HomeNavbar />
      <main>
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-8 px-4 md:grid-cols-[220px_1fr] md:items-center md:px-6">
            {photoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoSrc}
                alt={`${speaker.name}, ${speaker.designation}`}
                className="mx-auto aspect-square w-44 rounded-[10px] object-cover ring-4 ring-white/25 md:w-56"
              />
            ) : null}
            <div className="text-center md:text-left">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
                Trust and Safety India Festival Speaker
              </p>
              <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
                {speaker.name}
              </h1>
              <p className="mt-4 max-w-3xl text-lg font-semibold text-white/90">
                {speaker.designation}
              </p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-white/70">
                {speaker.category}
              </p>
            </div>
          </div>
        </BrandedPageHero>

        <section className="bg-stone-100 py-12 md:py-16">
          <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 md:grid-cols-[1fr_260px] md:px-6">
            <article className="rounded-[10px] bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-2xl font-black text-stone-950">
                About {speaker.name}
              </h2>
              <p className="mt-5 text-base leading-8 text-stone-700">
                {speaker.bio}
              </p>
            </article>

            <aside className="rounded-[10px] bg-white p-6 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-[0.14em] text-stone-500">
                Speaker Details
              </h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="font-semibold text-stone-500">Event</dt>
                  <dd className="mt-1 text-stone-900">
                    Trust and Safety India Festival
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-stone-500">Category</dt>
                  <dd className="mt-1 text-stone-900">{speaker.category}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-stone-500">Role</dt>
                  <dd className="mt-1 text-stone-900">{speaker.designation}</dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/speakers"
                  className="rounded-[10px] border border-stone-300 px-4 py-2 text-center text-sm font-semibold text-stone-700 hover:border-orange-400 hover:text-orange-700"
                >
                  All speakers
                </Link>
                <a
                  href={linkedInUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[10px] border border-stone-300 px-4 py-2 text-center text-sm font-semibold text-stone-700 hover:border-orange-400 hover:text-orange-700"
                >
                  LinkedIn profile
                </a>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}
