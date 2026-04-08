import axios from "axios";

const API_URL = "http://localhost:8080/api/public/reclamations";

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
