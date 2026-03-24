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
      comment: comment,
    },
    getAuthConfig(),
  );
  return res.data;
};
