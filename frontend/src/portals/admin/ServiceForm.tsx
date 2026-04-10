import { useEffect, useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { Plus, Trash2, Save, ArrowLeft, GripVertical } from 'lucide-react';

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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/services')} className="text-gray-400 hover:text-primary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Service' : 'Create Service'}</h1>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Service Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[80px]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer Price (₹)</label>
              <input type="number" step="0.01" value={form.customer_price} onChange={(e) => setForm({ ...form, customer_price: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">B2B Price (₹)</label>
              <input type="number" step="0.01" value={form.b2b_price} onChange={(e) => setForm({ ...form, b2b_price: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Est. Days</label>
              <input type="number" value={form.estimated_days} onChange={(e) => setForm({ ...form, estimated_days: e.target.value })} className="input-field" />
            </div>
          </div>
        </div>

        {/* Document Types */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Required Documents</h2>
            <button type="button" onClick={addDocType} className="btn-outline text-sm py-1.5 px-3 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {docTypes.map((dt, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500">Document #{i + 1}</span>
                {docTypes.length > 1 && (
                  <button type="button" onClick={() => removeDocType(i)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Document Name</label>
                  <input type="text" value={dt.document_name} onChange={(e) => updateDocType(i, 'document_name', e.target.value)} className="input-field text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <input type="text" value={dt.description} onChange={(e) => updateDocType(i, 'description', e.target.value)} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Accepted Formats</label>
                  <input type="text" value={dt.accepted_formats} onChange={(e) => updateDocType(i, 'accepted_formats', e.target.value)} className="input-field text-sm" />
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Max Size (MB)</label>
                    <input type="number" value={dt.max_size_mb} onChange={(e) => updateDocType(i, 'max_size_mb', Number(e.target.value))} className="input-field text-sm w-20" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input type="checkbox" checked={dt.is_mandatory} onChange={(e) => updateDocType(i, 'is_mandatory', e.target.checked)} className="w-4 h-4 text-primary rounded" />
                    <span className="text-sm text-gray-600">Mandatory</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Save className="w-5 h-5" /> {isEdit ? 'Update Service' : 'Create Service'}</>}
        </button>
      </form>
    </div>
  );
}
