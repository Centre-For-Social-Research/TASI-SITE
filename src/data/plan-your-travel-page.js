export const travelShellCopy = {
  eyebrow: 'TASI 2026 - New Delhi',
  title: 'Plan Your Travel',
  description:
    'Everything you need to prepare for your trip to New Delhi for TASI 2026 - from visas and accommodation to getting around the city.',
};

export const travelTabs = [
  { label: 'Overview', href: '/plan-your-travel' },
  { label: 'General Info', href: '/plan-your-travel/general-info' },
  { label: 'How to Reach', href: '/plan-your-travel/how-to-reach' },
  { label: 'Visa Information', href: '/plan-your-travel/visa-information' },
  { label: 'Accommodation', href: '/plan-your-travel/accommodation' },
];

export const travelOverviewMetadata = {
  title: 'Plan Your Travel - TASI 2026',
  description:
    'Everything you need to plan your trip to TASI 2026 in New Delhi - hotel recommendations, visa information, how to reach the venue, and general travel tips.',
};

export const generalInfoMetadata = {
  title: 'General Information - Plan Your Travel - TASI 2026',
  description:
    'Currency, time zone, emergency contacts, dress code, and essential travel tips for your visit to TASI 2026 in New Delhi.',
};

export const howToReachMetadata = {
  title: 'How to Reach - Plan Your Travel - TASI 2026',
  description:
    'Airports, railway stations, metro, and taxi options for reaching the TASI 2026 venue in New Delhi, India.',
};

export const visaInformationMetadata = {
  title: 'Visa Information - Plan Your Travel - TASI 2026',
  description:
    'Visa waiver agreements, conference visas, e-Visa pathways, OCI card requirements, and passport validity rules for TASI 2026 in New Delhi.',
};

export const accommodationMetadata = {
  title: 'Accommodation - Plan Your Travel - TASI 2026',
  description:
    'Curated selection of 26 premier hotels near the TASI 2026 summit venue in New Delhi. Book independently to secure your stay.',
};

export const travelOverviewSections = [
  {
    icon: 'Globe',
    title: 'General Information',
    description:
      'Currency, time zone, emergency contacts, dress code, electricity, and essential tips for your stay in New Delhi.',
    href: '/plan-your-travel/general-info',
    theme: 'sky',
    pills: ['IST (GMT +5:30)', 'INR (Indian Rupee)', '112 Emergency'],
  },
  {
    icon: 'Plane',
    title: 'How to Reach',
    description:
      'Airports, railway stations, metro, and app-based taxis - everything you need to get to the summit venue.',
    href: '/plan-your-travel/how-to-reach',
    theme: 'amber',
    pills: ['IGI Airport - 16 km', 'New Delhi Rly - 5 km', 'Blue Line Metro'],
  },
  {
    icon: 'Shield',
    title: 'Visa Information',
    description:
      'Visa waiver agreements, conference visas, e-Visa pathways, OCI requirements, and passport validity rules.',
    href: '/plan-your-travel/visa-information',
    theme: 'emerald',
    pills: ['Visa Waivers', 'Conference Visa', 'e-Visa Available'],
  },
  {
    icon: 'Hotel',
    title: 'Accommodation',
    description:
      'A curated selection of 26 premier hotels near the summit venue - luxury five-star properties to well-connected business hotels.',
    href: '/plan-your-travel/accommodation',
    theme: 'violet',
    pills: ['26 Hotels', 'Aerocity', '5-Star Properties'],
  },
];

export const travelQuickFacts = [
  { icon: 'Clock', label: 'Time Zone', value: 'IST (GMT +5:30)' },
  { icon: 'Banknote', label: 'Currency', value: 'INR (Indian Rupee)' },
  { icon: 'Zap', label: 'Electricity', value: '220-240V / C-D' },
  { icon: 'Phone', label: 'Emergency', value: '112' },
];

