import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { servicesApi } from '../../api/services';
import type { Service, User } from '../../types';
import { useEffect } from 'react';
import { Search, UserPlus, FileText, Upload, Loader2, CheckCircle, ArrowRight, X, User as UserIcon, Package, FolderUp } from 'lucide-react';

export default function Workflow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'customer' | 'service' | 'documents'>('customer');
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [files, setFiles] = useState<Record<number, File>>({});
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  useEffect(() => {
    servicesApi.list({ per_page: 100 }).then((res) => setServices(res.data.data));
  }, []);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    const res = await adminApi.getUsers({ search: searchQuery, role: 'customer', per_page: 10 });
    setSearchResults(res.data.data);
  };

  const handleCreateCustomer = async () => {
    try {
      const res = await adminApi.createCustomer(newCustomerForm);
      setSelectedCustomer(res.data.data);
      setGeneratedPassword(res.data.generated_password);
      setIsNewCustomer(false);
      setStep('service');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Customer creation failed');
    }
  };

  const handleSubmit = async () => {
    if (!selectedCustomer || !selectedService) return;
    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('customer_id', String(selectedCustomer.id));
      formData.append('service_id', String(selectedService.id));
      if (notes) formData.append('notes', notes);

      selectedService.document_types.forEach((dt, i) => {
        const file = files[dt.id];
        if (file) {
          formData.append(`documents[${i}][doc_type_id]`, String(dt.id));
          formData.append(`documents[${i}][file]`, file);
        }
      });

      await adminApi.createOnBehalfRequest(formData);
      navigate(`/${window.location.pathname.includes('staff') ? 'staff' : 'admin'}/requests`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Request creation failed');
    }
    setSubmitting(false);
  };

  const allSteps = [
    { key: 'customer', label: 'Customer', icon: UserIcon },
    { key: 'service', label: 'Service', icon: Package },
    { key: 'documents', label: 'Documents', icon: FolderUp },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Workflow — On Behalf Request</h1>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
      {generatedPassword && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <p className="font-semibold">New customer password: <code className="bg-amber-100 px-2 py-0.5 rounded">{generatedPassword}</code></p>
          <p className="text-xs mt-1">Yeh password customer ko de dein</p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT SIDEBAR: Steps Progress + Summary */}
        <div className="lg:col-span-3 space-y-6">
          {/* Step Progress */}
          <div className="card sticky top-8">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-5 border-b border-gray-100 pb-3">Progress</h2>
            <div className="space-y-5">
              {allSteps.map((s, i) => {
                const isActive = step === s.key;
                const isDone = (s.key === 'customer' && (step === 'service' || step === 'documents')) ||
                               (s.key === 'service' && step === 'documents');
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      isDone ? 'bg-emerald-500 text-white' :
                      isActive ? 'bg-primary text-white shadow-md shadow-primary/30' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {isDone ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-sm font-semibold ${isActive ? 'text-primary' : isDone ? 'text-emerald-600' : 'text-gray-400'}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Selected Summary */}
            {selectedCustomer && (
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase">Customer</p>
                  <p className="font-semibold text-gray-900">{selectedCustomer.name}</p>
                  <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
                </div>
                {selectedService && (
                  <div>
                    <p className="text-gray-400 text-xs uppercase">Service</p>
                    <p className="font-semibold text-gray-900">{selectedService.name}</p>
                    <p className="text-xs text-primary font-bold">₹{selectedService.customer_price}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT MAIN: Step Content */}
        <div className="lg:col-span-9">

          {/* Step 1: Customer */}
          {step === 'customer' && (
            <div className="card space-y-5 lg:min-h-[450px]">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Select or Create Customer</h2>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Search by name, email, phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="input-field pl-10 bg-white" />
                </div>
                <button onClick={handleSearch} className="btn-primary">Search</button>
              </div>

              {searchResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchResults.map((u) => (
                    <button key={u.id} onClick={() => { setSelectedCustomer(u); setStep('service'); }} className="text-left p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between group">
                      <div>
                        <p className="font-semibold text-gray-900">{u.name}</p>
                        <p className="text-sm text-gray-500">{u.email} | {u.phone || 'No phone'}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              <div className="border-t pt-4">
                <button onClick={() => setIsNewCustomer(!isNewCustomer)} className="btn-outline flex items-center gap-2">
                  {isNewCustomer ? <X className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {isNewCustomer ? 'Cancel' : 'Create New Customer'}
                </button>
              </div>

              {isNewCustomer && (
                <div className="border border-gray-200 rounded-xl p-5 space-y-4 bg-gray-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Full Name</label>
                      <input type="text" placeholder="Full Name" value={newCustomerForm.name} onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })} className="input-field bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Email</label>
                      <input type="email" placeholder="Email" value={newCustomerForm.email} onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })} className="input-field bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Phone</label>
                      <input type="tel" placeholder="Phone" value={newCustomerForm.phone} onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })} className="input-field bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase">Address</label>
                      <input type="text" placeholder="Address" value={newCustomerForm.address} onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })} className="input-field bg-white" />
                    </div>
                  </div>
                  <button onClick={handleCreateCustomer} className="btn-primary flex items-center gap-2">
                    <UserPlus className="w-5 h-5" /> Create & Continue
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Service */}
          {step === 'service' && selectedCustomer && (
            <div className="card space-y-5 lg:min-h-[450px]">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-gray-900">Select Service</h2>
                <button onClick={() => setStep('customer')} className="text-xs text-gray-400 hover:text-primary">← Back to Customer</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((s) => (
                  <button key={s.id} onClick={() => { setSelectedService(s); setStep('documents'); }} className="text-left p-5 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all group">
                    <p className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors">{s.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{s.document_types?.length || 0} documents required</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="font-bold text-primary text-lg">₹{s.customer_price}</span>
                      <span className="text-xs text-gray-400">{s.estimated_days} days est.</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 'documents' && selectedService && (
            <div className="space-y-6">
              <div className="card space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="text-lg font-bold text-gray-900">Upload Documents</h2>
                  <button onClick={() => setStep('service')} className="text-xs text-gray-400 hover:text-primary">← Back to Service</button>
                </div>
                <div className="p-3 bg-amber-50/80 border border-amber-100 rounded-xl text-sm text-amber-700 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 shrink-0" /> Staff dwara upload kiye gaye documents auto-approved honge
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedService.document_types.map((dt) => (
                    <div key={dt.id} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all">
                      <p className="font-semibold text-gray-900 mb-3">{dt.document_name} {dt.is_mandatory && <span className="text-red-500">*</span>}</p>
                      {files[dt.id] ? (
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-700">
                          <CheckCircle className="w-5 h-5 shrink-0" />
                          <span className="truncate flex-1">{files[dt.id].name}</span>
                          <button onClick={() => { const f = { ...files }; delete f[dt.id]; setFiles(f); }} className="text-red-400 hover:text-red-600 shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="block border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                          <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary mx-auto mb-1 transition-colors" />
                          <p className="text-sm text-gray-500">Click to upload</p>
                          <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setFiles({ ...files, [dt.id]: e.target.files[0] }); }} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Notes (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field min-h-[80px] bg-white" placeholder="Any special instructions..." />
              </div>

              <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 py-3 shadow-md shadow-primary/20">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><FileText className="w-5 h-5" /> Create Request</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
