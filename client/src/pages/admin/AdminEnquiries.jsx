import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPhone, HiChatAlt2, HiCheck, HiX, HiRefresh, HiChevronDown } from 'react-icons/hi';
import { adminAPI } from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending:   'bg-amber-50 text-amber-700 border border-amber-200',
  contacted: 'bg-blue-50 text-blue-700 border border-blue-200',
  resolved:  'bg-green-50 text-green-700 border border-green-200',
};

const TYPE_ICONS = {
  callback: <HiPhone className="w-4 h-4 text-nio-gold-600" />,
  enquiry:  <HiChatAlt2 className="w-4 h-4 text-nio-green-600" />,
  contact:  <HiChatAlt2 className="w-4 h-4 text-blue-500" />,
};

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType,   setFilterType]   = useState('');
  const [page, setPage]           = useState(1);
  const [selected, setSelected]   = useState(null);
  const [notes, setNotes]         = useState('');
  const [saving, setSaving]       = useState(false);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filterStatus) params.set('status', filterStatus);
      if (filterType)   params.set('type',   filterType);
      const res = await adminAPI.get(`/admin/enquiries?${params}`);
      setEnquiries(res.data.enquiries);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load enquiries.'); }
    finally { setLoading(false); }
  }, [page, filterStatus, filterType]);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

  const openDetail = (e) => { setSelected(e); setNotes(e.adminNotes || ''); };

  const handleUpdate = async (id, status) => {
    setSaving(true);
    try {
      await adminAPI.put(`/admin/enquiries/${id}`, { status, adminNotes: notes });
      toast.success('Updated!');
      setSelected(null);
      fetchEnquiries();
    } catch { toast.error('Update failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-nio-green-900">Enquiries & Callbacks</h2>
          <p className="text-gray-400 text-sm">{total} total requests</p>
        </div>
        <button
          onClick={() => fetchEnquiries()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
        >
          <HiRefresh className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="input-field py-2 pl-3 pr-8 text-sm appearance-none bg-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="resolved">Resolved</option>
          </select>
          <HiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="input-field py-2 pl-3 pr-8 text-sm appearance-none bg-white"
          >
            <option value="">All Types</option>
            <option value="callback">Callback Requests</option>
            <option value="enquiry">Product Enquiries</option>
            <option value="contact">Contact Form Messages</option>
          </select>
          <HiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
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
                  {['Type', 'Customer', 'Phone', 'Product', 'Message', 'Status', 'Date', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3.5 text-gray-400 font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {enquiries.map((e) => (
                  <tr key={e._id} className="hover:bg-nio-cream/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {TYPE_ICONS[e.type] || <HiChatAlt2 className="w-4 h-4 text-gray-400" />}
                        <span className="capitalize text-xs font-medium text-gray-600">
                          {e.type === 'contact' ? 'Contact' : e.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-nio-green-900">{e.name}</p>
                      {e.email && <p className="text-xs text-gray-400">{e.email}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">{e.phone ? `+91 ${e.phone}` : <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3.5 text-gray-500 max-w-[120px] truncate">
                      {e.productName || e.product?.name || <span className="text-gray-300 italic">General</span>}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 max-w-[160px] truncate">
                      {e.message || <span className="text-gray-300 italic">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`badge text-xs ${STATUS_COLORS[e.status]}`}>{e.status}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      <br />
                      {new Date(e.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => openDetail(e)}
                        className="px-3 py-1.5 rounded-lg bg-nio-green-50 text-nio-green-700 text-xs font-medium hover:bg-nio-green-100 transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                {enquiries.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-14 text-gray-400">No enquiries yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                page === p ? 'bg-nio-green-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Detail / Manage Modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    {TYPE_ICONS[selected.type]}
                    <h3 className="font-serif font-bold text-nio-green-900 capitalize">
                      {selected.type === 'callback' ? 'Callback Request' : selected.type === 'contact' ? 'Contact Form Message' : 'Product Enquiry'}
                    </h3>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-gray-100">
                    <HiX className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Customer info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-nio-cream rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">Name</p>
                      <p className="font-semibold text-nio-green-900">{selected.name}</p>
                    </div>
                    <div className="bg-nio-cream rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">Phone</p>
                      <p className="font-semibold text-nio-green-900">{selected.phone ? `+91 ${selected.phone}` : '—'}</p>
                    </div>
                  </div>
                  {selected.email && (
                    <div className="bg-nio-cream rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">Email</p>
                      <a href={`mailto:${selected.email}`} className="font-medium text-nio-green-800 hover:underline">{selected.email}</a>
                    </div>
                  )}
                  {selected.subject && (
                    <div className="bg-nio-green-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">Subject</p>
                      <p className="font-medium text-nio-green-800">{selected.subject}</p>
                    </div>
                  )}

                  {(selected.productName || selected.product?.name) && (
                    <div className="bg-nio-green-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-1">Product</p>
                      <p className="font-medium text-nio-green-800">{selected.productName || selected.product?.name}</p>
                    </div>
                  )}

                  {selected.message && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Message</p>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{selected.message}</p>
                    </div>
                  )}

                  {/* Admin Notes */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Admin Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input-field resize-none text-sm"
                      rows={3}
                      placeholder="Internal notes, callback outcome..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    {selected.status !== 'contacted' && (
                      <button
                        onClick={() => handleUpdate(selected._id, 'contacted')}
                        disabled={saving}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Mark Contacted
                      </button>
                    )}
                    {selected.status !== 'resolved' && (
                      <button
                        onClick={() => handleUpdate(selected._id, 'resolved')}
                        disabled={saving}
                        className="flex-1 py-2.5 rounded-xl bg-nio-green-800 text-white text-sm font-medium hover:bg-nio-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <HiCheck className="w-4 h-4" /> Resolve
                      </button>
                    )}
                    {selected.status === 'resolved' && (
                      <button
                        onClick={() => handleUpdate(selected._id, 'pending')}
                        disabled={saving}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
