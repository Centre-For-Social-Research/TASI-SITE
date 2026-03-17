import { getSupabaseAdmin } from "@/lib/supabase-admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !EMAIL_REGEX.test(email)) {
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
        return Response.json({ success: true, alreadySubscribed: true });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to process newsletter subscription.";
    return Response.json({ error: message }, { status: 500 });
  }
}