import { useEffect, useState } from 'react';
import { adminApi, staffApi } from '../../api/admin';
import type { ServiceRequest } from '../../types';
import { Search, HandMetal, FileText, Clock, User } from 'lucide-react';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Work Queue</h1>
        <p className="text-gray-500 mt-1">Approved requests ready for processing. Claim to start working.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
      ) : queue.length === 0 ? (
        <div className="card text-center py-16">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Queue khali hai!</p>
          <p className="text-gray-400 text-sm mt-1">Jab documents approve honge, requests yahan dikhengi</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {queue.map((req) => (
            <div key={req.id} className="card hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                className="btn-accent flex items-center gap-2 whitespace-nowrap"
              >
                {claiming === req.id ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <><HandMetal className="w-5 h-5" /> Claim Request</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
