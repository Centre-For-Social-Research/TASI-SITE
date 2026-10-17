export const MEDIA_OUTLET_TYPES = [
  'Print',
  'Digital / Online',
  'Broadcast (TV / Radio)',
  'Wire / News agency',
  'Podcast',
  'Freelance',
];

export const MEDIA_COVERAGE_DAYS = [
  '14 October',
  '15 October',
  'Both days',
  'Not sure yet',
];

export const mediaAccreditationMetadata = {
  title: 'Media Accreditation | Trust and Safety India Festival',
  description:
    'Media accreditation for TASI 2026 has closed. For interviews and media requests, contact the TASI team; the press kit and TASI 2026 recap are on the media page.',
  alternates: {
    canonical: '/media/accreditation',
  },
  openGraph: {
    title: 'Media Accreditation | Trust and Safety India Festival',
    description: 'Media accreditation for TASI 2026 has closed.',
    url: '/media/accreditation',
    type: 'website',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TASI Media Accreditation',
    description: 'Media accreditation for TASI 2026 has closed.',
    images: ['/twitter-image'],
  },
};

export const mediaAccreditationHero = {
  eyebrow: 'TASI Media',
  title: 'Media Accreditation',
  description:
    'Accreditation for TASI 2026 has closed. For interviews and media requests, contact the TASI team; the press kit and the TASI 2026 recap are on the media page.',
};

export const mediaAccreditationGuidance = {
  title: 'Before you apply',
  description:
    'Media accreditation is intended for working journalists, editors, broadcasters, news agencies, podcasters, and eligible freelance reporters covering trust, safety, public policy, and emerging technology.',
  notes: [
    'Use a valid business email linked to your publication or newsroom where possible.',
    'Each request is reviewed individually by the TASI media team.',
    'Approved applicants receive press access details and on-site media desk timings by email.',
  ],
};

export const mediaAccreditationSteps = [
  {
    title: 'Submit your request',
    description:
      'Share your contact, publication, and intended coverage details.',
  },
  {
    title: 'Team review',
    description: 'The TASI media team reviews each accreditation request.',
  },
  {
    title: 'Receive access details',
    description:
      'Approved applicants receive confirmation and practical information by email.',
  },
];
