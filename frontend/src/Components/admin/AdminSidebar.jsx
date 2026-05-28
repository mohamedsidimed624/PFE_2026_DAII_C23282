import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Stethoscope,
  Tag,
  MessageSquareWarning,
  BarChart2,
  Megaphone,
  Settings,
  Vote,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getUnreadCount } from "../../services/notificationApi";

const navItems = [
  { label: "Dashboard",                Icon: LayoutDashboard,      to: "/admin/dashboard" },
  { label: "Gestion des demandes",     Icon: ClipboardList,        to: "/admin/demandes" },
  { label: "Gestion des Médecins",     Icon: Stethoscope,          to: "/admin/medecins" },
  { label: "Gestion des spécialités",  Icon: Tag,                  to: "/admin/specialites" },
  { label: "Gestion des Réclamations", Icon: MessageSquareWarning, to: "/admin/reclamations" },
  { label: "Notifications",            Icon: Bell,                 to: "/admin/notifications", badge: true },
  { label: "Gestion des Sondages",     Icon: BarChart2,            to: "/admin/sondages" },
  { label: "Diffusion d'information",  Icon: Megaphone,            to: "/admin/diffusion" },
];

function AdminSidebar({ collapsed, onToggle }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [electionOpen, setElectionOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const fetchCount = () => {
      getUnreadCount().then((res) => setUnreadCount(res.data.count || 0)).catch(() => {});
    };
    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <aside
      className={`${
        collapsed ? "w-14" : "w-56"
      } shrink-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 min-h-screen flex flex-col transition-all duration-300 overflow-hidden`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="h-24 w-24 overflow-hidden rounded-full">
          <img
            src="/src/assets/logo.png"
            alt="Ordre des Médecins"
            className="h-full w-full object-cover scale-[1.20]"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ label, Icon, to, badge }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `relative flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-green-500" />
                )}
                <div className="relative shrink-0">
                  <Icon
                    size={17}
                    className={isActive ? "text-green-600 dark:text-green-400" : "text-slate-400 dark:text-slate-500"}
                  />
                  {badge && unreadCount > 0 && collapsed && (
                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 flex items-center justify-center bg-red-500 rounded-full text-[8px] text-white font-bold px-0.5">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                {!collapsed && <span className="flex-1 leading-none truncate">{label}</span>}
                {!collapsed && badge && unreadCount > 0 && (
                  <span className="rounded-full bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Processus Électoral avec sous-menu */}
        <div>
          <button
            title={collapsed ? "Processus Électoral" : undefined}
            onClick={() => !collapsed && setElectionOpen((o) => !o)}
            className={`flex w-full items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              location.pathname.startsWith("/admin/processus")
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <Vote
              size={17}
              className={`shrink-0 ${
                location.pathname.startsWith("/admin/processus")
                  ? "text-green-600 dark:text-green-400"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            />
            {!collapsed && (
              <>
                <span className="flex-1 leading-none">Processus Électoral</span>
                <ChevronDown
                  size={13}
                  className={`text-slate-400 transition-transform duration-200 ${electionOpen ? "rotate-180" : ""}`}
                />
              </>
            )}
          </button>

          {!collapsed && electionOpen && (
            <div className="ml-6 mt-0.5 space-y-0.5">
              <NavLink
                to="/admin/processus/elections"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-xs transition-colors ${
                    isActive
                      ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                  }`
                }
              >
                Gestion des Élections
              </NavLink>
              <NavLink
                to="/admin/processus/candidats"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-xs transition-colors ${
                    isActive
                      ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                  }`
                }
              >
                Gestion des Candidats
              </NavLink>
            </div>
          )}
        </div>

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
