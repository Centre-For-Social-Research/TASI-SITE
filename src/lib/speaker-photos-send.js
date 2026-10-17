import fs from 'node:fs/promises';
import path from 'node:path';
import {
  claimSpeakerPhotoSend,
  getActiveSpeakerPhotoAttempt,
  getSpeakerPhotoById,
  markSpeakerPhotoFailed,
  markSpeakerPhotoSent,
  prepareSpeakerPhotoSendRequest,
} from '@/lib/speaker-photos-db';
import {
  getResendClient,
  getResendFromEmail,
  sendApplicantConfirmationEmail,
} from '@/lib/resend';
import speakerPhotosEmail from '@/lib/speaker-photos-email.cjs';
import speakerCommunicationsUtils from '@/lib/speaker-communications-utils.cjs';
import guestSendAttempt from '@/lib/guest-send-attempt.cjs';

const { SPEAKER_COMMS_REPLY_TO, buildSpeakerPhotosEmail } = speakerPhotosEmail;
const { parseSpeakerEmails } = speakerCommunicationsUtils;
const { canRetryGuestSend, hashGuestEmailRequest } = guestSendAttempt;

function getSiteUrl() {
  return (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://trustandsafetyindia.org'
  );
}

let cachedLogo = null;

// The logo is embedded; the footer loads from the site.
async function getLogoAttachment() {
  if (!cachedLogo) {
    cachedLogo = await fs.readFile(
      path.join(
        process.cwd(),
        'public',
        'img',
        'email',
        'tasi-festival-logo.png'
      )
    );
  }
  return {
    filename: 'tasi-festival-logo.png',
    content: cachedLogo,
    contentId: 'tasi-logo',
  };
}

function buildEmail(speaker, { test = false, name, driveUrl } = {}) {
  return buildSpeakerPhotosEmail({
    name: name || speaker.name,
    edition: speaker.edition,
    driveUrl: driveUrl || speaker.driveUrl,
    siteUrl: getSiteUrl(),
    replyEmail: SPEAKER_COMMS_REPLY_TO,
    test,
  });
}

export async function previewSpeakerPhotosEmail(id) {
  const speaker = await getSpeakerPhotoById(id);
  const email = buildEmail(speaker);
  return {
    subject: email.subject,
    text: email.text,
    html: email.html,
    to: speaker.emails,
  };
}

// A test goes to one address the admin chooses (their own by default), is
// marked [TEST], and is never recorded as a send.
export async function sendSpeakerPhotosTest({ id, operator, to }) {
  if (!getResendClient()) throw new Error('Resend is not configured.');
  const [recipient, ...extra] = parseSpeakerEmails(
    String(to || '').trim() || operator?.primaryEmail || ''
  );
  if (!recipient) throw new Error('An email address is required for the test.');
  if (extra.length) throw new Error('Send a test to at most one address.');

  const speaker = await getSpeakerPhotoById(id);
  const email = buildEmail(speaker, { test: true });
  const delivery = await sendApplicantConfirmationEmail({
    to: recipient,
    subject: email.subject,
    text: email.text,
    html: email.html,
    replyTo: SPEAKER_COMMS_REPLY_TO,
    attachments: [await getLogoAttachment()],
  });
  if (!delivery.sent) {
    throw new Error(delivery.error || 'Resend did not accept the test email.');
  }
  return { recipient, providerMessageId: delivery.providerMessageId };
}

export async function sendSpeakerPhotos({
  id,
  operator,
  retry = false,
  resend = false,
}) {
  if (!getResendClient()) throw new Error('Resend is not configured.');

  let attempt;
  let newAttempt = false;
  let providerAccepted = false;
  let providerContacted = false;

  try {
    const speaker = await getSpeakerPhotoById(id);

    if (retry) {
      attempt = await getActiveSpeakerPhotoAttempt(id);
      if (speaker.status !== 'sending' || !canRetryGuestSend(attempt)) {
        throw new Error(
          'This send cannot be retried safely now. Check its outcome in Resend.'
        );
      }
    } else if (speaker.state === 'sent' && !resend) {
      throw new Error(
        `${speaker.name} has already been sent their photos. Use Resend to send them again.`
      );
    } else if (
      !['ready', 'failed', 'sent', 'link_updated'].includes(speaker.state)
    ) {
      throw new Error(
        speaker.state === 'needs_email'
          ? `Add an email address for ${speaker.name} first.`
          : speaker.state === 'needs_link'
            ? `Add a Drive link for ${speaker.name} first.`
            : 'These photos cannot be sent in their current state.'
      );
    }

    const recipients = retry ? attempt.recipient_emails : speaker.emails;
    const email = buildEmail(
      speaker,
      retry ? { name: attempt.speaker_name, driveUrl: attempt.drive_url } : {}
    );
    const attachments = [await getLogoAttachment()];

    if (!retry) {
      const claimed = await claimSpeakerPhotoSend({ id, operator });
      attempt = claimed.attempt;
      newAttempt = true;
      if (attempt.drive_url !== speaker.driveUrl) {
        throw new Error('The Drive link changed while sending. Try again.');
      }
    }

    const requestSha256 = hashGuestEmailRequest({
      from: getResendFromEmail(),
      to: recipients,
      subject: email.subject,
      text: email.text,
      html: email.html,
      replyTo: SPEAKER_COMMS_REPLY_TO,
      attachments,
    });
    await prepareSpeakerPhotoSendRequest(attempt.id, requestSha256);

    providerContacted = true;
    const delivery = await sendApplicantConfirmationEmail({
      to: recipients,
      subject: email.subject,
      text: email.text,
      html: email.html,
      replyTo: SPEAKER_COMMS_REPLY_TO,
      attachments,
      idempotencyKey: `speaker-photos/${attempt.id}`,
    });
    if (!delivery.sent || !delivery.providerMessageId) {
      throw new Error('Resend did not confirm a message ID.');
    }
    providerAccepted = true;
    return await markSpeakerPhotoSent({
      attemptId: attempt.id,
      providerMessageId: delivery.providerMessageId,
    });
  } catch (error) {
    if (newAttempt && !providerContacted && attempt) {
      try {
        await markSpeakerPhotoFailed({
          attemptId: attempt.id,
          errorMessage:
            error instanceof Error ? error.message : 'Email was not sent.',
        });
      } catch (recordError) {
        console.error(
          'Unable to close unsent speaker photo attempt.',
          recordError
        );
      }
    }
    if (providerContacted && attempt) {
      console.error('Speaker photo provider outcome needs reconciliation.', {
        speakerPhotoLinkId: id,
        attemptId: attempt.id,
        providerAccepted,
      });
      throw new Error(
        providerAccepted
          ? 'Resend accepted this photo email, but recording it failed. The send is locked for safe retry.'
          : 'The photo email outcome is uncertain. It is locked against a duplicate send; retry the same attempt after 10 minutes.'
      );
    }
    throw error;
  }
}
