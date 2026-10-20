const { escapeHtml } = require('./application-acknowledgement-email.cjs');
const { SOCIAL_PROFILES } = require('./speaker-badge-share.cjs');
const {
  buildClaimUrl,
  getCertificateEdition,
} = require('./certificate-utils.cjs');

const CERTIFICATE_REPLY_TO = 'tasi.comms@csrindia.org';
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

function paragraphs(edition) {
  return [
    `Thank you for joining us at ${edition.shortName}. It was good to have you in the room.`,
    `Your certificate of participation is ready. Please check that your name is spelled the way you want it before you download it. You can correct it once or twice on the same page.`,
  ];
}

const AFTER_BUTTON = [
  'You can also add it to the Licenses & certifications section of your LinkedIn profile from the same page.',
  'The link is personal to you, so please do not forward this email.',
];

const TAG_NOTE =
  'If you post about TASI, tag us: Centre for Social Research India and TASI on LinkedIn, @CSR_India on X, and @csr_india on Instagram.';

function buildCertificateEmail({
  name,
  edition: editionKey,
  token,
  siteUrl: rawSiteUrl,
  replyEmail = CERTIFICATE_REPLY_TO,
  test = false,
}) {
  const edition = getCertificateEdition(editionKey);
  if (!edition) throw new Error(`Edition ${editionKey} is not configured.`);
  if (!token) throw new Error('A download link is required.');
  const siteUrl = String(rawSiteUrl || DEFAULT_SITE_URL).replace(/\/+$/, '');
  const claimUrl = buildClaimUrl({ siteUrl, token });
  const subject = `Your ${edition.shortName} certificate of participation`;
  const intro = paragraphs(edition);
  const safeReply = escapeHtml(replyEmail);
  const p = (text, first = false) =>
    `<p style="margin:${first ? '0' : '16px'} auto 0;max-width:470px">${escapeHtml(text)}</p>`;
  const testBanner = test
    ? '<tr><td align="center" style="padding:10px 40px;background:#fef7e0;color:#7a4f01;font-size:13px;line-height:19px">Test email. This was not sent to the attendee.</td></tr>'
    : '';
  const follow = FOLLOW.map(
    ({ key, label }) =>
      `<a href="${escapeHtml(SOCIAL_PROFILES[key])}" style="color:#5f6368;text-decoration:underline">${label}</a>`
  ).join(DOT);

  const html = `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="x-apple-disable-message-reformatting" /><style>@media only screen and (max-width:620px){.tasi-outer{padding:12px 6px !important}.tasi-px{padding-left:20px !important;padding-right:20px !important}.tasi-body{font-size:17px !important;line-height:27px !important}.tasi-body p{max-width:100% !important}}</style></head><body style="margin:0;padding:0;background:#022d5d;font-family:Inter,Arial,Helvetica,sans-serif;"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px;mso-hide:all">Your ${escapeHtml(edition.shortName)} certificate of participation is ready to download.</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#022d5d" style="background:#022d5d;background:linear-gradient(135deg,#022d5d 0%,#43358a 52%,#b34b5c 100%)"><tr><td align="center" class="tasi-outer" style="padding:32px 12px"><table role="presentation" width="610" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:610px;background-color:#ffffff;border:1px solid #e8eaed">${testBanner}<tr><td align="center" bgcolor="#ffffff" class="tasi-px" style="padding:31px 40px 18px;background:#ffffff"><img src="cid:tasi-logo" width="194" height="54" alt="Trust &amp; Safety Festival - TASI. People First. Safety Always." style="display:block;width:194px;height:54px;border:0" /></td></tr><tr><td align="center" class="tasi-px tasi-body" style="padding:20px 40px 0;color:#3c4043;font-size:16px;line-height:25px"><p style="margin:0 0 16px">Dear ${escapeHtml(name)},</p>${intro.map((t, i) => p(t, i === 0)).join('')}<p style="margin:24px 0 0"><a href="${escapeHtml(claimUrl)}" style="display:inline-block;padding:12px 24px;border-radius:10px;background:#022d5d;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none">Get your certificate</a></p>${AFTER_BUTTON.map((t) => p(t)).join('')}</td></tr>${DIVIDER}<tr><td align="center" class="tasi-px tasi-body" style="padding:20px 40px 0;color:#3c4043;font-size:15px;line-height:24px"><p style="margin:0 auto;max-width:470px">${escapeHtml(TAG_NOTE)}</p></td></tr>${DIVIDER}<tr><td align="center" class="tasi-px tasi-body" style="padding:20px 40px 0;color:#3c4043;font-size:16px;line-height:25px"><p style="margin:0 auto;max-width:470px">We hope to see you at the next TASI.</p><p style="margin:14px 0 0">Warm regards,<br /><strong style="color:#202124">Team TASI</strong></p></td></tr><tr><td align="center" class="tasi-px" style="padding:20px 40px;color:#5f6368;font-size:13px;line-height:19px"><p style="margin:0 auto 5px;max-width:470px">Questions? Write to us at <a href="mailto:${safeReply}" style="${LINK}">${safeReply}</a>.</p><p style="margin:0 0 5px">Follow us: ${follow}</p><p style="margin:0">${escapeHtml(edition.eventName.replace(/ \(.*\)$/, ''))} &middot; People First. Safety Always.</p></td></tr><tr><td><img src="${escapeHtml(siteUrl + FOOTER_IMAGE_PATH)}" width="100%" alt="Trust and Safety India Festival - New Delhi" style="display:block;width:100%;height:auto;border:0" /></td></tr></table></td></tr></table></body></html>`;

  const text = [
    ...(test ? ['TEST EMAIL. This was not sent to the attendee.', ''] : []),
    `Dear ${name},`,
    '',
    ...intro.flatMap((t) => [t, '']),
    `Get your certificate: ${claimUrl}`,
    '',
    ...AFTER_BUTTON.flatMap((t) => [t, '']),
    TAG_NOTE,
    '',
    'We hope to see you at the next TASI.',
    '',
    'Warm regards,',
    'Team TASI',
    '',
    `Questions? Write to us at ${replyEmail}.`,
  ].join('\n');

  return { subject: test ? `[TEST] ${subject}` : subject, text, html };
}

module.exports = { CERTIFICATE_REPLY_TO, buildCertificateEmail };
