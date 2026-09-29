import { redirect } from 'next/navigation';
import AdminAccessFallback from '@/components/admin/admin-access-fallback';
import AdminShell from '@/components/admin/admin-shell';
import SpeakerCommunicationsPanel from '@/components/admin/speaker-communications-panel';
import { getAuthorizedOperator } from '@/lib/registration-auth';
import operatorSession from '@/lib/operator-session.cjs';

const { toOperatorSession, logOperatorEvent } = operatorSession;

export default async function SpeakerCommunicationsPage() {
  const operator = await getAuthorizedOperator({
    route: 'admin.speaker-communications',
  });
  logOperatorEvent(
    'admin.speaker-communications.entry',
    'admin.speaker-communications',
    operator
  );

  if (!operator.authorized) {
    if (operator.reason === 'unauthenticated') {
      redirect('/sign-in?redirect_url=/admin/speaker-communications');
    }
    if (operator.reason === 'unauthorized') redirect('/not-authorized');
    return <AdminAccessFallback operator={operator} />;
  }

  return (
    <AdminShell
      operator={toOperatorSession(operator)}
      currentPath="/admin/speaker-communications"
    >
      <SpeakerCommunicationsPanel
        canManage={operator.role === 'admin'}
        operatorEmail={operator.primaryEmail || ''}
      />
    </AdminShell>
  );
}
