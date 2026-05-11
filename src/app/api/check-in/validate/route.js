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
import checkInDayUtils from '@/lib/check-in-day-utils.cjs';

const { isCheckedInForDay, normalizeCheckInDay } = checkInDayUtils;

function buildStatusPayload(registration, tokenValid = true, eventDay) {
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

  if (isCheckedInForDay(registration, eventDay)) {
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
    const eventDay = normalizeCheckInDay(body?.eventDay || body?.event_day);

    if (token) {
      const festivalTicket = await getFestivalTicketByQrPayload(token);
      if (festivalTicket) {
        return Response.json({
          success: true,
          ...buildStatusPayload(
            buildFestivalCheckInRecord(festivalTicket),
            true,
            eventDay
          ),
          eventDay,
        });
      }

      const { registration } = await getCheckInRecordByToken(token);
      return Response.json({
        success: true,
        ...buildStatusPayload(registration, true, eventDay),
        eventDay,
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
        eventDay,
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