export const travelColorStyles = {
  sky: {
    accent: 'bg-sky-500',
    border: 'border-sky-200 dark:border-sky-800',
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    iconBg: 'bg-sky-100 dark:bg-sky-900/40',
    iconText: 'text-sky-600 dark:text-sky-400',
    pillBg: 'bg-sky-100 dark:bg-sky-900/30',
    pillText: 'text-sky-700 dark:text-sky-300',
    ctaText:
      'text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100',
  },
  amber: {
    accent: 'bg-amber-500',
    border: 'border-amber-200 dark:border-amber-800',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconText: 'text-amber-600 dark:text-amber-400',
    pillBg: 'bg-amber-100 dark:bg-amber-900/30',
    pillText: 'text-amber-700 dark:text-amber-300',
    ctaText:
      'text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100',
  },
  emerald: {
    accent: 'bg-emerald-500',
    border: 'border-emerald-200 dark:border-emerald-800',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    pillBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    pillText: 'text-emerald-700 dark:text-emerald-300',
    ctaText:
      'text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100',
  },
  violet: {
    accent: 'bg-violet-500',
    border: 'border-violet-200 dark:border-violet-800',
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconText: 'text-violet-600 dark:text-violet-400',
    pillBg: 'bg-violet-100 dark:bg-violet-900/30',
    pillText: 'text-violet-700 dark:text-violet-300',
    ctaText:
      'text-violet-700 dark:text-violet-300 hover:text-violet-900 dark:hover:text-violet-100',
  },
  purple: {
    border: 'border-purple-200 dark:border-purple-800',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconText: 'text-purple-600 dark:text-purple-400',
  },
  blue: {
    border: 'border-blue-200 dark:border-blue-800',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconText: 'text-blue-600 dark:text-blue-400',
  },
  yellow: {
    border: 'border-yellow-200 dark:border-yellow-800',
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
    iconText: 'text-yellow-600 dark:text-yellow-400',
  },
  green: {
    border: 'border-green-200 dark:border-green-800',
    bg: 'bg-green-50 dark:bg-green-950/20',
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconText: 'text-green-600 dark:text-green-400',
  },
  red: {
    border: 'border-red-200 dark:border-red-800',
    bg: 'bg-red-50 dark:bg-red-950/20',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    iconText: 'text-red-600 dark:text-red-400',
  },
  teal: {
    border: 'border-teal-200 dark:border-teal-800',
    bg: 'bg-teal-50 dark:bg-teal-950/20',
    iconBg: 'bg-teal-100 dark:bg-teal-900/40',
    iconText: 'text-teal-600 dark:text-teal-400',
  },
};

export const generalQuickStats = [
  { label: 'Time Zone', value: 'IST - GMT +5:30' },
  { label: 'Currency', value: 'INR Indian Rupee' },
  { label: 'USD / INR', value: '1 USD approx INR 92' },
  { label: 'Electricity', value: '220-240V - C/D' },
  { label: 'Country Code', value: '+91 India' },
  { label: 'Emergency', value: '112' },
];

