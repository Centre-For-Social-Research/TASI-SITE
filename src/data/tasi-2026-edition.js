// Post-event recap content for the TASI 2026 edition page. Copy comes from
// the session transcripts (D:\TASI 2026\_transcripts\WEBSITE_CONTENT.md);
// every quote is word for word. Sessions held under the Chatham House Rule
// (tasi26-60, tasi26-74, tasi26-83) are deliberately left out.
import { speakerCountries2026 } from './speaker-countries-2026.js';

export const tasi2026HeroPills = [
  '14-15 October 2026',
  'India International Centre, New Delhi',
  '500+ Participants',
];

export const tasi2026HeroActions = [
  {
    label: 'Watch the Highlights',
    href: '#festival-highlights',
    variant: 'primary',
  },
  {
    label: 'Explore the Programme',
    href: '/programme',
    variant: 'secondary',
  },
];

export const tasi2026HighlightsVideoSrc =
  'https://player.mux.com/81M00mV2JqGFdX78lWxkZ0002vLJIv02NMJ31ArM7FJ9Kj8?metadata-video-title=TAS+2026+Highlights&video-title=TAS+2026+Highlights';

export const tasi2026PerspectiveQuote = {
  text: 'We created those technologies, we retain the responsibility to shape their purpose.',
  author: 'Dr. Ranjana Kumari, Director, Centre for Social Research',
};

export const tasi2026Stats = [
  ['500+', 'Attendees'],
  ['110+', 'Speakers'],
  ['55+', 'Sessions'],
  [String(speakerCountries2026.length), 'Countries Represented'],
  ['2', 'Days of Sessions'],
  ['3', 'Rooms'],
];

