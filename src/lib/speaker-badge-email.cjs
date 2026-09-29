const { escapeHtml } = require('./application-acknowledgement-email.cjs');
const { getSpeakerEdition } = require('./speaker-communications-utils.cjs');
const {
  COLLAB_NOTE,
  SOCIAL_PROFILES,
  buildSpeakerShareCaptions,
  buildSpeakerShareLinks,
} = require('./speaker-badge-share.cjs');

const SPEAKER_BADGE_TEMPLATE_KEY = 'speaker_badge_v1';
const SPEAKER_COMMS_REPLY_TO = 'tasi.comms@csrindia.org';
const SPEAKER_BADGE_CONTENT_ID = 'speaker-badge';
const DEFAULT_SITE_URL = 'https://trustandsafetyindia.org';
const FOOTER_IMAGE_PATH = '/img/email/tasi-2026-delhi-footer.jpeg';

// Brand icons are embedded (cid) PNGs from public/img/email/social, since
// most mail clients do not render SVG.
const SOCIAL_PLATFORMS = [
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'x', label: 'X' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
];
const SOCIAL_ICON_FILES = SOCIAL_PLATFORMS.map(({ key }) => ({
  key,
  filename: `${key}.png`,
  contentId: `social-${key}`,
}));

const NAVY = '#022d5d';
const INK = '#1f2937';
const BODY = '#4b5563';
const MUTED = '#6b7280';
const ACCENT = '#43358a';
const LINK = `color:${NAVY};text-decoration:underline;text-underline-offset:2px`;
const EYEBROW = `margin:0;color:${MUTED};font-size:11px;line-height:16px;font-weight:600;letter-spacing:.14em;text-transform:uppercase`;

function normalizeSiteUrl(siteUrl) {
  return String(siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, '');
}

function buildSpeakerBadgePageUrl({ siteUrl, token }) {
  return `${normalizeSiteUrl(siteUrl)}/badge/${encodeURIComponent(token)}`;
}

function buildSpeakerBadgeDownloadUrl({ siteUrl, token }) {
  return `${buildSpeakerBadgePageUrl({ siteUrl, token })}/image?download=1`;
}

function buildCalendarLinks(edition) {
  const { startDate, endDate, startLocal, endLocal } = edition.calendar;
  const title = encodeURIComponent(edition.name);
  const location = encodeURIComponent(edition.venue);
  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}%2F${endDate}&location=${location}`,
    outlook: `https://outlook.office.com/calendar/0/deeplink/compose?subject=${title}&startdt=${encodeURIComponent(startLocal)}&enddt=${encodeURIComponent(endLocal)}&location=${location}`,
  };
}

function buildSpeakerCalendarIcs(edition) {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//Trust and Safety India Festival//${edition.name}//EN`,
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:tasi-${edition.edition}-speaker@trustandsafetyindia.org`,
    `DTSTAMP:${edition.calendar.startDate}T000000Z`,
    `DTSTART;VALUE=DATE:${edition.calendar.startDate}`,
    `DTEND;VALUE=DATE:${edition.calendar.endDate}`,
    `SUMMARY:${edition.name} - Speaking at the ${edition.festivalName}`,
    `LOCATION:${edition.venue.replace(/,/g, '\\,')}`,
    `DESCRIPTION:${edition.festivalName}.`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

function introText(edition) {
  return `We are delighted to have you with us at the ${edition.festivalName} and look forward to your contribution. Your speaker badge is ready below.`;
}

function repostText(edition) {
  return `Help build the buzz around ${edition.name} by reposting our latest updates on`;
}

// Line breaks as <br>, since some clients drop white-space: pre-line.
function captionHtml(caption) {
  return escapeHtml(caption).split('\n').join('<br />');
}

function renderIconRow(links) {
  const cells = SOCIAL_PLATFORMS.map(
    ({ key, label }) =>
      `<td style="padding:0 9px"><a href="${escapeHtml(links[key])}" title="Share on ${label}" style="text-decoration:none"><img src="cid:social-${key}" width="40" height="40" alt="${label}" style="display:block;width:40px;height:40px;border:0" /></a></td>`
  ).join('');
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto"><tr>${cells}</tr></table>`;
}

function renderRepostLinks() {
  const links = SOCIAL_PLATFORMS.map(
    ({ key, label }) =>
      `<a href="${escapeHtml(SOCIAL_PROFILES[key])}" style="${LINK}">${label}</a>`
  );
  return `${links.slice(0, -1).join(', ')} and ${links.at(-1)}`;
}

