import axios from "axios"
import { setupInterceptors } from "../utils/axiosInterceptor";

const API_URL = "http://localhost:8100/v1";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

setupInterceptors(apiClient);

export const getPlants = async () => {
  try {
    const response = await apiClient.get(`/plants/`);
    return response.data;
  } catch (error) {
    console.error("Lỗi alert:", error);
    return null
  }
}

export const createPlant = async (plantData) => {
  try {
    const response = await apiClient.post(`/plants/`, plantData);
    return response.data;
  } catch (error) {
    console.error("Lỗi tạo plant:", error);
  }
}
export const updatePlant = async (id,data) => {
  try {
    const response = await apiClient.put(`/plants/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Lỗi cập nhật plant:", error);
  }
}

export const deletePlant = async (plantId) => { 
  try {
    const response = await apiClient.delete(`/plants/${plantId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi xóa plant:", error);
  }
}

export const getPreset = async (plantId) => {
  if (!plantId) {
    console.warn("plantId is required for getPreset");
    return null;
  }
  try {
    const response = await apiClient.get(`/presets/`, {
      params: { plantId }, 
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy preset:", error);
    return null
  }
}

export const createPreset = async (presetData) => {
  try {
    const response = await apiClient.post(`/presets/`, presetData);
    return response.data;
  } catch (error) {
    console.error("Lỗi tạo preset:", error);
    throw error;
  }
}

export const updatePreset = async (id, data) => {
  try {
    const response = await apiClient.put(`/presets/${id}`, data);
    return response.data;
  } catch (error) { 
    console.error("Lỗi cập nhật preset:", error);
    return null
  }
}