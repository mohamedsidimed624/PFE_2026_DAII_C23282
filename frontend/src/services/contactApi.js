import axios from "axios";

const API_URL = "http://localhost:8080/api/public/contact";

export const createContactMessage = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};
