import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/api/public/reclamations`;

export const createPublicReclamation = async (data, file) => {
  const formData = new FormData();

  formData.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );

  if (file) {
    formData.append("file", file);
  }

  const res = await axios.post(API_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
