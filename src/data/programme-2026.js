// Public TASI 2026 programme. The latest draft takes precedence over the
// earlier CSV where their schedules differ. Speaker details and internal
// planning notes must not be published here.

const makeSession = (id, day, time, venue, format, title, description) => ({
  id: `tasi26-${id}`,
  day,
  time,
  track: venue,
  venue,
  format,
  title,
  description:
    description || 'Further details about this session will be shared soon.',
  speakers: [],
});

export const programmeSessions2026 = [
  // Tuesday, 13 October: opening reception and public safety spotlights.
  makeSession(
    1,
    'oct13',
    '18:00–20:00',
    'German Embassy',
    'opening',
    'Opening Reception',
    'Opening evening reception jointly hosted by the Embassy of France and the German Embassy, bringing delegates and partners together for welcome remarks and Safety Spotlights to launch TASI 2026.'
  ),
  makeSession(
    49,
    'oct13',
    '18:14–19:30',
    'German Embassy',
    'opening',
    'Safety Spotlights',
    'Short, solution-focused presentations on children’s information literacy, journalism safety, lessons from Australia, technology to combat trafficking and Project Lantern.'
  ),
  makeSession(
    2,
    'oct13',
    '18:35–18:50',
    'German Embassy',
    'spotlight',
    'Safety Spotlight: Building Children’s Critical Thinking',
    'A spotlight on helping children navigate information and develop critical thinking.'
  ),
  makeSession(
    3,
    'oct13',
    '18:50–19:05',
    'German Embassy',
    'spotlight',
    'Spotlight: Journalism Safety'
  ),
  makeSession(
    4,
    'oct13',
    '19:05–19:15',
    'German Embassy',
    'spotlight',
    'Spotlight: Lessons from Australia'
  ),
  makeSession(
    5,
    'oct13',
    '19:15–19:25',
    'German Embassy',
    'spotlight',
    'Spotlight: Using Technology to Combat Trafficking'
  ),
  // Two spotlights share the 19:25–19:35 slot in the source. Both are held.

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
    'Opening Sponsor Keynote: Safety in the AI Era'
  ),
  makeSession(
    11,
    'oct14',
    '10:30–11:15',
    'Main Hall',
    'panel',
    'Panel: Forces Reshaping Trust & Safety in 2026',
    'Senior leaders from technology, government and industry discuss the forces likely to shape trust and safety in the year ahead.'
  ),
  makeSession(
    12,
    'oct14',
    '11:15–11:30',
    'Main Hall',
    'spotlight',
    'Spotlight: What Happens When Critical Thinking Becomes a Daily Practice?'
  ),
  makeSession(
    13,
    'oct14',
    '11:30–11:45',
    'Main Hall',
    'keynote',
    'Keynote Address'
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
    17,
    'oct14',
    '12:15–12:30',
    'Main Hall',
    'spotlight',
    'Sponsor Spotlight: Microsoft x Cyberlite'
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
    'Sponsor Spotlight: Roblox / CSR'
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
    '15:30–16:30',
    'Main Hall',
    'fireside',
    'Leadership Dialogue: Women in Public Life: Building Safer Spaces for Stronger Democracy'
  ),
  makeSession(
    29,
    'oct14',
    '16:30–17:00',
    'Main Hall',
    'keynote',
    'Closing Keynote / Special Address'
  ),
  makeSession(
    51,
    'oct14',
    '17:00–17:15',
    'Main Hall',
    'spotlight',
    'Sponsor Spotlight: Driving Human Safety in the Digital World Through AI'
  ),
  // Wednesday, 14 October: parallel rooms. The latest draft resolves the
  // earlier overlapping morning roundtable entries.
  makeSession(
    80,
    'oct14',
    '10:00–11:00',
    'Roundtable Room',
    'roundtable',
    'Gender, Governance and India’s AI Future'
  ),
  makeSession(
    52,
    'oct14',
    '10:30–11:30',
    'Workshop Room',
    'workshop',
    'Workshop: Family Wellbeing'
  ),
  makeSession(
    53,
    'oct14',
    '11:45–13:00',
    'Workshop Room',
    'workshop',
    'Workshop: Building a Taxonomy of Contextualised AI Risks for the Global Majority'
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
    57,
    'oct14',
    '14:45–15:30',
    'Workshop Room',
    'workshop',
    'Partner Workshop'
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
    'Designing for Children: Critical Inquiry and Empathy'
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
    'Policy Lab: Building Safer Online Social Discovery Ecosystems'
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
    'Spotlight: Netflix'
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
    'Partner Spotlight'
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
    'Fireside Chat: Navigating Social Media Across Generations'
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
    'Reflections on the two-day convening and what it will take to move from reacting to harms to anticipating and preventing them.'
  ),
  makeSession(
    48,
    'oct15',
    '16:50–17:00',
    'Main Hall',
    'special',
    'Festival Closing'
  ),
  makeSession(
    68,
    'oct15',
    '18:00–20:00',
    'Netheland Embassy',
    'special',
    'Closing Reception',
    'Closing reception for delegates and partners to reflect on the two-day programme and continue conversations across the trust and safety community.'
  ),

  // Thursday, 15 October: parallel rooms. The overlapping 11:45–13:00
  // and 12:30–14:00 Workshop Room entries are held pending correction.
  makeSession(
    69,
    'oct15',
    '10:00–11:00',
    'Workshop Room',
    'panel',
    'Panel: Growing Up and Parenting in the Digital Age'
  ),
  makeSession(
    70,
    'oct15',
    '10:15–11:15',
    'Roundtable Room',
    'roundtable',
    'Roundtable: Technology-Facilitated Gender-Based Violence'
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
    'Online Content Regulation and Censorship'
  ),
  makeSession(
    74,
    'oct15',
    '14:00–15:00',
    'Roundtable Room',
    'roundtable',
    'Beyond the Binary: Rethinking Age Assurance and Child Online Safety in India'
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
    'Snap Workshop'
  ),
];
