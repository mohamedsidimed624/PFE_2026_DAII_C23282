import axios from "axios";

const BASE = "http://localhost:8080/api/admin/notifications";

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getNotifications = () => axios.get(BASE, auth());
export const getUnreadCount = () => axios.get(`${BASE}/unread-count`, auth());
export const markAsRead = (id) => axios.put(`${BASE}/${id}/read`, {}, auth());
export const markAllAsRead = () => axios.put(`${BASE}/read-all`, {}, auth());
export const deleteNotification = (id) => axios.delete(`${BASE}/${id}`, auth());
