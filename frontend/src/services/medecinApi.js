import axios from "axios";

const API_URL = "http://localhost:8080/api/medecin";

export const getMyProfile = async () => {
  const token = localStorage.getItem("token");

  return await axios.get(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
