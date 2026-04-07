import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { useAdmin } from '../../context/AdminContext';

export default function AdminLogin() {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { login, isAdmin }      = useAdmin();
  const navigate                = useNavigate();

  if (isAdmin) { navigate('/admin/dashboard'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nio-green-950 flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md bg-white rounded-3xl shadow-nio-lg overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="tea-gradient px-8 py-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-3">
            <svg viewBox="0 0 40 40" className="w-9 h-9 fill-nio-gold-400">
              <path d="M20 4C12 4 6 12 6 20c0 4 2 8 5 10.5C13 32 16 33 20 33s7-1 9-2.5C32 28 34 24 34 20c0-8-6-16-14-16zm0 2c3 0 6 1.5 8.5 4-3 .5-6 2-8.5 4.5C17.5 12 14.5 10.5 11.5 10c2.5-2.5 5.5-4 8.5-4zm0 27c-3.5 0-6.5-1-8.5-3 1-3 3-6 6-8 1-1 2-1.7 2.5-2.5.5.8 1.5 1.5 2.5 2.5 3 2 5 5 6 8-2 2-5 3-8.5 3z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-semibold text-white mb-1">Nio Tea Admin</h1>
          <p className="text-nio-green-200 text-sm">Secure admin access</p>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@niotea.com"
                className="input-field"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input-field pr-11"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In to Admin Panel'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-nio-cream rounded-xl text-xs text-gray-500 border border-nio-green-100">
            <p className="font-medium text-nio-green-800 mb-1">Default credentials (change after first login):</p>
            <p>Email: admin@niotea.com</p>
            <p>Password: Admin@123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
