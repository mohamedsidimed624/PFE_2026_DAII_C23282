import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, FileText, CheckCircle, XCircle, AlertCircle, User,
  Clock, Trash2, Check, ExternalLink, Loader2,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import {
  getNotifications, markAsRead, markAllAsRead, deleteNotification,
} from "../../services/notificationApi";

const TYPE_META = {
  NOUVELLE_DEMANDE:       { icon: FileText,     color: "text-blue-600",   bg: "bg-blue-50   dark:bg-blue-900/20"   },
  DEMANDE_APPROUVEE:      { icon: CheckCircle,  color: "text-green-600",  bg: "bg-green-50  dark:bg-green-900/20"  },
  DEMANDE_REJETEE:        { icon: XCircle,      color: "text-red-600",    bg: "bg-red-50    dark:bg-red-900/20"    },
  NOUVELLE_RECLAMATION:   { icon: AlertCircle,  color: "text-amber-600",  bg: "bg-amber-50  dark:bg-amber-900/20"  },
  RECLAMATION_PRISE_EN_CHARGE: { icon: Clock,       color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
  RECLAMATION_CLOTUREE:        { icon: CheckCircle, color: "text-teal-600",   bg: "bg-teal-50   dark:bg-teal-900/20"   },
  MEDECIN_PROFIL_MODIFIE:      { icon: User,        color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
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
  const meta = TYPE_META[n.type] || { icon: Bell, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-800" };
  const Icon = meta.icon;

  return (
    <div
      className={`group relative flex items-start gap-4 rounded-xl border px-5 py-4 transition-colors ${
        !n.lu
          ? "border-green-200 dark:border-green-800 bg-green-50/60 dark:bg-green-900/10 border-l-[3px] border-l-green-500"
          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 border-l-[3px] border-l-transparent"
      }`}
    >
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
        <Icon size={16} className={meta.color} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className={`text-sm font-semibold leading-snug ${n.lu ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-slate-100"}`}>
            {n.titre}
          </p>
          <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
            {formatDate(n.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>
        {n.lien && (
          <button
            onClick={() => onNavigate(n)}
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
          >
            <ExternalLink size={10} />
            Voir le détail
          </button>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!n.lu && (
          <button
            onClick={() => onRead(n.id)}
            title="Marquer comme lu"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            <Check size={13} />
          </button>
        )}
        <button
          onClick={() => onDelete(n.id)}
          title="Supprimer"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-50">
        <Bell size={20} className="text-slate-300" />
      </div>
      <p className="mt-3 text-sm text-slate-400">{label}</p>
    </div>
  );
}

function NotifList({ items, onRead, onDelete, onNavigate }) {
  if (!items.length) return <EmptyState label="Aucune notification dans cette catégorie" />;
  return (
    <div className="space-y-2">
      {items.map((n) => (
        <NotifCard key={n.id} n={n} onRead={onRead} onDelete={onDelete} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = useCallback(() => {
    getNotifications()
      .then((res) => setNotifications(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
  };

  const handleRead = async (id) => {
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)));
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNavigate = (n) => {
    handleRead(n.id);
    if (n.lien) navigate(n.lien);
  };

  const unreadCount = notifications.filter((n) => !n.lu).length;
  const unreadList = notifications.filter((n) => !n.lu);
  const actionList = notifications.filter((n) => n.actionRequise);
  const actionUnread = actionList.filter((n) => !n.lu).length;

  return (
  <AdminLayout title="Notifications">
    <div className="min-h-screen bg-[#FAFBFC] dark:bg-slate-950 px-7 py-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold text-slate-700 dark:text-slate-200">
            Notifications
          </h1>

          {unreadCount > 0 && (
            <p className="mt-1 text-[13px] text-slate-400">
              {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="h-10 rounded-md border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-[13px] text-slate-400 dark:text-slate-400 shadow-sm hover:text-slate-600 dark:hover:text-slate-200"
          >
            Tout marquer lu
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-slate-300" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-md bg-white dark:bg-slate-900">
          <Tabs defaultValue="all">
            <div className="border-b border-slate-100 dark:border-slate-800 px-7 py-4">
              <TabsList className="flex gap-3 bg-transparent p-0">
                <TabsTrigger
                  value="all"
                  className="rounded-md px-4 py-2 text-[13px] font-semibold text-slate-400 data-[state=active]:bg-green-500 data-[state=active]:text-white"
                >
                  Toutes
                  {notifications.length > 0 && (
                    <span className="ml-2 rounded bg-white/20 px-1.5 text-[10px]">
                      {notifications.length}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="unread"
                  className="rounded-md px-4 py-2 text-[13px] font-semibold text-slate-400 data-[state=active]:bg-green-500 data-[state=active]:text-white"
                >
                  Non lues
                  {unreadCount > 0 && (
                    <span className="ml-2 rounded bg-white/20 px-1.5 text-[10px]">
                      {unreadCount}
                    </span>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="action"
                  className="rounded-md px-4 py-2 text-[13px] font-semibold text-slate-400 data-[state=active]:bg-green-500 data-[state=active]:text-white"
                >
                  Action requise
                  {actionUnread > 0 && (
                    <span className="ml-2 rounded bg-white/20 px-1.5 text-[10px]">
                      {actionUnread}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="m-0">
              <NotifList
                items={notifications}
                onRead={handleRead}
                onDelete={handleDelete}
                onNavigate={handleNavigate}
              />
            </TabsContent>

            <TabsContent value="unread" className="m-0">
              <NotifList
                items={unreadList}
                onRead={handleRead}
                onDelete={handleDelete}
                onNavigate={handleNavigate}
              />
            </TabsContent>

            <TabsContent value="action" className="m-0">
              <NotifList
                items={actionList}
                onRead={handleRead}
                onDelete={handleDelete}
                onNavigate={handleNavigate}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  </AdminLayout>
);
}

export default AdminNotificationsPage;
