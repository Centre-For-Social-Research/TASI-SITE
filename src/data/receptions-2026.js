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
        'The evening before the festival brought delegates and partners together at the Goethe-Institut for welcome remarks from CSR and the deputy ambassadors of France and Germany, then five short Safety Spotlights from global safety innovators.',
    },
    // Shown in the 2025-style reception recap once the evening has happened.
    // Running order and roles from the reception programme of 13 October 2026.
    recap: {
      accentLabel: 'Opening Reception',
      title: 'Opening Reception',
      theme: 'Welcome Remarks and Safety Spotlights to Launch TASI 2026',
      date: 'Tuesday, 13 October 2026',
      venue: 'Goethe-Institut, Max Mueller Bhavan, New Delhi',
      summary:
        'On the evening before the festival, delegates, speakers and partners gathered at the Goethe-Institut for the TASI 2026 curtain raiser. The Deputy Chiefs of Mission of Germany and France welcomed guests, Dr. Ranjana Kumari introduced the festival, and five Safety Spotlights followed: on children’s agency online, protecting journalists, youth well-being in Australia, technology against trafficking, and the Tech Coalition’s Project Lantern. The festival co-founders closed the session and opened the reception.',
      gallery: [
        '/img/receptions/2026/opening/2e1a1924.webp',
        '/img/receptions/2026/opening/2e1a1970.webp',
        '/img/receptions/2026/opening/2e1a2070.webp',
      ],
      moreGallery: [
        '/img/receptions/2026/opening/2e1a1851.webp',
        '/img/receptions/2026/opening/2e1a1959.webp',
        '/img/receptions/2026/opening/2e1a1903.webp',
        '/img/receptions/2026/opening/2e1a1937.webp',
        '/img/receptions/2026/opening/2e1a2048.webp',
        '/img/receptions/2026/opening/2e1a2088.webp',
      ],
      featuredPeople: [
        {
          name: 'Georg Enzweiler',
          role: 'Deputy Chief of Mission, German Embassy',
        },
        {
          name: 'Lisa Amon',
          role: 'Deputy Chief of Mission, Embassy of France',
        },
        {
          name: 'Julia Reischle',
          role: 'First Secretary, German Embassy (Moderator)',
        },
        {
          name: 'Dr. Ranjana Kumari',
          role: 'Director, Centre for Social Research',
          photo: '/img/speakers/2026/dr-ranjana-kumari.webp',
        },
        {
          name: 'Jyoti Vadehra',
          role: 'Head, Online Safety and Wellbeing, Centre for Social Research',
          photo: '/img/speakers/2026/jyoti-vadehra.webp',
        },
        {
          name: 'Rahul Fernandes',
          role: 'Product and Marketing Leader',
          photo: '/img/speakers/2026/rahul-fernandes.webp',
        },
        {
          name: 'Kunal Majumder',
          role: 'Asia-Pacific Program Coordinator, Committee to Protect Journalists',
          photo: '/img/speakers/2026/kunal-majumder.webp',
        },
        {
          name: 'Lucy Thomas',
          role: 'Co-founder & CEO, PROJECT ROCKIT',
          photo: '/img/speakers/2026/lucy-thomas.webp',
        },
        {
          name: 'Rescue Foundation',
          role: 'Using Tech to Combat Trafficking: A Lesson from India',
        },
        {
          name: 'Lisa Morrison',
          role: 'Membership Development and Engagement Manager, APAC, Tech Coalition',
          photo: '/img/speakers/2026/lisa-morrison.webp',
        },
        {
          name: 'Jc Le Toquin',
          role: 'Co-Founder, Trust & Safety India Festival',
          photo: '/img/speakers/2026/jc-le-toquin.webp',
        },
        {
          name: 'Caroline Humer',
          role: 'Co-Founder, Trust & Safety Festival',
          photo: '/img/speakers/2026/caroline-humer.webp',
        },
      ],
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
