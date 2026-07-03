import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  User,
  Settings,
  Bell,
  Sun,
  Moon,
  Check,
  Menu,
} from "lucide-react";
import { resolveFileUrl } from "../../config/api";
import { useAdminNotification } from "../../context/AdminNotificationContext";

function formatRelTime(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  const diffMin = Math.floor((Date.now() - d) / 60000);
  if (diffMin < 1)  return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)   return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7)    return `Il y a ${diffD}j`;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function NavbarDashboard({ title = "Gestion des demandes", onToggleSidebar }) {
  const [userOpen,  setUserOpen]  = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [darkMode,  setDarkMode]  = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const { notifications, unreadCount, profile, markAsRead, markAllAsRead } =
    useAdminNotification();

  const userRef  = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  /* ── Dark mode ── */
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
    window.dispatchEvent(new Event("theme-changed"));
  }, [darkMode]);

  /* ── Fermer dropdowns au clic extérieur ── */
  useEffect(() => {
    const handler = (e) => {
      if (userRef.current  && !userRef.current.contains(e.target))  setUserOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotifClick = async (n) => {
    if (!n.lu) markAsRead(n.id);
    if (n.lien) navigate(n.lien);
    setNotifOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const userName = profile?.nomComplet || localStorage.getItem("email") || "Admin";
  const userRole = "Administrateur";
  const photoUrl = resolveFileUrl(profile?.photoProfilPath);
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 transition-colors duration-200">

      {/* ── Toggle + titre ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu size={18} />
        </button>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </span>
      </div>

      {/* ── Actions droite ── */}
      <div className="flex items-center gap-1">

        {/* Dark / Light */}
        <button
          onClick={() => setDarkMode((d) => !d)}
          title={darkMode ? "Mode clair" : "Mode sombre"}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode
            ? <Sun size={18} className="text-amber-400" />
            : <Moon size={18} className="text-slate-400" />
          }
        </button>

        {/* ── Cloche notifications ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((o) => !o); setUserOpen(false); }}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-0.5 leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown notifications */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-black/50 z-50 overflow-hidden">

              {/* En-tête */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[11px] font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                  >
                    <Check size={11} />
                    Tout marquer lu
                  </button>
                )}
              </div>

              {/* Liste */}
              <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-8">
                    Aucune notification
                  </p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                        !n.lu ? "bg-green-50/60 dark:bg-green-900/10" : ""
                      }`}
                    >
                      <span
                        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                          !n.lu ? "bg-green-500" : "bg-transparent"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs leading-relaxed ${
                          !n.lu
                            ? "font-semibold text-slate-800 dark:text-slate-100"
                            : "text-slate-500 dark:text-slate-400"
                        }`}>
                          {n.titre}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">
                          {formatRelTime(n.createdAt)}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Pied */}
              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => { navigate("/admin/notifications"); setNotifOpen(false); }}
                  className="w-full text-center text-xs font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors py-0.5"
                >
                  Voir toutes les notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Séparateur */}
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* ── Menu utilisateur ── */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setUserOpen((o) => !o); setNotifOpen(false); }}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
              {photoUrl ? (
                <img src={photoUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 flex items-center justify-center text-[10px] font-bold">
                  {initials || <User size={13} />}
                </div>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-none">
                {userName}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">
                {userRole}
              </p>
            </div>
            <ChevronDown
              size={13}
              className={`text-slate-400 transition-transform duration-200 ${userOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown user */}
          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg shadow-slate-100/60 dark:shadow-black/40 py-1 z-50">
              <button
                onClick={() => { navigate("/admin/parametres/compte"); setUserOpen(false); }}
                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Settings size={14} className="text-slate-400" />
                Paramètres
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={14} />
                Déconnexion
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default NavbarDashboard;
