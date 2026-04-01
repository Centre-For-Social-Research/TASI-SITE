import { requireAuthorizedOperator } from "@/lib/registration-auth";
import { listAdminTickets } from "@/lib/ticketing-db";

export async function GET() {
  const authResult = await requireAuthorizedOperator({
    route: "api.admin.tickets.list",
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const tickets = await listAdminTickets();
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
