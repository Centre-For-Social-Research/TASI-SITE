import { randomUUID } from 'node:crypto';
import { protectPublicMultipartPostRoute } from '@/lib/api-security';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { validateUploadedImageFile } from '@/lib/upload-validation';

const TICKET_PHOTO_BUCKET = 'festival-ticket-photos';
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const MIN_IMAGE_SIZE = 150; // px

export async function POST(request) {
  const protection = await protectPublicMultipartPostRoute(
    request,
    'festival-ticket-upload-photo',
    { windowMs: 15 * 60 * 1000, maxRequests: 10 }
  );

  if (!protection.ok) {
    return protection.response;
  }

  try {
    const formData = await request.formData();
    const photo = formData.get('photo');

    if (!(photo instanceof File) || !photo.size) {
      return Response.json(
        { error: 'A photo file is required.' },
        { status: 400, headers: protection.headers }
      );
    }

    const validatedPhoto = await validateUploadedImageFile(photo, {
      fieldName: 'Photo',
      maxBytes: MAX_FILE_SIZE_BYTES,
      minWidth: MIN_IMAGE_SIZE,
      minHeight: MIN_IMAGE_SIZE,
    });

    const storagePath = `tickets/${randomUUID()}.${validatedPhoto.extension}`;
    const supabase = getSupabaseAdmin();

    const { error: uploadError } = await supabase.storage
      .from(TICKET_PHOTO_BUCKET)
      .upload(storagePath, validatedPhoto.buffer, {
        contentType: validatedPhoto.contentType,
        upsert: false,
      });

    if (uploadError) {
      return Response.json(
        { error: uploadError.message },
        { status: 500, headers: protection.headers }
      );
    }

    return Response.json(
      {
        path: storagePath,
        width: validatedPhoto.dimensions.width,
        height: validatedPhoto.dimensions.height,
        sizeBytes: validatedPhoto.sizeBytes,
      },
      { headers: protection.headers }
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Unable to upload photo.',
      },
      { status: 400, headers: protection.headers }
    );
  }
}
