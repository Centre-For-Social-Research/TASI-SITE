import { redirect } from 'next/navigation';
import AdminAccessFallback from '@/components/admin/admin-access-fallback';
import AdminShell from '@/components/admin/admin-shell';
import CertificatesPanel from '@/components/admin/certificates-panel';
import { getAuthorizedOperator } from '@/lib/registration-auth';
import operatorSession from '@/lib/operator-session.cjs';

const { toOperatorSession, logOperatorEvent } = operatorSession;

export default async function CertificatesPage() {
  const operator = await getAuthorizedOperator({ route: 'admin.certificates' });
  logOperatorEvent('admin.certificates.entry', 'admin.certificates', operator);

  if (!operator.authorized) {
    if (operator.reason === 'unauthenticated')
      redirect('/sign-in?redirect_url=/admin/certificates');
    if (operator.reason === 'unauthorized') redirect('/not-authorized');
    return <AdminAccessFallback operator={operator} />;
  }

  return (
    <AdminShell
      operator={toOperatorSession(operator)}
      currentPath="/admin/certificates"
    >
      <CertificatesPanel
        canManage={operator.role === 'admin'}
        operatorEmail={operator.primaryEmail || ''}
      />
    </AdminShell>
  );
}
