import { apiRequest } from './apiClient';

export function fetchStoreStatus() {
  return apiRequest<any>('/market/store/status/');
}

export function fetchMerchantAnalytics() {
  return apiRequest<any>('/market/merchant/analytics/');
}
