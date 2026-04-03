import { requireAuthorizedOperator } from "@/lib/registration-auth";
import { listFestivalAdminTickets } from "@/lib/festival-ticketing-db";

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({
    route: "api.admin.tickets.list",
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const tickets = await listFestivalAdminTickets({
      search: searchParams.get("search") || "",
    });
    return Response.json({ success: true, tickets });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load tickets.",
      },
      { status: 500 },
    );
  }
}
