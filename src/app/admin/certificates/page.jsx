import { redirect } from 'next/navigation';
import AdminAccessFallback from '@/components/admin/admin-access-fallback';
import CertificatesPanel from '@/components/admin/certificates-panel';
import { getAuthorizedOperator } from '@/lib/registration-auth';
import operatorSession from '@/lib/operator-session.cjs';

const { logOperatorEvent } = operatorSession;

// The admin shell comes from app/admin/layout.jsx; this page renders only
// its panel.
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
    <CertificatesPanel
      canManage={operator.role === 'admin'}
      operatorEmail={operator.primaryEmail || ''}
    />
  );
}
