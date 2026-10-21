// Post-event recap content for the TASI 2026 edition page. Copy comes from
// the session transcripts (D:\TASI 2026\_transcripts\WEBSITE_CONTENT.md);
// every quote is word for word. Sessions held under the Chatham House Rule
// (tasi26-60, tasi26-74, tasi26-83) are deliberately left out.

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

export const tasi2026HighlightsVideoSrc = '/video/tasi-2026-highlights-v3.mp4';

export const tasi2026PerspectiveQuote = {
  text: 'We created those technologies, we retain the responsibility to shape their purpose.',
  author: 'Dr. Ranjana Kumari, Director, Centre for Social Research',
};

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
    image: '/img/tasi-2026/idea-youth-behind-the-chat-speakers.webp',
    imageAlt:
      'Speakers from the Behind the Chat spotlight on AI companions, on stage at TASI 2026',
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
    image: '/img/tasi-2026/idea-design-report-launch-group.webp',
    imageAlt:
      'Speakers on stage holding The Quantum Hub report at its launch on 15 October',
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
      'The NCPCR announced plans for an AI tool to proactively detect child sexual abuse material for state police, alongside forthcoming child-safety guidelines for platforms.',
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

// Messages from the diplomatic partners. Quotes are as supplied by each
// embassy. Georg Enzweiler has no photo yet, so the card shows initials.
export const tasi2026Quotes = [
  {
    text: 'Sweden welcomes the opportunity to partner with India through the Trust & Safety Festival. Using our mutual strengths, we can shape the future of digitalization and AI through innovation, building trust, and applying good ethics and human-centric design. We look forward to working together for an open, safe, secure and sustainable digital future for all.',
    author: 'H.E. Petra Menander',
    role: 'Ambassador of Sweden to India',
    photo: '/img/tasi-2026/voice-petra-menander.webp',
  },
  {
    text: 'Building safer and more trusted digital spaces requires technology to be developed with security, resilience and inclusion at its core. Lithuania’s experience as a digitally advanced and innovation-driven country demonstrates the importance of empowering women to participate fully in the digital economy and of strengthening international cooperation to ensure that digital transformation creates opportunities and trust for all.',
    author: 'H.E. Diana Mickevičienė',
    role: 'Ambassador of Lithuania to India',
    photo: '/img/tasi-2026/voice-diana-mickeviciene.webp',
  },
  {
    text: 'Technology knows no borders, and neither should our responsibility to make it safe. It takes international cooperation and a shared commitment from governments, industry and civil society to ensure that technological progress goes hand in hand with human rights, trust and responsibility.',
    author: 'Georg Enzweiler',
    role: 'Deputy Chief of Mission, Embassy of Germany to India',
    photo: '/img/tasi-2026/voice-georg-enzweiler.webp',
  },
];

