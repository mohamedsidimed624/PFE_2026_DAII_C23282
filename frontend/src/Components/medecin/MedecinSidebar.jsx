import { NavLink, useNavigate } from "react-router-dom";
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
  Stethoscope,
} from "lucide-react";

function MedecinSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition font-medium ${
      isActive
        ? "bg-green-50 text-green-700 border border-green-200"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
    }`;

  return (
    <aside className="w-full lg:w-72 bg-white border-r border-slate-200 shadow-sm lg:min-h-screen">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow">
            <Stethoscope size={24} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800">Espace Médecin</h2>
            <p className="text-sm text-slate-500">Ordre des Médecins</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        <NavLink to="/medecin/dashboard" className={linkClass}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/medecin/profil" className={linkClass}>
          <User size={18} />
          <span>Mon profil</span>
        </NavLink>

        <NavLink to="/medecin/documents" className={linkClass}>
          <FileText size={18} />
          <span>Mes documents</span>
        </NavLink>

        <NavLink to="/medecin/notifications" className={linkClass}>
          <Bell size={18} />
          <span>Notifications</span>
        </NavLink>

        <NavLink to="/medecin/reclamations" className={linkClass}>
          <TriangleAlert size={18} />
          <span>Réclamation</span>
        </NavLink>

        <NavLink to="/medecin/sondages" className={linkClass}>
          <BarChart3 size={18} />
          <span>Sondage</span>
        </NavLink>

        <NavLink to="/medecin/elections" className={linkClass}>
          <Vote size={18} />
          <span>Élection</span>
        </NavLink>

        <NavLink to="/medecin/parametres" className={linkClass}>
          <Settings size={18} />
          <span>Paramètres</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition font-medium"
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </nav>
    </aside>
  );
}

export default MedecinSidebar;