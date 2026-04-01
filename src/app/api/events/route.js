import { protectPublicRoute } from "@/lib/api-security";
import { requireAuthorizedOperator } from "@/lib/registration-auth";
import { DEMO_RECEPTION_EVENT } from "@/lib/ticketing-constants";
import { createTicketEvent, listPublicTicketEvents } from "@/lib/ticketing-db";
import { createTicketEventSchema } from "@/lib/ticketing-validation";

export async function GET(request) {
  const protection = await protectPublicRoute(request, "ticket-events-list", {
    windowMs: 10 * 60 * 1000,
    maxRequests: 30,
  });

  if (!protection.ok) {
    return protection.response;
  }

  try {
    const events = await listPublicTicketEvents();
    return Response.json({ success: true, events }, { headers: protection.headers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load ticket events.";

    if (
      message.includes("Missing SUPABASE_URL") ||
      message.includes("Missing SUPABASE_SERVICE_ROLE_KEY")
    ) {
      return Response.json(
        {
          success: true,
          events: [DEMO_RECEPTION_EVENT],
          demoMode: true,
        },
        { headers: protection.headers },
      );
    }

    return Response.json(
      { error: message },
      { status: 500, headers: protection.headers },
    );
  }
}

export async function POST(request) {
  const authResult = await requireAuthorizedOperator({ route: "api.events.create" });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const parsed = createTicketEventSchema.parse(body);
    const result = await createTicketEvent({
      event: parsed,
      ticketTypes: parsed.ticketTypes,
      operator: authResult.operator,
    });

    return Response.json({ success: true, ...result });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to create ticket event." },
      { status: 400 },
    );
  }
}
