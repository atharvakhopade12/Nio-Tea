import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiViewGrid, HiShoppingBag, HiUsers, HiPencil, HiLogout, HiMenu, HiChevronRight, HiChatAlt2, HiShieldCheck, HiTag } from 'react-icons/hi';
import { useAdmin } from '../../context/AdminContext';
import { adminAPI } from '../../api/axios';

const BASE_LINKS = [
  { to: '/admin/dashboard',   icon: HiViewGrid,    label: 'Dashboard' },
  { to: '/admin/products',    icon: HiShoppingBag, label: 'Products' },
  { to: '/admin/categories',  icon: HiTag,         label: 'Categories' },
  { to: '/admin/users',       icon: HiUsers,       label: 'Users' },
  { to: '/admin/enquiries',   icon: HiChatAlt2,    label: 'Enquiries' },
  { to: '/admin/content',     icon: HiPencil,      label: 'Site Content' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();

  const isSuperAdmin = admin?.role === 'superadmin';

  const sidebarLinks = isSuperAdmin
    ? [...BASE_LINKS, { to: '/admin/admins', icon: HiShieldCheck, label: 'Admin Accounts' }]
    : BASE_LINKS;

  useEffect(() => {
    adminAPI.get('/admin/enquiries/counts')
      .then((res) => setPendingCount((res.data.pendingCallbacks || 0) + (res.data.pendingEnquiries || 0)))
      .catch(() => {});
    const iv = setInterval(() => {
      adminAPI.get('/admin/enquiries/counts')
        .then((res) => setPendingCount((res.data.pendingCallbacks || 0) + (res.data.pendingEnquiries || 0)))
        .catch(() => {});
    }, 60000);
    return () => clearInterval(iv);
  }, []);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-nio-green-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-nio-gold-500 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-5 h-5 fill-white">
              <path d="M20 4C12 4 6 12 6 20c0 4 2 8 5 10.5C13 32 16 33 20 33s7-1 9-2.5C32 28 34 24 34 20c0-8-6-16-14-16zm0 2c3 0 6 1.5 8.5 4-3 .5-6 2-8.5 4.5C17.5 12 14.5 10.5 11.5 10c2.5-2.5 5.5-4 8.5-4zm0 27c-3.5 0-6.5-1-8.5-3 1-3 3-6 6-8 1-1 2-1.7 2.5-2.5.5.8 1.5 1.5 2.5 2.5 3 2 5 5 6 8-2 2-5 3-8.5 3z" />
            </svg>
          </div>
          <div>
            <p className="font-display font-semibold text-white text-sm">Nio Tea</p>
            <p className="text-xs text-nio-gold-400 tracking-wide">Admin Panel</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {sidebarLinks.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `admin-sidebar-link ${isActive ? 'bg-nio-green-700 text-white' : 'text-nio-green-200 hover:bg-nio-green-800 hover:text-white'}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
            {label === 'Enquiries' && pendingCount > 0
              ? <span className="ml-auto bg-nio-gold-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{pendingCount}</span>
              : <HiChevronRight className="w-4 h-4 ml-auto opacity-50" />
            }
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-nio-green-800">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${isSuperAdmin ? 'bg-amber-500' : 'bg-nio-green-700'} text-white`}>
            {admin?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-medium truncate">{admin?.name || 'Admin'}</p>
            {isSuperAdmin
              ? <span className="text-xs text-amber-400 font-semibold">Superadmin</span>
              : <span className="text-nio-green-400 text-xs">Admin</span>
            }
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 text-sm transition-colors">
          <HiLogout className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden lg:flex w-60 flex-col fixed inset-y-0 bg-nio-green-950 z-30">
        <SidebarContent />
      </aside>
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25 }} className="lg:hidden fixed inset-y-0 left-0 w-60 bg-nio-green-950 z-50">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="flex-1 lg:pl-60">
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <HiMenu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-serif font-bold text-nio-green-900">Admin Panel</h1>
          <div className="ml-auto flex items-center gap-3">
            {isSuperAdmin && (
              <span className="hidden sm:flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-semibold">
                <HiShieldCheck className="w-3.5 h-3.5" /> Superadmin
              </span>
            )}
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="text-sm text-nio-green-700 hover:text-nio-green-900 font-medium px-3 py-1.5 rounded-lg hover:bg-nio-green-50 transition-colors">
              View Site
            </a>
          </div>
        </div>
        <main className="p-4 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
