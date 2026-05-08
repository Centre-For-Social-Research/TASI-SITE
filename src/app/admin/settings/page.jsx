import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/admin-shell';
import SettingsPanel from '@/components/admin/settings-panel';
import AdminAccessFallback from '@/components/admin/admin-access-fallback';
import { getAuthorizedOperator } from '@/lib/registration-auth';
import operatorSession from '@/lib/operator-session.cjs';

const { toOperatorSession, logOperatorEvent } = operatorSession;

export default async function AdminSettingsPage() {
  const operator = await getAuthorizedOperator({ route: 'admin.settings' });
  logOperatorEvent('admin.settings.entry', 'admin.settings', operator);

  if (!operator.authorized) {
    if (operator.reason === 'unauthenticated')
      redirect('/sign-in?redirect_url=/admin/settings');
    if (operator.reason === 'unauthorized') redirect('/not-authorized');
    return <AdminAccessFallback operator={operator} />;
  }

  const sessionOperator = toOperatorSession(operator);

  return (
    <AdminShell operator={sessionOperator} currentPath="/admin/settings">
      <SettingsPanel />
    </AdminShell>
  );
}
