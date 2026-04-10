import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { requestsApi } from '../../api/requests';
import type { ServiceRequest } from '../../types';
import { FileText, Clock, CheckCircle, ArrowRight, Package, AlertCircle, TrendingUp } from 'lucide-react';

export default function CustomerDashboard() {
  const user = useAuthStore((s) => s.user);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestsApi.list({ per_page: 10 }).then((res) => {
      setRequests(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    submitted: 'badge-info', docs_under_review: 'badge-warning', docs_rejected: 'badge-danger',
    in_progress: 'badge-info', completed: 'badge-success', pickup_ready: 'badge-success',
    delivered: 'badge-success', cancelled: 'badge-neutral',
  };

  const statusLabels: Record<string, string> = {
    submitted: 'Submitted', docs_under_review: 'Under Review', docs_rejected: 'Docs Rejected',
    in_progress: 'In Progress', completed: 'Completed', pickup_ready: 'Ready for Pickup',
    delivered: 'Delivered', cancelled: 'Cancelled',
  };

  const totalRequests = requests.length;
  const activeRequests = requests.filter(r => ['submitted', 'docs_under_review', 'in_progress'].includes(r.status)).length;
  const completedRequests = requests.filter(r => ['completed', 'delivered', 'pickup_ready'].includes(r.status)).length;
  const rejectedRequests = requests.filter(r => r.status === 'docs_rejected').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Namaste, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-white/70 text-lg">Aapke document services ka dashboard</p>
        <div className="mt-6 flex gap-4">
          <Link to={`/${user?.role}/services`} className="btn-accent inline-flex items-center gap-2">
            <Package className="w-5 h-5" /> New Service Request
          </Link>
        </div>
      </div>

      {/* Side-by-Side: Stats + Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT: Quick Stats Cards (Stacked) */}
        <div className="lg:col-span-4 space-y-4">
          {[
            { icon: FileText, label: 'Total Requests', value: totalRequests, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
            { icon: Clock, label: 'Active / In Progress', value: activeRequests, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
            { icon: CheckCircle, label: 'Completed', value: completedRequests, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
            { icon: AlertCircle, label: 'Needs Attention', value: rejectedRequests, color: 'bg-red-50 text-red-600', border: 'border-red-100' },
          ].map((stat) => (
            <div key={stat.label} className={`card flex items-center gap-4 border ${stat.border} hover:shadow-md transition-all`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} shrink-0`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}

          {/* Quick Actions */}
          <div className="card bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link to={`/${user?.role}/services`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors text-sm font-medium text-gray-700 group">
                <Package className="w-5 h-5 text-primary" />
                <span className="flex-1">New Service Request</span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
              </Link>
              <Link to={`/${user?.role}/vault`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors text-sm font-medium text-gray-700 group">
                <FileText className="w-5 h-5 text-primary" />
                <span className="flex-1">My Document Vault</span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
              </Link>
              <Link to={`/${user?.role}/notifications`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 transition-colors text-sm font-medium text-gray-700 group">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="flex-1">View Notifications</span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT: Recent Requests Table */}
        <div className="lg:col-span-8">
          <div className="card lg:min-h-[500px]">
            <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Recent Requests</h2>
              <Link to={`/${user?.role}/services`} className="text-primary font-medium text-sm hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Koi request nahi hai abhi</p>
                <Link to={`/${user?.role}/services`} className="btn-primary mt-4 inline-block">
                  Pehli Request Banayein
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Tracking ID</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Service</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase hidden md:table-cell">Date</th>
                      <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <Link to={`/${user?.role}/requests/${req.id}`} className="text-primary font-semibold hover:underline">
                            {req.tracking_id}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-gray-700 text-sm">{req.service?.name}</td>
                        <td className="py-3 px-4">
                          <span className={statusColors[req.status] || 'badge-neutral'}>{statusLabels[req.status] || req.status}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-sm hidden md:table-cell">{new Date(req.created_at).toLocaleDateString('en-IN')}</td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900">₹{req.price_charged}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
