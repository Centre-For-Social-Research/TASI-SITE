const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  CODE_ALPHABET,
  buildLinkedInAddUrl,
  buildVerifyUrl,
  certificateFileName,
  cleanCertificateName,
  isValidCertificateCode,
  isValidClaimToken,
  nameFromRegistration,
  newCertificateCode,
  newClaimToken,
  normalizeCertificateCode,
  smartTitleCase,
  validateCertificateName,
} = require('../src/lib/certificate-utils.cjs');
const {
  buildCertificateCodeEmail,
  buildCertificateEmail,
} = require('../src/lib/certificates-email.cjs');
const {
  SESSION_TTL_MS,
  createSessionValue,
  hashEmailCode,
  isLinkExpired,
  linkExpiryFrom,
  maskEmail,
  newEmailCode,
  readSessionValue,
} = require('../src/lib/certificate-session.cjs');
const { buildAdminNavigation } = require('../src/lib/admin-shell-utils.cjs');

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

test('certificate codes are random, unambiguous and well formed', () => {
  const codes = new Set(
    Array.from({ length: 2000 }, () => newCertificateCode('2026'))
  );
  assert.equal(codes.size, 2000);
  for (const code of codes) {
    assert.match(code, /^TASI26-[A-Z0-9]{8}$/);
    assert.ok(isValidCertificateCode(code));
    assert.doesNotMatch(code.slice(7), /[01OIL]/);
  }
  assert.ok(!/[01OIL]/.test(CODE_ALPHABET));
  assert.ok(isValidCertificateCode(' tasi26-abcd2345 '));
  assert.equal(
    normalizeCertificateCode(' tasi26-abcd2345 '),
    'TASI26-ABCD2345'
  );
  assert.ok(!isValidCertificateCode('TASI26-ABCD0345'));
  assert.ok(!isValidCertificateCode('TASI26-ABC'));
});

test('download links use 256-bit tokens', () => {
  const token = newClaimToken();
  assert.ok(isValidClaimToken(token));
  assert.equal(Buffer.from(token, 'base64url').length, 32);
  assert.ok(!isValidClaimToken('short'));
  assert.ok(!isValidClaimToken(`${token}!`));
});

test('names are tidied only when typed all in one case', () => {
  assert.equal(smartTitleCase('RAHUL RAWAT'), 'Rahul Rawat');
  assert.equal(smartTitleCase('kanzil rodrigues'), 'Kanzil Rodrigues');
  assert.equal(smartTitleCase("o'BRIEN-smith"), "o'BRIEN-smith");
  assert.equal(smartTitleCase('McDonald'), 'McDonald');
  assert.equal(
    nameFromRegistration({ firstName: ' PRASANTH ', lastName: 'PR' }),
    'Prasanth Pr'
  );
  assert.equal(cleanCertificateName('  Ana   María  '), 'Ana María');
});

test('certificate names allow Latin letters and accents only', () => {
  assert.equal(
    validateCertificateName('Jarūnė Preikšaitė'),
    'Jarūnė Preikšaitė'
  );
  assert.equal(
    validateCertificateName('Dr. Seán O’Neil-Smith'),
    'Dr. Seán O’Neil-Smith'
  );
  for (const bad of [
    '',
    'A',
    '<b>Hi</b>',
    'Name 123',
    'नमस्ते',
    'x'.repeat(81),
    'https://evil.example',
  ]) {
    assert.throws(() => validateCertificateName(bad));
  }
});

test('verification and LinkedIn links point at the public verify page', () => {
  const url = buildVerifyUrl({
    siteUrl: 'https://trustandsafetyindia.org/',
    code: 'TASI26-ABCD2345',
  });
  assert.equal(
    url,
    'https://trustandsafetyindia.org/certificates/verify/TASI26-ABCD2345'
  );
  const li = new URL(
    buildLinkedInAddUrl({
      edition: '2026',
      code: 'TASI26-ABCD2345',
      siteUrl: 'https://trustandsafetyindia.org',
    })
  );
  assert.equal(li.hostname, 'www.linkedin.com');
  assert.equal(li.searchParams.get('certId'), 'TASI26-ABCD2345');
  assert.equal(li.searchParams.get('certUrl'), url);
  assert.equal(
    li.searchParams.get('organizationName'),
    'Centre for Social Research'
  );
  assert.equal(
    certificateFileName({ name: 'Jarūnė Preikšaitė', code: 'TASI26-ABCD2345' }),
    'TASI-2026-Certificate-Jarune-Preiksaite-TASI26-ABCD2345.pdf'
  );
});