function renderSpeakerBadgeHtml({
  name,
  edition,
  siteUrl,
  pageUrl,
  downloadUrl,
  captions,
  links,
  replyEmail,
  test,
}) {
  const safeReplyEmail = escapeHtml(replyEmail);
  const calendar = buildCalendarLinks(edition);
  const programmeUrl = `${siteUrl}/programme`;
  const speakersUrl = speakersPath(siteUrl, edition);
  const footerImageUrl = `${siteUrl}${FOOTER_IMAGE_PATH}`;
  const testBanner = test
    ? `<tr><td align="center" style="padding:10px 48px;background:#fef7e0;color:#7a4f01;font-size:12px;line-height:18px">Test email. This was not sent to the speaker.</td></tr>`
    : '';

  return `<!doctype html><html><head><meta name="color-scheme" content="light" /><meta name="supported-color-schemes" content="light" /></head><body style="margin:0;padding:0;background:${NAVY};font-family:Inter,'Segoe UI',Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px;mso-hide:all">Thank you for confirming as a speaker. Your ${escapeHtml(edition.name)} badge is ready to share.</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${NAVY}" style="background:${NAVY};background:linear-gradient(135deg,#022d5d 0%,#43358a 52%,#b34b5c 100%)"><tr><td align="center" style="padding:40px 12px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden">${testBanner}

<tr><td align="center" style="padding:36px 48px 0"><img src="cid:tasi-logo" width="176" height="49" alt="Trust &amp; Safety Festival - TASI. People First. Safety Always." style="display:block;width:176px;height:49px;border:0" /></td></tr>

<tr><td align="center" style="padding:36px 48px 0"><p style="${EYEBROW};color:${ACCENT}">Speaker &middot; ${escapeHtml(edition.name)}</p><h1 style="margin:10px 0 0;color:${INK};font-size:26px;line-height:34px;font-weight:700;letter-spacing:-.01em">Thank you for confirming as a speaker</h1><p style="margin:18px 0 0;color:${BODY};font-size:15px;line-height:25px">Dear ${escapeHtml(name)},</p><p style="margin:8px auto 0;max-width:460px;color:${BODY};font-size:15px;line-height:25px">${escapeHtml(introText(edition))}</p></td></tr>

<tr><td style="padding:32px 48px 0"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f6fa;border-radius:10px"><tr><td align="center" style="padding:32px 24px"><img src="cid:${SPEAKER_BADGE_CONTENT_ID}" width="260" alt="${escapeHtml(name)}, speaker at ${escapeHtml(edition.name)}" style="display:block;width:260px;max-width:100%;height:auto;border:0;border-radius:10px" /><table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px auto 0"><tr><td style="border-radius:10px;background:${NAVY}"><a href="${escapeHtml(downloadUrl)}" style="display:inline-block;padding:12px 26px;color:#ffffff;font-size:14px;line-height:20px;font-weight:600;text-decoration:none;letter-spacing:.01em">Download your badge</a></td></tr></table></td></tr></table></td></tr>

<tr><td align="center" style="padding:40px 48px 0"><p style="${EYEBROW}">Share your badge</p><p style="margin:10px auto 0;max-width:440px;color:${BODY};font-size:15px;line-height:24px">Tap an icon to post. Your caption is ready to go.</p></td></tr>

<tr><td style="padding:20px 48px 0"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td style="padding:18px 20px;border-left:3px solid ${ACCENT};background:#fafafb;border-radius:0 10px 10px 0;color:${INK};font-size:14px;line-height:22px">${captionHtml(captions.display)}</td></tr></table></td></tr>

<tr><td align="center" style="padding:24px 48px 0">${renderIconRow(links)}</td></tr>

<tr><td align="center" style="padding:18px 48px 0"><p style="margin:0 auto;max-width:440px;color:${MUTED};font-size:13px;line-height:21px">${escapeHtml(COLLAB_NOTE)}</p><p style="margin:10px auto 0;max-width:440px;color:${MUTED};font-size:13px;line-height:21px">${repostText(edition)} ${renderRepostLinks()}.</p></td></tr>

<tr><td style="padding:40px 48px 0"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e5e7eb;border-radius:10px"><tr><td width="50%" valign="top" style="padding:20px 22px"><p style="${EYEBROW}">When</p><p style="margin:6px 0 0;color:${INK};font-size:15px;line-height:22px;font-weight:600">${escapeHtml(edition.dates)}</p><p style="margin:6px 0 0;font-size:13px;line-height:20px"><a href="${escapeHtml(calendar.google)}" style="${LINK}">Google</a><span style="color:#9ca3af"> &middot; </span><a href="${escapeHtml(calendar.outlook)}" style="${LINK}">Outlook</a><span style="color:#9ca3af"> &middot; </span><span style="color:${MUTED}">.ics attached</span></p></td><td width="50%" valign="top" style="padding:20px 22px;border-left:1px solid #e5e7eb"><p style="${EYEBROW}">Where</p><p style="margin:6px 0 0;color:${INK};font-size:15px;line-height:22px;font-weight:600">${escapeHtml(edition.venue)}</p><p style="margin:6px 0 0;font-size:13px;line-height:20px"><a href="${escapeHtml(edition.venueMapUrl)}" style="${LINK}">Venue map</a></p></td></tr><tr><td colspan="2" align="center" style="padding:14px 22px;border-top:1px solid #e5e7eb;font-size:13px;line-height:20px"><a href="${escapeHtml(programmeUrl)}" style="${LINK}">Programme &amp; agenda</a><span style="color:#9ca3af"> &middot; </span><a href="${escapeHtml(speakersUrl)}" style="${LINK}">Speakers</a><span style="color:#9ca3af"> &middot; </span><a href="${escapeHtml(pageUrl)}" style="${LINK}">Your badge page</a></td></tr></table></td></tr>

<tr><td align="center" style="padding:40px 48px 0;color:${BODY};font-size:15px;line-height:25px"><p style="margin:0">We look forward to welcoming you in New Delhi.</p><p style="margin:16px 0 0">Warm regards,<br /><strong style="color:${INK}">Team TASI</strong></p></td></tr>

<tr><td align="center" style="padding:32px 48px 28px;color:${MUTED};font-size:12px;line-height:19px"><p style="margin:0">Questions or corrections? Reply to this email or write to <a href="mailto:${safeReplyEmail}" style="${LINK}">${safeReplyEmail}</a>.</p><p style="margin:4px 0 0">${escapeHtml(edition.festivalName)} &middot; People First. Safety Always.</p></td></tr>

<tr><td style="line-height:0;font-size:0"><img src="${escapeHtml(footerImageUrl)}" width="600" alt="Trust and Safety India Festival - New Delhi" style="display:block;width:100%;height:auto;border:0" /></td></tr>

</table></td></tr></table></body></html>`.replace(/\n\n/g, '');
}

