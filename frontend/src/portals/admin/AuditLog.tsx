import { useEffect, useState } from 'react';
import { adminApi, staffApi } from '../../api/admin';
import type { AuditLog } from '../../types';
import { Activity, Search } from 'lucide-react';

interface Props {
  portalType: 'admin' | 'staff';
}

export default function AuditLogPage({ portalType }: Props) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const api = portalType === 'staff' ? staffApi.getAuditLogs : adminApi.getAuditLogs;
    api({ page, per_page: 20, search }).then((res) => {
      setLogs(res.data.data);
      setLastPage(res.data.last_page);
      setLoading(false);
    });
  }, [page, search]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>

      <div className="card">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search actions..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-10" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12"><Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No audit logs found</p></div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{log.user?.name || 'Unknown'}</p>
                    <span className="badge-neutral text-xs">{log.user?.role}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{log.action}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {log.entity_type} #{log.entity_id} | {new Date(log.created_at).toLocaleString('en-IN')}
                    {log.ip_address && ` | IP: ${log.ip_address}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">Page {page} of {lastPage}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
            <button onClick={() => setPage(Math.min(lastPage, page + 1))} disabled={page === lastPage} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
