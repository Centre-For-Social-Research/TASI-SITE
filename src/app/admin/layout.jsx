import AdminExitGuard from '@/components/admin/admin-exit-guard';
import TasiClerkProvider from '@/components/auth/clerk-provider';
import './admin-console.css';

export default function AdminLayout({ children }) {
  return (
    <TasiClerkProvider>
      <AdminExitGuard>{children}</AdminExitGuard>
    </TasiClerkProvider>
  );
}
