import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Globalink App Backend IP
const API_URL = "http://172.20.10.7:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/**
 * Request Interceptor
 * Automatically attaches the 'Token' keyword to headers.
 */
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");

  if (token) {
    // Yusuf: Changed from 'Bearer' to 'Token' to match Django TokenAuthentication
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;