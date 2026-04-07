import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiFilter, HiX, HiChevronDown } from 'react-icons/hi';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ui/ProductCard';
import { Link } from 'react-router-dom';

const CATEGORIES = ['All', 'Black Tea', 'Green Tea', 'White Tea', 'Oolong Tea', 'Herbal Tea', 'Masala Tea', 'Flavored Tea', 'Specialty Tea'];

export default function Products() {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [pages, setPages]           = useState(1);
  const [filters, setFilters]       = useState({ categories: [], leafGrades: [], origins: [] });
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn } = useAuth();

  const currentCategory = searchParams.get('category') || '';
  const currentLeaf     = searchParams.get('leafGrade') || '';
  const currentSearch   = searchParams.get('search') || '';
  const currentPage     = parseInt(searchParams.get('page') || '1');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 12 });
      if (currentCategory) params.set('category', currentCategory);
      if (currentLeaf) params.set('leafGrade', currentLeaf);
      if (currentSearch) params.set('search', currentSearch);

      const res = await API.get(`/products?${params}`);
      setProducts(res.data.products);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentCategory, currentLeaf, currentSearch, currentPage, isLoggedIn]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    API.get('/products/filters').then((res) => setFilters(res.data)).catch(() => {});
  }, []);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  const hasFilters = currentCategory || currentLeaf || currentSearch;

  return (
    <div className="pt-20">
      {/* Hero Header */}
      <section
        className="py-20 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B3A18, #2d5520)' }}
      >
        <div className="container-custom relative z-10">
          <p className="text-nio-gold-400 text-xs tracking-[0.3em] uppercase mb-3" data-aos="fade-up">Our Collection</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3" data-aos="fade-up" data-aos-delay="100">
            Product Catalog
          </h1>
          <div className="gold-divider" />
          <p className="text-nio-green-200 mt-4 max-w-xl mx-auto text-sm" data-aos="fade-up" data-aos-delay="200">
            {total > 0 ? `${total} premium teas` : 'Premium teas'} from the finest Indian gardens.
            {!isLoggedIn && ' Sign in to unlock prices.'}
          </p>
        </div>
        <svg className="absolute bottom-0 left-0 right-0 fill-gray-50" viewBox="0 0 1440 40">
          <path d="M0,20 C480,40 960,0 1440,20 L1440,40 L0,40 Z" />
        </svg>
      </section>

      <div className="bg-gray-50 min-h-screen">
        <div className="container-custom py-8">
          {/* Search + Filter Bar */}
          <div className="bg-white rounded-2xl shadow-nio p-4 mb-6 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search teas..."
                value={currentSearch}
                onChange={(e) => updateParam('search', e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={currentCategory}
                onChange={(e) => updateParam('category', e.target.value)}
                className="input-field pr-9 appearance-none cursor-pointer min-w-[160px]"
              >
                <option value="">All Categories</option>
                {CATEGORIES.slice(1).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            {/* Leaf Grade */}
            {filters.leafGrades?.length > 0 && (
              <div className="relative">
                <select
                  value={currentLeaf}
                  onChange={(e) => updateParam('leafGrade', e.target.value)}
                  className="input-field pr-9 appearance-none cursor-pointer min-w-[140px]"
                >
                  <option value="">All Grades</option>
                  {filters.leafGrades.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            )}

            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 text-sm font-medium transition-colors">
                <HiX className="w-4 h-4" /> Clear
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => updateParam('category', cat === 'All' ? '' : cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                  (cat === 'All' && !currentCategory) || currentCategory === cat
                    ? 'bg-nio-green-800 text-white shadow-sm'
                    : 'bg-white text-nio-green-700 hover:bg-nio-green-50 border border-nio-green-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price unlock notice */}
          {!isLoggedIn && (
            <div className="bg-nio-green-900 text-white rounded-xl px-5 py-3.5 mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔒</span>
                <p className="text-sm">
                  <span className="font-semibold">Prices are hidden.</span>
                  <span className="text-nio-green-300 ml-1">Sign in to reveal all product prices.</span>
                </p>
              </div>
              <Link to="/login" className="shrink-0 text-xs font-medium px-4 py-1.5 rounded-full bg-nio-gold-500 text-white hover:bg-nio-gold-600 transition-colors">
                Sign In
              </Link>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🍃</div>
              <h3 className="font-serif font-bold text-nio-green-900 text-xl mb-2">No teas found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters.</p>
              <button onClick={clearFilters} className="btn-primary text-sm">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <AnimatePresence>
                  {products.map((product, i) => (
                    <ProductCard key={product._id} product={product} index={i} />
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {[...Array(pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateParam('page', String(i + 1))}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                        currentPage === i + 1
                          ? 'bg-nio-green-800 text-white'
                          : 'bg-white text-nio-green-700 hover:bg-nio-green-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
