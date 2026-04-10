import { useEffect, useState } from 'react';
import { vaultApi } from '../../api/vault';
import type { DocumentVault } from '../../types';
import { Upload, Trash2, FileText, Search, Download, Loader2, X, Archive, Plus } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Vault</h1>
          <p className="text-gray-500 mt-1">Apne sabhi documents yahan store karein — future requests me reuse honge</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2 shadow-md shadow-primary/20">
          <Upload className="w-5 h-5" /> Upload Document
        </button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Upload to Vault</h2>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Document Name</label>
                <input type="text" value={docName} onChange={(e) => setDocName(e.target.value)} className="input-field bg-white" placeholder="e.g. Aadhaar Card" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">File</label>
                {file ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-700">
                    <FileText className="w-5 h-5" /> <span className="flex-1 truncate">{file.name}</span>
                    <button onClick={() => setFile(null)} className="text-red-500 text-xs hover:underline">Remove</button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary mx-auto mb-2 transition-colors" />
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

      {/* Side-by-Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT: Vault Info */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card sticky top-8">
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Archive className="w-8 h-8 text-primary" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{docs.length}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Documents Stored</p>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Files</span>
                <span className="font-bold text-gray-900">{docs.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Total Size</span>
                <span className="font-bold text-gray-900">{formatSize(docs.reduce((sum, d) => sum + (d.file_size_kb || 0), 0))}</span>
              </div>
            </div>

            <button onClick={() => setShowUpload(true)} className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" /> Add Document
            </button>
          </div>
        </div>

        {/* RIGHT: Documents Grid */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
          ) : docs.length === 0 ? (
            <div className="card text-center py-16 lg:min-h-[400px] flex flex-col items-center justify-center">
              <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Vault me koi document nahi hai</p>
              <button onClick={() => setShowUpload(true)} className="btn-primary mt-4">Upload First Document</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {docs.map((doc) => (
                <div key={doc.id} className="card hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{doc.document_name}</p>
                        <p className="text-xs text-gray-500 truncate">{doc.original_filename}</p>
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
                    <button onClick={() => handleDelete(doc.id)} className="px-3 py-1.5 text-sm border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
