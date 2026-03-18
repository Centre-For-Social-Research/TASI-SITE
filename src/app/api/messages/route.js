import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isValidEmail, sanitizeEmail, sanitizeMessage } from "@/lib/input-sanitizers";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = sanitizeEmail(body?.email);
    const message = sanitizeMessage(body?.message);

    if (!isValidEmail(email)) {
      return Response.json({ error: "Valid email is required." }, { status: 400 });
    }

    if (!message || message.length < 10) {
      return Response.json({ error: "Message must be at least 10 characters." }, { status: 400 });
    }

    if (message.length > 5000) {
      return Response.json({ error: "Message must be 5000 characters or less." }, { status: 400 });
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit message.";
    return Response.json({ error: message }, { status: 500 });
  }
}