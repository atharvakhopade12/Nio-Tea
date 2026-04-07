const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Product = require('../models/Product');
const Enquiry = require('../models/Enquiry');
const XLSX = require('xlsx');

const signAdminToken = (id) =>
  jwt.sign({ id }, process.env.ADMIN_JWT_SECRET, { expiresIn: process.env.ADMIN_JWT_EXPIRE });

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const admin = await Admin.findOneWithPassword({ email });
  if (!admin || !(await Admin.matchPassword(password, admin.password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  await Admin.updateLastLogin(admin._id);

  const token = signAdminToken(admin._id);
  res.status(200).json({
    success: true,
    token,
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  });
};

// @desc    Get admin profile
// @route   GET /api/admin/me
// @access  Admin
const getAdminProfile = async (req, res) => {
  res.status(200).json({ success: true, admin: req.admin });
};

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Admin
const getAnalytics = async (req, res) => {
    const sevenDaysAgo  = new Date(Date.now() - 7  * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalProducts,
    featuredProducts,
    recentUsers,
    pendingCallbacks,
    pendingEnquiries,
    newUsersLastMonth,
    usersByDay,
    productsByCategory,
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isFeatured: true }),
    User.findRecent(5),
    Enquiry.countDocuments({ type: 'callback', status: 'pending' }),
    Enquiry.countDocuments({ type: 'enquiry',  status: 'pending' }),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    User.aggregateByDay(sevenDaysAgo),
    Product.groupByCategory(),
  ]);

  res.status(200).json({
    success: true,
    analytics: {
      totalUsers,
      totalProducts,
      featuredProducts,
      newUsersLastMonth,
      recentUsers,
      usersByDay,
      productsByCategory,
      pendingCallbacks,
      pendingEnquiries,
    },
  });
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Admin
const getUsers = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const { users, total } = await User.paginate({
    search,
    page:  parseInt(page),
    limit: parseInt(limit),
  });
  res.status(200).json({ success: true, total, users });
};

// @desc    Update user (admin)
// @route   PUT /api/admin/users/:id
// @access  Admin
const updateUser = async (req, res) => {
  const { name, isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, {
    ...(name     !== undefined && { name }),
    ...(isActive !== undefined && { isActive }),
  });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  res.status(200).json({ success: true, user });
};

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  res.status(200).json({ success: true, message: 'User deleted.' });
};

// @desc    Export users to Excel/CSV
// @route   GET /api/admin/users/export
// @access  Admin
const exportUsers = async (req, res) => {
  const users = await User.findAll();

  const data = users.map((u, i) => ({
    'S.No': i + 1,
    Name: u.name,
    'Phone Number': u.phone,
    Verified: u.isVerified ? 'Yes' : 'No',
    Status: u.isActive ? 'Active' : 'Inactive',
    'Registered On': new Date(u.createdAt).toLocaleString('en-IN'),
    'Last Login': u.lastLogin ? new Date(u.lastLogin).toLocaleString('en-IN') : 'N/A',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Auto column widths
  const colWidths = Object.keys(data[0] || {}).map((key) => ({ wch: Math.max(key.length, 15) }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Users');

  const format = req.query.format === 'csv' ? 'csv' : 'xlsx';
  const buffer =
    format === 'csv'
      ? Buffer.from(XLSX.utils.sheet_to_csv(ws))
      : XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', `attachment; filename=nio-tea-users.${format}`);
  res.setHeader(
    'Content-Type',
    format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.send(buffer);
};

// ─── Admin Account Management (superadmin only) ──────────────────────────────

// @desc    Get all admin accounts
// @route   GET /api/admin/admins
// @access  Superadmin
const getAdmins = async (req, res) => {
  const admins = await Admin.findAll();
  res.status(200).json({ success: true, admins });
};

// @desc    Create a new admin account
// @route   POST /api/admin/admins
// @access  Superadmin
const createAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }
  const exists = await Admin.findOne({ email });
  if (exists) {
    return res.status(409).json({ success: false, message: 'An admin with this email already exists.' });
  }
  const admin = await Admin.create({
    name,
    email,
    password,
    role: role === 'superadmin' ? 'superadmin' : 'admin',
  });
  res.status(201).json({
    success: true,
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role, isActive: admin.isActive, createdAt: admin.createdAt },
  });
};

// @desc    Update an admin account
// @route   PUT /api/admin/admins/:id
// @access  Superadmin
const updateAdmin = async (req, res) => {
  const { name, role, isActive, password } = req.body;

  // Prevent superadmin from deactivating own account
  if (req.params.id === req.admin._id.toString() && isActive === false) {
    return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
  }

  const admin = await Admin.findById(req.params.id);
  if (!admin) return res.status(404).json({ success: false, message: 'Admin not found.' });

  const fields = {};
  if (name)               fields.name     = name;
  if (role)               fields.role     = role === 'superadmin' ? 'superadmin' : 'admin';
  if (isActive !== undefined) fields.isActive = isActive;

  const updated = await Admin.updateById(req.params.id, fields, {
    newPassword: password && password.length >= 6 ? password : undefined,
  });

  res.status(200).json({
    success: true,
    admin: { id: updated._id, name: updated.name, email: updated.email, role: updated.role, isActive: updated.isActive },
  });
};

// @desc    Delete an admin account
// @route   DELETE /api/admin/admins/:id
// @access  Superadmin
const deleteAdmin = async (req, res) => {
  if (req.params.id === req.admin._id.toString()) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
  }
  const admin = await Admin.findByIdAndDelete(req.params.id);
  if (!admin) return res.status(404).json({ success: false, message: 'Admin not found.' });
  res.status(200).json({ success: true, message: 'Admin account deleted.' });
};

module.exports = {
  adminLogin, getAdminProfile, getAnalytics,
  getUsers, updateUser, deleteUser, exportUsers,
  getAdmins, createAdmin, updateAdmin, deleteAdmin,
};
