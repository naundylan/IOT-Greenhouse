// src/services/historyApi.js
import axios from "axios";

const API_URL = "http://localhost:8100/v1";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Lấy danh sách dữ liệu lịch sử theo ngày (hoặc toàn bộ)
export const getHistoryByDate = async (deviceId,day) => {
  try {
    const token = localStorage.getItem("userToken");
    const res = await apiClient.get(`/sensors/${deviceId}/data/hourly`, {
      params: { day }, // ví dụ BE hỗ trợ query ?day=2025-10-26
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy dữ liệu lịch sử:", err);
    return [];
  }
};
// ✅ Xuất báo cáo lịch sử (PDF/CSV)
export const getExportHistoryByDate = async (deviceId,day) => {
  try {
    const token = localStorage.getItem("userToken");
    const res = await apiClient.get(`/sensors/${deviceId}/data/export`, {
      params: { day }, // ví dụ BE hỗ trợ query ?day=2025-10-26
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob"
    });
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy dữ liệu lịch sử alert:", err);
    return [];
  }
};

// ✅ Lấy danh sách dữ liệu lịch sử alert
export const getHistoryAlertData = async () => {
  try {
    const token = localStorage.getItem("userToken");
    const res = await apiClient.get("/history", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy dữ liệu lịch sử alert:", err);
    return [];
  }
};
