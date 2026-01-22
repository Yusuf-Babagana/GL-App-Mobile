import axios from "axios";
import * as SecureStore from "expo-secure-store";

// UPDATED IP
// REMOVE the space between // and 192
const API_URL = "http://192.168.1.254:8000/api";
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});


api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



export default api;