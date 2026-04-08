import axios from "axios";

const API_URL = "http://localhost:8080/api/medecin/reclamations";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const createMedecinReclamation = async (data, file) => {
  const formData = new FormData();
  formData.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );

  if (file) {
    formData.append("file", file);
  }

  const res = await axios.post(API_URL, formData, {
    headers: {
      ...getAuthConfig().headers,
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const getMyReclamations = async () => {
  const res = await axios.get(API_URL, getAuthConfig());
  return res.data;
};

export const getMyReclamationById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, getAuthConfig());
  return res.data;
};
