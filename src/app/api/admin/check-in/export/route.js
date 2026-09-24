import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { rosterExportResponse } from '@/lib/admin-roster-export-response';
import { listAllDailyCheckIns } from '@/lib/attendance-export-db';
import { listAllSpotRegistrations } from '@/lib/spot-registration-db';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'organization', label: 'Organisation' },
  { key: 'eventDay', label: 'Event Day' },
  { key: 'checkedInAt', label: 'Checked In At' },
  { key: 'deskLabel', label: 'Desk' },
  { key: 'source', label: 'Source' },
  { key: 'registrationCode', label: 'Registration Code' },
];

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.check-in.export',
  });
  if (!authResult.ok) return authResult.response;

  const params = new URL(request.url).searchParams;
  const format = params.get('format');
  if (!['csv', 'xlsx'].includes(format)) {
    return adminJson({ error: 'Choose CSV or Excel.' }, { status: 400 });
  }
  const eventDay = params.get('eventDay');
  try {
    const [daily, spots] = await Promise.all([
      listAllDailyCheckIns(eventDay),
      listAllSpotRegistrations({ eventDay }),
    ]);
    const rows = [
      ...daily.map((item) => {
        const registration = Array.isArray(item.registration)
          ? item.registration[0]
          : item.registration;
        return {
          name: [registration?.first_name, registration?.last_name]
            .filter(Boolean)
            .join(' '),
          email: registration?.email || '',
          organization: registration?.organization || '',
          eventDay: item.event_day,
          checkedInAt: item.checked_in_at,
          deskLabel: item.desk_label || '',
          source: 'Advance registration',
          registrationCode: registration?.registration_code || '',
        };
      }),
      ...spots.map((item) => ({
        name: item.name,
        email: item.email,
        organization: item.organization,
        eventDay: item.eventDay,
        checkedInAt: item.checkedInAt,
        deskLabel: item.deskLabel,
        source: 'Spot registration',
        registrationCode: '',
      })),
    ].sort((a, b) => b.checkedInAt.localeCompare(a.checkedInAt));

    return await rosterExportResponse({
      format,
      columns: COLUMNS,
      rows,
      basename: 'tasi-2026-check-ins',
      sheetName: 'Check-ins',
    });
  } catch (error) {
    console.error('Unable to export check-ins.', error);
    return adminJson({ error: 'Unable to export check-ins.' }, { status: 500 });
  }
}
