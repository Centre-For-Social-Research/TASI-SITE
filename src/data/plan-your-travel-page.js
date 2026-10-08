// Travel information for TASI 2026 at the India International Centre (IIC),
// New Delhi. Venue facts were checked on 9 October 2026; distances and
// travel times are approximate and depend on Delhi traffic.

export const TRAVEL_CONTACT_EMAIL = 'india@trustandsafetyfestival.com';

export const travelVenue = {
  name: 'India International Centre (IIC)',
  address: '40, Max Mueller Marg, Lodhi Estate, New Delhi 110003',
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=India+International+Centre+New+Delhi',
  taxiTip:
    'Ask the driver for India International Centre on Lodhi Road. Most drivers know it as IIC, Lodhi Estate.',
};

export const travelShellCopy = {
  eyebrow: 'TASI 2026 · New Delhi',
  title: 'Plan Your Travel',
  description:
    'TASI 2026 is at the India International Centre, Lodhi Estate, New Delhi, on 14-15 October. Here is how to get there, where to stay and what to bring.',
};

export const travelTabs = [
  { label: 'Overview', href: '/plan-your-travel' },
  { label: 'General Info', href: '/plan-your-travel/general-info' },
  { label: 'How to Reach', href: '/plan-your-travel/how-to-reach' },
  { label: 'Visa Information', href: '/plan-your-travel/visa-information' },
  { label: 'Accommodation', href: '/plan-your-travel/accommodation' },
];

export const travelOverviewMetadata = {
  title: 'Plan Travel for Trust and Safety India Festival | TASI 2026',
  description:
    'Getting to TASI 2026 at the India International Centre, New Delhi: directions, metro, hotels nearby, visas and practical tips for 14-15 October.',
  alternates: {
    canonical: '/plan-your-travel',
  },
};

export const generalInfoMetadata = {
  title: 'General Information for TASI 2026 Travel | New Delhi',
  description:
    'Weather, dress code, money, phones and emergency numbers for Trust and Safety India Festival participants in New Delhi.',
  alternates: {
    canonical: '/plan-your-travel/general-info',
  },
};

export const howToReachMetadata = {
  title: 'How to Reach Trust and Safety India Festival | TASI Venue Travel',
  description:
    'How to reach the India International Centre, Lodhi Estate, for TASI 2026: from the airport, railway stations and metro, plus places nearby.',
  alternates: {
    canonical: '/plan-your-travel/how-to-reach',
  },
};

export const visaInformationMetadata = {
  title: 'Visa Information for Trust and Safety India Festival | TASI 2026',
  description:
    'Visa and passport guidance for international participants at TASI 2026 in New Delhi, and how to request an invitation letter.',
  alternates: {
    canonical: '/plan-your-travel/visa-information',
  },
};

export const accommodationMetadata = {
  title: 'Accommodation for Trust and Safety India Festival | TASI Hotels',
  description:
    'Hotels in central New Delhi close to the Trust and Safety India Festival venue, the India International Centre.',
  alternates: {
    canonical: '/plan-your-travel/accommodation',
  },
};

export const hotels = [
  {
    name: 'The Lodhi',
    area: 'Lodhi Road',
    url: 'https://www.thelodhi.com',
    photo: '/img/travel/hotels/the-lodhi.webp',
  },
  {
    name: 'The Oberoi, New Delhi',
    area: 'Dr Zakir Hussain Marg',
    url: 'https://www.oberoihotels.com/hotels-in-delhi/',
    photo: '/img/travel/hotels/the-oberoi.webp',
  },
  {
    name: 'Taj Mahal Hotel',
    area: 'Mansingh Road',
    url: 'https://www.tajhotels.com/en-in/taj/taj-mahal-new-delhi',
    photo: '/img/travel/hotels/taj-mahal-hotel.webp',
  },
  {
    name: 'The Claridges',
    area: 'APJ Abdul Kalam Road',
    url: 'https://www.claridges.com',
    photo: '/img/travel/hotels/the-claridges.webp',
  },
  {
    name: 'Le Méridien New Delhi',
    area: 'Windsor Place',
    url: 'https://www.marriott.com/en-us/hotels/delmd-le-meridien-new-delhi',
    photo: '/img/travel/hotels/le-meridien.webp',
  },
  {
    name: 'The Imperial',
    area: 'Janpath',
    url: 'https://theimperialindia.com',
    photo: '/img/travel/hotels/the-imperial.webp',
  },
  {
    name: 'The Lalit New Delhi',
    area: 'Barakhamba Avenue, Connaught Place',
    url: 'https://www.thelalit.com/the-lalit-new-delhi',
    photo: '/img/travel/hotels/the-lalit.webp',
  },
  {
    name: 'ITC Maurya',
    area: 'Sardar Patel Marg, Chanakyapuri',
    url: 'https://www.itchotels.com/in/en/itcmaurya-new-delhi',
    photo: '/img/travel/hotels/itc-maurya.webp',
  },
  {
    name: 'Taj Palace',
    area: 'Sardar Patel Marg, Chanakyapuri',
    url: 'https://www.tajhotels.com/en-in/taj/taj-palace-new-delhi',
    photo: '/img/travel/hotels/taj-palace.webp',
  },
  {
    name: 'The Ashok',
    area: 'Niti Marg, Chanakyapuri',
    url: 'http://www.theashokhotel.com',
    photo: '/img/travel/hotels/the-ashok.webp',
  },
  {
    name: 'Hyatt Regency Delhi',
    area: 'Bhikaji Cama Place',
    url: 'https://www.hyatt.com/hyatt-regency/en-US/delrd-hyatt-regency-delhi',
    photo: '/img/travel/hotels/hyatt-regency-delhi.webp',
  },
];

