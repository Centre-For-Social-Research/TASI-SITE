const { escapeHtml } = require('./application-acknowledgement-email.cjs');
const { getSpeakerEdition } = require('./speaker-communications-utils.cjs');
const { SOCIAL_PROFILES } = require('./speaker-badge-share.cjs');

const SPEAKER_PHOTOS_TEMPLATE_KEY = 'speaker_photos_v1';
const SPEAKER_COMMS_REPLY_TO = 'tasi.comms@csrindia.org';
const SPEAKER_PHOTO_CONTENT_ID = 'speaker-photo';
const DEFAULT_SITE_URL = 'https://trustandsafetyindia.org';
const FOOTER_IMAGE_PATH = '/img/email/tasi-2026-delhi-footer.jpeg';

const LINK = 'color:#022d5d;text-decoration:underline';
const DOT = '<span style="color:#9aa0a6;padding:0 8px">&middot;</span>';
const DIVIDER =
  '<tr><td class="tasi-px" style="padding:25px 40px 0"><div style="border-top:1px solid #dadce0"></div></td></tr>';
const FOLLOW = [
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'x', label: 'X' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
];
const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five'];

const PHOTOS_LINE =
  'We have gathered the photos of you from the festival in one folder, ready for you to view and download.';
const CLOSING = 'We hope to see you again at the next TASI.';

// The session line names what they spoke in: one title, two titles, or a
// count with the first title. No sessions means no line.
function sessionLine(edition, titles = []) {
  if (!titles.length) return null;
  if (titles.length === 1) {
    return {
      lead: 'A special thank you for your session, ',
      titles,
      tail: '.',
    };
  }
  if (titles.length === 2) {
    return {
      lead: 'A special thank you for your sessions, ',
      titles,
      tail: '.',
    };
  }
  return {
    lead: `A special thank you for being part of ${NUMBER_WORDS[titles.length] || titles.length} sessions at ${edition.name}, including `,
    titles: titles.slice(0, 1),
    tail: '.',
  };
}

function sessionLineText(line) {
  return `${line.lead}${line.titles.map((t) => `"${t}"`).join(' and ')}${line.tail}`;
}

function sessionLineHtml(line) {
  return `${escapeHtml(line.lead)}${line.titles
    .map((t) => `&ldquo;${escapeHtml(t)}&rdquo;`)
    .join(' and ')}${escapeHtml(line.tail)}`;
}

function festivalLine(hasSession) {
  return hasSession
    ? 'Over two days in New Delhi, more than 100 speakers from 20 countries came together to talk about keeping people safe online, and we are grateful you made the time to be part of it.'
    : 'Over two days in New Delhi, more than 100 speakers from 20 countries came together to talk about keeping people safe online. Your contribution added a great deal to those conversations, and we are grateful you made the time to be with us.';
}

const QUOTE_LEAD = 'Something you said that stayed with us';

function useNote(edition) {
  return `Feel free to download and share them, and use ${edition.hashtag} when you post.`;
}

const TAG_NOTE =
  'Please tag us so we can share your post too: Centre for Social Research India and TASI on LinkedIn, @CSR_India on X, and @csr_india on Instagram.';

