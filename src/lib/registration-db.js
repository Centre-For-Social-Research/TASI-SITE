import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  buildPassToken,
  getBadgeColor,
  isAfterBadgeFreeze,
} from '@/lib/registration-utils';
import passUtils from '@/lib/registration-pass-utils.cjs';

const { normalizeRegistrationRecord, getIssuedEntryPass } = passUtils;

function getSupabase() {
  return getSupabaseAdmin();
}

export class StaleRegistrationUpdateError extends Error {
  constructor(message = 'Registration changed before this update could save.') {
    super(message);
    this.name = 'StaleRegistrationUpdateError';
    this.code = 'STALE_REGISTRATION_UPDATE';
  }
}

function baseRegistrationSelect() {
  return `
    id,
    registration_code,
    first_name,
    last_name,
    email,
    phone,
    organization,
    designation,
    attendee_category,
    city,
    country,
    linkedin_url,
    attendance_reason,
    priority_tier,
    source,
    status,
    speaker_flag,
    vip_flag,
    exception_badge_required,
    badge_color_label,
    badge_color_hex,
    profile_photo_path,
    profile_photo_size_bytes,
    profile_photo_width,
    profile_photo_height,
    qr_pass_issued_at,
    checked_in_at,
    created_at,
    updated_at,
    reviewed_at,
    reviewed_by_clerk_id,
    reviewed_by_email,
    review_notes,
    last_badge_export_batch_id,
    entry_passes (
      id,
      token,
      status,
      issued_at,
      revoked_at
    )
  `;
}

