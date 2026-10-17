import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { validateUploadedImageFile } from '@/lib/upload-validation';

export const SPEAKER_PHOTO_PICKS_BUCKET = 'speaker-photo-picks';
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

// Every featured photo is stored the same way: upright, at most 1200 px
// wide, JPEG, so the email stays light.
export async function prepareFeaturedPhoto(buffer) {
  const output = await sharp(buffer)
    .rotate()
    .resize({
      width: 1200,
      height: 1200,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return {
    buffer: output,
    sha256: createHash('sha256').update(output).digest('hex'),
  };
}

export async function validateFeaturedPhotoFile(file) {
  const image = await validateUploadedImageFile(file, {
    fieldName: 'Photo',
    maxBytes: MAX_UPLOAD_BYTES,
    minWidth: 400,
    minHeight: 260,
  });
  return prepareFeaturedPhoto(image.buffer);
}

export function buildFeaturedPhotoPath({ edition, id }) {
  return `${edition}/${id}.jpg`;
}

export async function uploadFeaturedPhoto({ path, buffer }) {
  const { error } = await getSupabaseAdmin()
    .storage.from(SPEAKER_PHOTO_PICKS_BUCKET)
    .upload(path, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
      cacheControl: '60',
    });
  if (error) throw new Error(error.message || 'Unable to store the photo.');
}

export async function downloadFeaturedPhoto(path) {
  const { data, error } = await getSupabaseAdmin()
    .storage.from(SPEAKER_PHOTO_PICKS_BUCKET)
    .download(path);
  if (error || !data) {
    throw new Error(error?.message || 'Unable to read the stored photo.');
  }
  return Buffer.from(await data.arrayBuffer());
}
