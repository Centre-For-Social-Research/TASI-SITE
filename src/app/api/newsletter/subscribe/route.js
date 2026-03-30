import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { protectPublicPostRoute } from "@/lib/api-security";
import { isValidEmail, sanitizeEmail } from "@/lib/input-sanitizers";
import { sendInboundNotificationEmail } from "@/lib/resend";

export async function POST(request) {
  const protection = await protectPublicPostRoute(request, "newsletter-subscribe", {
    windowMs: 10 * 60 * 1000,
    maxRequests: 8,
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

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email,
        status: "active",
        source: "site-footer",
        subscribed_at: new Date().toISOString(),
      });

    if (error) {
      // Treat existing subscribers as success to keep UX idempotent.
      const isDuplicate =
        error.code === "23505" ||
        error.details?.toLowerCase().includes("already exists") ||
        error.message?.toLowerCase().includes("duplicate");

      if (isDuplicate) {
        return Response.json(
          { success: true, alreadySubscribed: true },
          { headers: protection.headers }
        );
      }
      return Response.json({ error: error.message }, { status: 500, headers: protection.headers });
    }

    try {
      await sendInboundNotificationEmail({
        subject: "New TASI newsletter subscriber",
        text: [
          "A new newsletter subscriber joined through the website.",
          `Source: site-footer`,
          `Email: ${email}`,
        ].join("\n"),
        replyTo: email,
      });
    } catch (emailError) {
      console.error("Failed to send newsletter notification email.", emailError);
    }

    return Response.json({ success: true }, { headers: protection.headers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to process newsletter subscription.";
    return Response.json({ error: message }, { status: 500, headers: protection.headers });
  }
}
