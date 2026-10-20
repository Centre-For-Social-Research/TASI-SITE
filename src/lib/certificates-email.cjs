const { escapeHtml } = require('./application-acknowledgement-email.cjs');
const { SOCIAL_PROFILES } = require('./speaker-badge-share.cjs');
const {
  buildClaimUrl,
  getCertificateEdition,
} = require('./certificate-utils.cjs');

const CERTIFICATE_REPLY_TO = 'tasi.comms@csrindia.org';
const DEFAULT_SITE_URL = 'https://trustandsafetyindia.org';
// Images load from the live site even when links point at a preview or
// local server, so the footer never breaks in test emails.
const FOOTER_IMAGE_URL = `${DEFAULT_SITE_URL}/img/email/tasi-2026-delhi-footer.jpeg`;
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

const THANKS = (edition) =>
  `Thank you for joining us at ${edition.shortName} and for helping make it a resounding success. Over two days in New Delhi, more than 100 speakers from 20 countries came together to talk about keeping people safe online, and we are glad you were in the room.`;

const CERTIFICATE_LINES = [
  "Your certificate of participation is ready. When you open the link, we'll email you a one-time code to confirm it's you. Then check that your name is spelled the way you want it. Once you confirm it, the name is locked and printed on your certificate.",
];

const REMINDER_LINES = (edition) => [
  `A quick reminder that your ${edition.shortName} certificate of participation is still waiting for you.`,
  'It takes a minute: check your name, then download the PDF. This email has a fresh link, and the one we sent earlier no longer works.',
];

const LINKEDIN_LINE =
  'You can also add it to the Licenses & certifications section of your LinkedIn profile from the same page.';

const FEEDBACK_LINE = (edition) =>
  `Tell us how ${edition.shortName} went so we can make the next one better. It takes about two minutes.`;

const KEEP_PRIVATE = (photos) =>
  `${photos ? 'These links are' : 'This link is'} personal to you, so please do not forward this email. The certificate link works for 30 days; if it expires, you can ask for a new one at trustandsafetyindia.org/certificates.`;

const TAG_NOTE =
  'If you post about TASI, use #TASI2026 and tag us: Centre for Social Research India and TASI on LinkedIn, @CSR_India on X, and @csr_india on Instagram.';

function photoLine(count) {
  return count === 1
    ? 'Your photo from the festival is in a folder, ready to view and download.'
    : `Your ${count} photos from the festival are in one folder, ready to view and download.`;
}

