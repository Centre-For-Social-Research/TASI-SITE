import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { updateTicketEvent } from '@/lib/ticketing-db';
import { patchTicketEventSchema } from '@/lib/ticketing-validation';

export async function PATCH(request, { params }) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.ticket-events.update',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const parsed = patchTicketEventSchema.parse(body);
    await updateTicketEvent({
      eventId: params.id,
      updates: parsed,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to update ticket event.',
      },
      { status: 400 }
    );
  }
}
