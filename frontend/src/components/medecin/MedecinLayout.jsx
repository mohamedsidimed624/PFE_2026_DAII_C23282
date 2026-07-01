import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MedecinSidebar from "./MedecinSidebar";
import NavbarMedecinDashboard from "./NavbarMedecinDashboard";

function MedecinLayout({ children, title = "Tableau de bord" }) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("medecinSidebarCollapsed") === "true"
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggle = () =>
    setCollapsed((c) => {
      localStorage.setItem("medecinSidebarCollapsed", String(!c));
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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <MedecinSidebar collapsed={collapsed} onToggle={toggle} mobileOpen={mobileOpen} />

      <div className="flex min-w-0 flex-1 flex-col">
        <NavbarMedecinDashboard title={title} onToggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MedecinLayout;