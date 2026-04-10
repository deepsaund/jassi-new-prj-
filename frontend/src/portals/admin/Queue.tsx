import { useEffect, useState } from 'react';
import { adminApi, staffApi } from '../../api/admin';
import type { ServiceRequest } from '../../types';
import { HandMetal, FileText, Clock, User, Inbox, Loader2, Search, Filter } from 'lucide-react';

interface Props {
  portalType: 'admin' | 'staff';
}

export default function Queue({ portalType }: Props) {
  const [queue, setQueue] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<number | null>(null);

  const fetchQueue = () => {
    setLoading(true);
    const api = portalType === 'staff' ? staffApi.getQueue : adminApi.getQueue;
    api({ per_page: 50 }).then((res) => {
      setQueue(res.data.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleClaim = async (id: number) => {
    setClaiming(id);
    try {
      const api = portalType === 'staff' ? staffApi.claimRequest : adminApi.claimRequest;
      await api(id);
      setQueue(queue.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Claim failed - someone else may have claimed it');
    }
    setClaiming(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Work Queue</h1>
        <p className="text-gray-500 mt-1">Approved requests ready for processing. Claim to start working.</p>
      </div>

      {/* Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT: Queue Stats */}
        <div className="lg:col-span-3 space-y-4">
          <div className="card sticky top-8">
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Inbox className="w-8 h-8 text-accent" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{queue.length}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Pending Tasks</p>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Available</span>
                <span className="font-bold text-accent">{queue.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <span className="badge-success text-xs">All Approved</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 leading-relaxed">
                💡 <strong>Tip:</strong> First-come-first-serve! Jaldi claim karein — ek baar claim hone ke baad doosre staff ko nahi dikhega.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Queue Items */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
          ) : queue.length === 0 ? (
            <div className="card text-center py-16 lg:min-h-[400px] flex flex-col items-center justify-center">
              <Inbox className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-medium">Queue khali hai!</p>
              <p className="text-gray-400 text-sm mt-1">Jab documents approve honge, requests yahan dikhengi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queue.map((req) => (
                <div key={req.id} className="card hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-accent">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-primary text-lg">{req.tracking_id}</span>
                      <span className="badge-success">All Docs Approved</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {req.service?.name}</span>
                      <span className="flex items-center gap-1"><User className="w-4 h-4" /> {req.customer?.name}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(req.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleClaim(req.id)}
                    disabled={claiming === req.id}
                    className="btn-accent flex items-center gap-2 whitespace-nowrap shadow-md shadow-accent/20"
                  >
                    {claiming === req.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <><HandMetal className="w-5 h-5" /> Claim Request</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
