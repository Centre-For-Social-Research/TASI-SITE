const DEFAULT_COMMS_EMAIL = 'tasi.comms@csrindia.org';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderAcknowledgementHtml({
  firstName,
  paragraphs,
  replyEmail = DEFAULT_COMMS_EMAIL,
}) {
  const safeFirstName = escapeHtml(firstName || 'there');
  const safeReplyEmail = escapeHtml(replyEmail);
  const body = paragraphs
    .map(
      (paragraph) =>
        `<p style="margin:0 auto 16px;max-width:475px;color:#3c4043;font-size:16px;line-height:25px">${escapeHtml(paragraph)}</p>`
    )
    .join('');

  return `<!doctype html><html><body style="margin:0;padding:0;background:#022d5d;font-family:Inter,Arial,Helvetica,sans-serif;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#022d5d" style="background:#022d5d;background:linear-gradient(135deg,#022d5d 0%,#43358a 52%,#b34b5c 100%)"><tr><td align="center" style="padding:32px 12px"><table role="presentation" width="610" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:610px;background:#ffffff;border:1px solid #e8eaed"><tr><td align="center" bgcolor="#ffffff" style="padding:31px 40px 24px;background:#ffffff"><img src="cid:tasi-logo" width="194" height="54" alt="Trust &amp; Safety Festival - TASI. People First. Safety Always." style="display:block;width:194px;height:54px;border:0;outline:none;text-decoration:none" /></td></tr><tr><td align="center" style="padding:20px 40px 12px"><p style="margin:0 0 16px;color:#202124;font-size:16px;line-height:25px">Dear ${safeFirstName},</p>${body}</td></tr><tr><td style="padding:10px 40px 0"><div style="border-top:1px solid #dadce0"></div></td></tr><tr><td align="center" style="padding:20px 40px;color:#5f6368;font-size:12px;line-height:18px"><p style="margin:0 0 5px">Questions or corrections? Reply to this email or write to <a href="mailto:${safeReplyEmail}" style="color:#022d5d;text-decoration:underline">${safeReplyEmail}</a>.</p><p style="margin:0">Trust &amp; Safety India Festival 2026 &middot; People First. Safety Always.</p></td></tr><tr><td><img src="cid:tasi-delhi-footer" width="610" alt="Trust and Safety India Festival - New Delhi" style="display:block;width:100%;height:auto;border:0" /></td></tr></table></td></tr></table></body></html>`;
}

function buildSpeakerAcknowledgementEmail({
  firstName,
  topic,
  replyEmail = DEFAULT_COMMS_EMAIL,
}) {
  const name = firstName || 'there';
  const proposedTopic = topic || 'your proposed session';
  const paragraphs = [
    `Thank you for applying to speak at the Trust & Safety India Festival 2026. We have received your proposal, “${proposedTopic}”.`,
    'Our programme team will review submissions alongside the wider festival programme. If we need any additional context about your proposal, preferred format, or availability, we will contact you directly.',
    'There is nothing further you need to do at this stage. We will write to you once there is an update on the review.',
    'This email confirms receipt of your application. It does not confirm a place in the programme.',
  ];

  return {
    subject: 'We have received your TASI 2026 speaker application',
    text: [
      `Dear ${name},`,
      '',
      ...paragraphs.flatMap((paragraph) => [paragraph, '']),
      `Questions or corrections? Reply to this email or write to ${replyEmail}.`,
      '',
      'Trust & Safety India Festival 2026',
      'People First. Safety Always.',
    ].join('\n'),
    html: renderAcknowledgementHtml({
      firstName: name,
      paragraphs,
      replyEmail,
    }),
  };
}

function buildVolunteerAcknowledgementEmail({
  firstName,
  interestArea,
  availability,
  replyEmail = DEFAULT_COMMS_EMAIL,
}) {
  const name = firstName || 'there';
  const area = interestArea || 'your selected area of interest';
  const timing = availability || 'your stated availability';
  const paragraphs = [
    `Thank you for offering to volunteer at the Trust & Safety India Festival 2026. We have received your application for ${area}, with availability noted as ${timing}.`,
    'Our team will review volunteer requirements and contact you when there is an update, or if we need any additional information.',
    'This email confirms receipt of your application. It does not confirm a volunteer placement.',
  ];

  return {
    subject: 'We have received your TASI 2026 volunteer application',
    text: [
      `Dear ${name},`,
      '',
      ...paragraphs.flatMap((paragraph) => [paragraph, '']),
      `Questions or corrections? Reply to this email or write to ${replyEmail}.`,
      '',
      'Trust & Safety India Festival 2026',
      'People First. Safety Always.',
    ].join('\n'),
    html: renderAcknowledgementHtml({
      firstName: name,
      paragraphs,
      replyEmail,
    }),
  };
}

function buildMediaAcknowledgementEmail({
  firstName,
  publication,
  coverageDays,
  replyEmail = DEFAULT_COMMS_EMAIL,
}) {
  const name = firstName || 'there';
  const outlet = publication || 'your publication';
  const coverage = coverageDays || 'the festival';
  const paragraphs = [
    `Thank you for applying for media accreditation to the Trust & Safety India Festival 2026. We have received your request on behalf of ${outlet}.`,
    `You indicated that you intend to cover ${coverage}. If any of these details need correction, please reply to this email.`,
    'Our media team reviews every request individually. We will contact you with an update and, if your request is approved, with press access details and on-site media desk timings.',
    'This email confirms receipt of your request. It does not confirm media accreditation.',
  ];

  return {
    subject:
      'We have received your TASI 2026 media accreditation request',
    text: [
      `Dear ${name},`,
      '',
      ...paragraphs.flatMap((paragraph) => [paragraph, '']),
      `Questions or corrections? Reply to this email or write to ${replyEmail}.`,
      '',
      'Trust & Safety India Festival 2026',
      'People First. Safety Always.',
    ].join('\n'),
    html: renderAcknowledgementHtml({
      firstName: name,
      paragraphs,
      replyEmail,
    }),
  };
}

module.exports = {
  DEFAULT_COMMS_EMAIL,
  buildSpeakerAcknowledgementEmail,
  buildVolunteerAcknowledgementEmail,
  buildMediaAcknowledgementEmail,
  escapeHtml,
};
