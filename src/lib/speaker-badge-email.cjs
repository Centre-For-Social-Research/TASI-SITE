const { escapeHtml } = require('./application-acknowledgement-email.cjs');
const { getSpeakerEdition } = require('./speaker-communications-utils.cjs');

const SPEAKER_BADGE_TEMPLATE_KEY = 'speaker_badge_v1';
const SPEAKER_COMMS_REPLY_TO = 'tasi.comms@csrindia.org';
const DEFAULT_SITE_URL = 'https://trustandsafetyindia.org';

function normalizeSiteUrl(siteUrl) {
  return String(siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, '');
}

function buildSpeakerBadgeDownloadUrl({ siteUrl, token }) {
  return `${normalizeSiteUrl(siteUrl)}/badge/${encodeURIComponent(token)}`;
}

function speakerBadgeParagraphs(edition) {
  return [
    `Thank you for joining us as a speaker at the ${edition.festivalName}, taking place on ${edition.dates} at the ${edition.venue}.`,
    'Your speaker badge is attached to this email. You can also download it using the button below.',
    `We would love for you to share it on LinkedIn or your other social channels so your network knows you will be speaking. Please tag Centre for Social Research India and Trust & Safety Forum, and use ${edition.hashtag}.`,
    'We look forward to welcoming you in New Delhi.',
  ];
}

function renderSpeakerBadgeHtml({
  name,
  edition,
  downloadUrl,
  replyEmail,
  test,
}) {
  const safeName = escapeHtml(name || 'there');
  const safeReplyEmail = escapeHtml(replyEmail);
  const safeDownloadUrl = escapeHtml(downloadUrl);
  const body = speakerBadgeParagraphs(edition)
    .map(
      (paragraph, index) =>
        `<p style="margin:${index ? '16px' : '0'} auto 0;max-width:470px">${escapeHtml(paragraph)}</p>`
    )
    .join('');
  const testBanner = test
    ? '<tr><td align="center" style="padding:10px 40px;background:#fef7e0;color:#7a4f01;font-size:13px;line-height:19px">Test email. This was not sent to the speaker.</td></tr>'
    : '';

  return `<!doctype html><html><body style="margin:0;padding:0;background:#022d5d;font-family:Inter,Arial,Helvetica,sans-serif;"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px;mso-hide:all">Your speaker badge for ${escapeHtml(edition.name)} is attached.</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#022d5d" style="background:#022d5d;background:linear-gradient(135deg,#022d5d 0%,#43358a 52%,#b34b5c 100%)"><tr><td align="center" style="padding:32px 12px"><table role="presentation" width="610" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:610px;background:#ffffff;border:1px solid #e8eaed">${testBanner}<tr><td align="center" bgcolor="#ffffff" style="padding:31px 40px 18px;background:#ffffff"><img src="cid:tasi-logo" width="194" height="54" alt="Trust &amp; Safety Festival - TASI. People First. Safety Always." style="display:block;width:194px;height:54px;border:0;outline:none;text-decoration:none" /></td></tr><tr><td align="center" style="padding:20px 40px 0;color:#3c4043;font-size:16px;line-height:25px"><p style="margin:0 0 16px">Dear ${safeName},</p>${body}</td></tr><tr><td align="center" style="padding:26px 40px 0"><a href="${safeDownloadUrl}" style="display:inline-block;padding:12px 24px;border-radius:10px;background:#022d5d;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none">Download your badge</a></td></tr><tr><td align="center" style="padding:24px 40px 27px;color:#3c4043;font-size:16px;line-height:25px"><p style="margin:0">With warm regards,<br /><strong style="color:#202124">Team TASI</strong></p></td></tr><tr><td style="padding:0 40px"><div style="border-top:1px solid #dadce0"></div></td></tr><tr><td align="center" style="padding:20px 40px;color:#5f6368;font-size:12px;line-height:18px"><p style="margin:0 0 5px">Questions or corrections? Reply to this email or write to <a href="mailto:${safeReplyEmail}" style="color:#022d5d;text-decoration:underline">${safeReplyEmail}</a>.</p><p style="margin:0">${escapeHtml(edition.festivalName)} &middot; People First. Safety Always.</p></td></tr><tr><td><img src="cid:tasi-delhi-footer" width="610" alt="Trust and Safety India Festival - New Delhi" style="display:block;width:100%;height:auto;border:0" /></td></tr></table></td></tr></table></body></html>`;
}

function buildSpeakerBadgeEmail({
  name,
  edition: editionKey,
  downloadUrl,
  replyEmail = SPEAKER_COMMS_REPLY_TO,
  test = false,
}) {
  const edition = getSpeakerEdition(editionKey);
  if (!edition) throw new Error(`Edition ${editionKey} is not configured.`);
  const speakerName = name || 'there';
  const subject = `Your speaker badge for ${edition.name}`;

  return {
    subject: test ? `[TEST] ${subject}` : subject,
    text: [
      ...(test ? ['TEST EMAIL. This was not sent to the speaker.', ''] : []),
      `Dear ${speakerName},`,
      '',
      ...speakerBadgeParagraphs(edition).flatMap((paragraph) => [
        paragraph,
        '',
      ]),
      `Download your badge: ${downloadUrl}`,
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
      downloadUrl,
      replyEmail,
      test,
    }),
  };
}

module.exports = {
  SPEAKER_BADGE_TEMPLATE_KEY,
  SPEAKER_COMMS_REPLY_TO,
  buildSpeakerBadgeDownloadUrl,
  buildSpeakerBadgeEmail,
};
