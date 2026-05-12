import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, CheckCircle, XCircle, AlertCircle, CreditCard,
  Clock, Trash2, Check, ExternalLink, Loader2, Info,
} from "lucide-react";
import MedecinLayout from "../../components/medecin/MedecinLayout";
import {
  getMedecinNotifications, markMedecinNotifAsRead,
  markAllMedecinNotifsRead, deleteMedecinNotif,
} from "../../services/medecinNotificationApi";

const TYPE_META = {
  COTISATION_RAPPEL:   { icon: CreditCard,   color: "text-amber-600",  bg: "bg-amber-50"  },
  COTISATION_CONFIRMEE:{ icon: CheckCircle,  color: "text-green-600",  bg: "bg-green-50"  },
  RECLAMATION_MAJ:     { icon: AlertCircle,  color: "text-blue-600",   bg: "bg-blue-50"   },
  PROFIL_VALIDE:       { icon: CheckCircle,  color: "text-teal-600",   bg: "bg-teal-50"   },
  INFO:                { icon: Info,         color: "text-slate-500",  bg: "bg-slate-50"  },
};

function formatDate(dt) {
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

function NotifCard({ n, onRead, onDelete, onNavigate }) {
  const meta = TYPE_META[n.type] || { icon: Bell, color: "text-slate-500", bg: "bg-slate-50" };
  const Icon = meta.icon;

  return (
    <div className={`group relative flex items-start gap-4 rounded-xl border px-5 py-4 transition-colors ${
      !n.lu
        ? "border-teal-200 bg-teal-50/60 border-l-[3px] border-l-teal-500"
        : "border-slate-100 bg-white border-l-[3px] border-l-transparent"
    }`}>
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
        <Icon size={16} className={meta.color} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className={`text-sm font-semibold leading-snug ${n.lu ? "text-slate-500" : "text-slate-900"}`}>
            {n.titre}
          </p>
          <span className="shrink-0 text-[11px] text-slate-400 whitespace-nowrap">
            {formatDate(n.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{n.message}</p>
        {n.lien && (
          <button
            onClick={() => onNavigate(n)}
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-teal-600 hover:text-teal-700 transition-colors"
          >
            <ExternalLink size={10} /> Voir le détail
          </button>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!n.lu && (
          <button
            onClick={() => onRead(n.id)}
            title="Marquer comme lu"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-teal-100 hover:text-teal-600 transition-colors"
          >
            <Check size={13} />
          </button>
        )}
        <button
          onClick={() => onDelete(n.id)}
          title="Supprimer"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Bell size={20} className="text-slate-400" />
      </div>
      <p className="mt-3 text-sm text-slate-500">Aucune notification dans cette catégorie</p>
    </div>
  );
}

function NotifList({ items, onRead, onDelete, onNavigate }) {
  if (!items.length) return <EmptyState />;
  return (
    <div className="space-y-2">
      {items.map((n) => (
        <NotifCard key={n.id} n={n} onRead={onRead} onDelete={onDelete} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

const TABS = [
  { id: "all",    label: "Toutes" },
  { id: "unread", label: "Non lues" },
  { id: "action", label: "Action requise" },
];

export default function MedecinNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  const load = useCallback(() => {
    getMedecinNotifications()
      .then((res) => setNotifications(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRead = async (id) => {
    await markMedecinNotifAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await markAllMedecinNotifsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
  };

  const handleDelete = async (id) => {
    await deleteMedecinNotif(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNavigate = (n) => {
    handleRead(n.id);
    if (n.lien) navigate(n.lien);
  };

  const unreadCount  = notifications.filter((n) => !n.lu).length;
  const unreadList   = notifications.filter((n) => !n.lu);
  const actionList   = notifications.filter((n) => n.actionRequise);
  const actionUnread = actionList.filter((n) => !n.lu).length;

  const listByTab = { all: notifications, unread: unreadList, action: actionList };
  const badgeByTab = { all: notifications.length, unread: unreadCount, action: actionUnread };

  return (
    <MedecinLayout title="Notifications">
      <div className="mx-auto max-w-3xl">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="mt-0.5 text-sm text-slate-500">
                {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Check size={14} /> Tout marquer lu
            </button>
          )}
        </div>

        {/* Tab bar */}
        <div className="mb-4 flex gap-1 border-b border-slate-200">
          {TABS.map((tab) => {
            const badge = badgeByTab[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
                {badge > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    tab.id === "unread" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <NotifList
            items={listByTab[activeTab]}
            onRead={handleRead}
            onDelete={handleDelete}
            onNavigate={handleNavigate}
          />
        )}

      </div>
    </MedecinLayout>
  );
}
