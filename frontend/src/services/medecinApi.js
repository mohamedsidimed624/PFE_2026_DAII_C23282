import axios from "axios";

const API_URL = "http://localhost:8080/api/medecin";

const authHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getMyProfile = () => {
  return axios.get(`${API_URL}/me`, authHeaders());
};

export const updateMyProfile = (data) => {
  return axios.put(`${API_URL}/me`, data, authHeaders());
};

export const uploadMyPhoto = (file) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(`${API_URL}/me/photo`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
