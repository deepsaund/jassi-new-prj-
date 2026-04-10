import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, staffApi } from '../../api/admin';
import type { ServiceRequest } from '../../types';
import { Search, Eye, FileText } from 'lucide-react';

interface Props {
  portalType: 'admin' | 'staff';
}

export default function RequestReview({ portalType }: Props) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchRequests = () => {
    setLoading(true);
    const api = portalType === 'staff' ? staffApi.getRequests : adminApi.getRequests;
    api({ search, status: statusFilter || undefined, page, per_page: 10 }).then((res) => {
      setRequests(res.data.data);
      setLastPage(res.data.last_page);
      setLoading(false);
    });
  };

  useEffect(() => { fetchRequests(); }, [search, statusFilter, page]);

  const statusColors: Record<string, string> = {
    submitted: 'badge-info', docs_under_review: 'badge-warning', docs_rejected: 'badge-danger',
    in_progress: 'badge-info', completed: 'badge-success', pickup_ready: 'badge-success',
    delivered: 'badge-success', cancelled: 'badge-neutral',
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Service Requests</h1>

      <div className="card">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search tracking ID or customer..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-10" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-full sm:w-48">
            <option value="">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="docs_under_review">Under Review</option>
            <option value="docs_rejected">Rejected</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12"><FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No requests found</p></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tracking ID</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Service</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Assigned</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-primary">{req.tracking_id}</td>
                      <td className="py-3 px-4 text-gray-700">{req.customer?.name}</td>
                      <td className="py-3 px-4 text-gray-700">{req.service?.name}</td>
                      <td className="py-3 px-4"><span className={statusColors[req.status] || 'badge-neutral'}>{req.status.replace(/_/g, ' ')}</span></td>
                      <td className="py-3 px-4 text-gray-500 text-sm">{req.claimed_by_user?.name || '-'}</td>
                      <td className="py-3 px-4 text-gray-500 text-sm">{new Date(req.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="py-3 px-4 text-right">
                        <Link to={`/${portalType}/requests/${req.id}`} className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100 inline-flex">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Page {page} of {lastPage}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
                <button onClick={() => setPage(Math.min(lastPage, page + 1))} disabled={page === lastPage} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
