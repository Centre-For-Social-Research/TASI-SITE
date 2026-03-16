import { getSupabaseAdmin } from "@/lib/supabase-admin";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!email || !EMAIL_REGEX.test(email)) {
      return Response.json({ error: "Valid email is required." }, { status: 400 });
    }

    if (!message || message.length < 10) {
      return Response.json({ error: "Message must be at least 10 characters." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("contact_messages").insert({
      email,
      message,
      source: "site-footer",
      created_at: new Date().toISOString(),
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Unable to submit message." }, { status: 500 });
  }
}