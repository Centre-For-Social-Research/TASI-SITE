import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/admin-shell';
import TicketingAdminPanel from '@/components/admin/ticketing-admin-panel';
import { getAuthorizedOperator } from '@/lib/registration-auth';
import operatorSession from '@/lib/operator-session.cjs';

const { toOperatorSession, logOperatorEvent } = operatorSession;

function AccessFallback() {
  return (
    <main className="min-h-screen bg-[#0b0c0f] px-6 py-24 text-[#edf0f6]">
      <div className="mx-auto max-w-3xl rounded-[10px] border border-[#23262d] bg-[#111318] p-8">
        <p className="font-admin-mono text-[10px] uppercase tracking-[0.18em] text-[#8d93a5]">
          Access Required
        </p>
        <h1 className="mt-3 font-admin-display text-4xl text-[#f5f6f8]">
          Ticketing operations are temporarily unavailable.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#9ca3b5]">
          Clerk is not fully configured in this environment yet. Add the
          required Clerk environment variables and redeploy to enable operator
          sign-in.
        </p>
      </div>
    </main>
  );
}

export default async function AdminTicketsPage() {
  const operator = await getAuthorizedOperator({ route: 'admin.tickets.page' });
  logOperatorEvent('admin.tickets.entry', 'admin.tickets.page', operator);

  if (!operator.authorized) {
    if (operator.reason === 'unauthenticated')
      redirect('/sign-in?redirect_url=/admin/tickets');
    if (operator.reason === 'unauthorized') redirect('/not-authorized');
    return <AccessFallback />;
  }

  const sessionOperator = toOperatorSession(operator);

  return (
    <AdminShell operator={sessionOperator} currentPath="/admin/tickets">
      {logOperatorEvent('admin.tickets.shell', 'admin.tickets.page', operator)}
      <TicketingAdminPanel />
    </AdminShell>
  );
}
