import AdminExitGuard from "@/components/admin/admin-exit-guard";

export default function AdminLayout({ children }) {
  return <AdminExitGuard>{children}</AdminExitGuard>;
}
