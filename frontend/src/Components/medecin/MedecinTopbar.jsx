import { useEffect, useState } from "react";
import { Bell, Moon, Sun, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

function MedecinTopbar({ title, subtitle }) {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [menuOpen, setMenuOpen] = useState(false);

  const email = localStorage.getItem("email") || "Médecin";
  const role = localStorage.getItem("role") || "MEDECIN";

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm px-6 py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Partie gauche */}
        <div>
          <p className="text-sm text-green-600 font-semibold mb-1">
            Espace médecin
          </p>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            {title}
          </h1>

          {subtitle && (
            <p className="text-slate-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Partie droite */}
        <div className="flex items-center gap-3 justify-end">
          {/* Bouton thème */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="w-11 h-11 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
            title="Changer le thème"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="relative w-11 h-11 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full" />
          </button>

          {/* Menu utilisateur */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
            >
              <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                {email.charAt(0).toUpperCase()}
              </div>

              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">
                  {email}
                </p>
                <p className="text-xs text-slate-500">
                  {role}
                </p>
              </div>

              <ChevronDown size={16} className="text-slate-500" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden z-50">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/medecin/profil");
                  }}
                  className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 transition"
                >
                  Mon profil
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/medecin/parametres");
                  }}
                  className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 transition"
                >
                  Paramètres
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedecinTopbar;