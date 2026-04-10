import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { servicesApi } from '../../api/services';
import type { Service, User } from '../../types';
import { useEffect } from 'react';
import { Search, UserPlus, FileText, Upload, Loader2, CheckCircle } from 'lucide-react';

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Workflow - On Behalf Request</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 text-sm">
        {[
          { key: 'customer', label: '1. Customer' },
          { key: 'service', label: '2. Service' },
          { key: 'documents', label: '3. Documents' },
        ].map((s, i) => (
          <div key={s.key} className={`flex items-center gap-2 ${step === s.key ? 'text-primary font-semibold' : 'text-gray-400'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === s.key ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</div>
            {s.label}
            {i < 2 && <span className="text-gray-300 mx-2">→</span>}
          </div>
        ))}
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
      {generatedPassword && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <p className="font-semibold">New customer password: <code className="bg-amber-100 px-2 py-0.5 rounded">{generatedPassword}</code></p>
          <p className="text-xs mt-1">Yeh password customer ko de dein</p>
        </div>
      )}

      {/* Step 1: Customer */}
      {step === 'customer' && (
        <div className="card space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Select or Create Customer</h2>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search by name, email, phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="input-field pl-10" />
            </div>
            <button onClick={handleSearch} className="btn-primary">Search</button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((u) => (
                <button key={u.id} onClick={() => { setSelectedCustomer(u); setStep('service'); }} className="w-full text-left p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{u.name}</p>
                    <p className="text-sm text-gray-500">{u.email} | {u.phone || 'No phone'}</p>
                  </div>
                  <span className="text-primary text-sm font-medium">Select</span>
                </button>
              ))}
            </div>
          )}

          <div className="border-t pt-4">
            <button onClick={() => setIsNewCustomer(true)} className="btn-outline flex items-center gap-2">
              <UserPlus className="w-5 h-5" /> Create New Customer
            </button>
          </div>

          {isNewCustomer && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <input type="text" placeholder="Full Name" value={newCustomerForm.name} onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })} className="input-field" />
              <input type="email" placeholder="Email" value={newCustomerForm.email} onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })} className="input-field" />
              <input type="tel" placeholder="Phone" value={newCustomerForm.phone} onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })} className="input-field" />
              <textarea placeholder="Address" value={newCustomerForm.address} onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })} className="input-field min-h-[60px]" />
              <button onClick={handleCreateCustomer} className="btn-primary">Create & Continue</button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Service */}
      {step === 'service' && selectedCustomer && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Select Service</h2>
            <p className="text-sm text-gray-500">Customer: <strong>{selectedCustomer.name}</strong></p>
          </div>
          <div className="grid gap-3">
            {services.map((s) => (
              <button key={s.id} onClick={() => { setSelectedService(s); setStep('documents'); }} className="text-left p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  <p className="text-sm text-gray-500">{s.document_types?.length || 0} documents required</p>
                </div>
                <span className="font-bold text-primary">₹{s.customer_price}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Documents */}
      {step === 'documents' && selectedService && (
        <div className="space-y-6">
          <div className="card space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Upload Documents</h2>
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Staff dwara upload kiye gaye documents auto-approved honge
            </p>

            {selectedService.document_types.map((dt) => (
              <div key={dt.id} className="border border-gray-200 rounded-xl p-4">
                <p className="font-medium text-gray-900 mb-2">{dt.document_name} {dt.is_mandatory && <span className="text-red-500">*</span>}</p>
                {files[dt.id] ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg text-sm text-emerald-700">
                    <CheckCircle className="w-5 h-5" /> {files[dt.id].name}
                    <button onClick={() => { const f = { ...files }; delete f[dt.id]; setFiles(f); }} className="ml-auto text-red-500 text-xs">Remove</button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-all">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm text-gray-500">Click to upload</p>
                    <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setFiles({ ...files, [dt.id]: e.target.files[0] }); }} />
                  </label>
                )}
              </div>
            ))}
          </div>

          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field min-h-[80px]" />
          </div>

          <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><FileText className="w-5 h-5" /> Create Request</>}
          </button>
        </div>
      )}
    </div>
  );
}
