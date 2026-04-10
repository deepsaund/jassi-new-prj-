import { useEffect, useState } from 'react';
import { adminApi, staffApi } from '../../api/admin';
import type { AuditLog } from '../../types';
import { Activity, Search, Shield, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface Props {
  portalType: 'admin' | 'staff';
}

export default function AuditLogPage({ portalType }: Props) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const api = portalType === 'staff' ? staffApi.getAuditLogs : adminApi.getAuditLogs;
    api({ page, per_page: 20, search }).then((res) => {
      setLogs(res.data.data);
      setLastPage(res.data.last_page);
      setTotal(res.data.total || res.data.data.length);
      setLoading(false);
    });
  }, [page, search]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>

      {/* Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT: Filters & Info */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card sticky top-8 space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Entries</p>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                <Filter className="w-3 h-3 inline mr-1" /> Search Actions
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Filter logs..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-9 bg-white text-sm" />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-sm">
              <span className="text-gray-500">Page {page} of {lastPage}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(Math.min(lastPage, page + 1))} disabled={page === lastPage} className="p-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Log Entries */}
        <div className="lg:col-span-9">
          <div className="card lg:min-h-[500px]">
            {loading ? (
              <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16">
                <Activity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400">No audit logs found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100/80 hover:shadow-sm transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Activity className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
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
          </div>
        </div>
      </div>
    </div>
  );
}
