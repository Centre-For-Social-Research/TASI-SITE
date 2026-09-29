const speakers2026 = require('../data/speakers-2026.json');
const { buildSpeakerSlug } = require('./speaker-directory-utils.cjs');
const { buildSpeakerNameKey } = require('./speaker-communications-utils.cjs');

// Public speaker directories by edition. A badge speaker gets a profile link
// only when the directory lists them, matched the same way as badge files.
const DIRECTORIES = { 2026: speakers2026 };

function findSpeakerProfilePath({ name, edition }) {
  const directory = DIRECTORIES[String(edition || '')] || [];
  const key = buildSpeakerNameKey(name);
  const speaker = key
    ? directory.find((entry) => buildSpeakerNameKey(entry.name) === key)
    : null;
  return speaker
    ? `/speakers/${edition}/${buildSpeakerSlug(speaker.name)}`
    : null;
}

module.exports = { findSpeakerProfilePath };
