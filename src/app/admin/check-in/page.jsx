import { redirect } from 'next/navigation';
import CheckInPanel from '@/components/admin/check-in-panel';
import AdminShell from '@/components/admin/admin-shell';
import AdminAccessFallback from '@/components/admin/admin-access-fallback';
import { getAuthorizedOperator } from '@/lib/registration-auth';
import operatorSession from '@/lib/operator-session.cjs';

const { toOperatorSession, logOperatorEvent } = operatorSession;

export default async function AdminCheckInPage() {
  const operator = await getAuthorizedOperator({ route: 'admin.checkin.page' });
  logOperatorEvent('admin.checkin.entry', 'admin.checkin.page', operator);

  if (!operator.authorized) {
    if (operator.reason === 'unauthenticated')
      redirect('/sign-in?redirect_url=/admin/check-in');
    if (operator.reason === 'unauthorized') redirect('/not-authorized');
    return (
      <AdminAccessFallback
        operator={operator}
        heading="Check-in access is temporarily unavailable."
      />
    );
  }

  const sessionOperator = toOperatorSession(operator);

  return (
    <AdminShell operator={sessionOperator} currentPath="/admin/check-in">
      {logOperatorEvent('admin.checkin.shell', 'admin.checkin.page', operator)}
      <CheckInPanel operator={sessionOperator} />
    </AdminShell>
  );
}
