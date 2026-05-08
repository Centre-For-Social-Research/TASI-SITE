import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/admin-shell';
import TicketingAdminPanel from '@/components/admin/ticketing-admin-panel';
import AdminAccessFallback from '@/components/admin/admin-access-fallback';
import { getAuthorizedOperator } from '@/lib/registration-auth';
import operatorSession from '@/lib/operator-session.cjs';

const { toOperatorSession, logOperatorEvent } = operatorSession;

export default async function AdminTicketsPage() {
  const operator = await getAuthorizedOperator({ route: 'admin.tickets.page' });
  logOperatorEvent('admin.tickets.entry', 'admin.tickets.page', operator);

  if (!operator.authorized) {
    if (operator.reason === 'unauthenticated')
      redirect('/sign-in?redirect_url=/admin/tickets');
    if (operator.reason === 'unauthorized') redirect('/not-authorized');
    return (
      <AdminAccessFallback
        operator={operator}
        heading="Ticketing operations are temporarily unavailable."
      />
    );
  }

  const sessionOperator = toOperatorSession(operator);

  return (
    <AdminShell operator={sessionOperator} currentPath="/admin/tickets">
      {logOperatorEvent('admin.tickets.shell', 'admin.tickets.page', operator)}
      <TicketingAdminPanel />
    </AdminShell>
  );
}
