import {
  claimSpeakerBadgeSend,
  getActiveSpeakerBadgeAttempt,
  getSpeakerBadgeForSend,
  markSpeakerBadgeFailed,
  markSpeakerBadgeSent,
  prepareSpeakerBadgeSendRequest,
} from '@/lib/speaker-communications-db';
import { downloadSpeakerBadgeImage } from '@/lib/speaker-badge-storage';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  getResendClient,
  getResendFromEmail,
  sendApplicantConfirmationEmail,
} from '@/lib/resend';
import speakerBadgeEmail from '@/lib/speaker-badge-email.cjs';
import speakerCommunicationsUtils from '@/lib/speaker-communications-utils.cjs';
import guestSendAttempt from '@/lib/guest-send-attempt.cjs';

const {
  SOCIAL_ICON_FILES,
  SPEAKER_BADGE_CONTENT_ID,
  SPEAKER_COMMS_REPLY_TO,
  buildSpeakerBadgeEmail,
} = speakerBadgeEmail;
const { speakerBadgeDownloadFilename } = speakerCommunicationsUtils;
const { canRetryGuestSend, hashGuestEmailRequest } = guestSendAttempt;

function getSiteUrl() {
  return (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://trustandsafetyindia.org'
  );
}

let cachedEmailImages = null;

// The logo and brand icons are embedded; the footer loads from the site, so
// it is not attached.
async function getSpeakerEmailImages() {
  if (cachedEmailImages) return cachedEmailImages;
  // Literal paths so the serverless bundle traces every file.
  const directory = path.join(process.cwd(), 'public', 'img', 'email');
  const [logo, ...icons] = await Promise.all([
    fs.readFile(path.join(directory, 'tasi-festival-logo.png')),
    fs.readFile(path.join(directory, 'social', 'linkedin.png')),
    fs.readFile(path.join(directory, 'social', 'x.png')),
    fs.readFile(path.join(directory, 'social', 'facebook.png')),
    fs.readFile(path.join(directory, 'social', 'instagram.png')),
  ]);
  cachedEmailImages = [
    {
      filename: 'tasi-festival-logo.png',
      content: logo,
      contentId: 'tasi-logo',
    },
    ...SOCIAL_ICON_FILES.map(({ filename, contentId }, index) => ({
      filename,
      content: icons[index],
      contentId,
    })),
  ];
  return cachedEmailImages;
}

function speakerBadgeIdempotencyKey(attemptId) {
  return `speaker-badge/${attemptId}`;
}

async function buildBadgeMessage({ speaker, badgePath, downloadToken, test }) {
  if (!badgePath) throw new Error('Upload a badge for this speaker first.');
  const email = buildSpeakerBadgeEmail({
    name: speaker.name,
    edition: speaker.edition,
    siteUrl: getSiteUrl(),
    token: downloadToken,
    replyEmail: SPEAKER_COMMS_REPLY_TO,
    test,
  });
  const [inlineAttachments, badge] = await Promise.all([
    getSpeakerEmailImages(),
    downloadSpeakerBadgeImage(badgePath),
  ]);
  const extension = badgePath.endsWith('.jpg') ? 'jpg' : 'png';
  const filename = speakerBadgeDownloadFilename({
    name: speaker.name,
    edition: speaker.edition,
    extension,
  });
  // The badge goes twice: inline for the preview in the email body, and as
  // a plain attachment so every mail client offers it as a download.
  return {
    email,
    attachments: [
      ...inlineAttachments,
      {
        filename: `preview-${filename}`,
        content: badge,
        contentId: SPEAKER_BADGE_CONTENT_ID,
      },
      { filename, content: badge },
      {
        filename: `tasi-${speaker.edition}-calendar.ics`,
        content: Buffer.from(email.calendarContent, 'utf8'),
      },
    ],
  };
}

export async function previewSpeakerBadgeEmail(id) {
  const { speaker, downloadToken } = await getSpeakerBadgeForSend(id);
  const email = buildSpeakerBadgeEmail({
    name: speaker.name,
    edition: speaker.edition,
    siteUrl: getSiteUrl(),
    token: downloadToken,
    replyEmail: SPEAKER_COMMS_REPLY_TO,
  });
  return {
    subject: email.subject,
    text: email.text,
    html: email.html,
    to: speaker.emails,
  };
}

