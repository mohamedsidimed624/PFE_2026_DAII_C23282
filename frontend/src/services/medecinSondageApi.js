import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080/api/medecin/sondages" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getMesSondages = () => api.get("");
export const getSondageDetail = (id) => api.get(`/${id}`);
export const startParticipation = (id) => api.post(`/${id}/participer`);
export const submitReponses = (data) => api.post("/participations/repondre", data);
export const getSondageResultats = (id) => api.get(`/${id}/resultats`);
export const getMesParticipations = () => api.get("/mes-participations");
