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

function MedecinSidebar() {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-slate-100 min-h-screen flex flex-col">

      {/* ── Logo centré — identique à AdminSidebar ── */}
      <div className="flex items-center justify-center py-5 border-b border-slate-100">
        <img
          src="/logo.png"
          alt="Ordre des Médecins"
          className="h-14 w-14 object-contain"
        />
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">

        {NAV_ITEMS.map(({ label, icon: Icon, to, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-green-50 text-green-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={17}
                  className={isActive ? "text-green-600" : "text-slate-400"}
                />
                <span className="flex-1 leading-none">{label}</span>
                {badge ? (
                  <span className="min-w-[18px] h-[18px] inline-flex items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
                    {badge}
                  </span>
                ) : null}
              </>
            )}
          </NavLink>
        ))}

        {/* ── Paramètres avec sous-menu collapsible ── */}
        <div>
          <button
            onClick={() => setSettingsOpen((o) => !o)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <Settings size={17} className="text-slate-400" />
            <span className="flex-1 text-left leading-none">Paramètres</span>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${settingsOpen ? "rotate-180" : ""}`}
            />
          </button>

          {settingsOpen && (
            <div className="ml-6 mt-0.5 space-y-0.5">
              <NavLink
                to="/medecin/parametres/compte"
                className="flex items-center px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              >
                Mon compte
              </NavLink>
              <NavLink
                to="/medecin/parametres/securite"
                className="flex items-center px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              >
                Sécurité
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* ── Déconnexion — bas de sidebar ── */}
      <div className="border-t border-slate-100 p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={17} className="shrink-0" />
          <span className="leading-none">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

export default MedecinSidebar;