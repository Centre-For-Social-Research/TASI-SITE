const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULT_COMMS_EMAIL,
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
  assert.match(email.html, /Speaker application received/);
  assert.match(email.html, /Dear Saquib &amp; Team,/);
  assert.match(email.html, /Safety &lt;by design&gt;/);
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
  assert.match(email.html, /Volunteer application received/);
  assert.match(email.text, /Speaker support/);
  assert.match(email.text, /Both event days/);
  assert.match(email.text, /does not confirm a volunteer placement/);
  assert.match(email.html, new RegExp(DEFAULT_COMMS_EMAIL));
  assert.doesNotMatch(email.html, /india@trustandsafetyfestival\.com/);
});

test('speaker and volunteer routes send acknowledgements only to the submitted applicant', () => {
  for (const relativePath of [
    'src/app/api/speaker-application/route.js',
    'src/app/api/volunteer-application/route.js',
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
});
