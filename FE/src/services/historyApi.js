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
export const getHistoryByDate = async (date) => {
  // Giả sử backend có thể nhận query ?date=YYYY-MM-DD
  const token = localStorage.getItem("userToken");
  const response = await apiClient.get(`/history`, {
    params: { date },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
// ✅ Xuất báo cáo lịch sử (PDF/CSV)
