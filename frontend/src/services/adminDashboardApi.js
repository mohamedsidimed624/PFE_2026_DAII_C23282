import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getAdminDashboardStats = async () => {
  const res = await axios.get(`${API_URL}/api/admin/dashboard/stats`, authConfig());
  return res.data;
};
