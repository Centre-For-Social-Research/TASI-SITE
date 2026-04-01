import { requireAuthorizedOperator } from "@/lib/registration-auth";
import { listAdminTicketOrders } from "@/lib/ticketing-db";

export async function GET() {
  const authResult = await requireAuthorizedOperator({
    route: "api.admin.ticket-orders.list",
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const orders = await listAdminTicketOrders();
    return Response.json({ success: true, orders });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load ticket orders.",
      },
      { status: 500 },
    );
  }
}
