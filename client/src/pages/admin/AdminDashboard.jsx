import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiUsers, HiShoppingBag, HiStar, HiTrendingUp, HiPhone, HiChatAlt2 } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { adminAPI } from '../../api/axios';

const COLORS = ['#1B3A18', '#2d5520', '#4a8f34', '#D4A017', '#b87e10', '#7d4c14', '#386e27', '#6aad52'];

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <motion.div className="bg-white rounded-2xl p-6 shadow-nio" whileHover={{ y: -3 }}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-xs font-medium mb-1">{label}</p>
        <p className="text-3xl font-serif font-bold text-nio-green-900">{value}</p>
        {sub && <p className="text-xs text-nio-green-600 mt-1">{sub}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    adminAPI.get('/admin/analytics')
      .then((res) => setAnalytics(res.data.analytics))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64"><div className="loader" /></div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif font-bold text-nio-green-900 mb-1">Dashboard</h2>
        <p className="text-gray-400 text-sm">Welcome back! Here's what's happening with Nio Tea.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <StatCard icon={HiUsers}    label="Total Users"    value={analytics?.totalUsers || 0}        sub={`+${analytics?.newUsersLastMonth || 0} this month`} color="bg-nio-green-800" />
        <StatCard icon={HiShoppingBag} label="Products"   value={analytics?.totalProducts || 0}     sub="Active in catalog"  color="bg-nio-gold-600" />
        <StatCard icon={HiStar}     label="Featured"       value={analytics?.featuredProducts || 0}  sub="Featured products"  color="bg-amber-700" />
        <StatCard icon={HiTrendingUp} label="New (30d)"   value={analytics?.newUsersLastMonth || 0} sub="New signups"         color="bg-nio-green-600" />
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-nio cursor-pointer hover:ring-2 hover:ring-nio-gold-400 transition-all"
          whileHover={{ y: -3 }}
          onClick={() => navigate('/admin/enquiries?type=callback')}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-xs font-medium mb-1">Pending Callbacks</p>
              <p className="text-3xl font-serif font-bold text-nio-green-900">{analytics?.pendingCallbacks || 0}</p>
              <p className="text-xs text-nio-gold-600 mt-1">Awaiting contact</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-nio-gold-500 flex items-center justify-center">
              <HiPhone className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-nio cursor-pointer hover:ring-2 hover:ring-nio-green-400 transition-all"
          whileHover={{ y: -3 }}
          onClick={() => navigate('/admin/enquiries?type=enquiry')}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-xs font-medium mb-1">Pending Enquiries</p>
              <p className="text-3xl font-serif font-bold text-nio-green-900">{analytics?.pendingEnquiries || 0}</p>
              <p className="text-xs text-nio-green-600 mt-1">Awaiting reply</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-nio-green-600 flex items-center justify-center">
              <HiChatAlt2 className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-nio">
          <h3 className="font-serif font-bold text-nio-green-900 mb-5">User Signups (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={analytics?.usersByDay || []}>
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={(v) => v?.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [v, 'Sign-ups']} labelFormatter={(l) => `Date: ${l}`} />
              <Bar dataKey="count" fill="#1B3A18" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Products by Category */}
        <div className="bg-white rounded-2xl p-6 shadow-nio">
          <h3 className="font-serif font-bold text-nio-green-900 mb-5">Products by Category</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={analytics?.productsByCategory || []}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ _id, percent }) => `${_id} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {(analytics?.productsByCategory || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-2xl p-6 shadow-nio">
        <h3 className="font-serif font-bold text-nio-green-900 mb-5">Recently Registered Users</h3>
        {analytics?.recentUsers?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 text-gray-400 font-medium text-xs">Name</th>
                  <th className="text-left pb-3 text-gray-400 font-medium text-xs">Phone</th>
                  <th className="text-left pb-3 text-gray-400 font-medium text-xs">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {analytics.recentUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-nio-cream/50 transition-colors">
                    <td className="py-3 font-medium text-nio-green-900">{u.name}</td>
                    <td className="py-3 text-gray-500">+91 {u.phone}</td>
                    <td className="py-3 text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">No users yet.</p>
        )}
      </div>
    </div>
  );
}