// Four recap posts for the opening reception, each day and the closing
// ceremony. Facts follow the programme and the session recaps in this file.
export const tasi2026DayStories = [
  {
    id: 'opening-reception',
    eyebrow: 'Opening Reception · 13 October',
    title: 'An Evening at the Goethe‑Institut',
    paragraphs: [
      'TASI 2026 began on the evening of 13 October at the Goethe-Institut in New Delhi, hosted with the embassies of Germany and France. Dr. Ranjana Kumari welcomed guests, and the hosting embassies opened the evening with remarks.',
      'Jyoti Vadehra then introduced the Safety Spotlight, a run of short talks that set out the festival’s themes before guests moved on to an informal reception.',
    ],
    cardTitle: 'The Safety Spotlight',
    items: [
      'Children’s capacity to navigate information, with Rahul Fernandes and Prof. Nandini Chatterjee Singh',
      'Journalist safety, with Kunal Majumder of the Committee to Protect Journalists',
      'Youth participation in online safety, with Lucy Thomas of PROJECT ROCKIT',
      'Rescue, rehabilitation and repatriation, with Triveni Acharya of Rescue Foundation',
      'Lantern and shared signals, with Lisa Morrison of the Tech Coalition',
    ],
    image: '/img/tasi-2026/day-opening-reception.webp',
    imageAlt:
      'A speaker addressing guests at the TASI 2026 opening reception at the Goethe-Institut',
  },
  {
    id: 'day-one',
    eyebrow: 'Day One · 14 October',
    title: 'The Festival Opens in the Main Hall',
    paragraphs: [
      'Day one opened at the India International Centre with a welcome from Jyoti Vadehra and Caroline Humer, a keynote from Snigdha Bhardwaj of Google on what safety means for children growing up with AI, and the inaugural address from Chief Guest Jitin Prasada.',
      'The opening panel, moderated by Faye D’Souza, asked what is reshaping trust and safety in 2026. Panels on young people, age assurance and women’s safety followed in the Main Hall, while workshops and roundtables ran in the smaller rooms.',
    ],
    cardTitle: 'Highlights',
    items: [
      'Inaugural address by Jitin Prasada, Minister of State for Commerce & Industry and Electronics & IT',
      'Opening panel: Forces Reshaping Trust & Safety in 2026',
      'Growing Up Digital, moderated by Barkha Dutt',
      'Age assurance and age-appropriate design',
      'A fireside chat with Yoel Roth of Match Group',
    ],
    image: '/img/tasi-2026/gallery-age-panel-group.webp',
    imageAlt:
      'Speakers from the age assurance panel on stage in the Main Hall on day one',
  },
  {
    id: 'day-two',
    eyebrow: 'Day Two · 15 October',
    title: 'From Journalism to Regulation',
    paragraphs: [
      'Day two began with a keynote from Marisa Gerards, Ambassador of the Netherlands, on journalism, democracy and trust in the age of AI, followed by a panel on trust, safety and equity in a changing information ecosystem.',
      'The day moved through creators and AI, trafficking and exploitation, and open-source AI. It closed in on regulation with the launch of The Quantum Hub’s report, Designing for Online Safety.',
    ],
    cardTitle: 'Highlights',
    items: [
      'Keynote on journalism, democracy and trust in the age of AI',
      'Reach, Revenue & Responsibility: what AI changes for India’s creators',
      'Combatting trafficking: building stronger partnerships',
      'Report launch: Designing for Online Safety, by The Quantum Hub',
      'Workshops and roundtables in the Workshop and Roundtable Rooms',
    ],
    image: '/img/tasi-2026/idea-design-report-launch-group.webp',
    imageAlt:
      'Speakers on stage holding The Quantum Hub report at its launch on day two',
  },
  {
    id: 'closing-ceremony',
    eyebrow: 'Closing Ceremony · 15 October',
    title: 'Safety at a Crossroads',
    paragraphs: [
      'The festival closed in the Main Hall with a plenary on how to rethink safety, responsibility and human wellbeing, with Rob Lewington of TP, Amlan Mohanty of Anthropic and Rajesh Ranjan of Google, moderated by Sayoni Aiyar.',
      'Guests then gathered at the Residence of the Ambassador of the Netherlands for the closing reception, welcomed by Ambassador Marisa Gerards, with calls to carry the festival’s recommendations to policymakers.',
    ],
    cardTitle: 'Carried forward',
    items: [
      'Platform child safety reports, called for before the next TASI',
      'An on-site child safety hackathon, proposed for TASI 2027',
      'A draft South Asian framework for child online safety',
      'NCPCR child-safety guidelines, open for public comment',
    ],
    image: '/img/tasi-2026/day-closing.webp',
    imageAlt:
      'Guests listening at the closing reception at the Netherlands Residence',
  },
];

// The inaugural address on 14 October. The quote is word for word from the
// recording (2E1A2671); the summary follows the session recap for tasi26-13.
export const tasi2026ChiefGuest = {
  name: 'Jitin Prasada',
  role: 'Minister of State for Commerce & Industry and Electronics & IT, Government of India',
  photo: '/img/speakers/2026/jitin-prasada-tasi-2026.webp',
  photoAlt: 'Jitin Prasada addressing the TASI 2026 inaugural session',
  summary:
    "Jitin Prasada said India's AI Mission targets for 2026 were met but are already obsolete, and that India is now exploring regulation that protects women and children. He asked for the festival's ideas to reach government.",
  quote:
    "All these cyber securities, laws, regulations mean nothing. They'll be all on paper if the industry doesn't step forward and if you don't take responsibility, it means nothing.",
  profileHref: '/speakers/2026/jitin-prasada',
  sessionId: 'tasi26-13',
};

