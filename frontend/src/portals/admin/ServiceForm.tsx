import { useEffect, useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { Plus, Trash2, Save, ArrowLeft, Loader2, GripVertical, FileText } from 'lucide-react';

interface DocType {
  id?: number;
  document_name: string;
  description: string;
  is_mandatory: boolean;
  accepted_formats: string;
  max_size_mb: number;
}

export default function ServiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    description: '',
    customer_price: '',
    b2b_price: '',
    estimated_days: '',
  });
  const [docTypes, setDocTypes] = useState<DocType[]>([
    { document_name: '', description: '', is_mandatory: true, accepted_formats: 'pdf,jpg,jpeg,png', max_size_mb: 10 },
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminApi.getServices({ per_page: 100 }).then((res) => {
      const service = res.data.data.find((s: any) => s.id === Number(id));
      if (service) {
        setForm({
          name: service.name,
          description: service.description || '',
          customer_price: service.customer_price,
          b2b_price: service.b2b_price,
          estimated_days: service.estimated_days?.toString() || '',
        });
        if (service.document_types?.length) {
          setDocTypes(service.document_types.map((dt: any) => ({
            id: dt.id,
            document_name: dt.document_name,
            description: dt.description || '',
            is_mandatory: dt.is_mandatory,
            accepted_formats: dt.accepted_formats,
            max_size_mb: dt.max_size_mb,
          })));
        }
      }
      setLoading(false);
    });
  }, [id]);

  const addDocType = () => {
    setDocTypes([...docTypes, { document_name: '', description: '', is_mandatory: true, accepted_formats: 'pdf,jpg,jpeg,png', max_size_mb: 10 }]);
  };

  const removeDocType = (index: number) => {
    if (docTypes.length <= 1) return;
    setDocTypes(docTypes.filter((_, i) => i !== index));
  };

  const updateDocType = (index: number, field: keyof DocType, value: any) => {
    setDocTypes(docTypes.map((dt, i) => i === index ? { ...dt, [field]: value } : dt));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = {
        ...form,
        customer_price: Number(form.customer_price),
        b2b_price: Number(form.b2b_price),
        estimated_days: form.estimated_days ? Number(form.estimated_days) : null,
        document_types: docTypes,
      };

      if (isEdit) {
        await adminApi.updateService(Number(id), data);
      } else {
        await adminApi.createService(data);
      }
      navigate('/admin/services');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/services')} className="text-gray-400 hover:text-primary transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Service' : 'Create Service'}</h1>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm shadow-sm">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Service Details (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="card space-y-5 sticky top-8 border-gray-200 shadow-md">
              <h2 className="text-md font-bold text-gray-900 border-b border-gray-100 pb-3 uppercase tracking-wide">
                Service Details
              </h2>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field bg-white" required placeholder="e.g. Passport Apply" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field bg-white min-h-[100px]" placeholder="Service explanation..." />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1.5 uppercase tracking-wide">Customer Price (₹)</label>
                  <input type="number" step="0.01" value={form.customer_price} onChange={(e) => setForm({ ...form, customer_price: e.target.value })} className="input-field bg-primary/5 text-primary font-bold" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-amber-600 mb-1.5 uppercase tracking-wide">B2B Price (₹)</label>
                  <input type="number" step="0.01" value={form.b2b_price} onChange={(e) => setForm({ ...form, b2b_price: e.target.value })} className="input-field bg-amber-50 text-amber-700 font-bold" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Estimated Days</label>
                  <input type="number" value={form.estimated_days} onChange={(e) => setForm({ ...form, estimated_days: e.target.value })} className="input-field bg-white" placeholder="e.g. 15" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-6">
                <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 py-3 shadow-md shadow-primary/20">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> {isEdit ? 'Update Service' : 'Create Service'}</>}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Document Requirements Array (Span 8) */}
          <div className="lg:col-span-8">
            <div className="card space-y-4 lg:min-h-[600px] border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h2 className="text-md font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" /> Required Documents Form
                </h2>
                <button type="button" onClick={addDocType} className="btn-outline text-sm py-1.5 px-3 flex items-center gap-1 hover:bg-primary hover:text-white transition-colors">
                  <Plus className="w-4 h-4" /> Add Document
                </button>
              </div>

              {docTypes.map((dt, i) => (
                <div key={i} className="group relative border border-gray-200 bg-gray-50/50 hover:bg-white rounded-xl p-5 space-y-4 hover:shadow-md hover:border-gray-300 transition-all duration-300">
                  
                  {/* Item Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" /> Document #{i + 1}
                    </span>
                    {docTypes.length > 1 && (
                      <button type="button" onClick={() => removeDocType(i)} className="text-gray-400 hover:text-red-500 bg-white shadow-sm hover:bg-red-50 p-2 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Main Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Document Name</label>
                      <input type="text" value={dt.document_name} onChange={(e) => updateDocType(i, 'document_name', e.target.value)} className="input-field text-sm bg-white" required placeholder="e.g. Identity Proof" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Description / Instruction</label>
                      <input type="text" value={dt.description} onChange={(e) => updateDocType(i, 'description', e.target.value)} className="input-field text-sm bg-white" placeholder="e.g. Aadhaar Card, Voter ID" />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Accepted Formats</label>
                      <input type="text" value={dt.accepted_formats} onChange={(e) => updateDocType(i, 'accepted_formats', e.target.value)} className="input-field text-sm bg-white" placeholder="pdf,jpg,jpeg,png" />
                      <p className="text-[10px] text-gray-400 mt-1">Comma separated extensions</p>
                    </div>
                    
                    <div className="flex items-end gap-6">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Max Size (MB)</label>
                        <input type="number" value={dt.max_size_mb} onChange={(e) => updateDocType(i, 'max_size_mb', Number(e.target.value))} className="input-field text-sm bg-white w-full" />
                      </div>
                      
                      <div className="flex-1 mb-[10px]">
                        <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border border-gray-200 bg-white hover:border-primary/50 transition-colors">
                          <div className="relative flex items-center">
                            <input type="checkbox" checked={dt.is_mandatory} onChange={(e) => updateDocType(i, 'is_mandatory', e.target.checked)} className="peer sr-only" />
                            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">Mandatory</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