export const generalInfoItems = [
  {
    icon: 'Globe',
    color: 'sky',
    title: 'About New Delhi',
    body: 'Delhi has been a city of historical significance, one that has witnessed multiple eras and empires, from the Pandavas to the Mughals, giving it a rich cultural and architectural heritage. Monuments and historical landmarks can be found throughout the city, creating a vibrant blend of the ancient and the modern. Delhi offers a wide array of attractions, bustling markets, and diverse cuisines. Notable landmarks include Connaught Place, Rashtrapati Bhavan, Kartavya Path, India Gate, Qutab Minar, and Akshardham Temple.',
  },
  {
    icon: 'Clock',
    color: 'amber',
    title: 'Time Zone',
    body: 'Local time in New Delhi follows Indian Standard Time (IST), which is GMT +5:30 hours. In October, Delhi is generally warm during the day and pleasantly cool in the evening, with typical temperatures around 20C to 34C. Delegates should bring light, breathable clothes for daytime, and a light jacket or shawl for early mornings and nights.',
  },
  {
    icon: 'Shirt',
    color: 'purple',
    title: 'Dress Code',
    body: 'Unless otherwise specified, the dress code for all official meetings and events is formal business attire.',
  },
  {
    icon: 'Droplets',
    color: 'blue',
    title: 'Drinking Water',
    body: 'Delegates are advised to consume sealed bottled water only.',
  },
  {
    icon: 'Zap',
    color: 'yellow',
    title: 'Electricity',
    body: 'Electric supply in India is 220-240 volts, with plug types C and D. Delegates are advised to carry their own universal adapters for charging electronic devices.',
  },
  {
    icon: 'Phone',
    color: 'green',
    title: 'International Dial Codes',
    body: 'The country code for India is +91, and the local code for New Delhi is 11. To call a local landline number, dial +9111 followed by the number. To call an Indian mobile number from abroad, dial +91 followed by the mobile number.',
  },
  {
    icon: 'Banknote',
    color: 'emerald',
    title: 'Currency and Banking',
    body: 'The currency of India is the Indian Rupee (INR). The current exchange rate against the US Dollar is approximately INR 92 = 1 USD (subject to change). Currency can be exchanged at the airport, designated government-approved foreign exchange counters, and select hotels. ATMs are widely available, and major international credit cards are accepted in most hotels, restaurants, and shops.',
  },
  {
    icon: 'AlertTriangle',
    color: 'red',
    title: 'Emergency Contacts',
    body: 'For any urgent situation in India, call 112 (Police, Fire, Ambulance). During TASI, the venue usually has an on-site emergency response team, and delegates can also contact venue help desks or summit staff immediately for rapid assistance.',
  },
  {
    icon: 'Camera',
    color: 'violet',
    title: 'Photography & Media Usage',
    body: 'Delegates and participants may be filmed or photographed by official photographers. Official photographs and highlight videos will be made available on the TASI website following the conclusion of the event.',
  },
  {
    icon: 'Accessibility',
    color: 'teal',
    title: 'Accessibility & Special Needs',
    body: 'Delegates are encouraged to inform the organising team of any special requirements, including accessibility needs, dietary restrictions, allergies, or medical conditions in advance. All such information will be treated confidentially.',
  },
];

export const airports = [
  {
    terminal: 'Domestic, Terminal 1',
    name: 'Indira Gandhi International Airport',
    distance: 'Approx. 15 km',
    code: 'DEL',
  },
  {
    terminal: 'Domestic, Terminal 2',
    name: 'Indira Gandhi International Airport',
    distance: 'Approx. 14 km',
    code: 'DEL',
  },
  {
    terminal: 'International, Terminal 3',
    name: 'Indira Gandhi International Airport',
    distance: 'Approx. 16 km',
    code: 'DEL',
  },
  {
    terminal: 'Domestic',
    name: 'Hindon Airport, Ghaziabad (Delhi NCR)',
    distance: 'Approx. 35 km',
    code: 'HDO',
  },
];

export const railwayStations = [
  {
    name: 'New Delhi Railway Station',
    distance: '~5 km',
    note: 'Rajdhani and major rail routes',
  },
  {
    name: 'Hazrat Nizamuddin Railway Station',
    distance: '~6 km',
    note: 'Duronto, Gatimaan and Shatabdi routes',
  },
  {
    name: 'Old Delhi Railway Station',
    distance: '~8 km',
    note: 'Heritage terminus',
  },
];

export const nearbyAttractions = [
  {
    name: 'Akshardham Temple',
    distance: '0.5 km',
    note: 'Right next to venue',
    image: '/img/travel/attractions/akshardham.webp',
  },
  {
    name: 'Dilli Haat',
    distance: '1 km',
    note: '3-5 mins by car',
    image: '/img/travel/attractions/dilli-haat.webp',
  },
  {
    name: 'Red Fort',
    distance: '1 km',
    note: '3-5 mins by car',
    image: '/img/travel/attractions/red-fort.webp',
  },
  {
    name: 'India Gate',
    distance: '1.5 km',
    note: '5 mins by car',
    image: '/img/travel/attractions/india-gate.webp',
  },
  {
    name: 'Rashtrapati Bhavan',
    distance: '4.5 km',
    note: '12-15 mins by car',
    image: '/img/travel/attractions/rashtrapati-bhavan.webp',
  },
];

