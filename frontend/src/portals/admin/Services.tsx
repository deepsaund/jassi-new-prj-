import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import type { Service } from '../../types';
import { Plus, Search, Edit, Trash2, FileText } from 'lucide-react';

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchServices = () => {
    setLoading(true);
    adminApi.getServices({ search, page, per_page: 10 }).then((res) => {
      setServices(res.data.data);
      setLastPage(res.data.last_page);
      setLoading(false);
    });
  };

  useEffect(() => { fetchServices(); }, [search, page]);

  const handleDelete = async (id: number) => {
    if (!confirm('Deactivate this service?')) return;
    await adminApi.deleteService(id);
    fetchServices();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Services Management</h1>
        <Link to="/admin/services/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Service
        </Link>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Service</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Customer Price</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">B2B Price</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Documents</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900">{service.name}</p>
                        <p className="text-xs text-gray-500">{service.description?.substring(0, 50)}</p>
                      </td>
                      <td className="py-3 px-4 font-medium">₹{service.customer_price}</td>
                      <td className="py-3 px-4 font-medium">₹{service.b2b_price}</td>
                      <td className="py-3 px-4">
                        <span className="badge-neutral">{service.document_types?.length || 0} docs</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={service.is_active ? 'badge-success' : 'badge-danger'}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/services/${service.id}/edit`} className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(service.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Page {page} of {lastPage}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">
                  Previous
                </button>
                <button onClick={() => setPage(Math.min(lastPage, page + 1))} disabled={page === lastPage} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
