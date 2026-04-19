import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/admin-shell';
import SettingsPanel from '@/components/admin/settings-panel';
import { getAuthorizedOperator } from '@/lib/registration-auth';
import operatorSession from '@/lib/operator-session.cjs';

const { toOperatorSession, logOperatorEvent } = operatorSession;

function AccessFallback() {
  return (
    <main style={{ minHeight: '100vh', background: '#0a0c11', padding: '96px 24px', color: '#f3f4f7' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', background: '#11141c', padding: 32 }}>
        <p style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8a8f9c', marginBottom: 12 }}>
          Access Required
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: '#f3f4f7', margin: 0 }}>
          Admin access is temporarily unavailable.
        </h1>
      </div>
    </main>
  );
}

export default async function AdminSettingsPage() {
  const operator = await getAuthorizedOperator({ route: 'admin.settings' });
  logOperatorEvent('admin.settings.entry', 'admin.settings', operator);

  if (!operator.authorized) {
    if (operator.reason === 'unauthenticated') redirect('/sign-in?redirect_url=/admin/settings');
    if (operator.reason === 'unauthorized') redirect('/not-authorized');
    return <AccessFallback />;
  }

  const sessionOperator = toOperatorSession(operator);

  return (
    <AdminShell operator={sessionOperator} currentPath="/admin/settings">
      <SettingsPanel />
    </AdminShell>
  );
}
