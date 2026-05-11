import { getSupabaseAdmin } from '@/lib/supabase-admin';
import checkInDayUtils from '@/lib/check-in-day-utils.cjs';

const { getCheckInDayNumber, normalizeCheckInDay, normalizeCheckIns } =
  checkInDayUtils;

const REGISTRATION_CHECK_IN_SELECT = `
  id,
  registration_code,
  first_name,
  last_name,
  email,
  organization,
  attendee_category,
  status,
  checked_in_at,
  registration_daily_check_ins (
    event_day,
    checked_in_at,
    desk_label,
    actor_email
  )
`;

function getSupabase() {
  return getSupabaseAdmin();
}

function isUniqueViolation(error) {
  return error?.code === '23505' || /duplicate key/i.test(error?.message || '');
}

function normalizeRegistration(row) {
  if (!row) {
    return null;
  }

  const dailyCheckIns = Array.isArray(row.registration_daily_check_ins)
    ? row.registration_daily_check_ins.filter(Boolean)
    : row.registration_daily_check_ins
      ? [row.registration_daily_check_ins]
      : [];

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
    registration_daily_check_ins: dailyCheckIns,
    check_ins: normalizeCheckIns(dailyCheckIns, row.checked_in_at),
  };
}

export async function getCheckInRecordByToken(token) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('entry_passes')
    .select(
      `
      id,
      token,
      status,
      registration:event_registrations (
        ${REGISTRATION_CHECK_IN_SELECT}
      )
    `
    )
    .eq('token', token)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { pass: null, registration: null };
    }
    throw new Error(error.message);
  }

  const registration = Array.isArray(data.registration)
    ? data.registration[0]
    : data.registration;
  return {
    pass: data,
    registration: normalizeRegistration(registration),
  };
}

export async function getCheckInRegistrationById(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('event_registrations')
    .select(REGISTRATION_CHECK_IN_SELECT)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeRegistration(data);
}

export async function searchCheckInCandidatesLight(query) {
  const supabase = getSupabase();
  const sanitized = String(query || '').trim();

  if (!sanitized) {
    return [];
  }

  const { data, error } = await supabase
    .from('event_registrations')
    .select(REGISTRATION_CHECK_IN_SELECT)
    .or(
      `first_name.ilike.%${sanitized}%,last_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,registration_code.ilike.%${sanitized}%`
    )
    .order('created_at', { ascending: false })
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
  eventDay,
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from('entry_scans').insert({
    registration_id: registrationId,
    entry_pass_id: passId,
    token,
    event_day: getCheckInDayNumber(eventDay),
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

export async function completeCheckIn({
  registrationId,
  passId = null,
  token = null,
  operator,
  deskLabel,
  eventDay,
}) {
  const supabase = getSupabase();
  const checkedInAt = new Date().toISOString();
  const normalizedDay = normalizeCheckInDay(eventDay);
  const eventDayNumber = getCheckInDayNumber(normalizedDay);

  const { error: insertError } = await supabase
    .from('registration_daily_check_ins')
    .insert({
      registration_id: registrationId,
      event_day: eventDayNumber,
      checked_in_at: checkedInAt,
      entry_pass_id: passId,
      token,
      desk_label: deskLabel || null,
      actor_clerk_id: operator.userId,
      actor_email: operator.primaryEmail,
      notes: `Checked in for ${normalizedDay.replace('_', ' ')}.`,
      created_at: checkedInAt,
      updated_at: checkedInAt,
    })
    .select('id')
    .maybeSingle();

  if (insertError && !isUniqueViolation(insertError)) {
    throw new Error(insertError.message);
  }

  const alreadyCheckedIn = Boolean(insertError);

  if (!alreadyCheckedIn) {
    const { error: updateError } = await supabase
      .from('event_registrations')
      .update({
        checked_in_at: checkedInAt,
        updated_at: checkedInAt,
      })
      .eq('id', registrationId)
      .is('checked_in_at', null);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  const registration = await getCheckInRegistrationById(registrationId);

  await recordEntryScan({
    registrationId,
    passId,
    token,
    result: alreadyCheckedIn ? 'already_checked_in' : 'valid',
    operator,
    deskLabel,
    notes: alreadyCheckedIn
      ? `Duplicate ${normalizedDay.replace('_', ' ')} check-in attempt.`
      : `Checked in successfully for ${normalizedDay.replace('_', ' ')}.`,
    eventDay: normalizedDay,
  });

  return {
    registration,
    alreadyCheckedIn,
    eventDay: normalizedDay,
  };
}

export async function listRecentEntryScans(options = {}) {
  const normalizedOptions =
    typeof options === 'number' ? { limit: options } : options || {};
  const { limit = 8, eventDay } = normalizedOptions;
  const supabase = getSupabase();
  const query = supabase
    .from('entry_scans')
    .select(
      `
      id,
      scan_result,
      desk_label,
      event_day,
      created_at,
      registration:event_registrations (
        registration_code,
        first_name,
        last_name,
        organization
      )
    `
    )
    .eq('event_day', getCheckInDayNumber(eventDay))
    .order('created_at', { ascending: false })
    .limit(limit);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
