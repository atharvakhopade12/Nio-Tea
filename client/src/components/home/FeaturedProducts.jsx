import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../ui/ProductCard';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    API.get('/products?featured=true&limit=6')
      .then((res) => setProducts(res.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  return (
    <section className="section-padding bg-nio-cream">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-14" data-aos="fade-up">
          <p className="text-nio-gold-600 text-xs tracking-[0.3em] uppercase mb-3">Our Collection</p>
          <h2 className="section-title">
            Featured <span className="text-gradient">Teas</span>
          </h2>
          <div className="gold-divider" />
          <p className="section-subtitle mt-4 max-w-xl mx-auto">
            Handpicked selections from our premium catalog — sign in to unlock prices.
          </p>
        </div>

        {/* Price Unlock Banner */}
        {!isLoggedIn && (
          <motion.div
            className="bg-nio-green-900 text-white rounded-2xl px-6 py-4 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <p className="font-serif font-semibold text-white">Prices hidden for guests</p>
                <p className="text-nio-green-300 text-sm">Sign in to reveal product prices instantly.</p>
              </div>
            </div>
            <Link to="/login" className="btn-gold text-sm py-2 px-6 shrink-0">
              Sign In to View Prices
            </Link>
          </motion.div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-16">Products coming soon...</p>
        )}

        {/* View All */}
        <div className="text-center mt-12" data-aos="fade-up">
          <Link to="/products" className="btn-outline">
            View Full Catalog
          </Link>
        </div>
      </div>
    </section>
  );
}
