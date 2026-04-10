import apiClient from './client';
import type { Notification, PaginatedResponse, ApiResponse } from '../types';

export const notificationsApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<PaginatedResponse<Notification>>('/notifications', { params }),

  markRead: (id: number) =>
    apiClient.put(`/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.put('/notifications/read-all'),

  unreadCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),
};
