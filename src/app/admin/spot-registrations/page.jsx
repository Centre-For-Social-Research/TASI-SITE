import { redirect } from 'next/navigation';
import AdminAccessFallback from '@/components/admin/admin-access-fallback';
import AdminShell from '@/components/admin/admin-shell';
import SpotRegistrationsPanel from '@/components/admin/spot-registrations-panel';
import { getAuthorizedOperator } from '@/lib/registration-auth';
import operatorSession from '@/lib/operator-session.cjs';

const { toOperatorSession, logOperatorEvent } = operatorSession;

export default async function SpotRegistrationsPage() {
  const operator = await getAuthorizedOperator({
    route: 'admin.spot-registrations',
  });
  logOperatorEvent(
    'admin.spot-registrations.entry',
    'admin.spot-registrations',
    operator
  );
  if (!operator.authorized) {
    if (operator.reason === 'unauthenticated') {
      redirect('/sign-in?redirect_url=/admin/spot-registrations');
    }
    if (operator.reason === 'unauthorized') redirect('/not-authorized');
    return <AdminAccessFallback operator={operator} />;
  }

  return (
    <AdminShell
      operator={toOperatorSession(operator)}
      currentPath="/admin/spot-registrations"
    >
      <SpotRegistrationsPanel canManage={operator.role === 'admin'} />
    </AdminShell>
  );
}
