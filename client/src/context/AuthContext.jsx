import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nio_token');
    const stored = localStorage.getItem('nio_user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('nio_user');
      }
    }
    setLoading(false);
  }, []);

  const sendOTP = async (phone, name) => {
    const res = await API.post('/auth/send-otp', { phone, name });
    return res.data;
  };

  const verifyOTP = async (phone, otp, name) => {
    const res = await API.post('/auth/verify-otp', { phone, otp, name });
    const { token, user: userData } = res.data;
    localStorage.setItem('nio_token', token);
    localStorage.setItem('nio_user', JSON.stringify(userData));
    setUser(userData);
    toast.success(res.data.message);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('nio_token');
    localStorage.removeItem('nio_user');
    setUser(null);
    toast.success('Logged out successfully.');
  };

  return (
    <AuthContext.Provider value={{ user, loading, sendOTP, verifyOTP, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
