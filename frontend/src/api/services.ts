import apiClient from './client';
import type { Service, PaginatedResponse, ApiResponse } from '../types';

export const servicesApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<PaginatedResponse<Service>>('/services', { params }),

  get: (id: number) =>
    apiClient.get<ApiResponse<Service>>(`/services/${id}`),
};
