import { apiRequest } from './apiClient';

export function fetchProfile() {
  return apiRequest<any>('/users/profile/');
}
