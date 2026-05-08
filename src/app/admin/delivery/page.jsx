import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/admin-shell';
import DeliveryJobsPanel from '@/components/admin/delivery-jobs-panel';
import AdminAccessFallback from '@/components/admin/admin-access-fallback';
import { getAuthorizedOperator } from '@/lib/registration-auth';
import operatorSession from '@/lib/operator-session.cjs';

const { toOperatorSession, logOperatorEvent } = operatorSession;

export default async function AdminDeliveryPage() {
  const operator = await getAuthorizedOperator({
    route: 'admin.delivery.page',
  });
  logOperatorEvent('admin.delivery.entry', 'admin.delivery.page', operator);

  if (!operator.authorized) {
    if (operator.reason === 'unauthenticated')
      redirect('/sign-in?redirect_url=/admin/delivery');
    if (operator.reason === 'unauthorized') redirect('/not-authorized');
    return (
      <AdminAccessFallback
        operator={operator}
        heading="Delivery operations are temporarily unavailable."
      />
    );
  }

  const sessionOperator = toOperatorSession(operator);

  return (
    <AdminShell operator={sessionOperator} currentPath="/admin/delivery">
      {logOperatorEvent(
        'admin.delivery.shell',
        'admin.delivery.page',
        operator
      )}
      <DeliveryJobsPanel operator={sessionOperator} />
    </AdminShell>
  );
}
