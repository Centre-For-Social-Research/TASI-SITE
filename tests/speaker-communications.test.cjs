const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  buildSpeakerNameKey,
  deriveSpeakerBadgeState,
  isValidDownloadToken,
  normalizeEdition,
  normalizeSpeakerBadgeRow,
  normalizeSpeakerInput,
  parseSpeakerEmails,
  speakerBadgeDownloadFilename,
  speakerErrorStatus,
  speakerNameFromFilename,
  summarizeSpeakerBadges,
} = require('../src/lib/speaker-communications-utils.cjs');
const {
  SPEAKER_COMMS_REPLY_TO,
  buildSpeakerBadgeDownloadUrl,
  buildSpeakerBadgeEmail,
} = require('../src/lib/speaker-badge-email.cjs');
const { buildAdminNavigation } = require('../src/lib/admin-shell-utils.cjs');

function readSource(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

test('badge file names match speakers regardless of honorifics, case or copies', () => {
  assert.equal(speakerNameFromFilename('Yoel Roth.png'), 'Yoel Roth');
  assert.equal(
    speakerNameFromFilename('C:\\badges\\Yoel Roth (1).png'),
    'Yoel Roth'
  );
  assert.equal(
    buildSpeakerNameKey('Dr. Ranjana Kumari'),
    buildSpeakerNameKey('ranjana kumari')
  );
  assert.equal(buildSpeakerNameKey('Prof. Dr. Manoj Shakya'), 'manoj-shakya');
  assert.equal(buildSpeakerNameKey('H.E. Marisa Gerards'), 'marisa-gerards');
  assert.equal(buildSpeakerNameKey('M. C. Rasmin'), 'm-c-rasmin');
  assert.equal(buildSpeakerNameKey('Başarbatu Can'), 'basarbatu-can');
  assert.equal(buildSpeakerNameKey('JC Le Toquin'), 'jc-le-toquin');
});

test('speaker emails accept up to three valid, de-duplicated addresses', () => {
  assert.deepEqual(parseSpeakerEmails(''), []);
  assert.deepEqual(
    parseSpeakerEmails(
      ' MS.NCPCR@nic.in, sanjeevsharma.edu@nic.in; ms.ncpcr@nic.in '
    ),
    ['ms.ncpcr@nic.in', 'sanjeevsharma.edu@nic.in']
  );
  assert.throws(() => parseSpeakerEmails('not-an-email'), /not a valid email/);
  assert.throws(
    () => parseSpeakerEmails('a@x.org, b@x.org, c@x.org, d@x.org'),
    /at most 3/
  );
});

test('speaker input strips markup and requires a name', () => {
  assert.deepEqual(
    normalizeSpeakerInput({
      name: ' Dr. Abigail <b>Bentley</b> ',
      emails: 'abigail@abresearchconsulting.com',
      organization: ' AB Research ',
    }),
    {
      name: 'Dr. Abigail bBentley/b',
      nameKey: 'abigail-bbentley-b',
      emails: ['abigail@abresearchconsulting.com'],
      designation: null,
      organization: 'AB Research',
    }
  );
  assert.throws(() => normalizeSpeakerInput({ name: ' ' }), /name is required/);
});

test('only configured editions are accepted', () => {
  assert.equal(normalizeEdition(''), '2026');
  assert.equal(normalizeEdition('2026'), '2026');
  assert.throws(() => normalizeEdition('1999'), /not configured/);
});

test('badge state tells the operator exactly what is missing or done', () => {
  const base = { status: 'draft', emails: ['a@x.org'], badgeSha256: 'abc' };
  assert.equal(deriveSpeakerBadgeState(base), 'ready');
  assert.equal(deriveSpeakerBadgeState({ ...base, emails: [] }), 'needs_email');
  assert.equal(
    deriveSpeakerBadgeState({ ...base, badgeSha256: null }),
    'needs_badge'
  );
  assert.equal(
    deriveSpeakerBadgeState({ ...base, status: 'failed' }),
    'failed'
  );
  assert.equal(
    deriveSpeakerBadgeState({ ...base, status: 'sending' }),
    'sending'
  );
  assert.equal(
    deriveSpeakerBadgeState({
      ...base,
      status: 'sent',
      lastSentBadgeSha256: 'abc',
    }),
    'sent'
  );
  assert.equal(
    deriveSpeakerBadgeState({
      ...base,
      status: 'sent',
      lastSentBadgeSha256: 'old',
    }),
    'badge_updated'
  );
});

test('speaker rows never expose the storage path or download token', () => {
  const row = normalizeSpeakerBadgeRow({
    id: 'sp-1',
    edition: '2026',
    speaker_name: 'Yoel Roth',
    name_key: 'yoel-roth',
    emails: ['yoel.roth@match.com'],
    badge_path: '2026/sp-1.png',
    badge_sha256: 'abc',
    download_token: 'secret',
    status: 'draft',
  });
  assert.equal(row.hasBadge, true);
  assert.equal(row.state, 'ready');
  assert.equal('badgePath' in row, false);
  assert.equal(JSON.stringify(row).includes('secret'), false);
  assert.equal(JSON.stringify(row).includes('2026/sp-1.png'), false);
});

test('summary counts each speaker once', () => {
  const summary = summarizeSpeakerBadges([
    { state: 'ready' },
    { state: 'ready' },
    { state: 'sent' },
    { state: 'needs_email' },
    { state: 'failed' },
  ]);
  assert.deepEqual(summary, {
    total: 5,
    ready: 2,
    sent: 1,
    needsEmail: 1,
    needsBadge: 0,
    attention: 1,
  });
});

test('download tokens must be 32 random bytes in base64url', () => {
  assert.equal(isValidDownloadToken('a'.repeat(43)), true);
  assert.equal(isValidDownloadToken('a'.repeat(42)), false);
  assert.equal(isValidDownloadToken('../../etc/passwd'), false);
  assert.equal(
    speakerBadgeDownloadFilename({
      name: 'Dr. Ranjana Kumari',
      edition: '2026',
    }),
    'TASI-2026-Speaker-Badge-ranjana-kumari.png'
  );
});

test('error messages map to the right HTTP status', () => {
  assert.equal(speakerErrorStatus('Speaker not found.'), 404);
  assert.equal(speakerErrorStatus('Add an email address for X first.'), 400);
  assert.equal(speakerErrorStatus('x is not a valid email address.'), 400);
  assert.equal(
    speakerErrorStatus('Yoel Roth has already been sent this badge.'),
    409
  );
  assert.equal(speakerErrorStatus('Resend is not configured.'), 503);
  assert.equal(speakerErrorStatus('boom'), 500);
});

test('badge email is the fixed template with the download link and CSR reply-to', () => {
  const downloadUrl = buildSpeakerBadgeDownloadUrl({
    siteUrl: 'https://trustandsafetyindia.org/',
    token: 'a'.repeat(43),
  });
  assert.equal(
    downloadUrl,
    `https://trustandsafetyindia.org/badge/${'a'.repeat(43)}`
  );
  assert.equal(SPEAKER_COMMS_REPLY_TO, 'tasi.comms@csrindia.org');

  const email = buildSpeakerBadgeEmail({
    name: 'Yoel <Roth>',
    edition: '2026',
    downloadUrl,
  });
  assert.equal(email.subject, 'Your speaker badge for TASI 2026');
  assert.match(email.text, /Dear Yoel <Roth>,/);
  assert.match(
    email.text,
    /Download your badge: https:\/\/trustandsafetyindia\.org\/badge\//
  );
  assert.match(
    email.text,
    /Centre for Social Research India and Trust & Safety Forum/
  );
  assert.match(email.html, /Dear Yoel &lt;Roth&gt;,/);
  assert.match(email.html, /Download your badge<\/a>/);
  assert.match(email.html, /mailto:tasi\.comms@csrindia\.org/);
  assert.doesNotMatch(email.html, /Test email/);
});

test('test badge email is clearly marked', () => {
  const email = buildSpeakerBadgeEmail({
    name: 'Yoel Roth',
    edition: '2026',
    downloadUrl: 'https://example.org/badge/x',
    test: true,
  });
  assert.equal(email.subject, '[TEST] Your speaker badge for TASI 2026');
  assert.match(email.html, /Test email\. This was not sent to the speaker\./);
});

test('admin navigation lists Speaker Communications', () => {
  const sections = buildAdminNavigation({
    pathname: '/admin/speaker-communications',
  });
  const item = sections[0].items.find(
    ({ href }) => href === '/admin/speaker-communications'
  );
  assert.equal(item.label, 'Speaker Communications');
  assert.equal(item.active, true);
});

test('every speaker change requires an admin; reads allow reviewers', () => {
  const base = 'src/app/api/admin/speaker-communications';
  for (const file of [
    'badges/route.js',
    '[id]/send/route.js',
    '[id]/retry/route.js',
    '[id]/test/route.js',
  ]) {
    const source = readSource(`${base}/${file}`);
    assert.match(source, /requireAdminOperator/, file);
    assert.doesNotMatch(source, /requireAuthorizedOperator/, file);
  }
  const itemSource = readSource(`${base}/[id]/route.js`);
  assert.match(
    itemSource,
    /export async function PATCH[\s\S]*requireAdminOperator/
  );
  assert.match(
    itemSource,
    /export async function DELETE[\s\S]*requireAdminOperator/
  );
});

test('sends reuse the durable attempt and idempotency pattern', () => {
  const source = readSource('src/lib/speaker-badge-send.js');
  assert.match(source, /claimSpeakerBadgeSend/);
  assert.match(source, /prepareSpeakerBadgeSendRequest/);
  assert.match(
    source,
    /idempotencyKey: speakerBadgeIdempotencyKey\(attempt\.id\)/
  );
  assert.match(source, /speaker\.state === 'sent' && !resend/);

  const migration = readSource(
    'supabase/migrations/20260929164423_speaker_communications.sql'
  );
  assert.match(migration, /idx_speaker_badge_one_active_send/);
  assert.match(migration, /'speaker-badges', 'speaker-badges', false/);
});

test('public badge download validates the token before touching storage', () => {
  const source = readSource('src/app/badge/[token]/route.js');
  const tokenCheck = source.indexOf('isValidDownloadToken(token)');
  const lookup = source.indexOf('getSpeakerBadgeByDownloadToken(token)');
  assert.ok(tokenCheck > 0 && lookup > tokenCheck);
  assert.match(source, /protectPublicRoute/);
  assert.match(source, /noindex/);
});
