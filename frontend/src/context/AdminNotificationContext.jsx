import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from "../services/notificationApi";
import { getMyProfile } from "../services/adminProfileApi";

const AdminNotificationContext = createContext(null);

export function AdminNotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [profile, setProfile]             = useState(null);

  const fetchNotifications = useCallback(() => {
    getNotifications()
      .then((res) => {
        const data = res.data.slice(0, 6);
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.lu).length);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getMyProfile().then((res) => setProfile(res.data)).catch(() => {});
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  const handleMarkAsRead = useCallback((id) => {
    markAsRead(id).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lu: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    setUnreadCount(0);
  }, []);

  return (
    <AdminNotificationContext.Provider value={{
      notifications,
      unreadCount,
      profile,
      setProfile,
      markAsRead: handleMarkAsRead,
      markAllAsRead: handleMarkAllRead,
    }}>
      {children}
    </AdminNotificationContext.Provider>
  );
}

export function useAdminNotification() {
  return useContext(AdminNotificationContext);
}
