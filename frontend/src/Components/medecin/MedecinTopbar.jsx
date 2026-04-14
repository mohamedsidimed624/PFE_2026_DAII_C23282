import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Moon, Sun, User, Settings, LogOut, ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";

function MedecinTopbar({ title, subtitle, profile, isSidebarCollapsed, toggleSidebar }) {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const prenom = profile?.prenom || "";
  const nom = profile?.nom || "";
  const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || "M";
  const nomComplet = `${prenom} ${nom}`.trim() || "Médecin";

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDarkModeToggle = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 bg-transparent transition-colors duration-300">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-green-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-green-400 transition"
        >
          {isSidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
        <div>
          <h1 className="text-base font-semibold text-slate-900 dark:text-white transition-colors">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-1">
        {/* Dark mode toggle */}
        <button
          onClick={handleDarkModeToggle}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-green-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-green-400"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate("/medecin/notifications")}
          className="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-green-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-green-400"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Divider */}
        <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700 transition-colors" />

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {/* Avatar */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-xs font-bold text-white shadow-sm">
              {initiales}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight text-slate-800 dark:text-slate-200 transition-colors">
                {nomComplet}
              </p>
              <p className="text-xs leading-tight text-slate-400 dark:text-slate-500 transition-colors">
                Médecin
              </p>
            </div>

            <ChevronDown
              size={15}
              className={`hidden text-slate-400 transition-transform sm:block duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl transition-colors">
              {/* Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {nomComplet}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {profile?.email || "—"}
                </p>
              </div>

              {/* Items */}
              <div className="py-1">
                <DropdownItem
                  icon={<User size={15} />}
                  label="Mon profil"
                  onClick={() => {
                    navigate("/medecin/profil");
                    setDropdownOpen(false);
                  }}
                />
                <DropdownItem
                  icon={<Settings size={15} />}
                  label="Paramètres"
                  onClick={() => {
                    navigate("/medecin/parametres");
                    setDropdownOpen(false);
                  }}
                />
              </div>

              {/* Logout */}
              <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                <DropdownItem
                  icon={<LogOut size={15} />}
                  label="Se déconnecter"
                  onClick={handleLogout}
                  danger
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DropdownItem({ icon, label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition ${
        danger
          ? "text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/50"
          : "text-slate-700 hover:bg-slate-50 hover:text-green-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-green-400"
      }`}
    >
      <span className={danger ? "text-red-500" : "text-slate-400 dark:text-slate-500"}>
        {icon}
      </span>
      {label}
    </button>
  );
}

export default MedecinTopbar;