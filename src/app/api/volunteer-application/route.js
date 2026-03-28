import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { protectPublicPostRoute } from "@/lib/api-security";
import { isValidEmail, sanitizeEmail, sanitizeMessage } from "@/lib/input-sanitizers";

function sanitizeShortText(value, maxLength, fieldName, { required = true } = {}) {
  const sanitized = sanitizeMessage(value).replace(/\n+/g, " ").trim();

  if (!sanitized) {
    if (required) {
      throw new Error(`${fieldName} is required.`);
    }

    return "";
  }

  if (sanitized.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or less.`);
  }

  return sanitized;
}

export async function POST(request) {
  const protection = protectPublicPostRoute(request, "volunteer-application", {
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
    const email = sanitizeEmail(body?.email);
    const phone = sanitizeShortText(body?.phone, 40, "Phone number");
    const organization = sanitizeShortText(body?.organization, 160, "Organization", { required: false });
    const city = sanitizeShortText(body?.city, 120, "City");
    const availability = sanitizeShortText(body?.availability, 160, "Availability");
    const interestArea = sanitizeShortText(body?.interestArea, 160, "Area of interest");
    const motivation = sanitizeMessage(body?.motivation);

    if (!isValidEmail(email)) {
      return Response.json({ error: "Valid email is required." }, { status: 400 });
    }

    if (!motivation || motivation.length < 40) {
      return Response.json({ error: "Volunteer motivation must be at least 40 characters." }, { status: 400 });
    }

    if (motivation.length > 5000) {
      return Response.json({ error: "Volunteer motivation must be 5000 characters or less." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const message = [
      "Volunteer application for TASI 2026",
      `Name: ${firstName} ${lastName}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Organization: ${organization || "Not provided"}`,
      `City: ${city}`,
      `Availability: ${availability}`,
      `Area of interest: ${interestArea}`,
      "",
      "Motivation:",
      motivation,
    ].join("\n");

    const { error } = await supabase.from("contact_messages").insert({
      email,
      message,
      source: "volunteer-application",
      created_at: new Date().toISOString(),
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true }, { headers: protection.headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit volunteer application.";
    return Response.json({ error: message }, { status: 500, headers: protection.headers });
  }
}
