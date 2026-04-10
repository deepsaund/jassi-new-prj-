import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { UserPlus, Eye, EyeOff, FileCheck } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: 'customer' as 'customer' | 'b2b',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords match nahi ho rahe');
      return;
    }
    setLoading(true);
    try {
      await register(formData);
      const user = useAuthStore.getState().user;
      navigate(user!.role === 'b2b' ? '/b2b/dashboard' : '/customer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-accent blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white blur-3xl"></div>
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <FileCheck className="w-14 h-14 text-accent" />
            <h1 className="text-5xl font-bold text-white tracking-tight">Jassi</h1>
          </div>
          <p className="text-xl text-white/80 leading-relaxed max-w-md mx-auto">
            Register karein aur shuru karein apni document services
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <FileCheck className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Jassi</h1>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-500 mb-8">Apna account banayein</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => update('name', e.target.value)}
                className="input-field"
                placeholder="Aapka naam"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => update('email', e.target.value)}
                className="input-field"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="input-field"
                placeholder="9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Type</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => update('role', 'customer')}
                  className={`flex-1 py-2.5 rounded-lg border-2 font-medium transition-all ${
                    formData.role === 'customer'
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 text-gray-600 hover:border-primary/50'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => update('role', 'b2b')}
                  className={`flex-1 py-2.5 rounded-lg border-2 font-medium transition-all ${
                    formData.role === 'b2b'
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 text-gray-600 hover:border-primary/50'
                  }`}
                >
                  B2B Partner
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => update('password', e.target.value)}
                  className="input-field pr-12"
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={formData.password_confirmation}
                onChange={(e) => update('password_confirmation', e.target.value)}
                className="input-field"
                placeholder="Password dobara daalein"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" /> Register
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500">
            Pehle se account hai?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Login karein
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
