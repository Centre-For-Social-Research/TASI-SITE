const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]/g;
const MULTISPACE_REGEX = /\s+/g;
const HTML_DELIMITER_REGEX = /[<>]/g;
const BASIC_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HONORIFIC_REGEX =
  /^(dr|prof|professor|mr|mrs|ms|h\.e|hon|shri|smt)\.?\s+/i;
const DOWNLOAD_TOKEN_REGEX = /^[A-Za-z0-9_-]{43}$/;

const MAX_RECIPIENTS = 3;
const MAX_BADGE_BYTES = 3 * 1024 * 1024;
const DEFAULT_EDITION = '2026';

// Each edition's fixed email copy lives here. Add the next edition's entry
// before importing its speakers; the tab only offers editions listed here.
const SPEAKER_EDITIONS = {
  2026: {
    edition: '2026',
    name: 'TASI 2026',
    festivalName: 'Trust & Safety India Festival 2026',
    dates: '14-15 October 2026',
    venue: 'India International Centre, New Delhi',
    hashtag: '#TASI2026',
    venueMapUrl:
      'https://www.google.com/maps/search/?api=1&query=India+International+Centre+New+Delhi',
    // All-day dates for .ics and Google (end is exclusive), and local times
    // for Outlook.
    calendar: {
      startDate: '20261014',
      endDate: '20261016',
      startLocal: '2026-10-14T09:00:00+05:30',
      endLocal: '2026-10-15T18:00:00+05:30',
    },
  },
};

const SPEAKER_BADGE_STATUSES = new Set(['draft', 'sending', 'sent', 'failed']);

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(CONTROL_CHARS_REGEX, ' ')
    .trim();
}

