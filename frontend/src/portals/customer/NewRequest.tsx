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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Service Request</h1>
        <p className="text-gray-500 mt-1">{service.name} - ₹{price}</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
      )}

      {/* Documents Upload */}
      <div className="card space-y-6">
        <h2 className="text-lg font-bold text-gray-900">Upload Documents</h2>

        {docs.map((doc, index) => (
          <div key={doc.docTypeId} className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900">
                  {doc.docTypeName}
                  {doc.isMandatory && <span className="text-red-500 ml-1">*</span>}
                </p>
                <p className="text-xs text-gray-400">
                  Formats: {doc.acceptedFormats} | Max: {doc.maxSizeMb}MB
                </p>
              </div>
              {(doc.file || doc.vaultId) && (
                <button
                  onClick={() => handleFileChange(index, null)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {doc.file ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg text-sm text-emerald-700">
                <FileCheck className="w-5 h-5" />
                {doc.file.name}
              </div>
            ) : doc.vaultId ? (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <Archive className="w-5 h-5" />
                {doc.vaultName} (from vault)
              </div>
            ) : (
              <div className="flex gap-3">
                <label className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload</p>
                  <input
                    type="file"
                    className="hidden"
                    accept={doc.acceptedFormats.split(',').map((f) => `.${f.trim()}`).join(',')}
                    onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                  />
                </label>

                {vaultDocs.length > 0 && (
                  <div className="w-48">
                    <p className="text-xs font-medium text-gray-500 mb-2">From Vault:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {vaultDocs.map((vd) => (
                        <button
                          key={vd.id}
                          onClick={() => handleVaultSelect(index, vd)}
                          className="w-full text-left text-xs p-2 rounded-lg hover:bg-blue-50 text-gray-600 hover:text-blue-700 transition-colors truncate"
                        >
                          <Archive className="w-3 h-3 inline mr-1" />
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

      {/* Notes */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field min-h-[100px]"
          placeholder="Koi special instruction ya note..."
        />
      </div>

      {/* Summary & Submit */}
      <div className="card bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Service</span>
          <span className="font-semibold">{service.name}</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <span className="text-gray-600">Price</span>
          <span className="text-2xl font-bold text-primary">₹{price}</span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
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
  );
}
