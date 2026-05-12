import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  User,
} from "lucide-react";
import { getMyProfile } from "../../services/medecinApi";
import { getMedecinUnreadCount } from "../../services/medecinNotificationApi";

function NavbarMedecinDashboard({ title = "Tableau de bord", onToggleSidebar }) {
  const [profile, setProfile] = useState(null);
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadBadge, setUnreadBadge] = useState(0);

  const userRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMyProfile()
      .then((res) => setProfile(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const load = () =>
      getMedecinUnreadCount()
        .then((res) => setUnreadBadge(res.data?.count ?? 0))
        .catch(() => {});
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
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

  const initials = profile
    ? [profile.prenom, profile.nom].map((n) => (n ? n[0].toUpperCase() : "")).join("")
    : "";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100"
        >
          <Menu size={18} />
        </button>
        <span className="text-sm font-semibold text-slate-700">{title}</span>
      </div>

      <div className="flex items-center gap-1">
        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((o) => !o); setUserOpen(false); }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100"
          >
            <Bell size={18} />
            {unreadBadge > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold leading-none text-white">
                {unreadBadge > 9 ? "9+" : unreadBadge}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">Notifications</span>
                  {unreadBadge > 0 && (
                    <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                      {unreadBadge}
                    </span>
                  )}
                </div>
                {unreadBadge > 0 && (
                  <button className="flex items-center gap-1 text-[11px] font-semibold text-green-600 hover:text-green-700">
                    <Check size={11} /> Tout marquer lu
                  </button>
                )}
              </div>
              <div className="py-4 text-center text-xs text-slate-400">
                Aucune notification pour le moment
              </div>
              <div className="border-t border-slate-100 px-4 py-2.5">
                <button
                  onClick={() => { navigate("/medecin/notifications"); setNotifOpen(false); }}
                  className="w-full py-0.5 text-center text-xs font-semibold text-green-700 hover:text-green-800"
                >
                  Voir toutes les notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mx-1 h-5 w-px bg-slate-200" />

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setUserOpen((o) => !o); setNotifOpen(false); }}
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-slate-50"
          >
            {profile?.photoProfilPath ? (
              <img
                src={`http://localhost:8080${profile.photoProfilPath}`}
                alt="Photo de profil"
                className="h-7 w-7 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700 text-xs font-bold">
                {initials || <User size={14} />}
              </div>
            )}
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold leading-none text-slate-800">{userName}</p>
              <p className="mt-0.5 text-[10px] leading-none text-slate-400">Médecin</p>
            </div>
            <ChevronDown
              size={13}
              className={`text-slate-400 transition-transform duration-200 ${userOpen ? "rotate-180" : ""}`}
            />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-slate-100 bg-white py-1 shadow-lg shadow-slate-100/60">
              <button
                onClick={() => { navigate("/medecin/profil"); setUserOpen(false); }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                <User size={14} className="text-slate-400" />
                Mon profil
              </button>
              <button
                onClick={() => { navigate("/medecin/parametres"); setUserOpen(false); }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Settings size={14} className="text-slate-400" />
                Paramètres
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-500 hover:bg-red-50"
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
