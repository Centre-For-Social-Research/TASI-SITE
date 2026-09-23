import {
  claimGuestInvitationSend,
  getActiveGuestSendAttempt,
  getGuestInvitationById,
  markGuestInvitationFailed,
  markGuestInvitationSent,
  prepareGuestSendRequest,
} from '@/lib/guest-invitation-db';
import { getTasiEmailInlineAttachments } from '@/lib/qr-pass-email-assets';
import {
  getApplicationCommsEmail,
  getResendClient,
  getResendFromEmail,
  sendApplicantConfirmationEmail,
} from '@/lib/resend';
import { buildGuestInvitationPoster } from '@/lib/guest-invitation-poster';
import applicationAcknowledgementEmail from '@/lib/application-acknowledgement-email.cjs';
import guestSendAttempt from '@/lib/guest-send-attempt.cjs';

const { buildGuestInvitationEmail } = applicationAcknowledgementEmail;
const { canRetryGuestSend, guestSendIdempotencyKey, hashGuestEmailRequest } =
  guestSendAttempt;

export async function sendGuestInvitation({ id, operator, retry = false }) {
  if (!getResendClient()) throw new Error('Resend is not configured.');

  let invitation;
  let attempt;
  let newAttempt = false;
  let providerAccepted = false;
  let providerContacted = false;

  try {
    if (retry) {
      invitation = await getGuestInvitationById(id);
      attempt = await getActiveGuestSendAttempt(id);
      if (invitation.status !== 'sending' || !canRetryGuestSend(attempt)) {
        throw new Error(
          'This send cannot be retried safely now. Check its outcome in Resend.'
        );
      }
    } else {
      invitation = await getGuestInvitationById(id);
    }

    const name = retry ? attempt.guest_name : invitation.name;
    const recipient = retry ? attempt.recipient_email : invitation.email;
    const replyEmail = getApplicationCommsEmail();
    const email = buildGuestInvitationEmail({
      name,
      replyEmail,
      siteUrl:
        process.env.SITE_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        'https://trustandsafetyindia.org',
    });
    const [inlineAttachments, invitationPoster] = await Promise.all([
      getTasiEmailInlineAttachments(),
      buildGuestInvitationPoster({ name }),
    ]);
    const attachments = [
      ...inlineAttachments,
      {
        filename: 'tasi-2026-calendar.ics',
        content: Buffer.from(email.calendarContent, 'utf8'),
      },
      {
        filename: invitationPoster.filename,
        content: invitationPoster.imageBuffer,
      },
    ];

    if (!retry) {
      const claimed = await claimGuestInvitationSend({ id, operator });
      invitation = claimed.invitation;
      attempt = claimed.attempt;
      newAttempt = true;
    }

    const requestSha256 = hashGuestEmailRequest({
      from: getResendFromEmail(),
      to: recipient,
      subject: email.subject,
      text: email.text,
      html: email.html,
      replyTo: replyEmail,
      attachments,
    });
    await prepareGuestSendRequest(attempt.id, requestSha256);

    providerContacted = true;
    const delivery = await sendApplicantConfirmationEmail({
      to: recipient,
      subject: email.subject,
      text: email.text,
      html: email.html,
      replyTo: replyEmail,
      attachments,
      idempotencyKey: guestSendIdempotencyKey(attempt.id),
    });
    if (!delivery.sent || !delivery.providerMessageId) {
      throw new Error('Resend did not confirm an invitation message ID.');
    }
    providerAccepted = true;
    return await markGuestInvitationSent({
      attemptId: attempt.id,
      providerMessageId: delivery.providerMessageId,
    });
  } catch (error) {
    if (newAttempt && !providerContacted && attempt) {
      try {
        await markGuestInvitationFailed({
          attemptId: attempt.id,
          errorMessage:
            error instanceof Error ? error.message : 'Email was not sent.',
        });
      } catch (recordError) {
        console.error(
          'Unable to close unsent guest invitation attempt.',
          recordError
        );
      }
    }
    if (providerContacted && attempt) {
      console.error('Guest invitation provider outcome needs reconciliation.', {
        invitationId: id,
        attemptId: attempt.id,
        providerAccepted,
      });
      throw new Error(
        providerAccepted
          ? 'Resend accepted this invitation, but recording it failed. The send is locked for safe retry.'
          : 'The invitation outcome is uncertain. It is locked against a duplicate send; retry the same attempt after 10 minutes.'
      );
    }
    throw error;
  }
}
