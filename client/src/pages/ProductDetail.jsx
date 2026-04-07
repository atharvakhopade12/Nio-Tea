import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowLeft, HiLockClosed, HiPhone, HiChatAlt2, HiX, HiCheck } from 'react-icons/hi';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const { isLoggedIn, user }      = useAuth();

  // Enquiry / callback modal state
  const [showModal, setShowModal]   = useState(false);
  const [modalType, setModalType]   = useState('enquiry'); // 'enquiry' | 'callback'
  const [message, setMessage]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  useEffect(() => {
    setLoading(true);
    API.get(`/products/${slug}`)
      .then((res) => setProduct(res.data.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug, isLoggedIn]);

  const openModal = (type) => {
    setModalType(type);
    setMessage('');
    setSubmitted(false);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await API.post('/enquiries', {
        type: modalType,
        message,
        productId:   product?._id,
        productName: product?.name,
      });
      setSubmitted(true);
      toast.success(
        modalType === 'callback'
          ? 'Callback requested! Our team will call you shortly.'
          : 'Enquiry sent! We will get back to you soon.'
      );
      setTimeout(() => setShowModal(false), 2000);
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="pt-28 min-h-screen flex items-center justify-center">
      <div className="loader" />
    </div>
  );

  if (!product) return (
    <div className="pt-28 min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-6xl">🍃</div>
      <h2 className="font-serif font-bold text-2xl text-nio-green-900">Product not found</h2>
      <Link to="/products" className="btn-primary">Back to Catalog</Link>
    </div>
  );

  const images = product.images?.length ? product.images : [];

  return (
    <div className="pt-20 bg-gray-50 min-h-screen">
      <div className="container-custom py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/products" className="flex items-center gap-1 hover:text-nio-green-800 transition-colors">
            <HiArrowLeft className="w-4 h-4" /> Products
          </Link>
          <span>/</span>
          <span className="text-nio-green-800 font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="bg-white rounded-2xl overflow-hidden aspect-square shadow-nio mb-3">
              {images.length > 0 ? (
                <img
                  src={images[activeImg]?.url}
                  alt={images[activeImg]?.alt || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-nio-cream">
                  <svg viewBox="0 0 60 60" className="w-24 h-24 opacity-20">
                    <path d="M30 8C18 8 9 17 9 29c0 12 9 21 21 21s21-9 21-21-9-21-21-21z" fill="#2d5520"/>
                  </svg>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImg === i ? 'border-nio-green-800' : 'border-transparent hover:border-nio-green-300'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <span className="badge bg-nio-green-50 text-nio-green-700 mb-3">{product.category}</span>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-nio-green-900 mb-1">{product.name}</h1>
            {product.origin && <p className="text-gray-400 text-sm mb-4">📍 Origin: {product.origin}</p>}
            {product.leafGrade && <p className="text-nio-gold-600 text-xs font-medium mb-4">Grade: {product.leafGrade}</p>}

            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* Variants / Price */}
            {product.variants?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-serif font-bold text-nio-green-900 mb-3">Available Sizes & Pricing</h3>
                {isLoggedIn ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    {product.variants.map((v, i) => (
                      <div key={i} className="bg-nio-cream rounded-xl p-3 border border-nio-green-100">
                        <p className="font-medium text-nio-green-900 text-sm">{v.weight}</p>
                        <p className="text-nio-gold-600 font-bold text-lg">₹{v.price?.toLocaleString('en-IN')}</p>
                        {v.sku && <p className="text-gray-400 text-xs">SKU: {v.sku}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-nio-green-900 rounded-xl p-5 text-white flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-3">
                      <HiLockClosed className="w-6 h-6 text-nio-gold-400" />
                      <div>
                        <p className="font-semibold text-sm">Prices hidden</p>
                        <p className="text-nio-green-300 text-xs">{product.variants.length} variants available</p>
                      </div>
                    </div>
                    <Link to="/login" className="btn-gold text-xs py-2 px-5">Sign In to View Prices</Link>
                  </div>
                )}
              </div>
            )}

            {/* Ingredients */}
            {product.ingredients?.length > 0 && (
              <div className="mb-5">
                <h4 className="font-serif font-semibold text-nio-green-900 mb-2">Ingredients</h4>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ing, i) => (
                    <span key={i} className="badge bg-nio-green-50 text-nio-green-700 text-xs">{ing}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Brewing */}
            {product.brewingInstructions?.temperature && (
              <div className="bg-nio-cream rounded-xl p-4 text-sm">
                <h4 className="font-serif font-semibold text-nio-green-900 mb-2">☕ Brewing Guide</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {product.brewingInstructions.temperature && (
                    <div><p className="text-gray-400 text-xs">Temp</p><p className="font-medium text-nio-green-800">{product.brewingInstructions.temperature}</p></div>
                  )}
                  {product.brewingInstructions.time && (
                    <div><p className="text-gray-400 text-xs">Time</p><p className="font-medium text-nio-green-800">{product.brewingInstructions.time}</p></div>
                  )}
                  {product.brewingInstructions.quantity && (
                    <div><p className="text-gray-400 text-xs">Quantity</p><p className="font-medium text-nio-green-800">{product.brewingInstructions.quantity}</p></div>
                  )}
                </div>
              </div>
            )}

            {/* ── Enquiry / Callback Box ─────────────────────────────────── */}
            {isLoggedIn ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border border-nio-green-100 rounded-2xl p-5 bg-gradient-to-br from-nio-cream to-white"
              >
                <h4 className="font-serif font-semibold text-nio-green-900 mb-1">Interested in this tea?</h4>
                <p className="text-gray-400 text-xs mb-4">Our team is ready to help with bulk orders, pricing, or any questions.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => openModal('callback')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-nio-green-800 text-white text-sm font-medium hover:bg-nio-green-700 transition-all shadow-sm hover:shadow-md"
                  >
                    <HiPhone className="w-4 h-4" />
                    Request a Callback
                  </button>
                  <button
                    onClick={() => openModal('enquiry')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-nio-green-800 text-nio-green-800 text-sm font-medium hover:bg-nio-green-50 transition-all"
                  >
                    <HiChatAlt2 className="w-4 h-4" />
                    Enquire Now
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="border border-dashed border-nio-green-200 rounded-2xl p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">
                  <Link to="/login" className="text-nio-green-700 font-semibold hover:underline">Sign in</Link> to enquire or request a callback
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Enquiry / Callback Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => !submitting && setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1,  y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    {modalType === 'callback'
                      ? <HiPhone className="w-5 h-5 text-nio-gold-600" />
                      : <HiChatAlt2 className="w-5 h-5 text-nio-green-700" />}
                    <h3 className="font-serif font-bold text-nio-green-900">
                      {modalType === 'callback' ? 'Request a Callback' : 'Enquire Now'}
                    </h3>
                  </div>
                  {!submitting && (
                    <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                      <HiX className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>

                <div className="px-6 py-5 space-y-4">
                  {submitted ? (
                    <div className="flex flex-col items-center gap-3 py-6">
                      <div className="w-14 h-14 rounded-full bg-nio-green-50 flex items-center justify-center">
                        <HiCheck className="w-7 h-7 text-nio-green-700" />
                      </div>
                      <p className="font-semibold text-nio-green-900">
                        {modalType === 'callback' ? 'Callback Requested!' : 'Enquiry Sent!'}
                      </p>
                      <p className="text-sm text-gray-400 text-center">
                        {modalType === 'callback'
                          ? 'Our team will call you at your registered number shortly.'
                          : 'We will get back to you within 24 hours.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Pre-filled user info */}
                      <div className="bg-nio-cream rounded-xl p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-nio-green-800 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-nio-green-900 text-sm">{user?.name}</p>
                          <p className="text-xs text-gray-400">+91 {user?.phone}</p>
                        </div>
                      </div>

                      <div className="bg-nio-green-50 rounded-xl px-3 py-2 text-xs text-nio-green-700">
                        Product: <span className="font-semibold">{product?.name}</span>
                      </div>

                      {modalType === 'enquiry' && (
                        <div>
                          <label className="text-xs text-gray-500 mb-1.5 block">Your message (optional)</label>
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            placeholder="Ask about bulk pricing, certifications, delivery, etc..."
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-nio-green-300 resize-none"
                          />
                        </div>
                      )}

                      {modalType === 'callback' && (
                        <p className="text-sm text-gray-500 text-center py-2">
                          We will call you at <span className="font-semibold text-nio-green-800">+91 {user?.phone}</span> within business hours (Mon–Sat, 10 AM – 6 PM).
                        </p>
                      )}

                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full py-3 rounded-xl bg-nio-green-800 text-white font-medium text-sm hover:bg-nio-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : modalType === 'callback' ? (
                          <><HiPhone className="w-4 h-4" /> Confirm Callback</>
                        ) : (
                          <><HiChatAlt2 className="w-4 h-4" /> Send Enquiry</>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
