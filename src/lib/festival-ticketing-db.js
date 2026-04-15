import crypto from 'node:crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  deriveFestivalTicketPurchaseDetails,
  getFestivalTicketTypeForCountry,
} from '@/lib/festival-ticketing-core';
import { buildFestivalInvoiceMetadata } from '@/lib/festival-ticketing-documents';
import { buildFestivalQrPayload } from '@/lib/festival-ticketing-qr';
import {
  sanitizeEmail,
  sanitizePhone,
  sanitizeShortText,
} from '@/lib/input-sanitizers';
import { verifyFestivalQrPayload } from '@/lib/festival-ticketing-qr';

function nowIso() {
  return new Date().toISOString();
}

function getSupabase() {
  return getSupabaseAdmin();
}

function buildTicketNumber(ticketType) {
  const prefix = ticketType === 'domestic' ? 'TASI-DOM' : 'TASI-INT';
  return `${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function normalizeUserRow(row) {
  return row
    ? {
        id: row.id,
        full_name: row.full_name,
        email: row.email,
        organization: row.organization,
        job_title: row.job_title,
        country: row.country,
        phone: row.phone,
        billing_name: row.billing_name,
        billing_email: row.billing_email,
        billing_phone: row.billing_phone,
        billing_address_line1: row.billing_address_line1,
        billing_address_line2: row.billing_address_line2,
        billing_city: row.billing_city,
        billing_state_or_province: row.billing_state_or_province,
        billing_postal_code: row.billing_postal_code,
        billing_country: row.billing_country,
        tax_id_number: row.tax_id_number,
        gstin: row.gstin,
        passport_or_national_id: row.passport_or_national_id,
        linkedin_url: row.linkedin_url || null,
        profile_photo_path: row.profile_photo_path || null,
        profile_photo_size_bytes: row.profile_photo_size_bytes || null,
        profile_photo_width: row.profile_photo_width || null,
        profile_photo_height: row.profile_photo_height || null,
        no_refund_acknowledged_at: row.no_refund_acknowledged_at,
        terms_accepted_at: row.terms_accepted_at,
        privacy_accepted_at: row.privacy_accepted_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }
    : null;
}

function normalizeTicketRow(row) {
  return row
    ? {
        id: row.id,
        user_id: row.user_id,
        ticket_number: row.ticket_number,
        ticket_type: row.ticket_type,
        payment_stream: row.payment_stream,
        status: row.status,
        base_amount_minor: row.base_amount_minor,
        tax_amount_minor: row.tax_amount_minor,
        total_amount_minor: row.total_amount_minor,
        currency: row.currency,
        razorpay_order_id: row.razorpay_order_id,
        razorpay_payment_id: row.razorpay_payment_id,
        invoice_number: row.invoice_number,
        badge_number: row.badge_number,
        qr_payload: row.qr_payload,
        idempotency_key: row.idempotency_key,
        checked_in_at: row.checked_in_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }
    : null;
}

function mapTicketWithUser(row) {
  const user = Array.isArray(row.user) ? row.user[0] : row.user;
  return {
    ...normalizeTicketRow(row),
    user: normalizeUserRow(user),
  };
}

export async function upsertFestivalTicketUser(input) {
  const supabase = getSupabase();
  const email = sanitizeEmail(input.email);
  const phone = sanitizePhone(input.phone || '');
  const country = String(input.country || '')
    .trim()
    .toUpperCase();

  const payload = {
    full_name: sanitizeShortText(input.fullName, {
      fieldName: 'Full name',
      maxLength: 200,
    }),
    email,
    organization: sanitizeShortText(input.organization || '', {
      fieldName: 'Organization',
      maxLength: 300,
      required: false,
    }),
    job_title: sanitizeShortText(input.jobTitle || '', {
      fieldName: 'Job title',
      maxLength: 200,
      required: false,
    }),
    country,
    phone,
    billing_name: sanitizeShortText(input.billingName, {
      fieldName: 'Billing name',
      maxLength: 200,
    }),
    billing_email: sanitizeEmail(input.billingEmail),
    billing_phone: sanitizePhone(input.billingPhone || ''),
    billing_address_line1: sanitizeShortText(input.billingAddressLine1, {
      fieldName: 'Billing address line 1',
      maxLength: 200,
    }),
    billing_address_line2: sanitizeShortText(input.billingAddressLine2 || '', {
      fieldName: 'Billing address line 2',
      maxLength: 200,
      required: false,
    }),
    billing_city: sanitizeShortText(input.billingCity, {
      fieldName: 'Billing city',
      maxLength: 120,
    }),
    billing_state_or_province: sanitizeShortText(input.billingStateOrProvince, {
      fieldName: 'Billing state or province',
      maxLength: 120,
    }),
    billing_postal_code: sanitizeShortText(input.billingPostalCode, {
      fieldName: 'Billing postal code',
      maxLength: 30,
    }),
    billing_country: String(input.billingCountry || '')
      .trim()
      .toUpperCase(),
    tax_id_number: sanitizeShortText(input.taxIdNumber || '', {
      fieldName: 'Tax ID number',
      maxLength: 80,
      required: false,
    }),
    gstin: sanitizeShortText(input.gstin || '', {
      fieldName: 'GSTIN',
      maxLength: 20,
      required: false,
    }),
    passport_or_national_id: sanitizeShortText(
      input.passportOrNationalId || '',
      {
        fieldName: 'Passport or national ID',
        maxLength: 80,
        required: false,
      }
    ),
    linkedin_url:
      sanitizeShortText(input.linkedinUrl || '', {
        fieldName: 'LinkedIn URL',
        maxLength: 500,
        required: false,
      }) || null,
    profile_photo_path:
      sanitizeShortText(input.profilePhotoPath || '', {
        fieldName: 'Profile photo path',
        maxLength: 500,
        required: false,
      }) || null,
    no_refund_acknowledged_at: input.noRefundAccepted ? nowIso() : null,
    terms_accepted_at: input.termsAccepted ? nowIso() : null,
    privacy_accepted_at: input.privacyAccepted ? nowIso() : null,
    updated_at: nowIso(),
  };

  const { data, error } = await supabase
    .from('festival_ticket_users')
    .upsert(payload, { onConflict: 'email' })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return normalizeUserRow(data);
}

export async function createFestivalTicket({ user, idempotencyKey }) {
  const supabase = getSupabase();
  const purchase = deriveFestivalTicketPurchaseDetails({
    country: user.country,
  });

  const { data, error } = await supabase
    .from('festival_tickets')
    .insert({
      user_id: user.id,
      ticket_number: buildTicketNumber(purchase.ticketType),
      ticket_type: purchase.ticketType,
      payment_stream: purchase.paymentStream,
      status: 'pending',
      base_amount_minor: purchase.baseAmountMinor,
      tax_amount_minor: purchase.taxAmountMinor,
      total_amount_minor: purchase.totalAmountMinor,
      currency: purchase.currency,
      idempotency_key: idempotencyKey,
      updated_at: nowIso(),
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return normalizeTicketRow(data);
}

export async function getFestivalTicketById(ticketId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('festival_tickets')
    .select('*, user:festival_ticket_users(*)')
    .eq('id', ticketId)
    .single();

  if (error) throw new Error(error.message);
  return mapTicketWithUser(data);
}

export async function findFestivalTicketByIdempotencyKey(idempotencyKey) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('festival_tickets')
    .select('*, user:festival_ticket_users(*)')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapTicketWithUser(data) : null;
}

export async function findFestivalTicketByUserId(userId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('festival_tickets')
    .select('*, user:festival_ticket_users(*)')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapTicketWithUser(data) : null;
}

export async function findFestivalTicketByRazorpayOrderId(razorpayOrderId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('festival_tickets')
    .select('*, user:festival_ticket_users(*)')
    .eq('razorpay_order_id', razorpayOrderId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapTicketWithUser(data) : null;
}

export async function setFestivalTicketRazorpayOrderId(
  ticketId,
  razorpayOrderId
) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('festival_tickets')
    .update({
      razorpay_order_id: razorpayOrderId,
      updated_at: nowIso(),
    })
    .eq('id', ticketId);

  if (error) throw new Error(error.message);
}

export async function confirmFestivalTicketPayment({
  ticketId,
  razorpayOrderId,
  razorpayPaymentId,
}) {
  const current = await getFestivalTicketById(ticketId);
  if (current.status === 'confirmed' || current.status === 'checked_in') {
    return {
      ticket: current,
      alreadyConfirmed: true,
    };
  }

  const invoice = buildFestivalInvoiceMetadata({
    ticket: current,
    user: current.user,
  });
  const qrPayload = buildFestivalQrPayload(ticketId);
  const supabase = getSupabase();
  const { error } = await supabase
    .from('festival_tickets')
    .update({
      status: 'confirmed',
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      invoice_number: invoice.invoiceNumber,
      badge_number: current.ticket_number,
      qr_payload: qrPayload,
      updated_at: nowIso(),
    })
    .eq('id', ticketId);

  if (error) throw new Error(error.message);
  return {
    ticket: await getFestivalTicketById(ticketId),
    alreadyConfirmed: false,
  };
}

export async function recordFestivalPaymentAudit({
  ticketId = null,
  userId = null,
  eventType,
  paymentStream = null,
  payload = {},
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from('festival_payment_audit_log').insert({
    ticket_id: ticketId,
    user_id: userId,
    event_type: eventType,
    payment_stream: paymentStream,
    payload,
    created_at: nowIso(),
  });
  if (error) throw new Error(error.message);
}

export async function recordFestivalAdminAudit({
  ticketId = null,
  actionType,
  operator = null,
  payload = {},
}) {
  const supabase = getSupabase();
  const { error } = await supabase.from('festival_admin_audit_log').insert({
    ticket_id: ticketId,
    action_type: actionType,
    actor_clerk_id: operator?.userId || null,
    actor_email: operator?.primaryEmail || null,
    payload,
    created_at: nowIso(),
  });
  if (error) throw new Error(error.message);
}

export async function listFestivalAdminTickets({ search = '' } = {}) {
  const supabase = getSupabase();
  const trimmed = search.trim();

  let baseQuery = supabase
    .from('festival_tickets')
    .select('*, user:festival_ticket_users(*)')
    .order('created_at', { ascending: false });

  if (trimmed) {
    // Step 1: find user IDs matching the search term (name or email)
    const { data: matchedUsers } = await supabase
      .from('festival_ticket_users')
      .select('id')
      .or(`email.ilike.%${trimmed}%,full_name.ilike.%${trimmed}%`);

    const matchedUserIds = (matchedUsers || []).map((u) => u.id);

    // Step 2: OR across ticket fields + matched user IDs
    const ticketFieldOr = `ticket_number.ilike.%${trimmed}%,invoice_number.ilike.%${trimmed}%`;
    const orExpression =
      matchedUserIds.length > 0
        ? `${ticketFieldOr},user_id.in.(${matchedUserIds.join(',')})`
        : ticketFieldOr;

    baseQuery = baseQuery.or(orExpression);
  }

  const { data, error } = await baseQuery.limit(200);
  if (error) throw new Error(error.message);
  return (data || []).map(mapTicketWithUser);
}

export async function getFestivalTicketsForLookup({ email, phone }) {
  const supabase = getSupabase();
  const { data: user, error: userError } = await supabase
    .from('festival_ticket_users')
    .select('*')
    .eq('email', sanitizeEmail(email))
    .eq('phone', sanitizePhone(phone))
    .maybeSingle();

  if (userError) throw new Error(userError.message);
  if (!user) return [];

  const { data, error } = await supabase
    .from('festival_tickets')
    .select('*, user:festival_ticket_users(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(mapTicketWithUser);
}

export async function getFestivalTicketByQrPayload(payload) {
  const ticketId = verifyFestivalQrPayload(payload);
  if (!ticketId) {
    return null;
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('festival_tickets')
    .select('*, user:festival_ticket_users(*)')
    .eq('id', ticketId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapTicketWithUser(data) : null;
}

export async function searchFestivalTickets(query) {
  const sanitized = String(query || '').trim();
  if (!sanitized) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('festival_tickets')
    .select('*, user:festival_ticket_users(*)')
    .or(`ticket_number.ilike.%${sanitized}%,status.ilike.%${sanitized}%`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);

  return (data || []).map(mapTicketWithUser).filter((ticket) => {
    const haystack = [
      ticket.ticket_number,
      ticket.user?.full_name,
      ticket.user?.email,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(sanitized.toLowerCase());
  });
}

export function buildFestivalCheckInRecord(ticket) {
  const parts = String(ticket.user?.full_name || 'Festival Attendee')
    .trim()
    .split(/\s+/);
  return {
    id: ticket.id,
    registration_code: ticket.ticket_number,
    first_name: parts[0] || 'Festival',
    last_name: parts.slice(1).join(' '),
    email: ticket.user?.email || '',
    organization: ticket.user?.organization || 'Festival Attendee',
    attendee_category: ticket.ticket_type,
    status: ticket.status === 'pending' ? 'pending' : 'confirmed',
    checked_in_at: ticket.checked_in_at,
  };
}

export async function completeFestivalCheckIn({
  ticketId,
  operator,
  deskLabel,
  token,
}) {
  const current = await getFestivalTicketById(ticketId);
  const alreadyCheckedIn = Boolean(current.checked_in_at);

  if (!alreadyCheckedIn) {
    const supabase = getSupabase();
    const checkedInAt = nowIso();
    const { error } = await supabase
      .from('festival_tickets')
      .update({
        status: 'checked_in',
        checked_in_at: checkedInAt,
        updated_at: checkedInAt,
      })
      .eq('id', ticketId);

    if (error) throw new Error(error.message);
  }

  await recordFestivalAdminAudit({
    ticketId,
    actionType: alreadyCheckedIn
      ? 'festival_checkin_duplicate'
      : 'festival_checkin_valid',
    operator,
    payload: {
      deskLabel,
      token,
    },
  });

  return {
    ticket: await getFestivalTicketById(ticketId),
    alreadyCheckedIn,
  };
}
