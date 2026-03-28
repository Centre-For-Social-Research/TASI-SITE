import { requireAuthorizedOperator } from "@/lib/registration-auth";
import { createNotification, getConfirmedRegistrationsForPassIssue, issuePassForRegistration, markNotificationDelivery } from "@/lib/registration-db";
import { deliverRegistrationEmail } from "@/lib/registration-email";
import { uploadPassQrImage } from "@/lib/registration-pass-assets";
import { buildPassAttachment } from "@/lib/registration-pass";

export async function POST() {
  const authResult = await requireAuthorizedOperator({ route: "api.admin.passes.issue-batch" });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const registrations = await getConfirmedRegistrationsForPassIssue();
    const results = [];

    for (const registration of registrations) {
      const issued = await issuePassForRegistration({
        registrationId: registration.id,
        operator: authResult.operator,
      });

      const notificationId = await createNotification({
        registrationId: registration.id,
        templateType: "qr_pass_issued",
        recipientEmail: registration.email,
        actorClerkId: authResult.operator.userId,
        actorEmail: authResult.operator.primaryEmail,
      });

      const attachment = await buildPassAttachment({
        token: issued.token,
        registration: {
          ...issued.registration,
          qr_token: issued.token,
        },
      });
      const qrImage = await uploadPassQrImage({
        passId: issued.passId,
        registrationId: issued.registration.id,
        token: issued.token,
      });

      const emailResult = await deliverRegistrationEmail({
        registration: issued.registration,
        templateType: "qr_pass_issued",
        notificationId,
        db: { markNotificationDelivery },
        qrImageUrl: qrImage.publicUrl,
        pdfAttachment: {
          filename: attachment.filename,
          buffer: attachment.pdfBuffer,
        },
      });

      results.push({
        registrationId: registration.id,
        registrationCode: registration.registration_code,
        created: issued.created,
        emailSent: emailResult.sent,
        emailError: emailResult.sent ? null : emailResult.error,
      });
    }

    return Response.json({
      success: true,
      total: results.length,
      results,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to issue QR passes." },
      { status: 500 }
    );
  }
}
