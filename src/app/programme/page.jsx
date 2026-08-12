import HomeNavbar from '@/components/home/navbar';
import ProgrammePageClient from '@/components/programme/programme-page-client';
import { programmeSessions2025 } from '@/data/programme-2025';
import { programmeSessions2026 } from '@/data/programme-2026';
import {
  buildProgrammeSpeakerDesignationMap,
  buildProgrammeSpeakerPhotoMap,
  programmeDayDateMap2026,
  programmeDayLabels,
  programmeDayLabels2026,
  programmeReceptionNotes,
  programmeReceptionNotes2026,
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
  const visibleSessions2026 = programmeSessions2026.filter(
    shouldShowProgrammeSession
  );

  return (
    <>
      <HomeNavbar />
      <ProgrammePageClient
        sessions={visibleSessions}
        dayLabels={programmeDayLabels}
        speakerDesignationMap={speakerDesignationMap}
        speakerPhotoMap={speakerPhotoMap}
        receptionNotes={programmeReceptionNotes}
        sessions2026={visibleSessions2026}
        dayLabels2026={programmeDayLabels2026}
        receptionNotes2026={programmeReceptionNotes2026}
        dayDateMap2026={programmeDayDateMap2026}
      />
    </>
  );
}
