import apiClient from './client';
import type { ServiceRequest, PaginatedResponse, ApiResponse } from '../types';

export const requestsApi = {
  create: (data: FormData) =>
    apiClient.post<ApiResponse<ServiceRequest>>('/requests', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  list: (params?: Record<string, any>) =>
    apiClient.get<PaginatedResponse<ServiceRequest>>('/requests', { params }),

  get: (id: number) =>
    apiClient.get<ApiResponse<ServiceRequest>>(`/requests/${id}`),

  reupload: (id: number, data: FormData) =>
    apiClient.post<ApiResponse<ServiceRequest>>(`/requests/${id}/reupload`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  downloadOutput: (id: number) =>
    apiClient.get(`/requests/${id}/output/download`, { responseType: 'blob' }),
};
