import AdminSidebar from "./AdminSidebar";
import NavbarDashboard from "./NavbarDashboard";

function AdminLayout({ children, title }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <NavbarDashboard title={title} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;