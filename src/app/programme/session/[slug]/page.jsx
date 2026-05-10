import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, Grid2X2, MapPin } from 'lucide-react';
import HomeNavbar from '@/components/home/navbar';
import BreadcrumbJsonLd from '@/components/seo/breadcrumb-json-ld';
import JsonLdScript from '@/components/seo/json-ld-script';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import { programmeSessions2025 } from '@/data/programme-2025';
import programmeAgendaUtils from '@/lib/programme-agenda-utils.cjs';
import {
  buildProgrammeSpeakerDesignationMap,
  buildProgrammeSpeakerPhotoMap,
  programmeDayLabels,
} from '@/lib/programme-page-data';
import speakerDirectoryUtils from '@/lib/speaker-directory-utils.cjs';

const SITE_URL = 'https://trustandsafetyindia.org';
const {
  buildProgrammeSessionViewModels,
  findProgrammeSessionBySlug,
  getProgrammeSessionPath,
  shouldShowProgrammeSession,
  sortProgrammeSessionsForAgenda,
} = programmeAgendaUtils;
const { getSpeakerProfilePath } = speakerDirectoryUtils;

function getSessionViewModels() {
  return sortProgrammeSessionsForAgenda(
    buildProgrammeSessionViewModels({
      sessions: programmeSessions2025.filter(shouldShowProgrammeSession),
      speakerDesignationMap: buildProgrammeSpeakerDesignationMap(),
      speakerPhotoMap: buildProgrammeSpeakerPhotoMap(),
    })
  );
}

function getSessionBySlug(slug) {
  return findProgrammeSessionBySlug(getSessionViewModels(), slug);
}

function buildSessionDescription(session) {
  return (
    session.topic ||
    `${session.title} at the Trust and Safety India Festival programme, featuring ${session.speakersDetailed
      ?.map((speaker) => speaker.name)
      .join(', ')}.`
  );
}

export function generateStaticParams() {
  return getSessionViewModels().map((session) => ({
    slug: getProgrammeSessionPath(session).split('/').pop(),
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const session = getSessionBySlug(slug);

  if (!session) {
    return {
      title: 'Trust and Safety India Festival Programme | TASI',
    };
  }

  const description = buildSessionDescription(session);
  const path = getProgrammeSessionPath(session);

  return {
    title: `${session.title} | Trust and Safety India Festival Programme`,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${session.title} | TASI Programme`,
      description,
      url: path,
      type: 'article',
      images: session.speakersDetailed?.[0]?.photo
        ? [session.speakersDetailed[0].photo]
        : ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${session.title} | TASI Programme`,
      description,
      images: session.speakersDetailed?.[0]?.photo
        ? [session.speakersDetailed[0].photo]
        : ['/twitter-image'],
    },
  };
}

export default async function ProgrammeSessionPage({ params }) {
  const { slug } = await params;
  const session = getSessionBySlug(slug);

  if (!session) notFound();

  const description = buildSessionDescription(session);
  const path = getProgrammeSessionPath(session);
  const pageUrl = `${SITE_URL}${path}`;
  const speakers = session.speakersDetailed || [];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${pageUrl}#session`,
    name: session.title,
    description,
    url: pageUrl,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    superEvent: {
      '@type': 'Event',
      name: 'Trust and Safety India Festival',
      url: SITE_URL,
    },
    location: {
      '@type': 'Place',
      name: session.venue || session.track || 'TASI venue',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'New Delhi',
        addressCountry: 'IN',
      },
    },
    performer: speakers.map((speaker) => ({
      '@type': 'Person',
      name: speaker.name,
      jobTitle: speaker.title,
      url: `${SITE_URL}${getSpeakerProfilePath(speaker)}`,
    })),
    keywords: [
      'Trust and Safety India Festival',
      'TASI programme',
      session.title,
      session.track,
      session.venue,
      ...speakers.map((speaker) => speaker.name),
    ]
      .filter(Boolean)
      .join(', '),
  };

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Programme', url: '/programme' },
          { name: session.title, url: path },
        ]}
      />
      <HomeNavbar />
      <main className="bg-[#fdf6ef] pb-16 text-stone-900 dark:bg-stone-950 dark:text-white">
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-5xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              {programmeDayLabels[session.day] || 'TASI Programme'}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              Programme Session Details
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              Explore session timing, venue, speakers, and programme context
              from the Trust and Safety India Festival agenda.
            </p>
          </div>
        </BrandedPageHero>

        <section className="mx-auto grid w-full max-w-6xl items-stretch gap-8 px-4 py-12 md:grid-cols-[1fr_320px] md:px-6">
          <article className="flex flex-col rounded-[10px] border border-stone-200 bg-white p-7 shadow-sm dark:border-stone-800 dark:bg-stone-900 md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-400">
              {session.format} Session
            </p>
            <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-stone-950 dark:text-white md:text-4xl">
              {session.title}
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-stone-600 dark:text-stone-300">
              {description}
            </p>
            <div className="mt-auto pt-8">
              <dl className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-medium text-stone-500 dark:text-stone-300">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  <dt className="sr-only">Time</dt>
                  <dd>{session.time}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <dt className="sr-only">Venue</dt>
                  <dd>{session.venue || session.track}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Grid2X2 className="h-4 w-4" aria-hidden="true" />
                  <dt className="sr-only">Festival</dt>
                  <dd>Trust and Safety India Festival</dd>
                </div>
              </dl>
            </div>
          </article>

          <aside className="rounded-[10px] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#b33f2a]">
              Speakers
            </p>
            <div className="mt-5 space-y-4">
              {speakers.map((speaker) => (
                <Link
                  key={speaker.name}
                  href={getSpeakerProfilePath(speaker)}
                  className="flex gap-3 text-stone-900 no-underline dark:text-white"
                >
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-stone-200">
                    {speaker.photo && (
                      <Image
                        src={speaker.photo}
                        alt={speaker.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <span>
                    <span className="block font-bold">{speaker.name}</span>
                    {speaker.title && (
                      <span className="block text-sm text-stone-600 dark:text-stone-300">
                        {speaker.title}
                      </span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}
