import { protectPublicRoute } from "@/lib/api-security";
import { getTicketsForLookup } from "@/lib/ticketing-db";
import { ticketLookupSchema } from "@/lib/ticketing-validation";

export async function GET(request) {
  const protection = await protectPublicRoute(request, "ticket-lookup", {
    windowMs: 10 * 60 * 1000,
    maxRequests: 5,
  });

  if (!protection.ok) {
    return protection.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = ticketLookupSchema.parse({
      email: searchParams.get("email") || "",
      phone: searchParams.get("phone") || "",
    });

    const tickets = await getTicketsForLookup(parsed);
    return Response.json({ success: true, tickets }, { headers: protection.headers });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load tickets." },
      { status: 400, headers: protection.headers },
    );
  }
}
