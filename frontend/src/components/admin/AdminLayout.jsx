import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import NavbarDashboard from "./NavbarDashboard";
import { AdminNotificationProvider } from "../../context/AdminNotificationContext";

function AdminLayout({ children, title }) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggle = () =>
    setCollapsed((c) => {
      localStorage.setItem("sidebarCollapsed", String(!c));
      return !c;
    });

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileOpen((o) => !o);
    } else {
      toggle();
    }
  };

  return (
    <AdminNotificationProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <AdminSidebar collapsed={collapsed} onToggle={toggle} mobileOpen={mobileOpen} />
        <div className="flex-1 flex flex-col min-w-0">
          <NavbarDashboard title={title} onToggleSidebar={toggleSidebar} />
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminNotificationProvider>
  );
}

export default AdminLayout;
