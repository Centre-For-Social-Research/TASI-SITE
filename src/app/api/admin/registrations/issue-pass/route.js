import { requireAuthorizedOperator } from "@/lib/registration-auth";
import {
  createNotification,
  issuePassForRegistration,
  markNotificationDelivery,
} from "@/lib/registration-db";
import { deliverRegistrationEmail } from "@/lib/registration-email";
import { buildPassAttachment } from "@/lib/registration-pass";

export async function POST(request) {
  const authResult = await requireAuthorizedOperator({ route: "api.admin.registrations.issue-pass" });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const registrationId = String(body?.registrationId || "").trim();

    if (!registrationId) {
      return Response.json({ error: "Registration ID is required." }, { status: 400 });
    }

    const issued = await issuePassForRegistration({
      registrationId,
      operator: authResult.operator,
    });

    const notificationId = await createNotification({
      registrationId,
      templateType: "qr_pass_issued",
      recipientEmail: issued.registration.email,
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

    const emailResult = await deliverRegistrationEmail({
      registration: issued.registration,
      templateType: "qr_pass_issued",
      notificationId,
      db: { markNotificationDelivery },
      qrDataUrl: attachment.qrDataUrl,
      pdfAttachment: {
        filename: attachment.filename,
        buffer: attachment.pdfBuffer,
      },
    });

    return Response.json({
      success: true,
      registration: issued.registration,
      created: issued.created,
      emailResult,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate and send the QR pass.";
    const status = message.includes("Only confirmed attendees can receive a QR pass.") ? 400 : 500;

    return Response.json({ error: message }, { status });
  }
}
