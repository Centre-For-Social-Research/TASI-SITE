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
  SOCIAL_ICON_FILES,
  SPEAKER_COMMS_REPLY_TO,
  buildSpeakerBadgeDownloadUrl,
  buildSpeakerBadgeEmail,
} = require('../src/lib/speaker-badge-email.cjs');
const {
  buildSpeakerShareCaptions,
  buildSpeakerShareLinks,
} = require('../src/lib/speaker-badge-share.cjs');
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

test('badge email is the fixed template with badge, share buttons and plan-ahead details', () => {
  const token = 'a'.repeat(43);
  assert.equal(
    buildSpeakerBadgeDownloadUrl({
      siteUrl: 'https://trustandsafetyindia.org/',
      token,
    }),
    `https://trustandsafetyindia.org/badge/${token}/image?download=1`
  );
  assert.equal(SPEAKER_COMMS_REPLY_TO, 'tasi.comms@csrindia.org');

  const email = buildSpeakerBadgeEmail({
    name: 'Yoel <Roth>',
    edition: '2026',
    siteUrl: 'https://trustandsafetyindia.org',
    token,
  });
  assert.equal(email.subject, 'Your speaker badge for TASI 2026');
  assert.match(email.text, /Dear Yoel <Roth>,/);
  assert.match(email.html, /Dear Yoel &lt;Roth&gt;,/);
  assert.match(email.html, /src="cid:speaker-badge"/);
  assert.match(email.html, /Download your badge<\/a>/);
  assert.match(
    email.text,
    /Thank you for confirming as a speaker for TASI 2026/
  );
  for (const platform of ['linkedin', 'x', 'facebook', 'instagram']) {
    assert.match(email.html, new RegExp(`src="cid:social-${platform}"`));
  }
  assert.doesNotMatch(email.html, /cid:tasi-delhi-footer/);
  assert.match(
    email.html,
    /src="https:\/\/trustandsafetyindia\.org\/img\/email\/tasi-2026-delhi-footer\.jpeg"/
  );
  assert.match(
    email.html,
    /Thank you for confirming as a speaker for TASI 2026/
  );
  assert.match(email.html, /Invite @csr_india as a collaborator/);
  // Only the collaboration note sits under the single icon row.
  assert.ok(
    email.html.indexOf('Invite @csr_india') >
      email.html.lastIndexOf('cid:social-')
  );
  assert.doesNotMatch(email.html, /Make it a collaborative post/);
  assert.doesNotMatch(email.html, /Help build the buzz by reposting/);
  assert.doesNotMatch(email.html, /open with the caption ready/);
  assert.equal((email.html.match(/cid:social-/g) || []).length, 4);
  assert.match(email.html, /linkedin\.com\/feed\/\?shareActive=true&amp;text=/);
  assert.match(email.html, /twitter\.com\/intent\/tweet\?text=/);
  assert.match(email.html, /facebook\.com\/sharer\/sharer\.php\?u=/);
  assert.doesNotMatch(email.html, /Plan ahead|Add to calendar|\.ics/);
  assert.equal('calendarContent' in email, false);
  assert.match(email.html, /Programme &amp; agenda/);
  assert.match(email.html, /Venue map/);
  assert.match(email.html, /mailto:tasi\.comms@csrindia\.org/);
  assert.doesNotMatch(email.html, /Test email/);
});

