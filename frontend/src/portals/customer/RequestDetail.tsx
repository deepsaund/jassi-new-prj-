import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { requestsApi } from '../../api/requests';
import type { ServiceRequest } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import {
  CheckCircle, Circle, Clock, AlertCircle, Upload, Download,
  MessageSquare, FileText, ArrowLeft, Loader2, Package
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'submitted', label: 'Submitted', icon: FileText },
  { key: 'docs_under_review', label: 'Docs Under Review', icon: Clock },
  { key: 'in_progress', label: 'In Progress', icon: Clock },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const STATUS_ORDER = ['submitted', 'docs_under_review', 'docs_rejected', 'in_progress', 'completed', 'pickup_ready', 'delivered'];

export default function RequestDetail() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const portalPrefix = `/${user?.role}`;

  useEffect(() => {
    if (!id) return;
    requestsApi.get(Number(id)).then((res) => {
      setRequest(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;
  }

  if (!request) {
    return <div className="card text-center py-12 text-gray-500">Request not found</div>;
  }

  const currentStepIndex = STATUS_ORDER.indexOf(request.status);
  const isRejected = request.status === 'docs_rejected';

  const statusColors: Record<string, string> = {
    submitted: 'badge-info', docs_under_review: 'badge-warning', docs_rejected: 'badge-danger',
    in_progress: 'badge-info', completed: 'badge-success', pickup_ready: 'badge-success',
    delivered: 'badge-success', cancelled: 'badge-neutral',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to={`${portalPrefix}/dashboard`} className="text-gray-400 hover:text-primary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{request.tracking_id}</h1>
          <p className="text-gray-500">{request.service?.name}</p>
        </div>
        <span className={statusColors[request.status] || 'badge-neutral'}>
          {request.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      </div>

      {/* Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* LEFT: Documents & Re-upload (Wider) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Documents */}
          <div className="card lg:min-h-[400px]">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Documents</h2>
            <div className="space-y-3">
              {request.documents?.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                    doc.status === 'approved' ? 'border-emerald-200 bg-emerald-50/60' :
                    doc.status === 'rejected' ? 'border-red-200 bg-red-50/60' :
                    'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`w-5 h-5 shrink-0 ${
                      doc.status === 'approved' ? 'text-emerald-600' :
                      doc.status === 'rejected' ? 'text-red-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{doc.document_type?.document_name}</p>
                      <p className="text-xs text-gray-500">{doc.original_filename}</p>
                      {doc.rejection_reason && (
                        <p className="text-xs text-red-600 mt-1 font-medium">⚠️ {doc.rejection_reason}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full mt-2 sm:mt-0 ${
                    doc.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>

            {/* Re-upload for rejected docs */}
            {isRejected && request.documents?.some((d) => d.status === 'rejected') && (
              <div className="mt-6 pt-5 border-t border-gray-200">
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <Upload className="w-5 h-5" /> Re-upload Rejected Documents
                  </p>
                  <p className="text-sm text-red-600 mb-4">
                    Sirf rejected documents dubara upload karein. Approved documents safe hain.
                  </p>
                  <button className="btn-primary flex items-center gap-2 bg-red-600 hover:bg-red-700">
                    <Upload className="w-4 h-4" /> Re-upload Documents
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Download Output */}
          {request.output_file_path && ['completed', 'delivered'].includes(request.status) && (
            <div className="card bg-gradient-to-br from-emerald-50 to-transparent border-emerald-200 shadow-lg shadow-emerald-500/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-emerald-800 text-lg">🎉 Document Ready!</h3>
                  <p className="text-sm text-emerald-600">Aapka completed document download ke liye ready hai</p>
                </div>
                <button
                  onClick={() => requestsApi.downloadOutput(request.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-md shadow-emerald-500/20"
                >
                  <Download className="w-5 h-5" /> Download
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Status Timeline & Info (Narrower) */}
        <div className="space-y-6">
          {/* Status Tracker */}
          <div className="card">
            <h2 className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wide border-b border-gray-100 pb-3">Order Status</h2>

            {isRejected && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-red-700 text-sm">Documents Rejected</p>
                  <p className="text-xs text-red-600 mt-1">Neeche rejected docs dubara upload karein.</p>
                </div>
              </div>
            )}

            <div className="relative pl-8 text-sm">
              {STATUS_STEPS.map((step, i) => {
                const stepIndex = STATUS_ORDER.indexOf(step.key);
                const isCompleted = currentStepIndex > stepIndex || (request.status === 'delivered' && i <= 4);
                const isCurrent = request.status === step.key || (request.status === 'pickup_ready' && step.key === 'completed');
                const historyEntry = request.status_history?.find((h) => h.to_status === step.key);
                return (
                  <div key={step.key} className="relative pb-6 last:pb-0">
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`absolute left-[-16px] top-6 w-0.5 h-full ${isCompleted ? 'bg-primary' : 'bg-gray-200'}`} />
                    )}
                    <div className="absolute left-[-22px] top-0.5">
                      {isCompleted ? (
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center"><CheckCircle className="w-3 h-3 text-white" /></div>
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center animate-pulse"><Circle className="w-3 h-3 text-white fill-white" /></div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white" />
                      )}
                    </div>
                    <div className={`${isCurrent ? 'opacity-100' : isCompleted ? 'opacity-80' : 'opacity-40'}`}>
                      <p className={`font-semibold ${isCurrent ? 'text-primary' : 'text-gray-900'}`}>{step.label}</p>
                      {historyEntry && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(historyEntry.created_at).toLocaleString('en-IN')}
                          {historyEntry.notes && ` — ${historyEntry.notes}`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Request Info */}
          <div className="card">
            <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Price</p>
                <p className="font-bold text-primary text-lg">₹{request.price_charged}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Service</p>
                <p className="font-medium text-gray-900">{request.service?.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Created</p>
                <p className="font-medium">{new Date(request.created_at).toLocaleString('en-IN')}</p>
              </div>
              {request.completed_at && (
                <div>
                  <p className="text-gray-400 text-xs">Completed</p>
                  <p className="font-medium">{new Date(request.completed_at).toLocaleString('en-IN')}</p>
                </div>
              )}
              {request.delivery_type && (
                <div>
                  <p className="text-gray-400 text-xs">Delivery</p>
                  <p className="font-medium capitalize">{request.delivery_type}</p>
                </div>
              )}
              {request.notes && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-gray-400 text-xs">Notes</p>
                  <p className="font-medium italic mt-1">{request.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
