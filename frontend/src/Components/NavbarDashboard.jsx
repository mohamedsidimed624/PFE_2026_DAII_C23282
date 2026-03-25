import { Link, useNavigate } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import { getAuthData, isAuthenticated, logout } from "../utils/auth";

function NavbarDashboard() {
  const navigate = useNavigate();

  const { role, email } = getAuthData();
  const connected = isAuthenticated();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / identité */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow">
            <Stethoscope size={22} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Ordre des Médecins
            </h1>
            <p className="text-xs text-slate-500">
              Portail institutionnel
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          {!connected && (
            <>
              <Link
                to="/"
                className="text-slate-600 hover:text-green-700 transition"
              >
                Accueil
              </Link>

              <Link
                to="/adhesion"
                className="text-slate-600 hover:text-green-700 transition"
              >
                Adhésion
              </Link>

              <Link
                to="/login"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition"
              >
                Connexion
              </Link>
            </>
          )}

          {connected && role === "ADMIN" && (
            <>
              <Link
                to="/admin/demandes"
                className="text-slate-700 hover:text-green-700 font-medium transition"
              >
                Demandes
              </Link>

              <span className="text-sm text-slate-500 hidden md:block">
                {email}
              </span>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition"
              >
                Déconnexion
              </button>
            </>
          )}

          {connected && role === "MEDECIN" && (
            <>
              <Link
                to="/medecin/dashboard"
                className="text-slate-700 hover:text-green-700 font-medium transition"
              >
                Mon espace
              </Link>

              <span className="text-sm text-slate-500 hidden md:block">
                {email}
              </span>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition"
              >
                Déconnexion
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default NavbarDashboard;