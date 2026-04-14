import { useState, useEffect } from "react";
import MedecinSidebar from "./MedecinSidebar";
import MedecinTopbar from "./MedecinTopbar";

function MedecinLayout({ title, subtitle, children, profile }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Initialize Dark Mode based on localStorage
  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar — fixed height, no scroll */}
      <aside
        className={`hidden shrink-0 lg:block transition-all duration-300 ease-in-out z-20 ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <MedecinSidebar isCollapsed={isSidebarCollapsed} />
      </aside>

      {/* Right column — topbar + content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar — stays at top naturally */}
        <div className="shrink-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
          <MedecinTopbar
            title={title}
            subtitle={subtitle}
            profile={profile}
            isSidebarCollapsed={isSidebarCollapsed}
            toggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
          />
        </div>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MedecinLayout;