// The certificate email doubles as the TASI thank-you email: certificate,
// the attendee's photo folder (when we have one) and the feedback form.
function buildCertificateEmail({
  name,
  edition: editionKey,
  token,
  siteUrl: rawSiteUrl,
  replyEmail = CERTIFICATE_REPLY_TO,
  test = false,
  reminder = false,
  photos = null,
}) {
  const edition = getCertificateEdition(editionKey);
  if (!edition) throw new Error(`Edition ${editionKey} is not configured.`);
  if (!token) throw new Error('A download link is required.');
  const siteUrl = String(rawSiteUrl || DEFAULT_SITE_URL).replace(/\/+$/, '');
  const claimUrl = buildClaimUrl({ siteUrl, token });
  const photo =
    photos && photos.url && Number(photos.count) > 0
      ? { url: String(photos.url), count: Number(photos.count) }
      : null;
  const feedbackUrl = edition.feedbackUrl || null;
  const subject = reminder
    ? `Reminder: your ${edition.shortName} certificate is waiting`
    : `Thank you for joining ${edition.shortName}: your certificate${photo ? ' and photos' : ''}`;
  const preheader = reminder
    ? `Your ${edition.shortName} certificate is still waiting. Here is a fresh link.`
    : `Your certificate of participation${photo ? ' and your photos from the festival are' : ' is'} ready.`;
  const safeReply = escapeHtml(replyEmail);
  const p = (text, first = false) =>
    `<p style="margin:${first ? '0' : '16px'} auto 0;max-width:470px">${escapeHtml(text)}</p>`;
  const heading = (text) =>
    `<p style="margin:0 auto 10px;max-width:470px;color:#022d5d;font-size:13px;line-height:18px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">${escapeHtml(text)}</p>`;
  // Actions are plain crimson text links with an arrow, not buttons.
  const action = (href, label) =>
    `<p style="margin:12px 0 0"><a href="${escapeHtml(href)}" style="color:#9e1b1e;font-size:16px;line-height:24px;font-weight:700;text-decoration:none">${escapeHtml(label)}&nbsp;&rarr;</a></p>`;
  const section = (inner, size = 16, line = 25) =>
    `<tr><td align="center" class="tasi-px tasi-body" style="padding:20px 40px 0;color:#3c4043;font-size:${size}px;line-height:${line}px">${inner}</td></tr>`;
  const testBanner = test
    ? '<tr><td align="center" style="padding:10px 40px;background:#fef7e0;color:#7a4f01;font-size:13px;line-height:19px">Test email. This was not sent to the attendee.</td></tr>'
    : '';
  const follow = FOLLOW.map(
    ({ key, label }) =>
      `<a href="${escapeHtml(SOCIAL_PROFILES[key])}" style="color:#5f6368;text-decoration:underline">${label}</a>`
  ).join(DOT);

  const opening = reminder ? REMINDER_LINES(edition) : [THANKS(edition)];
  const certificateLines = reminder ? [] : CERTIFICATE_LINES;

  const blocks = [
    section(
      `<p style="margin:0 0 16px">Dear ${escapeHtml(name)},</p>${opening.map((t, i) => p(t, i === 0)).join('')}`
    ),
    DIVIDER,
    section(
      `${heading('Your certificate')}${certificateLines.map((t, i) => p(t, i === 0)).join('')}${action(claimUrl, 'Get your certificate')}${p(LINKEDIN_LINE)}`
    ),
  ];
  if (photo) {
    blocks.push(
      DIVIDER,
      section(
        `${heading('Your photos')}${p(photoLine(photo.count), true)}${action(photo.url, 'See your photos')}`
      )
    );
  }
  if (feedbackUrl) {
    blocks.push(
      DIVIDER,
      section(
        `${heading('Two minutes for us?')}${p(FEEDBACK_LINE(edition), true)}${action(feedbackUrl, 'Share your feedback')}`
      )
    );
  }
  blocks.push(
    DIVIDER,
    section(`${p(KEEP_PRIVATE(Boolean(photo)), true)}${p(TAG_NOTE)}`, 15, 24),
    section(
      `<p style="margin:0 auto;max-width:470px">We hope to see you at the next TASI.</p><p style="margin:14px 0 0">Warm regards,<br /><strong style="color:#202124">Team TASI</strong></p>`
    )
  );

  const html = `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="x-apple-disable-message-reformatting" /><style>@media only screen and (max-width:620px){.tasi-outer{padding:12px 6px !important}.tasi-px{padding-left:20px !important;padding-right:20px !important}.tasi-body{font-size:17px !important;line-height:27px !important}.tasi-body p{max-width:100% !important}}</style></head><body style="margin:0;padding:0;background:#022d5d;font-family:Inter,Arial,Helvetica,sans-serif;"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px;mso-hide:all">${escapeHtml(preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#022d5d" style="background:#022d5d;background:linear-gradient(135deg,#022d5d 0%,#43358a 52%,#b34b5c 100%)"><tr><td align="center" class="tasi-outer" style="padding:32px 12px"><table role="presentation" width="610" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:610px;background-color:#ffffff;border:1px solid #e8eaed">${testBanner}<tr><td align="center" bgcolor="#ffffff" class="tasi-px" style="padding:31px 40px 18px;background:#ffffff"><img src="cid:tasi-logo" width="194" height="54" alt="Trust &amp; Safety Festival - TASI. People First. Safety Always." style="display:block;width:194px;height:54px;border:0" /></td></tr>${blocks.join('')}<tr><td align="center" class="tasi-px" style="padding:20px 40px;color:#5f6368;font-size:13px;line-height:19px"><p style="margin:0 auto 5px;max-width:470px">Questions? Write to us at <a href="mailto:${safeReply}" style="${LINK}">${safeReply}</a>.</p><p style="margin:0 0 5px">Follow us: ${follow}</p><p style="margin:0">${escapeHtml(edition.eventName.replace(/ \(.*\)$/, ''))} &middot; People First. Safety Always.</p></td></tr><tr><td><img src="${FOOTER_IMAGE_URL}" width="100%" alt="Trust and Safety India Festival - New Delhi" style="display:block;width:100%;height:auto;border:0" /></td></tr></table></td></tr></table></body></html>`;

  const text = [
    ...(test ? ['TEST EMAIL. This was not sent to the attendee.', ''] : []),
    `Dear ${name},`,
    '',
    ...opening.flatMap((t) => [t, '']),
    'YOUR CERTIFICATE',
    ...certificateLines.flatMap((t) => [t, '']),
    `Get your certificate: ${claimUrl}`,
    '',
    LINKEDIN_LINE,
    '',
    ...(photo
      ? [
          'YOUR PHOTOS',
          photoLine(photo.count),
          `See your photos: ${photo.url}`,
          '',
        ]
      : []),
    ...(feedbackUrl
      ? [
          'TWO MINUTES FOR US?',
          FEEDBACK_LINE(edition),
          `Share your feedback: ${feedbackUrl}`,
          '',
        ]
      : []),
    KEEP_PRIVATE(Boolean(photo)),
    '',
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

// The one-time code email: same frame as the certificate email, with the
// code large and easy to copy on a phone.
function buildCertificateCodeEmail({ name, code, test = false }) {
  const subject = `${code} is your TASI 2026 certificate code`;
  const safeCode = escapeHtml(code);
  const safeReply = escapeHtml(CERTIFICATE_REPLY_TO);
  const testBanner = test
    ? '<tr><td align="center" style="padding:10px 40px;background:#fef7e0;color:#7a4f01;font-size:13px;line-height:19px">Test email. This was not sent to the attendee.</td></tr>'
    : '';
  const html = `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="x-apple-disable-message-reformatting" /><style>@media only screen and (max-width:620px){.tasi-outer{padding:12px 6px !important}.tasi-px{padding-left:20px !important;padding-right:20px !important}.tasi-body{font-size:17px !important;line-height:27px !important}.tasi-code{font-size:34px !important;letter-spacing:8px !important;padding:14px 18px !important}}</style></head><body style="margin:0;padding:0;background:#022d5d;font-family:Inter,Arial,Helvetica,sans-serif;"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px;mso-hide:all">Your code is ${safeCode}. It works for 10 minutes.</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#022d5d" style="background:#022d5d;background:linear-gradient(135deg,#022d5d 0%,#43358a 52%,#b34b5c 100%)"><tr><td align="center" class="tasi-outer" style="padding:32px 12px"><table role="presentation" width="610" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:610px;background-color:#ffffff;border:1px solid #e8eaed">${testBanner}<tr><td align="center" bgcolor="#ffffff" class="tasi-px" style="padding:31px 40px 18px;background:#ffffff"><img src="cid:tasi-logo" width="194" height="54" alt="Trust &amp; Safety Festival - TASI. People First. Safety Always." style="display:block;width:194px;height:54px;border:0" /></td></tr><tr><td align="center" class="tasi-px tasi-body" style="padding:20px 40px 0;color:#3c4043;font-size:16px;line-height:25px"><p style="margin:0 0 16px">Dear ${escapeHtml(name)},</p><p style="margin:0 auto;max-width:470px">Here is your code to open your TASI 2026 certificate of participation.</p></td></tr><tr><td align="center" class="tasi-px" style="padding:24px 40px 0"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td class="tasi-code" align="center" style="padding:16px 28px;border:1px solid #d2d6f0;border-radius:10px;background:#f3f4fb;color:#022d5d;font-family:'Courier New',Courier,monospace;font-size:38px;line-height:44px;font-weight:700;letter-spacing:10px">${safeCode}</td></tr></table></td></tr><tr><td align="center" class="tasi-px" style="padding:14px 40px 0;color:#5f6368;font-size:14px;line-height:21px"><p style="margin:0">Enter it on the certificate page. It works for 10 minutes.</p></td></tr>${DIVIDER}<tr><td align="center" class="tasi-px" style="padding:20px 40px 0;color:#5f6368;font-size:14px;line-height:22px"><p style="margin:0 auto;max-width:470px">Didn't ask for this? You can ignore this email. Nobody can open your certificate without this code, and we will never ask you for it by phone or message.</p></td></tr><tr><td align="center" class="tasi-px" style="padding:20px 40px 0;color:#3c4043;font-size:16px;line-height:25px"><p style="margin:0">Warm regards,<br /><strong style="color:#202124">Team TASI</strong></p></td></tr><tr><td align="center" class="tasi-px" style="padding:20px 40px;color:#5f6368;font-size:13px;line-height:19px"><p style="margin:0">Questions? Write to us at <a href="mailto:${safeReply}" style="${LINK}">${safeReply}</a>.</p></td></tr><tr><td><img src="${FOOTER_IMAGE_URL}" width="100%" alt="Trust and Safety India Festival - New Delhi" style="display:block;width:100%;height:auto;border:0" /></td></tr></table></td></tr></table></body></html>`;
  const text = [
    ...(test ? ['TEST EMAIL. This was not sent to the attendee.', ''] : []),
    `Dear ${name},`,
    '',
    `Your code to open your TASI 2026 certificate is ${code}.`,
    '',
    'Enter it on the certificate page. It works for 10 minutes.',
    '',
    "Didn't ask for this? You can ignore this email. Nobody can open your certificate without this code, and we will never ask you for it by phone or message.",
    '',
    'Warm regards,',
    'Team TASI',
  ].join('\n');
  return { subject: test ? `[TEST] ${subject}` : subject, text, html };
}

module.exports = {
  CERTIFICATE_REPLY_TO,
  buildCertificateCodeEmail,
  buildCertificateEmail,
};
