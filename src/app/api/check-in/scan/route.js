import { requireAuthorizedOperator } from "@/lib/registration-auth";
import { getRegistrationById, getRegistrationByToken, markCheckedIn, recordScan } from "@/lib/registration-db";

export async function POST(request) {
  const authResult = await requireAuthorizedOperator();
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const token = String(body?.token || "").trim();
    const registrationId = String(body?.registrationId || "").trim();
    const deskLabel = String(body?.deskLabel || "").trim();
    let registration = null;
    let pass = null;

    if (token) {
      const result = await getRegistrationByToken(token);
      registration = result.registration;
      pass = result.pass;
    } else if (registrationId) {
      registration = await getRegistrationById(registrationId);
    } else {
      return Response.json({ error: "Token or registration ID is required." }, { status: 400 });
    }

    if (!registration) {
      return Response.json({ error: "Attendee not found." }, { status: 404 });
    }

    if (registration.status !== "confirmed") {
      await recordScan({
        registrationId: registration.id,
        passId: pass?.id || null,
        token: token || null,
        result: registration.status === "waitlisted" ? "waitlisted" : registration.status === "rejected" ? "rejected" : "not_confirmed",
        operator: authResult.operator,
        deskLabel,
        notes: "Check-in blocked due to registration status.",
      });

      return Response.json({
        success: false,
        result: registration.status === "waitlisted" ? "waitlisted" : registration.status === "rejected" ? "rejected" : "not_confirmed",
        registration,
      });
    }

    const checkedIn = await markCheckedIn({
      registrationId: registration.id,
      operator: authResult.operator,
      deskLabel,
      passId: pass?.id || null,
      token: token || null,
    });

    return Response.json({
      success: true,
      result: checkedIn.alreadyCheckedIn ? "already_checked_in" : "valid",
      registration: checkedIn.registration,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to complete check-in." },
      { status: 500 }
    );
  }
}
