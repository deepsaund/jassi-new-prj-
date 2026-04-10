import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { requestsApi } from '../../api/requests';
import type { ServiceRequest } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import {
  CheckCircle, Circle, Clock, AlertCircle, Upload, Download,
  MessageSquare, FileText, ArrowLeft, Loader2
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
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!request) {
    return <div className="card text-center py-12 text-gray-500">Request not found</div>;
  }

  const currentStepIndex = STATUS_ORDER.indexOf(request.status);
  const isRejected = request.status === 'docs_rejected';

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
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

      {/* Status Tracker - Swiggy/Zomato Style */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Order Status</h2>

        {isRejected && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Documents Rejected</p>
              <p className="text-sm text-red-600 mt-1">Kuch documents sahi nahi hain. Neeche rejected documents dubara upload karein.</p>
            </div>
          </div>
        )}

        <div className="relative pl-8">
          {STATUS_STEPS.map((step, i) => {
            const stepIndex = STATUS_ORDER.indexOf(step.key);
            const isCompleted = currentStepIndex > stepIndex || (request.status === 'delivered' && i <= 4);
            const isCurrent = request.status === step.key || (request.status === 'pickup_ready' && step.key === 'completed');
            const historyEntry = request.status_history?.find((h) => h.to_status === step.key);

            return (
              <div key={step.key} className="relative pb-8 last:pb-0">
                {/* Vertical line */}
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`absolute left-[-20px] top-8 w-0.5 h-full ${isCompleted ? 'bg-primary' : 'bg-gray-200'}`} />
                )}

                {/* Circle */}
                <div className="absolute left-[-28px] top-0.5">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center animate-pulse">
                      <Circle className="w-4 h-4 text-white fill-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white" />
                  )}
                </div>

                {/* Content */}
                <div className={`${isCurrent ? 'opacity-100' : isCompleted ? 'opacity-80' : 'opacity-40'}`}>
                  <p className={`font-semibold ${isCurrent ? 'text-primary' : 'text-gray-900'}`}>
                    {step.label}
                  </p>
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

      {/* Documents */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Documents</h2>
        <div className="space-y-3">
          {request.documents?.map((doc) => (
            <div
              key={doc.id}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                doc.status === 'approved'
                  ? 'border-emerald-200 bg-emerald-50'
                  : doc.status === 'rejected'
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className={`w-5 h-5 ${
                  doc.status === 'approved' ? 'text-emerald-600' :
                  doc.status === 'rejected' ? 'text-red-600' : 'text-gray-400'
                }`} />
                <div>
                  <p className="font-medium text-gray-900">{doc.document_type?.document_name}</p>
                  <p className="text-xs text-gray-500">{doc.original_filename}</p>
                  {doc.rejection_reason && (
                    <p className="text-xs text-red-600 mt-1">Reason: {doc.rejection_reason}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  doc.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Re-upload for rejected docs */}
        {isRejected && request.documents?.some((d) => d.status === 'rejected') && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Upload className="w-5 h-5 text-red-500" /> Re-upload Rejected Documents
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Sirf rejected documents dubara upload karein. Approved documents safe hain.
            </p>
            {/* Re-upload form would go here - for now link to action */}
            <button className="btn-primary flex items-center gap-2">
              <Upload className="w-4 h-4" /> Re-upload Documents
            </button>
          </div>
        )}
      </div>

      {/* Request Info */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Request Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Service</p>
            <p className="font-medium">{request.service?.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Price</p>
            <p className="font-medium">₹{request.price_charged}</p>
          </div>
          <div>
            <p className="text-gray-500">Created</p>
            <p className="font-medium">{new Date(request.created_at).toLocaleString('en-IN')}</p>
          </div>
          {request.completed_at && (
            <div>
              <p className="text-gray-500">Completed</p>
              <p className="font-medium">{new Date(request.completed_at).toLocaleString('en-IN')}</p>
            </div>
          )}
          {request.delivery_type && (
            <div>
              <p className="text-gray-500">Delivery</p>
              <p className="font-medium capitalize">{request.delivery_type}</p>
            </div>
          )}
          {request.notes && (
            <div className="col-span-2">
              <p className="text-gray-500">Notes</p>
              <p className="font-medium">{request.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Download Output */}
      {request.output_file_path && ['completed', 'delivered'].includes(request.status) && (
        <div className="card bg-gradient-to-br from-emerald-50 to-transparent border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-emerald-800">Document Ready!</h3>
              <p className="text-sm text-emerald-600">Aapka completed document download ke liye ready hai</p>
            </div>
            <button
              onClick={() => requestsApi.downloadOutput(request.id)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5" /> Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
