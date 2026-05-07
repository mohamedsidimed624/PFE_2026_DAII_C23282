import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Stethoscope,
  Tag,
  MessageSquareWarning,
  BarChart2,
  Megaphone,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard",                Icon: LayoutDashboard,      to: "/admin/dashboard" },
  { label: "Gestion des demandes",     Icon: ClipboardList,        to: "/admin/demandes" },
  { label: "Gestion des Médecins",     Icon: Stethoscope,          to: "/admin/medecins" },
  { label: "Gestion des spécialités",  Icon: Tag,                  to: "/admin/specialites" },
  { label: "Gestion des Réclamations", Icon: MessageSquareWarning, to: "/admin/reclamations" },
  { label: "Diffusion d'information",  Icon: Megaphone,            to: "/admin/diffusion" },
  { label: "Gestion des Sondages",     Icon: BarChart2,            to: "/admin/sondages" },
  { label: "Processus électoral",      Icon: BarChart2,            to: "/admin/processus" },
];

function AdminSidebar({ collapsed, onToggle }) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-14" : "w-56"
      } shrink-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 min-h-screen flex flex-col transition-all duration-300 overflow-hidden`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <img
          src="/src/assets/logo.png"
          alt="Ordre des Médecins"
          className={`object-contain transition-all duration-300 ${collapsed ? "h-8 w-8" : "h-16 w-16"}`}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ label, Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={17}
                  className={`shrink-0 ${isActive ? "text-green-600 dark:text-green-400" : "text-slate-400 dark:text-slate-500"}`}
                />
                {!collapsed && <span className="leading-none truncate">{label}</span>}
              </>
            )}
          </NavLink>
        ))}

        {/* Paramètres avec sous-menu */}
        <div>
          <NavLink
            to="/admin/parametres"
            title={collapsed ? "Paramètres" : undefined}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
              }`
            }
            onClick={(e) => {
              if (!collapsed) {
                e.preventDefault();
                setSettingsOpen((o) => !o);
              }
            }}
          >
            {({ isActive }) => (
              <>
                <Settings
                  size={17}
                  className={`shrink-0 ${isActive ? "text-green-600 dark:text-green-400" : "text-slate-400 dark:text-slate-500"}`}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 leading-none">Paramètres</span>
                    <ChevronDown
                      size={13}
                      className={`text-slate-400 transition-transform duration-200 ${settingsOpen ? "rotate-180" : ""}`}
                    />
                  </>
                )}
              </>
            )}
          </NavLink>

          {!collapsed && settingsOpen && (
            <div className="ml-6 mt-0.5 space-y-0.5">
              <NavLink
                to="/admin/parametres"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-xs transition-colors ${
                    isActive
                      ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                  }`
                }
              >
                Mon compte
              </NavLink>
              <NavLink
                to="/admin/parametres/securite"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-xs transition-colors ${
                    isActive
                      ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                  }`
                }
              >
                Sécurité
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* Toggle collapse button */}
      <div className="shrink-0 px-2 py-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onToggle}
          title={collapsed ? "Développer le menu" : "Réduire le menu"}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : (
            <>
              <ChevronLeft size={16} />
              <span className="text-xs">Réduire</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
