import { redirect } from 'next/navigation';
import RegistrationsAdminPanel from '@/components/admin/registrations-admin-panel';
import AdminShell from '@/components/admin/admin-shell';
import AdminAccessFallback from '@/components/admin/admin-access-fallback';
import { getAuthorizedOperator } from '@/lib/registration-auth';
import operatorSession from '@/lib/operator-session.cjs';

const { toOperatorSession, logOperatorEvent } = operatorSession;

export default async function AdminRegistrationsPage() {
  const operator = await getAuthorizedOperator({
    route: 'admin.registrations.page',
  });
  logOperatorEvent(
    'admin.registrations.entry',
    'admin.registrations.page',
    operator
  );

  if (!operator.authorized) {
    if (operator.reason === 'unauthenticated')
      redirect('/sign-in?redirect_url=/admin/registrations');
    if (operator.reason === 'unauthorized') redirect('/not-authorized');
    return (
      <AdminAccessFallback
        operator={operator}
        heading="Registration dashboard access is temporarily unavailable."
      />
    );
  }

  const sessionOperator = toOperatorSession(operator);

  return (
    <AdminShell operator={sessionOperator} currentPath="/admin/registrations">
      {logOperatorEvent(
        'admin.registrations.shell',
        'admin.registrations.page',
        operator
      )}
      <RegistrationsAdminPanel operator={sessionOperator} />
    </AdminShell>
  );
}
