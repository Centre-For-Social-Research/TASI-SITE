import { requireAdminOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import {
  claimGuestInvitationSend,
  getGuestInvitationById,
  markGuestInvitationFailed,
  markGuestInvitationSent,
  reconcileGuestInvitationSend,
} from '@/lib/guest-invitation-db';
import guestInvitationUtils from '@/lib/guest-invitation-utils.cjs';
import { getTasiEmailInlineAttachments } from '@/lib/qr-pass-email-assets';
import {
  getApplicationCommsEmail,
  sendApplicantConfirmationEmail,
} from '@/lib/resend';
import { buildGuestInvitationPoster } from '@/lib/guest-invitation-poster';
import applicationAcknowledgementEmail from '@/lib/application-acknowledgement-email.cjs';

const { buildGuestInvitationEmail } = applicationAcknowledgementEmail;
const { guestInvitationSendKey } = guestInvitationUtils;

export async function POST(_request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.guest-invitations.send',
  });
  if (!authResult.ok) return authResult.response;

  let invitation;
  let providerAccepted = false;
  let providerAttempted = false;
  try {
    const { id } = await context.params;
    const current = await getGuestInvitationById(id);
    if (current.status === 'sending') {
      const reconciled = await reconcileGuestInvitationSend({ id });
      if (!reconciled) {
        return adminJson(
          {
            error:
              'No accepted email record is available yet. Check Resend before trying again; this send remains protected from duplicates.',
          },
          { status: 409 }
        );
      }
      return adminJson({
        success: true,
        reconciled: true,
        invitation: reconciled,
      });
    }

    const inlineAttachments = await getTasiEmailInlineAttachments();
    invitation = await claimGuestInvitationSend({ id });
    const replyEmail = getApplicationCommsEmail();
    const email = buildGuestInvitationEmail({
      name: invitation.name,
      replyEmail,
      siteUrl:
        process.env.SITE_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        'https://trustandsafetyindia.org',
    });
    const invitationPoster = await buildGuestInvitationPoster({
      name: invitation.name,
    });
    providerAttempted = true;
    const delivery = await sendApplicantConfirmationEmail({
      to: invitation.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
      replyTo: replyEmail,
      idempotencyKey: guestInvitationSendKey(invitation),
      attachments: [
        ...inlineAttachments,
        {
          filename: 'tasi-2026-calendar.ics',
          content: Buffer.from(email.calendarContent, 'utf8'),
        },
        {
          filename: invitationPoster.filename,
          content: invitationPoster.imageBuffer,
        },
      ],
    });
    if (delivery.skipped) providerAttempted = false;

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
      : providerAttempted
        ? 'The provider outcome is unclear. This invitation remains protected from another send; check Resend before taking further action.'
        : originalMessage;

    // A provider-accepted email must stay in the protected sending state if
    // recording it failed. Retrying blindly could duplicate an invitation.
    if (invitation && !providerAttempted) {
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
