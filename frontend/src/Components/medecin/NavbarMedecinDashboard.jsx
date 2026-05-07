import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
} from "lucide-react";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    message: "Nouvelle annonce réservée aux médecins",
    time: "Il y a 10 min",
    read: false,
  },
  {
    id: 2,
    message: "Votre profil professionnel peut être complété",
    time: "Aujourd’hui",
    read: false,
  },
  {
    id: 3,
    message: "Module sondages bientôt disponible",
    time: "Information",
    read: true,
  },
];

function NavbarMedecinDashboard({ title = "Tableau de bord", onToggleSidebar }) {
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const userRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

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
  }, [darkMode]);

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserOpen(false);
      }

      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const userName = localStorage.getItem("userName") || "Dr. Médecin";
  const userRole = "Médecin";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu size={18} />
        </button>

        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setDarkMode((d) => !d)}
          title={darkMode ? "Mode clair" : "Mode sombre"}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {darkMode ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} />
          )}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen((o) => !o);
              setUserOpen(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Bell size={18} />

            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold leading-none text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/50">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Notifications
                  </span>

                  {unreadCount > 0 && (
                    <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-900/40 dark:text-red-400">
                      {unreadCount}
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] font-semibold text-green-600 transition-colors hover:text-green-700 dark:text-green-400"
                  >
                    <Check size={11} />
                    Tout marquer lu
                  </button>
                )}
              </div>

              <div className="max-h-72 divide-y divide-slate-50 overflow-y-auto dark:divide-slate-800">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markOneRead(n.id)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                      !n.read ? "bg-green-50/60 dark:bg-green-900/10" : ""
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
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

                      <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                        {n.time}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
                <button
                  onClick={() => {
                    navigate("/medecin/notifications");
                    setNotifOpen(false);
                  }}
                  className="w-full py-0.5 text-center text-xs font-semibold text-green-600 transition-colors hover:text-green-700 dark:text-green-400"
                >
                  Voir toutes les notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />

        <div className="relative" ref={userRef}>
          <button
            onClick={() => {
              setUserOpen((o) => !o);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
              <User size={15} />
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold leading-none text-slate-800 dark:text-slate-100">
                {userName}
              </p>
              <p className="mt-0.5 text-[10px] leading-none text-slate-400 dark:text-slate-500">
                {userRole}
              </p>
            </div>

            <ChevronDown
              size={13}
              className={`text-slate-400 transition-transform duration-200 ${
                userOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-slate-100 bg-white py-1 shadow-lg shadow-slate-100/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40">
              <button
                onClick={() => {
                  navigate("/medecin/parametres");
                  setUserOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Settings size={14} className="text-slate-400" />
                Paramètres
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
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

export default NavbarMedecinDashboard;