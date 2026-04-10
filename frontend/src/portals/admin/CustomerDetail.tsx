import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import type { User, ServiceRequest, DocumentVault } from '../../types';
import { ArrowLeft, FileText, Archive, Phone, Mail, MapPin, Calendar, IndianRupee } from 'lucide-react';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<User | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [vault, setVault] = useState<DocumentVault[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    adminApi.getCustomerDetail(Number(id)).then((res) => {
      setCustomer(res.data.data.user);
      setRequests(res.data.data.requests);
      setVault(res.data.data.vault);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;
  if (!customer) return <div className="card text-center py-12 text-gray-500">Customer not found</div>;

  const statusColors: Record<string, string> = {
    submitted: 'badge-info', docs_under_review: 'badge-warning', docs_rejected: 'badge-danger',
    in_progress: 'badge-info', completed: 'badge-success', delivered: 'badge-success',
  };

  const totalSpent = requests.reduce((sum, r) => sum + Number(r.price_charged || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => window.history.back()} className="text-gray-400 hover:text-primary transition-colors"><ArrowLeft className="w-6 h-6" /></button>
        <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
      </div>

      {/* Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT: Customer Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card sticky top-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary text-3xl font-bold mb-3 shadow-inner">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
              <span className="badge-neutral uppercase mt-1">{customer.role}</span>
            </div>

            <div className="space-y-4 text-sm border-t border-gray-100 pt-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{customer.phone || '-'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{customer.address || '-'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span>Joined {new Date(customer.created_at).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-gray-100">
              <div className="text-center p-3 bg-primary/5 rounded-xl">
                <p className="text-2xl font-bold text-primary">{requests.length}</p>
                <p className="text-xs text-gray-500 uppercase">Requests</p>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-xl">
                <p className="text-lg font-bold text-emerald-700">₹{totalSpent.toLocaleString()}</p>
                <p className="text-xs text-gray-500 uppercase">Total Spent</p>
              </div>
            </div>
          </div>

          {/* Document Vault */}
          <div className="card">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
              <Archive className="w-4 h-4 text-gray-400" /> Document Vault ({vault.length})
            </h3>
            {vault.length === 0 ? (
              <p className="text-gray-400 text-sm py-3">No vault documents</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {vault.map((doc) => (
                  <div key={doc.id} className="p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors flex items-center gap-3">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{doc.document_name}</p>
                      <p className="text-xs text-gray-400 truncate">{doc.original_filename}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Requests Table */}
        <div className="lg:col-span-8">
          <div className="card lg:min-h-[500px]">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide border-b border-gray-100 pb-3">
              <FileText className="w-4 h-4 text-gray-400" /> Service Requests ({requests.length})
            </h3>
            {requests.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">No requests yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase">Tracking ID</th>
                      <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase">Service</th>
                      <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                      <th className="text-left py-3 px-3 text-xs font-bold text-gray-500 uppercase">Date</th>
                      <th className="text-right py-3 px-3 text-xs font-bold text-gray-500 uppercase">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-3 font-semibold text-primary text-sm">{req.tracking_id}</td>
                        <td className="py-3 px-3 text-sm text-gray-700">{req.service?.name}</td>
                        <td className="py-3 px-3"><span className={statusColors[req.status] || 'badge-neutral'}>{req.status.replace(/_/g, ' ')}</span></td>
                        <td className="py-3 px-3 text-sm text-gray-500">{new Date(req.created_at).toLocaleDateString('en-IN')}</td>
                        <td className="py-3 px-3 text-right text-sm font-bold text-gray-900">₹{req.price_charged}</td>
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
