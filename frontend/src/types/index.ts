export type UserRole = 'admin' | 'staff' | 'customer' | 'b2b';

export type RequestStatus =
  | 'submitted'
  | 'docs_under_review'
  | 'docs_rejected'
  | 'in_progress'
  | 'completed'
  | 'pickup_ready'
  | 'delivered'
  | 'cancelled';

export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  address: string | null;
  avatar: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  customer_price: string;
  b2b_price: string;
  estimated_days: number | null;
  is_active: boolean;
  document_types: ServiceDocumentType[];
  created_at: string;
}

export interface ServiceDocumentType {
  id: number;
  service_id: number;
  document_name: string;
  description: string | null;
  is_mandatory: boolean;
  accepted_formats: string;
  max_size_mb: number;
  sort_order: number;
}

export interface DocumentVault {
  id: number;
  user_id: number;
  document_name: string;
  file_path: string;
  original_filename: string;
  mime_type: string;
  file_size_kb: number;
  created_at: string;
}

export interface ServiceRequest {
  id: number;
  tracking_id: string;
  service_id: number;
  customer_id: number;
  created_by: number | null;
  claimed_by: number | null;
  claimed_at: string | null;
  status: RequestStatus;
  price_charged: string;
  delivery_type: 'pickup' | 'courier' | 'digital' | null;
  is_on_behalf: boolean;
  output_file_path: string | null;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  service?: Service;
  customer?: User;
  claimed_by_user?: User;
  documents?: RequestDocument[];
  status_history?: RequestStatusHistory[];
}

export interface RequestDocument {
  id: number;
  service_request_id: number;
  service_doc_type_id: number;
  vault_document_id: number | null;
  file_path: string;
  original_filename: string;
  mime_type: string;
  status: DocumentStatus;
  rejection_reason: string | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  auto_approved: boolean;
  document_type?: ServiceDocumentType;
  created_at: string;
}

export interface RequestStatusHistory {
  id: number;
  service_request_id: number;
  from_status: string | null;
  to_status: string;
  changed_by: number;
  notes: string | null;
  created_at: string;
  changer?: User;
}

export interface ChatMessage {
  id: number;
  service_request_id: number;
  sender_id: number;
  message: string;
  attachment_path: string | null;
  is_read: boolean;
  created_at: string;
  sender?: User;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  reference_type: string | null;
  reference_id: number | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
  user?: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface DashboardStats {
  total_requests: number;
  pending_requests: number;
  in_progress_requests: number;
  completed_requests: number;
  total_customers: number;
  total_revenue: number;
  requests_by_status: Record<string, number>;
  popular_services: { name: string; count: number }[];
  recent_requests: ServiceRequest[];
  daily_trend: { date: string; count: number }[];
}
