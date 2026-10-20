import AdminExitGuard from '@/components/admin/admin-exit-guard';
import AdminShell from '@/components/admin/admin-shell';
import TasiClerkProvider from '@/components/auth/clerk-provider';
import { getAuthorizedOperator } from '@/lib/registration-auth';
import operatorSession from '@/lib/operator-session.cjs';
import './admin-console.css';

const { toOperatorSession } = operatorSession;

export const metadata = {
  title: 'Admin | TASI 2026',
  robots: {
    index: false,
    follow: false,
  },
};

// The shell lives here so it stays mounted while operators move between tabs;
// only the page segment re-renders. Each page still checks access itself and
// handles redirects, so an unauthorised request renders the page alone.
export default async function AdminLayout({ children }) {
  const operator = await getAuthorizedOperator({ route: 'admin.layout' });

  return (
    <TasiClerkProvider dynamic>
      <AdminExitGuard>
        {operator.authorized ? (
          <AdminShell operator={toOperatorSession(operator)}>
            {children}
          </AdminShell>
        ) : (
          children
        )}
      </AdminExitGuard>
    </TasiClerkProvider>
  );
}
