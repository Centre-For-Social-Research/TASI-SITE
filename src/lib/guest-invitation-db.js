import { getSupabaseAdmin } from '@/lib/supabase-admin';
import guestInvitationUtils from '@/lib/guest-invitation-utils.cjs';

const {
  GUEST_INVITATION_STATUSES,
  normalizeGuestInvitationInput,
  normalizeGuestInvitationRow,
  normalizeGuestInvitationDelivery,
} = guestInvitationUtils;

const SENDABLE_STATUSES = ['draft', 'sent', 'failed'];
const INVITATION_SELECT = `
  id,
  guest_name,
  email,
  designation,
  organization,
  status,
  template_version,
  send_count,
  first_sent_at,
  last_sent_at,
  last_provider_message_id,
  last_error,
  created_by_clerk_id,
  created_by_email,
  last_sent_by_clerk_id,
  last_sent_by_email,
  created_at,
  updated_at
`;

function getSupabase() {
  return getSupabaseAdmin();
}

function safeSearch(value) {
  return String(value || '')
    .replace(/[%_,()'"\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function isDuplicate(error) {
  return error?.code === '23505' || /duplicate key/i.test(error?.message || '');
}

export class GuestInvitationNotFoundError extends Error {
  constructor() {
    super('Guest invitation not found.');
    this.code = 'GUEST_INVITATION_NOT_FOUND';
  }
}

export class GuestInvitationAlreadySendingError extends Error {
  constructor() {
    super(
      'This invitation is already being sent. Confirm its delivery before trying again.'
    );
    this.code = 'GUEST_INVITATION_ALREADY_SENDING';
  }
}

export class GuestInvitationDuplicateEmailError extends Error {
  constructor() {
    super('A guest invitation already exists for this email address.');
    this.code = 'GUEST_INVITATION_DUPLICATE_EMAIL';
  }
}

function normalizeStatus(value) {
  const status = String(value || '')
    .trim()
    .toLowerCase();
  return GUEST_INVITATION_STATUSES.has(status) ? status : 'all';
}

export async function listGuestInvitations({
  page = 1,
  pageSize = 50,
  search = '',
  status = 'all',
} = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 50));
  const from = (safePage - 1) * safePageSize;
  const selectedStatus = normalizeStatus(status);
  const term = safeSearch(search);
  const supabase = getSupabase();
  let query = supabase
    .from('guest_invitations')
    .select(INVITATION_SELECT, { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });

  if (selectedStatus !== 'all') {
    query = query.eq('status', selectedStatus);
  }

  if (term) {
    query = query.or(
      `guest_name.ilike.%${term}%,email.ilike.%${term}%,designation.ilike.%${term}%,organization.ilike.%${term}%`
    );
  }

  const { data, error, count } = await query.range(
    from,
    from + safePageSize - 1
  );
  if (error) throw new Error(error.message);

  return {
    invitations: (data || []).map(normalizeGuestInvitationRow),
    meta: {
      page: safePage,
      pageSize: safePageSize,
      total: count || 0,
      totalPages: Math.max(1, Math.ceil((count || 0) / safePageSize)),
    },
  };
}

