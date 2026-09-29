const { escapeHtml } = require('./application-acknowledgement-email.cjs');
const { getSpeakerEdition } = require('./speaker-communications-utils.cjs');
const {
  buildSpeakerShareCaptions,
  buildSpeakerShareLinks,
} = require('./speaker-badge-share.cjs');

const SPEAKER_BADGE_TEMPLATE_KEY = 'speaker_badge_v1';
const SPEAKER_COMMS_REPLY_TO = 'tasi.comms@csrindia.org';
const SPEAKER_BADGE_CONTENT_ID = 'speaker-badge';
const DEFAULT_SITE_URL = 'https://trustandsafetyindia.org';

const LINK = 'color:#022d5d;text-decoration:underline';
const DOT = '<span style="color:#9aa0a6;padding:0 8px">&middot;</span>';
const LABEL =
  'margin:0 0 5px;color:#5f6368;font-size:12px;line-height:18px;font-weight:600;text-transform:uppercase;letter-spacing:.06em';
const DIVIDER =
  '<tr><td style="padding:25px 40px 0"><div style="border-top:1px solid #dadce0"></div></td></tr>';

const SHARE_BUTTONS = [
  { key: 'linkedin', label: 'LinkedIn', color: '#0a66c2' },
  { key: 'x', label: 'X', color: '#000000' },
  { key: 'facebook', label: 'Facebook', color: '#1877f2' },
  { key: 'instagram', label: 'Instagram', color: '#c13584' },
];

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

function introParagraphs(edition) {
  return [
    `Thank you for joining us as a speaker at the ${edition.festivalName}. We are delighted to have you with us.`,
    'Your speaker badge is below and attached to this email. We would love for you to share it with your network so they know you will be speaking.',
  ];
}