function sanitizeSpeakerText(
  value,
  { fieldName, maxLength, required = false } = {}
) {
  const normalized = normalizeText(value)
    .replace(HTML_DELIMITER_REGEX, '')
    .replace(MULTISPACE_REGEX, ' ');

  if (required && !normalized) {
    throw new Error(`${fieldName} is required.`);
  }

  if (normalized.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or fewer.`);
  }

  return normalized;
}

function getSpeakerEdition(edition) {
  return SPEAKER_EDITIONS[String(edition || '').trim()] || null;
}

function normalizeEdition(edition) {
  const value = String(edition || DEFAULT_EDITION).trim();
  if (!getSpeakerEdition(value)) {
    throw new Error(`Edition ${value} is not configured.`);
  }
  return value;
}

// Matches a badge file to a speaker regardless of honorifics, accents,
// punctuation or case: "Dr. Ranjana Kumari" and "ranjana-kumari" match.
function buildSpeakerNameKey(name) {
  let value = String(name || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
  while (HONORIFIC_REGEX.test(value)) {
    value = value.replace(HONORIFIC_REGEX, '');
  }
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// "Yoel Roth.png" and "Yoel Roth (1).png" both name Yoel Roth.
function speakerNameFromFilename(filename) {
  const base = String(filename || '')
    .split(/[\\/]/)
    .pop()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/\s*\(\d+\)$/, '')
    .replace(/[_]+/g, ' ');
  return sanitizeSpeakerText(base, {
    fieldName: 'Speaker name',
    maxLength: 160,
  });
}

function isValidEmail(email) {
  if (!email || email.length > 320 || !BASIC_EMAIL_REGEX.test(email)) {
    return false;
  }
  const [localPart, domainPart] = email.split('@');
  return Boolean(
    localPart &&
    domainPart &&
    localPart.length <= 64 &&
    domainPart.length <= 255 &&
    !domainPart.startsWith('.') &&
    !domainPart.endsWith('.')
  );
}

function parseSpeakerEmails(value) {
  const entries = Array.isArray(value)
    ? value
    : String(value ?? '').split(/[,;\s]+/);
  const emails = Array.from(
    new Set(
      entries
        .map((entry) =>
          normalizeText(entry).toLowerCase().replace(MULTISPACE_REGEX, '')
        )
        .filter(Boolean)
    )
  );

  const invalid = emails.find((email) => !isValidEmail(email));
  if (invalid) {
    throw new Error(`${invalid} is not a valid email address.`);
  }
  if (emails.length > MAX_RECIPIENTS) {
    throw new Error(`Add at most ${MAX_RECIPIENTS} email addresses.`);
  }
  return emails;
}

function normalizeSpeakerInput(input = {}) {
  const name = sanitizeSpeakerText(input.name, {
    fieldName: 'Speaker name',
    maxLength: 160,
    required: true,
  });
  const nameKey = buildSpeakerNameKey(name);
  if (!nameKey) throw new Error('Speaker name is required.');

  return {
    name,
    nameKey,
    emails: parseSpeakerEmails(input.emails ?? input.email),
    designation:
      sanitizeSpeakerText(input.designation, {
        fieldName: 'Designation',
        maxLength: 200,
      }) || null,
    organization:
      sanitizeSpeakerText(input.organization, {
        fieldName: 'Organisation',
        maxLength: 200,
      }) || null,
  };
}

// The single status an operator acts on. A badge replaced after the last
// accepted send is flagged so the speaker can be sent the new version.
function deriveSpeakerBadgeState(row = {}) {
  const status = SPEAKER_BADGE_STATUSES.has(row.status) ? row.status : 'draft';
  const hasEmail = Array.isArray(row.emails) && row.emails.length > 0;
  const hasBadge = Boolean(row.badgeSha256);

  if (status === 'sending') return 'sending';
  if (status === 'sent') {
    return row.lastSentBadgeSha256 &&
      row.lastSentBadgeSha256 !== row.badgeSha256
      ? 'badge_updated'
      : 'sent';
  }
  if (!hasBadge) return 'needs_badge';
  if (!hasEmail) return 'needs_email';
  return status === 'failed' ? 'failed' : 'ready';
}

function normalizeSpeakerBadgeRow(row = {}) {
  const normalized = {
    id: row.id,
    edition: row.edition || DEFAULT_EDITION,
    name: row.speaker_name || '',
    nameKey: row.name_key || '',
    emails: Array.isArray(row.emails) ? row.emails : [],
    designation: row.designation || '',
    organization: row.organization || '',
    status: SPEAKER_BADGE_STATUSES.has(row.status) ? row.status : 'draft',
    hasBadge: Boolean(row.badge_path),
    badgeSha256: row.badge_sha256 || null,
    badgeUpdatedAt: row.badge_updated_at || null,
    lastSentBadgeSha256: row.last_sent_badge_sha256 || null,
    sendCount: Number(row.send_count || 0),
    firstSentAt: row.first_sent_at || null,
    lastSentAt: row.last_sent_at || null,
    lastProviderMessageId: row.last_provider_message_id || null,
    lastError: row.last_error || null,
    lastSentByEmail: row.last_sent_by_email || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
  return { ...normalized, state: deriveSpeakerBadgeState(normalized) };
}

function normalizeSpeakerBadgeDelivery(row = {}) {
  return {
    id: row.id,
    status: row.delivery_status || 'failed',
    templateKey: row.template_key || 'speaker_badge_v1',
    recipientEmails: Array.isArray(row.recipient_emails)
      ? row.recipient_emails
      : [],
    providerMessageId: row.provider_message_id || null,
    failureReason: row.failure_reason || null,
    actorEmail: row.actor_email || null,
    createdAt: row.created_at || null,
  };
}

function summarizeSpeakerBadges(rows = []) {
  const summary = {
    total: rows.length,
    ready: 0,
    sent: 0,
    needsEmail: 0,
    needsBadge: 0,
    attention: 0,
  };
  for (const row of rows) {
    if (row.state === 'ready') summary.ready += 1;
    else if (row.state === 'sent') summary.sent += 1;
    else if (row.state === 'needs_email') summary.needsEmail += 1;
    else if (row.state === 'needs_badge') summary.needsBadge += 1;
    else summary.attention += 1;
  }
  return summary;
}

// Maps the messages thrown by the speaker communications modules to HTTP
// status codes for the admin routes.
function speakerErrorStatus(message) {
  const text = String(message || '');
  if (/not found/i.test(text)) return 404;
  if (/Resend is not configured/i.test(text)) return 503;
  if (
    /required|valid|characters|at most|not configured|must be|first\./i.test(
      text
    )
  ) {
    return 400;
  }
  if (/already|cannot|changed|locked|uncertain|unresolved/i.test(text)) {
    return 409;
  }
  return 500;
}

function isValidDownloadToken(token) {
  return DOWNLOAD_TOKEN_REGEX.test(String(token || ''));
}

function speakerBadgeDownloadFilename({ name, edition, extension = 'png' }) {
  const slug = buildSpeakerNameKey(name) || 'speaker';
  return `TASI-${edition || DEFAULT_EDITION}-Speaker-Badge-${slug}.${extension}`;
}

module.exports = {
  DEFAULT_EDITION,
  MAX_BADGE_BYTES,
  MAX_RECIPIENTS,
  SPEAKER_BADGE_STATUSES,
  SPEAKER_EDITIONS,
  buildSpeakerNameKey,
  deriveSpeakerBadgeState,
  getSpeakerEdition,
  isValidDownloadToken,
  normalizeEdition,
  normalizeSpeakerBadgeDelivery,
  normalizeSpeakerBadgeRow,
  normalizeSpeakerInput,
  parseSpeakerEmails,
  speakerBadgeDownloadFilename,
  speakerErrorStatus,
  speakerNameFromFilename,
  summarizeSpeakerBadges,
};
