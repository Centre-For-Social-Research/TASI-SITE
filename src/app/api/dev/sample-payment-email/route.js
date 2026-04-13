import { sendFestivalTicketConfirmationEmail } from '@/lib/festival-ticketing-email';
import { FESTIVAL_PRICING } from '@/lib/festival-ticketing-constants';

export const runtime = 'nodejs';

// POST /api/dev/sample-payment-email
// Dev-only: Send a sample payment confirmation email to test the new ticket design
// Payload: { email: "recipient@example.com", type: "domestic|international" }
export async function POST(request) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not available.', { status: 404 });
  }

  const DEV_SECRET = process.env.DEV_TEST_SECRET || '';
  const authHeader = request.headers.get('x-dev-secret') || '';
  if (DEV_SECRET && authHeader !== DEV_SECRET) {
    return new Response('Unauthorized.', { status: 401 });
  }

  try {
    const { email = 'Saquib@csrindia.org', type = 'domestic' } =
      await request.json();

    const pricing = FESTIVAL_PRICING[type] || FESTIVAL_PRICING.domestic;

    // Mock ticket matching real structure
    const mockTicket = {
      id: 'sample-' + Date.now(),
      ticket_number: `TASI-2026-SAMPLE-${Date.now().toString().slice(-5)}`,
      invoice_number: `INV-${type.toUpperCase()}-2026-${Date.now().toString().slice(-6)}`,
      ticket_type: type,
      status: 'confirmed',
      currency: pricing.currency,
      base_amount_minor: pricing.baseAmountMinor,
      tax_amount_minor: pricing.taxAmountMinor,
      total_amount_minor: pricing.totalAmountMinor,
      qr_payload: `TASI-2026-${Date.now()}`,
      created_at: new Date().toISOString(),
      payment_stream: pricing.paymentStream,
    };

    // Mock user
    const mockUser = {
      id: 'sample-user-' + Date.now(),
      full_name: 'Saquib Reja',
      email: email,
      phone: '+91 98765 43210',
      organization: 'Centre for Social Research',
      country: type === 'international' ? 'IN' : 'IN',
      billing_name: 'Saquib Reja',
      billing_email: email,
      billing_phone: '+91 98765 43210',
      billing_address_line1: '2, Nelson Mandela Marg',
      billing_address_line2: 'Vasant Kunj',
      billing_city: 'New Delhi',
      billing_state_or_province: 'Delhi',
      billing_postal_code: '110070',
      billing_country: 'IN',
      state_or_province: 'Delhi',
    };

    await sendFestivalTicketConfirmationEmail({
      ticket: mockTicket,
      user: mockUser,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sample payment confirmation email sent to ${email}`,
        ticket_number: mockTicket.ticket_number,
        ticket_type: type,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Error sending sample email:', err);
    return new Response(
      JSON.stringify({
        error: err.message,
        stack: err.stack,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
