import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = API_BASE_URL;

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getAdminDashboardStats = async () => {
  const res = await axios.get(`${API_URL}/api/admin/dashboard/stats`, authConfig());
  return res.data;
};
