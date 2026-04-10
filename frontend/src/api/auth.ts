import apiClient from './client';
import type { User, ApiResponse } from '../types';

export const authApi = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string; phone?: string; role?: string }) =>
    apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data),

  logout: () => apiClient.post('/auth/logout'),

  me: () => apiClient.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    apiClient.put<ApiResponse<User>>('/auth/profile', data),

  updatePassword: (data: { current_password: string; password: string; password_confirmation: string }) =>
    apiClient.put('/auth/password', data),
};
