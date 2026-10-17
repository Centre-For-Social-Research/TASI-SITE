const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  deriveSpeakerPhotoState,
  normalizeDriveUrl,
  normalizeSpeakerPhotoInput,
  normalizeSpeakerPhotoRow,
  summarizeSpeakerPhotos,
} = require('../src/lib/speaker-photos-utils.cjs');
const {
  SPEAKER_COMMS_REPLY_TO,
  buildSpeakerPhotosEmail,
} = require('../src/lib/speaker-photos-email.cjs');

const FOLDER = 'https://drive.google.com/drive/folders/1AbC_def-123';

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('only Google Drive folder links are accepted, in one clean form', () => {
  assert.equal(normalizeDriveUrl(`${FOLDER}?usp=drive_link`), FOLDER);
  assert.equal(
    normalizeDriveUrl(
      'https://drive.google.com/drive/u/0/folders/1AbC_def-123'
    ),
    FOLDER
  );
  assert.equal(normalizeDriveUrl(''), null);
  for (const bad of [
    'http://drive.google.com/drive/folders/1AbC',
    'https://drive.google.com/file/d/1AbC/view',
    'https://evil.example/drive/folders/1AbC',
    'not a link',
  ]) {
    assert.throws(() => normalizeDriveUrl(bad), /Google Drive folder link/);
  }
});

test('speaker photo input validates emails and photo count', () => {
  const input = normalizeSpeakerPhotoInput({
    name: 'Dr. Ranjana Kumari',
    emails: 'A@csrindia.org, a@csrindia.org',
    driveUrl: FOLDER,
    photoCount: '295',
  });
  assert.equal(input.nameKey, 'ranjana-kumari');
  assert.deepEqual(input.emails, ['a@csrindia.org']);
  assert.equal(input.photoCount, 295);
  assert.throws(
    () => normalizeSpeakerPhotoInput({ name: 'X', photoCount: '2.5' }),
    /whole number/
  );
});

test('photo state tells the operator what is missing or done', () => {
  const base = { status: 'draft', emails: ['a@b.org'], driveUrl: FOLDER };
  assert.equal(deriveSpeakerPhotoState(base), 'ready');
  assert.equal(
    deriveSpeakerPhotoState({ ...base, driveUrl: null }),
    'needs_link'
  );
  assert.equal(deriveSpeakerPhotoState({ ...base, emails: [] }), 'needs_email');
  assert.equal(
    deriveSpeakerPhotoState({ ...base, status: 'failed' }),
    'failed'
  );
  assert.equal(
    deriveSpeakerPhotoState({
      ...base,
      status: 'sent',
      lastSentDriveUrl: FOLDER,
    }),
    'sent'
  );
  assert.equal(
    deriveSpeakerPhotoState({
      ...base,
      status: 'sent',
      lastSentDriveUrl: 'https://drive.google.com/drive/folders/old',
    }),
    'link_updated'
  );
});

test('summary counts speakers once and adds up photos', () => {
  const rows = [
    { status: 'draft', emails: ['a@b.org'], drive_url: FOLDER, photo_count: 3 },
    { status: 'draft', emails: [], drive_url: FOLDER, photo_count: 2 },
    {
      status: 'sent',
      emails: ['c@d.org'],
      drive_url: FOLDER,
      last_sent_drive_url: FOLDER,
      photo_count: 5,
    },
  ].map(normalizeSpeakerPhotoRow);
  assert.deepEqual(summarizeSpeakerPhotos(rows), {
    total: 3,
    ready: 1,
    sent: 1,
    needsEmail: 1,
    needsLink: 0,
    attention: 0,
    photos: 10,
  });
});

test('photo email links the speaker to their own folder', () => {
  const email = buildSpeakerPhotosEmail({
    name: 'Lucy Thomas',
    edition: '2026',
    driveUrl: FOLDER,
    photoCount: 42,
    siteUrl: 'https://trustandsafetyindia.org/',
  });
  assert.equal(email.subject, 'Your photos from TASI 2026');
  assert.match(email.html, /Dear Lucy Thomas,/);
  assert.match(email.html, new RegExp(`href="${FOLDER}"`));
  assert.match(email.html, /View your photos/);
  assert.match(email.html, /the 42 photos of you/);
  assert.match(email.html, /#TASI2026/);
  assert.match(email.html, /cid:tasi-logo/);
  assert.match(email.text, new RegExp(`View your photos: ${FOLDER}`));
  assert.match(email.text, new RegExp(SPEAKER_COMMS_REPLY_TO));
  assert.doesNotMatch(email.html, /—/);
});

test('photo email handles one photo, no count, test sends and markup in names', () => {
  const one = buildSpeakerPhotosEmail({
    name: 'A',
    edition: '2026',
    driveUrl: FOLDER,
    photoCount: 1,
  });
  assert.match(one.text, /the photo of you/);
  const none = buildSpeakerPhotosEmail({
    name: 'A',
    edition: '2026',
    driveUrl: FOLDER,
  });
  assert.match(none.text, /the photos of you/);
  const testEmail = buildSpeakerPhotosEmail({
    name: '<b>X</b>',
    edition: '2026',
    driveUrl: FOLDER,
    test: true,
  });
  assert.equal(testEmail.subject, '[TEST] Your photos from TASI 2026');
  assert.match(testEmail.html, /Test email\. This was not sent/);
  assert.doesNotMatch(testEmail.html, /<b>X<\/b>/);
  assert.throws(
    () => buildSpeakerPhotosEmail({ name: 'A', edition: '2026' }),
    /Drive link/
  );
});

test('every photo change requires an admin; reads allow reviewers', () => {
  const base = 'src/app/api/admin/speaker-photos';
  for (const file of [
    '[id]/send/route.js',
    '[id]/retry/route.js',
    '[id]/test/route.js',
  ]) {
    const source = readSource(`${base}/${file}`);
    assert.match(source, /requireAdminOperator/, file);
    assert.doesNotMatch(source, /requireAuthorizedOperator/, file);
  }
  assert.match(
    readSource(`${base}/[id]/route.js`),
    /export async function PATCH[\s\S]*requireAdminOperator/
  );
});

test('photo sends reuse the durable attempt and idempotency pattern', () => {
  const source = readSource('src/lib/speaker-photos-send.js');
  assert.match(source, /claimSpeakerPhotoSend/);
  assert.match(source, /prepareSpeakerPhotoSendRequest/);
  assert.match(source, /idempotencyKey: `speaker-photos\/\$\{attempt\.id\}`/);
  assert.match(source, /speaker\.state === 'sent' && !resend/);

  const migration = readSource(
    'supabase/migrations/20261017120000_speaker_photo_links.sql'
  );
  assert.match(migration, /idx_speaker_photo_one_active_send/);
  assert.match(migration, /claim_speaker_photo_send/);
  assert.match(readSource('supabase/schema.sql'), /speaker_photo_deliveries/);
});

test('the badge tab is kept and the photos tab sits beside it', () => {
  const page = readSource('src/app/admin/speaker-communications/page.jsx');
  assert.match(page, /SpeakerCommunicationsTabs/);
  const tabs = readSource(
    'src/components/admin/speaker-communications-tabs.jsx'
  );
  assert.match(tabs, /SpeakerCommunicationsPanel/);
  assert.match(tabs, /SpeakerPhotosPanel/);
});
