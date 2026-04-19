import AdminExitGuard from '@/components/admin/admin-exit-guard';
import './admin-console.css';

export default function AdminLayout({ children }) {
  return <AdminExitGuard>{children}</AdminExitGuard>;
}
