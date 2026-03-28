import { requireAuthorizedOperator } from "@/lib/registration-auth";
import { listRegistrations } from "@/lib/registration-db";
import operatorSession from "@/lib/operator-session.cjs";

const { logOperatorEvent } = operatorSession;

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({ route: "api.admin.registrations" });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    logOperatorEvent("admin.registrations.fetch", "api.admin.registrations", authResult.operator);
    const { searchParams } = new URL(request.url);
    const data = await listRegistrations({
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || "all",
      category: searchParams.get("category") || "all",
      priorityTier: searchParams.get("priorityTier") || "all",
      country: searchParams.get("country") || "",
      organization: searchParams.get("organization") || "",
      speakerFlag: searchParams.get("speakerFlag") || "",
      lateConfirmation: searchParams.get("lateConfirmation") || "",
    });

    return Response.json({
      success: true,
      ...data,
      operator: {
        email: authResult.operator.primaryEmail,
        role: authResult.operator.role,
      },
    });
  } catch (error) {
    console.error("[admin.registrations.fetch.error]", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to fetch registrations." },
      { status: 500 }
    );
  }
}
