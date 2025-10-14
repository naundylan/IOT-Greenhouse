// src/services/dashboardService.js
import axios from 'axios';

const API_URL = '/api/v1/dashboard'; // Dùng đường dẫn tương đối để Vite Proxy hoạt động

const apiClient = axios.create({ baseURL: API_URL });

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

export const getDashboardData = () => {
    return apiClient.get('/overview');
};

// export const getMetrics = () => apiClient.get('/metrics');
// export const getNotifications = () => apiClient.get('/notifications');
// export const getChartData = () => apiClient.get('/chart-data?period=24h');