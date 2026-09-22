import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { getGuestInvitationById } from '@/lib/guest-invitation-db';
import { getApplicationCommsEmail } from '@/lib/resend';
import applicationAcknowledgementEmail from '@/lib/application-acknowledgement-email.cjs';

const { buildGuestInvitationEmail } = applicationAcknowledgementEmail;

export async function GET(_request, context) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.guest-invitations.preview',
  });
  if (!authResult.ok) return authResult.response;

  try {
    const { id } = await context.params;
    const invitation = await getGuestInvitationById(id);
    const email = buildGuestInvitationEmail({
      name: invitation.name,
      replyEmail: getApplicationCommsEmail(),
    });
    return adminJson({
      success: true,
      email: {
        subject: email.subject,
        text: email.text,
        html: email.html,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unable to preview guest invitation.';
    return adminJson(
      { error: message },
      { status: /not found/i.test(message) ? 404 : 500 }
    );
  }
}
