import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/api/auth`;

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

export const forgotPassword = (email) =>
  axios.post(`${API_URL}/forgot-password`, { email });

export const verifyActivationEmail = (token, email) =>
  axios.post(`${API_URL}/verify-activation-email`, { token, email });
