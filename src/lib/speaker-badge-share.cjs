const { getSpeakerEdition } = require('./speaker-communications-utils.cjs');

// Handles from the site footer. TASI has LinkedIn pages only; elsewhere it is
// tagged through the edition hashtag.
const SOCIAL_TAGS = {
  linkedin: ['@Centre for Social Research India', '@TASI Festival'],
  x: ['@CSR_India'],
  facebook: ['@Centre for Social Research'],
  instagram: ['@csr_india'],
};

// Where speakers repost TASI updates, also from the site footer.
const SOCIAL_PROFILES = {
  linkedin:
    'https://www.linkedin.com/showcase/trust-safety/posts/?feedView=all',
  x: 'https://x.com/CSR_India',
  facebook: 'https://www.facebook.com/csrindia.org',
  instagram: 'https://www.instagram.com/csr_india/',
};

// One short line under the share icons. Only Instagram has a true
// collaborator invite; elsewhere tagging lets CSR/TASI reshare the post.
const COLLAB_NOTE =
  'Posting on Instagram? Invite @csr_india as a collaborator. On LinkedIn, tag Centre for Social Research India and TASI Festival.';

const EXTRA_HASHTAGS = ['#TrustAndSafety', '#OnlineSafety'];

function hashtags(edition) {
  return [edition.hashtag, ...EXTRA_HASHTAGS].join(' ');
}

// One caption per platform: the same message, each with that platform's
// handles, and a shorter version for X's 280-character limit.
function buildSpeakerShareCaptions({ edition: editionKey, badgePageUrl }) {
  const edition = getSpeakerEdition(editionKey);
  if (!edition) throw new Error(`Edition ${editionKey} is not configured.`);

  const long = (tags) =>
    [
      `I'm delighted to be speaking at the ${edition.festivalName} (${edition.name}), ${edition.dates} at the ${edition.venue}.`,
      '',
      'Looking forward to conversations on building safer, more trustworthy digital spaces that put people first.',
      '',
      `Thank you ${tags.join(' and ')} for having me.`,
      '',
      hashtags(edition),
    ].join('\n');

  return {
    // Shown in the email body: tags both CSR and TASI, no link.
    display: long(SOCIAL_TAGS.linkedin),
    linkedin: `${long(SOCIAL_TAGS.linkedin)}\n\n${badgePageUrl}`,
    facebook: long(SOCIAL_TAGS.facebook),
    instagram: long(SOCIAL_TAGS.instagram),
    x: [
      `Speaking at ${edition.name}, ${edition.dates}, New Delhi, on building safer digital spaces. Thank you ${SOCIAL_TAGS.x.join(' ')}!`,
      '',
      `${edition.hashtag} #TrustAndSafety`,
      badgePageUrl,
    ].join('\n'),
  };
}

// LinkedIn and X open with the caption typed in. Facebook forbids prefilled
// text, so it shares the badge page (its preview shows the badge). Instagram
// has no web share link, so it goes to the badge page's share flow.
function buildSpeakerShareLinks({ captions, badgePageUrl }) {
  return {
    linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(captions.linkedin)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(captions.x)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(badgePageUrl)}`,
    instagram: `${badgePageUrl}?share=instagram`,
  };
}

module.exports = {
  COLLAB_NOTE,
  SOCIAL_PROFILES,
  SOCIAL_TAGS,
  buildSpeakerShareCaptions,
  buildSpeakerShareLinks,
};
