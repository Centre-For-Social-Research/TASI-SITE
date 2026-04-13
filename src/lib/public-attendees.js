import { attendees } from '@/data/attendees';

const HIDDEN_ATTENDEE_IDS = new Set([
  'name-441',
  'truecaller-10',
  'sonali-patkar-unmesh-joshi-20',
  'tbc-girl-effect-india-26',
  'tbc-107',
  'fbi-usa-tbc-131',
  'netherlands-embassy-rep-229',
  'french-embassy-rep-255',
  'ragini-pant-puja-270',
  'resolver-282',
  'vys-300',
  'meity-rep-307',
  'swedish-embassy-rep-417',
  'acts-434',
  'anshul-tewari-gurkirrat-436',
  'girl-effects-rep-445',
  'snap-rep-100',
  'trai-rep-130',
  'resolver-rep-142',
  'meta-412',
  'pallavi-aus-commission-118',
  'payal-s-kanwar-indo-french-chamber-commerce-333',
  'somnath-banerjee-71',
  'cristina-albertin-457',
  'indras-ghosh-466',
]);

const ATTENDEE_OVERRIDES = {
  'snigdha-bhardwaj-1': {
    organisation: 'Google',
    designation: 'Director and Global Head of Generative AI, Trust and Safety',
  },
  'mr-munish-sharma-9': {
    name: 'Munish Sharma',
  },
  'rajesh-ranjan-6': {
    organisation: 'Google',
    designation: 'India Lead, Core Government Affairs and Public Policy',
  },
  'ms-melika-tolf-intern-embassy-of-sweden-83': {
    name: 'Melika Tolf',
    designation: 'Intern, Embassy of Sweden',
  },
  'nandita-baruah-19': {
    organisation: 'The Asia Foundation',
    designation: 'Country Representative, India',
  },
  'jordan-benavidez-22': {
    organisation: 'Match',
    designation: 'Director of Safety-by-Design',
  },
  'arjun-doraiswamy-36': {
    organisation: 'YouTube',
    designation: 'Head of Responsibility Partnerships, India',
  },
  'mr-shantaram-jonnalagadda-106': {
    name: 'Shantaram Jonnalagadda',
  },
  'ms-agnes-julin-minister-counsellor-deputy-head-of-mission-embassy-of-sweden-141': {
    name: 'Agnes Julin',
    designation: 'Minister Counsellor, Deputy Head of Mission',
  },
  'ms-chitra-iyer-252': {
    name: 'Chitra Iyer',
    organisation: 'Space2Grow',
    designation: 'Co-Founder & CEO',
  },
  'h-e-mr-jan-thesleff-ambassador-of-sweden-to-india-256': {
    name: 'Jan Thesleff',
    designation: 'Ambassador of Sweden to India',
  },
  'mr-gustav-ekstr-m-intern-embassy-of-sweden-258': {
    name: 'Gustav Ekstrom',
    designation: 'Intern, Embassy of Sweden',
  },
  'sophie-mortimer-swgfl-org-uk-263': {
    name: 'Sophie Mortimer',
    organisation: 'Revenge Porn Helpline',
    designation: 'Manager',
  },
  'mr-christoffer-orre-second-secretary-of-political-affairs-embassy-of-sweden-295': {
    name: 'Christoffer Orre',
    designation: 'Second Secretary of Political Affairs',
  },
  'ms-cecilia-tall-counsellor-of-science-and-innovations-embassy-of-sweden-302': {
    name: 'Cecilia Tall',
    designation: 'Counsellor of Science and Innovations',
  },
  'ms-disa-m-ller-intern-embassy-of-sweden-328': {
    name: 'Disa Muller',
    designation: 'Intern, Embassy of Sweden',
  },
  'ms-n-s-nappinai-345': {
    name: 'N. S. Nappinai',
    designation: 'Senior Advocate, Supreme Court',
  },
  'hariti-chadda-427': {
    organisation: 'Truecaller',
  },
  'delphine-brissonneau-428': {
    organisation: 'European Commission',
    designation: '',
  },
  'mr-ludvig-foghammar-counsellor-of-economic-affairs-embassy-of-sweden-355': {
    name: 'Ludvig Foghammar',
    designation: 'Counsellor of Economic Affairs',
  },
  'anindita-bose-459': {
    organisation: 'U.S. Department of State',
    designation: 'Project Manager, Digital Transformation',
  },
  'ms-charlotte-stevenson-460': {
    name: 'Charlotte Stevenson',
  },
  'sadhana-singh-462': {
    organisation: 'NITI Aayog',
    designation: 'Consultant',
  },
  'yoel-roth-phd-463': {
    name: 'Yoel Roth',
    organisation: 'Match Group',
    designation: 'Vice President, Trust & Safety',
  },
};

export const publicAttendees = attendees
  .filter((attendee) => !HIDDEN_ATTENDEE_IDS.has(attendee.id))
  .map((attendee) => {
    const curatedAttendee = {
      ...attendee,
      ...(ATTENDEE_OVERRIDES[attendee.id] ?? {}),
    };
    const { email, phone, ...publicFields } = curatedAttendee;

    return publicFields;
  })
  .filter((attendee) => attendee.organisation || attendee.designation);
