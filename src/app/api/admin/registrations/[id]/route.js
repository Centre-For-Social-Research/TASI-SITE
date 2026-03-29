import { requireAuthorizedOperator } from "@/lib/registration-auth";
import { getRegistrationDetail, deleteRegistration } from "@/lib/registration-ops-db";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { PROFILE_BUCKET } from "@/lib/registration-utils";

export async function GET(_request, context) {
  const authResult = await requireAuthorizedOperator({ route: "api.admin.registrations.detail" });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const params = await context.params;
    const detail = await getRegistrationDetail(params.id);
    const photoPath = detail.registration?.profile_photo_path;
    if (photoPath) {
      const supabase = getSupabaseAdmin();
      const { data: signedData } = await supabase.storage.from(PROFILE_BUCKET).createSignedUrl(photoPath, 3600);
      if (signedData?.signedUrl) {
        detail.registration.profilePhotoUrl = signedData.signedUrl;
      }
    }
    return Response.json({
      success: true,
      ...detail,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load registration detail." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request, context) {
  const authResult = await requireAuthorizedOperator({ route: "api.admin.registrations.delete" });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const params = await context.params;
    await deleteRegistration(params.id);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to delete registration." },
      { status: 500 },
    );
  }
}