function buildSpeakerBadgeEmail({
  name,
  edition: editionKey,
  siteUrl: rawSiteUrl,
  token,
  replyEmail = SPEAKER_COMMS_REPLY_TO,
  test = false,
}) {
  const edition = getSpeakerEdition(editionKey);
  if (!edition) throw new Error(`Edition ${editionKey} is not configured.`);
  const siteUrl = normalizeSiteUrl(rawSiteUrl);
  const speakerName = name || 'there';
  const pageUrl = buildSpeakerBadgePageUrl({ siteUrl, token });
  const downloadUrl = buildSpeakerBadgeDownloadUrl({ siteUrl, token });
  const captions = buildSpeakerShareCaptions({
    edition: edition.edition,
    badgePageUrl: pageUrl,
  });
  const links = buildSpeakerShareLinks({ captions, badgePageUrl: pageUrl });
  const calendar = buildCalendarLinks(edition);
  const subject = `Your speaker badge for ${edition.name}`;

  return {
    subject: test ? `[TEST] ${subject}` : subject,
    text: [
      ...(test ? ['TEST EMAIL. This was not sent to the speaker.', ''] : []),
      `Dear ${speakerName},`,
      '',
      `Thank you for confirming as a speaker for ${edition.name}. ${introText(edition)}`,
      '',
      `Download your badge: ${downloadUrl}`,
      '',
      'Share your badge',
      '',
      captions.display,
      '',
      `LinkedIn: ${links.linkedin}`,
      `X: ${links.x}`,
      `Facebook: ${links.facebook}`,
      `Instagram: ${links.instagram}`,
      '',
      COLLAB_NOTE,
      `${repostText(edition)}:`,
      ...SOCIAL_PLATFORMS.map(
        ({ key, label }) => `${label}: ${SOCIAL_PROFILES[key]}`
      ),
      '',
      `When: ${edition.dates}`,
      `Where: ${edition.venue} (${edition.venueMapUrl})`,
      `Google Calendar: ${calendar.google}`,
      `Outlook Calendar: ${calendar.outlook}`,
      'An .ics calendar file is attached.',
      `Programme & agenda: ${siteUrl}/programme`,
      `Speakers: ${speakersPath(siteUrl, edition)}`,
      `Your badge page: ${pageUrl}`,
      '',
      'We look forward to welcoming you in New Delhi.',
      '',
      'Warm regards,',
      'Team TASI',
      '',
      `Questions or corrections? Reply to this email or write to ${replyEmail}.`,
      '',
      edition.festivalName,
      'People First. Safety Always.',
    ].join('\n'),
    html: renderSpeakerBadgeHtml({
      name: speakerName,
      edition,
      siteUrl,
      pageUrl,
      downloadUrl,
      captions,
      links,
      replyEmail,
      test,
    }),
    calendarContent: buildSpeakerCalendarIcs(edition),
  };
}

function speakersPath(siteUrl, edition) {
  return `${siteUrl}/speakers?year=${edition.edition}`;
}

module.exports = {
  SOCIAL_ICON_FILES,
  SPEAKER_BADGE_CONTENT_ID,
  SPEAKER_BADGE_TEMPLATE_KEY,
  SPEAKER_COMMS_REPLY_TO,
  buildSpeakerBadgeDownloadUrl,
  buildSpeakerBadgeEmail,
  buildSpeakerBadgePageUrl,
  buildSpeakerCalendarIcs,
};
