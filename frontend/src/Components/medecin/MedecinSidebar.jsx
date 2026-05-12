import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Bell,
  TriangleAlert,
  CreditCard,
  BarChart3,
  Vote,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",     icon: LayoutDashboard, to: "/medecin/dashboard"    },
  { label: "Mon profil",    icon: User,            to: "/medecin/profil"       },
  { label: "Réclamations",  icon: TriangleAlert,   to: "/medecin/reclamations" },
  { label: "Cotisation",    icon: CreditCard,      to: "/medecin/cotisation"   },
  { label: "Notifications", icon: Bell,            to: "/medecin/notifications"},
  { label: "Sondages",      icon: BarChart3,       to: "/medecin/sondages"     },
  { label: "Élections",     icon: Vote,            to: "/medecin/elections"    },
  { label: "Paramètres",    icon: Settings,        to: "/medecin/parametres"   },
];

function MedecinSidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside
      className={`${
        collapsed ? "w-14" : "w-56"
      } flex min-h-screen shrink-0 flex-col overflow-hidden border-r border-slate-100 bg-white transition-all duration-300`}
    >
      <div className="flex shrink-0 items-center justify-center border-b border-slate-100 py-4">
        <img
          src="/src/assets/logo.png"
          alt="Ordre des Médecins"
          className={`object-contain transition-all duration-300 ${
            collapsed ? "h-8 w-8" : "h-16 w-16"
          }`}
        />
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-2 py-4">
        <NavSection title="Espace médecin" items={navItems} collapsed={collapsed} />
      </nav>

      <div className="shrink-0 space-y-2 border-t border-slate-100 px-2 py-3">
        <button
          onClick={onToggle}
          title={collapsed ? "Développer le menu" : "Réduire le menu"}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
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
          className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 ${
            collapsed ? "justify-center" : "justify-start"
          }`}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && <span className="truncate leading-none">Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
}

function NavSection({ title, items, collapsed }) {
  return (
    <div>
      {!collapsed && (
        <p className="mb-2 px-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </p>
      )}

      <div className="space-y-0.5">
        {items.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-green-50 text-green-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={17}
                  className={`shrink-0 ${isActive ? "text-green-600" : "text-slate-400"}`}
                />
                {!collapsed && <span className="truncate leading-none">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default MedecinSidebar;