export async function createRegistration({
  registration,
  profilePhoto,
  operator = null,
}) {
  const supabase = getSupabase();
  const badgeColor = getBadgeColor({
    attendeeCategory: registration.attendee_category,
    speakerFlag: registration.speaker_flag,
    vipFlag: registration.vip_flag,
  });

  const row = {
    ...registration,
    status: 'pending',
    badge_color_label: badgeColor.label,
    badge_color_hex: badgeColor.hex,
    source: registration.source,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('event_registrations')
    .insert(row)
    .select(baseRegistrationSelect())
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await appendStatusHistory({
    registrationId: data.id,
    previousStatus: null,
    nextStatus: 'pending',
    actorClerkId: operator?.userId || null,
    actorEmail: operator?.primaryEmail || null,
    actionType: 'registration_submitted',
    notes: 'Registration created from public form.',
  });

  if (profilePhoto) {
    await supabase.from('registration_assets').insert({
      registration_id: data.id,
      asset_type: 'profile_photo',
      storage_bucket: profilePhoto.bucket,
      storage_path: profilePhoto.path,
      original_filename: profilePhoto.originalFilename,
      mime_type: profilePhoto.mimeType,
      size_bytes: profilePhoto.sizeBytes,
      width: profilePhoto.width,
      height: profilePhoto.height,
      created_at: new Date().toISOString(),
    });
  }

  return normalizeRegistrationRecord(data);
}

export async function appendStatusHistory({
  registrationId,
  previousStatus,
  nextStatus,
  actorClerkId,
  actorEmail,
  actionType,
  notes,
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from('registration_status_history').insert({
    registration_id: registrationId,
    previous_status: previousStatus,
    next_status: nextStatus,
    action_type: actionType,
    notes: notes || null,
    actor_clerk_id: actorClerkId || null,
    actor_email: actorEmail || null,
    created_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function createNotification({
  registrationId,
  templateType,
  recipientEmail,
  recipientPhone = null,
  deliveryChannel = 'email',
  actorClerkId = null,
  actorEmail = null,
}) {
  const supabase = getSupabase();
  const notification = {
    registration_id: registrationId,
    template_type: templateType,
    recipient_email: recipientEmail,
    delivery_status: 'queued',
    actor_clerk_id: actorClerkId,
    actor_email: actorEmail,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (deliveryChannel !== 'email' || recipientPhone) {
    notification.delivery_channel = deliveryChannel;
    notification.recipient_phone = recipientPhone;
  }

  const { data, error } = await supabase
    .from('registration_notifications')
    .insert(notification)
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id;
}

export async function markNotificationDelivery(notificationId, fields) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('registration_notifications')
    .update({
      ...fields,
      updated_at: new Date().toISOString(),
    })
    .eq('id', notificationId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getRegistrationById(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('event_registrations')
    .select(baseRegistrationSelect())
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeRegistrationRecord(data);
}

export async function listRegistrations(filters = {}) {
  const supabase = getSupabase();
  let query = supabase
    .from('event_registrations')
    .select(baseRegistrationSelect(), { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.category && filters.category !== 'all') {
    query = query.eq('attendee_category', filters.category);
  }

  if (filters.priorityTier && filters.priorityTier !== 'all') {
    query = query.eq('priority_tier', filters.priorityTier);
  }

  if (filters.country) {
    query = query.ilike('country', `%${filters.country}%`);
  }

  if (filters.organization) {
    query = query.ilike('organization', `%${filters.organization}%`);
  }

  if (filters.lateConfirmation === 'yes') {
    query = query.eq('exception_badge_required', true);
  }

  if (filters.speakerFlag === 'yes') {
    query = query.eq('speaker_flag', true);
  }

  if (filters.search) {
    const sanitizedSearch = String(filters.search).trim();
    query = query.or(
      `first_name.ilike.%${sanitizedSearch}%,last_name.ilike.%${sanitizedSearch}%,email.ilike.%${sanitizedSearch}%,registration_code.ilike.%${sanitizedSearch}%,organization.ilike.%${sanitizedSearch}%`
    );
  }

  const { data, count, error } = await query.limit(200);

  if (error) {
    throw new Error(error.message);
  }

  const summary = {
    total: count || 0,
    pending: 0,
    confirmed: 0,
    waitlisted: 0,
    rejected: 0,
    qrIssued: 0,
    checkedIn: 0,
    exceptionBadges: 0,
  };

  const normalizedRegistrations = (data || []).map((registration) =>
    normalizeRegistrationRecord(registration)
  );

  for (const registration of normalizedRegistrations) {
    if (registration.status === 'pending') summary.pending += 1;
    if (registration.status === 'confirmed') summary.confirmed += 1;
    if (registration.status === 'waitlisted') summary.waitlisted += 1;
    if (registration.status === 'rejected') summary.rejected += 1;
    if (registration.qr_pass_issued_at) summary.qrIssued += 1;
    if (registration.checked_in_at) summary.checkedIn += 1;
    if (registration.exception_badge_required) summary.exceptionBadges += 1;
  }

  return {
    registrations: normalizedRegistrations,
    count: count || 0,
    summary,
  };
}

export async function updateRegistrationStatus({
  registrationId,
  status,
  reviewNotes,
  speakerFlag,
  vipFlag,
  operator,
  expectedUpdatedAt,
}) {
  const existing = await getRegistrationById(registrationId);
  const nextSpeakerFlag =
    typeof speakerFlag === 'boolean' ? speakerFlag : existing.speaker_flag;
  const nextVipFlag =
    typeof vipFlag === 'boolean' ? vipFlag : existing.vip_flag;
  const badgeColor = getBadgeColor({
    attendeeCategory: existing.attendee_category,
    speakerFlag: nextSpeakerFlag,
    vipFlag: nextVipFlag,
  });
  const exceptionBadgeRequired = status === 'confirmed' && isAfterBadgeFreeze();
  const supabase = getSupabase();
  let updateQuery = supabase
    .from('event_registrations')
    .update({
      status,
      review_notes: reviewNotes || null,
      speaker_flag: nextSpeakerFlag,
      vip_flag: nextVipFlag,
      badge_color_label: badgeColor.label,
      badge_color_hex: badgeColor.hex,
      reviewed_at: new Date().toISOString(),
      reviewed_by_clerk_id: operator.userId,
      reviewed_by_email: operator.primaryEmail,
      exception_badge_required: exceptionBadgeRequired,
      updated_at: new Date().toISOString(),
    })
    .eq('id', registrationId);

  if (expectedUpdatedAt) {
    updateQuery = updateQuery.eq('updated_at', expectedUpdatedAt);
  }

  const { data, error } = await updateQuery
    .select(baseRegistrationSelect())
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new StaleRegistrationUpdateError();
  }

  await appendStatusHistory({
    registrationId,
    previousStatus: existing.status,
    nextStatus: status,
    actorClerkId: operator.userId,
    actorEmail: operator.primaryEmail,
    actionType: 'status_updated',
    notes: reviewNotes || null,
  });

  return normalizeRegistrationRecord(data);
}

export async function getConfirmedRegistrationsForPassIssue() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('event_registrations')
    .select(baseRegistrationSelect())
    .eq('status', 'confirmed')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((registration) =>
    normalizeRegistrationRecord(registration)
  );
}

export async function issuePassForRegistration({ registrationId, operator }) {
  const registration = await getRegistrationById(registrationId);

  if (registration.status !== 'confirmed') {
    throw new Error('Only confirmed attendees can receive a QR pass.');
  }

  const existingPass = getIssuedEntryPass(registration.entry_passes);
  const supabase = getSupabase();

  if (existingPass) {
    return {
      registration: {
        ...registration,
        qr_token: existingPass.token,
      },
      created: false,
      passId: existingPass.id,
      token: existingPass.token,
    };
  }

  const token = buildPassToken();
  const { data: createdPass, error: passError } = await supabase
    .from('entry_passes')
    .insert({
      registration_id: registrationId,
      token,
      status: 'issued',
      issued_at: new Date().toISOString(),
      issued_by_clerk_id: operator.userId,
      issued_by_email: operator.primaryEmail,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (passError) {
    throw new Error(passError.message);
  }

  const exceptionBadgeRequired = isAfterBadgeFreeze();
  const { data, error } = await supabase
    .from('event_registrations')
    .update({
      qr_pass_issued_at: new Date().toISOString(),
      exception_badge_required:
        registration.exception_badge_required || exceptionBadgeRequired,
      updated_at: new Date().toISOString(),
    })
    .eq('id', registrationId)
    .select(baseRegistrationSelect())
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await appendStatusHistory({
    registrationId,
    previousStatus: registration.status,
    nextStatus: registration.status,
    actorClerkId: operator.userId,
    actorEmail: operator.primaryEmail,
    actionType: 'qr_pass_issued',
    notes: 'QR pass issued.',
  });

  return {
    registration: {
      ...normalizeRegistrationRecord(data),
      qr_token: token,
    },
    created: true,
    passId: createdPass?.id || null,
    token,
  };
}

export async function listBadgeExportRegistrations() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('event_registrations')
    .select(baseRegistrationSelect())
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((registration) => {
    const normalizedRegistration = normalizeRegistrationRecord(registration);
    const issuedPass = getIssuedEntryPass(normalizedRegistration.entry_passes);

    return {
      ...normalizedRegistration,
      qr_token: issuedPass?.token || '',
    };
  });
}

export async function recordBadgeExport({
  operator,
  format,
  totalRegistrations,
  frozenAt,
}) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('badge_exports')
    .insert({
      export_format: format,
      total_registrations: totalRegistrations,
      frozen_at: frozenAt,
      created_by_clerk_id: operator.userId,
      created_by_email: operator.primaryEmail,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id;
}

export async function setLastBadgeExportBatch(batchId, registrationIds) {
  if (!registrationIds.length) {
    return;
  }

  const supabase = getSupabase();
  const { error } = await supabase
    .from('event_registrations')
    .update({
      last_badge_export_batch_id: batchId,
      updated_at: new Date().toISOString(),
    })
    .in('id', registrationIds);

  if (error) {
    throw new Error(error.message);
  }
}

export async function searchCheckInCandidates(query) {
  const supabase = getSupabase();
  const sanitized = String(query || '').trim();

  if (!sanitized) {
    return [];
  }

  const { data, error } = await supabase
    .from('event_registrations')
    .select(baseRegistrationSelect())
    .or(
      `first_name.ilike.%${sanitized}%,last_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%,registration_code.ilike.%${sanitized}%`
    )
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((registration) =>
    normalizeRegistrationRecord(registration)
  );
}

export async function getRegistrationByToken(token) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('entry_passes')
    .select(
      `id, token, status, issued_at, revoked_at, registration:event_registrations(${baseRegistrationSelect()})`
    )
    .eq('token', token)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return {
        pass: null,
        registration: null,
      };
    }

    throw new Error(error.message);
  }

  const registration = Array.isArray(data.registration)
    ? data.registration[0]
    : data.registration;
  return {
    pass: data,
    registration: normalizeRegistrationRecord(registration),
  };
}

export async function getEntryPassById(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('entry_passes')
    .select(
      `id, token, status, issued_at, revoked_at, registration:event_registrations(${baseRegistrationSelect()})`
    )
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return {
        pass: null,
        registration: null,
      };
    }

    throw new Error(error.message);
  }

  const registration = Array.isArray(data.registration)
    ? data.registration[0]
    : data.registration;
  return {
    pass: data,
    registration: normalizeRegistrationRecord(registration),
  };
}

export async function recordScan({
  registrationId,
  passId = null,
  token = null,
  result,
  operator,
  deskLabel,
  notes,
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from('entry_scans').insert({
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

export async function markCheckedIn({
  registrationId,
  operator,
  deskLabel,
  passId = null,
  token = null,
}) {
  const registration = await getRegistrationById(registrationId);
  const supabase = getSupabase();
  const alreadyCheckedIn = Boolean(registration.checked_in_at);

  if (!alreadyCheckedIn) {
    const { error } = await supabase
      .from('event_registrations')
      .update({
        checked_in_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', registrationId);

    if (error) {
      throw new Error(error.message);
    }
  }

  await recordScan({
    registrationId,
    passId,
    token,
    result: alreadyCheckedIn ? 'already_checked_in' : 'valid',
    operator,
    deskLabel,
    notes: alreadyCheckedIn
      ? 'Duplicate check-in attempt.'
      : 'Checked in successfully.',
  });

  return {
    registration,
    alreadyCheckedIn,
  };
}

export async function updateNotificationFromWebhook({
  providerMessageId,
  deliveryStatus,
  failureReason = null,
  providerPayload = null,
}) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('registration_notifications')
    .update({
      delivery_status: deliveryStatus,
      failure_reason: failureReason,
      provider_payload: providerPayload,
      updated_at: new Date().toISOString(),
    })
    .eq('provider_message_id', providerMessageId);

  if (error) {
    throw new Error(error.message);
  }
}
