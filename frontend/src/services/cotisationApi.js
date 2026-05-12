import axios from "axios";

const API_URL = "http://localhost:8080/api/medecin";

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getMyCotisations      = ()                         => axios.get(`${API_URL}/cotisations`, auth());
export const getCotisationCourante = ()                         => axios.get(`${API_URL}/cotisations/courante`, auth());
export const initierPaiement       = (id)                       => axios.post(`${API_URL}/cotisations/${id}/initier-paiement`, {}, auth());
export const confirmerPaiement     = (id, codeTransaction)      => axios.post(`${API_URL}/cotisations/${id}/confirmer-paiement`, { codeTransaction }, auth());
