import axios from "axios";

const BASE = "http://localhost:8080/api/medecin/contenus";
const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getMedecinContenus = (page = 0, size = 10) =>
  axios.get(BASE, { params: { page, size }, ...auth() });
