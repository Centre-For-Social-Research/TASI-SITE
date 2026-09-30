import { redirect } from 'next/navigation';
import AdminAccessFallback from '@/components/admin/admin-access-fallback';
import AdminShell from '@/components/admin/admin-shell';
import RemindersPanel from '@/components/admin/reminders-panel';
import { getAuthorizedOperator } from '@/lib/registration-auth';
import operatorSession from '@/lib/operator-session.cjs';

const { toOperatorSession, logOperatorEvent } = operatorSession;

export default async function RemindersPage() {
  const operator = await getAuthorizedOperator({
    route: 'admin.reminders',
  });
  logOperatorEvent('admin.reminders.entry', 'admin.reminders', operator);

  if (!operator.authorized) {
    if (operator.reason === 'unauthenticated') {
      redirect('/sign-in?redirect_url=/admin/reminders');
    }
    if (operator.reason === 'unauthorized') redirect('/not-authorized');
    return <AdminAccessFallback operator={operator} />;
  }

  return (
    <AdminShell
      operator={toOperatorSession(operator)}
      currentPath="/admin/reminders"
    >
      <RemindersPanel
        canManage={operator.role === 'admin'}
        operatorEmail={operator.primaryEmail || ''}
        operatorName={operator.displayName || ''}
      />
    </AdminShell>
  );
}
