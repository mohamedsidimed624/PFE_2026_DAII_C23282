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
} from "lucide-react";

/* ── Fausses notifications (à remplacer par ton API) ── */
const MOCK_NOTIFICATIONS = [
  { id: 1, message: "Nouvelle demande soumise par Mohamed Ahmed", time: "Il y a 5 min",  read: false },
  { id: 2, message: "Demande #6548 a été approuvée",             time: "Il y a 20 min", read: false },
  { id: 3, message: "Réclamation en attente de traitement",       time: "Il y a 1h",    read: false },
  { id: 4, message: "Dr. Fatima Mint a mis à jour son profil",    time: "Il y a 2h",    read: true  },
  { id: 5, message: "Sondage mensuel publié avec succès",         time: "Hier",         read: true  },
];

function NavbarDashboard({ title = "Gestion des demandes" }) {
  const [userOpen,      setUserOpen]      = useState(false);
  const [notifOpen,     setNotifOpen]     = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [darkMode,      setDarkMode]      = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const userRef  = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* ── Dark mode : toggle classe sur <html> ── */
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

  /* ── Fermer les dropdowns au clic extérieur ── */
  useEffect(() => {
    const handler = (e) => {
      if (userRef.current  && !userRef.current.contains(e.target))  setUserOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markOneRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const userName = localStorage.getItem("userName") || "Med Ahmed";
  const userRole = localStorage.getItem("userRole")  || "Admin";

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 transition-colors duration-200">

      {/* ── Logo + titre ── */}
      <div className="flex items-center gap-3">
        
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </span>
      </div>

      {/* ── Actions côté droit ── */}
      <div className="flex items-center gap-1">

        {/* ── Toggle Dark / Light ── */}
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
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-0.5 leading-none">
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
                    onClick={markAllRead}
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
                  <p className="text-center text-xs text-slate-400 py-8">
                    Aucune notification
                  </p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markOneRead(n.id)}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                        !n.read ? "bg-green-50/60 dark:bg-green-900/10" : ""
                      }`}
                    >
                      <span
                        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 transition-colors ${
                          !n.read ? "bg-green-500" : "bg-transparent"
                        }`}
                      />
                      <div className="min-w-0">
                        <p
                          className={`text-xs leading-relaxed ${
                            !n.read
                              ? "font-semibold text-slate-800 dark:text-slate-100"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {n.message}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {n.time}
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

        {/* ── Séparateur vertical ── */}
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* ── Menu utilisateur ── */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setUserOpen((o) => !o); setNotifOpen(false); }}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 flex items-center justify-center shrink-0">
              <User size={15} />
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