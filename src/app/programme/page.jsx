import HomeNavbar from '@/components/home/navbar';
import ProgrammeAgendaClient from '@/components/programme/programme-agenda-client';
import BrandedPageHero from '@/components/ui/branded-page-hero';
import { programmeSessions2025 } from '@/data/programme-2025';
import {
  buildProgrammeSpeakerDesignationMap,
  buildProgrammeSpeakerPhotoMap,
  programmeDayLabels,
  programmeReceptionNotes,
} from '@/lib/programme-page-data';
import programmeAgendaUtils from '@/lib/programme-agenda-utils.cjs';

const { shouldShowProgrammeSession } = programmeAgendaUtils;

export const revalidate = 3600;

export const metadata = {
  title: 'Trust and Safety India Festival Programme | TASI Agenda',
  description:
    'Explore Trust and Safety India Festival programme sessions, speakers, panels, workshops, keynotes, and reception agenda from TASI.',
  alternates: {
    canonical: '/programme',
  },
  openGraph: {
    title: 'Trust and Safety India Festival Programme | TASI Agenda',
    description:
      'Explore Trust and Safety India Festival programme sessions, speakers, panels, workshops, keynotes, and reception agenda from TASI.',
    url: '/programme',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Trust and Safety India Festival - TASI 2026 Programme',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trust and Safety India Festival Programme | TASI Agenda',
    description:
      'Explore Trust and Safety India Festival programme sessions, speakers, panels, workshops, keynotes, and reception agenda from TASI.',
    images: ['/twitter-image'],
  },
};

export default function ProgrammePage() {
  const speakerDesignationMap = buildProgrammeSpeakerDesignationMap();
  const speakerPhotoMap = buildProgrammeSpeakerPhotoMap();
  const visibleSessions = programmeSessions2025.filter(
    shouldShowProgrammeSession
  );

  return (
    <>
      <HomeNavbar />
      <main className="bg-[#fdf6ef] dark:bg-stone-950">
        <BrandedPageHero className="py-14 md:py-20">
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center md:px-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
              Programme Overview
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              TASI 2025 Agenda
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-white/90">
              Explore sessions, speakers, and venue-wise programming across all
              festival days.
            </p>
          </div>
        </BrandedPageHero>

        <ProgrammeAgendaClient
          sessions={visibleSessions}
          dayLabels={programmeDayLabels}
          speakerDesignationMap={speakerDesignationMap}
          speakerPhotoMap={speakerPhotoMap}
          receptionNotes={programmeReceptionNotes}
        />
      </main>
    </>
  );
}