test('share captions tag CSR and TASI on each platform', () => {
  const pageUrl = `https://trustandsafetyindia.org/badge/${'a'.repeat(43)}`;
  const captions = buildSpeakerShareCaptions({
    edition: '2026',
    badgePageUrl: pageUrl,
  });
  assert.match(captions.linkedin, /@Centre for Social Research India/);
  assert.match(captions.linkedin, /@TASI Festival/);
  assert.match(captions.x, /@CSR_India/);
  assert.match(captions.instagram, /@csr_india/);
  assert.match(captions.facebook, /@Centre for Social Research/);
  assert.match(captions.display, /@TASI Festival/);
  assert.doesNotMatch(captions.display, /https:/);
  for (const caption of Object.values(captions)) {
    assert.match(caption, /#TASI2026/);
  }
  // X counts any link as 23 characters.
  const xLength = captions.x.replace(pageUrl, 'x'.repeat(23)).length;
  assert.ok(xLength <= 280, `X caption is ${xLength} characters`);

  const links = buildSpeakerShareLinks({ captions, badgePageUrl: pageUrl });
  assert.equal(
    new URL(links.linkedin).searchParams.get('text'),
    captions.linkedin
  );
  assert.equal(new URL(links.x).searchParams.get('text'), captions.x);
  assert.equal(new URL(links.facebook).searchParams.get('u'), pageUrl);
  assert.equal(links.instagram, `${pageUrl}?share=instagram`);
});

test('every embedded brand icon exists in public/img/email/social', () => {
  for (const { filename, contentId } of SOCIAL_ICON_FILES) {
    assert.ok(
      fs.existsSync(
        path.join(process.cwd(), 'public', 'img', 'email', 'social', filename)
      ),
      filename
    );
    assert.match(contentId, /^social-(linkedin|x|facebook|instagram)$/);
  }
  const send = readSource('src/lib/speaker-badge-send.js');
  for (const { filename } of SOCIAL_ICON_FILES) {
    assert.match(
      send,
      new RegExp(`'social', '${filename.replace('.', '\.')}'`)
    );
  }
});

test('test badge email is clearly marked', () => {
  const email = buildSpeakerBadgeEmail({
    name: 'Yoel Roth',
    edition: '2026',
    siteUrl: 'https://example.org',
    token: 'a'.repeat(43),
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

test('public badge image validates the token before touching storage', () => {
  const source = readSource('src/app/badge/[token]/image/route.js');
  const tokenCheck = source.indexOf('isValidDownloadToken(token)');
  const lookup = source.indexOf('getSpeakerBadgeByDownloadToken(token)');
  assert.ok(tokenCheck > 0 && lookup > tokenCheck);
  assert.match(source, /protectPublicRoute/);
  assert.match(source, /noindex/);
  assert.match(source, /download \? 'attachment' : 'inline'/);

  const page = readSource('src/app/badge/[token]/page.jsx');
  assert.match(page, /isValidDownloadToken\(token\)/);
  assert.match(page, /robots: \{ index: false, follow: false \}/);
  assert.match(page, /\/badge\/\$\{token\}\/image/);
});

test('profile link appears only for speakers in the public directory', () => {
  const {
    findSpeakerProfilePath,
  } = require('../src/lib/speaker-badge-profile.cjs');
  assert.equal(
    findSpeakerProfilePath({ name: 'Dr. Ranjana Kumari', edition: '2026' }),
    '/speakers/2026/dr-ranjana-kumari'
  );
  assert.equal(
    findSpeakerProfilePath({ name: 'Not A Listed Speaker', edition: '2026' }),
    null
  );
  assert.equal(
    findSpeakerProfilePath({ name: 'Dr. Ranjana Kumari', edition: '1999' }),
    null
  );

  const base = {
    edition: '2026',
    siteUrl: 'https://trustandsafetyindia.org',
    token: 'a'.repeat(43),
  };
  const listed = buildSpeakerBadgeEmail({
    ...base,
    name: 'Dr. Ranjana Kumari',
  });
  assert.match(
    listed.html,
    /href="https:\/\/trustandsafetyindia\.org\/speakers\/2026\/dr-ranjana-kumari"[^>]*>View your profile<\/a>/
  );
  assert.match(listed.text, /Your speaker profile is now live/);

  const unlisted = buildSpeakerBadgeEmail({
    ...base,
    name: 'Not A Listed Speaker',
  });
  assert.doesNotMatch(unlisted.html, /View your profile/);
  assert.doesNotMatch(unlisted.text, /Your speaker profile/);
});

test('badge email invites others to register and asks for badge checks in the footer', () => {
  const email = buildSpeakerBadgeEmail({
    name: 'Yoel Roth',
    edition: '2026',
    siteUrl: 'https://trustandsafetyindia.org',
    token: 'a'.repeat(43),
  });
  assert.match(
    email.html,
    /Invite them to register for TASI 2026 at <a href="https:\/\/trustandsafetyindia\.org\/register"/
  );
  const check = email.html.indexOf('Please check that your name, designation');
  assert.ok(
    check > email.html.indexOf('Team TASI'),
    'badge check is in the footer'
  );
  assert.match(email.text, /trustandsafetyindia\.org\/register/);
});