export const travelOverviewSections = [
  {
    icon: 'Globe',
    title: 'General Information',
    description:
      'Weather, dress code, money, phones and what to do in an emergency.',
    href: '/plan-your-travel/general-info',
    pills: ['Business formal', 'About 20-33°C', '112 for emergencies'],
  },
  {
    icon: 'MapPin',
    title: 'How to Reach',
    description:
      'Getting to IIC from the airport, the railway stations and the metro, and what is nearby.',
    href: '/plan-your-travel/how-to-reach',
    pills: ['Jor Bagh metro', 'Khan Market metro', 'Lodhi Estate'],
  },
  {
    icon: 'Shield',
    title: 'Visa Information',
    description:
      'Checking which visa you need, invitation letters from TASI and passport rules.',
    href: '/plan-your-travel/visa-information',
    pills: ['Invitation letters on request', 'Apply early'],
  },
  {
    icon: 'Hotel',
    title: 'Accommodation',
    description:
      'Hotels in central Delhi, close to IIC. Book directly with the hotel.',
    href: '/plan-your-travel/accommodation',
    pills: [`${hotels.length} hotels`, 'Central Delhi'],
  },
];

export const travelQuickFacts = [
  { icon: 'MapPin', label: 'Venue', value: 'IIC, Lodhi Estate' },
  { icon: 'Calendar', label: 'Dates', value: '14-15 October' },
  { icon: 'Clock', label: 'Check-in', value: 'From 9:00 AM' },
  { icon: 'Train', label: 'Nearest metro', value: 'Jor Bagh, Khan Market' },
];

// One brand style for every card, so the section reads as one page.
export const travelCardStyle = {
  accent: 'bg-[#350265]',
  border: 'border-[#350265]/15 dark:border-stone-700',
  bg: 'bg-white dark:bg-stone-900',
  iconBg: 'bg-[#350265]/10 dark:bg-[#ffd919]/10',
  iconText: 'text-[#350265] dark:text-[#ffd919]',
  pillBg: 'bg-[#ffd919]/40 dark:bg-[#ffd919]/15',
  pillText: 'text-[#350265] dark:text-[#ffd919]',
  ctaText:
    'text-[#350265] hover:text-[#55089e] dark:text-[#ffd919] dark:hover:text-white',
};

export const generalQuickStats = [
  { label: 'Time zone', value: 'IST, GMT +5:30' },
  { label: 'Currency', value: 'Indian Rupee (INR)' },
  { label: 'Weather', value: 'About 20-33°C' },
  { label: 'Power', value: '230V, plugs C/D/M' },
  { label: 'Country code', value: '+91' },
  { label: 'Emergency', value: '112' },
];