// A test goes only to the signed-in operator and is never recorded as a
// send, so it cannot mark a speaker as done.
export async function sendSpeakerBadgeTest({ id, operator }) {
  if (!getResendClient()) throw new Error('Resend is not configured.');
  const recipient = operator?.primaryEmail;
  if (!recipient) throw new Error('Your account has no email address.');

  const { speaker, badgePath, downloadToken } =
    await getSpeakerBadgeForSend(id);
  const { email, attachments } = await buildBadgeMessage({
    speaker,
    badgePath,
    downloadToken,
    test: true,
  });
  const delivery = await sendApplicantConfirmationEmail({
    to: recipient,
    subject: email.subject,
    text: email.text,
    html: email.html,
    replyTo: SPEAKER_COMMS_REPLY_TO,
    attachments,
  });
  if (!delivery.sent) {
    throw new Error(delivery.error || 'Resend did not accept the test email.');
  }
  return { recipient, providerMessageId: delivery.providerMessageId };
}

export async function sendSpeakerBadge({
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
    const { speaker, badgePath, downloadToken } =
      await getSpeakerBadgeForSend(id);

    if (retry) {
      attempt = await getActiveSpeakerBadgeAttempt(id);
      if (speaker.status !== 'sending' || !canRetryGuestSend(attempt)) {
        throw new Error(
          'This send cannot be retried safely now. Check its outcome in Resend.'
        );
      }
    } else if (speaker.state === 'sent' && !resend) {
      throw new Error(
        `${speaker.name} has already been sent this badge. Use Resend to send it again.`
      );
    } else if (
      !['ready', 'failed', 'sent', 'badge_updated'].includes(speaker.state)
    ) {
      throw new Error(
        speaker.state === 'needs_email'
          ? `Add an email address for ${speaker.name} first.`
          : speaker.state === 'needs_badge'
            ? `Upload a badge for ${speaker.name} first.`
            : 'This badge cannot be sent in its current state.'
      );
    }

    const recipients = retry ? attempt.recipient_emails : speaker.emails;
    const { email, attachments } = await buildBadgeMessage({
      speaker: retry ? { ...speaker, name: attempt.speaker_name } : speaker,
      badgePath,
      downloadToken,
    });

    if (!retry) {
      const claimed = await claimSpeakerBadgeSend({ id, operator });
      attempt = claimed.attempt;
      newAttempt = true;
      if (attempt.badge_sha256 !== speaker.badgeSha256) {
        throw new Error('The badge changed while sending. Try again.');
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
    await prepareSpeakerBadgeSendRequest(attempt.id, requestSha256);

    providerContacted = true;
    const delivery = await sendApplicantConfirmationEmail({
      to: recipients,
      subject: email.subject,
      text: email.text,
      html: email.html,
      replyTo: SPEAKER_COMMS_REPLY_TO,
      attachments,
      idempotencyKey: speakerBadgeIdempotencyKey(attempt.id),
    });
    if (!delivery.sent || !delivery.providerMessageId) {
      throw new Error('Resend did not confirm a badge message ID.');
    }
    providerAccepted = true;
    return await markSpeakerBadgeSent({
      attemptId: attempt.id,
      providerMessageId: delivery.providerMessageId,
    });
  } catch (error) {
    if (newAttempt && !providerContacted && attempt) {
      try {
        await markSpeakerBadgeFailed({
          attemptId: attempt.id,
          errorMessage:
            error instanceof Error ? error.message : 'Email was not sent.',
        });
      } catch (recordError) {
        console.error(
          'Unable to close unsent speaker badge attempt.',
          recordError
        );
      }
    }
    if (providerContacted && attempt) {
      console.error('Speaker badge provider outcome needs reconciliation.', {
        speakerBadgeId: id,
        attemptId: attempt.id,
        providerAccepted,
      });
      throw new Error(
        providerAccepted
          ? 'Resend accepted this badge email, but recording it failed. The send is locked for safe retry.'
          : 'The badge email outcome is uncertain. It is locked against a duplicate send; retry the same attempt after 10 minutes.'
      );
    }
    throw error;
  }
}
