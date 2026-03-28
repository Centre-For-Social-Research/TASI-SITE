import { requireAuthorizedOperator } from "@/lib/registration-auth";
import { createNotification, getRegistrationById, markNotificationDelivery } from "@/lib/registration-db";
import { deliverRegistrationEmail } from "@/lib/registration-email";
import passUtils from "@/lib/registration-pass-utils.cjs";

const ALLOWED_TEMPLATES = new Set(["submission_received", "confirmed", "waitlisted", "rejected", "qr_pass_issued"]);
const { getIssuedEntryPass } = passUtils;

export async function POST(request) {
  const authResult = await requireAuthorizedOperator();
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const registrationId = String(body?.registrationId || "").trim();
    const templateType = String(body?.templateType || "").trim();

    if (!registrationId || !ALLOWED_TEMPLATES.has(templateType)) {
      return Response.json({ error: "Registration ID and valid template type are required." }, { status: 400 });
    }

    const registration = await getRegistrationById(registrationId);
    const notificationId = await createNotification({
      registrationId: registration.id,
      templateType,
      recipientEmail: registration.email,
      actorClerkId: authResult.operator.userId,
      actorEmail: authResult.operator.primaryEmail,
    });

    let pdfAttachment = null;
    let qrDataUrl = null;
    let issuedPass = null;
    if (templateType === "qr_pass_issued") {
      issuedPass = getIssuedEntryPass(registration.entry_passes);
      if (!issuedPass) {
        return Response.json({ error: "This attendee does not have an issued QR pass yet." }, { status: 400 });
      }

      const { buildPassAttachment } = await import("@/lib/registration-pass");
      const attachment = await buildPassAttachment({
        token: issuedPass.token,
        registration: {
          ...registration,
          qr_token: issuedPass.token,
        },
      });
      pdfAttachment = {
        filename: attachment.filename,
        buffer: attachment.pdfBuffer,
      };
      qrDataUrl = attachment.qrDataUrl;
    }

    const result = await deliverRegistrationEmail({
      registration,
      templateType,
      notificationId,
      db: { markNotificationDelivery },
      qrDataUrl,
      qrPassId: templateType === "qr_pass_issued" ? issuedPass?.id : undefined,
      pdfAttachment,
    });

    if (result.sent) {
      await markNotificationDelivery(notificationId, { delivery_status: "resent" });
    }

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to resend email." },
      { status: 500 }
    );
  }
}
