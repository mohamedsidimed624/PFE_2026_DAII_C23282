import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/api/medecin`;

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getMedecinNotifications  = ()    => axios.get(`${API_URL}/notifications`, auth());
export const getMedecinUnreadCount    = ()    => axios.get(`${API_URL}/notifications/unread-count`, auth());
export const markMedecinNotifAsRead   = (id)  => axios.put(`${API_URL}/notifications/${id}/read`, {}, auth());
export const markAllMedecinNotifsRead = ()    => axios.put(`${API_URL}/notifications/read-all`, {}, auth());
export const deleteMedecinNotif       = (id)  => axios.delete(`${API_URL}/notifications/${id}`, auth());
