import axios from "axios";

const API_URL = "http://localhost:8100/v1/sensors";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Gửi cookie trong mọi request
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

// 🟢 Lấy toàn bộ dữ liệu history
export const getHistoryDataChart = async (deviceId) => {
  // Token sẽ được tự động thêm bởi interceptor, không cần thêm thủ công
  const response = await apiClient.get(`/${deviceId}/data`);
  return response.data;
};

// 💡 Bật/tắt đèn
export const toggleLight = async (status) => {
  // Token sẽ được tự động thêm bởi interceptor
  const response = await apiClient.get("/", { status });
  console.log("Response data:", response.data);
  console.log("Control Mode:", response.data[0].controlMode);
  console.log("Type of Control Mode:", typeof response.data[0].relayState.fan);
  return response.data.controlMode;
};

// 🌬️ Bật/tắt quạt
export const toggleFan = async (status) => {
  // Token sẽ được tự động thêm bởi interceptor
  const response = await apiClient.patch("sensor/fan", { status });
  return response.data;
};

// 🔔 Lấy thông báo gần nhất
export const getLatestNotifications = async () => {
  // Token sẽ được tự động thêm bởi interceptor
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
