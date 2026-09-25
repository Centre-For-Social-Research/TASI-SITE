// Focal points keep faces visible in the existing circular cards and profiles.
const photoPositions = {
  'barkha-dutt': '95% 0%',
  'basarbatu-can': '50% 25%',
  'dr-abigail-bentley': '62% 0%',
  'hasina-kharbhih': '0% 0%',
  'jc-le-toquin': '38% 0%',
  'kunal-majumder': '25% 0%',
  'siddharth-p': '35% 0%',
};

const avatarAdjustments = {
  'aishwarya-dongre': { transform: 'scale(1.35)', transformOrigin: '50% 0%' },
  'barkha-dutt': { transform: 'scale(1.35)', transformOrigin: '50% 0%' },
  'dr-ranjana-kumari': { transform: 'scale(2.4)', transformOrigin: '50% 0%' },
  'hasina-kharbhih': { transform: 'scale(1.2)', transformOrigin: '50% 0%' },
  'lisa-morrison': { transform: 'scale(1.6)', transformOrigin: '50% 0%' },
  'snigdha-bhardwaj': { transform: 'scale(1.5)', transformOrigin: '50% 0%' },
  'uthara-ganesh': {
    transform: 'translateX(-12%) scale(2.5)',
    transformOrigin: '50% 0%',
  },
  'yoel-roth': { transform: 'scale(1.25)', transformOrigin: '50% 0%' },
};

export function getSpeakerPhotoPosition(slug) {
  return photoPositions[slug] || '50% 0%';
}

export function getSpeakerAvatarStyle(slug) {
  return {
    objectPosition: getSpeakerPhotoPosition(slug),
    ...avatarAdjustments[slug],
  };
}
