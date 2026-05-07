import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import NavbarDashboard from "./NavbarDashboard";

function AdminLayout({ children, title }) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );

  const toggle = () =>
    setCollapsed((c) => {
      localStorage.setItem("sidebarCollapsed", String(!c));
      return !c;
    });

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <AdminSidebar collapsed={collapsed} onToggle={toggle} />
      <div className="flex-1 flex flex-col min-w-0">
        <NavbarDashboard title={title} onToggleSidebar={toggle} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
