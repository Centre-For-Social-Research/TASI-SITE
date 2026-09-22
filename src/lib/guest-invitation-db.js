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
      'id,delivery_status,recipient_email,provider_message_id,failure_reason,actor_email,created_at'
    )
    .eq('guest_invitation_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return {
    invitation,
    deliveries: (data || []).map(normalizeGuestInvitationDelivery),
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
    .select(INVITATION_SELECT)
    .maybeSingle();

  if (error) {
    if (isDuplicate(error)) throw new GuestInvitationDuplicateEmailError();
    throw new Error(error.message);
  }
  if (!data) throw new GuestInvitationNotFoundError();
  return normalizeGuestInvitationRow(data);
}

export async function claimGuestInvitationSend({ id }) {
  const invitation = await getGuestInvitationById(id);
  if (invitation.status === 'sending') {
    throw new GuestInvitationAlreadySendingError();
  }
  if (!SENDABLE_STATUSES.includes(invitation.status)) {
    throw new Error('This invitation cannot be sent in its current state.');
  }

  const { data, error } = await getSupabase()
    .from('guest_invitations')
    .update({
      status: 'sending',
      last_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .in('status', SENDABLE_STATUSES)
    .select(INVITATION_SELECT)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new GuestInvitationAlreadySendingError();
  return normalizeGuestInvitationRow(data);
}

export async function markGuestInvitationSent({
  invitation,
  operator,
  providerMessageId,
}) {
  const supabase = getSupabase();
  const sentAt = new Date().toISOString();
  const { error: historyError } = await supabase
    .from('guest_invitation_deliveries')
    .insert({
      guest_invitation_id: invitation.id,
      delivery_status: 'accepted',
      recipient_email: invitation.email,
      provider_message_id: providerMessageId || null,
      actor_clerk_id: operator?.userId || null,
      actor_email: operator?.primaryEmail || null,
      created_at: sentAt,
    });

  if (historyError) throw new Error(historyError.message);

  const { data, error } = await supabase
    .from('guest_invitations')
    .update({
      status: 'sent',
      send_count: invitation.sendCount + 1,
      first_sent_at: invitation.firstSentAt || sentAt,
      last_sent_at: sentAt,
      last_provider_message_id: providerMessageId || null,
      last_error: null,
      last_sent_by_clerk_id: operator?.userId || null,
      last_sent_by_email: operator?.primaryEmail || null,
      updated_at: sentAt,
    })
    .eq('id', invitation.id)
    .eq('status', 'sending')
    .select(INVITATION_SELECT)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    throw new Error(
      'The email was accepted, but the invitation record needs reconciliation before it can be resent.'
    );
  }

  return normalizeGuestInvitationRow(data);
}

export async function markGuestInvitationFailed({
  invitation,
  operator,
  errorMessage,
}) {
  const supabase = getSupabase();
  const failedAt = new Date().toISOString();
  const reason = String(
    errorMessage || 'Email delivery could not start.'
  ).slice(0, 1000);
  const { data, error } = await supabase
    .from('guest_invitations')
    .update({
      status: 'failed',
      last_error: reason,
      updated_at: failedAt,
    })
    .eq('id', invitation.id)
    .eq('status', 'sending')
    .select(INVITATION_SELECT)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    throw new Error('Unable to record the failed invitation delivery.');
  }

  const { error: historyError } = await supabase
    .from('guest_invitation_deliveries')
    .insert({
      guest_invitation_id: invitation.id,
      delivery_status: 'failed',
      recipient_email: invitation.email,
      failure_reason: reason,
      actor_clerk_id: operator?.userId || null,
      actor_email: operator?.primaryEmail || null,
      created_at: failedAt,
    });

  if (historyError) {
    console.error(
      'Unable to append guest invitation failure history.',
      historyError
    );
  }

  return normalizeGuestInvitationRow(data);
}
