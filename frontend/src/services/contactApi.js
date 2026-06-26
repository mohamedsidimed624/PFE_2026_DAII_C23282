import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/api/public/contact`;

export const createContactMessage = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};
