import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { listRecentEntryScans } from '@/lib/check-in-operations';

export async function GET() {
  const authResult = await requireAuthorizedOperator({
    route: 'api.checkin.recent',
  });
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const scans = await listRecentEntryScans();
    return Response.json({
      success: true,
      scans,
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
