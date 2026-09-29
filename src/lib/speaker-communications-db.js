import { randomBytes } from 'node:crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import speakerCommunicationsUtils from '@/lib/speaker-communications-utils.cjs';

const {
  normalizeEdition,
  normalizeSpeakerBadgeDelivery,
  normalizeSpeakerBadgeRow,
  normalizeSpeakerInput,
} = speakerCommunicationsUtils;

const SPEAKER_BADGE_SELECT = `
  id,
  edition,
  speaker_name,
  name_key,
  emails,
  designation,
  organization,
  badge_path,
  badge_content_type,
  badge_sha256,
  badge_updated_at,
  status,
  send_count,
  first_sent_at,
  last_sent_at,
  last_sent_badge_sha256,
  last_provider_message_id,
  last_error,
  last_sent_by_email,
  created_at,
  updated_at
`;

function getSupabase() {
  return getSupabaseAdmin();
}

function isDuplicate(error) {
  return error?.code === '23505' || /duplicate key/i.test(error?.message || '');
}

function newDownloadToken() {
  return randomBytes(32).toString('base64url');
}

export class SpeakerBadgeNotFoundError extends Error {
  constructor() {
    super('Speaker not found.');
    this.code = 'SPEAKER_BADGE_NOT_FOUND';
  }
}

export class SpeakerBadgeAlreadySendingError extends Error {
  constructor() {
    super(
      'This badge is already being sent. Confirm its delivery before trying again.'
    );
    this.code = 'SPEAKER_BADGE_ALREADY_SENDING';
  }
}

export class SpeakerBadgeDuplicateError extends Error {
  constructor() {
    super('A speaker with this name already exists for this edition.');
    this.code = 'SPEAKER_BADGE_DUPLICATE';
  }
}

// Every speaker in an edition. Editions hold well under a few hundred
// speakers, so the tab filters and counts in memory.
export async function listSpeakerBadges({ edition } = {}) {
  const selectedEdition = normalizeEdition(edition);
  const { data, error } = await getSupabase()
    .from('speaker_badges')
    .select(SPEAKER_BADGE_SELECT)
    .eq('edition', selectedEdition)
    .order('speaker_name', { ascending: true })
    .limit(1000);

  if (error) throw new Error(error.message);
  return (data || []).map(normalizeSpeakerBadgeRow);
}

async function getSpeakerBadgeRow(id) {
  const { data, error } = await getSupabase()
    .from('speaker_badges')
    .select(`${SPEAKER_BADGE_SELECT}, download_token`)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new SpeakerBadgeNotFoundError();
  return data;
}

export async function getSpeakerBadgeById(id) {
  return normalizeSpeakerBadgeRow(await getSpeakerBadgeRow(id));
}

// Server-only: includes the storage path and download token.
export async function getSpeakerBadgeForSend(id) {
  const row = await getSpeakerBadgeRow(id);
  return {
    speaker: normalizeSpeakerBadgeRow(row),
    badgePath: row.badge_path,
    badgeContentType: row.badge_content_type,
    downloadToken: row.download_token,
  };
}