// Speakers shown on the "Voices in the Room" cards. Chosen from Jev ratings of
// the speaker headshots (formal dress, camera quality, clean framing and a
// pleasant expression), weighted by how prominent each speaker was. Only
// people who spoke in a programme session are eligible. Names must match
// speakers-2026.json (a test checks each has a profile and a photo).
export const tasi2026FeaturedSpeakers = [
  'Jitin Prasada',
  'Yoel Roth',
  'Akash Pugalia',
  'Faye D’Souza',
  'Karuna Nain',
  'Ji-yeon Lee',
  'Kunal Majumder',
  'Adam Seldow',
  'Urvashi Kapoor',
  'Nina Bual',
  'Keemin Ngiam',
  'Barkha Dutt',
  'Maroof Culmen',
  'Caroline Simangaliso Makumbe',
  'Rob Lewington',
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
    caption: 'Main Hall',
  },
  {
    src: '/img/tasi-2026/gallery-opening-panel.webp',
    alt: 'The opening panel, Forces Reshaping Trust and Safety in 2026',
    caption: 'Opening Panel',
  },
  {
    src: '/img/tasi-2026/gallery-opening-reception.webp',
    alt: 'The audience at the TASI 2026 opening reception',
    caption: 'Opening Reception',
  },
  {
    src: '/img/tasi-2026/gallery-networking.webp',
    alt: 'Delegates talking between sessions',
    caption: 'Between Sessions',
  },
  {
    src: '/img/tasi-2026/gallery-women-panel-group.webp',
    alt: "Speakers from the women's safety panel on stage",
    caption: 'Panel Group',
  },
  {
    src: '/img/tasi-2026/gallery-workshop.webp',
    alt: 'A session in the Workshop Room',
    caption: 'Workshop Room',
  },
  {
    src: '/img/tasi-2026/gallery-age-panel-group.webp',
    alt: 'Speakers from the age assurance panel on stage',
    caption: 'Panel Group',
  },
  {
    src: '/img/tasi-2026/gallery-reception-connections.webp',
    alt: 'Guests in conversation at the Goethe-Institut opening reception',
    caption: 'Reception Connections',
  },
  {
    src: '/img/tasi-2026/gallery-closing-panel.webp',
    alt: 'The closing panel at the Netherlands Residence',
    caption: 'Closing Panel',
  },
  {
    src: '/img/tasi-2026/gallery-closing-residence.webp',
    alt: 'The Netherlands Residence at dusk before the closing reception',
    caption: 'Netherlands Residence',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-13oct-reception-01.webp',
    alt: 'Delegates in conversation at the opening reception at the Goethe-Institut',
    caption: 'In Conversation',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-13oct-reception-02.webp',
    alt: 'Delegates in conversation at the opening reception at the Goethe-Institut',
    caption: 'In Conversation',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-13oct-reception-03.webp',
    alt: 'Speakers and delegates posing together at the opening reception at the Goethe-Institut',
    caption: 'Group Portrait',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-13oct-reception-04.webp',
    alt: 'Delegates in conversation at the opening reception at the Goethe-Institut',
    caption: 'In Conversation',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-13oct-reception-05.webp',
    alt: 'Delegates in conversation at the opening reception at the Goethe-Institut',
    caption: 'In Conversation',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-13oct-reception-06.webp',
    alt: 'Speakers and delegates posing together at the opening reception at the Goethe-Institut',
    caption: 'Group Portrait',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-13oct-reception-07.webp',
    alt: 'Speakers on stage at the opening reception at the Goethe-Institut',
    caption: 'On Stage',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-13oct-reception-08.webp',
    alt: 'The audience listening at the opening reception at the Goethe-Institut',
    caption: 'Listening In',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-13oct-reception-11.webp',
    alt: 'The audience listening at the opening reception at the Goethe-Institut',
    caption: 'Listening In',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-13oct-reception-12.webp',
    alt: 'Speakers on stage at the opening reception at the Goethe-Institut',
    caption: 'On Stage',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-14oct-01.webp',
    alt: 'Delegates in conversation on day one',
    caption: 'In Conversation',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-14oct-02.webp',
    alt: 'Delegates in conversation on day one',
    caption: 'In Conversation',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-14oct-03.webp',
    alt: 'Delegates in conversation on day one',
    caption: 'In Conversation',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-14oct-04.webp',
    alt: 'Delegates in conversation on day one',
    caption: 'In Conversation',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-14oct-06.webp',
    alt: 'Speakers and delegates posing together on day one',
    caption: 'Group Portrait',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-14oct-07.webp',
    alt: 'Speakers and delegates posing together on day one',
    caption: 'Group Portrait',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-14oct-08.webp',
    alt: 'Speakers and delegates posing together on day one',
    caption: 'Group Portrait',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-01.webp',
    alt: 'Delegates in conversation on day two',
    caption: 'In Conversation',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-02.webp',
    alt: 'Delegates in conversation on day two',
    caption: 'In Conversation',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-03.webp',
    alt: 'Speakers on stage on day two',
    caption: 'On Stage',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-04.webp',
    alt: 'Delegates in conversation on day two',
    caption: 'In Conversation',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-05.webp',
    alt: 'Speakers and delegates posing together on day two',
    caption: 'Group Portrait',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-06.webp',
    alt: 'Speakers on stage on day two',
    caption: 'On Stage',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-07.webp',
    alt: 'Speakers and delegates posing together on day two',
    caption: 'Group Portrait',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-08.webp',
    alt: 'Speakers and delegates posing together on day two',
    caption: 'Group Portrait',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-09.webp',
    alt: 'Speakers and delegates posing together on day two',
    caption: 'Group Portrait',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-10.webp',
    alt: 'Delegates in conversation on day two',
    caption: 'In Conversation',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-closing-01.webp',
    alt: 'Guests at the reception at the closing reception at the Netherlands Residence',
    caption: 'Reception Moments',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-closing-02.webp',
    alt: 'Delegates in conversation at the closing reception at the Netherlands Residence',
    caption: 'In Conversation',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-closing-03.webp',
    alt: 'Speakers and delegates posing together at the closing reception at the Netherlands Residence',
    caption: 'Group Portrait',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-closing-04.webp',
    alt: 'Delegates in conversation at the closing reception at the Netherlands Residence',
    caption: 'In Conversation',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-closing-05.webp',
    alt: 'Delegates in conversation at the closing reception at the Netherlands Residence',
    caption: 'In Conversation',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-closing-06.webp',
    alt: 'Speakers on stage at the closing reception at the Netherlands Residence',
    caption: 'On Stage',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-closing-07.webp',
    alt: 'Speakers on stage at the closing reception at the Netherlands Residence',
    caption: 'On Stage',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-closing-08.webp',
    alt: 'Guests at the reception at the closing reception at the Netherlands Residence',
    caption: 'Reception Moments',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-closing-09.webp',
    alt: 'Delegates in conversation at the closing reception at the Netherlands Residence',
    caption: 'In Conversation',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-closing-10.webp',
    alt: 'Speakers and delegates posing together at the closing reception at the Netherlands Residence',
    caption: 'Group Portrait',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-closing-11.webp',
    alt: 'Speakers and delegates posing together at the closing reception at the Netherlands Residence',
    caption: 'Group Portrait',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-15oct-closing-12.webp',
    alt: 'Speakers and delegates posing together at the closing reception at the Netherlands Residence',
    caption: 'Group Portrait',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-food-01.webp',
    alt: 'Guests with drinks at the closing reception at the Netherlands Residence',
    caption: 'Over Drinks',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-food-02.webp',
    alt: 'Delegates with drinks at the closing reception at the Netherlands Residence',
    caption: 'Over Drinks',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-food-03.webp',
    alt: 'Guests chatting over drinks at the closing reception at the Netherlands Residence',
    caption: 'Over Drinks',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-food-04.webp',
    alt: 'Two delegates talking over a drink at the closing reception at the Netherlands Residence',
    caption: 'Over Drinks',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-food-05.webp',
    alt: 'Delegates at the lunch buffet on day one',
    caption: 'Lunch Break',
  },
  {
    src: '/img/tasi-2026/gallery/gallery-food-06.webp',
    alt: 'Delegates talking over coffee on day two',
    caption: 'Coffee Break',
  },
];
