import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Globalink App Backend IP
const API_URL = "https://glappbackend.pythonanywhere.com/api";

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
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const updateProfile = async (data: any) => {
  const response = await api.patch("/users/profile/", data);
  return response.data;
};

export default api;