import axios from "axios";
import * as SecureStore from "expo-secure-store";

// YOUR EXACT IP ADDRESS
const API_URL = "http://172.20.10.7:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds timeout
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;