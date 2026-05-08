import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/admin-shell';
import AdminDashboard from '@/components/admin/admin-dashboard';
import AdminAccessFallback from '@/components/admin/admin-access-fallback';
import { getAuthorizedOperator } from '@/lib/registration-auth';
import operatorSession from '@/lib/operator-session.cjs';

const { toOperatorSession, logOperatorEvent } = operatorSession;

export default async function AdminIndexPage() {
  const operator = await getAuthorizedOperator({ route: 'admin.index' });
  logOperatorEvent('admin.index.entry', 'admin.index', operator);

  if (!operator.authorized) {
    if (operator.reason === 'unauthenticated')
      redirect('/sign-in?redirect_url=/admin');
    if (operator.reason === 'unauthorized') redirect('/not-authorized');
    return <AdminAccessFallback operator={operator} />;
  }

  const sessionOperator = toOperatorSession(operator);

  return (
    <AdminShell operator={sessionOperator} currentPath="/admin">
      {logOperatorEvent('admin.index.shell', 'admin.index', operator)}
      <AdminDashboard operator={sessionOperator} />
    </AdminShell>
  );
}
