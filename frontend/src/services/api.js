import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const createDemande = async (personalData) => {
  const response = await axios.post(
    "http://localhost:8080/api/demandes",
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

export const getSpecialites = () => {
  return API.get("/reference/specialites");
};

export const getSousSpecialites = (specialiteId) => {
  return API.get("/reference/sous_specialites", {
    params: { specialiteId },
  });
};
