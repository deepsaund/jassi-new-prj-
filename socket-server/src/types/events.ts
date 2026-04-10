export interface ServerToClientEvents {
  'chat:message': (data: ChatMessagePayload) => void;
  'notification:new': (data: NotificationPayload) => void;
  'queue:claimed': (data: { requestId: number; claimedBy: number }) => void;
  'queue:unclaimed': (data: { requestId: number }) => void;
  'request:status_changed': (data: { requestId: number; status: string }) => void;
}

export interface ClientToServerEvents {
  'chat:send': (data: { requestId: number; message: string }) => void;
  'chat:typing': (data: { requestId: number }) => void;
  'join:request': (requestId: number) => void;
  'leave:request': (requestId: number) => void;
}

export interface ChatMessagePayload {
  id: number;
  service_request_id: number;
  sender_id: number;
  sender_name: string;
  message: string;
  attachment_path: string | null;
  created_at: string;
}

export interface NotificationPayload {
  id: number;
  title: string;
  message: string;
  type: string;
  reference_type: string | null;
  reference_id: number | null;
  created_at: string;
}
