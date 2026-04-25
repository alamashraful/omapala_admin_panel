import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export default function AdminLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <AdminTopbar />
        <main className="admin-page">
          <div className="admin-page-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}

