import * as SecureStore from 'expo-secure-store';
import { debug } from './debug';

const TOKEN_KEY = 'auth_token';
const API_HOST = 'https://glappbackend.pythonanywhere.com/api';

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string) {
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const reqId = debug.api.request(path, options.method || 'GET', !!token);

  let response: Response;
  try {
    response = await fetch(`${API_HOST}${path}`, { ...options, headers });
  } catch (fetchErr: any) {
    debug.api.error(reqId, `NETWORK: ${fetchErr.message}`);
    throw fetchErr;
  }

  if (response.status === 401) {
    debug.api.response(reqId, 401, '(401 — clearing token)');
    await clearToken();
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const body = await response.text();
    debug.api.response(reqId, response.status, body.slice(0, 200));
    throw new Error(body || `Request failed (${response.status})`);
  }

  const json = await response.json();
  debug.api.response(reqId, response.status, json);
  return json;
}
