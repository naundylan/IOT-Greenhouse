import axios from 'axios';

const API_URL = "http://localhost:8100/v1/"; // đổi nếu backend port khác

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
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

export const updateUserProfile = (profileData) => {
    return apiClient.put('/update', profileData); 
};

export const changePassword = (passwordData) => {
    return apiClient.post('/change-password', passwordData);
};