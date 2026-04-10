import { useEffect, useState } from 'react';
import { vaultApi } from '../../api/vault';
import type { DocumentVault } from '../../types';
import { Upload, Trash2, FileText, Search, Download, Loader2 } from 'lucide-react';

export default function DocumentVaultPage() {
  const [docs, setDocs] = useState<DocumentVault[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [docName, setDocName] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fetchDocs = () => {
    setLoading(true);
    vaultApi.list({ per_page: 50 }).then((res) => {
      setDocs(res.data.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async () => {
    if (!file || !docName) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_name', docName);
      await vaultApi.upload(formData);
      setShowUpload(false);
      setDocName('');
      setFile(null);
      fetchDocs();
    } catch {}
    setUploading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this document?')) return;
    await vaultApi.delete(id);
    fetchDocs();
  };

  const formatSize = (kb: number) => kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Vault</h1>
          <p className="text-gray-500 mt-1">Apne sabhi documents yahan store karein — future requests me reuse honge</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2">
          <Upload className="w-5 h-5" /> Upload Document
        </button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowUpload(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload to Vault</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Name</label>
                <input type="text" value={docName} onChange={(e) => setDocName(e.target.value)} className="input-field" placeholder="e.g. Aadhaar Card" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">File</label>
                {file ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg text-sm text-emerald-700">
                    <FileText className="w-5 h-5" /> {file.name}
                    <button onClick={() => setFile(null)} className="ml-auto text-red-500">Remove</button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-all">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to select file</p>
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowUpload(false)} className="btn-outline flex-1">Cancel</button>
              <button onClick={handleUpload} disabled={uploading || !file || !docName} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
      ) : docs.length === 0 ? (
        <div className="card text-center py-16">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Vault me koi document nahi hai</p>
          <button onClick={() => setShowUpload(true)} className="btn-primary mt-4">Upload First Document</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => (
            <div key={doc.id} className="card hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{doc.document_name}</p>
                    <p className="text-xs text-gray-500">{doc.original_filename}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{formatSize(doc.file_size_kb)}</span>
                <span>{new Date(doc.created_at).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <a href={`/api/v1/files/vault/${doc.id}`} target="_blank" className="flex-1 btn-outline text-sm py-1.5 flex items-center justify-center gap-1">
                  <Download className="w-4 h-4" /> Download
                </a>
                <button onClick={() => handleDelete(doc.id)} className="px-3 py-1.5 text-sm border border-red-200 text-red-500 rounded-lg hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
