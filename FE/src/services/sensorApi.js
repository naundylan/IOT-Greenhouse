import axios from "axios";

const API_URL = "http://localhost:8100/v1/";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🟢 Lấy toàn bộ dữ liệu dashboard (sensor + thiết bị + thông báo)
export const getDashboardData = async () => {
  const token = localStorage.getItem("userToken");
  const response = await apiClient.get("sensor/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// 💡 Bật/tắt đèn
export const toggleLight = async (status) => {
  const token = localStorage.getItem("userToken");
  const response = await apiClient.patch(
    "sensor/light",
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// 🌬️ Bật/tắt quạt
export const toggleFan = async (status) => {
  const token = localStorage.getItem("userToken");
  const response = await apiClient.patch(
    "sensor/fan",
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// 🔔 Lấy thông báo gần nhất
export const getLatestNotifications = async () => {
  const token = localStorage.getItem("userToken");
  const response = await apiClient.get("notifications/latest", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
