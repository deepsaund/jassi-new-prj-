import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { servicesApi } from '../../api/services';
import type { Service } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { Search, Clock, FileText, ArrowRight, IndianRupee } from 'lucide-react';

interface Props {
  portalType: 'customer' | 'b2b';
}

export default function ServiceCatalog({ portalType }: Props) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    servicesApi.list({ search, per_page: 50 }).then((res) => {
      setServices(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [search]);

  const getPrice = (service: Service) => {
    return portalType === 'b2b' ? service.b2b_price : service.customer_price;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Services</h1>
          <p className="text-gray-500 mt-1">Apni zaroorat ki service select karein</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 card">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Koi service nahi mili</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="card hover:shadow-md transition-all duration-300 group flex flex-col"
            >
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>
                  <div className="flex items-center gap-1 text-accent font-bold text-xl whitespace-nowrap">
                    <IndianRupee className="w-5 h-5" />
                    {getPrice(service)}
                  </div>
                </div>

                {service.description && (
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{service.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  {service.estimated_days && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> ~{service.estimated_days} days
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" /> {service.document_types?.length || 0} docs required
                  </span>
                </div>

                {service.document_types && service.document_types.length > 0 && (
                  <div className="border-t border-gray-100 pt-3 mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Required Documents</p>
                    <div className="flex flex-wrap gap-1.5">
                      {service.document_types.map((dt) => (
                        <span key={dt.id} className="badge-neutral text-xs">
                          {dt.document_name}
                          {dt.is_mandatory && <span className="text-red-400 ml-0.5">*</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to={`/${portalType}/requests/new/${service.id}`}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-auto"
              >
                Apply Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
