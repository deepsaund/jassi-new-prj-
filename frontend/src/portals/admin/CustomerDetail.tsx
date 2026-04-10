import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import type { User, ServiceRequest, DocumentVault } from '../../types';
import { ArrowLeft, FileText, Archive, Phone, Mail, MapPin } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => window.history.back()} className="text-gray-400 hover:text-primary"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
      </div>

      {/* Customer Info */}
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
            <span className="badge-neutral uppercase">{customer.role}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" /> {customer.email}</div>
          <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" /> {customer.phone || '-'}</div>
          <div className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4" /> {customer.address || '-'}</div>
        </div>
      </div>

      {/* Requests */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" /> Service Requests ({requests.length})
        </h3>
        {requests.length === 0 ? (
          <p className="text-gray-500 py-4">No requests yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Service</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 font-semibold text-primary text-sm">{req.tracking_id}</td>
                    <td className="py-2 px-3 text-sm">{req.service?.name}</td>
                    <td className="py-2 px-3"><span className={statusColors[req.status] || 'badge-neutral'}>{req.status.replace(/_/g, ' ')}</span></td>
                    <td className="py-2 px-3 text-sm text-gray-500">{new Date(req.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="py-2 px-3 text-right text-sm font-medium">₹{req.price_charged}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vault */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Archive className="w-5 h-5" /> Document Vault ({vault.length})
        </h3>
        {vault.length === 0 ? (
          <p className="text-gray-500 py-4">No vault documents</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vault.map((doc) => (
              <div key={doc.id} className="p-3 rounded-xl bg-gray-50 flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{doc.document_name}</p>
                  <p className="text-xs text-gray-500">{doc.original_filename}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
