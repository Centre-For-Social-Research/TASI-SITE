import { redirect } from 'next/navigation';
import AdminAccessFallback from '@/components/admin/admin-access-fallback';
import AdminShell from '@/components/admin/admin-shell';
import GuestInvitationsPanel from '@/components/admin/guest-invitations-panel';
import { getAuthorizedOperator } from '@/lib/registration-auth';
import operatorSession from '@/lib/operator-session.cjs';

const { toOperatorSession, logOperatorEvent } = operatorSession;

export default async function GuestInvitationsPage() {
  const operator = await getAuthorizedOperator({
    route: 'admin.guest-invitations',
  });
  logOperatorEvent(
    'admin.guest-invitations.entry',
    'admin.guest-invitations',
    operator
  );

  if (!operator.authorized) {
    if (operator.reason === 'unauthenticated') {
      redirect('/sign-in?redirect_url=/admin/guest-invitations');
    }
    if (operator.reason === 'unauthorized') redirect('/not-authorized');
    return <AdminAccessFallback operator={operator} />;
  }

  return (
    <AdminShell
      operator={toOperatorSession(operator)}
      currentPath="/admin/guest-invitations"
    >
      <GuestInvitationsPanel canManage={operator.role === 'admin'} />
    </AdminShell>
  );
}
