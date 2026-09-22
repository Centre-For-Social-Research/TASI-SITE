import { requireAdminOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import {
  claimGuestInvitationSend,
  markGuestInvitationFailed,
  markGuestInvitationSent,
} from '@/lib/guest-invitation-db';
import { getTasiEmailInlineAttachments } from '@/lib/qr-pass-email-assets';
import {
  getApplicationCommsEmail,
  sendApplicantConfirmationEmail,
} from '@/lib/resend';
import applicationAcknowledgementEmail from '@/lib/application-acknowledgement-email.cjs';

const { buildGuestInvitationEmail } = applicationAcknowledgementEmail;

export async function POST(_request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.guest-invitations.send',
  });
  if (!authResult.ok) return authResult.response;

  let invitation;
  let providerAccepted = false;
  try {
    const attachments = await getTasiEmailInlineAttachments();
    const { id } = await context.params;
    invitation = await claimGuestInvitationSend({ id });
    const replyEmail = getApplicationCommsEmail();
    const email = buildGuestInvitationEmail({
      name: invitation.name,
      replyEmail,
    });
    const delivery = await sendApplicantConfirmationEmail({
      to: invitation.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
      replyTo: replyEmail,
      attachments,
    });

    if (!delivery.sent) {
      throw new Error(delivery.error || 'Email delivery could not start.');
    }
    providerAccepted = true;

    const updatedInvitation = await markGuestInvitationSent({
      invitation,
      operator: authResult.operator,
      providerMessageId: delivery.providerMessageId,
    });
    return adminJson({ success: true, invitation: updatedInvitation });
  } catch (error) {
    const originalMessage =
      error instanceof Error
        ? error.message
        : 'Unable to send guest invitation.';
    const message = providerAccepted
      ? 'The email was accepted by the provider, but its invitation record needs reconciliation before it can be resent.'
      : originalMessage;

    // A provider-accepted email must stay in the protected sending state if
    // recording it failed. Retrying blindly could duplicate an invitation.
    if (invitation && !providerAccepted) {
      try {
        await markGuestInvitationFailed({
          invitation,
          operator: authResult.operator,
          errorMessage: message,
        });
      } catch (recordError) {
        console.error(
          'Unable to record guest invitation delivery failure.',
          recordError
        );
      }
    }

    const status = /not found/i.test(originalMessage)
      ? 404
      : /already being sent|cannot be sent/i.test(originalMessage)
        ? 409
        : 502;
    return adminJson({ error: message }, { status });
  }
}
