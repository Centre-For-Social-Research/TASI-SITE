import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { protectPublicPostRoute } from "@/lib/api-security";
import { isValidEmail, sanitizeEmail } from "@/lib/input-sanitizers";
import { sendInboundNotificationEmail } from "@/lib/resend";

export async function POST(request) {
  const protection = protectPublicPostRoute(request, "register-confirmation", {
    windowMs: 10 * 60 * 1000,
    maxRequests: 5,
  });

  if (!protection.ok) {
    return protection.response;
  }

  try {
    const body = await request.json();
    const email = sanitizeEmail(body?.email);

    if (!isValidEmail(email)) {
      return Response.json({ error: "Valid email is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("registration_confirmation_requests").insert({
      email,
      source: "register-page",
      requested_at: new Date().toISOString(),
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    try {
      await sendInboundNotificationEmail({
        subject: "Registration confirmation email requested",
        text: [
          "A visitor requested manual registration confirmation support.",
          `Source: register-page`,
          `Email: ${email}`,
        ].join("\n"),
        replyTo: email,
      });
    } catch (emailError) {
      console.error("Failed to send registration confirmation notification email.", emailError);
    }

    return Response.json({ success: true }, { headers: protection.headers });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit confirmation email request.";

    return Response.json({ error: message }, { status: 500, headers: protection.headers });
  }
}
