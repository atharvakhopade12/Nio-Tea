import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiDownload, HiPencil, HiTrash, HiX, HiCheck, HiUser } from 'react-icons/hi';
import { adminAPI } from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving]     = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      const res = await adminAPI.get(`/admin/users?${params}`);
      setUsers(res.data.users);
      setTotal(res.data.total);
      setPages(Math.ceil(res.data.total / 20));
    } catch { toast.error('Failed to load users.'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleExport = async (format) => {
    try {
      const res = await adminAPI.get(`/admin/users/export?format=${format}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `nio-tea-users.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch { toast.error('Export failed.'); }
  };

  const handleUpdate = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await adminAPI.put(`/admin/users/${editUser._id}`, { name: editName });
      toast.success('User updated.');
      setEditUser(null);
      fetchUsers();
    } catch { toast.error('Update failed.'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (user) => {
    try {
      await adminAPI.put(`/admin/users/${user._id}`, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}.`);
      fetchUsers();
    } catch { toast.error('Failed to update status.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await adminAPI.delete(`/admin/users/${id}`);
      toast.success('User deleted.');
      fetchUsers();
    } catch { toast.error('Delete failed.'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-nio-green-900">Users</h2>
          <p className="text-gray-400 text-sm">{total} registered users</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('xlsx')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-nio-green-800 text-white text-sm font-medium hover:bg-nio-green-700 transition-colors">
            <HiDownload className="w-4 h-4" /> Export Excel
          </button>
          <button onClick={() => handleExport('csv')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-nio-green-200 text-nio-green-800 text-sm font-medium hover:bg-nio-green-50 transition-colors">
            <HiDownload className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or phone..."
          className="input-field pl-10 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-nio overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="loader" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr>
                  {['#', 'User', 'Phone', 'Verified', 'Status', 'Registered', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u, i) => (
                  <tr key={u._id} className="hover:bg-nio-cream/30 transition-colors">
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{(page - 1) * 20 + i + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-nio-green-100 flex items-center justify-center">
                          <span className="text-nio-green-800 font-bold text-xs">{u.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-nio-green-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-gray-600">+91 {u.phone}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge text-xs ${u.isVerified ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                        {u.isVerified ? '✓ Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleActive(u)}
                        className={`badge text-xs cursor-pointer transition-colors hover:opacity-80 ${u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setEditUser(u); setEditName(u.name); }}
                          className="p-1.5 rounded-lg text-nio-green-700 hover:bg-nio-green-50 transition-colors"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {[...Array(pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${page === i + 1 ? 'bg-nio-green-800 text-white' : 'bg-white text-nio-green-700 hover:bg-nio-green-50'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Edit User Modal */}
      <AnimatePresence>
        {editUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setEditUser(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-2xl shadow-nio-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-serif font-bold text-nio-green-900 text-lg">Edit User</h3>
                  <button onClick={() => setEditUser(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                    <HiX className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-field"
                      placeholder="User's name"
                    />
                  </div>
                  <div>
                    <label className="label text-gray-400">Phone Number (read-only)</label>
                    <input value={`+91 ${editUser.phone}`} disabled className="input-field bg-gray-50 text-gray-400" />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setEditUser(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleUpdate} disabled={saving} className="flex-1 btn-primary py-3 text-sm disabled:opacity-50">
                    <HiCheck className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Update User'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
