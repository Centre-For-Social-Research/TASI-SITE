// Public TASI 2026 programme. The latest draft takes precedence over the
// earlier CSV where their schedules differ. Internal planning notes must not
// be published here. Confirmed speakers live in programme-2026-speakers.js.
//
// Keep session ids stable when editing: saved agendas and session links are
// keyed on them. Titles and descriptions can change freely; old session URLs
// redirect to the new title.

import { sessionSpeakers2026 } from './programme-2026-speakers.js';

// `speakers` is always a list of names. Speakers without a 2026 profile
// carry their details in `guestSpeakers`, keyed by name: a title, plus a
// photo and `profile: '2025'` when they have a TASI 2025 profile to link to.
const makeSession = (id, day, time, venue, format, title, description) => {
  const entries = sessionSpeakers2026[`tasi26-${id}`] || [];
  const guests = entries.filter((entry) => typeof entry !== 'string');
  return {
    id: `tasi26-${id}`,
    day,
    time,
    track: venue,
    venue,
    format,
    title,
    description:
      description || 'Further details about this session will be shared soon.',
    speakers: entries.map((entry) =>
      typeof entry === 'string' ? entry : entry.name
    ),
    ...(guests.length
      ? {
          guestSpeakers: Object.fromEntries(
            guests.map(({ name, ...details }) => [name, details])
          ),
        }
      : {}),
  };
};

