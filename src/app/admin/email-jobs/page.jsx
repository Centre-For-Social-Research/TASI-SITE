import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/admin-shell';
import EmailJobsPanel from '@/components/admin/email-jobs-panel';
import AdminAccessFallback from '@/components/admin/admin-access-fallback';
import { getAuthorizedOperator } from '@/lib/registration-auth';
import operatorSession from '@/lib/operator-session.cjs';

const { toOperatorSession, logOperatorEvent } = operatorSession;

export default async function AdminEmailJobsPage() {
  const operator = await getAuthorizedOperator({
    route: 'admin.email.jobs.page',
  });
  logOperatorEvent('admin.email.jobs.entry', 'admin.email.jobs.page', operator);

  if (!operator.authorized) {
    if (operator.reason === 'unauthenticated')
      redirect('/sign-in?redirect_url=/admin/email-jobs');
    if (operator.reason === 'unauthorized') redirect('/not-authorized');
    return (
      <AdminAccessFallback
        operator={operator}
        heading="Email operations are temporarily unavailable."
      />
    );
  }

  const sessionOperator = toOperatorSession(operator);

  return (
    <AdminShell operator={sessionOperator} currentPath="/admin/email-jobs">
      {logOperatorEvent(
        'admin.email.jobs.shell',
        'admin.email.jobs.page',
        operator
      )}
      <EmailJobsPanel operator={sessionOperator} />
    </AdminShell>
  );
}
