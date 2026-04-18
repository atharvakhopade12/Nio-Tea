const Product = require('../models/Product');
const supabase = require('../config/supabase');
const sharp = require('sharp');
const path = require('path');

const PRODUCTS_BUCKET = process.env.SUPABASE_PRODUCTS_BUCKET || 'products';

const uploadToSupabaseStorage = async (buffer, objectPath, contentType = 'image/webp') => {
  const { error } = await supabase.storage
    .from(PRODUCTS_BUCKET)
    .upload(objectPath, buffer, {
      contentType,
      upsert: false,
    });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(objectPath);
  return {
    secure_url: data.publicUrl,
    public_id: `supabase/${PRODUCTS_BUCKET}/${objectPath}`,
  };
};

const deleteFromSupabaseStorage = async (bucket, objectPath) => {
  const { error } = await supabase.storage.from(bucket).remove([objectPath]);
  if (error) throw new Error(error.message);
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

  // Delete images from Supabase Storage
  for (const img of product.images) {
    if (!img.publicId) continue;
    if (!img.publicId.startsWith('supabase/')) continue;

    const [, bucket, ...pathParts] = img.publicId.split('/');
    const objectPath = pathParts.join('/');
    await deleteFromSupabaseStorage(bucket, objectPath).catch(() => {});
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
    let uploadBuffer = req.file.buffer;
    let outputExt = path.extname(req.file.originalname || '').toLowerCase() || '.img';
    let contentType = req.file.mimetype || 'application/octet-stream';

    try {
      // Keep the whole image visible: fit inside 1200x1200 without cropping.
      // Transparent padding is used where needed so landscape/portrait images remain intact.
      uploadBuffer = await sharp(req.file.buffer)
        .resize({ width: 1200, height: 1200, fit: 'contain', withoutEnlargement: true, background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .webp({ quality: 90 })
        .toBuffer();
      outputExt = '.webp';
      contentType = 'image/webp';
    } catch {
      // Fallback: if Sharp cannot decode a specific device format, upload the original file bytes.
    }

    const objectPath = `products/${Date.now()}_${Math.random().toString(36).slice(2, 8)}${outputExt}`;
    const result = await uploadToSupabaseStorage(uploadBuffer, objectPath, contentType);

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

  if (decoded.startsWith('supabase/')) {
    const [, bucket, ...pathParts] = decoded.split('/');
    const objectPath = pathParts.join('/');
    await deleteFromSupabaseStorage(bucket, objectPath);
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
