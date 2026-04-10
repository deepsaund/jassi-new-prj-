import { useState, FormEvent } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../api/auth';
import { Save, Lock, User } from 'lucide-react';

export default function CustomerProfile() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [message, setMessage] = useState('');
  const [pwMessage, setPwMessage] = useState('');

  const handleProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authApi.updateProfile(form);
      setUser(res.data.data);
      setMessage('Profile updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch {}
    setSaving(false);
  };

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await authApi.updatePassword(pwForm);
      setPwForm({ current_password: '', password: '', password_confirmation: '' });
      setPwMessage('Password updated!');
      setTimeout(() => setPwMessage(''), 3000);
    } catch (err: any) {
      setPwMessage(err.response?.data?.message || 'Password update failed');
    }
    setSavingPw(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      {/* Profile Info */}
      <form onSubmit={handleProfile} className="card space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><User className="w-5 h-5" /> Personal Information</h2>
        {message && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">{message}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (cannot change)</label>
          <input type="email" value={user?.email} disabled className="input-field bg-gray-100 cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
          <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field min-h-[80px]" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Save className="w-5 h-5" /> Save</>}
        </button>
      </form>

      {/* Password */}
      <form onSubmit={handlePassword} className="card space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Lock className="w-5 h-5" /> Change Password</h2>
        {pwMessage && <div className="p-3 bg-amber-50 text-amber-700 rounded-lg text-sm">{pwMessage}</div>}
        <input type="password" placeholder="Current Password" value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} className="input-field" required />
        <input type="password" placeholder="New Password (min 8 chars)" value={pwForm.password} onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })} className="input-field" required minLength={8} />
        <input type="password" placeholder="Confirm New Password" value={pwForm.password_confirmation} onChange={(e) => setPwForm({ ...pwForm, password_confirmation: e.target.value })} className="input-field" required />
        <button type="submit" disabled={savingPw} className="btn-primary flex items-center gap-2">
          {savingPw ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Lock className="w-5 h-5" /> Update Password</>}
        </button>
      </form>
    </div>
  );
}
