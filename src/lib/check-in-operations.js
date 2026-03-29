import { getSupabaseAdmin } from "@/lib/supabase-admin";

function getSupabase() {
  return getSupabaseAdmin();
}

function normalizeRegistration(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    registration_code: row.registration_code,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    organization: row.organization,
    attendee_category: row.attendee_category,
    status: row.status,
    checked_in_at: row.checked_in_at,
  };
}

export async function getCheckInRecordByToken(token) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("entry_passes")
    .select(`
      id,
      token,
      status,
      registration:event_registrations (
        id,
        registration_code,
        first_name,
        last_name,
        email,
        organization,
        attendee_category,
        status,
        checked_in_at
      )
    `)
    .eq("token", token)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { pass: null, registration: null };
    }
    throw new Error(error.message);
  }

  const registration = Array.isArray(data.registration) ? data.registration[0] : data.registration;
  return {
    pass: data,
    registration: normalizeRegistration(registration),
  };
}

export async function getCheckInRegistrationById(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("event_registrations")
    .select("id, registration_code, first_name, last_name, email, organization, attendee_category, status, checked_in_at")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeRegistration(data);
}

export async function searchCheckInCandidatesLight(query) {
  const supabase = getSupabase();
  const sanitized = String(query || "").trim();

  if (!sanitized) {
    return [];
  }

  const { data, error } = await supabase
    .from("event_registrations")
    .select("id, registration_code, first_name, last_name, email, organization, attendee_category, status, checked_in_at")
    .or(
      `first_name.ilike.%${sanitized}%,last_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,registration_code.ilike.%${sanitized}%`,
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(normalizeRegistration);
}

export async function recordEntryScan({
  registrationId,
  passId = null,
  token = null,
  result,
  operator,
  deskLabel,
  notes,
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from("entry_scans").insert({
    registration_id: registrationId,
    entry_pass_id: passId,
    token,
    scan_result: result,
    desk_label: deskLabel || null,
    notes: notes || null,
    actor_clerk_id: operator.userId,
    actor_email: operator.primaryEmail,
    created_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function completeCheckIn({ registrationId, passId = null, token = null, operator, deskLabel }) {
  const registration = await getCheckInRegistrationById(registrationId);
  const alreadyCheckedIn = Boolean(registration.checked_in_at);
  const supabase = getSupabase();

  if (!alreadyCheckedIn) {
    const checkedInAt = new Date().toISOString();
    const { error } = await supabase
      .from("event_registrations")
      .update({
        checked_in_at: checkedInAt,
        updated_at: checkedInAt,
      })
      .eq("id", registrationId);

    if (error) {
      throw new Error(error.message);
    }

    registration.checked_in_at = checkedInAt;
  }

  await recordEntryScan({
    registrationId,
    passId,
    token,
    result: alreadyCheckedIn ? "already_checked_in" : "valid",
    operator,
    deskLabel,
    notes: alreadyCheckedIn ? "Duplicate check-in attempt." : "Checked in successfully.",
  });

  return {
    registration,
    alreadyCheckedIn,
  };
}

export async function listRecentEntryScans(limit = 8) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("entry_scans")
    .select(`
      id,
      scan_result,
      desk_label,
      created_at,
      registration:event_registrations (
        registration_code,
        first_name,
        last_name,
        organization
      )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
