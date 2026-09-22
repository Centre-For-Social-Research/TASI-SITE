const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULT_COMMS_EMAIL,
  buildExhibitionAcknowledgementEmail,
  buildMediaAcknowledgementEmail,
  buildNewsletterAcknowledgementEmail,
  buildRegistrationAcknowledgementEmail,
  buildRegistrationConfirmedEmail,
  buildRegistrationRejectedEmail,
  buildRegistrationWaitlistedEmail,
  buildSpeakerAcknowledgementEmail,
  buildVolunteerAcknowledgementEmail,
} = require('../src/lib/application-acknowledgement-email.cjs');

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('speaker acknowledgement uses the premium layout and private comms reply address', () => {
  const email = buildSpeakerAcknowledgementEmail({
    firstName: 'Saquib & Team',
    topic: 'Safety <by design>',
  });

  assert.equal(
    email.subject,
    'We have received your TASI 2026 speaker application'
  );
  assert.doesNotMatch(email.html, /Speaker application received/);
  assert.match(email.html, /Dear Saquib &amp; Team,/);
  assert.match(email.html, /Safety &lt;by design&gt;/);
  assert.match(email.text, /submissions alongside the wider festival programme/);
  assert.match(email.text, /There is nothing further you need to do at this stage/);
  assert.match(email.text, /does not confirm a place in the programme/);
  assert.match(email.html, /cid:tasi-logo/);
  assert.match(email.html, /cid:tasi-delhi-footer/);
  assert.match(email.html, new RegExp(DEFAULT_COMMS_EMAIL));
  assert.doesNotMatch(email.html, /india@trustandsafetyfestival\.com/);
  assert.doesNotMatch(email.text, /india@trustandsafetyfestival\.com/);
});

test('volunteer acknowledgement confirms receipt without promising placement', () => {
  const email = buildVolunteerAcknowledgementEmail({
    firstName: 'Saquib',
    interestArea: 'Speaker support',
    availability: 'Both event days',
  });

  assert.equal(
    email.subject,
    'We have received your TASI 2026 volunteer application'
  );
  assert.doesNotMatch(email.html, /Volunteer application received/);
  assert.match(email.text, /Speaker support/);
  assert.match(email.text, /Both event days/);
  assert.match(email.text, /does not confirm a volunteer placement/);
  assert.match(email.html, new RegExp(DEFAULT_COMMS_EMAIL));
  assert.doesNotMatch(email.html, /india@trustandsafetyfestival\.com/);
});

test('media acknowledgement uses the external acknowledgement design', () => {
  const email = buildMediaAcknowledgementEmail({
    firstName: 'Saquib',
    publication: 'CSR News',
    coverageDays: 'both festival days',
  });

  assert.equal(
    email.subject,
    'We have received your TASI 2026 media accreditation request'
  );
  assert.match(email.html, /Dear Saquib,/);
  assert.match(email.text, /on behalf of CSR News/);
  assert.match(email.text, /does not confirm media accreditation/);
  assert.match(email.html, /cid:tasi-logo/);
  assert.doesNotMatch(email.html, /india@trustandsafetyfestival\.com/);
});

test('exhibition and newsletter acknowledgements use the external design', () => {
  const exhibition = buildExhibitionAcknowledgementEmail({
    firstName: 'Saquib',
    company: 'CSR',
  });
  const newsletter = buildNewsletterAcknowledgementEmail({});

  assert.match(exhibition.html, /Dear Saquib,/);
  assert.match(exhibition.text, /enquiry from CSR/);
  assert.match(
    exhibition.text,
    /does not confirm an exhibition space or partnership/
  );
  assert.match(exhibition.html, /cid:tasi-logo/);
  assert.match(newsletter.html, /Hello,/);
  assert.match(
    newsletter.text,
    /programme announcements, speaker news, and registration updates/
  );
  assert.match(newsletter.html, /cid:tasi-delhi-footer/);
});