function renderShareButtons(links) {
  const cells = SHARE_BUTTONS.map(
    ({ key, label, color }) =>
      `<td align="center" style="padding:4px"><a href="${escapeHtml(links[key])}" style="display:block;padding:10px 6px;border-radius:10px;background:${color};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none">${label}</a></td>`
  ).join('');
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:470px;margin:0 auto;table-layout:fixed"><tr>${cells}</tr></table>`;
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
  const festivalUrl = `${siteUrl}/`;
  const programmeUrl = `${siteUrl}/programme`;
  const speakersUrl = `${siteUrl}/speakers?year=${edition.edition}`;
  const intro = introParagraphs(edition)
    .map(
      (paragraph, index) =>
        `<p style="margin:${index ? '16px' : '0'} auto 0;max-width:470px">${escapeHtml(paragraph)}</p>`
    )
    .join('');
  const testBanner = test
    ? '<tr><td align="center" style="padding:10px 40px;background:#fef7e0;color:#7a4f01;font-size:13px;line-height:19px">Test email. This was not sent to the speaker.</td></tr>'
    : '';

  return `<!doctype html><html><body style="margin:0;padding:0;background:#022d5d;font-family:Inter,Arial,Helvetica,sans-serif;"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px;mso-hide:all">Your speaker badge for ${escapeHtml(edition.name)}, ready to share.</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#022d5d" style="background:#022d5d;background:linear-gradient(135deg,#022d5d 0%,#43358a 52%,#b34b5c 100%)"><tr><td align="center" style="padding:32px 12px"><table role="presentation" width="610" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:610px;background:#ffffff;border:1px solid #e8eaed">${testBanner}<tr><td align="center" bgcolor="#ffffff" style="padding:31px 40px 18px;background:#ffffff"><img src="cid:tasi-logo" width="194" height="54" alt="Trust &amp; Safety Festival - TASI. People First. Safety Always." style="display:block;width:194px;height:54px;border:0;outline:none;text-decoration:none" /></td></tr><tr><td align="center" style="padding:20px 40px 0;color:#3c4043;font-size:16px;line-height:25px"><p style="margin:0 0 16px">Dear ${escapeHtml(name)},</p>${intro}</td></tr><tr><td align="center" style="padding:24px 40px 0"><img src="cid:${SPEAKER_BADGE_CONTENT_ID}" width="300" alt="${escapeHtml(name)}, speaker at ${escapeHtml(edition.name)}" style="display:block;width:300px;max-width:100%;height:auto;border:1px solid #e8eaed;border-radius:10px" /><p style="margin:18px 0 0"><a href="${escapeHtml(downloadUrl)}" style="display:inline-block;padding:12px 24px;border-radius:10px;background:#022d5d;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none">Download your badge</a></p></td></tr>${DIVIDER}<tr><td align="center" style="padding:20px 40px 0;color:#3c4043;font-size:15px;line-height:24px"><p style="margin:0 0 6px;font-size:16px;font-weight:600;color:#202124">Share that you are speaking</p><p style="margin:0 auto 14px;max-width:470px">Tap a platform to post. Here is a caption you can use or edit:</p><div style="max-width:470px;margin:0 auto 14px;padding:14px 16px;border-radius:10px;background:#f1f3f4;color:#202124;font-size:14px;line-height:22px;text-align:left;white-space:pre-line">${escapeHtml(captions.facebook)}</div>${renderShareButtons(links)}<p style="margin:12px auto 0;max-width:470px;color:#5f6368;font-size:12px;line-height:18px">LinkedIn and X open with the caption ready. For Facebook and Instagram, <a href="${escapeHtml(pageUrl)}" style="${LINK}">your badge page</a> copies the caption for you. Type @ before Centre for Social Research India and TASI Festival to tag them, and attach your badge image.</p></td></tr>${DIVIDER}<tr><td align="center" style="padding:20px 40px 0;color:#3c4043;font-size:15px;line-height:24px"><p style="margin:0 0 5px;font-size:16px;font-weight:600;color:#202124">${escapeHtml(edition.dates)}</p><p style="margin:0"><a href="${escapeHtml(edition.venueMapUrl)}" style="${LINK}">${escapeHtml(edition.venue)} &middot; Venue map</a></p></td></tr>${DIVIDER}<tr><td align="center" style="padding:20px 40px 27px;color:#3c4043;font-size:14px;line-height:23px"><p style="margin:0 0 13px;font-size:16px;font-weight:600;color:#202124">Plan ahead</p><p style="${LABEL}">Add to calendar</p><p style="margin:0 0 15px"><a href="${escapeHtml(calendar.google)}" style="${LINK}">Google Calendar</a>${DOT}<a href="${escapeHtml(calendar.outlook)}" style="${LINK}">Outlook Calendar</a>${DOT}<span style="color:#5f6368">Attached .ics</span></p><p style="${LABEL}">Explore ${escapeHtml(edition.name)}</p><p style="margin:0"><a href="${escapeHtml(festivalUrl)}" style="${LINK}">${escapeHtml(edition.name)}</a>${DOT}<a href="${escapeHtml(programmeUrl)}" style="${LINK}">Programme &amp; agenda</a>${DOT}<a href="${escapeHtml(speakersUrl)}" style="${LINK}">Speakers</a></p></td></tr><tr><td style="padding:0 40px"><div style="border-top:1px solid #dadce0"></div></td></tr><tr><td align="center" style="padding:20px 40px 0;color:#3c4043;font-size:16px;line-height:25px"><p style="margin:0">We look forward to welcoming you in New Delhi.</p><p style="margin:14px 0 0">With warm regards,<br /><strong style="color:#202124">Team TASI</strong></p></td></tr><tr><td align="center" style="padding:20px 40px;color:#5f6368;font-size:12px;line-height:18px"><p style="margin:0 0 5px">Questions or corrections? Reply to this email or write to <a href="mailto:${safeReplyEmail}" style="${LINK}">${safeReplyEmail}</a>.</p><p style="margin:0">${escapeHtml(edition.festivalName)} &middot; People First. Safety Always.</p></td></tr><tr><td><img src="cid:tasi-delhi-footer" width="610" alt="Trust and Safety India Festival - New Delhi" style="display:block;width:100%;height:auto;border:0" /></td></tr></table></td></tr></table></body></html>`;
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
      ...introParagraphs(edition).flatMap((paragraph) => [paragraph, '']),
      `Download your badge: ${downloadUrl}`,
      '',
      'Share that you are speaking',
      '',
      captions.facebook,
      '',
      `LinkedIn: ${links.linkedin}`,
      `X: ${links.x}`,
      `Facebook: ${links.facebook}`,
      `Instagram: ${links.instagram}`,
      '',
      `${edition.dates}`,
      `${edition.venue}`,
      `Venue map: ${edition.venueMapUrl}`,
      '',
      'Plan ahead',
      `Google Calendar: ${calendar.google}`,
      `Outlook Calendar: ${calendar.outlook}`,
      'An .ics calendar file is attached.',
      `Programme & agenda: ${siteUrl}/programme`,
      `Speakers: ${siteUrl}/speakers?year=${edition.edition}`,
      '',
      'We look forward to welcoming you in New Delhi.',
      '',
      'With warm regards,',
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

module.exports = {
  SPEAKER_BADGE_CONTENT_ID,
  SPEAKER_BADGE_TEMPLATE_KEY,
  SPEAKER_COMMS_REPLY_TO,
  buildSpeakerBadgeDownloadUrl,
  buildSpeakerBadgeEmail,
  buildSpeakerBadgePageUrl,
  buildSpeakerCalendarIcs,
};
