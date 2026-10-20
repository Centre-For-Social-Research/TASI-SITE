const { randomBytes, randomInt } = require('node:crypto');

// Fixed copy for each edition's attendee certificate. The dates are the same
// on every certificate, whichever day the attendee came.
const CERTIFICATE_EDITIONS = {
  2026: {
    edition: '2026',
    title: 'Certificate of Participation',
    eventName: 'Trust & Safety India Festival 2026 (TASI 2026)',
    shortName: 'TASI 2026',
    linkedInName:
      'Certificate of Participation: Trust & Safety India Festival 2026',
    dates: '14–15 October 2026',
    venue: 'the India International Centre, New Delhi',
    organisers:
      'the Centre for Social Research and the Trust & Safety Festival',
    linkedInOrganisation: 'Centre for Social Research',
    issueYear: 2026,
    issueMonth: 10,
    signatory: 'Dr. Ranjana Kumari',
    signatoryRole: 'Director, Centre for Social Research',
    codePrefix: 'TASI26',
  },
};
const DEFAULT_EDITION = '2026';
const CERTIFICATE_STATUSES = new Set(['active', 'revoked']);
const MAX_NAME_CHANGES = 2;
const MAX_NAME_LENGTH = 80;

// No 0/O, 1/I/L: codes are read aloud and typed from paper.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;
const CODE_REGEX = /^TASI\d{2}-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/;
const TOKEN_REGEX = /^[A-Za-z0-9_-]{43}$/;
// Latin script only: the certificate fonts cover Latin, Latin-1 and Latin
// Extended. Letters, marks, spaces and . ' ’ - only.
const NAME_REGEX = /^[\p{Script=Latin}\p{M}][\p{Script=Latin}\p{M} .'’-]*$/u;

function getCertificateEdition(edition) {
  return CERTIFICATE_EDITIONS[String(edition || '').trim()] || null;
}

function normalizeCertificateEdition(edition) {
  const value = String(edition || DEFAULT_EDITION).trim();
  if (!getCertificateEdition(value)) {
    throw new Error(`Edition ${value} is not configured.`);
  }
  return value;
}

function newCertificateCode(edition = DEFAULT_EDITION) {
  const { codePrefix } = getCertificateEdition(edition);
  let body = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    body += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return `${codePrefix}-${body}`;
}

function isValidCertificateCode(code) {
  return CODE_REGEX.test(
    String(code || '')
      .trim()
      .toUpperCase()
  );
}

function normalizeCertificateCode(code) {
  return String(code || '')
    .trim()
    .toUpperCase();
}

function newClaimToken() {
  return randomBytes(32).toString('base64url');
}

function isValidClaimToken(token) {
  return TOKEN_REGEX.test(String(token || ''));
}

// Names typed entirely in capitals or lower case are title-cased; anything
// with mixed case is kept exactly as the person wrote it.
function smartTitleCase(value) {
  const name = String(value || '');
  const letters = name.replace(/[^\p{L}]/gu, '');
  if (!letters) return name;
  if (letters !== letters.toUpperCase() && letters !== letters.toLowerCase()) {
    return name;
  }
  return name
    .toLowerCase()
    .replace(/(^|[\s\-'’.])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
}

function cleanCertificateName(value, { titleCase = false } = {}) {
  const name = String(value ?? '')
    .normalize('NFC')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return titleCase ? smartTitleCase(name) : name;
}

function validateCertificateName(value) {
  const name = cleanCertificateName(value);
  if (!name) throw new Error('Please enter your name.');
  if (name.length > MAX_NAME_LENGTH) {
    throw new Error(
      `Your name must be ${MAX_NAME_LENGTH} characters or fewer.`
    );
  }
  if (
    !NAME_REGEX.test(name) ||
    !/\p{L}{2}/u.test(name.replace(/[\s.'’-]/g, ''))
  ) {
    throw new Error(
      'Please use your name in English letters only (accents are fine).'
    );
  }
  return name;
}

function nameFromRegistration({ firstName, lastName } = {}) {
  return cleanCertificateName(`${firstName || ''} ${lastName || ''}`, {
    titleCase: true,
  });
}

function normalizeSiteUrl(siteUrl) {
  return String(siteUrl || 'https://trustandsafetyindia.org').replace(
    /\/+$/,
    ''
  );
}

function buildVerifyUrl({ siteUrl, code }) {
  return `${normalizeSiteUrl(siteUrl)}/certificates/verify/${encodeURIComponent(code)}`;
}

function buildClaimUrl({ siteUrl, token }) {
  return `${normalizeSiteUrl(siteUrl)}/certificates/${encodeURIComponent(token)}`;
}

// LinkedIn's "Add to profile" link for the Licenses & certifications section.
function buildLinkedInAddUrl({ edition, code, siteUrl }) {
  const config = getCertificateEdition(edition);
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: config.linkedInName,
    organizationName: config.linkedInOrganisation,
    issueYear: String(config.issueYear),
    issueMonth: String(config.issueMonth),
    certUrl: buildVerifyUrl({ siteUrl, code }),
    certId: code,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

function certificateFileName({ name, code }) {
  const slug = String(name || 'attendee')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `TASI-2026-Certificate-${slug || 'Attendee'}-${code}.pdf`;
}

function formatIssueDate(value) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value));
}

module.exports = {
  CERTIFICATE_EDITIONS,
  CERTIFICATE_STATUSES,
  CODE_ALPHABET,
  DEFAULT_EDITION,
  MAX_NAME_CHANGES,
  buildClaimUrl,
  buildLinkedInAddUrl,
  buildVerifyUrl,
  certificateFileName,
  cleanCertificateName,
  formatIssueDate,
  getCertificateEdition,
  isValidCertificateCode,
  isValidClaimToken,
  nameFromRegistration,
  newCertificateCode,
  newClaimToken,
  normalizeCertificateCode,
  normalizeCertificateEdition,
  smartTitleCase,
  validateCertificateName,
};
