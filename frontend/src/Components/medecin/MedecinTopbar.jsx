import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Moon,
  Sun,
  User,
  Settings,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
} from "lucide-react";

function MedecinTopbar({
  title,
  subtitle,
  profile,
  isSidebarCollapsed,
  toggleSidebar,
}) {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const prenom = profile?.prenom || "";
  const nom = profile?.nom || "";
  const initiales =
    `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || "M";
  const nomComplet = `${prenom} ${nom}`.trim() || "Médecin";
  const numeroInscription = profile?.numeroInscription || "—";
  const statut = (profile?.statut || "").toUpperCase();

  const statusConfig = {
    ACTIF: {
      label: "Actif",
      bg: "bg-emerald-100 dark:bg-emerald-900/40",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
    ACTIVE: {
      label: "Actif",
      bg: "bg-emerald-100 dark:bg-emerald-900/40",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
    APPROVED: {
      label: "Actif",
      bg: "bg-emerald-100 dark:bg-emerald-900/40",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
    EN_ATTENTE: {
      label: "En attente",
      bg: "bg-amber-100 dark:bg-amber-900/40",
      text: "text-amber-700 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    PENDING: {
      label: "En attente",
      bg: "bg-amber-100 dark:bg-amber-900/40",
      text: "text-amber-700 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    SUSPENDU: {
      label: "Suspendu",
      bg: "bg-red-100 dark:bg-red-900/40",
      text: "text-red-700 dark:text-red-400",
      dot: "bg-red-500",
    },
    SUSPENDED: {
      label: "Suspendu",
      bg: "bg-red-100 dark:bg-red-900/40",
      text: "text-red-700 dark:text-red-400",
      dot: "bg-red-500",
    },
  };

  const currentStatus = statusConfig[statut] || {
    label: profile?.statut || "Inconnu",
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-400",
    dot: "bg-slate-400",
  };

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
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400 transition"
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}
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
      <div className="flex items-center gap-1.5">
        {/* Dark mode toggle */}
        <button
          onClick={handleDarkModeToggle}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
          title={darkMode ? "Mode clair" : "Mode sombre"}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate("/medecin/notifications")}
          className="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
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
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-xs font-bold text-white shadow-sm">
              {initiales}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight text-slate-800 dark:text-slate-200 transition-colors">
                {nomComplet}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 transition-colors">
                  N° {numeroInscription}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${currentStatus.bg} ${currentStatus.text}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${currentStatus.dot} ${
                      statut === "ACTIF" || statut === "ACTIVE" || statut === "APPROVED"
                        ? "animate-pulse"
                        : ""
                    }`}
                  />
                  {currentStatus.label}
                </span>
              </div>
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
            <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl transition-colors">
              {/* Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {nomComplet}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {profile?.email || "—"}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    N° {numeroInscription}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${currentStatus.bg} ${currentStatus.text}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${currentStatus.dot}`}
                    />
                    {currentStatus.label}
                  </span>
                </div>
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
          : "text-slate-700 hover:bg-slate-50 hover:text-emerald-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-400"
      }`}
    >
      <span
        className={
          danger ? "text-red-500" : "text-slate-400 dark:text-slate-500"
        }
      >
        {icon}
      </span>
      {label}
    </button>
  );
}

export default MedecinTopbar;