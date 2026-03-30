import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { protectPublicPostRoute } from "@/lib/api-security";
import { isValidEmail, sanitizeEmail, sanitizeMessage } from "@/lib/input-sanitizers";
import { sendInboundNotificationEmail } from "@/lib/resend";

function sanitizeShortText(value, maxLength, fieldName) {
  const sanitized = sanitizeMessage(value).replace(/\n+/g, " ").trim();

  if (!sanitized) {
    throw new Error(`${fieldName} is required.`);
  }

  if (sanitized.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or less.`);
  }

  return sanitized;
}

export async function POST(request) {
  const protection = await protectPublicPostRoute(request, "speaker-application", {
    windowMs: 15 * 60 * 1000,
    maxRequests: 3,
  });

  if (!protection.ok) {
    return protection.response;
  }

  try {
    const body = await request.json();

    const firstName = sanitizeShortText(body?.firstName, 80, "First name");
    const lastName = sanitizeShortText(body?.lastName, 80, "Last name");
    const organization = sanitizeShortText(body?.organization, 160, "Organization");
    const role = sanitizeShortText(body?.role, 160, "Role");
    const topic = sanitizeShortText(body?.topic, 160, "Session topic");
    const email = sanitizeEmail(body?.email);
    const pitch = sanitizeMessage(body?.pitch);

    if (!isValidEmail(email)) {
      return Response.json({ error: "Valid email is required." }, { status: 400 });
    }

    if (!pitch || pitch.length < 40) {
      return Response.json({ error: "Speaker pitch must be at least 40 characters." }, { status: 400 });
    }

    if (pitch.length > 5000) {
      return Response.json({ error: "Speaker pitch must be 5000 characters or less." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const message = [
      `Speaker application for TASI 2026`,
      `Name: ${firstName} ${lastName}`,
      `Email: ${email}`,
      `Organization: ${organization}`,
      `Role: ${role}`,
      `Suggested topic: ${topic}`,
      "",
      "Pitch:",
      pitch,
    ].join("\n");

    const { error } = await supabase.from("contact_messages").insert({
      email,
      message,
      source: "speaker-application",
      created_at: new Date().toISOString(),
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    try {
      await sendInboundNotificationEmail({
        subject: "New speaker application",
        text: message,
        replyTo: email,
      });
    } catch (emailError) {
      console.error("Failed to send speaker application notification email.", emailError);
    }

    return Response.json({ success: true }, { headers: protection.headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit speaker application.";
    return Response.json({ error: message }, { status: 500, headers: protection.headers });
  }
}
