// src/services/authService.js
import axios from "axios";

const API_URL = "http://localhost:8100/v1/"; // đổi nếu backend port khác

const apiClient = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
});

// ✅ Gắn access token nếu có
// apiClient.interceptors.request.use((config) => {
//     const token = localStorage.getItem("accessToken");
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
// });

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("userToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


// ✅ Các API
export const registerUser = (data) => apiClient.post("users/register", data);
export const loginUser = (data) => apiClient.post("users/login", data);
export const logoutUser = () => apiClient.delete("users/logout");
export const forgotPassword = (data) => apiClient.post("users/password/forgot", data);
export const resetPassword = (resetData) => {
    return apiClient.post('users/password/reset', resetData);
};

export const updateUserProfile = (formData) =>
    apiClient.put("users/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const refreshToken = () => apiClient.get("users/refresh_token");

export const getCurrentUser = (request) => {
    return apiClient.post("users/verify", {
        email: request.email,
        token: request.token,
    });
};
