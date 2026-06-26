import axios from "axios";
import { API_BASE_URL } from "../config/api";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getAllElections = (params = {}) =>
  api.get("/admin/elections", { params });

export const getElectionById = (id) => api.get(`/admin/elections/${id}`);

export const createElection = (data) => api.post("/admin/elections", data);

export const updateElection = (id, data) =>
  api.put(`/admin/elections/${id}`, data);

export const ouvrirCandidatures = (id) =>
  api.put(`/admin/elections/${id}/ouvrir-candidatures`);

export const cloturerCandidatures = (id) =>
  api.put(`/admin/elections/${id}/cloturer-candidatures`);

export const validerCandidature = (electionId, cid) =>
  api.put(`/admin/elections/${electionId}/candidatures/${cid}/valider`);

export const rejeterCandidature = (electionId, cid, commentaire) =>
  api.post(`/admin/elections/${electionId}/candidatures/${cid}/rejeter`, {
    commentaire,
  });

export const ouvrirVotes = (id) =>
  api.put(`/admin/elections/${id}/ouvrir-votes`);

export const cloturerVotes = (id) =>
  api.put(`/admin/elections/${id}/cloturer-votes`);

export const publierResultats = (id) =>
  api.put(`/admin/elections/${id}/publier-resultats`);

export const archiverElection = (id) =>
  api.put(`/admin/elections/${id}/archiver`);

export const annulerElection = (id, raison) =>
  api.put(`/admin/elections/${id}/annuler`, { raison });

export const getResultats = (id) =>
  api.get(`/admin/elections/${id}/resultats`);

export const getAllCandidatures = (params = {}) =>
  api.get("/admin/elections/candidatures", { params });

export const getPositions = (id) =>
  api.get(`/admin/elections/${id}/positions`);

export const addPosition = (id, data) =>
  api.post(`/admin/elections/${id}/positions`, data);

export const deletePosition = (id, pid) =>
  api.delete(`/admin/elections/${id}/positions/${pid}`);

export const getCandidaturesForElection = (electionId) =>
  api.get(`/admin/elections/${electionId}/candidatures`);

export const getAuditLog = (id) =>
  api.get(`/admin/elections/${id}/audit`);
