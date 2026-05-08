import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/admin-shell';
import AuditTrailPanel from '@/components/admin/audit-trail-panel';
import AdminAccessFallback from '@/components/admin/admin-access-fallback';
import { getAuthorizedOperator } from '@/lib/registration-auth';
import operatorSession from '@/lib/operator-session.cjs';

const { toOperatorSession, logOperatorEvent } = operatorSession;

export default async function AdminAuditPage() {
  const operator = await getAuthorizedOperator({ route: 'admin.audit' });
  logOperatorEvent('admin.audit.entry', 'admin.audit', operator);

  if (!operator.authorized) {
    if (operator.reason === 'unauthenticated')
      redirect('/sign-in?redirect_url=/admin/audit');
    if (operator.reason === 'unauthorized') redirect('/not-authorized');
    return <AdminAccessFallback operator={operator} />;
  }

  const sessionOperator = toOperatorSession(operator);

  return (
    <AdminShell operator={sessionOperator} currentPath="/admin/audit">
      <AuditTrailPanel />
    </AdminShell>
  );
}
