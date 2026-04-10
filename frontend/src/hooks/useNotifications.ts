import { useEffect } from 'react';
import { useSocket } from './useSocket';
import { useNotificationStore } from '../stores/notificationStore';
import { useAuthStore } from '../stores/authStore';

export function useNotifications() {
  const { onNotification } = useSocket();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUnreadCount();

    const cleanup = onNotification((data) => {
      addNotification(data);
    });

    // Polling fallback every 30s
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [isAuthenticated]);
}
