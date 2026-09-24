import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { rosterExportResponse } from '@/lib/admin-roster-export-response';
import { listAllSpotRegistrations } from '@/lib/spot-registration-db';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'designation', label: 'Designation' },
  { key: 'organization', label: 'Organisation' },
  { key: 'eventDay', label: 'Event Day' },
  { key: 'checkedInAt', label: 'Checked In At' },
  { key: 'deskLabel', label: 'Desk' },
  { key: 'emailStatus', label: 'Email Status' },
  { key: 'createdByEmail', label: 'Recorded By' },
];

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.spot-registrations.export',
  });
  if (!authResult.ok) return authResult.response;

  const params = new URL(request.url).searchParams;
  const format = params.get('format');
  if (!['csv', 'xlsx'].includes(format)) {
    return adminJson({ error: 'Choose CSV or Excel.' }, { status: 400 });
  }
  try {
    const rows = await listAllSpotRegistrations({
      search: params.get('search'),
      eventDay: params.get('eventDay'),
    });
    return await rosterExportResponse({
      format,
      columns: COLUMNS,
      rows,
      basename: 'tasi-2026-spot-registrations',
      sheetName: 'Spot Registrations',
    });
  } catch (error) {
    console.error('Unable to export spot registrations.', error);
    return adminJson(
      { error: 'Unable to export spot registrations.' },
      { status: 500 }
    );
  }
}
