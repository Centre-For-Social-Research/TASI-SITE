import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/admin-shell';
import SubmissionsPanel from '@/components/admin/submissions-panel';
import AdminAccessFallback from '@/components/admin/admin-access-fallback';
import { getAuthorizedOperator } from '@/lib/registration-auth';
import operatorSession from '@/lib/operator-session.cjs';

const { toOperatorSession, logOperatorEvent } = operatorSession;

export default async function AdminSubmissionsPage() {
  const operator = await getAuthorizedOperator({ route: 'admin.submissions' });
  logOperatorEvent('admin.submissions.entry', 'admin.submissions', operator);

  if (!operator.authorized) {
    if (operator.reason === 'unauthenticated')
      redirect('/sign-in?redirect_url=/admin/submissions');
    if (operator.reason === 'unauthorized') redirect('/not-authorized');
    return <AdminAccessFallback operator={operator} />;
  }

  return (
    <AdminShell
      operator={toOperatorSession(operator)}
      currentPath="/admin/submissions"
    >
      <SubmissionsPanel />
    </AdminShell>
  );
}
