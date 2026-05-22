import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getMesElections = (params = {}) =>
  api.get("/medecin/elections", { params });

export const getElectionDetail = (id) =>
  api.get(`/medecin/elections/${id}`);

export const candidater = (id, data) =>
  api.post(`/medecin/elections/${id}/candidater`, data);

export const retirerCandidature = (id) =>
  api.delete(`/medecin/elections/${id}/candidature`);

export const voter = (id, data) =>
  api.post(`/medecin/elections/${id}/voter`, data);

export const getMesCandidatures = () =>
  api.get("/medecin/elections/mes-candidatures");

export const uploadCandidatureDocument = (candidatureId, formData) =>
  api.post(`/medecin/elections/candidatures/${candidatureId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
