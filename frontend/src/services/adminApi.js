import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/api/admin/demandes`;

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getAllDemandes = async () => {
  const res = await axios.get(API_URL, getAuthConfig());
  return res.data;
};

export const getDemandeById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, getAuthConfig());
  return res.data;
};

export const approveDemande = async (id, sectionValidee) => {
  const body = sectionValidee ? { sectionValidee } : {};
  const res = await axios.put(`${API_URL}/${id}/approve`, body, getAuthConfig());
  return res.data;
};

export const rejectDemande = async (id, comment) => {
  const res = await axios.put(
    `${API_URL}/${id}/reject`,
    {
      adminComment: comment,
    },
    getAuthConfig(),
  );
  return res.data;
};

export const getAllMedecins = async () => {
  const res = await axios.get(
    `${API_BASE_URL}/api/admin/medecins`,
    getAuthConfig(),
  );
  return res.data;
};

export const getMedecinById = async (id) => {
  const res = await axios.get(
    `${API_BASE_URL}/api/admin/medecins/${id}`,
    getAuthConfig(),
  );
  return res.data;
};

export const reactivateMedecin = async (id) => {
  const res = await axios.put(
    `${API_BASE_URL}/api/admin/medecins/${id}/reactivate`,
    {},
    getAuthConfig(),
  );
  return res.data;
};

export const suspendMedecin = async (id, adminComment) => {
  const res = await axios.put(
    `${API_BASE_URL}/api/admin/medecins/${id}/suspend`,
    { adminComment },
    getAuthConfig(),
  );
  return res.data;
};

export const deleteMedecin = async (id) => {
  const res = await axios.delete(
    `${API_BASE_URL}/api/admin/medecins/${id}`,
    getAuthConfig(),
  );
  return res.data;
};
