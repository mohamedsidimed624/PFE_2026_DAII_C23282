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
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard",               icon: LayoutDashboard,        to: "/admin/dashboard" },
  { label: "Gestion des demandes",    icon: ClipboardList,          to: "/admin/demandes" },
  { label: "Gestion des Médecins",    icon: Stethoscope,            to: "/admin/medecins" },
  { label: "Gestion des spécialités", icon: Tag,                    to: "/admin/specialites" },
  { label: "Gestion des Réclamations",icon: MessageSquareWarning,   to: "/admin/reclamations" },
  { label: "Diffusion d'information", icon: Megaphone,              to: "/admin/diffusion" },
  { label: "Gestion des Sondages",    icon: BarChart2,              to: "/admin/sondages" },
  { label: "Processus électoral",     icon: BarChart2,              to: "/admin/processus" },
];

function AdminSidebar() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-slate-100 min-h-screen flex flex-col">

      {/* Logo */}
      <div className="flex items-center justify-center py-5 border-b border-slate-100">
        <img
          src="/src/assets/logo.png"
          alt="Ordre des Médecins"
          className="h-20 w-20 object-contain"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, to }) => (
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
                <span className="leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Paramètres avec sous-menu */}
        <div>
          <button
            onClick={() => setSettingsOpen((o) => !o)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <Settings size={17} className="text-slate-400" />
            <span className="flex-1 text-left leading-none">Paramètres</span>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform ${settingsOpen ? "rotate-180" : ""}`}
            />
          </button>
          {settingsOpen && (
            <div className="ml-6 mt-0.5 space-y-0.5">
              <NavLink
                to="/admin/parametres/compte"
                className="flex items-center px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              >
                Mon compte
              </NavLink>
              <NavLink
                to="/admin/parametres/securite"
                className="flex items-center px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              >
                Sécurité
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

export default AdminSidebar;