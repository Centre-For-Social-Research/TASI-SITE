import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getRegistrationById } from "@/lib/registration-db";

function getSupabase() {
  return getSupabaseAdmin();
}

function normalizeString(value) {
  return String(value || "").trim();
}

function applyRegistrationFilters(query, filters = {}) {
  let nextQuery = query;
  const search = normalizeString(filters.search);
  const status = normalizeString(filters.status);
  const category = normalizeString(filters.category);
  const priorityTier = normalizeString(filters.priorityTier);
  const country = normalizeString(filters.country);
  const organization = normalizeString(filters.organization);
  const speakerFlag = normalizeString(filters.speakerFlag);
  const lateConfirmation = normalizeString(filters.lateConfirmation);

  if (status && status !== "all") {
    nextQuery = nextQuery.eq("status", status);
  }

  if (category && category !== "all") {
    nextQuery = nextQuery.eq("attendee_category", category);
  }

  if (priorityTier && priorityTier !== "all") {
    nextQuery = nextQuery.eq("priority_tier", priorityTier);
  }

  if (country) {
    nextQuery = nextQuery.ilike("country", `%${country}%`);
  }

  if (organization) {
    nextQuery = nextQuery.ilike("organization", `%${organization}%`);
  }

  if (speakerFlag === "yes") {
    nextQuery = nextQuery.eq("speaker_flag", true);
  }

  if (lateConfirmation === "yes") {
    nextQuery = nextQuery.eq("exception_badge_required", true);
  }

  if (search) {
    nextQuery = nextQuery.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,registration_code.ilike.%${search}%,organization.ilike.%${search}%`,
    );
  }

  return nextQuery;
}

function buildQueueBaseQuery(selectStatement, options = {}) {
  const supabase = getSupabase();
  let query = supabase
    .from("event_registrations")
    .select(selectStatement, options)
    .order("created_at", { ascending: false });

  return query;
}

export async function listRegistrationQueue({ filters = {}, page = 1, pageSize = 50 } = {}) {
  const normalizedPage = Math.max(Number(page || 1), 1);
  const normalizedPageSize = Math.min(Math.max(Number(pageSize || 50), 10), 100);
  const from = (normalizedPage - 1) * normalizedPageSize;
  const to = from + normalizedPageSize - 1;

  const queueFields = `
    id,
    registration_code,
    first_name,
    last_name,
    email,
    organization,
    designation,
    attendee_category,
    priority_tier,
    status,
    speaker_flag,
    vip_flag,
    exception_badge_required,
    badge_color_label,
    badge_color_hex,
    qr_pass_issued_at,
    checked_in_at,
    created_at,
    reviewed_at
  `;

  const dataQuery = applyRegistrationFilters(
    buildQueueBaseQuery(queueFields, { count: "exact" }),
    filters,
  ).range(from, to);

  const countQuery = applyRegistrationFilters(
    buildQueueBaseQuery("id", { count: "exact", head: true }),
    filters,
  );

  const makeCountQuery = (status) =>
    applyRegistrationFilters(
      buildQueueBaseQuery("id", { count: "exact", head: true }),
      { ...filters, status },
    );

  const qrIssuedQuery = applyRegistrationFilters(
    buildQueueBaseQuery("id", { count: "exact", head: true }),
    filters,
  ).not("qr_pass_issued_at", "is", null);

  const exceptionQuery = applyRegistrationFilters(
    buildQueueBaseQuery("id", { count: "exact", head: true }),
    filters,
  ).eq("exception_badge_required", true);

  const checkedInQuery = applyRegistrationFilters(
    buildQueueBaseQuery("id", { count: "exact", head: true }),
    filters,
  ).not("checked_in_at", "is", null);

  const [
    dataResult,
    countResult,
    pendingResult,
    confirmedResult,
    waitlistedResult,
    rejectedResult,
    qrIssuedResult,
    exceptionResult,
    checkedInResult,
  ] = await Promise.all([
    dataQuery,
    countQuery,
    makeCountQuery("pending"),
    makeCountQuery("confirmed"),
    makeCountQuery("waitlisted"),
    makeCountQuery("rejected"),
    qrIssuedQuery,
    exceptionQuery,
    checkedInQuery,
  ]);

  const errors = [
    dataResult.error,
    countResult.error,
    pendingResult.error,
    confirmedResult.error,
    waitlistedResult.error,
    rejectedResult.error,
    qrIssuedResult.error,
    exceptionResult.error,
    checkedInResult.error,
  ].filter(Boolean);

  if (errors.length) {
    throw new Error(errors[0].message);
  }

  return {
    registrations: dataResult.data || [],
    count: countResult.count || dataResult.count || 0,
    pagination: {
      page: normalizedPage,
      pageSize: normalizedPageSize,
      totalPages: Math.max(Math.ceil((countResult.count || dataResult.count || 0) / normalizedPageSize), 1),
    },
    summary: {
      total: countResult.count || dataResult.count || 0,
      pending: pendingResult.count || 0,
      confirmed: confirmedResult.count || 0,
      waitlisted: waitlistedResult.count || 0,
      rejected: rejectedResult.count || 0,
      qrIssued: qrIssuedResult.count || 0,
      checkedIn: checkedInResult.count || 0,
      exceptionBadges: exceptionResult.count || 0,
    },
  };
}

export async function getRegistrationDetail(registrationId) {
  const registration = await getRegistrationById(registrationId);
  const supabase = getSupabase();
  const [historyResult, notificationsResult] = await Promise.all([
    supabase
      .from("registration_status_history")
      .select("id, previous_status, next_status, action_type, notes, actor_email, created_at")
      .eq("registration_id", registrationId)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("registration_notifications")
      .select("id, template_type, delivery_status, failure_reason, recipient_email, created_at, updated_at")
      .eq("registration_id", registrationId)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  if (historyResult.error) {
    throw new Error(historyResult.error.message);
  }

  if (notificationsResult.error) {
    throw new Error(notificationsResult.error.message);
  }

  return {
    registration,
    history: historyResult.data || [],
    notifications: notificationsResult.data || [],
  };
}

export async function listRegistrationsForPassJob({ filters = {}, registrationIds = [] } = {}) {
  const supabase = getSupabase();
  const selectStatement = `
    id,
    registration_code,
    email,
    status,
    qr_pass_issued_at,
    created_at
  `;

  let query = buildQueueBaseQuery(selectStatement);

  if (registrationIds.length) {
    query = query.in("id", registrationIds);
  } else {
    query = applyRegistrationFilters(query, filters);
  }

  query = query.eq("status", "confirmed");

  const { data, error } = await query.limit(2000);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function createPassIssueEmailJobRecord({ selection, operator }) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("pass_issue_email_jobs")
    .insert({
      status: "queued",
      selection_mode: selection.selectionMode,
      filters: selection.filters,
      resend_existing: selection.resendExisting,
      created_by_clerk_id: operator.userId,
      created_by_email: operator.primaryEmail,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function insertPassIssueEmailJobItems({ jobId, registrations = [], maxAttempts = 3 }) {
  if (!registrations.length) {
    return [];
  }

  const supabase = getSupabase();
  const payload = registrations.map((registration) => ({
    job_id: jobId,
    registration_id: registration.id,
    status: "queued",
    max_attempts: maxAttempts,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from("pass_issue_email_job_items")
    .insert(payload)
    .select("id, registration_id, status, attempt_count, max_attempts");

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function refreshPassIssueEmailJob(jobId) {
  const supabase = getSupabase();
  const { data: items, error } = await supabase
    .from("pass_issue_email_job_items")
    .select("status")
    .eq("job_id", jobId);

  if (error) {
    throw new Error(error.message);
  }

  const counters = {
    total_items: items.length,
    queued_items: 0,
    processing_items: 0,
    sent_items: 0,
    skipped_items: 0,
    failed_items: 0,
    retrying_items: 0,
  };

  for (const item of items) {
    if (item.status === "queued") counters.queued_items += 1;
    if (item.status === "processing") counters.processing_items += 1;
    if (item.status === "sent") counters.sent_items += 1;
    if (item.status === "skipped") counters.skipped_items += 1;
    if (item.status === "failed") counters.failed_items += 1;
    if (item.status === "retrying") counters.retrying_items += 1;
  }

  let status = "queued";
  let completedAt = null;
  if (counters.processing_items > 0 || counters.retrying_items > 0) {
    status = "processing";
  } else if (counters.queued_items > 0) {
    status = "queued";
  } else if (counters.failed_items > 0) {
    status = "failed";
    completedAt = new Date().toISOString();
  } else {
    status = "completed";
    completedAt = new Date().toISOString();
  }

  const { data, error: updateError } = await supabase
    .from("pass_issue_email_jobs")
    .update({
      ...counters,
      status,
      completed_at: completedAt,
      last_processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .select("*")
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  return data;
}

export async function listPassIssueEmailJobs({ limit = 8 } = {}) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("pass_issue_email_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getPassIssueEmailJob(jobId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("pass_issue_email_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function listPassIssueEmailJobItems({ jobId, limit = 50 } = {}) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("pass_issue_email_job_items")
    .select(`
      id,
      job_id,
      registration_id,
      status,
      attempt_count,
      max_attempts,
      failure_reason,
      notification_id,
      pass_id,
      token,
      sent_at,
      last_attempt_at,
      created_at,
      updated_at,
      registration:event_registrations (
        registration_code,
        first_name,
        last_name,
        email,
        organization
      )
    `)
    .eq("job_id", jobId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function claimPassIssueEmailJobItems({ jobId, limit = 20 } = {}) {
  const supabase = getSupabase();
  const { data: items, error } = await supabase
    .from("pass_issue_email_job_items")
    .select("id, job_id, registration_id, status, attempt_count, max_attempts")
    .eq("job_id", jobId)
    .in("status", ["queued", "retrying"])
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  const claimed = [];

  for (const item of items || []) {
    const nextAttemptCount = Number(item.attempt_count || 0) + 1;
    const { data: updatedItem, error: updateError } = await supabase
      .from("pass_issue_email_job_items")
      .update({
        status: "processing",
        attempt_count: nextAttemptCount,
        last_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .eq("status", item.status)
      .select("id, job_id, registration_id, status, attempt_count, max_attempts")
      .maybeSingle();

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (updatedItem) {
      claimed.push(updatedItem);
    }
  }

  return claimed;
}

export async function updatePassIssueEmailJobItem(itemId, fields) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("pass_issue_email_job_items")
    .update({
      ...fields,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function retryFailedPassIssueEmailJobItems(jobId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("pass_issue_email_job_items")
    .update({
      status: "queued",
      failure_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("job_id", jobId)
    .eq("status", "failed")
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  await supabase
    .from("pass_issue_email_jobs")
    .update({
      status: "queued",
      completed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  return data || [];
}
