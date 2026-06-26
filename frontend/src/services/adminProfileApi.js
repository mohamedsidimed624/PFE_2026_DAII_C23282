import axios from "axios";
import { API_BASE_URL } from "../config/api";

const BASE = `${API_BASE_URL}/api/admin/profile`;

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getMyProfile = () =>
  axios.get(`${BASE}/me`, auth());

export const updateMyProfile = (data) =>
  axios.put(`${BASE}/me`, data, auth());

export const uploadMyPhoto = (file) => {
  const form = new FormData();
  form.append("file", file);
  return axios.post(`${BASE}/me/photo`, form, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const changePassword = (data) =>
  axios.put(`${BASE}/me/password`, data, auth());
