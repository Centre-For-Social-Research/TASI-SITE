import { requireAuthorizedOperator } from '@/lib/registration-auth';
import {
  buildFestivalCheckInRecord,
  completeFestivalCheckIn,
  getFestivalTicketForCheckInById,
  getFestivalTicketByQrPayload,
} from '@/lib/festival-ticketing-db';
import {
  completeCheckIn,
  getCheckInRecordByToken,
  getCheckInRegistrationById,
  listRecentEntryScans,
  recordEntryScan,
} from '@/lib/check-in-operations';
import checkInDayUtils from '@/lib/check-in-day-utils.cjs';

const { normalizeCheckInDay } = checkInDayUtils;

export async function POST(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.checkin.scan',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const token = String(body?.token || '').trim();
    const registrationId = String(body?.registrationId || '').trim();
    const festivalTicketId = String(body?.festivalTicketId || '').trim();
    const deskLabel = String(body?.deskLabel || '').trim();
    const eventDay = normalizeCheckInDay(body?.eventDay || body?.event_day);
    let registration = null;
    let pass = null;

    if (token) {
      const festivalTicket = await getFestivalTicketByQrPayload(token);
      if (festivalTicket) {
        if (
          festivalTicket.status === 'pending' ||
          festivalTicket.status === 'cancelled'
        ) {
          return Response.json({
            success: false,
            result: 'not_confirmed',
            registration: buildFestivalCheckInRecord(festivalTicket),
            eventDay,
            recentScans: await listRecentEntryScans({ eventDay }),
          });
        }

        const checkedIn = await completeFestivalCheckIn({
          ticketId: festivalTicket.id,
          operator: authResult.operator,
          deskLabel,
          token,
          eventDay,
        });

        return Response.json({
          success: true,
          result: checkedIn.alreadyCheckedIn ? 'already_checked_in' : 'valid',
          registration: buildFestivalCheckInRecord(checkedIn.ticket),
          eventDay,
          recentScans: await listRecentEntryScans({ eventDay }),
        });
      } else {
        const result = await getCheckInRecordByToken(token);
        registration = result.registration;
        pass = result.pass;
      }
    } else if (festivalTicketId) {
      const festivalTicket =
        await getFestivalTicketForCheckInById(festivalTicketId);

      if (
        festivalTicket.status === 'pending' ||
        festivalTicket.status === 'cancelled'
      ) {
        return Response.json({
          success: false,
          result: 'not_confirmed',
          registration: buildFestivalCheckInRecord(festivalTicket),
          eventDay,
          recentScans: await listRecentEntryScans({ eventDay }),
        });
      }

      const checkedIn = await completeFestivalCheckIn({
        ticketId: festivalTicket.id,
        operator: authResult.operator,
        deskLabel,
        token: null,
        eventDay,
      });

      return Response.json({
        success: true,
        result: checkedIn.alreadyCheckedIn ? 'already_checked_in' : 'valid',
        registration: buildFestivalCheckInRecord(checkedIn.ticket),
        eventDay,
        recentScans: await listRecentEntryScans({ eventDay }),
      });
    } else if (registrationId) {
      registration = await getCheckInRegistrationById(registrationId);
    } else {
      return Response.json(
        { error: 'Token, registration ID, or ticket ID is required.' },
        { status: 400 }
      );
    }

    if (!registration) {
      return Response.json({ error: 'Attendee not found.' }, { status: 404 });
    }

    if (registration.status !== 'confirmed') {
      await recordEntryScan({
        registrationId: registration.id,
        passId: pass?.id || null,
        token: token || null,
        result:
          registration.status === 'waitlisted'
            ? 'waitlisted'
            : registration.status === 'rejected'
              ? 'rejected'
              : 'not_confirmed',
        operator: authResult.operator,
        deskLabel,
        notes: 'Check-in blocked due to registration status.',
        eventDay,
      });

      return Response.json({
        success: false,
        result:
          registration.status === 'waitlisted'
            ? 'waitlisted'
            : registration.status === 'rejected'
              ? 'rejected'
              : 'not_confirmed',
        registration,
        eventDay,
        recentScans: await listRecentEntryScans({ eventDay }),
      });
    }

    const checkedIn = await completeCheckIn({
      registrationId: registration.id,
      operator: authResult.operator,
      deskLabel,
      passId: pass?.id || null,
      token: token || null,
      eventDay,
    });

    return Response.json({
      success: true,
      result: checkedIn.alreadyCheckedIn ? 'already_checked_in' : 'valid',
      registration: checkedIn.registration,
      eventDay,
      recentScans: await listRecentEntryScans({ eventDay }),
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to complete check-in.',
      },
      { status: 500 }
    );
  }
}
