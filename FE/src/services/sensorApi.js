import axios from "axios";
import { setupInterceptors } from '../utils/axiosInterceptor';

const API_URL = "http://localhost:8100/v1/sensors";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

setupInterceptors(apiClient);

// 🟢 Lấy toàn bộ dữ liệu history
export const getHistoryDataChart = async (deviceId) => {
  const response = await apiClient.get(`/${deviceId}/data`);
  return response.data;
};


export const getDeviceStatus = async () => {
  try {
    const response = await apiClient.get(``);
    return response.data; 
  } catch (error) {
    console.error("Lỗi lấy trạng thái:", error);
    return null;
  }
};

// 🌬️ Bật/tắt quạt
export const toggleFan = async (status) => {
  const response = await apiClient.patch("sensor/fan", { status });
  return response.data;
};

// 🔔 Lấy thông báo gần nhất
export const getLatestNotifications = async () => {
  const response = await apiClient.get("notifications/latest");
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
