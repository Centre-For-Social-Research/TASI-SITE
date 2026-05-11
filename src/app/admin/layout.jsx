import AdminExitGuard from '@/components/admin/admin-exit-guard';
import TasiClerkProvider from '@/components/auth/clerk-provider';
import './admin-console.css';

export const metadata = {
  title: 'Admin | TASI 2026',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }) {
  return (
    <TasiClerkProvider>
      <AdminExitGuard>{children}</AdminExitGuard>
    </TasiClerkProvider>
  );
}