function buildSpeakerPhotosEmail({
  name,
  edition: editionKey,
  driveUrl,
  sessionTitles = [],
  quote = null,
  hasPhoto = false,
  siteUrl: rawSiteUrl,
  replyEmail = SPEAKER_COMMS_REPLY_TO,
  test = false,
}) {
  const edition = getSpeakerEdition(editionKey);
  if (!edition) throw new Error(`Edition ${editionKey} is not configured.`);
  if (!driveUrl) throw new Error('Add a Drive link for this speaker first.');
  const siteUrl = String(rawSiteUrl || DEFAULT_SITE_URL).replace(/\/+$/, '');
  const speakerName = name || 'there';
  const subject = `Thank you for speaking at ${edition.name}: your photos`;
  const session = sessionLine(edition, sessionTitles);
  const safeReplyEmail = escapeHtml(replyEmail);
  const opening = `Thank you for joining us at ${edition.name} and for helping make it a resounding success.`;
  const festival = festivalLine(Boolean(session));

  const p = (html, first = false) =>
    `<p style="margin:${first ? '0' : '16px'} auto 0;max-width:470px">${html}</p>`;
  const testBanner = test
    ? '<tr><td align="center" class="tasi-px" style="padding:10px 40px;background:#fef7e0;color:#7a4f01;font-size:13px;line-height:19px">Test email. This was not sent to the speaker.</td></tr>'
    : '';
  const photoRow = hasPhoto
    ? `<tr><td align="center" class="tasi-px" style="padding:4px 40px 10px"><img src="cid:${SPEAKER_PHOTO_CONTENT_ID}" width="100%" alt="${escapeHtml(speakerName)} at ${escapeHtml(edition.name)}" style="display:block;width:100%;max-width:470px;height:auto;border:0;border-radius:10px" /></td></tr>`
    : '';
  const quoteHtml = quote
    ? `<div style="max-width:400px;margin:26px auto 4px;text-align:center"><div style="font-family:Georgia,'Times New Roman',serif;font-size:56px;line-height:40px;height:30px;color:#b34b5c">&ldquo;</div><p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:17px;line-height:27px;color:#1f2a44">${escapeHtml(quote)}</p><p style="margin:12px 0 0;font-size:11px;line-height:16px;letter-spacing:.14em;text-transform:uppercase;color:#8a8f98">${escapeHtml(QUOTE_LEAD)}</p></div>`
    : '';
  const follow = FOLLOW.map(
    ({ key, label }) =>
      `<a href="${escapeHtml(SOCIAL_PROFILES[key])}" style="color:#5f6368;text-decoration:underline">${label}</a>`
  ).join(DOT);

  const html = `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="x-apple-disable-message-reformatting" /><style>@media only screen and (max-width:620px){.tasi-outer{padding:12px 6px !important}.tasi-px{padding-left:20px !important;padding-right:20px !important}.tasi-body{font-size:17px !important;line-height:27px !important}.tasi-body p,.tasi-body div{max-width:100% !important}}</style></head><body style="margin:0;padding:0;background:#022d5d;font-family:Inter,Arial,Helvetica,sans-serif;"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px;mso-hide:all">Thank you for speaking at ${escapeHtml(edition.name)}. Your photos are ready to download.</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#022d5d" style="background:#022d5d;background:linear-gradient(135deg,#022d5d 0%,#43358a 52%,#b34b5c 100%)"><tr><td align="center" class="tasi-outer" style="padding:32px 12px"><table role="presentation" width="610" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:610px;background-color:#ffffff;border:1px solid #e8eaed">${testBanner}<tr><td align="center" bgcolor="#ffffff" class="tasi-px" style="padding:31px 40px 18px;background:#ffffff"><img src="cid:tasi-logo" width="194" height="54" alt="Trust &amp; Safety Festival - TASI. People First. Safety Always." style="display:block;width:194px;height:54px;border:0;outline:none;text-decoration:none" /></td></tr>${photoRow}<tr><td align="center" class="tasi-px tasi-body" style="padding:20px 40px 0;color:#3c4043;font-size:16px;line-height:25px"><p style="margin:0 0 16px">Dear ${escapeHtml(speakerName)},</p>${p(escapeHtml(opening), true)}${session ? p(sessionLineHtml(session)) : ''}${p(escapeHtml(festival))}${quoteHtml}${p(escapeHtml(PHOTOS_LINE))}<p style="margin:24px 0 0"><a href="${escapeHtml(driveUrl)}" style="display:inline-block;padding:12px 24px;border-radius:10px;background:#022d5d;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none">View your photos</a></p></td></tr>${DIVIDER}<tr><td align="center" class="tasi-px tasi-body" style="padding:20px 40px 0;color:#3c4043;font-size:15px;line-height:24px"><p style="margin:0 auto;max-width:470px">${escapeHtml(useNote(edition))}</p><p style="margin:12px auto 0;max-width:470px">${escapeHtml(TAG_NOTE)}</p></td></tr>${DIVIDER}<tr><td align="center" class="tasi-px tasi-body" style="padding:20px 40px 0;color:#3c4043;font-size:16px;line-height:25px"><p style="margin:0 auto;max-width:470px">${escapeHtml(CLOSING)}</p><p style="margin:14px 0 0">Warm regards,<br /><strong style="color:#202124">Team TASI</strong></p></td></tr><tr><td align="center" class="tasi-px" style="padding:20px 40px;color:#5f6368;font-size:13px;line-height:19px"><p style="margin:0 auto 5px;max-width:470px">Questions? Write to us at <a href="mailto:${safeReplyEmail}" style="${LINK}">${safeReplyEmail}</a>.</p><p style="margin:0 0 5px">Follow us: ${follow}</p><p style="margin:0">${escapeHtml(edition.festivalName)} &middot; People First. Safety Always.</p></td></tr><tr><td><img src="${escapeHtml(siteUrl + FOOTER_IMAGE_PATH)}" width="100%" alt="Trust and Safety India Festival - New Delhi" style="display:block;width:100%;height:auto;border:0" /></td></tr></table></td></tr></table></body></html>`;

  const text = [
    ...(test ? ['TEST EMAIL. This was not sent to the speaker.', ''] : []),
    `Dear ${speakerName},`,
    '',
    opening,
    '',
    ...(session ? [sessionLineText(session), ''] : []),
    festival,
    '',
    ...(quote ? [`${QUOTE_LEAD}:`, `"${quote}"`, ''] : []),
    PHOTOS_LINE,
    '',
    `View your photos: ${driveUrl}`,
    '',
    useNote(edition),
    TAG_NOTE,
    '',
    CLOSING,
    '',
    'Warm regards,',
    'Team TASI',
    '',
    `Questions? Write to us at ${replyEmail}.`,
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
  SPEAKER_PHOTO_CONTENT_ID,
  SPEAKER_PHOTOS_TEMPLATE_KEY,
  buildSpeakerPhotosEmail,
};
