import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const SPEAKER_BADGE_BUCKET = 'speaker-badges';

export function buildSpeakerBadgePath({ edition, id, extension }) {
  return `${edition}/${id}.${extension}`;
}

export async function uploadSpeakerBadgeImage({ path, buffer, contentType }) {
  const { error } = await getSupabaseAdmin()
    .storage.from(SPEAKER_BADGE_BUCKET)
    .upload(path, buffer, { contentType, upsert: true, cacheControl: '60' });
  if (error) throw new Error(error.message || 'Unable to store the badge.');
}

export async function downloadSpeakerBadgeImage(path) {
  const { data, error } = await getSupabaseAdmin()
    .storage.from(SPEAKER_BADGE_BUCKET)
    .download(path);
  if (error || !data) {
    throw new Error(error?.message || 'Unable to read the stored badge.');
  }
  return Buffer.from(await data.arrayBuffer());
}

export async function removeSpeakerBadgeImages(paths) {
  const list = paths.filter(Boolean);
  if (!list.length) return;
  const { error } = await getSupabaseAdmin()
    .storage.from(SPEAKER_BADGE_BUCKET)
    .remove(list);
  if (error) throw new Error(error.message || 'Unable to remove the badge.');
}
