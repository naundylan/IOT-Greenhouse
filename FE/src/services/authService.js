// src/services/authService.js
import axios from "axios";
import { setupInterceptors } from '../utils/axiosInterceptor';

const API_URL = "http://localhost:8100/v1/"; // đổi nếu backend port khác

const apiClient = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

setupInterceptors(apiClient);

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

export const getCurrentUser = (request) => {
    return apiClient.post("users/verify", {
        email: request.email,
        token: request.token,
    });
};
