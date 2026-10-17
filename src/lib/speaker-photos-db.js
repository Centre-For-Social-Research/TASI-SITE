import { getSupabaseAdmin } from '@/lib/supabase-admin';
import speakerCommunicationsUtils from '@/lib/speaker-communications-utils.cjs';
import speakerPhotosUtils from '@/lib/speaker-photos-utils.cjs';

const { normalizeEdition } = speakerCommunicationsUtils;
const {
  normalizeSpeakerPhotoDelivery,
  normalizeSpeakerPhotoInput,
  normalizeSpeakerPhotoRow,
} = speakerPhotosUtils;

const SPEAKER_PHOTO_SELECT = `
  id,
  edition,
  speaker_name,
  name_key,
  emails,
  drive_url,
  photo_count,
  status,
  send_count,
  first_sent_at,
  last_sent_at,
  last_sent_drive_url,
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

export class SpeakerPhotosAlreadySendingError extends Error {
  constructor() {
    super(
      'These photos are already being sent. Confirm the delivery before trying again.'
    );
    this.code = 'SPEAKER_PHOTOS_ALREADY_SENDING';
  }
}

export async function listSpeakerPhotos({ edition } = {}) {
  const { data, error } = await getSupabase()
    .from('speaker_photo_links')
    .select(SPEAKER_PHOTO_SELECT)
    .eq('edition', normalizeEdition(edition))
    .order('speaker_name', { ascending: true })
    .limit(1000);

  if (error) throw new Error(error.message);
  return (data || []).map(normalizeSpeakerPhotoRow);
}

export async function getSpeakerPhotoById(id) {
  const { data, error } = await getSupabase()
    .from('speaker_photo_links')
    .select(SPEAKER_PHOTO_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Speaker not found.');
  return normalizeSpeakerPhotoRow(data);
}

export async function getSpeakerPhotoDetail(id) {
  const speaker = await getSpeakerPhotoById(id);
  const { data, error } = await getSupabase()
    .from('speaker_photo_deliveries')
    .select(
      'id,template_key,delivery_status,recipient_emails,drive_url,provider_message_id,failure_reason,actor_email,created_at,request_sha256'
    )
    .eq('speaker_photo_link_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return {
    speaker,
    deliveries: (data || []).map(normalizeSpeakerPhotoDelivery),
    activeAttempt:
      speaker.status === 'sending'
        ? (data || []).find((row) => row.delivery_status === 'sending') || null
        : null,
  };
}

export async function updateSpeakerPhoto({ id, input }) {
  const speaker = normalizeSpeakerPhotoInput(input);
  const { data, error } = await getSupabase()
    .from('speaker_photo_links')
    .update({
      speaker_name: speaker.name,
      name_key: speaker.nameKey,
      emails: speaker.emails,
      drive_url: speaker.driveUrl,
      photo_count: speaker.photoCount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .neq('status', 'sending')
    .select(SPEAKER_PHOTO_SELECT)
    .maybeSingle();

  if (error) {
    if (isDuplicate(error)) {
      throw new Error(
        'A speaker with this name already exists for this edition.'
      );
    }
    throw new Error(error.message);
  }
  if (!data) {
    await getSpeakerPhotoById(id);
    throw new Error(
      'This speaker cannot be edited while a send is unresolved.'
    );
  }
  return normalizeSpeakerPhotoRow(data);
}

export async function claimSpeakerPhotoSend({ id, operator }) {
  const speaker = await getSpeakerPhotoById(id);
  if (speaker.status === 'sending')
    throw new SpeakerPhotosAlreadySendingError();

  const { data, error } = await getSupabase().rpc('claim_speaker_photo_send', {
    p_speaker_photo_link_id: id,
    p_expected_updated_at: speaker.updatedAt,
    p_actor_clerk_id: operator?.userId || null,
    p_actor_email: operator?.primaryEmail || null,
  });

  if (error) {
    if (error.code === 'P0001' || error.code === '23505') {
      throw new SpeakerPhotosAlreadySendingError();
    }
    throw new Error(error.message);
  }
  if (!data) throw new SpeakerPhotosAlreadySendingError();
  return { speaker, attempt: data };
}

async function finishSend(params) {
  const { data, error } = await getSupabase().rpc(
    'finish_speaker_photo_send',
    params
  );
  if (error) throw new Error(error.message);
  if (!data) throw new Error('The photo send could not be recorded.');
  return normalizeSpeakerPhotoRow(data);
}

export function markSpeakerPhotoSent({ attemptId, providerMessageId }) {
  return finishSend({
    p_attempt_id: attemptId,
    p_outcome: 'accepted',
    p_provider_message_id: providerMessageId,
  });
}

export function markSpeakerPhotoFailed({ attemptId, errorMessage }) {
  return finishSend({
    p_attempt_id: attemptId,
    p_outcome: 'failed',
    p_failure_reason: String(errorMessage || 'Email was not sent.').slice(
      0,
      1000
    ),
  });
}

export async function getActiveSpeakerPhotoAttempt(id) {
  const { data, error } = await getSupabase()
    .from('speaker_photo_deliveries')
    .select(
      'id,speaker_photo_link_id,speaker_name,recipient_emails,drive_url,delivery_status,request_sha256,created_at'
    )
    .eq('speaker_photo_link_id', id)
    .eq('delivery_status', 'sending')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function prepareSpeakerPhotoSendRequest(attemptId, requestSha256) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('speaker_photo_deliveries')
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
    .from('speaker_photo_deliveries')
    .select('request_sha256,delivery_status')
    .eq('id', attemptId)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);
  if (
    existing?.delivery_status !== 'sending' ||
    existing.request_sha256 !== requestSha256
  ) {
    throw new Error(
      'The photo email changed since this attempt began. Check Resend before retrying.'
    );
  }
}
