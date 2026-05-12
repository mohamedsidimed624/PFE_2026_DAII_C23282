import axios from "axios";

const API_URL = "http://localhost:8080/api/medecin";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const authFormHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "multipart/form-data",
  },
});

// ── Profile ────────────────────────────────────────────────────────────────
export const getMyProfile     = ()       => axios.get(`${API_URL}/me`, authHeaders());
export const updateMyProfile  = (data)   => axios.put(`${API_URL}/me`, data, authHeaders());
export const uploadMyPhoto    = (file)   => {
  const fd = new FormData();
  fd.append("file", file);
  return axios.post(`${API_URL}/me/photo`, fd, authFormHeaders());
};

// ── Educations ─────────────────────────────────────────────────────────────
export const getMyEducations    = ()          => axios.get(`${API_URL}/me/educations`, authHeaders());
export const addMyEducation     = (data)      => axios.post(`${API_URL}/me/educations`, data, authHeaders());
export const deleteMyEducation  = (id)        => axios.delete(`${API_URL}/me/educations/${id}`, authHeaders());

// ── Experiences ────────────────────────────────────────────────────────────
export const getMyExperiences   = ()          => axios.get(`${API_URL}/me/experiences`, authHeaders());
export const addMyExperience    = (data)      => axios.post(`${API_URL}/me/experiences`, data, authHeaders());
export const deleteMyExperience = (id)        => axios.delete(`${API_URL}/me/experiences/${id}`, authHeaders());

// ── Documents ──────────────────────────────────────────────────────────────
export const getMyDocuments     = ()          => axios.get(`${API_URL}/me/documents`, authHeaders());
export const uploadMyDocument   = (file, typeDocument, categorie) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("typeDocument", typeDocument || "AUTRE");
  fd.append("categorie", categorie || "AUTRE");
  return axios.post(`${API_URL}/me/documents`, fd, authFormHeaders());
};
export const deleteMyDocument   = (id)        => axios.delete(`${API_URL}/me/documents/${id}`, authHeaders());

// ── Certificate ────────────────────────────────────────────────────────────
export const downloadCertificat = () =>
  axios.get(`${API_URL}/me/certificat`, { ...authHeaders(), responseType: "blob" });
