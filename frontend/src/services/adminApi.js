import axios from "axios";

const API_URL = "http://localhost:8080/api/admin/demandes";

export const getAllDemandes = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const getDemandeById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const approveDemande = async (id) => {
  return await axios.put(`${API_URL}/${id}/approve`);
};

export const rejectDemande = async (id, comment) => {
  return await axios.put(`${API_URL}/${id}/reject`, {
    adminComment: comment,
  });
};
