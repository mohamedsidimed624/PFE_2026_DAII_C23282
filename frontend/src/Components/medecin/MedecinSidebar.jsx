import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  User,
  FileText,
  Bell,
  TriangleAlert,
  BarChart3,
  Vote,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",     icon: LayoutDashboard, to: "/medecin/dashboard" },
  { label: "Mon profil",    icon: User,            to: "/medecin/profil" },
  { label: "Mes documents", icon: FileText,        to: "/medecin/documents" },
  { label: "Notifications", icon: Bell,            to: "/medecin/notifications", badge: 3 },
  { label: "Réclamations",  icon: TriangleAlert,   to: "/medecin/reclamations" },
  { label: "Sondages",      icon: BarChart3,       to: "/medecin/sondages" },
  { label: "Élections",     icon: Vote,            to: "/medecin/elections" },
];

function MedecinSidebar({ isCollapsed = false }) {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* ── Logo centré ── */}
      <div className={`flex items-center justify-center py-5 border-b border-slate-200 dark:border-slate-800 transition-colors ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <img
          src="./assets/logo.png"
          alt="Ordre des Médecins"
          className={`object-contain transition-all duration-300 ${isCollapsed ? 'h-10 w-10' : 'h-14 w-14'}`}
        />
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, icon: Icon, to, badge }) => (
          <NavLink
            key={to}
            to={to}
            title={isCollapsed ? label : ""}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : "text-slate-600 hover:bg-slate-50 hover:text-green-600 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-green-400"
              } ${isCollapsed ? 'justify-center' : 'justify-start'}`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative flex items-center justify-center">
                  <Icon
                    size={20}
                    className={`transition-colors ${isActive ? "text-green-600 dark:text-green-400" : "text-slate-400 dark:text-slate-500"}`}
                  />
                  {badge && isCollapsed && (
                    <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-red-500 border-2 border-white dark:border-slate-950" />
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex flex-1 items-center justify-between overflow-hidden">
                    <span className="leading-none whitespace-nowrap">{label}</span>
                    {badge ? (
                      <span className="min-w-[20px] h-[20px] inline-flex items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none shadow-sm">
                        {badge}
                      </span>
                    ) : null}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* ── Paramètres ── */}
        <div>
          <button
            onClick={() => setSettingsOpen((o) => !o)}
            title={isCollapsed ? "Paramètres" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 text-slate-600 hover:bg-slate-50 hover:text-green-600 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-green-400 ${isCollapsed ? 'justify-center' : 'justify-start'}`}
          >
            <Settings size={20} className="text-slate-400 dark:text-slate-500 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left leading-none whitespace-nowrap">Paramètres</span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform duration-200 ${settingsOpen ? "rotate-180" : ""}`}
                />
              </>
            )}
          </button>

          {!isCollapsed && settingsOpen && (
            <div className="ml-9 mt-1 space-y-1">
              <NavLink
                to="/medecin/parametres/compte"
                className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg text-xs font-medium transition-colors ${isActive ? 'text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20' : 'text-slate-500 hover:text-green-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-green-400 dark:hover:bg-slate-800/50'}`}
              >
                Mon compte
              </NavLink>
              <NavLink
                to="/medecin/parametres/securite"
                className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg text-xs font-medium transition-colors ${isActive ? 'text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20' : 'text-slate-500 hover:text-green-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-green-400 dark:hover:bg-slate-800/50'}`}
              >
                Sécurité
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* ── Déconnexion ── */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3 transition-colors">
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Déconnexion" : ""}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/30 ${isCollapsed ? 'justify-center' : 'justify-start'}`}
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="leading-none whitespace-nowrap">Déconnexion</span>}
        </button>
      </div>
    </div>
  );
}

export default MedecinSidebar;