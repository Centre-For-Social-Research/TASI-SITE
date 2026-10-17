// On-site wayfinding for TASI 2026 at the IIC Kamaladevi Complex. Room
// use was confirmed by the organising team on 14 October 2026. The
// illustration is schematic: room positions inside each floor are
// indicative, not to scale.

export const venueMapPath = '/plan-your-travel/venue-map';

export const venueMapMetadata = {
  title: 'Venue Map: Kamaladevi Complex, IIC | TASI 2026',
  description:
    'How TASI 2026 used the Kamaladevi Complex, India International Centre: Main Hall, registration, exhibition, lunch, workshop and roundtable rooms.',
  alternates: {
    canonical: venueMapPath,
  },
};

export const venueMapZones = [
  {
    key: 'sessions',
    title: 'Sessions',
    description:
      'Keynotes, panels and fireside chats in the Main Hall on both days.',
  },
  {
    key: 'breakouts',
    title: 'Workshops & Roundtables',
    description:
      'Hands-on workshops and closed-door roundtables, one floor up from the Main Hall.',
  },
  {
    key: 'connect',
    title: 'Registration, Exhibition & Lunch',
    description:
      'Badge collection, the partner exhibition and lunch in the Rose Garden.',
  },
];

export const venueMapFloors = [
  {
    key: 'ground',
    title: 'Ground Floor',
    subtitle: 'Kamaladevi Complex',
    places: [
      {
        marker: '1',
        zone: 'sessions',
        name: 'Main Hall',
        room: 'Multipurpose Hall',
        note: 'All plenary sessions, keynotes and panels.',
      },
      {
        marker: 'R',
        zone: 'connect',
        name: 'Registration',
        room: 'At the entrance',
      },
      {
        marker: '2',
        zone: 'connect',
        name: 'Exhibition',
        room: 'Stalls 1–5, by the entrance',
        note: 'Meet partners and see their work between sessions.',
      },
      {
        marker: '3',
        zone: 'connect',
        name: 'Selfie Point',
        room: 'By the entrance',
        note: 'Share your TASI 2026 moment.',
      },
      {
        marker: '4',
        zone: 'connect',
        name: 'Lunch',
        room: 'Rose Garden',
        note: 'Behind the Main Hall, during the lunch break.',
      },
    ],
  },
  {
    key: 'first',
    title: 'First Floor',
    subtitle: 'One level up from the Main Hall',
    places: [
      {
        marker: '5',
        zone: 'breakouts',
        name: 'Workshop Room',
        room: 'Seminar Halls 1 & 2 (combined)',
        note: 'Workshops and masterclasses.',
      },
      {
        marker: '6',
        zone: 'breakouts',
        name: 'Roundtable Room',
        room: 'Seminar Hall 3',
        note: 'Roundtables and closed-door discussions.',
      },
    ],
  },
];

export const venueMapArrival = [
  'The Kamaladevi Complex is next to Gate 1 of the India International Centre.',
  'Enter on the side facing Gate 1. Registration, the selfie point and the exhibition stalls are right by the entrance.',
  'The Main Hall is just past registration, and lunch is in the Rose Garden behind it.',
  'A lift and stairs connect the ground floor with the first floor rooms.',
];
