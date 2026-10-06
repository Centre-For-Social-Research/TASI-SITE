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
    'Opening evening reception jointly hosted by the Embassy of France and the German Embassy, bringing delegates and partners together for welcome remarks and Safety Spotlights to launch TASI 2026.'
  ),
  makeSession(
    49,
    'oct13',
    '19:15–20:05',
    'Goethe-Institut',
    'opening',
    'Safety Spotlights',
    'Short, solution-focused presentations on children’s agency in navigating information, safety in journalism, youth participation in online safety, rescue and rehabilitation of trafficking survivors, and shared signals for safer platforms.'
  ),
  makeSession(
    2,
    'oct13',
    '19:15–19:25',
    'Goethe-Institut',
    'spotlight',
    'Safety Spotlight: From Protection to Agency: Building Children’s Capacity to Navigate Information With Humans in the Lead',
    'A spotlight on moving from protecting children to building their capacity to navigate information, with humans in the lead.'
  ),
  makeSession(
    3,
    'oct13',
    '19:25–19:35',
    'Goethe-Institut',
    'spotlight',
    'Spotlight: Making Safety Part of the Assignment'
  ),
  makeSession(
    4,
    'oct13',
    '19:35–19:45',
    'Goethe-Institut',
    'spotlight',
    'Spotlight: Less Advising, More Doing: Rethinking Youth Participation in Online Safety'
  ),
  makeSession(
    5,
    'oct13',
    '19:45–19:55',
    'Goethe-Institut',
    'spotlight',
    'Spotlight: Rescue. Rehabilitation. Repatriation.'
  ),
  makeSession(
    81,
    'oct13',
    '19:55–20:05',
    'Goethe-Institut',
    'spotlight',
    'Spotlight: Lantern: Shared Signals, Safer Platforms'
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
    'Welcome and Opening Remarks'
  ),
  makeSession(
    10,
    'oct14',
    '10:15–10:30',
    'Main Hall',
    'keynote',
    'Opening Keynote: Growing Up With AI: What Safety Means Now'
  ),
  makeSession(
    11,
    'oct14',
    '10:30–11:15',
    'Main Hall',
    'panel',
    'Opening Panel: Forces Reshaping Trust & Safety in 2026',
    'Senior leaders from technology, government and industry discuss the forces likely to shape trust and safety in the year ahead.'
  ),
  makeSession(
    12,
    'oct14',
    '11:15–11:30',
    'Main Hall',
    'spotlight',
    'Spotlight: What Happens When Critical Thinking Becomes a Daily Practice? How Can AI Play a Role With Humans in the Lead?'
  ),
  makeSession(
    13,
    'oct14',
    '11:30–11:45',
    'Main Hall',
    'keynote',
    'Opening Remarks and Inaugural Address'
  ),
  makeSession(
    16,
    'oct14',
    '11:45–12:15',
    'Main Hall',
    'fireside',
    'Fireside Chat: The Fight Against CSAM: From Detection to Prevention Through Industry Collaboration',
    'A discussion of industry collaboration against CSAM, from detection and reporting to prevention.'
  ),
  makeSession(
    18,
    'oct14',
    '12:30–13:15',
    'Main Hall',
    'panel',
    'Panel: Growing Up Digital: Designing for Youth Wellbeing in the Age of AI',
    'How digital experiences can support young people’s wellbeing as AI becomes part of how they learn and connect.'
  ),
  makeSession(
    19,
    'oct14',
    '13:15–13:30',
    'Main Hall',
    'spotlight',
    'Spotlight: My Digital Wellbeing Journal Launch'
  ),
  makeSession(20, 'oct14', '13:30–14:15', 'Lobby', 'special', 'Lunch Break'),
  makeSession(
    23,
    'oct14',
    '14:15–15:00',
    'Main Hall',
    'panel',
    'Panel: Age Assurance and Age-Appropriate Design: Building Better Experiences for Children',
    'Building age-appropriate digital experiences that balance safety, privacy and participation.'
  ),
  makeSession(
    24,
    'oct14',
    '15:00–15:15',
    'Main Hall',
    'spotlight',
    'Spotlight: Youth in Play'
  ),
  makeSession(
    26,
    'oct14',
    '15:15–15:30',
    'Main Hall',
    'keynote',
    'Special Address: Women, Power and Participation in the Digital Age'
  ),
  makeSession(
    27,
    'oct14',
    '15:30–16:00',
    'Main Hall',
    'fireside',
    'Leadership Dialogue: Women in Public Life: Building Safer Spaces for Stronger Democracy'
  ),
  makeSession(
    82,
    'oct14',
    '16:00–16:30',
    'Main Hall',
    'fireside',
    'Fireside Chat: The Future of Connection: Culture, Community and Trust Online'
  ),
  makeSession(
    29,
    'oct14',
    '16:30–17:00',
    'Main Hall',
    'keynote',
    'Closing Keynote'
  ),
  makeSession(
    51,
    'oct14',
    '17:00–17:15',
    'Main Hall',
    'spotlight',
    'Sponsor Spotlight: Driving Human Safety in the Digital World Through AI'
  ),
  // Wednesday, 14 October: parallel rooms.
  makeSession(
    84,
    'oct14',
    '10:00–10:30',
    'Workshop Room',
    'workshop',
    'Not Another Chatbot: Public Interest AI and Community Knowledge as Trust and Safety Infrastructure'
  ),
  makeSession(
    80,
    'oct14',
    '10:00–11:00',
    'Roundtable Room',
    'panel',
    'Panel: Gender, Governance and India’s AI Future'
  ),
  makeSession(
    52,
    'oct14',
    '10:30–11:30',
    'Workshop Room',
    'workshop',
    'From Teenagers to “Seenagers”: Navigating Digital Wellbeing Across Generations and Mitigating Digital Risks'
  ),
  makeSession(
    53,
    'oct14',
    '11:45–13:00',
    'Workshop Room',
    'workshop',
    'Workshop: A Systems Approach to AI Risks in Global Majority Contexts'
  ),
  makeSession(
    54,
    'oct14',
    '11:30–13:00',
    'Roundtable Room',
    'roundtable',
    'Roundtable: Advancing Child Safety in Online Social Gaming'
  ),
  makeSession(
    55,
    'oct14',
    '14:00–14:45',
    'Workshop Room',
    'workshop',
    'Interactive Masterclass: A Fact-Checker’s Guide to AI and Deepfakes'
  ),
  makeSession(
    56,
    'oct14',
    '14:00–15:00',
    'Roundtable Room',
    'roundtable',
    'Raising Children in the AI Era: Balancing Privacy, Trust and Safety'
  ),
  makeSession(
    69,
    'oct14',
    '14:45–15:30',
    'Workshop Room',
    'panel',
    'Panel: Growing Up and Parenting in the Digital Age'
  ),
  makeSession(
    58,
    'oct14',
    '15:00–16:00',
    'Roundtable Room',
    'roundtable',
    'Behind the Curtain: Fraud, Scams and the Fight for Trust and Safety in the AI Era'
  ),
  makeSession(
    59,
    'oct14',
    '15:30–17:00',
    'Workshop Room',
    'workshop',
    'Designing for Children: Critical Inquiry, Empathy and Safety in the Information Age'
  ),
  makeSession(
    60,
    'oct14',
    '16:00–17:00',
    'Roundtable Room',
    'roundtable',
    'Regulating for Safety: Are We Over-Regulating and Under-Governing the Internet?'
  ),
  makeSession(
    25,
    'oct14',
    '17:00–19:00',
    'Workshop Room',
    'workshop',
    'Policy Lab: Building Trusted Human Connections: Designing for Safety, Authenticity and Inclusion'
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
    'Welcome Back'
  ),
  makeSession(
    33,
    'oct15',
    '10:05–10:15',
    'Main Hall',
    'keynote',
    'Opening Keynote: Journalism, Democracy and Trust in the Age of AI'
  ),
  makeSession(
    34,
    'oct15',
    '10:15–11:00',
    'Main Hall',
    'panel',
    'Panel: Trust, Safety & Equity: Journalism in a Changing Information Ecosystem',
    'Protecting journalists, strengthening the integrity of the information ecosystem and rebuilding public trust in the age of AI.'
  ),
  makeSession(
    61,
    'oct15',
    '11:00–11:15',
    'Main Hall',
    'spotlight',
    'Spotlight: I4C, Saksham Senior and Meta Collaboration for Cyber Awareness Month'
  ),
  makeSession(
    44,
    'oct15',
    '11:15–12:00',
    'Main Hall',
    'panel',
    'Panel: Safety and Well-being of Content Creators',
    'What it takes to help content creators thrive, including tools and platform investments that support their wellbeing.'
  ),
  makeSession(
    62,
    'oct15',
    '12:00–12:30',
    'Main Hall',
    'fireside',
    'Fireside Chat: Technology, Learning, and the Next Generation'
  ),
  makeSession(
    63,
    'oct15',
    '12:30–12:45',
    'Main Hall',
    'spotlight',
    'Spotlight: From Tech Hinsa to Tech Respect: Putting Young People at the Heart of a Safer Digital Future'
  ),
  makeSession(
    40,
    'oct15',
    '12:45–13:30',
    'Main Hall',
    'panel',
    'Panel: Beyond Online Harm: Rethinking Women’s Safety in a Changing Digital World',
    'Designing digital spaces where women can participate fully, confidently and on their own terms.'
  ),
  makeSession(41, 'oct15', '13:30–14:20', 'Lobby', 'special', 'Lunch Break'),
  makeSession(
    64,
    'oct15',
    '14:20–14:50',
    'Main Hall',
    'fireside',
    'Fireside Chat: Navigating Social Media Across a Generation Gap'
  ),
  makeSession(
    46,
    'oct15',
    '14:50–15:35',
    'Main Hall',
    'panel',
    'Panel: Combatting Trafficking: Building Stronger Partnerships to Prevent and Respond to Exploitation',
    'How industry, civil society and government can strengthen prevention of and response to exploitation.'
  ),
  makeSession(
    65,
    'oct15',
    '15:35–15:50',
    'Main Hall',
    'spotlight',
    'Google Spotlight'
  ),
  makeSession(
    66,
    'oct15',
    '15:50–16:10',
    'Main Hall',
    'spotlight',
    'Spotlight: TQH Report Launch'
  ),
  makeSession(
    67,
    'oct15',
    '16:10–16:50',
    'Main Hall',
    'panel',
    'Closing Plenary: Trust & Safety at a Crossroads',
    'How should we rethink safety, responsibility and human wellbeing for the next era of technology? Reflections on the two-day convening and what it will take to move from reacting to harms to anticipating and preventing them.'
  ),
  makeSession(
    48,
    'oct15',
    '16:50–17:00',
    'Main Hall',
    'special',
    'Closing Remarks'
  ),
  makeSession(
    68,
    'oct15',
    '18:00–20:00',
    'Embassy of the Netherlands',
    'special',
    'Closing Reception',
    'Closing reception for delegates and partners to reflect on the two-day programme and continue conversations across the trust and safety community.'
  ),

  // Thursday, 15 October: parallel rooms.
  makeSession(
    70,
    'oct15',
    '10:15–11:15',
    'Roundtable Room',
    'roundtable',
    'Roundtable: Continuum of Online and Offline Abuse'
  ),
  makeSession(
    71,
    'oct15',
    '11:00–11:45',
    'Workshop Room',
    'workshop',
    'Everest Group Session'
  ),
  makeSession(
    83,
    'oct15',
    '11:45–13:00',
    'Workshop Room',
    'workshop',
    'Kids Safety Masterclass',
    'An interactive session for parents covering product safety features, safety mechanisms and learning opportunities for students that use generative AI to improve learning outcomes.'
  ),
  makeSession(
    17,
    'oct15',
    '13:00–14:00',
    'Workshop Room',
    'workshop',
    'Designing With, Not For: Youth Co-Design as a Safeguarding Tool for AI Companionship'
  ),
  makeSession(
    72,
    'oct15',
    '11:45–12:45',
    'Roundtable Room',
    'roundtable',
    'Growing Up With AI: Lessons from Young People and Educators'
  ),
  makeSession(
    73,
    'oct15',
    '12:45–13:00',
    'Roundtable Room',
    'spotlight',
    'The Small Fish in the Big Pond of Online Content Regulation: Splinternet of Censorship and the Online Safety Act in Sri Lanka'
  ),
  makeSession(
    74,
    'oct15',
    '14:00–15:00',
    'Roundtable Room',
    'roundtable',
    'Age, Access and Safety: Building an Age-Appropriate Digital Ecosystem for Children in India'
  ),
  makeSession(
    75,
    'oct15',
    '14:30–15:15',
    'Workshop Room',
    'workshop',
    'Building Better Technology for Children: A Global South Approach to Child-Centred Design'
  ),
  makeSession(
    76,
    'oct15',
    '15:00–15:50',
    'Roundtable Room',
    'roundtable',
    'Rethinking Image-Based Abuse in South Asia'
  ),
  makeSession(
    77,
    'oct15',
    '15:15–16:00',
    'Workshop Room',
    'workshop',
    'Open Source AI: Standards, Safeguards and Shared Responsibility'
  ),
  makeSession(
    78,
    'oct15',
    '16:00–16:45',
    'Roundtable Room',
    'roundtable',
    'Can South Asia Build a Shared Framework for Child Online Safety?'
  ),
  makeSession(
    79,
    'oct15',
    '16:10–17:00',
    'Workshop Room',
    'workshop',
    'Digital Wellness Hour: A Guided Journalling Workshop for Teens'
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
