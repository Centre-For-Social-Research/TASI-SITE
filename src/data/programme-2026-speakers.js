// Confirmed speakers for TASI 2026 sessions, keyed by programme session id.
//
// Add a session's speakers here once they are confirmed, e.g.
//   'tasi26-25': ['Yoel Roth', 'Kevin Lee'],
//
// Names must match the `name` in src/data/speakers-2026.json exactly; that is
// where the photo, designation and profile link come from. A CI test fails on
// any unknown name or session id, so typos never reach the live site.
// Sessions not listed here show no speakers.

// Source: the TASI 2026 agenda sheet, 6 October. Only people with a
// published 2026 profile are listed; speakers marked invited or tentative
// in the agenda are left out until they confirm.
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
    'Rohit Kumar',
    'Faye D’Souza',
  ],
  'tasi26-12': ['Rahul Fernandes', 'Nandini Chatterjee Singh'],
  'tasi26-13': ['Dr. Ranjana Kumari'],
  'tasi26-16': ['Lisa Morrison', 'Madeline Shepherd', 'Karuna Nain'],
  'tasi26-18': ['Uthara Ganesh', 'Laura Higgins', 'Lucy Thomas', 'Barkha Dutt'],
  'tasi26-23': ['Siddharth P', 'Omari Rodney', 'Keemin Ngiam'],
  'tasi26-24': ['Dr Priyanka Bhalla', 'Jyoti Vadehra'],
  'tasi26-26': ['Smriti Irani'],
  'tasi26-27': ['Bansuri Swaraj', 'Dr. Ranjana Kumari'],
  'tasi26-82': ['Yoel Roth', 'Jyoti Vadehra'],
  'tasi26-51': ['Himadri Sarkar'],

  // Wednesday, 14 October: Workshop Room
  'tasi26-59': ['Rahul Fernandes'],

  // Thursday, 15 October: Main Hall
  'tasi26-34': [
    'Apar Gupta',
    'Beh Lih Yi',
    'Dhara Mungra',
    'Suhasini Haidar',
    'Vedanta Agarwal',
  ],
  'tasi26-62': ['Adam Seldow'],
  'tasi26-40': ['Uma Subramanian', 'Sophie Mortimer', 'Ji-yeon Lee'],
  'tasi26-46': [
    'Basarbatu Can',
    'Sophia Wanjiru',
    'Triveni Acharya',
    'Hasina Kharbhih',
    'Aishwarya Dongre',
    'Smita Mitra',
  ],
  'tasi26-67': ['Rob Lewington'],

  // Thursday, 15 October: Workshop and Roundtable Rooms
  'tasi26-70': ['Madelaine Coelho'],
  'tasi26-72': ['Manoj Shakya'],
  'tasi26-73': ['Ashwini Natesan'],
  'tasi26-75': ['Caroline Simangaliso Makumbe'],
  'tasi26-76': ['Dr Abigail Bentley'],
  'tasi26-78': ['M. C. Rasmin'],
};