export const immigrationPoints = [
  'Immigration clearance will be completed at the first port of entry into India. A dedicated lane for accredited delegates will be available at IGI Airport.',
  'No weapons are permitted to be brought into India by delegation members or accompanying security personnel.',
  "Delegates may carry medicines strictly for personal use with a prescription or physician's letter.",
  'Amounts exceeding USD 10,000 (or equivalent) in cash must be declared to Customs authorities upon arrival.',
  'Items not permitted in personal baggage on flights within India: cigarette lighters, e-cigarettes/vapes, satellite phones, drones.',
  'Duty-free allowances per adult: 2 litres of alcohol, 100 cigarettes or 25 cigars, personal goods within reasonable limits.',
];

export const visaPathways = [
  {
    icon: 'Globe',
    tag: 'Diplomatic / Official Passport',
    title: 'Visa Waiver Agreements',
    description:
      'The Government of India has bilateral Visa Waiver Agreements for holders of Diplomatic / Official / Service Passports in several countries.',
    cta: {
      label: 'View Visa Waiver List',
      href: 'https://www.mea.gov.in/bvwa-menu.htm',
    },
    theme: 'sky',
  },
  {
    icon: 'FileText',
    tag: 'Diplomatic / Official Passport',
    title: 'Regular Conference Visa',
    description:
      'Delegates holding Diplomatic / Official Passports of countries without a Visa Waiver Agreement may apply for a regular Conference Visa with multiple entries. Visas are issued gratis to all accredited delegates and accompanying spouses. Submit the visa application with your accreditation letter and a Note Verbale from your Ministry of Foreign Affairs to the nearest Indian Mission.',
    cta: {
      label: 'Apply for Conference Visa',
      href: 'https://indianvisaonline.gov.in/',
    },
    theme: 'amber',
  },
  {
    icon: 'Smartphone',
    tag: 'Ordinary Passport - Eligible Countries',
    title: 'e-Conference Visa',
    description:
      'Delegates holding Ordinary Passports from eligible countries under the e-Visa regime may apply for an e-Conference Visa online. Note: the e-Visa facility is not available for holders of Diplomatic / Official / Service Passports or International Travel Documents such as UNLP.',
    cta: {
      label: 'Apply for e-Conference Visa',
      href: 'https://indianvisaonline.gov.in/evisa/tvoa.html',
    },
    theme: 'emerald',
  },
];

export const visaAdditionalSections = [
  {
    icon: 'CreditCard',
    title: 'Overseas Citizens of India (OCI)',
    description:
      'OCI cardholders attending the Summit as delegates must obtain prior permission from the Ministry of Home Affairs, Government of India. The accreditation letter issued by the Summit Secretariat must be uploaded when applying for such permission.',
    cta: {
      label: 'Apply for OCI Permission',
      href: 'https://ociservices.gov.in/onlineOCI/',
    },
  },
  {
    icon: 'AlertCircle',
    title: 'Passport Requirements',
    description:
      'Delegates are requested to ensure that their passports have a minimum validity of six months beyond the date of arrival in India and at least two blank pages for visa endorsement. For delegates travelling on e-Conference Visas, biometric details will be mandatorily captured at the port of entry upon arrival in India.',
    cta: null,
  },
];

const hotelCdn = 'https://d19ob9sqegt2wc.cloudfront.net/stage/uploads/';

