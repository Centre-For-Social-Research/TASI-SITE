import { programmeSessions2026 } from './programme-2026.js';

// TASI 2026 receptions and private side events. Times and venues come from
// the public programme, so this page and /programme can't drift apart. Only hosting and context live here.

const sessionById = (id) =>
  programmeSessions2026.find((session) => session.id === `tasi26-${id}`);

export const receptions2026 = [
  {
    slug: 'opening-reception-2026',
    session: sessionById(1),
    kind: 'Reception',
    day: '13',
    weekday: 'Tue',
    hosts: [
      {
        name: 'Embassy of France in India',
        logo: '/img/Logo/2026/france-in-india.png',
      },
      {
        name: 'German Embassy New Delhi',
        logo: '/img/Logo/2026/germany-in-india.png',
      },
    ],
    hostLine: 'Jointly hosted by the Embassy of France and the German Embassy',
    card: {
      theme: 'Welcome Remarks and Safety Spotlights to Launch TASI 2026',
      summary:
        'The evening before the festival brings delegates and partners together at the Goethe-Institut for welcome remarks from CSR and the deputy ambassadors of France and Germany, then five short Safety Spotlights from global safety innovators.',
    },
    summary:
      'The evening before the festival opens at the Goethe-Institut with welcome remarks from CSR and the deputy ambassadors of France and Germany, followed by the Safety Spotlights: short, solution-focused talks from people working on online safety around the world. The festival co-founders then open the reception for informal conversation.',
  },
  {
    slug: 'match-group-policy-lab',
    session: sessionById(25),
    kind: 'Private side event',
    day: '14',
    weekday: 'Wed',
    venue: 'India International Centre',
    hosts: [
      {
        name: 'Match Group',
        logo: '/img/Logo/2026/match-group.png',
      },
    ],
    hostLine: 'Hosted by Match Group',
    card: {
      title: 'Match Group Policy Lab',
      theme:
        'Building Trusted Human Connections: Designing for Safety, Authenticity and Inclusion',
      summary:
        'A private, closed-door roundtable at the end of the first festival day on trust, authenticity and safety by design in online social discovery, followed by an evening reception in the Rose Garden.',
    },
    summary:
      'A closed-door roundtable with policymakers, platforms, researchers and civil society on building online social discovery around trust, authenticity and safety by design, followed by an evening reception in the Rose Garden.',
  },
  {
    slug: 'closing-reception-2026',
    session: sessionById(68),
    kind: 'Reception',
    day: '15',
    weekday: 'Thu',
    hosts: [
      {
        name: 'Embassy of the Kingdom of the Netherlands',
        logo: '/img/Logo/2026/netherlands-in-india.png',
      },
    ],
    hostLine:
      'Hosted by H.E. Marisa Gerards, Ambassador of the Kingdom of the Netherlands',
    card: {
      theme: 'Reflections on Two Days of TASI 2026',
      summary:
        'The festival closes with a short fireside conversation on the key takeaways from TASI 2026, followed by food and drinks with delegates, speakers and partners.',
    },
    summary:
      'The festival closes with a short fireside conversation looking back on two days of TASI 2026, then food and drinks with delegates, speakers and partners.',
  },
];

export const receptionsAttendance2026 = {
  note: 'All TASI 2026 receptions and side events are by invitation only. Invited guests receive venue and entry details directly from the organising team or the host. A festival registration does not by itself include an invitation.',
  contactEmail: 'india@trustandsafetyfestival.com',
};
