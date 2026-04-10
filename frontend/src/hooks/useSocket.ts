import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

const SOCKET_URL = 'http://localhost:3001';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const joinRequest = useCallback((requestId: number) => {
    socketRef.current?.emit('join:request', requestId);
  }, []);

  const leaveRequest = useCallback((requestId: number) => {
    socketRef.current?.emit('leave:request', requestId);
  }, []);

  const onChatMessage = useCallback((handler: (data: any) => void) => {
    socketRef.current?.on('chat:message', handler);
    return () => {
      socketRef.current?.off('chat:message', handler);
    };
  }, []);

  const onNotification = useCallback((handler: (data: any) => void) => {
    socketRef.current?.on('notification:new', handler);
    return () => {
      socketRef.current?.off('notification:new', handler);
    };
  }, []);

  const onQueueUpdate = useCallback((handler: (data: any) => void) => {
    socketRef.current?.on('queue:claimed', handler);
    socketRef.current?.on('queue:unclaimed', handler);
    return () => {
      socketRef.current?.off('queue:claimed', handler);
      socketRef.current?.off('queue:unclaimed', handler);
    };
  }, []);

  return { socket: socketRef, joinRequest, leaveRequest, onChatMessage, onNotification, onQueueUpdate };
}
