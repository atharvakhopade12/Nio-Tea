import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { HiLockClosed, HiStar } from 'react-icons/hi';

export default function ProductCard({ product, index = 0 }) {
  const { isLoggedIn } = useAuth();

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const lowestVariant = product.variants?.reduce((min, v) => (!min || v.price < min.price ? v : min), null);

  return (
    <motion.div
      className="card group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      {/* Image */}
      <Link to={`/products/${product.slug}`} className="block relative overflow-hidden aspect-square bg-nio-cream">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-nio-green-50">
            <svg viewBox="0 0 60 60" className="w-14 h-14 opacity-25">
              <path d="M30 8C18 8 9 17 9 29c0 6 2.5 11 6.5 14.5C17.5 45.5 23 47 30 47s12.5-1.5 14.5-3.5C48.5 40 51 35 51 29c0-12-9-21-21-21z" fill="#2d5520"/>
            </svg>
            <span className="text-nio-green-400 text-xs">No Image</span>
          </div>
        )}
        {product.isFeatured && (
          <div className="absolute top-3 left-3">
            <span className="badge bg-nio-gold-500 text-white gap-1">
              <HiStar className="w-3 h-3" /> Featured
            </span>
          </div>
        )}
        {!isLoggedIn && (
          <div className="absolute top-3 right-3">
            <span className="badge bg-nio-green-900/80 text-white backdrop-blur-sm gap-1">
              <HiLockClosed className="w-3 h-3" /> Price Hidden
            </span>
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="badge bg-nio-green-50 text-nio-green-700 text-xs mb-1">{product.category}</span>
            <Link to={`/products/${product.slug}`} className="block font-serif font-bold text-nio-green-900 text-base hover:text-nio-green-700 transition-colors line-clamp-1">
              {product.name}
            </Link>
          </div>
        </div>

        {product.origin && (
          <p className="text-xs text-gray-400 mb-1.5">📍 {product.origin}</p>
        )}

        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
          {product.shortDescription || product.description}
        </p>

        {/* Price / CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {isLoggedIn && lowestVariant ? (
            <div>
              <p className="text-xs text-gray-400">Starting from</p>
              <p className="text-nio-green-800 font-bold text-lg">₹{lowestVariant.price.toLocaleString('en-IN')}</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Sign in to view price</p>
              <Link to="/login" className="text-nio-gold-600 text-xs font-medium hover:text-nio-gold-700">
                Sign In →
              </Link>
            </div>
          )}
          <Link
            to={`/products/${product.slug}`}
            className="text-xs font-medium px-4 py-2 rounded-full bg-nio-green-800 text-white hover:bg-nio-green-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
