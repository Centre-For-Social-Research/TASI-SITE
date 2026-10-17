const {
  DEFAULT_EDITION,
  buildSpeakerNameKey,
  parseSpeakerEmails,
  sanitizeSpeakerText,
} = require('./speaker-communications-utils.cjs');

const SPEAKER_PHOTO_STATUSES = new Set(['draft', 'sending', 'sent', 'failed']);
const DRIVE_HOSTS = new Set(['drive.google.com']);

// Only Google Drive folder links are accepted, so a typo or a pasted
// non-Drive URL never reaches a speaker.
function normalizeDriveUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('Drive link must be a valid Google Drive folder link.');
  }
  const match = url.pathname.match(/^\/drive\/(?:u\/\d+\/)?folders\/([\w-]+)/);
  if (url.protocol !== 'https:' || !DRIVE_HOSTS.has(url.hostname) || !match) {
    throw new Error('Drive link must be a valid Google Drive folder link.');
  }
  return `https://drive.google.com/drive/folders/${match[1]}`;
}

function normalizePhotoCount(value) {
  if (value === null || value === undefined || value === '') return null;
  const count = Number(value);
  if (!Number.isInteger(count) || count < 0 || count > 100000) {
    throw new Error('Photo count must be a whole number.');
  }
  return count;
}

// Session titles arrive one per line from the admin form, or as an array.
function normalizeSessionTitles(value) {
  const entries = Array.isArray(value)
    ? value
    : String(value ?? '').split(/\r?\n/);
  const titles = Array.from(
    new Set(
      entries
        .map((entry) =>
          sanitizeSpeakerText(entry, {
            fieldName: 'Session title',
            maxLength: 200,
          })
        )
        .filter(Boolean)
    )
  );
  if (titles.length > 5) throw new Error('Add at most 5 session titles.');
  return titles;
}

// The line quoted back to the speaker. Surrounding quote marks are added by
// the email, so they are stripped here.
function normalizeQuote(value) {
  const quote = sanitizeSpeakerText(value, {
    fieldName: 'Quote',
    maxLength: 400,
  })
    .replace(/^["“”']+|["“”']+$/g, '')
    .trim();
  return quote || null;
}

function normalizeSpeakerPhotoInput(input = {}) {
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
    driveUrl: normalizeDriveUrl(input.driveUrl),
    photoCount: normalizePhotoCount(input.photoCount),
    sessionTitles: normalizeSessionTitles(input.sessionTitles),
    quote: normalizeQuote(input.quote),
  };
}

// The single status an operator acts on. A Drive link changed after the last
// accepted send is flagged so the speaker can be sent the new one.
function deriveSpeakerPhotoState(row = {}) {
  const status = SPEAKER_PHOTO_STATUSES.has(row.status) ? row.status : 'draft';
  if (status === 'sending') return 'sending';
  if (status === 'sent') {
    return row.lastSentDriveUrl && row.lastSentDriveUrl !== row.driveUrl
      ? 'link_updated'
      : 'sent';
  }
  if (!row.driveUrl) return 'needs_link';
  if (!Array.isArray(row.emails) || row.emails.length === 0) {
    return 'needs_email';
  }
  return status === 'failed' ? 'failed' : 'ready';
}

function normalizeSpeakerPhotoRow(row = {}) {
  const normalized = {
    id: row.id,
    edition: row.edition || DEFAULT_EDITION,
    name: row.speaker_name || '',
    nameKey: row.name_key || '',
    emails: Array.isArray(row.emails) ? row.emails : [],
    driveUrl: row.drive_url || null,
    photoCount:
      row.photo_count === null || row.photo_count === undefined
        ? null
        : Number(row.photo_count),
    status: SPEAKER_PHOTO_STATUSES.has(row.status) ? row.status : 'draft',
    sessionTitles: Array.isArray(row.session_titles) ? row.session_titles : [],
    quote: row.quote || null,
    hasFeaturedPhoto: Boolean(row.featured_photo_path),
    featuredPhotoSha256: row.featured_photo_sha256 || null,
    lastSentDriveUrl: row.last_sent_drive_url || null,
    sendCount: Number(row.send_count || 0),
    firstSentAt: row.first_sent_at || null,
    lastSentAt: row.last_sent_at || null,
    lastProviderMessageId: row.last_provider_message_id || null,
    lastError: row.last_error || null,
    lastSentByEmail: row.last_sent_by_email || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
  return { ...normalized, state: deriveSpeakerPhotoState(normalized) };
}

function normalizeSpeakerPhotoDelivery(row = {}) {
  return {
    id: row.id,
    status: row.delivery_status || 'failed',
    templateKey: row.template_key || 'speaker_photos_v1',
    recipientEmails: Array.isArray(row.recipient_emails)
      ? row.recipient_emails
      : [],
    driveUrl: row.drive_url || null,
    providerMessageId: row.provider_message_id || null,
    failureReason: row.failure_reason || null,
    actorEmail: row.actor_email || null,
    createdAt: row.created_at || null,
  };
}

function summarizeSpeakerPhotos(rows = []) {
  const summary = {
    total: rows.length,
    ready: 0,
    sent: 0,
    needsEmail: 0,
    needsLink: 0,
    attention: 0,
    photos: 0,
  };
  for (const row of rows) {
    summary.photos += row.photoCount || 0;
    if (row.state === 'ready') summary.ready += 1;
    else if (row.state === 'sent') summary.sent += 1;
    else if (row.state === 'needs_email') summary.needsEmail += 1;
    else if (row.state === 'needs_link') summary.needsLink += 1;
    else summary.attention += 1;
  }
  return summary;
}

module.exports = {
  SPEAKER_PHOTO_STATUSES,
  deriveSpeakerPhotoState,
  normalizeDriveUrl,
  normalizeQuote,
  normalizeSessionTitles,
  normalizeSpeakerPhotoDelivery,
  normalizeSpeakerPhotoInput,
  normalizeSpeakerPhotoRow,
  summarizeSpeakerPhotos,
};
