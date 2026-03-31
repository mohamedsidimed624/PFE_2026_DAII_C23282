import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
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
