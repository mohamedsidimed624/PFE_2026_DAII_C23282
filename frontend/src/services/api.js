import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export const createDemande = async (personalData) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/demandes`,
    personalData,
  );

  return response.data;
};

export const checkUnique = async ({ nni, email, telephone }) => {
  return API.get("/demandes/check", {
    params: {
      nni,
      email,
      telephone,
    },
  });
};
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export const getSpecialites = () => api.get("/reference/specialites");

export const getSousSpecialites = (specialiteId) =>
  api.get(`/reference/specialites/${specialiteId}/sous-specialites`);

export default api;