export async function getSpeakerBadgeByDownloadToken(token) {
  const { data, error } = await getSupabase()
    .from('speaker_badges')
    .select('id,edition,speaker_name,badge_path,badge_content_type')
    .eq('download_token', token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function getSpeakerBadgeDetail(id) {
  const speaker = await getSpeakerBadgeById(id);
  const { data, error } = await getSupabase()
    .from('speaker_badge_deliveries')
    .select(
      'id,template_key,delivery_status,recipient_emails,provider_message_id,failure_reason,actor_email,created_at,request_sha256'
    )
    .eq('speaker_badge_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return {
    speaker,
    deliveries: (data || []).map(normalizeSpeakerBadgeDelivery),
    activeAttempt:
      speaker.status === 'sending'
        ? (data || []).find((row) => row.delivery_status === 'sending') || null
        : null,
  };
}

export async function findSpeakerBadgeByNameKey({ edition, nameKey }) {
  const { data, error } = await getSupabase()
    .from('speaker_badges')
    .select(SPEAKER_BADGE_SELECT)
    .eq('edition', normalizeEdition(edition))
    .eq('name_key', nameKey)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? normalizeSpeakerBadgeRow(data) : null;
}

export async function createSpeakerBadge({ edition, input, operator }) {
  const speaker = normalizeSpeakerInput(input);
  const now = new Date().toISOString();
  const { data, error } = await getSupabase()
    .from('speaker_badges')
    .insert({
      edition: normalizeEdition(edition),
      speaker_name: speaker.name,
      name_key: speaker.nameKey,
      emails: speaker.emails,
      designation: speaker.designation,
      organization: speaker.organization,
      download_token: newDownloadToken(),
      status: 'draft',
      created_by_email: operator?.primaryEmail || null,
      created_at: now,
      updated_at: now,
    })
    .select(SPEAKER_BADGE_SELECT)
    .single();

  if (error) {
    if (isDuplicate(error)) throw new SpeakerBadgeDuplicateError();
    throw new Error(error.message);
  }
  return normalizeSpeakerBadgeRow(data);
}

export async function updateSpeakerBadge({ id, input }) {
  const speaker = normalizeSpeakerInput(input);
  const { data, error } = await getSupabase()
    .from('speaker_badges')
    .update({
      speaker_name: speaker.name,
      name_key: speaker.nameKey,
      emails: speaker.emails,
      designation: speaker.designation,
      organization: speaker.organization,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .neq('status', 'sending')
    .select(SPEAKER_BADGE_SELECT)
    .maybeSingle();

  if (error) {
    if (isDuplicate(error)) throw new SpeakerBadgeDuplicateError();
    throw new Error(error.message);
  }
  if (!data) {
    await getSpeakerBadgeById(id);
    throw new Error(
      'This speaker cannot be edited while a send is unresolved.'
    );
  }
  return normalizeSpeakerBadgeRow(data);
}

export async function recordSpeakerBadgeFile({
  id,
  badgePath,
  contentType,
  sha256,
}) {
  const now = new Date().toISOString();
  const { data, error } = await getSupabase()
    .from('speaker_badges')
    .update({
      badge_path: badgePath,
      badge_content_type: contentType,
      badge_sha256: sha256,
      badge_updated_at: now,
      updated_at: now,
    })
    .eq('id', id)
    .neq('status', 'sending')
    .select(SPEAKER_BADGE_SELECT)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    await getSpeakerBadgeById(id);
    throw new Error(
      'This badge cannot be replaced while a send is unresolved.'
    );
  }
  return normalizeSpeakerBadgeRow(data);
}

// Only a speaker who has never been sent anything can be removed, so the
// send history always survives.
export async function deleteSpeakerBadge(id) {
  const { data, error } = await getSupabase()
    .from('speaker_badges')
    .delete()
    .eq('id', id)
    .eq('send_count', 0)
    .neq('status', 'sending')
    .select('id,badge_path')
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    await getSpeakerBadgeById(id);
    throw new Error(
      'A speaker who has already been sent a badge cannot be removed.'
    );
  }
  return data;
}

export async function claimSpeakerBadgeSend({ id, operator }) {
  const speaker = await getSpeakerBadgeById(id);
  if (speaker.status === 'sending') {
    throw new SpeakerBadgeAlreadySendingError();
  }

  const { data, error } = await getSupabase().rpc('claim_speaker_badge_send', {
    p_speaker_badge_id: id,
    p_expected_updated_at: speaker.updatedAt,
    p_actor_clerk_id: operator?.userId || null,
    p_actor_email: operator?.primaryEmail || null,
  });

  if (error) {
    if (error.code === 'P0001' || error.code === '23505') {
      throw new SpeakerBadgeAlreadySendingError();
    }
    throw new Error(error.message);
  }
  if (!data) throw new SpeakerBadgeAlreadySendingError();
  return { speaker, attempt: data };
}

export async function markSpeakerBadgeSent({ attemptId, providerMessageId }) {
  const { data, error } = await getSupabase().rpc('finish_speaker_badge_send', {
    p_attempt_id: attemptId,
    p_outcome: 'accepted',
    p_provider_message_id: providerMessageId,
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Accepted badge send could not be recorded.');
  return normalizeSpeakerBadgeRow(data);
}

export async function markSpeakerBadgeFailed({ attemptId, errorMessage }) {
  const { data, error } = await getSupabase().rpc('finish_speaker_badge_send', {
    p_attempt_id: attemptId,
    p_outcome: 'failed',
    p_failure_reason: String(errorMessage || 'Email was not sent.').slice(
      0,
      1000
    ),
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Unable to record the failed badge delivery.');
  return normalizeSpeakerBadgeRow(data);
}

export async function getActiveSpeakerBadgeAttempt(id) {
  const { data, error } = await getSupabase()
    .from('speaker_badge_deliveries')
    .select(
      'id,speaker_badge_id,speaker_name,recipient_emails,badge_sha256,delivery_status,request_sha256,created_at'
    )
    .eq('speaker_badge_id', id)
    .eq('delivery_status', 'sending')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function prepareSpeakerBadgeSendRequest(attemptId, requestSha256) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('speaker_badge_deliveries')
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
    .from('speaker_badge_deliveries')
    .select('request_sha256,delivery_status')
    .eq('id', attemptId)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  if (
    existing?.delivery_status !== 'sending' ||
    existing.request_sha256 !== requestSha256
  ) {
    throw new Error(
      'The badge email changed since this attempt began. Check Resend before retrying.'
    );
  }
}
