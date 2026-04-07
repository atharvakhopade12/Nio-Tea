const express = require('express');
const { adminProtect, requireSuperAdmin } = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const {
  adminLogin,
  getAdminProfile,
  getAnalytics,
  getUsers,
  updateUser,
  deleteUser,
  exportUsers,
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} = require('../controllers/adminController');
const {
  adminGetProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
} = require('../controllers/productController');
const {
  adminGetEnquiries,
  adminUpdateEnquiry,
  adminEnquiryCounts,
} = require('../controllers/enquiryController');
const {
  updateSection,
  uploadContentImage,
  getAllContent,
} = require('../controllers/contentController');
const {
  adminGetCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const router = express.Router();

// Auth
router.post('/login', adminLogin);
router.get('/me', adminProtect, getAdminProfile);

// Analytics
router.get('/analytics', adminProtect, getAnalytics);

// Users
router.get('/users', adminProtect, getUsers);
router.get('/users/export', adminProtect, exportUsers);
router.put('/users/:id', adminProtect, updateUser);
router.delete('/users/:id', adminProtect, deleteUser);

// Admin Account Management (superadmin only)
router.get('/admins', adminProtect, requireSuperAdmin, getAdmins);
router.post('/admins', adminProtect, requireSuperAdmin, createAdmin);
router.put('/admins/:id', adminProtect, requireSuperAdmin, updateAdmin);
router.delete('/admins/:id', adminProtect, requireSuperAdmin, deleteAdmin);

// Products
router.get('/products', adminProtect, adminGetProducts);
router.post('/products', adminProtect, createProduct);
router.put('/products/:id', adminProtect, updateProduct);
router.delete('/products/:id', adminProtect, deleteProduct);

// Image upload
router.post('/products/upload-image', adminProtect, upload.single('image'), uploadProductImage);
router.delete('/products/image/:publicId', adminProtect, deleteProductImage);

// Enquiries & Callbacks
router.get('/enquiries/counts', adminProtect, adminEnquiryCounts);
router.get('/enquiries', adminProtect, adminGetEnquiries);
router.put('/enquiries/:id', adminProtect, adminUpdateEnquiry);

// Categories
router.get('/categories',        adminProtect, adminGetCategories);
router.post('/categories',        adminProtect, createCategory);
router.put('/categories/:id',     adminProtect, updateCategory);
router.delete('/categories/:id',  adminProtect, deleteCategory);

// Site Content
router.get('/content', adminProtect, getAllContent);
router.put('/content/:section', adminProtect, updateSection);
router.post('/content/upload-image', adminProtect, upload.single('image'), uploadContentImage);

module.exports = router;
