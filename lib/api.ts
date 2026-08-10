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

let unauthorizedHandler: (() => void) | null = null;

/**
 * Lets AuthContext register its logout() here, since this module has no
 * access to React context/navigation directly.
 */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

/**
 * Silent token refresh.
 *
 * Access tokens are short-lived (1 day) while the refresh token lasts 7 days.
 * Rather than force a full logout the moment an access token expires, use
 * the refresh token to get a new one and transparently retry the failed
 * request. Concurrent 401s that arrive while a refresh is already in flight
 * are queued and resolved together so we never fire more than one refresh
 * call at a time.
 */
let isRefreshing = false;
let refreshWaiters: ((token: string | null) => void)[] = [];

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await SecureStore.getItemAsync("refreshToken");
  if (!refreshToken) return null;
  try {
    const response = await axios.post(`${API_URL}/users/token/refresh/`, { refresh: refreshToken });
    const newAccessToken = response.data?.access;
    if (!newAccessToken) return null;
    await SecureStore.setItemAsync("accessToken", newAccessToken);
    await SecureStore.setItemAsync("auth_token", newAccessToken);
    return newAccessToken;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { config, response } = error;
    const isAuthEndpoint = config?.url?.includes('/users/login/') || config?.url?.includes('/users/token/refresh/');

    if (response?.status !== 401 || !config || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (config._retry) {
      // Already retried once with a freshly refreshed token and still
      // unauthorized — the session is genuinely dead, log out.
      if (unauthorizedHandler) unauthorizedHandler();
      return Promise.reject(error);
    }
    config._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshWaiters.push((token) => {
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            resolve(api(config));
          } else {
            reject(error);
          }
        });
      });
    }

    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;
    refreshWaiters.forEach((notify) => notify(newToken));
    refreshWaiters = [];

    if (!newToken) {
      if (unauthorizedHandler) unauthorizedHandler();
      return Promise.reject(error);
    }

    config.headers.Authorization = `Bearer ${newToken}`;
    return api(config);
  }
);

export function useApi() {
  return api;
}

export const updateProfile = async (data: any) => {
  const response = await api.patch("/users/profile/", data);
  return response.data;
};

export default api;