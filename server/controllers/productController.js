const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isCloudinaryConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME: n, CLOUDINARY_API_KEY: k, CLOUDINARY_API_SECRET: s } = process.env;
  return !!(n && k && s && !n.startsWith('your') && !k.startsWith('your') && !s.startsWith('your'));
};

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = async (buffer, folder = 'nio-tea/products') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// Helper to save buffer to local disk (fallback)
const saveLocally = async (buffer) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const filename = `product_${Date.now()}.webp`;
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, buffer);
  return { secure_url: `/uploads/${filename}`, public_id: `local/${filename}`, width: 800, height: 800 };
};

// @desc    Get all products (public — prices hidden for guests)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const { category, leafGrade, search, featured, page = 1, limit = 12 } = req.query;

  const { products, total } = await Product.findPublic({
    category,
    leafGrade,
    search,
    isFeatured: featured === 'true',
    page:  parseInt(page),
    limit: parseInt(limit),
  });

  // Hide prices for unauthenticated users
  const isLoggedIn = !!req.user;
  const result = isLoggedIn
    ? products
    : products.map((p) => ({ ...p, variants: p.variants.map((v) => ({ ...v, price: undefined })) }));

  res.status(200).json({
    success: true,
    count: result.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    products: result,
  });
};

// @desc    Get single product
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
  const product = await Product.findBySlug(req.params.slug);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  const isLoggedIn = !!req.user;
  if (!isLoggedIn) {
    product.variants = product.variants.map((v) => ({ ...v, price: undefined }));
  }

  res.status(200).json({ success: true, product });
};

// @desc    Get product categories and filters
// @route   GET /api/products/filters
// @access  Public
const getFilters = async (req, res) => {
  const [categories, leafGrades, origins] = await Promise.all([
    Product.distinct('category', { isActive: true }),
    Product.distinct('leafGrade', { isActive: true }),
    Product.distinct('origin', { isActive: true }),
  ]);
  res.status(200).json({ success: true, categories, leafGrades, origins });
};

// ─── Admin Product CRUD ──────────────────────────────────────────────────────

// @desc    Get all products (admin — with prices)
// @route   GET /api/admin/products
// @access  Admin
const adminGetProducts = async (req, res) => {
  const { page = 1, limit = 20, search, category } = req.query;
  const { products, total } = await Product.findAdmin({
    category,
    search,
    page:  parseInt(page),
    limit: parseInt(limit),
  });
  res.status(200).json({ success: true, total, products });
};

// @desc    Create product
// @route   POST /api/admin/products
// @access  Admin
const createProduct = async (req, res) => {
  const data = { ...req.body };
  if (data.variants && typeof data.variants === 'string') {
    data.variants = JSON.parse(data.variants);
  }
  if (data.ingredients && typeof data.ingredients === 'string') {
    data.ingredients = JSON.parse(data.ingredients);
  }
  if (data.tags && typeof data.tags === 'string') {
    data.tags = JSON.parse(data.tags);
  }

  const product = await Product.create(data);
  res.status(201).json({ success: true, product });
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Admin
const updateProduct = async (req, res) => {
  const data = { ...req.body };
  if (data.variants    && typeof data.variants    === 'string') data.variants    = JSON.parse(data.variants);
  if (data.ingredients && typeof data.ingredients === 'string') data.ingredients = JSON.parse(data.ingredients);
  if (data.tags        && typeof data.tags        === 'string') data.tags        = JSON.parse(data.tags);

  const product = await Product.findByIdAndUpdate(req.params.id, data);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
  res.status(200).json({ success: true, product });
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Admin
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  // Delete images from Cloudinary
  for (const img of product.images) {
    if (img.publicId) {
      await cloudinary.uploader.destroy(img.publicId).catch(() => {});
    }
  }

  await Product.deleteById(req.params.id);
  res.status(200).json({ success: true, message: 'Product deleted successfully.' });
};

// @desc    Upload product image (with sharp processing)
// @route   POST /api/admin/products/upload-image
// @access  Admin
const uploadProductImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided.' });
  }

  try {
    // Process with Sharp (resize to 800x800, convert to WebP)
    const processed = await sharp(req.file.buffer)
      .resize({ width: 800, height: 800, fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toBuffer();

    const result = isCloudinaryConfigured()
      ? await uploadToCloudinary(processed)
      : await saveLocally(processed);

    res.status(200).json({
      success: true,
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Image upload failed.', error: error.message });
  }
};

// @desc    Delete product image
// @route   DELETE /api/admin/products/image/:publicId
// @access  Admin
const deleteProductImage = async (req, res) => {
  const { publicId } = req.params;
  const decoded = decodeURIComponent(publicId);

  if (decoded.startsWith('local/')) {
    // Remove from local disk
    const filename = decoded.replace('local/', '');
    const filepath = path.join(__dirname, '..', 'uploads', filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } else if (isCloudinaryConfigured()) {
    await cloudinary.uploader.destroy(decoded);
  }

  res.status(200).json({ success: true, message: 'Image deleted.' });
};

module.exports = {
  getProducts,
  getProductBySlug,
  getFilters,
  adminGetProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
};
