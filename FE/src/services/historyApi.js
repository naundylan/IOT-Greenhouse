// src/services/historyApi.js
import axios from "axios";

const API_URL = "http://localhost:8100/v1";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Gửi cookie trong mỗi request
});

// Interceptor để gửi token từ localStorage (backup nếu cookie không hoạt động)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Lấy danh sách dữ liệu lịch sử theo ngày (hoặc toàn bộ)
export const getHistoryByDate = async (deviceId, day) => {
  try {
    // Token sẽ được tự động thêm bởi interceptor
    const res = await apiClient.get(`/sensors/${deviceId}/data/hourly`, {
      params: { day }, // ví dụ BE hỗ trợ query ?day=2025-10-26
    });
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy dữ liệu lịch sử:", err);
    return [];
  }
};
// ✅ Xuất báo cáo lịch sử (PDF/CSV)
export const getExportHistoryByDate = async (deviceId, day) => {
  try {
    // Token sẽ được tự động thêm bởi interceptor
    const res = await apiClient.get(`/sensors/${deviceId}/data/export`, {
      params: { day }, // ví dụ BE hỗ trợ query ?day=2025-10-26
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
    // Token sẽ được tự động thêm bởi interceptor
    const res = await apiClient.get("/history");
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy dữ liệu lịch sử alert:", err);
    return [];
  }
};