export const hotels = [
  {
    name: 'Aloft New Delhi Aerocity',
    area: 'Aerocity',
    url: 'https://www.marriott.com/en-us/hotels/delal-aloft-new-delhi-aerocity',
    photo: `${hotelCdn}aloft_new_delhi_aerocity_a20a7d5465.webp`,
  },
  {
    name: 'Andaz Delhi',
    area: 'Aerocity',
    url: 'https://www.hyatt.com/en-US/hotel/india/andaz-delhi/delad',
    photo: `${hotelCdn}36c3883f137ec47f735fbe262bce57e3e99ede69_8a97ab0316.png`,
  },
  {
    name: 'Claridges',
    area: 'Motilal Nehru Marg, New Delhi',
    url: 'https://www.claridges.com',
    photo: `${hotelCdn}b0b46f07926b8c7bff4b3c4393f3ee2acd398203_5e9eb189c7.png`,
  },
  {
    name: 'Eros Hotel',
    area: 'Nehru Place',
    url: 'https://www.eroshotel.co.in',
    photo: `${hotelCdn}bde33ea88da2533ef9aa14381c6a2404eba76883_0771d41aab.jpg`,
  },
  {
    name: 'Hotel Grand',
    area: 'Vasant Kunj',
    url: 'http://www.thegrandnewdelhi.com',
    photo: `${hotelCdn}65e593ea8241c12faabb30a4ee51160d6547ac79_a315a42d39.png`,
  },
  {
    name: 'Hyatt Regency Delhi',
    area: 'Bhikaji Cama Place',
    url: 'https://www.hyatt.com/hyatt-regency/en-US/delrd-hyatt-regency-delhi',
    photo: '/img/travel/hotels/hyatt-delhi.webp',
  },
  {
    name: 'Imperial Hotel',
    area: 'Janpath Lane, Connaught Place',
    url: 'https://theimperialindia.com',
    photo: `${hotelCdn}c3db91e9a6853e6b4a12c9bd3c37a6279deb2b3b_8e00498d98.png`,
  },
  {
    name: 'India Habitat Centre',
    area: '6, Lodhi Road, New Delhi',
    url: 'http://www.indiahabitat.org',
    photo: `${hotelCdn}f10301c4dea4f1d71da5c003fec9aec82ec2e9e8_ed18e88de5.png`,
  },
  {
    name: 'ITC Maurya',
    area: 'S.P. Marg, Diplomatic Enclave',
    url: 'https://www.itchotels.com/in/en/itcmaurya-newdelhi',
    photo: `${hotelCdn}89f5082989065e2f14df0ce680a86a9b2e3b3970_1_3198ff07e0.png`,
  },
  {
    name: 'JW Marriott',
    area: 'Aerocity',
    url: 'https://www.marriott.com/en-us/hotels/deljw-jw-marriott-hotel-new-delhi-aerocity',
    photo: `${hotelCdn}ee650db5efebdc9dce063b4f3a6fff4168a3052d_ebb2d08be0.jpg`,
  },
  {
    name: 'Le Meridien',
    area: 'Windsor Place, Connaught Place',
    url: 'https://www.marriott.com/en-us/hotels/delmd-le-meridien-new-delhi',
    photo: `${hotelCdn}2ecbade3be5bb23aeadbbeec8798f6fb4f3daf0f_c98b298c7d.png`,
  },
  {
    name: 'Pride Plaza',
    area: 'Aerocity',
    url: 'https://www.pridehotel.com',
    photo: `${hotelCdn}052020f5fb12707a7267bcc77a82ea46770ef729_5a28f6fd0d.png`,
  },
  {
    name: 'Pullman New Delhi Aerocity',
    area: 'Aerocity',
    url: 'https://all.accor.com/hotel/7687/index.en.shtml',
    photo: `${hotelCdn}7b4d0eb3868a46fba399c4d680d23a3a49949ab7_fc106fc666.png`,
  },
  {
    name: 'Radisson Blu Plaza',
    area: 'NH 8, Mahipalpur',
    url: 'https://www.radissonhotels.com/en-us/hotels/radisson-blu-new-delhi-paschim-vihar',
    photo: `${hotelCdn}ec3e9dab0d70a8bd88b6a2a097ed44a601d024da_c71258255a.png`,
  },
  {
    name: 'Roseate New Delhi',
    area: 'Aerocity',
    url: 'https://www.roseatehotels.com/newdelhi/theroseate',
    photo: `${hotelCdn}967cbe5771fe5508d0b6827b9ff67d5ed6fbc773_02f4a13b07.png`,
  },
  {
    name: 'Shangri-La Eros',
    area: '19 Ashoka Road, New Delhi',
    url: 'https://www.shangri-la.com/newdelhi/shangrila',
    photo: `${hotelCdn}ece5617d680f0ec59aee77150f9be5260f5a3522_d7158d74ce.png`,
  },
  {
    name: 'Sheraton New Delhi',
    area: 'Lodhi Road, New Delhi',
    url: 'https://www.marriott.com/en-us/hotels/delsi-sheraton-new-delhi-hotel',
    photo: `${hotelCdn}caf4655c69cfa0bdf0813186e32c3c7d90af9d63_2363d951b5.jpg`,
  },
  {
    name: 'Taj Mahal Hotel',
    area: 'Mansingh Road, New Delhi',
    url: 'https://www.tajhotels.com/en-in/taj/taj-mahal-new-delhi',
    photo: `${hotelCdn}76919548eeeab6b30ef984cea5d89bc770798033_fede13204c.jpg`,
  },
  {
    name: 'Taj Palace',
    area: 'Sardar Patel Marg',
    url: 'https://www.tajhotels.com/en-in/taj/taj-palace-new-delhi',
    photo: `${hotelCdn}2f91270d5f6cadd98f97726466230e4ce85ff5cd_05a577dfba.png`,
  },
  {
    name: 'The Ashok',
    area: 'Niti Marg, Chanakyapuri',
    url: 'http://www.theashokhotel.com',
    photo: `${hotelCdn}8756fd207bd5df1a93a369cdd1663b28a90e6f43_098ff6dbd6.png`,
  },
  {
    name: 'The Connaught',
    area: 'Shaheed Bhagat Singh Marg',
    url: 'https://www.seleqtionshotels.com/en-in/the-connaught-new-delhi',
    photo: `${hotelCdn}cb604771380c9cc0b986754cdc8ca72b09a1a0b6_86d00e249d.png`,
  },
  {
    name: 'The Lalit',
    area: 'Barakhamba Avenue, Connaught Pl.',
    url: 'https://www.thelalit.com/the-lalit-new-delhi',
    photo: `${hotelCdn}23f23931cb36be551c6e5a0c55ddd96964899142_97a30bae73.jpg`,
  },
  {
    name: 'The Leela',
    area: 'Africa Avenue, Chanakyapuri',
    url: 'https://www.theleela.com/the-leela-new-delhi',
    photo: `${hotelCdn}2676dd7390d3f3c8b6fcd1a0d14deb043f63fac4_4ca653bb4e.png`,
  },
  {
    name: 'The Lodhi',
    area: 'Lodhi Road, New Delhi',
    url: 'https://www.thelodhi.com',
    photo: `${hotelCdn}a6f5ef5674eb62631e7c7092888c5b66fe5144e8_a018a80ded.png`,
  },
  {
    name: 'The Oberoi, New Delhi',
    area: 'Dr. Zakir Hussain Marg',
    url: 'https://www.oberoihotels.com/hotels-in-new-delhi',
    photo: `${hotelCdn}7416c80b2d37cda299609f6e303f33a312ee4423_8481281b9b.png`,
  },
  {
    name: 'Vivanta by Taj',
    area: 'Dwarka Sector 21',
    url: 'https://www.vivantahotels.com/en-in/vivanta-new-delhi-dwarka',
    photo: `${hotelCdn}847e2583f3d7fb14d3f1c3f3948231bf89cc5c79_27ed11bd8e.png`,
  },
];
