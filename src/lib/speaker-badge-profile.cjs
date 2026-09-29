const speakers2026 = require('../data/speakers-2026.json');
const { buildSpeakerSlug } = require('./speaker-directory-utils.cjs');
const { buildSpeakerNameKey } = require('./speaker-communications-utils.cjs');

// Public speaker directories by edition. A badge speaker gets a profile link
// only when the directory lists them, matched the same way as badge files.
const DIRECTORIES = { 2026: speakers2026 };

// Badge name → directory name, where the two are spelled differently.
const DIRECTORY_ALIASES = {
  2026: {
    'caroline-makumbe': 'Caroline Simangaliso Makumbe',
    'madeline-coelho': 'Madelaine Coelho',
    'siddharth-pillai': 'Siddharth P',
  },
};

function findSpeakerProfilePath({ name, edition }) {
  const directory = DIRECTORIES[String(edition || '')] || [];
  const nameKey = buildSpeakerNameKey(name);
  const alias = DIRECTORY_ALIASES[String(edition || '')]?.[nameKey];
  const key = alias ? buildSpeakerNameKey(alias) : nameKey;
  const speaker = key
    ? directory.find((entry) => buildSpeakerNameKey(entry.name) === key)
    : null;
  return speaker
    ? `/speakers/${edition}/${buildSpeakerSlug(speaker.name)}`
    : null;
}

module.exports = { findSpeakerProfilePath };
