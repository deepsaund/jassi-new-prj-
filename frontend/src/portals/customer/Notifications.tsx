import { useEffect, useState } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import { Bell, CheckCheck, FileText, AlertCircle } from 'lucide-react';

export default function CustomerNotifications() {
  const { notifications, isLoading, fetchNotifications, markRead, markAllRead } = useNotificationStore();

  useEffect(() => { fetchNotifications({ per_page: 50 }); }, []);

  const typeIcons: Record<string, any> = {
    status_change: FileText,
    doc_reviewed: AlertCircle,
    reupload_requested: AlertCircle,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button onClick={markAllRead} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
          <CheckCheck className="w-4 h-4" /> Mark all read
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-16">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Koi notification nahi hai</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`card flex items-start gap-4 cursor-pointer transition-all hover:shadow-md ${!n.is_read ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!n.is_read ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${!n.is_read ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleString('en-IN')}</p>
                </div>
                {!n.is_read && <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-2"></div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
