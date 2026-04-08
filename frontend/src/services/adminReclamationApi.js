import axios from "axios";

const API_URL = "http://localhost:8080/api/admin/reclamations";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getAllReclamations = async () => {
  const res = await axios.get(API_URL, getAuthConfig());
  return res.data;
};

export const getReclamationById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, getAuthConfig());
  return res.data;
};

export const startReclamation = async (id) => {
  const res = await axios.put(`${API_URL}/${id}/start`, {}, getAuthConfig());
  return res.data;
};

export const closeReclamation = async (id, adminResponse) => {
  const res = await axios.put(
    `${API_URL}/${id}/close`,
    { adminResponse },
    getAuthConfig(),
  );
  return res.data;
};
