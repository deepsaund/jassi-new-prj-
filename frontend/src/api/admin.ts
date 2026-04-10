import apiClient from './client';
import type { Service, User, ServiceRequest, AuditLog, PaginatedResponse, ApiResponse, DashboardStats } from '../types';

export const adminApi = {
  // Services
  getServices: (params?: Record<string, any>) =>
    apiClient.get<PaginatedResponse<Service>>('/admin/services', { params }),
  createService: (data: Record<string, any>) =>
    apiClient.post<ApiResponse<Service>>('/admin/services', data),
  updateService: (id: number, data: Record<string, any>) =>
    apiClient.put<ApiResponse<Service>>(`/admin/services/${id}`, data),
  deleteService: (id: number) =>
    apiClient.delete(`/admin/services/${id}`),

  // Users
  getUsers: (params?: Record<string, any>) =>
    apiClient.get<PaginatedResponse<User>>('/admin/users', { params }),
  createUser: (data: Record<string, any>) =>
    apiClient.post<ApiResponse<User>>('/admin/users', data),
  updateUser: (id: number, data: Record<string, any>) =>
    apiClient.put<ApiResponse<User>>(`/admin/users/${id}`, data),
  deleteUser: (id: number) =>
    apiClient.delete(`/admin/users/${id}`),

  // Requests
  getRequests: (params?: Record<string, any>) =>
    apiClient.get<PaginatedResponse<ServiceRequest>>('/admin/requests', { params }),
  getRequest: (id: number) =>
    apiClient.get<ApiResponse<ServiceRequest>>(`/admin/requests/${id}`),
  reviewDocuments: (id: number, data: { documents: { id: number; status: string; rejection_reason?: string }[] }) =>
    apiClient.put(`/admin/requests/${id}/review`, data),
  requestReupload: (id: number) =>
    apiClient.post(`/admin/requests/${id}/request-reupload`),
  completeRequest: (id: number, data: FormData) =>
    apiClient.put(`/admin/requests/${id}/complete`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  setDelivery: (id: number, data: { delivery_type: string }) =>
    apiClient.put(`/admin/requests/${id}/delivery`, data),

  // Queue
  getQueue: (params?: Record<string, any>) =>
    apiClient.get<PaginatedResponse<ServiceRequest>>('/admin/queue', { params }),
  claimRequest: (id: number) =>
    apiClient.post(`/admin/queue/${id}/claim`),
  unclaimRequest: (id: number) =>
    apiClient.post(`/admin/queue/${id}/unclaim`),

  // Dashboard
  getDashboard: () =>
    apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard'),

  // Audit
  getAuditLogs: (params?: Record<string, any>) =>
    apiClient.get<PaginatedResponse<AuditLog>>('/admin/audit', { params }),
  getStaffAudit: (userId: number, params?: Record<string, any>) =>
    apiClient.get<PaginatedResponse<AuditLog>>(`/admin/audit/staff/${userId}`, { params }),
  getRequestAudit: (requestId: number) =>
    apiClient.get<PaginatedResponse<AuditLog>>(`/admin/audit/request/${requestId}`),

  // Customer detail
  getCustomerDetail: (id: number) =>
    apiClient.get<ApiResponse<{ user: User; requests: ServiceRequest[]; vault: any[] }>>(`/admin/customers/${id}/detail`),

  // Workflow
  createCustomer: (data: Record<string, any>) =>
    apiClient.post<ApiResponse<User>>('/admin/workflow/create-customer', data),
  createOnBehalfRequest: (data: FormData) =>
    apiClient.post<ApiResponse<ServiceRequest>>('/admin/workflow/on-behalf-request', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Staff API - same structure but scoped endpoints
export const staffApi = {
  getQueue: (params?: Record<string, any>) =>
    apiClient.get<PaginatedResponse<ServiceRequest>>('/staff/queue', { params }),
  claimRequest: (id: number) =>
    apiClient.post(`/staff/queue/${id}/claim`),
  getRequests: (params?: Record<string, any>) =>
    apiClient.get<PaginatedResponse<ServiceRequest>>('/staff/requests', { params }),
  getAuditLogs: (params?: Record<string, any>) =>
    apiClient.get<PaginatedResponse<AuditLog>>('/staff/audit', { params }),
  getDashboard: () =>
    apiClient.get<ApiResponse<DashboardStats>>('/staff/dashboard'),
};