test('registration acknowledgement and confirmation use the external design', () => {
  const acknowledgement = buildRegistrationAcknowledgementEmail({
    firstName: 'Saquib',
  });
  const confirmed = buildRegistrationConfirmedEmail({ firstName: 'Saquib' });

  assert.equal(acknowledgement.subject, 'TASI 2026 registration received');
  assert.match(acknowledgement.html, /Dear Saquib,/);
  assert.match(
    acknowledgement.text,
    /does not confirm participation in the festival/
  );
  assert.match(acknowledgement.html, /cid:tasi-delhi-footer/);
  assert.doesNotMatch(
    acknowledgement.html,
    /india@trustandsafetyfestival\.com/
  );

  assert.equal(
    confirmed.subject,
    'Your TASI 2026 participation is confirmed'
  );
  assert.match(confirmed.html, /Dear Saquib,/);
  assert.match(confirmed.text, /Your QR entry pass and practical event details/);
  assert.match(confirmed.html, /cid:tasi-logo/);
  assert.doesNotMatch(confirmed.html, /india@trustandsafetyfestival\.com/);
});

test('registration waitlist and rejection updates use the external design', () => {
  const waitlisted = buildRegistrationWaitlistedEmail({ firstName: 'Saquib' });
  const rejected = buildRegistrationRejectedEmail({ firstName: 'Saquib' });

  assert.equal(waitlisted.subject, 'TASI 2026 waitlist update');
  assert.match(waitlisted.html, /Dear Saquib,/);
  assert.match(waitlisted.text, /currently on the waitlist/);
  assert.match(
    waitlisted.text,
    /does not confirm participation in the festival/
  );
  assert.match(waitlisted.html, /cid:tasi-logo/);

  assert.equal(rejected.subject, 'TASI 2026 registration update');
  assert.match(rejected.html, /Dear Saquib,/);
  assert.match(rejected.text, /unable to offer you a place at the festival/);
  assert.match(rejected.html, /cid:tasi-delhi-footer/);
  assert.doesNotMatch(rejected.html, /india@trustandsafetyfestival\.com/);
});

test('registration acknowledgement and confirmation render through the external template only', () => {
  const source = readSource('src/lib/registration-email.js');

  assert.match(source, /templateType === 'submission_received'/);
  assert.match(source, /buildRegistrationAcknowledgementEmail/);
  assert.match(source, /templateType === 'confirmed'/);
  assert.match(source, /buildRegistrationConfirmedEmail/);
  assert.match(source, /templateType === 'waitlisted'/);
  assert.match(source, /buildRegistrationWaitlistedEmail/);
  assert.match(source, /templateType === 'rejected'/);
  assert.match(source, /buildRegistrationRejectedEmail/);
  assert.match(source, /registrationStatusCopy\?\.html/);
  assert.match(source, /getTasiEmailInlineAttachments/);
  assert.match(source, /registrationStatusCopy[\s\S]*\? \[replyEmail\]/);
});

test('application routes send acknowledgements only to the submitted applicant', () => {
  for (const relativePath of [
    'src/app/api/speaker-application/route.js',
    'src/app/api/volunteer-application/route.js',
    'src/app/api/media-accreditation/route.js',
    'src/app/api/messages/route.js',
  ]) {
    const source = readSource(relativePath);

    assert.match(source, /sendApplicantConfirmationEmail\(\{/);
    assert.match(source, /to: email,/);
    assert.match(source, /replyTo: replyEmail,/);
    assert.match(source, /getTasiEmailInlineAttachments\(\)/);
  }
});

test('internal notifications and applicant replies use the private comms settings', () => {
  const envExample = readSource('.env.example');
  const resendSource = readSource('src/lib/resend.js');

  assert.match(
    envExample,
    /^INBOUND_NOTIFICATION_EMAILS=tasi\.comms@csrindia\.org$/m
  );
  assert.match(
    envExample,
    /^APPLICATION_COMMS_EMAIL=tasi\.comms@csrindia\.org$/m
  );
  assert.match(resendSource, /getApplicationCommsEmail/);
  assert.match(resendSource, /replyTo: \[replyEmail\]/);
  assert.match(resendSource, /showSupportFooter: false/);
});