export const generalInfoItems = [
  {
    icon: 'Shirt',
    title: 'Weather and what to wear',
    body: 'Mid-October in Delhi is warm during the day, around 30-33°C, and cooler in the evening, around 20°C. The dress code for the festival is business formal. Bring a light layer for the evenings.',
  },
  {
    icon: 'Wind',
    title: 'Air quality',
    body: 'Air quality in Delhi is good at the moment. It often gets worse from mid-November, so if you have asthma or are sensitive to pollution, carry a mask and any medication you need.',
  },
  {
    icon: 'Droplets',
    title: 'Drinking water',
    body: 'Drink sealed bottled water or filtered water only.',
  },
  {
    icon: 'Zap',
    title: 'Power and plugs',
    body: 'India uses 230V, with plug types C, D and M. Bring a universal adapter for your phone and laptop.',
  },
  {
    icon: 'Phone',
    title: 'Phones',
    body: "India's country code is +91 and Delhi's area code is 11. To call a Delhi landline from abroad, dial +91 11 and then the number. For an Indian mobile, dial +91 and the 10-digit number.",
  },
  {
    icon: 'Banknote',
    title: 'Money',
    body: 'The currency is the Indian Rupee (INR). ATMs are easy to find, and cards work in hotels, restaurants and most shops. Keep some cash for autos and small purchases.',
  },
  {
    icon: 'AlertTriangle',
    title: 'Emergencies',
    body: 'Call 112 for police, fire or ambulance anywhere in India. At the festival, find the TASI team at the registration desk.',
  },
  {
    icon: 'Camera',
    title: 'Photography',
    body: 'The festival will be photographed and filmed by official photographers. Photos and videos will be shared on the TASI website after the event.',
  },
];

export const airports = [
  {
    code: 'DEL',
    name: 'Indira Gandhi International Airport',
    terminal: 'Terminal 3: international and some domestic flights',
    distance: 'About 17 km, 45-60 minutes by car',
  },
  {
    code: 'DEL',
    name: 'Indira Gandhi International Airport',
    terminal: 'Terminals 1 and 2: domestic flights',
    distance: 'About 17 km, 45-60 minutes by car',
  },
];

export const railwayStations = [
  {
    name: 'Hazrat Nizamuddin',
    distance: 'About 5 km',
    note: '15-20 minutes by car',
  },
  {
    name: 'New Delhi',
    distance: 'About 8 km',
    note: '25-30 minutes by car',
  },
  {
    name: 'Old Delhi',
    distance: 'About 11 km',
    note: '35-45 minutes by car',
  },
];

export const metroStations = [
  {
    name: 'Jor Bagh',
    line: 'Yellow Line',
    note: 'About a 20-minute walk, or a short auto ride. From the airport, take the Airport Express Line to New Delhi and change to the Yellow Line towards Millennium City Centre Gurugram.',
  },
  {
    name: 'Khan Market',
    line: 'Violet Line',
    note: 'About a 20-minute walk, or a short auto ride.',
  },
];

export const localTransport = [
  'Prepaid taxi counters are in the arrivals area at IGI Airport.',
  'Uber and Ola work across Delhi, and are the easiest way to get to IIC from a hotel.',
  'Autos are fine for short trips. Agree the fare before you set off, or book one through Uber or Ola.',
];

export const nearbyPlaces = [
  {
    name: 'Lodhi Garden',
    distance: 'Next to IIC',
    note: 'A large park with 15th-century tombs. Good for a walk at lunch.',
  },
  {
    name: 'Khan Market',
    distance: 'About 1.5 km',
    note: 'Cafés, restaurants and bookshops.',
  },
  {
    name: "Safdarjung's Tomb",
    distance: 'About 2 km',
    note: 'An 18th-century garden tomb.',
  },
  {
    name: "Humayun's Tomb",
    distance: 'About 3 km',
    note: 'A UNESCO World Heritage Site.',
  },
  {
    name: 'India Gate',
    distance: 'About 4 km',
    note: 'The war memorial on Kartavya Path.',
  },
];

export const visaSteps = [
  {
    icon: 'Globe',
    title: 'Check which visa you need',
    description:
      'Most international visitors need a visa for India, and the rules depend on your nationality and why you are travelling. Check the official Indian visa portal and apply only through government websites. Processing can take several working days, so apply as early as you can.',
    cta: {
      label: 'Indian visa portal',
      href: 'https://indianvisaonline.gov.in/',
    },
  },
  {
    icon: 'FileText',
    title: 'Invitation letter from TASI',
    description:
      'If your visa application needs an invitation letter, email us your full name as it appears on your passport, your nationality, passport number and organisation. We will send the letter by email.',
    cta: {
      label: 'Request a letter',
      href: `mailto:${TRAVEL_CONTACT_EMAIL}?subject=TASI%202026%20invitation%20letter`,
    },
  },
  {
    icon: 'CreditCard',
    title: 'Passport',
    description:
      'Your passport should be valid for at least six months from the day you arrive in India, with at least two blank pages.',
    cta: null,
  },
];
