import axios from "axios";

const API_URL = "http://localhost:8100/v1/sensors";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🟢 Lấy toàn bộ dữ liệu history
export const getHistoryDataChart = async (deviceId) => {
  const token = localStorage.getItem("userToken");
  const response = await apiClient.get(`/${deviceId}/data`, {
    headers: { Authorization: `Bearer ${token}` }
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
// 📊 Lấy dữ liệu lịch sử theo ngày
export const getHistoryData = async (date) => {
  try {
    const res = await apiClient.get(`/sensors/history`, {
      params: { date }, // ví dụ BE hỗ trợ query ?date=2025-10-26
    });
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy dữ liệu lịch sử:", err);
    return [];
  }
};
