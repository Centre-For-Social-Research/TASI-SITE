// Speakers for TASI 2026 sessions, keyed by programme session id.
//
// A speaker with a 2026 profile is listed by name, e.g.
//   'tasi26-25': ['Yoel Roth'],
// and the name must match the `name` in src/data/speakers-2026.json exactly;
// that is where the photo, designation and profile link come from.
//
// A speaker without a 2026 profile is listed as { name, title }. They show
// with their initial and title, and no profile link. If they spoke at
// TASI 2025, add `photo` and `profile: '2025'` to reuse that year's photo and
// link to their 2025 profile. Once they submit a 2026 profile, switch them
// to a plain name.
//
// A CI test fails on any unknown name or session id, so typos never reach
// the live site. Sessions not listed here show no speakers.

// Source: the TASI 2026 agenda sheet, 6 October. In each session the
// moderator, where there is one, is listed last.
export const sessionSpeakers2026 = {
  // Tuesday, 13 October: opening reception
  'tasi26-1': ['Dr. Ranjana Kumari', 'Jc Le Toquin', 'Caroline Humer'],
  'tasi26-49': ['Jyoti Vadehra'],
  'tasi26-2': ['Rahul Fernandes', 'Nandini Chatterjee Singh'],
  'tasi26-3': ['Kunal Majumder'],
  'tasi26-4': ['Lucy Thomas'],
  'tasi26-5': ['Triveni Acharya'],
  'tasi26-81': ['Lisa Morrison'],

  // Wednesday, 14 October: Main Hall
  'tasi26-9': ['Jyoti Vadehra', 'Caroline Humer'],
  'tasi26-10': ['Snigdha Bhardwaj'],
  'tasi26-11': [
    'Pragya Misra',
    'Snigdha Bhardwaj',
    'Nicky Jackson Colaco',
    'Akash Pugalia',
    {
      name: 'Deepak Goel',
      title:
        'Group Coordinator, Cyber Laws and Data Governance Division, Ministry of Electronics and Information Technology',
    },
    'Rohit Kumar',
    'Faye D’Souza',
  ],
  'tasi26-12': ['Rahul Fernandes', 'Nandini Chatterjee Singh'],
  'tasi26-13': ['Dr. Ranjana Kumari'],
  'tasi26-16': ['Lisa Morrison', 'Madeline Shepherd', 'Karuna Nain'],
  'tasi26-85': ['Madeline Shepherd', 'Nina Bual'],
  'tasi26-18': [
    'Uthara Ganesh',
    'Laura Higgins',
    { name: 'Mahima Kaul', title: 'Director, Global Affairs, Netflix India' },
    {
      name: 'Dr. Sanjeev Sharma',
      title:
        'Member Secretary, National Commission for Protection of Child Rights (NCPCR)',
    },
    'Lucy Thomas',
    'Barkha Dutt',
  ],
  'tasi26-23': [
    'Siddharth P',
    'Omari Rodney',
    'Keemin Ngiam',
    {
      name: 'Andras Molnar',
      title:
        'Senior Digital Policy Manager & Director of Online Safety, TUM Think Tank',
      photo: '/img/speakers/Andras Malnar.webp',
      profile: '2025',
    },
    'Kavitha Kunhi Kannan',
    {
      name: 'Kazim Rizvi',
      title: 'Founding Director, The Dialogue',
      photo: '/img/speakers/Kazim Rizvi.webp',
      profile: '2025',
    },
  ],
  'tasi26-24': ['Dr Priyanka Bhalla', 'Jyoti Vadehra'],
  'tasi26-26': ['Smriti Irani'],
  'tasi26-27': [
    'Bansuri Swaraj',
    'Dr. Ranjana Kumari',
    {
      name: 'Natasha Jog',
      title: 'Director, Public Policy, Meta India',
      photo: '/img/speakers/Natasha Jog.png',
      profile: '2025',
    },
    {
      name: 'Manish Tiwari',
      title: 'Director, Institute for Governance, Policies & Politics (IGPP)',
    },
  ],
  'tasi26-82': [
    'Yoel Roth',
    'Jyoti Vadehra',
    { name: 'Kevin Lee', title: 'CEO, Yuvaa' },
  ],
  'tasi26-29': ['S. Krishnan'],
  'tasi26-51': ['Himadri Sarkar'],

  // Wednesday, 14 October: Workshop Room
  'tasi26-84': ['Abhilash Mallick'],
  'tasi26-53': [
    {
      name: 'Tarunima Prabhakar',
      title: 'Founder and Research Lead, Tattle Civic Tech',
    },
    { name: 'Poorvi Gupta', title: 'Tattle Civic Tech' },
  ],
  'tasi26-55': ['Divya Chandra'],
  'tasi26-59': ['Rahul Fernandes'],

  // Thursday, 15 October: Main Hall
  'tasi26-33': ['Marisa Gerards'],
  'tasi26-34': [
    'Apar Gupta',
    'Kunal Majumder',
    'Dhara Mungra',
    { name: 'Jency Jacob', title: 'Managing Editor, BOOM' },
    'Suhasini Haidar',
    'Vedanta Agarwal',
    {
      name: 'Sonia Bhaskar',
      title: 'Senior Programme Coordinator, Centre for Social Research',
    },
  ],
  'tasi26-62': [
    'Adam Seldow',
    {
      name: 'Vivek Abraham',
      title: 'Managing Principal, Technology Strategy, The Asia Group',
    },
  ],
  'tasi26-40': [
    'Uma Subramanian',
    'Sophie Mortimer',
    'Ji-yeon Lee',
    {
      name: 'Vijaya Rahatkar',
      title: 'Chairperson, National Commission for Women',
    },
    {
      name: 'Natasha Jog',
      title: 'Public Policy Director, Meta',
      photo: '/img/speakers/Natasha Jog.png',
      profile: '2025',
    },
  ],
  'tasi26-46': [
    'Basarbatu Can',
    'Sophia Wanjiru',
    'Triveni Acharya',
    'Hasina Kharbhih',
    'Aishwarya Dongre',
    'Smita Mitra',
  ],
  'tasi26-66': ['Rohit Kumar'],
  'tasi26-67': [
    {
      name: 'Shikha Dahiya',
      title:
        'Joint Director, Ministry of Electronics and Information Technology, Government of India',
    },
    { name: 'Amlan Mohanty', title: 'Head of Policy, India, Anthropic' },
    'Rob Lewington',
    {
      name: 'Manisha Kapoor',
      title:
        'CEO & Secretary General, The Advertising Standards Council of India',
      photo: '/img/speakers/Manisha Kapoor.png',
      profile: '2025',
    },
    {
      name: 'Rajesh Ranjan',
      title: 'Head of Government Affairs and Public Policy, Google',
      photo: '/img/speakers/Rajesh Ranjan.webp',
      profile: '2025',
    },
    { name: 'Nandagopal Rajan', title: 'CEO, Indian Express Digital' },
  ],

  // Thursday, 15 October: Workshop and Roundtable Rooms
  'tasi26-70': ['Madelaine Coelho'],
  'tasi26-71': [
    'Akash Pugalia',
    { name: 'Dhruv Khosla', title: 'Everest Group' },
  ],
  'tasi26-72': ['Manoj Shakya'],
  'tasi26-73': ['Ashwini Natesan'],
  'tasi26-75': ['Caroline Simangaliso Makumbe'],
  'tasi26-76': ['Dr Abigail Bentley'],
  'tasi26-78': ['M. C. Rasmin'],
};
