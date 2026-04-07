import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiUser, HiLogout } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useSiteContent } from '../../hooks/useSiteContent';

const BASE_NAV_LINKS = [
  { to: '/',          label: 'Home' },
  { to: '/about',     label: 'About' },
  { to: '/products',  label: 'Products' },
  { to: '/rebranding',label: 'Rebranding', key: 'rebranding' },
  { to: '/contact',   label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen]       = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const { user, logout, isLoggedIn } = useAuth();
  const location = useLocation();
  const { data: rebrandingContent } = useSiteContent('rebranding', { showInNav: true });

  const navLinks = BASE_NAV_LINKS.filter(
    (l) => l.key !== 'rebranding' || rebrandingContent.showInNav !== false
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location]);

  const isHomePage = location.pathname === '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHomePage
          ? 'bg-white/95 backdrop-blur-md shadow-nio border-b border-nio-green-100'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-custom flex items-center justify-between h-18 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            className="relative"
            whileHover={{ rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="w-20 h-20 rounded-full overflow-hidden border-[3px] border-nio-gold-400 shadow-nio">
              <img
                src="/nio-tea-logo.jpg"
                alt="Nio Tea"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('bg-nio-green-800', 'flex', 'items-center', 'justify-center');
                }}
              />
            </div>
          </motion.div>
          <div>
            <span
              className={`font-display font-semibold text-xl tracking-wide transition-colors duration-300 ${
                scrolled || !isHomePage ? 'text-nio-green-900' : 'text-white'
              }`}
            >
              Nio Tea
            </span>
            <p
              className={`text-xs font-sans tracking-widest uppercase transition-colors duration-300 ${
                scrolled || !isHomePage ? 'text-nio-gold-600' : 'text-nio-gold-300'
              }`}
            >
              Premium Teas
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-nio-green-800 text-white shadow-sm'
                    : scrolled || !isHomePage
                    ? 'text-nio-green-800 hover:bg-nio-green-50'
                    : 'text-white hover:bg-white/20'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-nio-green-100 flex items-center justify-center">
                  <HiUser className="w-4 h-4 text-nio-green-800" />
                </div>
                <span className={`text-sm font-medium ${scrolled || !isHomePage ? 'text-nio-green-800' : 'text-white'}`}>
                  {user?.name?.split(' ')[0]}
                </span>
              </div>
              <button
                onClick={logout}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  scrolled || !isHomePage
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-red-300 hover:bg-white/10'
                }`}
              >
                <HiLogout className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary text-sm py-2 px-6">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`md:hidden p-2 rounded-xl transition-colors ${
            scrolled || !isHomePage ? 'text-nio-green-800' : 'text-white'
          }`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-nio-green-100 px-4 pb-4 pt-2"
          >
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-sm font-medium mb-1 transition-colors ${
                    isActive ? 'bg-nio-green-800 text-white' : 'text-nio-green-800 hover:bg-nio-green-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <div className="mt-3 pt-3 border-t border-nio-green-100">
              {isLoggedIn ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-nio-green-800 font-medium">{user?.name}</span>
                  <button onClick={logout} className="text-red-500 text-sm font-medium hover:text-red-600">Logout</button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary w-full text-sm py-3">
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
