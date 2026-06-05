import { apiRequest } from './apiClient';

export function getConversations() {
  return apiRequest<any>('/chat/conversations/');
}
