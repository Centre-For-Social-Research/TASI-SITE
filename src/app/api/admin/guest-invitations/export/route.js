import { requireAuthorizedOperator } from '@/lib/registration-auth';
import { adminJson } from '@/lib/admin-api-cache';
import { rosterExportResponse } from '@/lib/admin-roster-export-response';
import { listAllGuestInvitations } from '@/lib/guest-invitation-db';

const COLUMNS = [
  { key: 'name', label: 'Guest Name' },
  { key: 'email', label: 'Email' },
  { key: 'designation', label: 'Designation' },
  { key: 'organization', label: 'Organisation' },
  { key: 'status', label: 'Invitation Status' },
  { key: 'sendCount', label: 'Accepted Sends' },
  { key: 'lastSentAt', label: 'Last Sent At' },
  { key: 'createdAt', label: 'Created At' },
];

export async function GET(request) {
  const authResult = await requireAuthorizedOperator({
    route: 'api.admin.guest-invitations.export',
  });
  if (!authResult.ok) return authResult.response;

  const params = new URL(request.url).searchParams;
  const format = params.get('format');
  if (!['csv', 'xlsx'].includes(format)) {
    return adminJson({ error: 'Choose CSV or Excel.' }, { status: 400 });
  }
  try {
    const rows = await listAllGuestInvitations({
      search: params.get('search'),
      status: params.get('status'),
    });
    return await rosterExportResponse({
      format,
      columns: COLUMNS,
      rows,
      basename: 'tasi-2026-guest-invitations',
      sheetName: 'Guest Invitations',
    });
  } catch (error) {
    console.error('Unable to export guest invitations.', error);
    return adminJson(
      { error: 'Unable to export guest invitations.' },
      { status: 500 }
    );
  }
}