// Five ideas that came up across sessions. Figures are claims made on stage,
// credited to the speaker who cited them, not numbers TASI has verified.
export const tasi2026Ideas = [
  {
    number: '01',
    title: 'Children Want a Say, Not Just a Shield',
    body: 'Over 80% of children in a CSR–Roblox study felt safe online, yet very few ask an adult for help when something goes wrong. Speakers urged building safety with young people, not for them, and paying them for their expertise.',
    stat: {
      value: '8%',
      label:
        'of children surveyed turn to a trusted adult when something goes wrong online',
      source: 'CSR and Roblox, Youth in Play study',
    },
    quote: {
      text: 'Children do not go to the internet for bad. Bad finds them.',
      author: 'Nina Bual',
      role: 'Founder, Cyberlite',
      photo: '/img/speakers/2026/nina-bual.webp',
    },
    image: '/img/tasi-2026/idea-youth-behind-the-chat.webp',
    imageAlt:
      'Speakers on stage at the Behind the Chat spotlight on AI companions',
    sessions: ['tasi26-24', 'tasi26-17', 'tasi26-4'],
  },
  {
    number: '02',
    title: 'Age Checks Are Coming. The Fight Is Over How',
    body: "Self-declared age drew wide criticism. The debate moved to privacy-preserving checks that sit where risk begins, offer choice, and work on India's shared family phones.",
    stat: {
      value: '60%',
      label: 'of children in a 1,200-child survey use shared devices',
      source: 'Siddharth P, RATI Foundation',
    },
    quote: {
      text: "If you're doing an age check, you're really doing an age check and you're not doing an identity check by stealth.",
      author: 'Omari Rodney',
      role: 'Chief Product Engineer, Yoti',
      photo: '/img/speakers/2026/omari-rodney.webp',
    },
    image: '/img/tasi-2026/idea-age-assurance-panel.webp',
    imageAlt:
      'The age assurance and age-appropriate design panel in the Main Hall',
    sessions: ['tasi26-23', 'tasi26-11', 'tasi26-54'],
  },
  {
    number: '03',
    title: 'Scams Have Become an Industry',
    body: 'Fake listings, sextortion, digital arrest and trafficking into scam compounds abroad were described as one connected business. Manoj Kumar Meena of the Ministry of Home Affairs urged platforms to stop earning from recruitment ads.',
    stat: {
      value: '₹22,495 cr',
      label:
        'lost to cyber fraud in India last year, up from ₹551 crore four years earlier',
      source: 'Himadri Sarkar, TP',
    },
    quote: {
      text: "Digital safety is not a moderation problem. It's an early warning signal problem.",
      author: 'Himadri Sarkar',
      role: 'Chief Solutions Officer, TP',
      photo: '/img/speakers/2026/himadri-sarkar.webp',
    },
    image: '/img/tasi-2026/idea-scams-himadri-sarkar.webp',
    imageAlt: 'Himadri Sarkar speaking on stage in the Main Hall',
    sessions: ['tasi26-51', 'tasi26-46', 'tasi26-61'],
  },
  {
    number: '04',
    title: 'For Women, the Gap Is Justice',
    body: 'Tools like StopNCII exist, but justice lags: filing an FIR in Mumbai can take 8–12 hours. StopNCII, UN Women and UNODC are now consulting on a draft model framework on intimate image abuse.',
    stat: {
      value: '3,288',
      label:
        "cybercrime cases against women in India's 2024 NCRB data, just 3.2% of the total",
      source: 'Uma Subramanian, RATI Foundation',
    },
    quote: {
      text: 'If we can go easy on individual users and really demand accountability from systems.',
      author: 'Uma Subramanian',
      role: 'Co-Founder & Co-Director, RATI Foundation',
    },
    image: '/img/tasi-2026/idea-women-safety-panel.webp',
    imageAlt:
      "The panel on rethinking women's safety in a changing digital world",
    sessions: ['tasi26-40', 'tasi26-70', 'tasi26-76'],
  },
  {
    number: '05',
    title: 'Regulate Design, Not Just Content',
    body: "From The Quantum Hub's report to Lantern's shared signals, speakers backed a duty of care, intent detection and cross-platform cooperation over takedowns made one post at a time.",
    stat: {
      value: '2M+',
      label:
        'signals shared across platforms through Lantern, leading to 350,000+ enforcement actions',
      source: 'Lisa Morrison, Tech Coalition',
    },
    quote: {
      text: 'The question is not whether we can work together. The question is whether we can afford not to.',
      author: 'Anil Raghuvanshi',
      role: 'Founder, ChildSafeNet',
      photo: '/img/speakers/2026/anil-raghuvanshi.webp',
    },
    image: '/img/tasi-2026/idea-design-report-launch.webp',
    imageAlt:
      'Rohit Kumar presenting The Quantum Hub report, Designing for Online Safety',
    sessions: ['tasi26-66', 'tasi26-16', 'tasi26-73'],
  },
];

export const tasi2026Launches = [
  {
    title: 'Designing for Online Safety',
    by: 'The Quantum Hub',
    description:
      "A report on reimagining India's digital service regulation. It proposes classifying services by function and adding a duty of care, while keeping safe harbour.",
    illustration: 'foundation',
  },
  {
    title: 'AI Tool to Detect CSAM',
    by: 'NCPCR',
    description:
      'An AI tool to proactively detect child sexual abuse material, for all state police, alongside forthcoming child-safety guidelines for platforms.',
    illustration: 'shield',
  },
  {
    title: 'Newslink',
    by: 'Rahul Fernandes',
    description:
      'A 20-minute daily, screen-free classroom news practice that builds critical thinking and kindness. 94% of pilot students would recommend it.',
    illustration: 'orbit',
  },
  {
    title: 'Behind the Chat',
    by: 'Microsoft and Cyberlite',
    description:
      'Free resources on AI companions, co-designed with 131 students in India and Singapore and available in eight languages.',
    illustration: 'network',
  },
  {
    title: 'My Digital Wellbeing Journal',
    by: 'Snap Inc.',
    description:
      "A reflection journal for 13–18 year olds in five steps (Notice, Feel, Pause, Connect, Choose), distributed with the IT Ministry's cyber-security arm.",
    illustration: 'support',
  },
  {
    title: 'Main Scam Mein Nahi Aaungi',
    by: 'Saksham Senior with I4C, supported by Meta',
    description:
      'A Cyber Awareness Month campaign for older Indians, with a sitcom-style series in which the senior catches the scam.',
    illustration: 'signal',
  },
];

