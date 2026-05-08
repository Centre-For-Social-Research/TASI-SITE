export const sponsorHero = {
  eyebrow: 'Partner With TASI 2026',
  title: 'Sponsorship Opportunities',
  description:
    'Align with a high-level policy forum shaping trust and safety outcomes in India and globally.',
};

export const sponsorMetrics = [
  {
    value: '1,000+',
    label:
      'Policymakers, platform leaders, and civil society participants in the room',
  },
  {
    value: '2 Days',
    label:
      'Of sustained visibility across sessions, networking, and curated side moments',
  },
  {
    value: 'Cross-Sector',
    label:
      'A sponsor audience spanning policy, safety operations, academia, and advocacy',
  },
];

export const sponsorReasons = [
  {
    title: 'Influence the right conversations',
    body: 'Direct engagement with policymakers, trust and safety leaders, and civil society representatives working on digital governance and online safety.',
  },
  {
    title: 'Earn meaningful visibility',
    body: 'Brand presence across sessions, venue touchpoints, delegate materials, and digital channels without feeling disconnected from the programme.',
  },
  {
    title: 'Show up with substance',
    body: 'Opportunities for speaking, workshops, spotlight moments, and thematic alignment that go beyond logo placement.',
  },
  {
    title: 'Reach a globally relevant audience',
    body: 'TASI is rooted in India while connecting to broader cross-border debates around AI, platform accountability, and digital trust.',
  },
];

export const sponsorshipPillars = [
  'Thought leadership through sessions, spotlights, and workshops',
  'Brand visibility integrated across physical and digital touchpoints',
  'Relationship-building with a high-intent, cross-sector participant base',
];

const sponsorshipTiers = [
  {
    name: 'Platinum',
    price: '$30,000',
    availability: 'Exclusive',
    emphasis: true,
    cta: 'Enquire Now',
    info: 'All Access Leadership',
    features: [
      'Keynote + panel + spotlight + workshop',
      'Strategic co-creation of a flagship theme',
      'Premium visibility across festival touchpoints plus exhibit booth',
      '10 passes',
    ],
  },
  {
    name: 'Gold',
    price: '$20,000',
    availability: '3 available',
    cta: 'Enquire Now',
    info: 'Lead a Key Conversation',
    features: [
      'Panel + one activation of your choice',
      'Choose either a spotlight or workshop',
      'Full visibility across channels plus exhibit booth',
      '5 passes',
    ],
  },
  {
    name: 'Silver',
    price: '$10,000',
    availability: '5 available',
    cta: 'Enquire Now',
    info: 'Contribute to the Dialogue',
    features: [
      'Panel participation',
      'Core visibility',
      '2 passes',
      'Optional add-ons: spotlight ($5K) or workshop ($5K)',
    ],
  },
  {
    name: 'Supporter',
    price: '$5,000',
    availability: 'Limited slots',
    cta: 'Enquire Now',
    info: 'Showcase Your Work',
    features: [
      'Choose one: spotlight talk (10 min), interactive workshop (1-2 hrs), or keynote speaker slot (10 min)',
      'Includes branding',
      '2 passes',
    ],
  },
];

export const sponsorPricingPlans = [
  ...sponsorshipTiers.map((tier) => ({
    name: tier.name,
    info: tier.info,
    price: tier.price,
    availability: tier.availability,
    highlighted: tier.emphasis,
    features: tier.features.map((feature) => ({ text: feature })),
    btn: {
      text: tier.cta,
      href: 'mailto:india@trustandsafetyfestival.org',
    },
  })),
  {
    name: 'Add-On Opportunities',
    info: 'Extend your partnership',
    availability: 'Callout Box',
    badge: 'Flexible',
    features: [
      { text: 'Support Global South participation - $2,500 per expert' },
      { text: 'Host a networking reception' },
      { text: 'Custom partnerships available' },
    ],
  },
];

export const sponsorshipProspectus = {
  href: '/downloads/tasi-2026-sponsorship-prospectus.txt',
  label: 'Download Prospectus',
  description:
    'Download the sponsorship prospectus for package details, benefits, deliverables, and engagement options.',
};

export const sponsorPartnerOptions = [
  {
    title: 'Media or Association Partner',
    eyebrow: 'Amplification',
    body: 'Collaborate with TASI as a media platform, trade body, association, or ecosystem network to amplify key conversations and reach the communities that matter most.',
    href: '/media',
    cta: 'Enquire Now',
  },
  {
    title: 'Custom Partnership',
    eyebrow: 'Custom Partnership',
    body: 'If you want a bespoke package, hosted side event, or a partnership aligned to a specific audience segment, we can shape that with you directly.',
    href: '/contact',
    cta: 'View Contact Page',
    email: 'india@trustandsafetyfestival.org',
  },
];
