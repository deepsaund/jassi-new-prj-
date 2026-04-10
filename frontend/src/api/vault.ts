import apiClient from './client';
import type { DocumentVault, PaginatedResponse, ApiResponse } from '../types';

export const vaultApi = {
  list: (params?: Record<string, any>) =>
    apiClient.get<PaginatedResponse<DocumentVault>>('/vault', { params }),

  upload: (data: FormData) =>
    apiClient.post<ApiResponse<DocumentVault>>('/vault', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: number) =>
    apiClient.delete(`/vault/${id}`),

  suggest: (serviceId: number) =>
    apiClient.get<ApiResponse<DocumentVault[]>>(`/vault/suggest/${serviceId}`),
};
