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
      if (error.code === "23505") {
        return Response.json({ success: true, alreadySubscribed: true });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Unable to process newsletter subscription." }, { status: 500 });
  }
}