test('the certificate email links to the private page and escapes names', () => {
  const email = buildCertificateEmail({
    name: '<b>Ana</b>',
    edition: '2026',
    token: 'T'.repeat(43),
    siteUrl: 'https://trustandsafetyindia.org',
  });
  assert.equal(
    email.subject,
    'Thank you for joining TASI 2026: your certificate'
  );
  assert.match(email.text, /one-time code/);
  assert.match(email.text, /works for 30 days/);
  assert.match(email.text, /#TASI2026/);
  assert.ok(
    email.html.includes(
      `https://trustandsafetyindia.org/certificates/${'T'.repeat(43)}`
    )
  );
  assert.doesNotMatch(email.html, /<b>Ana<\/b>/);
  assert.match(
    email.text,
    /Get your certificate: https:\/\/trustandsafetyindia\.org\/certificates\//
  );
  assert.doesNotMatch(email.html, /—/);
  const testEmail = buildCertificateEmail({
    name: 'A',
    edition: '2026',
    token: 'x',
    test: true,
  });
  assert.match(testEmail.subject, /^\[TEST\]/);
});

test('the certificate is not a public file and the signature stays private', () => {
  assert.ok(
    fs.existsSync('src/assets/certificates/tasi-2026-attendee-template.jpg')
  );
  assert.ok(!fs.existsSync('public/certificates'));
  const pdf = read('src/lib/certificate-pdf.js');
  assert.match(pdf, /src', 'assets', 'certificates'/);
  assert.doesNotMatch(pdf, /path\.join\([^)]*'public'/);
});

test('tokens are stored hashed and never selected for clients', () => {
  const db = read('src/lib/certificates-db.js');
  assert.match(db, /createHash\('sha256'\)/);
  const select = db.slice(
    db.indexOf('const CERT_SELECT'),
    db.indexOf('`;', db.indexOf('const CERT_SELECT'))
  );
  assert.doesNotMatch(select, /claim_token/);
  const migration = read(
    'supabase/migrations/20261020120000_attendee_certificates.sql'
  );
  assert.match(migration, /claim_token_hash text not null unique/);
  assert.doesNotMatch(migration, /claim_token text/);
  assert.match(read('supabase/schema.sql'), /attendee_certificate_events/);
});

test('public routes are rate limited, validate input and leak nothing', () => {
  for (const file of [
    'src/app/api/certificates/[token]/pdf/route.js',
    'src/app/api/certificates/[token]/name/route.js',
    'src/app/api/certificates/request/route.js',
    'src/app/api/certificates/[token]/code/route.js',
    'src/app/api/certificates/[token]/session/route.js',
    'src/app/api/certificates/check/route.js',
  ]) {
    const source = read(file);
    assert.match(source, /protectPublic(Post)?Route/, file);
  }
  assert.match(
    read('src/lib/certificate-access.js'),
    /isValidClaimToken\(token\)/
  );
  assert.match(
    read('src/app/api/certificates/[token]/pdf/route.js'),
    /no-store/
  );
  assert.match(
    read('src/app/api/certificates/request/route.js'),
    /NEUTRAL_MESSAGE/
  );
  const verify = read('src/app/certificates/verify/[code]/page.jsx');
  assert.doesNotMatch(verify, /record\.(email|organization|registration)/);
  assert.match(
    read('src/lib/certificates-db.js'),
    /select\('code,edition,recipient_name,status,issued_at'\)/
  );
  assert.match(
    read('src/app/certificates/[token]/page.jsx'),
    /referrer: 'no-referrer'/
  );
});

test('every admin change requires an admin; reads allow reviewers', () => {
  const base = 'src/app/api/admin/certificates';
  for (const file of [
    '[id]/send/route.js',
    '[id]/test/route.js',
    '[id]/revoke/route.js',
  ]) {
    const source = read(`${base}/${file}`);
    assert.match(source, /requireAdminOperator/, file);
    assert.doesNotMatch(source, /requireAuthorizedOperator/, file);
  }
  assert.match(
    read(`${base}/route.js`),
    /export async function POST[\s\S]*requireAdminOperator/
  );
  assert.match(
    read(`${base}/[id]/route.js`),
    /export async function PATCH[\s\S]*requireAdminOperator/
  );
  assert.match(read(`${base}/[id]/pdf/route.js`), /sample: true/);
});

test('eligibility excludes speakers and walk-ins', () => {
  const migration = read(
    'supabase/migrations/20261020120000_attendee_certificates.sql'
  );
  assert.match(migration, /r\.status = 'confirmed'/);
  assert.match(migration, /r\.speaker_flag = false/);
  assert.match(migration, /r\.priority_tier <> 'Speakers'/);
  assert.doesNotMatch(
    migration.slice(migration.indexOf('attendee_certificate_eligible')),
    /spot_registrations r/
  );
});

test('admin navigation lists Certificates', () => {
  const items = buildAdminNavigation({
    pathname: '/admin/certificates',
  }).flatMap((group) => group.items);
  const item = items.find((entry) => entry.href === '/admin/certificates');
  assert.equal(item.label, 'Certificates');
  assert.equal(item.active, true);
});

test('sessions are signed, bound to the current link and expire', () => {
  process.env.CERTIFICATE_SESSION_SECRET = 's'.repeat(40);
  const tokenHash = 'a'.repeat(64);
  const now = Date.now();
  const value = createSessionValue({ certificateId: 'c1', tokenHash, now });
  assert.ok(readSessionValue(value, { certificateId: 'c1', tokenHash, now }));
  assert.ok(!readSessionValue(value, { certificateId: 'c2', tokenHash, now }));
  assert.ok(
    !readSessionValue(value, {
      certificateId: 'c1',
      tokenHash: 'b'.repeat(64),
      now,
    })
  );
  assert.ok(
    !readSessionValue(value, {
      certificateId: 'c1',
      tokenHash,
      now: now + SESSION_TTL_MS + 1,
    })
  );
  const [payload, signature] = value.split('.');
  const forged = Buffer.from(
    JSON.stringify({ c: 'c2', t: tokenHash.slice(0, 16), e: now + 1e9 })
  ).toString('base64url');
  assert.ok(
    !readSessionValue(`${forged}.${signature}`, {
      certificateId: 'c2',
      tokenHash,
      now,
    })
  );
  assert.ok(
    !readSessionValue(`${payload}.x`, { certificateId: 'c1', tokenHash, now })
  );
  assert.ok(!readSessionValue('', { certificateId: 'c1', tokenHash, now }));
});

test('email codes are six digits, stored hashed per certificate', () => {
  for (let i = 0; i < 200; i += 1) assert.match(newEmailCode(), /^\d{6}$/);
  const hash = hashEmailCode({ certificateId: 'c1', code: '012345' });
  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.notEqual(hash, hashEmailCode({ certificateId: 'c2', code: '012345' }));
  assert.equal(hash, hashEmailCode({ certificateId: 'c1', code: ' 012345 ' }));
  const email = buildCertificateCodeEmail({
    name: '<i>Ana</i>',
    code: '012345',
  });
  assert.match(email.subject, /^012345 /);
  assert.doesNotMatch(email.html, /<i>Ana<\/i>/);
  assert.match(email.text, /\nWarm regards,\nTeam TASI$/);
  assert.match(email.html, /cid:tasi-logo/);
  const local = buildCertificateEmail({
    name: 'A',
    edition: '2026',
    token: 'x',
    siteUrl: 'http://localhost:3131',
  });
  for (const built of [email, local]) {
    assert.match(
      built.html,
      /src="https:\/\/trustandsafetyindia\.org\/img\/email\/tasi-2026-delhi-footer\.jpeg"/
    );
  }
  const db = read('src/lib/certificates-db.js');
  assert.match(db, /MAX_CODE_ATTEMPTS/);
  const migration = read(
    'supabase/migrations/20261020180000_attendee_certificate_security.sql'
  );
  assert.match(migration, /code_hash text not null/);
  assert.doesNotMatch(migration, /[^_]code text/);
});

test('links expire after 30 days and emails are masked', () => {
  const now = Date.parse('2026-10-20T00:00:00Z');
  const expiry = linkExpiryFrom(now);
  assert.equal(expiry, '2026-11-19T00:00:00.000Z');
  assert.ok(!isLinkExpired(expiry, now));
  assert.ok(isLinkExpired(expiry, Date.parse(expiry)));
  assert.ok(!isLinkExpired(null, now));
  assert.equal(maskEmail('saquib@csrindia.org'), 'sa••••@csrindia.org');
  assert.equal(maskEmail('ab@x.org'), 'a•••@x.org');
  assert.equal(maskEmail('nope'), '');
});

test('downloads need a session and a confirmed, locked name', () => {
  const pdf = read('src/app/api/certificates/[token]/pdf/route.js');
  assert.match(pdf, /hasCertificateSession/);
  assert.match(pdf, /nameConfirmedAt/);
  assert.match(pdf, /recordCertificatePdfHash/);
  const name = read('src/app/api/certificates/[token]/name/route.js');
  assert.match(name, /hasCertificateSession/);
  assert.match(name, /confirm/);
  const migration = read(
    'supabase/migrations/20261020180000_attendee_certificate_security.sql'
  );
  assert.match(migration, /name_confirmed_at is not null/);
  assert.match(migration, /confirm_attendee_certificate_name/);
  const cookie = read('src/lib/certificate-access.js');
  assert.match(cookie, /httpOnly: true/);
  assert.match(cookie, /sameSite: 'strict'/);
});

test('the file check sends only a fingerprint and the preview has no signature', () => {
  const check = read('src/components/certificates/certificate-file-check.jsx');
  assert.match(check, /crypto\.subtle\.digest\(\s*'SHA-256'/);
  assert.match(check, /JSON\.stringify\(\{ sha256/);
  assert.doesNotMatch(check, /FormData/);
  assert.match(
    read('src/app/api/certificates/check/route.js'),
    /\^\[a-f0-9\]\{64\}\$/
  );
  const preview = read('src/components/certificates/certificate-preview.jsx');
  assert.match(preview, /tasi-2026-preview-bg\.webp/);
  assert.doesNotMatch(preview, /signature.(png|jpe?g|webp)/i);
  assert.ok(fs.existsSync('public/img/certificates/tasi-2026-preview-bg.webp'));
});

test('the share card names only active holders and never shows the signature', () => {
  const card = read('src/app/certificates/verify/[code]/opengraph-image.js');
  assert.match(card, /record\.status !== 'active'/);
  assert.match(card, /FallbackCard/);
  assert.match(card, /og-certificate-bg\.jpg/);
  assert.doesNotMatch(card, /signature|attendee-template/i);
  assert.ok(fs.existsSync('src/assets/certificates/og-certificate-bg.jpg'));
  assert.match(
    read('src/app/certificates/verify/[code]/twitter-image.js'),
    /from '\.\/opengraph-image'/
  );
  const page = read('src/app/certificates/verify/[code]/page.jsx');
  assert.match(page, /record\?\.status === 'active'/);
  assert.match(page, /summary_large_image/);
  assert.match(
    read('next.config.mjs'),
    /'\/certificates\/verify\/\*\*': \['\.\/src\/assets\/certificates\/\*\*\/\*'\]/
  );
});

test('one reminder, only for emailed attendees who have not downloaded', () => {
  const {
    REMINDER_AFTER_DAYS,
    reminderBlocker,
  } = require('../src/lib/certificate-reminders.cjs');
  const now = Date.parse('2026-10-30T00:00:00Z');
  const due = {
    status: 'active',
    emailStatus: 'sent',
    downloadCount: 0,
    reminderCount: 0,
    lastSentAt: '2026-10-22T00:00:00Z',
  };
  assert.equal(reminderBlocker(due, now), null);
  assert.ok(reminderBlocker({ ...due, downloadCount: 1 }, now));
  assert.ok(reminderBlocker({ ...due, reminderCount: 1 }, now));
  assert.ok(reminderBlocker({ ...due, status: 'revoked' }, now));
  assert.ok(reminderBlocker({ ...due, emailStatus: 'draft' }, now));
  assert.ok(reminderBlocker({ ...due, emailStatus: 'failed' }, now));
  const tooSoon = now - (REMINDER_AFTER_DAYS * 24 - 1) * 60 * 60 * 1000;
  assert.ok(
    reminderBlocker(
      { ...due, lastSentAt: new Date(tooSoon).toISOString() },
      now
    )
  );
  assert.ok(reminderBlocker({ ...due, lastSentAt: null }, now));

  const email = buildCertificateEmail({
    name: 'Ana',
    edition: '2026',
    token: 'T'.repeat(43),
    reminder: true,
  });
  assert.equal(
    email.subject,
    'Reminder: your TASI 2026 certificate is waiting'
  );
  assert.match(email.text, /fresh link/);
  assert.match(email.html, /still waiting/);
  assert.doesNotMatch(email.html, /—/);

  const migration = read(
    'supabase/migrations/20261020200000_attendee_certificate_reminders.sql'
  );
  assert.match(migration, /check \(reminder_count between 0 and 1\)/);
  assert.match(
    migration,
    /p_kind = 'reminder' and email_status = 'sent'\s+and download_count = 0 and reminder_count = 0/
  );
  assert.match(migration, /'reminded'/);
  assert.match(
    read('src/lib/certificates-send.js'),
    /reminderBlocker\(certificate\)/
  );
  assert.doesNotMatch(read('src/lib/certificate-reminders.cjs'), /require\(/);
});

test('the thank-you email adds photos and feedback when available', () => {
  const base = { name: 'Ana', edition: '2026', token: 'T'.repeat(43) };
  const withPhotos = buildCertificateEmail({
    ...base,
    photos: {
      url: 'https://drive.google.com/drive/folders/abc_123',
      count: 12,
    },
  });
  assert.equal(
    withPhotos.subject,
    'Thank you for joining TASI 2026: your certificate and photos'
  );
  assert.match(withPhotos.text, /Your 12 photos from the festival/);
  assert.match(withPhotos.html, /drive\.google\.com\/drive\/folders\/abc_123/);
  assert.doesNotMatch(withPhotos.text, /found|registered/);
  assert.match(withPhotos.text, /more than 100 speakers from 20 countries/);
  assert.match(withPhotos.text, /https:\/\/tally\.so\/r\/dbWapr/);
  const one = buildCertificateEmail({
    ...base,
    photos: { url: 'https://drive.google.com/drive/folders/x', count: 1 },
  });
  assert.match(one.text, /Your photo from the festival/);
  const without = buildCertificateEmail(base);
  assert.doesNotMatch(without.text, /YOUR PHOTOS/);
  assert.match(without.text, /Share your feedback/);
  assert.doesNotMatch(withPhotos.html, /—/);
  const migration = read(
    'supabase/migrations/20261021100000_attendee_certificate_photos.sql'
  );
  assert.ok(
    migration.includes(String.raw`^https://drive\.google\.com/drive/folders/`)
  );
  assert.match(migration, /enable row level security/);
  assert.match(
    read('src/lib/certificates-send.js'),
    /getCertificatePhotos\(certificate\)/
  );
});

test('admin pages rely on the admin layout for the shell', () => {
  const pages = fs
    .readdirSync('src/app/admin', { recursive: true })
    .map((p) => String(p).split(path.sep).join('/'))
    .filter((p) => p.endsWith('page.jsx'));
  assert.ok(pages.includes('certificates/page.jsx'));
  for (const page of pages) {
    assert.doesNotMatch(
      read(`src/app/admin/${page}`),
      /components\/admin\/admin-shell'/,
      page
    );
  }
});
