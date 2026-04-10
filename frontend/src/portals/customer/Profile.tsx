import { useState, FormEvent } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../api/auth';
import { Save, Lock, User, Mail, Shield, Loader2 } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      {/* Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT: Avatar Card */}
        <div className="lg:col-span-4">
          <div className="card sticky top-8 text-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary text-4xl font-bold mx-auto mb-4 shadow-inner">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-1">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </div>
            <span className="inline-block mt-2 badge-neutral uppercase">{user?.role}</span>

            <div className="mt-6 pt-4 border-t border-gray-100 text-left space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-600">
                <Shield className="w-4 h-4 text-gray-400 shrink-0" />
                <span>Account Active</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <User className="w-4 h-4 text-gray-400 shrink-0" />
                <span>Role: <strong className="capitalize">{user?.role}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Edit Forms */}
        <div className="lg:col-span-8 space-y-6">
          {/* Profile Info */}
          <form onSubmit={handleProfile} className="card space-y-5">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wide border-b border-gray-100 pb-3">
              <User className="w-4 h-4 text-gray-400" /> Personal Information
            </h2>
            {message && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">{message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Email (cannot change)</label>
                <input type="email" value={user?.email} disabled className="input-field bg-gray-100 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Full Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field bg-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Address</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field bg-white min-h-[80px]" />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
              </button>
            </div>
          </form>

          {/* Password */}
          <form onSubmit={handlePassword} className="card space-y-5">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wide border-b border-gray-100 pb-3">
              <Lock className="w-4 h-4 text-gray-400" /> Change Password
            </h2>
            {pwMessage && <div className="p-3 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">{pwMessage}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Current Password</label>
                <input type="password" value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} className="input-field bg-white" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">New Password</label>
                <input type="password" value={pwForm.password} onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })} className="input-field bg-white" required minLength={8} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase">Confirm Password</label>
                <input type="password" value={pwForm.password_confirmation} onChange={(e) => setPwForm({ ...pwForm, password_confirmation: e.target.value })} className="input-field bg-white" required />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={savingPw} className="btn-primary flex items-center gap-2">
                {savingPw ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Lock className="w-5 h-5" /> Update Password</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
