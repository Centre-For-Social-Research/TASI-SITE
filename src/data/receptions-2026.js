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
    // Photo order is the organiser's numbering (1-3 beside the text, 4-9 below).
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
        '/img/receptions/2026/opening/2e1a1970.webp',
        '/img/receptions/2026/opening/2e1a2088.webp',
        '/img/receptions/2026/opening/2e1a2048.webp',
      ],
      moreGallery: [
        '/img/receptions/2026/opening/2e1a2070.webp',
        '/img/receptions/2026/opening/2e1a1924.webp',
        '/img/receptions/2026/opening/2e1a1959.webp',
        '/img/receptions/2026/opening/2e1a1937.webp',
        '/img/receptions/2026/opening/2e1a1903.webp',
        '/img/receptions/2026/opening/2e1a1851.webp',
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
      'The evening before the festival opened at the Goethe-Institut with welcome remarks from CSR and the deputy ambassadors of France and Germany, followed by the Safety Spotlights: short, solution-focused talks from people working on online safety around the world. The festival co-founders then opened the reception for informal conversation.',
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
      'A closed-door roundtable brought policymakers, platforms, researchers and civil society together on building online social discovery around trust, authenticity and safety by design, followed by an evening reception in the Rose Garden.',
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
      theme: 'From Conversation to Commitment',
      summary:
        'The festival closed with a panel reflecting on TASI 2026 and the commitments to carry forward, followed by networking, drinks and dinner with delegates, speakers and partners.',
    },
    // Running order from the reception programme of 15 October 2026; the
    // evening was not recorded. Photos from the closing reception shoot.
    recap: {
      accentLabel: 'Closing Reception',
      title: 'Closing Reception',
      theme: 'From Conversation to Commitment',
      date: 'Thursday, 15 October 2026',
      venue: 'Residence of the Ambassador of the Netherlands, New Delhi',
      summary:
        'On the final evening, H.E. Marisa Gerards welcomed delegates, speakers and partners to the residence of the Ambassador of the Netherlands. A closing panel, From Conversation to Commitment, with Jc Le Toquin, Aparajita Bharti and Rob Lewington, reflected on two days of TASI 2026 and the commitments to carry forward, before concluding remarks from Dr. Ranjana Kumari. The evening ended with networking, drinks and dinner.',
      gallery: [
        '/img/receptions/2026/closing/2v8a7222.webp',
        '/img/receptions/2026/closing/2v8a7295.webp',
        '/img/receptions/2026/closing/2v8a6995.webp',
      ],
      moreGallery: [
        '/img/receptions/2026/closing/2v8a7228.webp',
        '/img/receptions/2026/closing/2v8a7180.webp',
        '/img/receptions/2026/closing/2v8a7218.webp',
        '/img/receptions/2026/closing/2v8a7318.webp',
        '/img/receptions/2026/closing/2v8a7310.webp',
        '/img/receptions/2026/closing/2v8a7093.webp',
      ],
      featuredPeople: [
        {
          name: 'H.E. Marisa Gerards',
          role: 'Ambassador of the Kingdom of the Netherlands',
          photo: '/img/speakers/2026/marisa-gerards.webp',
        },
        {
          name: 'Jc Le Toquin',
          role: 'Co-Founder, Trust & Safety India Festival',
          photo: '/img/speakers/2026/jc-le-toquin.webp',
        },
        {
          name: 'Aparajita Bharti',
          role: 'Co-Founder, The Quantum Hub',
          photo: '/img/speakers/Aparajita Bharti.webp',
        },
        {
          name: 'Rob Lewington',
          role: 'SVP, Head of Global Trust & Safety, TP',
          photo: '/img/speakers/2026/rob-lewington.webp',
        },
        {
          name: 'Dr. Ranjana Kumari',
          role: 'Director, Centre for Social Research',
          photo: '/img/speakers/2026/dr-ranjana-kumari.webp',
        },
      ],
    },
    summary:
      'Welcome remarks from H.E. Marisa Gerards opened the evening, followed by a closing panel, From Conversation to Commitment, with Jc Le Toquin, Aparajita Bharti and Rob Lewington, and concluding remarks from Dr. Ranjana Kumari. The evening ended with networking, drinks and dinner.',
  },
];

export const receptionsAttendance2026 = {
  note: 'All TASI 2026 receptions and side events were by invitation only.',
  contactEmail: 'india@trustandsafetyfestival.com',
};
