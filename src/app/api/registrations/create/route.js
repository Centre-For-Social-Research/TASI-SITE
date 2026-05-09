import { randomUUID } from 'node:crypto';
import { protectPublicMultipartPostRoute } from '@/lib/api-security';
import {
  getCompletedIdempotentResponse,
  getIdempotencyKey,
  storeIdempotentResponse,
} from '@/lib/api-idempotency';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { isValidEmail } from '@/lib/input-sanitizers';
import { REGISTRATION_SOURCE } from '@/lib/registration-constants';
import { createNotification, createRegistration } from '@/lib/registration-db';
import { after } from 'next/server';
import {
  processNextAvailableRegistrationEmailJob,
  queueRegistrationEmailJob,
} from '@/lib/registration-email-job-service';
import {
  PROFILE_BUCKET,
  buildRegistrationCode,
  buildStoragePath,
  normalizeRegistrationPayload,
} from '@/lib/registration-utils';
import {
  UploadValidationError,
  validateUploadedImageFile,
} from '@/lib/upload-validation';

const MAX_FILE_SIZE_BYTES = 100 * 1024;
const MIN_IMAGE_SIZE = 200;

export async function POST(request) {
  const protection = await protectPublicMultipartPostRoute(
    request,
    'registrations-create',
    {
      windowMs: 15 * 60 * 1000,
      maxRequests: 3,
    }
  );

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

    const idempotencyKey = getIdempotencyKey(
      request,
      `registration:${registration.email}:${registration.first_name}:${registration.last_name}`
    );
    const cached = await getCompletedIdempotentResponse(
      'registration-create',
      idempotencyKey
    );
    if (cached) {
      return Response.json(cached, { headers: protection.headers });
    }

    if (!(profilePhoto instanceof File) || !profilePhoto.size) {
      return Response.json(
        { error: 'Profile photo is required.' },
        { status: 400, headers: protection.headers }
      );
    }

    const validatedPhoto = await validateUploadedImageFile(profilePhoto, {
      fieldName: 'Profile photo',
      maxBytes: MAX_FILE_SIZE_BYTES,
      minWidth: MIN_IMAGE_SIZE,
      minHeight: MIN_IMAGE_SIZE,
    });

    const registrationId = randomUUID();
    const registrationCode = buildRegistrationCode();
    const storagePath = buildStoragePath({
      registrationId,
      extension: validatedPhoto.extension,
    });
    const supabase = getSupabaseAdmin();

    const { error: uploadError } = await supabase.storage
      .from(PROFILE_BUCKET)
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

    const createdRegistration = await createRegistration({
      registration: {
        id: registrationId,
        registration_code: registrationCode,
        ...registration,
        source: REGISTRATION_SOURCE,
        profile_photo_path: storagePath,
        profile_photo_size_bytes: validatedPhoto.sizeBytes,
        profile_photo_width: validatedPhoto.dimensions.width,
        profile_photo_height: validatedPhoto.dimensions.height,
      },
      profilePhoto: {
        bucket: PROFILE_BUCKET,
        path: storagePath,
        originalFilename: profilePhoto.name,
        mimeType: validatedPhoto.contentType,
        sizeBytes: validatedPhoto.sizeBytes,
        width: validatedPhoto.dimensions.width,
        height: validatedPhoto.dimensions.height,
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

    after(async () => {
      try {
        await processNextAvailableRegistrationEmailJob({
          operator: {
            userId: 'system-after-trigger',
            primaryEmail: 'system-after-trigger@local',
          },
        });
      } catch (error) {
        console.error(
          'Failed to process registration email job in background:',
          error
        );
      }
    });

    const response = {
      success: true,
      registrationId: createdRegistration.id,
      registrationCode: createdRegistration.registration_code,
      emailQueued: Boolean(emailResult.queued),
      emailError: emailResult.queued ? null : emailResult.error || null,
    };
    await storeIdempotentResponse(
      'registration-create',
      idempotencyKey,
      response,
      registration.email
    );

    return Response.json(response, { headers: protection.headers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to submit registration.';
    const status = error instanceof UploadValidationError ? 400 : 500;
    return Response.json(
      { error: message },
      { status, headers: protection.headers }
    );
  }
}