export const tasi2026Recommendations = [
  'Regulate services by function and systemic risk, with a duty of care.',
  'Move from taking down posts to detecting intent, and share signals across platforms.',
  'Retire self-declared age; adopt checks that never become identity checks.',
  'Shift the burden of safety from users, women and parents to systems.',
  'Close the justice gap: faster FIRs, sensitised local police, a real response behind every helpline.',
  'Build safety with young people, and pay them for their expertise.',
  "Design for India's shared phones, many languages and uneven digital literacy.",
  'Align South Asian principles so small markets are not left behind.',
];

export const tasi2026Quotes = [
  {
    text: "All these cyber securities, laws, regulations mean nothing. They'll be all on paper if the industry doesn't step forward and if you don't take responsibility, it means nothing.",
    author:
      'Jitin Prasada, Minister of State for Commerce & Industry and Electronics & IT, Government of India',
    // From the inaugural address at TASI 2026, 14 October (2E1A2671).
    photo: '/img/speakers/2026/jitin-prasada-tasi-2026.webp',
  },
  {
    text: "The future of online safety shouldn't be something we build for young people. It has to be something we build with them.",
    author: 'Lucy Thomas, CEO, PROJECT ROCKIT',
    photo: '/img/speakers/2026/lucy-thomas.webp',
  },
  {
    text: 'Getting platforms to face more litigation, which is content by content, is not going to force them to redesign. What you need instead is penalties for lack of redesign, which is called a duty of care approach.',
    author: 'Rohit Kumar, Founding Partner, The Quantum Hub',
    photo: '/img/speakers/2026/rohit-kumar.webp',
  },
];

export const tasi2026FuturePriorities = [
  'Platform child safety reports, called for before the next TASI',
  'An on-site child safety hackathon, proposed for TASI 2027',
  'A draft South Asian framework for child online safety',
  'NCPCR child-safety guidelines, open for public comment',
];

export const tasi2026MoreQuotes = [
  {
    text: 'Nothing about the image itself has changed, but the context, the audience, the intent of sharing, the consent to share, and the potential harm are all completely different.',
    author: 'Dr Abigail Bentley',
    role: 'AB Research Consulting',
    photo: '/img/speakers/2026/dr-abigail-bentley.webp',
  },
  {
    text: "It's not enough for safety mechanisms to exist. It's equally and more important for young people to be empowered and to feel safe enough to use it.",
    author: 'Satviki Varma',
    role: 'Program Lead, Girl Effect',
    photo: '/img/speakers/2026/satviki-varma.webp',
  },
];

