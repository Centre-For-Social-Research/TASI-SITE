import { REGISTRATION_EMAIL_COPY } from '@/lib/registration-constants';
import { renderBrandedEmailHtml } from '@/lib/email-branding';
import { getResendClient, getResendFromEmail } from '@/lib/resend';

const renderEmailHtml = renderBrandedEmailHtml;

export async function deliverRegistrationEmail({
  registration,
  templateType,
  notificationId,
  db,
  qrImageUrl,
  pdfAttachment,
}) {
  const templateFactory = REGISTRATION_EMAIL_COPY[templateType];

  if (!templateFactory) {
    throw new Error(`Unsupported email template: ${templateType}`);
  }

  const { subject, text } = templateFactory({
    firstName: registration.first_name,
  });
  const resend = getResendClient();

  if (!resend) {
    if (notificationId && db?.markNotificationDelivery) {
      await db.markNotificationDelivery(notificationId, {
        delivery_status: 'failed',
        failure_reason: 'Missing RESEND_API_KEY.',
      });
    }

    return {
      sent: false,
      skipped: true,
      error: 'Missing RESEND_API_KEY.',
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: getResendFromEmail(),
      to: [registration.email],
      subject,
      text,
      html: renderEmailHtml(text, {
        qrImageUrl,
        registrationCode: registration.registration_code,
      }),
      attachments: pdfAttachment
        ? [
            {
              filename: pdfAttachment.filename,
              content: pdfAttachment.buffer,
            },
          ]
        : undefined,
    });

    if (error) {
      throw new Error(error.message || 'Failed to send email.');
    }

    if (notificationId && db?.markNotificationDelivery) {
      await db.markNotificationDelivery(notificationId, {
        delivery_status: 'sent',
        provider_message_id: data?.id || null,
      });
    }

    return { sent: true, providerMessageId: data?.id || null };
  } catch (error) {
    if (notificationId && db?.markNotificationDelivery) {
      await db.markNotificationDelivery(notificationId, {
        delivery_status: 'failed',
        failure_reason:
          error instanceof Error ? error.message : 'Failed to send email.',
      });
    }

    return {
      sent: false,
      error: error instanceof Error ? error.message : 'Failed to send email.',
    };
  }
}
