import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiX, HiTag } from 'react-icons/hi';
import { adminAPI } from '../../api/axios';
import toast from 'react-hot-toast';

const emptyForm = { name: '', description: '', sortOrder: 0 };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null); // id or null
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.get('/admin/categories');
      setCategories(res.data.categories || []);
    } catch {
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat.id);
    setForm({ name: cat.name, description: cat.description || '', sortOrder: cat.sortOrder ?? 0 });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await adminAPI.put(`/admin/categories/${editing}`, form);
        toast.success('Category updated!');
      } else {
        await adminAPI.post('/admin/categories', form);
        toast.success('Category created!');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (cat) => {
    try {
      await adminAPI.put(`/admin/categories/${cat.id}`, { isActive: !cat.isActive });
      toast.success(`Category ${!cat.isActive ? 'activated' : 'deactivated'}.`);
      fetchCategories();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    try {
      await adminAPI.delete(`/admin/categories/${cat.id}`);
      toast.success('Category deleted.');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-nio-green-900">Tea Categories</h2>
          <p className="text-gray-400 text-sm">{categories.length} categories</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm py-2.5 px-5">
          <HiPlus className="w-4 h-4" /> Add Category
        </button>
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
                  {['Name', 'Slug', 'Description', 'Order', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-nio-cream/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <HiTag className="w-4 h-4 text-nio-gold-500 shrink-0" />
                        <span className="font-medium text-nio-green-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{cat.slug}</td>
                    <td className="px-5 py-3.5 text-gray-500 max-w-xs truncate">{cat.description || <span className="text-gray-300 italic">—</span>}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-center">{cat.sortOrder}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleActive(cat)}
                        className={`badge text-xs cursor-pointer transition-colors ${
                          cat.isActive
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-1.5 rounded-lg text-nio-green-700 hover:bg-nio-green-50 transition-colors"
                          title="Edit"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400">
                      <HiTag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No categories yet. Add your first one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 22 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-nio-cream rounded-t-2xl">
                  <h3 className="font-serif font-bold text-nio-green-900 text-xl">
                    {editing ? 'Edit Category' : 'New Category'}
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-2 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <HiX className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="p-6 space-y-4">
                  <div>
                    <label className="label">Category Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field"
                      placeholder="e.g. Green Tea"
                    />
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="input-field resize-none"
                      rows={3}
                      placeholder="Brief description of this tea category…"
                    />
                  </div>
                  <div>
                    <label className="label">Sort Order</label>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })}
                      className="input-field"
                      placeholder="0"
                      min={0}
                    />
                    <p className="text-xs text-gray-400 mt-1">Lower numbers appear first.</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 btn-primary text-sm py-2.5 disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Category'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
