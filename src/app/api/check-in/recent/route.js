import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { listRecentEntryScans } from '@/lib/check-in-operations';
import checkInDayUtils from '@/lib/check-in-day-utils.cjs';

const { normalizeCheckInDay } = checkInDayUtils;

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.checkin.recent',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const eventDay = normalizeCheckInDay(
      searchParams.get('eventDay') || searchParams.get('event_day')
    );
    const scans = await listRecentEntryScans({ eventDay });
    return Response.json({
      success: true,
      scans,
      eventDay,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load recent scans.',
      },
      { status: 500 }
    );
  }
}