export async function getGuestInvitationById(id) {
  const { data, error } = await getSupabase()
    .from('guest_invitations')
    .select(INVITATION_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new GuestInvitationNotFoundError();
  return normalizeGuestInvitationRow(data);
}

export async function getGuestInvitationDetail(id) {
  const invitation = await getGuestInvitationById(id);
  const { data, error } = await getSupabase()
    .from('guest_invitation_deliveries')
    .select(
      'id,delivery_status,recipient_email,provider_message_id,failure_reason,actor_email,created_at,request_sha256'
    )
    .eq('guest_invitation_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return {
    invitation,
    deliveries: (data || []).map(normalizeGuestInvitationDelivery),
    activeAttempt:
      invitation.status === 'sending'
        ? (data || []).find((row) => row.delivery_status === 'sending') || null
        : null,
  };
}

export async function createGuestInvitation({ input, operator }) {
  const invitation = normalizeGuestInvitationInput(input);
  const now = new Date().toISOString();
  const { data, error } = await getSupabase()
    .from('guest_invitations')
    .insert({
      guest_name: invitation.guestName,
      email: invitation.email,
      designation: invitation.designation,
      organization: invitation.organization,
      status: 'draft',
      template_version: 'guest_invitation_v1',
      created_by_clerk_id: operator?.userId || null,
      created_by_email: operator?.primaryEmail || null,
      created_at: now,
      updated_at: now,
    })
    .select(INVITATION_SELECT)
    .single();

  if (error) {
    if (isDuplicate(error)) throw new GuestInvitationDuplicateEmailError();
    throw new Error(error.message);
  }

  return normalizeGuestInvitationRow(data);
}

export async function updateGuestInvitation({ id, input }) {
  const invitation = normalizeGuestInvitationInput(input);
  const { data, error } = await getSupabase()
    .from('guest_invitations')
    .update({
      guest_name: invitation.guestName,
      email: invitation.email,
      designation: invitation.designation,
      organization: invitation.organization,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .neq('status', 'sending')
    .select(INVITATION_SELECT)
    .maybeSingle();

  if (error) {
    if (isDuplicate(error)) throw new GuestInvitationDuplicateEmailError();
    throw new Error(error.message);
  }
  if (!data) {
    await getGuestInvitationById(id);
    throw new Error(
      'This invitation cannot be edited while a send is unresolved.'
    );
  }
  return normalizeGuestInvitationRow(data);
}

export async function claimGuestInvitationSend({ id, operator }) {
  const invitation = await getGuestInvitationById(id);
  if (invitation.status === 'sending') {
    throw new GuestInvitationAlreadySendingError();
  }
  if (!SENDABLE_STATUSES.includes(invitation.status)) {
    throw new Error('This invitation cannot be sent in its current state.');
  }

  const { data, error } = await getSupabase().rpc(
    'claim_guest_invitation_send',
    {
      p_invitation_id: id,
      p_expected_updated_at: invitation.updatedAt,
      p_actor_clerk_id: operator?.userId || null,
      p_actor_email: operator?.primaryEmail || null,
    }
  );

  if (error) {
    if (error.code === 'P0001' || error.code === '23505') {
      throw new GuestInvitationAlreadySendingError();
    }
    throw new Error(error.message);
  }
  if (!data) throw new GuestInvitationAlreadySendingError();
  return { invitation, attempt: data };
}

export async function markGuestInvitationSent({
  attemptId,
  providerMessageId,
}) {
  const { data, error } = await getSupabase().rpc(
    'finish_guest_invitation_send',
    {
      p_attempt_id: attemptId,
      p_outcome: 'accepted',
      p_provider_message_id: providerMessageId,
    }
  );

  if (error) throw new Error(error.message);
  if (!data)
    throw new Error('Accepted guest invitation could not be recorded.');
  return normalizeGuestInvitationRow(data);
}

export async function markGuestInvitationFailed({ attemptId, errorMessage }) {
  const { data, error } = await getSupabase().rpc(
    'finish_guest_invitation_send',
    {
      p_attempt_id: attemptId,
      p_outcome: 'failed',
      p_failure_reason: String(errorMessage || 'Email was not sent.').slice(
        0,
        1000
      ),
    }
  );

  if (error) throw new Error(error.message);
  if (!data)
    throw new Error('Unable to record the failed invitation delivery.');
  return normalizeGuestInvitationRow(data);
}

export async function getActiveGuestSendAttempt(id) {
  const { data, error } = await getSupabase()
    .from('guest_invitation_deliveries')
    .select(
      'id,guest_invitation_id,guest_name,recipient_email,delivery_status,request_sha256,created_at'
    )
    .eq('guest_invitation_id', id)
    .eq('delivery_status', 'sending')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function prepareGuestSendRequest(attemptId, requestSha256) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('guest_invitation_deliveries')
    .update({
      request_sha256: requestSha256,
      updated_at: new Date().toISOString(),
    })
    .eq('id', attemptId)
    .eq('delivery_status', 'sending')
    .is('request_sha256', null)
    .select('request_sha256')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data) return;

  const { data: existing, error: lookupError } = await supabase
    .from('guest_invitation_deliveries')
    .select('request_sha256,delivery_status')
    .eq('id', attemptId)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  if (
    existing?.delivery_status !== 'sending' ||
    existing.request_sha256 !== requestSha256
  ) {
    throw new Error(
      'The invitation email changed since this attempt began. Check Resend before retrying.'
    );
  }
}
