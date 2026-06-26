import axios from "axios";
import { API_BASE_URL } from "../config/api";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getAllSondages = (params = {}) =>
  api.get("/admin/sondages", { params });

export const getSondageById = (id) => api.get(`/admin/sondages/${id}`);

export const createSondage = (data) => api.post("/admin/sondages", data);

export const updateSondage = (id, data) =>
  api.put(`/admin/sondages/${id}`, data);

export const publishSondage = (id, data = {}) =>
  api.put(`/admin/sondages/${id}/publish`, data);

export const publishResultats = (id) => api.put(`/admin/sondages/${id}/publish-results`);

export const closeSondage = (id) => api.put(`/admin/sondages/${id}/close`);

export const archiveSondage = (id) => api.put(`/admin/sondages/${id}/archive`);

export const deleteSondage = (id) => api.delete(`/admin/sondages/${id}`);

export const getSondageStats = (id) => api.get(`/admin/sondages/${id}/stats`);
