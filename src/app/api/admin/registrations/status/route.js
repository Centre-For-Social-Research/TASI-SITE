import { requireAuthorizedOperator } from "@/lib/registration-auth";
import { createNotification, updateRegistrationStatus } from "@/lib/registration-db";
import { deliverRegistrationEmail } from "@/lib/registration-email";
import { normalizeRegistrationStatus } from "@/lib/registration-utils";

export async function POST(request) {
  const authResult = await requireAuthorizedOperator();
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const registrationId = String(body?.registrationId || "").trim();

    if (!registrationId) {
      return Response.json({ error: "Registration ID is required." }, { status: 400 });
    }

    const updatedRegistration = await updateRegistrationStatus({
      registrationId,
      status: normalizeRegistrationStatus(body?.status),
      reviewNotes: String(body?.reviewNotes || "").trim(),
      speakerFlag: Boolean(body?.speakerFlag),
      vipFlag: Boolean(body?.vipFlag),
      operator: authResult.operator,
    });

    const templateType = updatedRegistration.status;
    const notificationId = await createNotification({
      registrationId: updatedRegistration.id,
      templateType,
      recipientEmail: updatedRegistration.email,
      actorClerkId: authResult.operator.userId,
      actorEmail: authResult.operator.primaryEmail,
    });

    const { markNotificationDelivery } = await import("@/lib/registration-db");
    const emailResult = await deliverRegistrationEmail({
      registration: updatedRegistration,
      templateType,
      notificationId,
      db: { markNotificationDelivery },
    });

    return Response.json({
      success: true,
      registration: updatedRegistration,
      emailResult,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to update registration." },
      { status: 500 }
    );
  }
}
