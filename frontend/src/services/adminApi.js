import axios from "axios";

const API_URL = "http://localhost:8080/api/admin/demandes";

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

export const approveDemande = async (id) => {
  const res = await axios.put(`${API_URL}/${id}/approve`, {}, getAuthConfig());
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
    "http://localhost:8080/api/admin/medecins",
    getAuthConfig(),
  );
  return res.data;
};

export const getMedecinById = async (id) => {
  const res = await axios.get(
    `http://localhost:8080/api/admin/medecins/${id}`,
    getAuthConfig(),
  );
  return res.data;
};

export const reactivateMedecin = async (id) => {
  const res = await axios.put(
    `http://localhost:8080/api/admin/medecins/${id}/reactivate`,
    {},
    getAuthConfig(),
  );
  return res.data;
};

export const suspendMedecin = async (id, adminComment) => {
  const res = await axios.put(
    `http://localhost:8080/api/admin/medecins/${id}/suspend`,
    { adminComment },
    getAuthConfig(),
  );
  return res.data;
};

export const deleteMedecin = async (id) => {
  const res = await axios.delete(
    `http://localhost:8080/api/admin/medecins/${id}`,
    getAuthConfig(),
  );
  return res.data;
};