export const programmeSessions2026 = [
  // Tuesday, 13 October: opening reception and public safety spotlights.
  makeSession(
    1,
    'oct13',
    '18:30–20:30',
    'Goethe-Institut',
    'opening',
    'Opening Reception',
    'An evening reception at the Goethe-Institut, jointly hosted by the Embassy of France and the German Embassy, with welcome remarks from CSR and the deputy ambassadors, followed by the Safety Spotlights.'
  ),
  makeSession(
    49,
    'oct13',
    '19:15–20:05',
    'Goethe-Institut',
    'opening',
    'Safety Spotlights',
    'Five short, solution-focused talks from people working on online safety around the world, followed by the festival co-founders opening the reception.'
  ),
  makeSession(
    2,
    'oct13',
    '19:15–19:25',
    'Goethe-Institut',
    'spotlight',
    'Safety Spotlight: From Protection to Agency: Building Children’s Capacity to Navigate Information With Humans in the Lead',
    'Why protecting children online is not enough on its own, and how to build their capacity to navigate information, with people, not technology, in the lead.'
  ),
  makeSession(
    3,
    'oct13',
    '19:25–19:35',
    'Goethe-Institut',
    'spotlight',
    'Spotlight: Making Safety Part of the Assignment',
    'How newsrooms can treat the safety of journalists, online and on the ground, as a core part of every assignment rather than an afterthought.'
  ),
  makeSession(
    4,
    'oct13',
    '19:35–19:45',
    'Goethe-Institut',
    'spotlight',
    'Spotlight: Less Advising, More Doing: Rethinking Youth Participation in Online Safety',
    'Lessons from youth-led work in Australia on moving from advising young people to working alongside them on online safety.'
  ),
  makeSession(
    5,
    'oct13',
    '19:45–19:55',
    'Goethe-Institut',
    'spotlight',
    'Spotlight: Rescue. Rehabilitation. Repatriation.',
    'How rescue, rehabilitation and repatriation work together to support survivors of trafficking, and where technology can help.'
  ),
  makeSession(
    81,
    'oct13',
    '19:55–20:05',
    'Goethe-Institut',
    'spotlight',
    'Spotlight: Lantern: Shared Signals, Safer Platforms',
    'How Lantern, the Tech Coalition’s cross-platform signal-sharing programme, helps companies work together to detect and act on child sexual exploitation and abuse.'
  ),

  // Wednesday, 14 October: Main Hall.
  makeSession(
    8,
    'oct14',
    '09:00–10:00',
    'Lobby',
    'special',
    'Registration and Tea/Coffee'
  ),
  makeSession(
    9,
    'oct14',
    '10:00–10:15',
    'Main Hall',
    'opening',
    'Welcome and Opening Remarks',
    'The festival opens with a welcome from CSR and the Trust & Safety Festival, setting out the themes and goals for the two days.'
  ),
  makeSession(
    10,
    'oct14',
    '10:15–10:30',
    'Main Hall',
    'keynote',
    'Opening Keynote: Growing Up With AI: What Safety Means Now',
    'What safety means for children and young people growing up with AI, and how platforms are rethinking protections for generative AI products.'
  ),
  makeSession(
    11,
    'oct14',
    '10:30–11:15',
    'Main Hall',
    'panel',
    'Opening Panel: Forces Reshaping Trust & Safety in 2026',
    'Leaders from AI, platforms, trust and safety services, policy research and media discuss the forces likely to shape trust and safety in India and globally in 2026.'
  ),
  makeSession(
    12,
    'oct14',
    '11:15–11:30',
    'Main Hall',
    'spotlight',
    'Spotlight: What Happens When Critical Thinking Becomes a Daily Practice? How Can AI Play a Role With Humans in the Lead?',
    'How AI can help make critical thinking a daily habit for children, with educators and parents, not machines, in the lead.'
  ),
  makeSession(
    13,
    'oct14',
    '11:30–11:45',
    'Main Hall',
    'keynote',
    'Opening Remarks and Inaugural Address',
    'Opening remarks from CSR, followed by the inaugural address of TASI 2026.'
  ),
  makeSession(
    16,
    'oct14',
    '11:45–12:15',
    'Main Hall',
    'fireside',
    'Fireside Chat: The Fight Against CSAM: From Detection to Prevention Through Industry Collaboration',
    'How industry collaboration is helping fight child sexual abuse material online, from detection and reporting to prevention.'
  ),
  makeSession(
    18,
    'oct14',
    '12:30–13:15',
    'Main Hall',
    'panel',
    'Panel: Growing Up Digital: Designing for Youth Wellbeing in the Age of AI',
    'How platforms, regulators and civil society can design digital experiences that support young people’s wellbeing as AI becomes part of how they learn, play and connect.'
  ),
  makeSession(
    19,
    'oct14',
    '13:15–13:30',
    'Main Hall',
    'spotlight',
    'Spotlight: My Digital Wellbeing Journal Launch',
    'The launch of My Digital Wellbeing Journal, a resource to help young people reflect on their online lives and build healthier digital habits.'
  ),
  makeSession(20, 'oct14', '13:30–14:15', 'Lobby', 'special', 'Lunch Break'),
  makeSession(
    23,
    'oct14',
    '14:15–15:00',
    'Main Hall',
    'panel',
    'Panel: Age Assurance and Age-Appropriate Design: Building Better Experiences for Children',
    'How age assurance and age-appropriate design can give children better online experiences while balancing safety, privacy and participation.'
  ),
  makeSession(
    24,
    'oct14',
    '15:00–15:15',
    'Main Hall',
    'spotlight',
    'Spotlight: Youth in Play',
    'A spotlight on Youth in Play, on how young people experience play online and how safety and civility can be built into it.'
  ),
  makeSession(
    26,
    'oct14',
    '15:15–15:30',
    'Main Hall',
    'keynote',
    'Special Address: Women, Power and Participation in the Digital Age',
    'A special address on women’s power and participation in public and digital life, and what it takes to make online spaces safe for women to lead.'
  ),
  makeSession(
    27,
    'oct14',
    '15:30–16:00',
    'Main Hall',
    'fireside',
    'Leadership Dialogue: Women in Public Life: Building Safer Spaces for Stronger Democracy',
    'A conversation on the abuse women in public life face online, and how parliament, platforms and civil society can build safer spaces for a stronger democracy.'
  ),
  makeSession(
    82,
    'oct14',
    '16:00–16:30',
    'Main Hall',
    'fireside',
    'Fireside Chat: The Future of Connection: Culture, Community and Trust Online',
    'A conversation on how culture and community shape the way people connect online, and what it takes to build trust in online social discovery.'
  ),
  makeSession(
    29,
    'oct14',
    '16:30–17:00',
    'Main Hall',
    'keynote',
    'Closing Keynote',
    'The closing keynote of the first festival day, on India’s approach to a safe, trusted and accountable internet.'
  ),
  makeSession(
    51,
    'oct14',
    '17:00–17:15',
    'Main Hall',
    'spotlight',
    'Sponsor Spotlight: Driving Human Safety in the Digital World Through AI',
    'How human expertise and AI can work together to keep people safe in the digital world.'
  ),
  // Wednesday, 14 October: parallel rooms.
  makeSession(
    84,
    'oct14',
    '10:00–10:30',
    'Workshop Room',
    'workshop',
    'Not Another Chatbot: Public Interest AI and Community Knowledge as Trust and Safety Infrastructure',
    'A session on public-interest AI and community knowledge, and how they can serve as trust and safety infrastructure beyond another chatbot.'
  ),
  makeSession(
    80,
    'oct14',
    '10:00–11:00',
    'Roundtable Room',
    'panel',
    'Panel: Gender, Governance and India’s AI Future',
    'A panel on gender, governance and India’s AI future, and how women’s health, rights and participation can shape AI policy.'
  ),
  makeSession(
    52,
    'oct14',
    '10:30–11:30',
    'Workshop Room',
    'workshop',
    'From Teenagers to “Seenagers”: Navigating Digital Wellbeing Across Generations and Mitigating Digital Risks',
    'An intergenerational session on digital wellbeing for teenagers and seniors alike, and practical ways to reduce digital risks across age groups.'
  ),
  makeSession(
    53,
    'oct14',
    '11:45–13:00',
    'Workshop Room',
    'workshop',
    'Workshop: A Systems Approach to AI Risks in Global Majority Contexts',
    'A hands-on workshop on a systems approach to identifying and responding to AI risks in Global Majority contexts.'
  ),
  makeSession(
    54,
    'oct14',
    '11:30–13:00',
    'Roundtable Room',
    'roundtable',
    'Roundtable: Advancing Child Safety in Online Social Gaming',
    'A closed-door roundtable on advancing child safety in online social gaming, bringing together platforms, policymakers and child safety experts.'
  ),
  makeSession(
    55,
    'oct14',
    '14:00–14:45',
    'Workshop Room',
    'workshop',
    'Interactive Masterclass: A Fact-Checker’s Guide to AI and Deepfakes',
    'A hands-on masterclass by BOOM on verifying synthetic media, using open-source tools and real case studies across deepfake harassment, child safety and financial scams.'
  ),
  makeSession(
    56,
    'oct14',
    '14:00–15:00',
    'Roundtable Room',
    'roundtable',
    'Raising Children in the AI Era: Balancing Privacy, Trust and Safety',
    'A roundtable on raising children in the AI era, and how families, law and platforms can balance privacy, trust and safety.'
  ),
  makeSession(
    69,
    'oct14',
    '14:45–15:30',
    'Workshop Room',
    'panel',
    'Panel: Growing Up and Parenting in the Digital Age',
    'A conversation with young people and parents on growing up and parenting in the digital age, and what families need to stay safe online.'
  ),
  makeSession(
    58,
    'oct14',
    '15:00–16:00',
    'Roundtable Room',
    'roundtable',
    'Behind the Curtain: Fraud, Scams and the Fight for Trust and Safety in the AI Era',
    'A look behind the curtain at fraud and scams in the AI era, and how industry, government and civil society can fight them together.'
  ),
  makeSession(
    59,
    'oct14',
    '15:30–17:00',
    'Workshop Room',
    'workshop',
    'Designing for Children: Critical Inquiry, Empathy and Safety in the Information Age',
    'A workshop on designing for children through critical inquiry and empathy, so that technology helps them navigate information safely.'
  ),
  makeSession(
    60,
    'oct14',
    '16:00–17:00',
    'Roundtable Room',
    'roundtable',
    'Regulating for Safety: Are We Over-Regulating and Under-Governing the Internet?',
    'A debate on whether the internet is over-regulated and under-governed, and what effective, rights-respecting safety regulation should look like.'
  ),
  makeSession(
    25,
    'oct14',
    '17:00–19:00',
    'Workshop Room',
    'workshop',
    'Policy Lab: Building Trusted Human Connections: Designing for Safety, Authenticity and Inclusion',
    'A private policy lab on building trusted human connections online, designing social discovery for safety, authenticity and inclusion.'
  ),

  // Thursday, 15 October: Main Hall.
  makeSession(
    31,
    'oct15',
    '09:00–10:00',
    'Lobby',
    'special',
    'Registration and Tea/Coffee'
  ),
  makeSession(
    32,
    'oct15',
    '10:00–10:05',
    'Main Hall',
    'opening',
    'Welcome Back',
    'A welcome to the second day of the festival.'
  ),
  makeSession(
    33,
    'oct15',
    '10:05–10:15',
    'Main Hall',
    'keynote',
    'Opening Keynote: Journalism, Democracy and Trust in the Age of AI',
    'A keynote on journalism, democracy and trust in the age of AI.'
  ),
  makeSession(
    34,
    'oct15',
    '10:15–11:00',
    'Main Hall',
    'panel',
    'Panel: Trust, Safety & Equity: Journalism in a Changing Information Ecosystem',
    'Journalists, digital rights advocates and media innovators discuss protecting journalists, strengthening information integrity and rebuilding public trust in the age of AI.'
  ),
  makeSession(
    61,
    'oct15',
    '11:00–11:15',
    'Main Hall',
    'spotlight',
    'Spotlight: I4C, Saksham Senior and Meta Collaboration for Cyber Awareness Month',
    'A spotlight on the collaboration between I4C, Saksham Senior and Meta for Cyber Awareness Month.'
  ),
  makeSession(
    44,
    'oct15',
    '11:15–12:00',
    'Main Hall',
    'panel',
    'Panel: Safety and Well-being of Content Creators',
    'A panel on what it takes to help content creators thrive safely, including the tools and platform investments that support their wellbeing.'
  ),
  makeSession(
    62,
    'oct15',
    '12:00–12:30',
    'Main Hall',
    'fireside',
    'Fireside Chat: Technology, Learning, and the Next Generation',
    'A conversation on how technology is changing learning, and how education and safety can go hand in hand for the next generation.'
  ),
  makeSession(
    63,
    'oct15',
    '12:30–12:45',
    'Main Hall',
    'spotlight',
    'Spotlight: From Tech Hinsa to Tech Respect: Putting Young People at the Heart of a Safer Digital Future',
    'How Girl Effect is putting young people at the heart of a safer digital future, moving from tech-facilitated harm to tech respect.'
  ),
  makeSession(
    40,
    'oct15',
    '12:45–13:30',
    'Main Hall',
    'panel',
    'Panel: Beyond Online Harm: Rethinking Women’s Safety in a Changing Digital World',
    'A panel on women’s safety beyond online harm, and how to design digital spaces where women can participate fully, confidently and on their own terms.'
  ),
  makeSession(41, 'oct15', '13:30–14:20', 'Lobby', 'special', 'Lunch Break'),
  makeSession(
    64,
    'oct15',
    '14:20–14:50',
    'Main Hall',
    'fireside',
    'Fireside Chat: Navigating Social Media Across a Generation Gap',
    'A fireside chat on how different generations use social media, and how families can bridge the gap to stay safe online together.'
  ),
  makeSession(
    46,
    'oct15',
    '14:50–15:35',
    'Main Hall',
    'panel',
    'Panel: Combatting Trafficking: Building Stronger Partnerships to Prevent and Respond to Exploitation',
    'How industry, civil society and law enforcement can strengthen partnerships to prevent trafficking and respond to exploitation, online and offline.'
  ),
  makeSession(
    65,
    'oct15',
    '15:35–15:50',
    'Main Hall',
    'spotlight',
    'Google Spotlight',
    'A spotlight from Google on its work in trust and safety.'
  ),
  makeSession(
    66,
    'oct15',
    '15:50–16:10',
    'Main Hall',
    'spotlight',
    'Spotlight: TQH Report Launch',
    'The launch of a new report by The Quantum Hub on trust and safety.'
  ),
  makeSession(
    67,
    'oct15',
    '16:10–16:50',
    'Main Hall',
    'panel',
    'Closing Plenary: Trust & Safety at a Crossroads',
    'How should we rethink safety, responsibility and human wellbeing for the next era of technology? Leaders reflect on two days of TASI and the road ahead.'
  ),
  makeSession(
    48,
    'oct15',
    '16:50–17:00',
    'Main Hall',
    'special',
    'Closing Remarks',
    'Closing remarks to end TASI 2026.'
  ),
  makeSession(
    68,
    'oct15',
    '18:00–20:00',
    'Embassy of the Netherlands',
    'special',
    'Closing Reception',
    'A closing reception hosted by the Embassy of the Kingdom of the Netherlands, with reflections on two days of TASI 2026.'
  ),

  // Thursday, 15 October: parallel rooms.
  makeSession(
    70,
    'oct15',
    '10:15–11:15',
    'Roundtable Room',
    'roundtable',
    'Roundtable: Continuum of Online and Offline Abuse',
    'A roundtable on how online and offline abuse are connected, and what a joined-up response could look like.'
  ),
  makeSession(
    71,
    'oct15',
    '11:00–11:45',
    'Workshop Room',
    'workshop',
    'Everest Group Session',
    'A session led by Everest Group.'
  ),
  makeSession(
    83,
    'oct15',
    '11:45–13:00',
    'Workshop Room',
    'workshop',
    'Kids Safety Masterclass',
    'An interactive session for parents on product safety features and safety mechanisms, and on how generative AI can support students’ learning.'
  ),
  makeSession(
    17,
    'oct15',
    '13:00–14:00',
    'Workshop Room',
    'workshop',
    'Designing With, Not For: Youth Co-Design as a Safeguarding Tool for AI Companionship',
    'A workshop on youth co-design as a safeguarding tool, and how designing AI companions with young people, not for them, makes them safer.'
  ),
  makeSession(
    72,
    'oct15',
    '11:45–12:45',
    'Roundtable Room',
    'roundtable',
    'Growing Up With AI: Lessons from Young People and Educators',
    'Lessons from young people and educators in Nepal on growing up with AI, and how schools and families can respond.'
  ),
  makeSession(
    73,
    'oct15',
    '12:45–13:00',
    'Roundtable Room',
    'spotlight',
    'The Small Fish in the Big Pond of Online Content Regulation: Splinternet of Censorship and the Online Safety Act in Sri Lanka',
    'A short talk on online content regulation, censorship and Sri Lanka’s Online Safety Act, and what smaller countries can learn.'
  ),
  makeSession(
    74,
    'oct15',
    '14:00–15:00',
    'Roundtable Room',
    'roundtable',
    'Age, Access and Safety: Building an Age-Appropriate Digital Ecosystem for Children in India',
    'A roundtable on age, access and safety, and how India can build an age-appropriate digital ecosystem for children.'
  ),
  makeSession(
    75,
    'oct15',
    '14:30–15:15',
    'Workshop Room',
    'workshop',
    'Building Better Technology for Children: A Global South Approach to Child-Centred Design',
    'A participatory workshop on child-centred design from the Global South, on building technology with children that reflects their realities, cultures and contexts.'
  ),
  makeSession(
    76,
    'oct15',
    '15:00–15:50',
    'Roundtable Room',
    'roundtable',
    'Rethinking Image-Based Abuse in South Asia',
    'A roundtable on image-based abuse in South Asia, drawing on research to rethink support for survivors and prevention.'
  ),
  makeSession(
    77,
    'oct15',
    '15:15–16:00',
    'Workshop Room',
    'workshop',
    'Open Source AI: Standards, Safeguards and Shared Responsibility',
    'A workshop on standards, safeguards and shared responsibility for safe and trustworthy open-source AI.'
  ),
  makeSession(
    78,
    'oct15',
    '16:00–16:45',
    'Roundtable Room',
    'roundtable',
    'Can South Asia Build a Shared Framework for Child Online Safety?',
    'A roundtable on whether South Asian countries can build a shared framework for keeping children safe online.'
  ),
  makeSession(
    79,
    'oct15',
    '16:10–17:00',
    'Workshop Room',
    'workshop',
    'Digital Wellness Hour: A Guided Journalling Workshop for Teens',
    'A guided journalling workshop for teens on reflecting on their online lives and building healthier digital habits.'
  ),
];

// Slim copy for the client-side "Now and Next" views: only the festival
// days and only the fields they need.
export const liveProgrammeSessions2026 = programmeSessions2026
  .filter((session) => session.day === 'oct14' || session.day === 'oct15')
  .map(({ id, day, time, venue, title, speakers }) => ({
    id,
    day,
    time,
    venue,
    title,
    speakers,
  }));
