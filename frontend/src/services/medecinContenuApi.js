import axios from "axios";
import { API_BASE_URL } from "../config/api";

const BASE = `${API_BASE_URL}/api/medecin/contenus`;
const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getMedecinContenus = (page = 0, size = 10) =>
  axios.get(BASE, { params: { page, size }, ...auth() });
