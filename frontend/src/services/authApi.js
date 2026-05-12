import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

export const forgotPassword = (email) =>
  axios.post(`${API_URL}/forgot-password`, { email });

export const verifyActivationEmail = (token, email) =>
  axios.post(`${API_URL}/verify-activation-email`, { token, email });
