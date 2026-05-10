import { speakers } from '@/data/speakers';
import { agendaSpeakerFallbackTitles2025 } from '@/data/programme-2025';
import programmeAgendaUtils from '@/lib/programme-agenda-utils.cjs';

const { normalizePersonName } = programmeAgendaUtils;

export const programmeDayLabels = {
  oct6: 'October 6 - Opening Reception',
  oct7: 'October 7 - Conference Day 1',
  oct8: 'October 8 - Conference Day 2',
};

export const programmeReceptionNotes = [
  {
    day: 'October 6',
    venue: 'Embassy of France, New Delhi',
    access: 'Invite only',
    description:
      'Opening evening reception for delegates and partners, with welcome remarks and spotlight conversations to launch TASI 2025.',
  },
  {
    day: 'October 7',
    venue: 'Embassy of Netherlands, New Delhi',
    access: 'Invite only',
    description:
      'Networking reception and panel evening designed for cross-sector dialogue after the conference day at Taj Ambassador.',
  },
  {
    day: 'October 8',
    venue: 'Swedish Embassy, New Delhi',
    access: 'Invite only',
    description:
      'Closing reception with reflections from the two-day agenda, a forward-looking panel, and informal networking over dinner.',
  },
];

export function buildProgrammeSpeakerDesignationMap() {
  const fromSpeakersPage = Object.fromEntries(
    speakers
      .map((speaker) => [
        normalizePersonName(speaker.name),
        speaker.designation,
      ])
      .filter(([key, value]) => key && value)
  );

  return {
    ...agendaSpeakerFallbackTitles2025,
    ...fromSpeakersPage,
  };
}

export function buildProgrammeSpeakerPhotoMap() {
  const fromSpeakersPage = Object.fromEntries(
    speakers
      .map((speaker) => {
        const normalizedName = normalizePersonName(speaker.name);
        if (!normalizedName || !speaker.photo) return null;
        const photoPath = speaker.photo.startsWith('/')
          ? speaker.photo
          : `/img/speakers/${speaker.photo}`;
        return [normalizedName, photoPath];
      })
      .filter(Boolean)
  );

  return {
    'delphine o': '/img/speakers/Delphine O.jpg',
    'julie inman grant': '/img/speakers/Julie_Inman_Grant.jpg',
    'high commissioner of canada to india':
      '/img/Speaker Highlights/Christopher Cooter.png',
    'legal attache suhel daud': '/img/speakers/Suhel Daud.jpg',
    ...fromSpeakersPage,
  };
}
