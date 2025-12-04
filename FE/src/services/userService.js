import axios from 'axios';
import { setupInterceptors } from '../utils/axiosInterceptor';

const API_URL = "http://localhost:8100/v1/"; // đổi nếu backend port khác

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, 
});

setupInterceptors(apiClient);

export const updateUserProfile = async (profileData) => {
    return await apiClient.put('/update', profileData); 
};

export const changePassword = async (passwordData) => {
    return await apiClient.post('/password/reset', passwordData);
};