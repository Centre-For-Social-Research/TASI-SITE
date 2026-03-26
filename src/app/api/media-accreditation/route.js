import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isValidEmail, sanitizeEmail } from "@/lib/input-sanitizers";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = sanitizeEmail(body?.email);

    if (!isValidEmail(email)) {
      return Response.json({ error: "Valid business email is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const message = [
      "Media accreditation request for TASI 2026",
      `Business email: ${email}`,
    ].join("\n");

    const { error } = await supabase.from("contact_messages").insert({
      email,
      message,
      source: "media-accreditation",
      created_at: new Date().toISOString(),
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit media accreditation request.";
    return Response.json({ error: message }, { status: 500 });
  }
}
