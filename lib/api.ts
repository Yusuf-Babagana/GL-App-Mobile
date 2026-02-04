import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Globalink App Backend IP
const API_URL = "http://192.168.1.20:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

/**
 * Request Interceptor
 * Automatically attaches the 'Token' keyword to headers.
 */
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");

  if (token) {
    // Yusuf: Changed to 'Bearer' to match the JWT token type being used
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const updateProfile = async (data: any) => {
  const response = await api.patch("/users/profile/", data);
  return response.data;
};

export default api;