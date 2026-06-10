import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Bell,
  TriangleAlert,
  BarChart3,
  Vote,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getMedecinUnreadCount } from "../../services/medecinNotificationApi";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/medecin/dashboard" },
  { label: "Mon profil", icon: User, to: "/medecin/profil" },
  { label: "Réclamations", icon: TriangleAlert, to: "/medecin/reclamations" },
  { label: "Notifications", icon: Bell, to: "/medecin/notifications" },
  { label: "Sondages", icon: BarChart3, to: "/medecin/sondages" },
  { label: "Élections", icon: Vote, to: "/medecin/elections" },
  { label: "Paramètres", icon: Settings, to: "/medecin/parametres" },
];

function MedecinSidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const load = () =>
      getMedecinUnreadCount()
        .then((res) => setUnreadCount(res.data?.count ?? 0))
        .catch(() => {});
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside
      className={`${
        collapsed ? "w-14" : "w-56"
      } shrink-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 min-h-screen flex flex-col transition-all duration-300 overflow-hidden`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div
          className={`overflow-hidden rounded-full transition-all duration-300 ${
            collapsed ? "h-10 w-10" : "h-24 w-24"
          }`}
        >
          <img
            src="/src/assets/logo.png"
            alt="Ordre des Médecins"
            className="h-full w-full object-cover scale-[1.20]"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `relative flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-green-500" />
                )}

                <Icon
                  size={17}
                  className={`shrink-0 ${
                    isActive
                      ? "text-green-600 dark:text-green-400"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                />

                {!collapsed && (
                  <span className="flex-1 leading-none truncate">{label}</span>
                )}
                {label === "Notifications" && unreadCount > 0 && (
                  <span className={`flex items-center justify-center rounded-full bg-red-500 text-white font-bold leading-none ${
                    collapsed
                      ? "absolute -top-0.5 -right-0.5 h-4 w-4 text-[9px]"
                      : "h-4 min-w-4 px-0.5 text-[9px]"
                  }`}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="shrink-0 space-y-2 px-2 py-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onToggle}
          title={collapsed ? "Développer le menu" : "Réduire le menu"}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <>
              <ChevronLeft size={16} />
              <span className="text-xs">Réduire</span>
            </>
          )}
        </button>

        <button
          onClick={handleLogout}
          title={collapsed ? "Déconnexion" : undefined}
          className={`relative flex w-full items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && (
            <span className="flex-1 leading-none truncate">
              Déconnexion
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

export default MedecinSidebar;