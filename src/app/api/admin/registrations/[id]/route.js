import { requireAuthorizedOperator } from "@/lib/registration-auth";
import { getRegistrationDetail } from "@/lib/registration-ops-db";

export async function GET(_request, { params }) {
  const authResult = await requireAuthorizedOperator({ route: "api.admin.registrations.detail" });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const detail = await getRegistrationDetail(params.id);
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
