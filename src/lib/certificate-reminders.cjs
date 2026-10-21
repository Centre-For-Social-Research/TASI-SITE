// Who can get a reminder. Shared by the server and the admin panel, so it
// has no Node-only dependencies.

// One reminder, and only once the first email has had a few days to work.
const REMINDER_AFTER_DAYS = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

// Why a certificate can't be reminded yet, or null when a reminder is due.
function reminderBlocker(certificate, now = Date.now()) {
  if (certificate.status !== 'active')
    return 'This certificate has been revoked.';
  if (certificate.emailStatus !== 'sent')
    return 'Send the certificate email first.';
  if (certificate.downloadCount > 0) return 'They have already downloaded it.';
  if (certificate.reminderCount > 0) return 'They have already had a reminder.';
  const sentAt = Date.parse(certificate.lastSentAt || '');
  if (!Number.isFinite(sentAt) || now - sentAt < REMINDER_AFTER_DAYS * DAY_MS) {
    return `A reminder can go ${REMINDER_AFTER_DAYS} days after the certificate email.`;
  }
  return null;
}

module.exports = { REMINDER_AFTER_DAYS, reminderBlocker };
