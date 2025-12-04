/* eslint-disable no-useless-catch */
// src/services/authService.js
import axios from "axios";
import { setupInterceptors } from '../utils/axiosInterceptor';

const API_URL = "http://localhost:8100/v1/"; // đổi nếu backend port khác

const apiClient = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true
});

setupInterceptors(apiClient);

export const login = async (email, password) => {
  try {
    const response = await apiClient.post("users/login", { email, password });
    
    if (response.data.user) {
      localStorage.setItem("userData", JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await apiClient.delete("users/logout");
    
    localStorage.removeItem("userData");
    localStorage.removeItem("lastFetchedDay");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const signup = async (userData) => {
  const response = await apiClient.post("users/register", userData);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await apiClient.post("users/password/forgot", { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await apiClient.post(`users/password/reset/${token}`, {
    password: newPassword,
  });
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await apiClient.get(`users/verify/${token}`);
  return response.data;
};

export const refreshToken = async () => {
  const response = await apiClient.get("users/refresh_token");
  return response.data;
};

export const updateUserProfile = (formData) =>
    apiClient.put("users/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
