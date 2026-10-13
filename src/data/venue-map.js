// On-site wayfinding for TASI 2026 at the IIC Kamaladevi Complex. Room
// use was confirmed by the organising team on 14 October 2026. The
// illustration is schematic: room positions inside each floor are
// indicative, not to scale.

export const venueMapPath = '/plan-your-travel/venue-map';

export const venueMapMetadata = {
  title: 'Venue Map: Kamaladevi Complex, IIC | TASI 2026',
  description:
    'Find your way around TASI 2026 at the Kamaladevi Complex, India International Centre: Main Hall, registration, exhibition, lunch, workshop and roundtable rooms.',
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
      'Collect your badge, meet partners at the exhibition and join lunch in the Rose Garden.',
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
        room: 'Outside the Main Hall',
        note: 'Keep your QR pass handy to collect your badge.',
      },
      {
        marker: '2',
        zone: 'connect',
        name: 'Exhibition',
        room: 'Outside the Main Hall',
        note: 'Meet partners and see their work between sessions.',
      },
      {
        marker: '3',
        zone: 'connect',
        name: 'Lunch',
        room: 'Rose Garden',
        note: 'Next to the Kamaladevi Complex, during the lunch break.',
      },
    ],
  },
  {
    key: 'first',
    title: 'First Floor',
    subtitle: 'One level up from the Main Hall',
    places: [
      {
        marker: '4',
        zone: 'breakouts',
        name: 'Workshop Room',
        room: 'Seminar Halls 1 & 2 (combined)',
        note: 'Workshops and masterclasses.',
      },
      {
        marker: '5',
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
  'Registration is on the ground floor, just outside the Main Hall.',
  'A lift and stairs connect the ground floor with the first floor rooms.',
];
