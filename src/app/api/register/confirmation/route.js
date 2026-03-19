import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isValidEmail, sanitizeEmail } from "@/lib/input-sanitizers";

export async function POST(request) {
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

    return Response.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to submit confirmation email request.";

    return Response.json({ error: message }, { status: 500 });
  }
}
