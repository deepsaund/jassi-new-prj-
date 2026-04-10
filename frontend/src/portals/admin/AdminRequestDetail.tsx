import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import type { ServiceRequest } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import {
  CheckCircle, Circle, Clock, AlertCircle, ArrowLeft,
  FileText, User, Download, MessageSquare, Check, X, Send, Loader2
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'docs_under_review', label: 'Docs Under Review' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'delivered', label: 'Delivered' },
];
const STATUS_ORDER = ['submitted', 'docs_under_review', 'docs_rejected', 'in_progress', 'completed', 'pickup_ready', 'delivered'];

interface Props {
  portalType: 'admin' | 'staff';
}

export default function AdminRequestDetail({ portalType }: Props) {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState<Record<number, string>>({});
  const [docDecisions, setDocDecisions] = useState<Record<number, 'approved' | 'rejected' | null>>({});
  const [message, setMessage] = useState('');

  const fetchRequest = () => {
    if (!id) return;
    adminApi.getRequest(Number(id)).then((res) => {
      setRequest(res.data.data);
      // Initialize decisions from current state
      const decisions: Record<number, 'approved' | 'rejected' | null> = {};
      res.data.data.documents?.forEach((doc) => {
        decisions[doc.id] = doc.status === 'pending' ? null : doc.status as 'approved' | 'rejected';
      });
      setDocDecisions(decisions);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchRequest(); }, [id]);

  const handleReview = async () => {
    if (!request) return;
    const pendingDocs = request.documents?.filter((d) => d.status === 'pending') || [];
    const decisions = pendingDocs
      .filter((d) => docDecisions[d.id])
      .map((d) => ({
        id: d.id,
        status: docDecisions[d.id]!,
        rejection_reason: docDecisions[d.id] === 'rejected' ? (rejectionReasons[d.id] || 'Document not valid') : undefined,
      }));

    if (decisions.length === 0) {
      setMessage('Pehle kuch documents approve ya reject karein');
      return;
    }

    setReviewing(true);
    try {
      await adminApi.reviewDocuments(Number(id), { documents: decisions });
      setMessage('Documents reviewed successfully!');
      fetchRequest();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Review failed');
    }
    setReviewing(false);
  };

  const handleComplete = async () => {
    if (!request) return;
    setCompleting(true);
    try {
      const formData = new FormData();
      await adminApi.completeRequest(Number(id), formData);
      setMessage('Request marked as completed!');
      fetchRequest();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Complete failed');
    }
    setCompleting(false);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;
  }

  if (!request) {
    return <div className="card text-center py-12 text-gray-500">Request not found</div>;
  }

  const currentStepIndex = STATUS_ORDER.indexOf(request.status);
  const isRejected = request.status === 'docs_rejected';
  const canReview = ['submitted', 'docs_under_review'].includes(request.status);
  const canComplete = request.status === 'in_progress' && request.claimed_by === user?.id;
  const hasPendingDocs = request.documents?.some((d) => d.status === 'pending');

  const statusColors: Record<string, string> = {
    submitted: 'badge-info', docs_under_review: 'badge-warning', docs_rejected: 'badge-danger',
    in_progress: 'badge-info', completed: 'badge-success', pickup_ready: 'badge-success',
    delivered: 'badge-success', cancelled: 'badge-neutral',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to={`/${portalType}/requests`} className="text-gray-400 hover:text-primary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{request.tracking_id}</h1>
          <p className="text-gray-500">{request.service?.name} — Customer: {request.customer?.name}</p>
        </div>
        <span className={statusColors[request.status] || 'badge-neutral'}>
          {request.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.includes('success') ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
          {message}
        </div>
      )}

      {/* Main Grid for Side-By-Side Approach */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Main Execution (Wider) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Documents Review Section */}
          <div className="card lg:min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Documents Review</h2>
              {canReview && hasPendingDocs && (
                <span className="badge-warning">Pending Review</span>
              )}
            </div>

            <div className="space-y-4">
              {request.documents?.map((doc) => {
                const isPending = doc.status === 'pending';
                const isApproved = doc.status === 'approved' || docDecisions[doc.id] === 'approved';
                const isDocRejected = doc.status === 'rejected' || docDecisions[doc.id] === 'rejected';

                return (
                  <div
                    key={doc.id}
                    className={`border rounded-xl p-4 transition-all duration-300 ${
                      doc.status === 'approved' ? 'border-emerald-200 bg-emerald-50/50' :
                      doc.status === 'rejected' ? 'border-red-200 bg-red-50/50' :
                      'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <FileText className={`w-5 h-5 mt-0.5 shrink-0 ${
                          doc.status === 'approved' ? 'text-emerald-600' :
                          doc.status === 'rejected' ? 'text-red-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{doc.document_type?.document_name}</p>
                          <p className="text-sm text-gray-500">{doc.original_filename}</p>
                          <a
                            href={`/api/v1/files/request-doc/${doc.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                          >
                            <Download className="w-3 h-3" /> View / Download
                          </a>
                          {doc.auto_approved && (
                            <span className="ml-2 text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Auto-approved</span>
                          )}
                          {doc.rejection_reason && (
                            <p className="text-xs text-red-600 mt-1">Rejection: {doc.rejection_reason}</p>
                          )}
                        </div>
                      </div>

                      {/* Current status badge */}
                      {doc.status !== 'pending' && !canReview && (
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${
                          doc.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {doc.status === 'approved' ? 'Approved' : doc.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      )}

                      {/* Approve/Reject buttons for pending docs */}
                      {isPending && canReview && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setDocDecisions({ ...docDecisions, [doc.id]: 'approved' })}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              docDecisions[doc.id] === 'approved'
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                : 'border border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <Check className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => setDocDecisions({ ...docDecisions, [doc.id]: 'rejected' })}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              docDecisions[doc.id] === 'rejected'
                                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                                : 'border border-red-300 text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Rejection reason input */}
                    {docDecisions[doc.id] === 'rejected' && isPending && canReview && (
                      <div className="mt-4 pl-8">
                        <input
                          type="text"
                          placeholder="Rejection reason (e.g., blurry photo, wrong document)"
                          value={rejectionReasons[doc.id] || ''}
                          onChange={(e) => setRejectionReasons({ ...rejectionReasons, [doc.id]: e.target.value })}
                          className="input-field text-sm bg-white"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Review Button */}
            {canReview && hasPendingDocs && (
              <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {Object.values(docDecisions).filter(Boolean).length} / {request.documents?.filter(d => d.status === 'pending').length} documents reviewed
                </p>
                <button
                  onClick={handleReview}
                  disabled={reviewing}
                  className="btn-primary flex items-center gap-2"
                >
                  {reviewing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <><Send className="w-5 h-5" /> Submit Review</>
                  )}
                </button>
              </div>
            )}
            {!hasPendingDocs && request.documents?.length > 0 && !canReview && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center">
                 <p className="text-sm text-emerald-600 flex items-center gap-1 font-medium"><CheckCircle className="w-4 h-4"/> All documents reviewed</p>
              </div>
            )}
          </div>
          
        </div>

        {/* RIGHT COLUMN: Info Sidebar (Narrower) */}
        <div className="space-y-6">

          {/* Complete Action Panel (Top priority if applicable) */}
          {canComplete && (
            <div className="card bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-lg shadow-primary/5">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Complete Request</h2>
              <p className="text-sm text-gray-500 mb-4">Jab kaam ho jaye, request complete mark karein.</p>
              <button
                onClick={handleComplete}
                disabled={completing}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {completing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Mark as Completed</>}
              </button>
            </div>
          )}

          {/* Status Tracker */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Status Timeline</h2>
            {isRejected && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-red-700 text-sm">Documents Rejected</p>
                  <p className="text-xs text-red-600 mt-1">Customer ko re-upload ke liye notification bheja gaya hai</p>
                </div>
              </div>
            )}
            <div className="relative pl-8 text-sm">
              {STATUS_STEPS.map((step, i) => {
                const stepIndex = STATUS_ORDER.indexOf(step.key);
                const isCompleted = currentStepIndex > stepIndex;
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
                          {historyEntry.changer && ` — ${historyEntry.changer.name}`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Info */}
          <div className="card">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
              <User className="w-4 h-4" /> Customer Info
            </h2>
            <div className="space-y-3 text-sm">
              <div><p className="text-gray-500 text-xs">Name</p><p className="font-medium">{request.customer?.name}</p></div>
              <div><p className="text-gray-500 text-xs">Email</p><p className="font-medium break-all">{request.customer?.email}</p></div>
              <div><p className="text-gray-500 text-xs">Phone</p><p className="font-medium">{request.customer?.phone || '-'}</p></div>
            </div>
            {request.is_on_behalf && (
              <div className="mt-4 p-2 bg-amber-50 rounded-lg text-amber-700 text-xs font-medium text-center">On-behalf (Staff Created)</div>
            )}
          </div>

          {/* Request Info */}
          <div className="card">
            <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Details</h2>
            <div className="space-y-3 text-sm">
              <div><p className="text-gray-500 text-xs">Price Charged</p><p className="font-bold text-primary text-lg">₹{request.price_charged}</p></div>
              <div><p className="text-gray-500 text-xs">Service</p><p className="font-medium">{request.service?.name}</p></div>
              <div><p className="text-gray-500 text-xs">Claimed By</p><p className="font-medium">{request.claimed_by_user?.name || 'Not claimed yet'}</p></div>
              {request.completed_at && <div><p className="text-gray-500 text-xs">Completed On</p><p className="font-medium">{new Date(request.completed_at).toLocaleString('en-IN')}</p></div>}
              {request.notes && <div className="pt-2 border-t border-gray-100"><p className="text-gray-500 text-xs">Notes</p><p className="font-medium italic mt-1">{request.notes}</p></div>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
