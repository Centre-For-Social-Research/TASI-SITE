import { redirect } from 'next/navigation';
import AdminAccessFallback from '@/components/admin/admin-access-fallback';
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
    <>
      {/* Admins and reviewers both work the desk and can register walk-ins. */}
      <SpotRegistrationsPanel canManage canExport={operator.role === 'admin'} />
    </>
  );
}
