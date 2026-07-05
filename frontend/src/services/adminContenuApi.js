import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/api/admin`;

const adminContenuApi = axios.create({
  baseURL: API_URL,
});

adminContenuApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if ((!config.data) instanceof FormData) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const buildParams = (params = {}) => {
  const cleaned = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = value;
    }
  });

  return cleaned;
};

export const getAdminContenus = async (params = {}) => {
  const response = await adminContenuApi.get("/contenus", {
    params: buildParams(params),
  });

  return response.data;
};

export const createContenu = async (payload, imageFile) => {
  const formData = new FormData();

  formData.append(
    "data",
    new Blob([JSON.stringify(payload)], { type: "application/json" }),
  );

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await adminContenuApi.post("/contenus", formData);

  return response.data;
};

export const updateContenu = async (id, payload, imageFile = null) => {
  const formData = new FormData();

  formData.append(
    "data",
    new Blob([JSON.stringify(payload)], { type: "application/json" }),
  );

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await adminContenuApi.put(`/contenus/${id}`, formData, {});

  return response.data;
};

export const publishContenu = async (id) => {
  const response = await adminContenuApi.put(`/contenus/${id}/publish`);

  return response.data;
};

export const unpublishContenu = async (id) => {
  const response = await adminContenuApi.put(`/contenus/${id}/unpublish`);

  return response.data;
};

export const deleteContenu = async (id) => {
  await adminContenuApi.delete(`/contenus/${id}`);
};

export const getSpecialites = () =>
  adminContenuApi.get("/specialites", { params: { active: true, page: 0, size: 100 } });

export default adminContenuApi;
