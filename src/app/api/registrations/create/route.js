import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { imageSize } from 'image-size';
import { protectPublicRoute } from '@/lib/api-security';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isValidEmail } from '@/lib/input-sanitizers';
import { REGISTRATION_SOURCE } from '@/lib/registration-constants';
import { createNotification, createRegistration } from '@/lib/registration-db';
import { queueRegistrationEmailJob } from '@/lib/registration-email-job-service';
import {
  PROFILE_BUCKET,
  buildRegistrationCode,
  buildStoragePath,
  normalizeRegistrationPayload,
} from '@/lib/registration-utils';

const ACCEPTED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);
const MAX_FILE_SIZE_BYTES = 100 * 1024;
const MIN_IMAGE_SIZE = 200;

function getFileExtension(file) {
  const extension = path
    .extname(file.name || '')
    .replace('.', '')
    .toLowerCase();
  if (extension === 'jpeg') {
    return 'jpg';
  }

  return extension || (file.type === 'image/png' ? 'png' : 'jpg');
}

export async function POST(request) {
  const protection = await protectPublicRoute(request, 'registrations-create', {
    windowMs: 15 * 60 * 1000,
    maxRequests: 3,
  });

  if (!protection.ok) {
    return protection.response;
  }

  try {
    const formData = await request.formData();
    const profilePhoto = formData.get('profile_photo');
    const registration = normalizeRegistrationPayload({
      first_name: formData.get('first_name'),
      last_name: formData.get('last_name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      organization: formData.get('organization'),
      designation: formData.get('designation'),
      attendee_category: formData.get('attendee_category'),
      city: formData.get('city'),
      country: formData.get('country'),
      linkedin_url: formData.get('linkedin_url'),
      attendance_reason: formData.get('attendance_reason'),
      priority_tier: formData.get('priority_tier'),
    });

    if (!isValidEmail(registration.email)) {
      return Response.json(
        { error: 'Valid email is required.' },
        { status: 400, headers: protection.headers }
      );
    }

    if (!(profilePhoto instanceof File) || !profilePhoto.size) {
      return Response.json(
        { error: 'Profile photo is required.' },
        { status: 400, headers: protection.headers }
      );
    }

    if (!ACCEPTED_MIME_TYPES.has(profilePhoto.type)) {
      return Response.json(
        { error: 'Profile photo must be a JPG, JPEG, or PNG file.' },
        { status: 400, headers: protection.headers }
      );
    }

    if (profilePhoto.size > MAX_FILE_SIZE_BYTES) {
      return Response.json(
        { error: 'Profile photo must be 100KB or smaller.' },
        { status: 400, headers: protection.headers }
      );
    }

    const arrayBuffer = await profilePhoto.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const dimensions = imageSize(buffer);

    if (
      !dimensions.width ||
      !dimensions.height ||
      dimensions.width < MIN_IMAGE_SIZE ||
      dimensions.height < MIN_IMAGE_SIZE
    ) {
      return Response.json(
        { error: 'Profile photo must be at least 200 x 200 pixels.' },
        { status: 400, headers: protection.headers }
      );
    }

    const registrationId = randomUUID();
    const registrationCode = buildRegistrationCode();
    const extension = getFileExtension(profilePhoto);
    const storagePath = buildStoragePath({
      registrationId,
      extension,
    });
    const supabase = getSupabaseAdmin();

    const { error: uploadError } = await supabase.storage
      .from(PROFILE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: profilePhoto.type,
        upsert: false,
      });

    if (uploadError) {
      return Response.json(
        { error: uploadError.message },
        { status: 500, headers: protection.headers }
      );
    }

    const createdRegistration = await createRegistration({
      registration: {
        id: registrationId,
        registration_code: registrationCode,
        ...registration,
        source: REGISTRATION_SOURCE,
        profile_photo_path: storagePath,
        profile_photo_size_bytes: profilePhoto.size,
        profile_photo_width: dimensions.width,
        profile_photo_height: dimensions.height,
      },
      profilePhoto: {
        bucket: PROFILE_BUCKET,
        path: storagePath,
        originalFilename: profilePhoto.name,
        mimeType: profilePhoto.type,
        sizeBytes: profilePhoto.size,
        width: dimensions.width,
        height: dimensions.height,
      },
    });

    const notificationId = await createNotification({
      registrationId: createdRegistration.id,
      templateType: 'submission_received',
      recipientEmail: createdRegistration.email,
    });

    const emailResult = await queueRegistrationEmailJob({
      registrationId: createdRegistration.id,
      templateType: 'submission_received',
      notificationId,
    });

    return Response.json(
      {
        success: true,
        registrationId: createdRegistration.id,
        registrationCode: createdRegistration.registration_code,
        emailQueued: Boolean(emailResult.queued),
        emailError: emailResult.queued ? null : emailResult.error || null,
      },
      { headers: protection.headers }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to submit registration.';
    return Response.json(
      { error: message },
      { status: 500, headers: protection.headers }
    );
  }
}
