import { buildFestivalTicketPdf } from "@/lib/festival-ticketing-documents";
import { FESTIVAL_PRICING } from "@/lib/festival-ticketing-constants";

export const runtime = "nodejs";

// GET /api/dev/ticket-preview?type=domestic|international
// Only available in development - renders a sample ticket PDF inline.
export async function GET(request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not available.", { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") === "international" ? "international" : "domestic";

  const pricing = FESTIVAL_PRICING[type];

  const mockTicket = {
    id: "preview-000",
    ticket_number: "TASI-2026-PREVIEW",
    invoice_number: "INV-PREVIEW-2026",
    ticket_type: type,
    status: "confirmed",
    currency: pricing.currency,
    base_amount_minor: pricing.baseAmountMinor,
    tax_amount_minor: pricing.taxAmountMinor,
    total_amount_minor: pricing.totalAmountMinor,
    qr_payload: "TASI-2026-PREVIEW-QR",
    created_at: new Date().toISOString(),
  };

  const mockUser = {
    full_name: "Aisha Sharma",
    email: "aisha.sharma@example.com",
    organization: "Tech Policy Forum",
    country: type === "international" ? "US" : "IN",
  };

  try {
    const pdfBuffer = await buildFestivalTicketPdf({ ticket: mockTicket, user: mockUser });

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="ticket-preview-${type}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return new Response(`Error generating PDF: ${err.message}\n${err.stack}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
