const { escapeHtml } = require('./application-acknowledgement-email.cjs');
const { getSpeakerEdition } = require('./speaker-communications-utils.cjs');
const { COLLAB_NOTE, SOCIAL_PROFILES } = require('./speaker-badge-share.cjs');

const SPEAKER_PHOTOS_TEMPLATE_KEY = 'speaker_photos_v1';
const SPEAKER_COMMS_REPLY_TO = 'tasi.comms@csrindia.org';
const DEFAULT_SITE_URL = 'https://trustandsafetyindia.org';
const FOOTER_IMAGE_PATH = '/img/email/tasi-2026-delhi-footer.jpeg';

const LINK = 'color:#022d5d;text-decoration:underline';
const DOT = '<span style="color:#9aa0a6;padding:0 8px">&middot;</span>';
const DIVIDER =
  '<tr><td style="padding:25px 40px 0"><div style="border-top:1px solid #dadce0"></div></td></tr>';
const FOLLOW = [
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'x', label: 'X' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
];

function photosLine(count) {
  if (!count) {
    return 'We have put the photos of you from the festival in one Google Drive folder, ready to view and download.';
  }
  return `We have put ${count === 1 ? 'the photo' : `the ${count} photos`} of you from the festival in one Google Drive folder, ready to view and download.`;
}

// Body paragraphs shared by the HTML and plain-text versions.
function paragraphs(edition, photoCount) {
  return [
    `Thank you for speaking at ${edition.name}. It was a pleasure to have you with us in New Delhi.`,
    photosLine(photoCount),
  ];
}

function useNote(edition) {
  return `You are welcome to use them on your own channels. If you post, please use ${edition.hashtag} so we can find and share it.`;
}
const HELP_NOTE =
  'If the folder does not open, or you spot a photo that is not of you, just reply to this email.';

function buildSpeakerPhotosEmail({
  name,
  edition: editionKey,
  driveUrl,
  photoCount = null,
  siteUrl: rawSiteUrl,
  replyEmail = SPEAKER_COMMS_REPLY_TO,
  test = false,
}) {
  const edition = getSpeakerEdition(editionKey);
  if (!edition) throw new Error(`Edition ${editionKey} is not configured.`);
  if (!driveUrl) throw new Error('Add a Drive link for this speaker first.');
  const siteUrl = String(rawSiteUrl || DEFAULT_SITE_URL).replace(/\/+$/, '');
  const speakerName = name || 'there';
  const subject = `Your photos from ${edition.name}`;
  const intro = paragraphs(edition, photoCount);
  const safeReplyEmail = escapeHtml(replyEmail);

  const testBanner = test
    ? '<tr><td align="center" style="padding:10px 40px;background:#fef7e0;color:#7a4f01;font-size:13px;line-height:19px">Test email. This was not sent to the speaker.</td></tr>'
    : '';
  const follow = FOLLOW.map(
    ({ key, label }) =>
      `<a href="${escapeHtml(SOCIAL_PROFILES[key])}" style="color:#5f6368;text-decoration:underline">${label}</a>`
  ).join(DOT);

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#022d5d;font-family:Inter,Arial,Helvetica,sans-serif;"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px;mso-hide:all">Your photos from ${escapeHtml(edition.name)}, ready to download.</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#022d5d" style="background:#022d5d;background:linear-gradient(135deg,#022d5d 0%,#43358a 52%,#b34b5c 100%)"><tr><td align="center" style="padding:32px 12px"><table role="presentation" width="610" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:610px;background-color:#ffffff;border:1px solid #e8eaed">${testBanner}<tr><td align="center" bgcolor="#ffffff" style="padding:31px 40px 18px;background:#ffffff"><img src="cid:tasi-logo" width="194" height="54" alt="Trust &amp; Safety Festival - TASI. People First. Safety Always." style="display:block;width:194px;height:54px;border:0;outline:none;text-decoration:none" /></td></tr><tr><td align="center" style="padding:20px 40px 0;color:#3c4043;font-size:16px;line-height:25px"><p style="margin:0 0 16px">Dear ${escapeHtml(speakerName)},</p>${intro
    .map(
      (text, index) =>
        `<p style="margin:${index ? '16px' : '0'} auto 0;max-width:470px">${escapeHtml(text)}</p>`
    )
    .join(
      ''
    )}<p style="margin:24px 0 0"><a href="${escapeHtml(driveUrl)}" style="display:inline-block;padding:12px 24px;border-radius:10px;background:#022d5d;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none">View your photos</a></p></td></tr>${DIVIDER}<tr><td align="center" style="padding:20px 40px 0;color:#3c4043;font-size:15px;line-height:24px"><p style="margin:0 auto;max-width:470px">${escapeHtml(useNote(edition))}</p><p style="margin:12px auto 0;max-width:470px;font-size:13px;line-height:20px">${escapeHtml(COLLAB_NOTE)}</p></td></tr>${DIVIDER}<tr><td align="center" style="padding:20px 40px 0;color:#3c4043;font-size:16px;line-height:25px"><p style="margin:0">Thank you again for being part of ${escapeHtml(edition.name)}.</p><p style="margin:14px 0 0">With warm regards,<br /><strong style="color:#202124">Team TASI</strong></p></td></tr><tr><td align="center" style="padding:20px 40px;color:#5f6368;font-size:12px;line-height:18px"><p style="margin:0 auto 5px;max-width:470px">${escapeHtml(HELP_NOTE)} You can also write to <a href="mailto:${safeReplyEmail}" style="${LINK}">${safeReplyEmail}</a>.</p><p style="margin:0 0 5px">Follow us: ${follow}</p><p style="margin:0">${escapeHtml(edition.festivalName)} &middot; People First. Safety Always.</p></td></tr><tr><td><img src="${escapeHtml(siteUrl + FOOTER_IMAGE_PATH)}" width="610" alt="Trust and Safety India Festival - New Delhi" style="display:block;width:100%;height:auto;border:0" /></td></tr></table></td></tr></table></body></html>`;

  const text = [
    ...(test ? ['TEST EMAIL. This was not sent to the speaker.', ''] : []),
    `Dear ${speakerName},`,
    '',
    ...intro.flatMap((line) => [line, '']),
    `View your photos: ${driveUrl}`,
    '',
    useNote(edition),
    COLLAB_NOTE,
    '',
    `Thank you again for being part of ${edition.name}.`,
    '',
    'With warm regards,',
    'Team TASI',
    '',
    `${HELP_NOTE} You can also write to ${replyEmail}.`,
    '',
    `Follow us: ${FOLLOW.map(({ key, label }) => `${label} ${SOCIAL_PROFILES[key]}`).join(' | ')}`,
    '',
    edition.festivalName,
    'People First. Safety Always.',
  ].join('\n');

  return { subject: test ? `[TEST] ${subject}` : subject, text, html };
}

module.exports = {
  SPEAKER_COMMS_REPLY_TO,
  SPEAKER_PHOTOS_TEMPLATE_KEY,
  buildSpeakerPhotosEmail,
};
