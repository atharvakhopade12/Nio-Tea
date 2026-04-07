import { createContext, useContext, useState, useEffect } from 'react';
import { adminAPI } from '../api/axios';
import toast from 'react-hot-toast';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nio_admin_token');
    const stored = localStorage.getItem('nio_admin');
    if (token && stored) {
      try { setAdmin(JSON.parse(stored)); } catch { localStorage.removeItem('nio_admin'); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await adminAPI.post('/admin/login', { email, password });
    const { token, admin: adminData } = res.data;
    localStorage.setItem('nio_admin_token', token);
    localStorage.setItem('nio_admin', JSON.stringify(adminData));
    setAdmin(adminData);
    toast.success('Welcome back, Admin!');
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('nio_admin_token');
    localStorage.removeItem('nio_admin');
    setAdmin(null);
    toast.success('Admin logged out.');
  };

  return (
    <AdminContext.Provider value={{ admin, loading, login, logout, isAdmin: !!admin }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
};
