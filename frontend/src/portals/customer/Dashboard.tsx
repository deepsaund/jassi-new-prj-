import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { requestsApi } from '../../api/requests';
import type { ServiceRequest } from '../../types';
import { FileText, Clock, CheckCircle, ArrowRight, Package } from 'lucide-react';

export default function CustomerDashboard() {
  const user = useAuthStore((s) => s.user);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestsApi.list({ per_page: 5 }).then((res) => {
      setRequests(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    submitted: 'badge-info',
    docs_under_review: 'badge-warning',
    docs_rejected: 'badge-danger',
    in_progress: 'badge-info',
    completed: 'badge-success',
    pickup_ready: 'badge-success',
    delivered: 'badge-success',
    cancelled: 'badge-neutral',
  };

  const statusLabels: Record<string, string> = {
    submitted: 'Submitted',
    docs_under_review: 'Under Review',
    docs_rejected: 'Docs Rejected',
    in_progress: 'In Progress',
    completed: 'Completed',
    pickup_ready: 'Ready for Pickup',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Namaste, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-white/70 text-lg">Aapke document services ka dashboard</p>
        <div className="mt-6 flex gap-4">
          <Link to={`/${user?.role}/services`} className="btn-accent inline-flex items-center gap-2">
            <Package className="w-5 h-5" /> New Service Request
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: FileText, label: 'Total Requests', value: requests.length, color: 'bg-blue-50 text-blue-600' },
          { icon: Clock, label: 'In Progress', value: requests.filter(r => ['submitted', 'docs_under_review', 'in_progress'].includes(r.status)).length, color: 'bg-amber-50 text-amber-600' },
          { icon: CheckCircle, label: 'Completed', value: requests.filter(r => ['completed', 'delivered', 'pickup_ready'].includes(r.status)).length, color: 'bg-emerald-50 text-emerald-600' },
        ].map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Requests */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Requests</h2>
          <Link to={`/${user?.role}/services`} className="text-primary font-medium text-sm hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Koi request nahi hai abhi</p>
            <Link to={`/${user?.role}/services`} className="btn-primary mt-4 inline-block">
              Pehli Request Banayein
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tracking ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Service</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <Link to={`/${user?.role}/requests/${req.id}`} className="text-primary font-semibold hover:underline">
                        {req.tracking_id}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{req.service?.name}</td>
                    <td className="py-3 px-4">
                      <span className={statusColors[req.status] || 'badge-neutral'}>{statusLabels[req.status] || req.status}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm">{new Date(req.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-semibold">₹{req.price_charged}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
