import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data;
};

// export const setPassword = async (token, password, confirmPassword) => {
//   const response = await axios.post(`${API_URL}/set-password`, { token, password, confirmPassword });
//   return response.data;
// };
