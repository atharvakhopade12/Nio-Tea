import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiPencil, HiTrash, HiX, HiPhotograph, HiCheck, HiSearch } from 'react-icons/hi';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { adminAPI } from '../../api/axios';
import toast from 'react-hot-toast';

const LEAF_GRADES = ['TGFOP', 'FTGFOP', 'SFTGFOP', 'BOP', 'BOPF', 'CTC', 'Dust', 'Other'];

const empty = {
  name: '', category: '', leafGrade: '', origin: '', description: '',
  shortDescription: '', ingredients: '', tags: '', isFeatured: false, isActive: true,
  variants: [{ weight: '250g', price: '', sku: '' }],
  brewingInstructions: { temperature: '', time: '', quantity: '' },
  seo: { metaTitle: '', metaDescription: '' },
  images: [],
};

// Image crop helper
const getCroppedImg = (image, crop) => {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
};

export default function AdminProducts() {
  const [products, setProducts]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(empty);
  const [saving, setSaving]         = useState(false);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [categories, setCategories] = useState([]);

  // Image crop state
  const [imgSrc, setImgSrc]         = useState('');
  const [crop, setCrop]             = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [showCrop, setShowCrop]     = useState(false);
  const [uploading, setUploading]   = useState(false);
  const imgRef                      = useRef(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.get(`/admin/products?page=${page}&limit=15${search ? `&search=${search}` : ''}`);
      setProducts(res.data.products);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load products.'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Fetch active categories for the product form
  useEffect(() => {
    adminAPI.get('/admin/categories')
      .then((res) => setCategories((res.data.categories || []).filter((c) => c.isActive)))
      .catch(() => {});
  }, []);

  const openAdd  = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p._id);
    setForm({
      ...p,
      ingredients: p.ingredients?.join(', ') || '',
      tags: p.tags?.join(', ') || '',
    });
    setModalOpen(true);
  };

  const handleVariantChange = (i, key, val) => {
    const v = [...form.variants];
    v[i] = { ...v[i], [key]: val };
    setForm({ ...form, variants: v });
  };
  const addVariant    = () => setForm({ ...form, variants: [...form.variants, { weight: '', price: '', sku: '' }] });
  const removeVariant = (i) => setForm({ ...form, variants: form.variants.filter((_, idx) => idx !== i) });

  // Image upload flow
  const onFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setImgSrc(reader.result); setShowCrop(true); };
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const c = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height);
    setCrop(c);
    // Auto-complete so upload works even without user adjusting the crop
    const pxW = c.width / 100 * width;
    const pxH = c.height / 100 * height;
    const pxX = c.x / 100 * width;
    const pxY = c.y / 100 * height;
    setCompletedCrop({ x: pxX, y: pxY, width: pxW, height: pxH, unit: 'px' });
  };

  const handleCropAndUpload = async () => {
    if (!completedCrop || !imgRef.current) return;
    setUploading(true);
    try {
      const blob = await getCroppedImg(imgRef.current, completedCrop);
      const fd = new FormData();
      fd.append('image', blob, 'product.jpg');
      const res = await adminAPI.post('/admin/products/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), { ...res.data.image, alt: prev.name, isPrimary: (prev.images || []).length === 0 }],
      }));
      setShowCrop(false);
      setImgSrc('');
      toast.success('Image uploaded!');
    } catch { toast.error('Image upload failed.'); }
    finally { setUploading(false); }
  };

  const removeImage = async (img, idx) => {
    if (img.publicId) {
      await adminAPI.delete(`/admin/products/image/${encodeURIComponent(img.publicId)}`).catch(() => {});
    }
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        ingredients: form.ingredients.split(',').map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
        variants: form.variants.map((v) => ({ ...v, price: Number(v.price) })),
      };
      if (editing) { await adminAPI.put(`/admin/products/${editing}`, payload); toast.success('Product updated!'); }
      else         { await adminAPI.post('/admin/products', payload); toast.success('Product created!'); }
      setModalOpen(false);
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await adminAPI.delete(`/admin/products/${id}`);
      toast.success('Product deleted.');
      fetchProducts();
    } catch { toast.error('Delete failed.'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-nio-green-900">Products</h2>
          <p className="text-gray-400 text-sm">{total} total products</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm py-2.5 px-5">
          <HiPlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products..."
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
                  {['Product', 'Category', 'Variants', 'Featured', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-gray-400 font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-nio-cream/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-nio-cream shrink-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">🍃</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-nio-green-900">{p.name}</p>
                          {p.origin && <p className="text-xs text-gray-400">{p.origin}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="badge bg-nio-green-50 text-nio-green-700 text-xs">{p.category}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{p.variants?.length || 0}</td>
                    <td className="px-5 py-3.5">
                      {p.isFeatured && <span className="text-nio-gold-500 text-xs font-medium">⭐ Featured</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge text-xs ${p.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-nio-green-700 hover:bg-nio-green-50 transition-colors">
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white z-50 flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-nio-cream">
                <h3 className="font-serif font-bold text-nio-green-900 text-xl">
                  {editing ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-200 transition-colors">
                  <HiX className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Image crop overlay */}
              {showCrop && (
                <div className="absolute inset-0 bg-black/80 z-10 flex flex-col items-center justify-center gap-4 p-6">
                  <p className="text-white font-medium text-sm mb-2">Crop & Preview Image</p>
                  <div className="max-h-96 overflow-auto">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, pc) => setCrop(pc)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={1}
                      circularCrop={false}
                    >
                      <img ref={imgRef} src={imgSrc} onLoad={onImageLoad} className="max-w-full max-h-80" alt="Crop" />
                    </ReactCrop>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowCrop(false)} className="px-5 py-2 rounded-xl border border-white/30 text-white text-sm hover:bg-white/10">
                      Cancel
                    </button>
                    <button onClick={handleCropAndUpload} disabled={uploading} className="btn-gold text-sm py-2 px-6 disabled:opacity-50">
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-5">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="label">Product Name *</label>
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required placeholder="Darjeeling First Flush" />
                    </div>
                    <div>
                      <label className="label">Category *</label>
                      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" required>
                        <option value="">Select category</option>
                        {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Leaf Grade</label>
                      <select value={form.leafGrade} onChange={(e) => setForm({ ...form, leafGrade: e.target.value })} className="input-field">
                        <option value="">Select grade</option>
                        {LEAF_GRADES.map((g) => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Origin</label>
                      <input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className="input-field" placeholder="Darjeeling, West Bengal" />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 accent-nio-green-700" />
                        <span className="text-sm font-medium text-nio-green-900">Featured Product</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-nio-green-700" />
                        <span className="text-sm font-medium text-nio-green-900">Active</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="label">Short Description</label>
                    <input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="input-field" placeholder="One-line description" />
                  </div>
                  <div>
                    <label className="label">Full Description *</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows={4} required />
                  </div>
                  <div>
                    <label className="label">Ingredients (comma-separated)</label>
                    <input value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} className="input-field" placeholder="Organic black tea, Rose petals, Cardamom" />
                  </div>
                  <div>
                    <label className="label">Tags (comma-separated)</label>
                    <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-field" placeholder="premium, organic, gifting" />
                  </div>

                  {/* Brewing */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="label">Temperature</label>
                      <input value={form.brewingInstructions?.temperature} onChange={(e) => setForm({ ...form, brewingInstructions: { ...form.brewingInstructions, temperature: e.target.value } })} className="input-field" placeholder="90°C" />
                    </div>
                    <div>
                      <label className="label">Brew Time</label>
                      <input value={form.brewingInstructions?.time} onChange={(e) => setForm({ ...form, brewingInstructions: { ...form.brewingInstructions, time: e.target.value } })} className="input-field" placeholder="2-3 min" />
                    </div>
                    <div>
                      <label className="label">Quantity</label>
                      <input value={form.brewingInstructions?.quantity} onChange={(e) => setForm({ ...form, brewingInstructions: { ...form.brewingInstructions, quantity: e.target.value } })} className="input-field" placeholder="2g per cup" />
                    </div>
                  </div>

                  {/* Variants */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="label mb-0">Pricing Variants</label>
                      <button type="button" onClick={addVariant} className="text-xs text-nio-green-700 hover:underline font-medium">+ Add Variant</button>
                    </div>
                    <div className="space-y-2">
                      {form.variants.map((v, i) => (
                        <div key={i} className="grid grid-cols-3 gap-2 items-center bg-nio-cream rounded-xl p-3">
                          <input value={v.weight} onChange={(e) => handleVariantChange(i, 'weight', e.target.value)} className="input-field text-xs py-2" placeholder="250g" />
                          <input type="number" value={v.price} onChange={(e) => handleVariantChange(i, 'price', e.target.value)} className="input-field text-xs py-2" placeholder="Price (₹)" />
                          <div className="flex gap-2">
                            <input value={v.sku} onChange={(e) => handleVariantChange(i, 'sku', e.target.value)} className="input-field text-xs py-2 flex-1" placeholder="SKU" />
                            {form.variants.length > 1 && (
                              <button type="button" onClick={() => removeVariant(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                <HiX className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="label">Product Images</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(form.images || []).map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(img, idx)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <HiTrash className="w-5 h-5 text-white" />
                          </button>
                          {img.isPrimary && <div className="absolute bottom-0 left-0 right-0 bg-nio-gold-500 text-white text-center text-xs py-0.5">Primary</div>}
                        </div>
                      ))}
                      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-nio-green-200 flex flex-col items-center justify-center cursor-pointer hover:border-nio-green-500 hover:bg-nio-green-50 transition-all">
                        <HiPhotograph className="w-5 h-5 text-nio-green-400" />
                        <span className="text-xs text-nio-green-400 mt-1">Add</span>
                        <input type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
                      </label>
                    </div>
                  </div>

                  {/* SEO */}
                  <div>
                    <label className="label">SEO Meta Title</label>
                    <input value={form.seo?.metaTitle} onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaTitle: e.target.value } })} className="input-field" placeholder="Auto-generated if blank" />
                  </div>
                  <div>
                    <label className="label">SEO Meta Description</label>
                    <textarea value={form.seo?.metaDescription} onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaDescription: e.target.value } })} className="input-field resize-none" rows={2} />
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary py-3 disabled:opacity-50">
                    <HiCheck className="w-4 h-4" />
                    {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
