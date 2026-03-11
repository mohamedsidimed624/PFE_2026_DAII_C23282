import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const createDemande = async (personalData) => {
  try {
    const response = await API.post("/demandes", personalData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message);
    }

    throw new Error("Erreur creation demande");
  }
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
