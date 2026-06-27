import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/api/public/contenus`;

export const getPublicContenus = async ({
  page = 0,
  size = 9,
  type = "",
  categorieId = "",
  search = "",
} = {}) => {
  const params = { page, size };

  if (type) params.type = type;
  if (categorieId) params.categorieId = categorieId;
  if (search) params.search = search;

  const response = await axios.get(API_URL, { params });
  return response.data;
};

export const getPublicContenuById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// export const getPublicContenus = async ({
//   page = 0,
//   size = 9,
//   type = "",
//   categorieId = null,
//   search = "",
// }) => {
//   const response = await axios.get(`${API_BASE_URL}/api/public/contenus`, {
//     params: {
//       page,
//       size,
//       type: type || null,
//       categorieId,
//       search: search || null,
//     },
//   });

//   return response.data;
// };

// export const getPublicContenuById = async (id) => {
//   const response = await axios.get(`${API_BASE_URL}/api/public/contenus/${id}`);
//   return response.data;
// };
