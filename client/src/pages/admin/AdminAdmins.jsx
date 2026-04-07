import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiPlus, HiPencil, HiTrash, HiX, HiCheck, HiShieldCheck,
  HiUser, HiLockClosed, HiEye, HiEyeOff, HiRefresh,
} from 'react-icons/hi';
import { adminAPI } from '../../api/axios';
import { useAdmin } from '../../context/AdminContext';
import toast from 'react-hot-toast';

const ROLE_BADGE = {
  superadmin: 'bg-amber-100 text-amber-700 border border-amber-200',
  admin:      'bg-nio-green-50 text-nio-green-700 border border-nio-green-200',
};

const inputCls = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nio-green-400 bg-white';

function Modal({ title, onClose, children }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-serif font-bold text-nio-green-900 text-lg">{title}</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <HiX className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder || 'Password (min. 6 characters)'}
        className={`${inputCls} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function AdminAdmins() {
  const { admin: currentAdmin } = useAdmin();
  const [admins, setAdmins]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editAdmin, setEditAdmin]   = useState(null);
  const [saving, setSaving]         = useState(false);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [editForm, setEditForm] = useState({ name: '', role: 'admin', isActive: true, password: '' });

  // Only superadmin can access this page (after hooks)
  if (currentAdmin && currentAdmin.role !== 'superadmin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.get('/admin/admins');
      setAdmins(res.data.admins);
    } catch {
      toast.error('Failed to load admin accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      return toast.error('All fields are required.');
    }
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setSaving(true);
    try {
      await adminAPI.post('/admin/admins', form);
      toast.success('Admin account created!');
      setShowCreate(false);
      setForm({ name: '', email: '', password: '', role: 'admin' });
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin.');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (a) => {
    setEditAdmin(a);
    setEditForm({ name: a.name, role: a.role, isActive: a.isActive, password: '' });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return toast.error('Name is required.');
    if (editForm.password && editForm.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setSaving(true);
    try {
      const payload = { name: editForm.name, role: editForm.role, isActive: editForm.isActive };
      if (editForm.password) payload.password = editForm.password;
      await adminAPI.put(`/admin/admins/${editAdmin._id}`, payload);
      toast.success('Admin updated!');
      setEditAdmin(null);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete admin "${name}"? This cannot be undone.`)) return;
    try {
      await adminAPI.delete(`/admin/admins/${id}`);
      toast.success('Admin deleted.');
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  const toggleActive = async (a) => {
    try {
      await adminAPI.put(`/admin/admins/${a._id}`, { isActive: !a.isActive });
      toast.success(`Admin ${a.isActive ? 'deactivated' : 'activated'}.`);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-nio-green-900">Admin Accounts</h2>
          <p className="text-gray-400 text-sm">{admins.length} admin{admins.length !== 1 ? 's' : ''} registered — superadmin access only</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAdmins}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-nio-green-200 text-nio-green-700 text-sm hover:bg-nio-green-50 transition-colors"
          >
            <HiRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-nio-green-800 text-white text-sm font-medium hover:bg-nio-green-700 transition-colors"
          >
            <HiPlus className="w-4 h-4" /> Add Admin
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2 items-start">
        <HiShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-amber-700 text-sm">
          Only <strong>Superadmins</strong> can manage admin accounts. Regular admins can see all other parts of the panel but cannot add or remove admin users.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-nio overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Admin</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Last Login</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-nio-green-600 border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">No admin accounts found.</td>
                </tr>
              ) : (
                admins.map((a) => (
                  <motion.tr key={a._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${a.role === 'superadmin' ? 'bg-amber-100 text-amber-700' : 'bg-nio-green-100 text-nio-green-700'}`}>
                          {a.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{a.name}</p>
                          {a._id === currentAdmin?.id && (
                            <span className="text-xs text-nio-green-600 font-medium">You</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{a.email}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_BADGE[a.role]}`}>
                        {a.role === 'superadmin' ? '⭐ Superadmin' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => a._id !== currentAdmin?.id && toggleActive(a)}
                        disabled={a._id === currentAdmin?.id}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          a.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                        } ${a._id === currentAdmin?.id ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
                      >
                        {a.isActive ? <><HiCheck className="w-3 h-3" />Active</> : <><HiX className="w-3 h-3" />Inactive</>}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {a.lastLogin ? new Date(a.lastLogin).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(a)}
                          className="p-1.5 rounded-lg text-nio-green-600 hover:bg-nio-green-50 transition-colors"
                          title="Edit"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        {a._id !== currentAdmin?.id && (
                          <button
                            onClick={() => handleDelete(a._id, a.name)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreate && (
        <Modal title="Add New Admin" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  className={`${inputCls} pl-9`}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email Address</label>
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@niotea.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Password</label>
              <PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Role</label>
              <select
                className={inputCls}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="admin">Admin — Full access (cannot manage admins)</option>
                <option value="superadmin">Superadmin — Full access incl. admin management</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-nio-green-800 text-white text-sm font-medium hover:bg-nio-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <HiPlus className="w-4 h-4" />}
                Create Admin
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Admin Modal */}
      {editAdmin && (
        <Modal title={`Edit — ${editAdmin.name}`} onClose={() => setEditAdmin(null)}>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
              <input
                className={inputCls}
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Role</label>
              <select
                className={inputCls}
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                disabled={editAdmin._id === currentAdmin?.id}
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</label>
              <select
                className={inputCls}
                value={editForm.isActive ? 'active' : 'inactive'}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'active' })}
                disabled={editAdmin._id === currentAdmin?.id}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive (blocked from login)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                New Password <span className="normal-case text-gray-400 font-normal">(leave blank to keep current)</span>
              </label>
              <PasswordInput
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditAdmin(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-nio-green-800 text-white text-sm font-medium hover:bg-nio-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <HiCheck className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
