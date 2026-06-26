import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export const getSuiviDossier = async (numeroDossier) => {
  const response = await API.get(
    `/demandes/suivi/${encodeURIComponent(numeroDossier)}`,
  );
  return response.data;
};

export const getDemandePourReprise = async (numeroDossier) => {
  const response = await API.get(
    `/demandes/reprise/${encodeURIComponent(numeroDossier)}`,
  );
  return response.data;
};
