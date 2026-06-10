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
import { getMyProfile } from "../../services/medecinApi";
import {
  getMedecinNotifications,
  getMedecinUnreadCount,
  markAllMedecinNotifsRead,
  markMedecinNotifAsRead,
} from "../../services/medecinNotificationApi";

function formatNotifTime(dateStr) {
  if (!dateStr) return "";
  const diff = new Date() - new Date(dateStr);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.floor(h / 24)} j`;
}

function NavbarMedecinDashboard({ title = "Tableau de bord", onToggleSidebar }) {
  const [profile, setProfile] = useState(null);
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadBadge, setUnreadBadge] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const loadNotifications = () => {
    setNotifLoading(true);
    getMedecinNotifications()
      .then((res) => setNotifications(res.data?.content ?? res.data ?? []))
      .catch(() => {})
      .finally(() => setNotifLoading(false));
  };

  const handleMarkAllRead = async () => {
    await markAllMedecinNotifsRead().catch(() => {});
    setUnreadBadge(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
  };

  const handleMarkOneRead = async (id) => {
    await markMedecinNotifAsRead(id).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
    );
    setUnreadBadge((c) => Math.max(0, c - 1));
  };

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const userRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

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
    getMyProfile()
      .then((res) => setProfile(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const load = () => {
      getMedecinUnreadCount()
        .then((res) => setUnreadBadge(res.data?.count ?? 0))
        .catch(() => {});
    };

    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const userName = profile
    ? `${profile.prenom || ""} ${profile.nom || ""}`.trim() || "Dr. Médecin"
    : "Dr. Médecin";

  const userRole = "Médecin";

  const photoUrl = profile?.photoProfilPath
    ? `http://localhost:8080${profile.photoProfilPath}`
    : null;

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 transition-colors duration-200">
      {/* Toggle + titre */}
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

      {/* Actions droite */}
      <div className="flex items-center gap-1">
        {/* Dark / Light */}
        <button
          onClick={() => setDarkMode((d) => !d)}
          title={darkMode ? "Mode clair" : "Mode sombre"}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} className="text-slate-400" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              const opening = !notifOpen;
              setNotifOpen(opening);
              setUserOpen(false);
              if (opening) loadNotifications();
            }}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell size={18} />

            {unreadBadge > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-0.5 leading-none">
                {unreadBadge > 9 ? "9+" : unreadBadge}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-black/50 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Notifications
                  </span>

                  {unreadBadge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-[10px] font-bold">
                      {unreadBadge}
                    </span>
                  )}
                </div>

                {unreadBadge > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[11px] font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                  >
                    <Check size={11} />
                    Tout marquer lu
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Chargement…
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    Aucune notification
                  </div>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        if (!n.lu) handleMarkOneRead(n.id);
                        if (n.lien) { navigate(n.lien); setNotifOpen(false); }
                      }}
                      className={`w-full text-left px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        !n.lu ? "bg-green-50/60 dark:bg-green-900/10" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {!n.lu && (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                        )}
                        <div className={!n.lu ? "" : "pl-4"}>
                          <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-1">
                            {n.titre}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {formatNotifTime(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    navigate("/medecin/notifications");
                    setNotifOpen(false);
                  }}
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

        {/* Menu utilisateur */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => {
              setUserOpen((o) => !o);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
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
              className={`text-slate-400 transition-transform duration-200 ${
                userOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg shadow-slate-100/60 dark:shadow-black/40 py-1 z-50">
              <button
                onClick={() => {
                  navigate("/medecin/profil");
                  setUserOpen(false);
                }}
                className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <User size={14} className="text-slate-400" />
                Mon profil
              </button>

              <button
                onClick={() => {
                  navigate("/medecin/parametres");
                  setUserOpen(false);
                }}
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

export default NavbarMedecinDashboard;