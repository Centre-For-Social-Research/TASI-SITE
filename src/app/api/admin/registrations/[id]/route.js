import {
  requireAdminOperator,
  requireAuthorizedOperator,
} from '@/lib/registration-auth';
import {
  getRegistrationDetail,
  getRegistrationAuditSnapshot,
  deleteRegistration,
} from '@/lib/registration-ops-db';
import { recordAdminAuditEvent } from '@/lib/admin-audit';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { PROFILE_BUCKET } from '@/lib/registration-utils';
import { adminJson } from '@/lib/admin-api-cache';

export async function GET(_request, context) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.registrations.detail',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const params = await context.params;
    const detail = await getRegistrationDetail(params.id);
    const photoPath = detail.registration?.profile_photo_path;
    if (photoPath) {
      const supabase = getSupabaseAdmin();
      const { data: signedData } = await supabase.storage
        .from(PROFILE_BUCKET)
        .createSignedUrl(photoPath, 3600);
      if (signedData?.signedUrl) {
        detail.registration.profilePhotoUrl = signedData.signedUrl;
      }
    }
    return adminJson({
      success: true,
      ...detail,
    });
  } catch (error) {
    return adminJson(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load registration detail.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, context) {
  const authResult = await requireAdminOperator({
    route: 'api.admin.registrations.delete',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const params = await context.params;
    const snapshot = await getRegistrationAuditSnapshot(params.id);
    if (!snapshot) {
      return adminJson({ error: 'Registration not found.' }, { status: 404 });
    }
    // Record first: if the audit write fails, the delete does not happen.
    await recordAdminAuditEvent(authResult.operator, {
      action: 'registration.deleted',
      targetType: 'registration',
      targetId: snapshot.id,
      details: snapshot,
    });
    await deleteRegistration(params.id);
    return adminJson({ success: true });
  } catch (error) {
    return adminJson(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to delete registration.',
      },
      { status: 500 }
    );
  }
}
