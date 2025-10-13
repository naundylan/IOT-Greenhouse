import axios from 'axios';

const API_URL = '/api/v1/dashboard';

// Tạo một instance của axios
const apiClient = axios.create({
    baseURL: API_URL,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getDashboardData = () => {
    // Giả sử backend có một endpoint trả về tất cả dữ liệu cần thiết
    return apiClient.get('/dashboard-data'); 
};

// Nếu backend tách ra nhiều endpoint nhỏ, bạn có thể tạo các hàm riêng:
// export const getMetrics = () => apiClient.get('/metrics');
// export const getNotifications = () => apiClient.get('/notifications');
// export const getChartData = () => apiClient.get('/chart-data?period=24h');