// Short recaps for flagship sessions, keyed by programme session id.
export const tasi2026SessionRecaps = [
  {
    id: 'tasi26-13',
    summary:
      "Minister of State Jitin Prasada said India's AI Mission targets for 2026 were met but are already obsolete, and that India is now exploring regulation that protects women and children. He asked for the festival's ideas to reach government.",
  },
  {
    id: 'tasi26-11',
    summary:
      'Roblox, OpenAI, Google, TP and The Quantum Hub debated incentives against regulation. Nicky Jackson Colaco called for moving from takedowns to detecting intent, and Rohit Kumar argued that safe-harbour law needs outcome-based rules.',
  },
  {
    id: 'tasi26-16',
    summary:
      "Tech Coalition and Microsoft argued that no single company sees the whole chain of exploitation. Lantern's signal-sharing has produced more than 350,000 enforcement actions. Karuna Nain proposed an on-site child safety hackathon at the next TASI.",
  },
  {
    id: 'tasi26-18',
    summary:
      'Barkha Dutt pressed Snap, Roblox, Netflix, PROJECT ROCKIT and the NCPCR on attention and algorithms. The NCPCR announced an AI tool to detect CSAM proactively, for all state police, and child-safety guidelines expected soon.',
  },
  {
    id: 'tasi26-23',
    summary:
      'RATI Foundation, Yoti, k-ID, Roblox and an OECD expert set protection against access. Panellists agreed checks should sit where risk begins, offer choice and never become identity checks. k-ID opened its regulatory database, Nemo, to the public.',
  },
  {
    id: 'tasi26-24',
    summary:
      'CSR and Roblox let around 120 students in Bengaluru and Goa design safer gaming. Over 80% feel safe online, but only about 8% go to a trusted adult. Their ideas included trusted-contact lists and Are You Sure? prompts before scam links.',
  },
  {
    id: 'tasi26-40',
    summary:
      'RATI Foundation, StopNCII and Prof. Ji-yeon Lee argued the burden must move from women to systems. An FIR in Mumbai can take 8–12 hours. StopNCII, UN Women and UNODC are consulting on a draft model framework.',
  },
  {
    id: 'tasi26-54',
    summary:
      "The NCPCR outlined a final consultation with companies and an AI tool to detect abuse material. Space to Grow's research with about 700 children found 55% of teens who spoke to a stranger met them offline. Participants called for platform child safety reports by the next TASI.",
  },
  {
    id: 'tasi26-46',
    summary:
      'Impulse, Rescue Foundation, Just Rights for Children and the Ministry of Home Affairs described trafficking moving online, from escort ads to scam compounds. Manoj Kumar Meena urged platforms to stop earning from recruitment ads.',
  },
  {
    id: 'tasi26-66',
    summary:
      'The Quantum Hub unveiled two years of work with nearly 50 stakeholders: classifying services by function, a three-part test for systemic risk, and a duty of care with penalties for failing to redesign, while keeping safe harbour.',
  },
  {
    id: 'tasi26-67',
    summary:
      "Anthropic, Google and TP weighed whether autonomous AI will benefit the majority world. Rob Lewington said TP's moderators make roughly one in five of the world's content-moderation decisions. Amlan Mohanty called, on the record, for binding transparency rules.",
  },
  {
    id: 'tasi26-73',
    summary:
      'Ashwini Natesan argued that whether platforms comply is an economics question, so small markets wait more than three weeks for takedowns. She proposed narrowly drafted laws and shared South Asia principles.',
  },
];

export const tasi2026Gallery = [
  {
    src: '/img/tasi-2026/gallery-main-hall.webp',
    alt: 'A full Main Hall during a panel at TASI 2026',
  },
  {
    src: '/img/tasi-2026/gallery-opening-panel.webp',
    alt: 'The opening panel, Forces Reshaping Trust and Safety in 2026',
  },
  {
    src: '/img/tasi-2026/gallery-audience.webp',
    alt: 'The audience at the TASI 2026 opening reception',
  },
  {
    src: '/img/tasi-2026/gallery-networking.webp',
    alt: 'Delegates talking between sessions',
  },
  {
    src: '/img/tasi-2026/gallery-women-panel-group.webp',
    alt: "Speakers from the women's safety panel on stage",
  },
  {
    src: '/img/tasi-2026/gallery-workshop.webp',
    alt: 'A session in the Workshop Room',
  },
  {
    src: '/img/tasi-2026/gallery-age-panel-group.webp',
    alt: 'Speakers from the age assurance panel on stage',
  },
  {
    src: '/img/tasi-2026/gallery-spotlight.webp',
    alt: 'Speakers after a spotlight session in the Main Hall',
  },
  {
    src: '/img/tasi-2026/gallery-closing-panel.webp',
    alt: 'The closing panel at the Netherlands Residence',
  },
  {
    src: '/img/tasi-2026/gallery-closing-residence.webp',
    alt: 'The Netherlands Residence at dusk before the closing reception',
  },
];
