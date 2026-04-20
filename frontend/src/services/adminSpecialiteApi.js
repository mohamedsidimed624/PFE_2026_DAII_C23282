import axios from "axios";

const API_URL = "http://localhost:8080/api/admin";

const adminApi = axios.create({
  baseURL: API_URL,
});

adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["Content-Type"] = "application/json";
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

export const getAdminSpecialites = async (filters = {}) => {
  const response = await adminApi.get("/specialites", {
    params: buildParams(filters),
  });
  return response.data;
};

export const getAdminSpecialiteById = async (id) => {
  const response = await adminApi.get(`/specialites/${id}`);
  return response.data;
};

export const createSpecialite = async (payload) => {
  const response = await adminApi.post("/specialites", payload);
  return response.data;
};

export const updateSpecialite = async (id, payload) => {
  const response = await adminApi.put(`/specialites/${id}`, payload);
  return response.data;
};

export const toggleSpecialiteStatus = async (id) => {
  await adminApi.patch(`/specialites/${id}/status`);
};

export const deleteSpecialite = async (id) => {
  await adminApi.delete(`/specialites/${id}`);
};

export const getSousSpecialitesBySpecialite = async (specialiteId) => {
  const response = await adminApi.get(
    `/specialites/${specialiteId}/sous-specialites`,
  );
  return response.data;
};

export const createSousSpecialite = async (payload) => {
  const response = await adminApi.post("/sous-specialites", payload);
  return response.data;
};

export const updateSousSpecialite = async (id, payload) => {
  const response = await adminApi.put(`/sous-specialites/${id}`, payload);
  return response.data;
};

export const toggleSousSpecialiteStatus = async (id) => {
  await adminApi.patch(`/sous-specialites/${id}/status`);
};

export const deleteSousSpecialite = async (id) => {
  await adminApi.delete(`/sous-specialites/${id}`);
};

export const checkSpecialiteCodeAvailable = async (code, excludeId = null) => {
  const response = await adminApi.get("/specialites/check-code", {
    params: buildParams({ code, excludeId }),
  });
  return response.data;
};

export const checkSpecialiteLibelleAvailable = async (
  libelle,
  excludeId = null,
) => {
  const response = await adminApi.get("/specialites/check-libelle", {
    params: buildParams({ libelle, excludeId }),
  });
  return response.data;
};

export const checkSousSpecialiteCodeAvailable = async (
  code,
  excludeId = null,
) => {
  const response = await adminApi.get("/sous-specialites/check-code", {
    params: buildParams({ code, excludeId }),
  });
  return response.data;
};

export const checkSousSpecialiteLibelleAvailable = async (
  libelle,
  specialiteId,
  excludeId = null,
) => {
  const response = await adminApi.get("/sous-specialites/check-libelle", {
    params: buildParams({ libelle, specialiteId, excludeId }),
  });
  return response.data;
};

export default adminApi;
