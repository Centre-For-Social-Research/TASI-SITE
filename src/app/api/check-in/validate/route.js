import { requireAuthorizedOperator } from '@/lib/registration-auth';
import {
  buildFestivalCheckInRecord,
  getFestivalTicketByQrPayload,
  searchFestivalTickets,
} from '@/lib/festival-ticketing-db';
import {
  getCheckInRecordByToken,
  searchCheckInCandidatesLight,
} from '@/lib/check-in-operations';

function buildStatusPayload(registration, tokenValid = true) {
  if (!registration) {
    return { result: 'invalid' };
  }

  if (registration.status === 'waitlisted') {
    return { result: 'waitlisted', registration };
  }

  if (registration.status === 'rejected') {
    return { result: 'rejected', registration };
  }

  if (registration.status !== 'confirmed') {
    return { result: 'not_confirmed', registration };
  }

  if (registration.checked_in_at) {
    return { result: 'already_checked_in', registration };
  }

  return { result: tokenValid ? 'valid' : 'invalid', registration };
}

export async function POST(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.checkin.validate',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const token = String(body?.token || '').trim();
    const query = String(body?.query || '').trim();

    if (token) {
      const festivalTicket = await getFestivalTicketByQrPayload(token);
      if (festivalTicket) {
        return Response.json({
          success: true,
          ...buildStatusPayload(buildFestivalCheckInRecord(festivalTicket), true),
        });
      }

      const { registration } = await getCheckInRecordByToken(token);
      return Response.json({
        success: true,
        ...buildStatusPayload(registration, true),
      });
    }

    if (query) {
      const [registrations, festivalTickets] = await Promise.all([
        searchCheckInCandidatesLight(query),
        searchFestivalTickets(query),
      ]);
      return Response.json({
        success: true,
        result: 'lookup',
        registrations: [
          ...registrations,
          ...festivalTickets.map(buildFestivalCheckInRecord),
        ],
      });
    }

    return Response.json(
      { error: 'Token or query is required.' },
      { status: 400 }
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to validate attendee.',
      },
      { status: 500 }
    );
  }
}
