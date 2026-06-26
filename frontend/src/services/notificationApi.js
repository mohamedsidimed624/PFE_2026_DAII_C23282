import axios from "axios";
import { API_BASE_URL } from "../config/api";

const BASE = `${API_BASE_URL}/api/admin/notifications`;

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getNotifications = () => axios.get(BASE, auth());
export const getUnreadCount = () => axios.get(`${BASE}/unread-count`, auth());
export const markAsRead = (id) => axios.put(`${BASE}/${id}/read`, {}, auth());
export const markAllAsRead = () => axios.put(`${BASE}/read-all`, {}, auth());
export const deleteNotification = (id) => axios.delete(`${BASE}/${id}`, auth());
