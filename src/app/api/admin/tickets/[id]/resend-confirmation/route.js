import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { getFestivalTicketById } from '@/lib/festival-ticketing-db';
import { sendFestivalTicketConfirmationEmail } from '@/lib/festival-ticketing-email';

export async function POST(_request, { params }) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.tickets.resend-confirmation',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const ticket = await getFestivalTicketById(params.id);

    if (!ticket) {
      return Response.json({ error: 'Ticket not found.' }, { status: 404 });
    }

    if (ticket.status !== 'confirmed' && ticket.status !== 'checked_in') {
      return Response.json(
        {
          error: `Cannot resend confirmation for a ticket with status "${ticket.status}".`,
        },
        { status: 400 }
      );
    }

    const result = await sendFestivalTicketConfirmationEmail({
      ticket,
      user: ticket.user,
    });

    if (result.sent) {
      return Response.json({
        success: true,
        providerMessageId: result.providerMessageId,
      });
    }

    return Response.json(
      { error: result.error || 'Failed to send confirmation email.' },
      { status: 500 }
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unexpected error.' },
      { status: 500 }
    );
  }
}
