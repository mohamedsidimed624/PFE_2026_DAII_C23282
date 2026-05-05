// import axios from "axios";

// const API_URL = "http://localhost:8080/api/public/annuaire";

// export const getPublicMedecins = async ({
//   nom = "",
//   prenom = "",
//   numeroInscription = "",
//   specialite = "",
//   ville = "",
//   page = 0,
//   size = 6,
//   sort = "alpha",
// } = {}) => {
//   const params = {
//     page,
//     size,
//     sort,
//   };

//   if (nom?.trim()) {
//     params.nom = nom.trim();
//   }

//   if (prenom?.trim()) {
//     params.prenom = prenom.trim();
//   }

//   if (numeroInscription?.trim()) {
//     params.numeroInscription = numeroInscription.trim();
//   }

//   if (specialite?.trim() && specialite !== "Toutes spécialités") {
//     params.specialite = specialite;
//   }

//   if (ville?.trim() && ville !== "Toutes les villes") {
//     params.ville = ville;
//   }

//   const res = await axios.get(`${API_URL}/medecins`, { params });
//   return res.data;
// };

// export const getPublicMedecinById = async (id) => {
//   const res = await axios.get(`${API_URL}/medecins/${id}`);
//   return res.data;
// };

import axios from "axios";

const API_URL = "http://localhost:8080/api/public/annuaire";

export const getPublicMedecins = async (params = {}) => {
  const res = await axios.get(`${API_URL}/medecins`, {
    params,
  });
  return res.data;
};

export const getPublicMedecinById = async (id) => {
  const res = await axios.get(`${API_URL}/medecins/${id}`);
  return res.data;
};

export const getPublicSpecialites = async () => {
  const res = await axios.get("http://localhost:8080/api/public/specialites");
  return res.data;
};