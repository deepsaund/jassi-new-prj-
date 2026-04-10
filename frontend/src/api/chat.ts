import apiClient from './client';
import type { ChatMessage, ApiResponse } from '../types';

export const chatApi = {
  getMessages: (requestId: number, params?: { cursor?: number; limit?: number }) =>
    apiClient.get<ApiResponse<{ messages: ChatMessage[]; next_cursor: number | null }>>(`/chat/${requestId}/messages`, { params }),

  sendMessage: (requestId: number, data: FormData) =>
    apiClient.post<ApiResponse<ChatMessage>>(`/chat/${requestId}/messages`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
