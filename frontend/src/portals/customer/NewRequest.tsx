import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { servicesApi } from '../../api/services';
import { requestsApi } from '../../api/requests';
import { vaultApi } from '../../api/vault';
import type { Service, DocumentVault } from '../../types';
import { Upload, FileCheck, Archive, X, Loader2 } from 'lucide-react';

interface Props {
  portalType: 'customer' | 'b2b';
}

interface DocUpload {
  docTypeId: number;
  docTypeName: string;
  isMandatory: boolean;
  acceptedFormats: string;
  maxSizeMb: number;
  file: File | null;
  vaultId: number | null;
  vaultName: string | null;
}

export default function NewRequest({ portalType }: Props) {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [vaultDocs, setVaultDocs] = useState<DocumentVault[]>([]);
  const [docs, setDocs] = useState<DocUpload[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!serviceId) return;
    Promise.all([
      servicesApi.get(Number(serviceId)),
      vaultApi.suggest(Number(serviceId)),
    ]).then(([serviceRes, vaultRes]) => {
      const svc = serviceRes.data.data;
      setService(svc);
      setVaultDocs(vaultRes.data.data);
      setDocs(
        svc.document_types.map((dt) => ({
          docTypeId: dt.id,
          docTypeName: dt.document_name,
          isMandatory: dt.is_mandatory,
          acceptedFormats: dt.accepted_formats,
          maxSizeMb: dt.max_size_mb,
          file: null,
          vaultId: null,
          vaultName: null,
        }))
      );
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [serviceId]);

  const handleFileChange = (index: number, file: File | null) => {
    setDocs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], file, vaultId: null, vaultName: null };
      return updated;
    });
  };

  const handleVaultSelect = (index: number, vaultDoc: DocumentVault) => {
    setDocs((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        file: null,
        vaultId: vaultDoc.id,
        vaultName: `${vaultDoc.document_name} (${vaultDoc.original_filename})`,
      };
      return updated;
    });
  };

  const handleSubmit = async () => {
    setError('');
    // Validate mandatory docs
    for (const doc of docs) {
      if (doc.isMandatory && !doc.file && !doc.vaultId) {
        setError(`Please upload: ${doc.docTypeName}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('service_id', serviceId!);
      if (notes) formData.append('notes', notes);

      docs.forEach((doc, i) => {
        if (doc.file || doc.vaultId) {
          formData.append(`documents[${i}][doc_type_id]`, String(doc.docTypeId));
          if (doc.vaultId) {
            formData.append(`documents[${i}][vault_id]`, String(doc.vaultId));
          }
          if (doc.file) {
            formData.append(`documents[${i}][file]`, doc.file);
          }
        }
      });

      const res = await requestsApi.create(formData);
      navigate(`/${portalType}/requests/${res.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Request submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!service) {
    return <div className="card text-center py-12 text-gray-500">Service not found</div>;
  }

  const price = portalType === 'b2b' ? service.b2b_price : service.customer_price;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">New Service Request</h1>
        <p className="text-gray-500 mt-1">{service.name} - ₹{price}</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
      )}

      {/* Main Grid for Side-By-Side Approach */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Documents Upload (Wider) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card space-y-6 lg:min-h-[400px]">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Required Documents</h2>

            {docs.map((doc, index) => (
              <div key={doc.docTypeId} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold text-gray-900 text-base">
                      {doc.docTypeName}
                      {doc.isMandatory && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Formats: {doc.acceptedFormats} | Max: {doc.maxSizeMb}MB
                    </p>
                  </div>
                  {(doc.file || doc.vaultId) && (
                    <button
                      onClick={() => handleFileChange(index, null)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove File"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {doc.file ? (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50/70 border border-emerald-100 rounded-lg text-sm text-emerald-800 font-medium">
                    <FileCheck className="w-6 h-6 text-emerald-500" />
                    {doc.file.name}
                  </div>
                ) : doc.vaultId ? (
                  <div className="flex items-center gap-3 p-4 bg-blue-50/70 border border-blue-100 rounded-lg text-sm text-blue-800 font-medium">
                    <Archive className="w-6 h-6 text-blue-500" />
                    {doc.vaultName} (Synced from Vault)
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* New Upload Area */}
                    <label className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                      <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-primary/10 flex items-center justify-center mb-2 transition-colors">
                        <Upload className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Click to upload new file</p>
                      <input
                        type="file"
                        className="hidden"
                        accept={doc.acceptedFormats.split(',').map((f) => `.${f.trim()}`).join(',')}
                        onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                      />
                    </label>

                    {/* Vault Select Area (Only shows if valid vault docs exist) */}
                    {vaultDocs.length > 0 && (
                      <div className="w-full sm:w-56 flex flex-col">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <Archive className="w-3 h-3"/> Or Select From Vault
                        </p>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {vaultDocs.map((vd) => (
                            <button
                              key={vd.id}
                              onClick={() => handleVaultSelect(index, vd)}
                              className="w-full text-left text-xs p-2.5 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 text-gray-600 hover:text-blue-700 transition-all truncate"
                            >
                              {vd.document_name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Options & Submit (Narrower) */}
        <div className="space-y-6">
          <div className="card">
            <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Additional Notes</label>
            <p className="text-xs text-gray-500 mb-3">Optional. Special instructions for our staff.</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field min-h-[120px] bg-white text-sm"
              placeholder="E.g., Please process urgently..."
            />
          </div>

          {/* Summary & Submit */}
          <div className="card bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-lg shadow-primary/5">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Order Summary</h2>
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="text-gray-600">Service</span>
              <span className="font-semibold text-gray-900">{service.name}</span>
            </div>
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="text-gray-600">Est. Time</span>
              <span className="font-semibold text-gray-900">{service.estimated_days} Days</span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-primary/10 mb-6">
              <span className="text-gray-800 font-bold">Total Price</span>
              <span className="text-2xl font-bold text-primary">₹{price}</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 shadow-md shadow-primary/20"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <FileCheck className="w-5 h-5" /> Submit Request
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
