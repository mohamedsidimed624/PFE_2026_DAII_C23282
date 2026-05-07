import { useState } from "react";
import MedecinSidebar from "./MedecinSidebar";
import NavbarMedecinDashboard from "./NavbarMedecinDashboard";

function MedecinLayout({ children, title = "Tableau de bord" }) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("medecinSidebarCollapsed") === "true"
  );

  const toggle = () =>
    setCollapsed((c) => {
      localStorage.setItem("medecinSidebarCollapsed", String(!c));
      return !c;
    });

  return (
    <div className="flex min-h-screen bg-slate-50 transition-colors duration-200 dark:bg-slate-950">
      <MedecinSidebar collapsed={collapsed} onToggle={toggle} />

      <div className="flex min-w-0 flex-1 flex-col">
        <NavbarMedecinDashboard title={title} onToggleSidebar={toggle} />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MedecinLayout;